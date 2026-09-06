import { fork, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  managedProjectIdSchema,
  workSessionSummarySchema,
  type ManagedProjectId,
} from '@mcpapp/contracts';
import {
  Client,
  StreamableHTTPClientTransport,
} from '@modelcontextprotocol/client';

import { createManagedProject } from '../src/index.js';

describe('Resume Context across Server process restarts', () => {
  let dataDirectory: string;
  let databasePath: string;
  let children: ChildProcess[];

  beforeEach(async () => {
    children = [];
    dataDirectory = await mkdtemp(join(tmpdir(), 'mcpapp-resume-context-'));
    databasePath = join(dataDirectory, 'mcpapp.sqlite');
  });

  async function stopServer(child: ChildProcess) {
    if (child.exitCode !== null || child.signalCode !== null) return;
    const exit = once(child, 'exit', { signal: AbortSignal.timeout(5_000) });
    child.kill('SIGTERM');
    await exit;
  }

  afterEach(async () => {
    try {
      await Promise.all(children.map(stopServer));
    } finally {
      await rm(dataDirectory, { recursive: true, force: true });
    }
  });

  async function startServer() {
    const child = fork(
      fileURLToPath(new URL('./fixtures/server-process.ts', import.meta.url)),
      [databasePath],
      {
        execArgv: ['--import', 'tsx'],
        stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
      },
    );
    children.push(child);
    const [message] = await once(child, 'message', {
      signal: AbortSignal.timeout(5_000),
    });
    return { child, url: new URL(message.url) };
  }

  async function resume(url: URL, projectId: ManagedProjectId) {
    const client = new Client({
      name: 'resume-context-test',
      version: '0.0.0',
    });
    try {
      await client.connect(new StreamableHTTPClientTransport(url), {
        timeout: 1_000,
      });
      return await client.callTool(
        { name: 'begin_or_resume_work', arguments: { project_id: projectId } },
        { timeout: 1_000 },
      );
    } finally {
      await client.close();
    }
  }

  function preparePersistedState(prepare: (database: DatabaseSync) => void) {
    const database = new DatabaseSync(databasePath);
    try {
      prepare(database);
    } finally {
      database.close();
    }
  }

  it('restores the Open Work Session and its Resume Context in a new Server process', async () => {
    // GIVEN: A Server process has persisted a project and begun work, then stopped.
    const first = await startServer();
    const project = await createManagedProject(first.url);
    const begun = await resume(first.url, project.project_id);
    const workSessionId = workSessionSummarySchema.parse(
      begun.structuredContent,
    ).work_session_id;
    await stopServer(first.child);
    const restarted = await startServer();

    // WHEN: A fresh Client resumes the project through the new Server process.
    const result = await resume(restarted.url, project.project_id);

    // THEN: Durable state, including explicit empty metadata, is returned.
    expect(result.isError).not.toBe(true);
    expect(result.structuredContent).toEqual({
      work_session_id: workSessionId,
      project_id: project.project_id,
      status: 'open',
      resume_context: {
        project_id: project.project_id,
        work_session_id: workSessionId,
        workflow_state: 'draft',
        last_successful_step: 'begin_or_resume_work',
        pending_approval_gates: [],
        evidence_metadata: [],
      },
    });
  });

  it('restores existing approval and Evidence metadata without replacing the last successful step', async () => {
    // GIVEN: A stopped Server has workflow metadata saved in its SQLite file.
    const first = await startServer();
    const project = await createManagedProject(first.url);
    const begun = await resume(first.url, project.project_id);
    const workSession = workSessionSummarySchema.parse(begun.structuredContent);
    await stopServer(first.child);
    const evidence = [
      {
        evidence_id: randomUUID(),
        summary: 'Persisted fixture verification summary',
      },
    ];
    preparePersistedState((database) => {
      database
        .prepare(`UPDATE project_workflow_state
        SET last_successful_step = ?, pending_approval_gates = ?, evidence_metadata = ?
        WHERE project_id = ?`)
        .run(
          'fixture_completed_step',
          '["spec"]',
          JSON.stringify(evidence),
          project.project_id,
        );
    });
    const restarted = await startServer();

    // WHEN: Work resumes in the replacement Server process.
    const result = await resume(restarted.url, project.project_id);

    // THEN: The authoritative metadata survives; resuming is not a new successful step.
    expect(result.isError).not.toBe(true);
    expect(result.structuredContent).toEqual({
      ...workSession,
      resume_context: {
        project_id: project.project_id,
        work_session_id: workSession.work_session_id,
        workflow_state: 'draft',
        last_successful_step: 'fixture_completed_step',
        pending_approval_gates: ['spec'],
        evidence_metadata: evidence,
      },
    });
  });

  it('upgrades a pre-Resume-Context database without inventing historical steps or replacing identities', async () => {
    // GIVEN: A database in the format delivered by Ticket 04 already contains work.
    const projectId = managedProjectIdSchema.parse(randomUUID());
    const workSessionId = randomUUID();
    preparePersistedState((database) => {
      database.exec(`
        CREATE TABLE managed_projects (project_id TEXT PRIMARY KEY NOT NULL, status TEXT NOT NULL);
        CREATE TABLE work_sessions (
          work_session_id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL REFERENCES managed_projects(project_id),
          status TEXT NOT NULL
        );
      `);
      database
        .prepare('INSERT INTO managed_projects VALUES (?, ?)')
        .run(projectId, 'draft');
      database
        .prepare('INSERT INTO work_sessions VALUES (?, ?, ?)')
        .run(workSessionId, projectId, 'open');
    });
    const migrated = await startServer();
    await stopServer(migrated.child);
    const restarted = await startServer();

    // WHEN: A Client resumes the legacy project after migration and another restart.
    const result = await resume(restarted.url, projectId);

    // THEN: Known identity is preserved and unavailable historical progress stays null.
    expect(result.isError).not.toBe(true);
    expect(result.structuredContent).toEqual({
      project_id: projectId,
      work_session_id: workSessionId,
      status: 'open',
      resume_context: {
        project_id: projectId,
        work_session_id: workSessionId,
        workflow_state: 'draft',
        last_successful_step: null,
        pending_approval_gates: [],
        evidence_metadata: [],
      },
    });
  });

  it('reports missing persisted workflow state instead of recreating an apparently healthy context', async () => {
    // GIVEN: A project has an Open Work Session but its durable workflow state is missing.
    const first = await startServer();
    const project = await createManagedProject(first.url);
    await resume(first.url, project.project_id);
    await stopServer(first.child);
    preparePersistedState((database) => {
      database
        .prepare('DELETE FROM project_workflow_state WHERE project_id = ?')
        .run(project.project_id);
    });
    const restarted = await startServer();

    // WHEN: A Client attempts to resume the incomplete project.
    const result = await resume(restarted.url, project.project_id);

    // THEN: The response describes the failure and a safe recovery action.
    expect(result.isError).toBe(true);
    expect(result.content).toEqual([
      {
        type: 'text',
        text: JSON.stringify({
          code: 'PERSISTED_STATE_INVALID',
          message: 'Managed Project has incomplete or invalid persisted state',
          project_id: project.project_id,
          recovery_action:
            'Stop work and inspect or restore the project data from a verified backup before retrying.',
        }),
      },
    ]);
  });

  it('rejects unparseable metadata and preserves the Work Session for recovery', async () => {
    // GIVEN: A persisted approval field can no longer be parsed as JSON.
    const first = await startServer();
    const project = await createManagedProject(first.url);
    const begun = await resume(first.url, project.project_id);
    await stopServer(first.child);
    preparePersistedState((database) => {
      database
        .prepare(
          'UPDATE project_workflow_state SET pending_approval_gates = ? WHERE project_id = ?',
        )
        .run('{broken fixture metadata', project.project_id);
    });
    const restarted = await startServer();

    // WHEN: A Client tries to resume the damaged state.
    const result = await resume(restarted.url, project.project_id);

    // THEN: It gets an actionable error; restoring the data recovers the original session.
    expect(result.isError).toBe(true);
    expect(result.content).toEqual([
      {
        type: 'text',
        text: expect.stringContaining('"code":"PERSISTED_STATE_INVALID"'),
      },
    ]);
    await stopServer(restarted.child);
    preparePersistedState((database) => {
      database
        .prepare(
          'UPDATE project_workflow_state SET pending_approval_gates = ? WHERE project_id = ?',
        )
        .run('[]', project.project_id);
    });
    const repaired = await startServer();
    const recovered = await resume(repaired.url, project.project_id);
    expect(recovered.isError).not.toBe(true);
    expect(recovered.structuredContent).toEqual(begun.structuredContent);
  });

  it('rejects an inconsistent persisted Work Session link', async () => {
    // GIVEN: Durable workflow state no longer points at the project's Open Work Session.
    const first = await startServer();
    const project = await createManagedProject(first.url);
    await resume(first.url, project.project_id);
    await stopServer(first.child);
    preparePersistedState((database) => {
      database
        .prepare(
          'UPDATE project_workflow_state SET work_session_id = NULL WHERE project_id = ?',
        )
        .run(project.project_id);
    });
    const restarted = await startServer();

    // WHEN: The project is resumed with inconsistent persisted identities.
    const result = await resume(restarted.url, project.project_id);

    // THEN: The inconsistent state is not silently replaced with an apparently valid link.
    expect(result.isError).toBe(true);
    expect(result.content).toEqual([
      {
        type: 'text',
        text: expect.stringContaining('"code":"PERSISTED_STATE_INVALID"'),
      },
    ]);
  });

  it('reads the latest persisted metadata on every resume in the same Server process', async () => {
    // GIVEN: A running Server has already returned a Resume Context for this project.
    const server = await startServer();
    const project = await createManagedProject(server.url);
    const begun = await resume(server.url, project.project_id);
    const workSession = workSessionSummarySchema.parse(begun.structuredContent);
    const evidence = [
      { evidence_id: randomUUID(), summary: 'Newly persisted fixture result' },
    ];
    preparePersistedState((database) => {
      database
        .prepare(`UPDATE project_workflow_state
        SET last_successful_step = ?, pending_approval_gates = ?, evidence_metadata = ?
        WHERE project_id = ?`)
        .run(
          'later_fixture_step',
          '["commit"]',
          JSON.stringify(evidence),
          project.project_id,
        );
    });

    // WHEN: A new Client resumes without restarting the Server.
    const result = await resume(server.url, project.project_id);

    // THEN: Previously returned context does not mask the current SQLite state.
    expect(result.isError).not.toBe(true);
    expect(result.structuredContent).toEqual({
      ...workSession,
      resume_context: {
        project_id: project.project_id,
        work_session_id: workSession.work_session_id,
        workflow_state: 'draft',
        last_successful_step: 'later_fixture_step',
        pending_approval_gates: ['commit'],
        evidence_metadata: evidence,
      },
    });
  });

  it('rejects Evidence metadata that parses as JSON but lacks its durable identity', async () => {
    // GIVEN: A saved Evidence summary lacks the required Evidence identity.
    const first = await startServer();
    const project = await createManagedProject(first.url);
    await resume(first.url, project.project_id);
    await stopServer(first.child);
    preparePersistedState((database) => {
      database
        .prepare(
          'UPDATE project_workflow_state SET evidence_metadata = ? WHERE project_id = ?',
        )
        .run(
          '[{"summary":"Fixture missing its Evidence ID"}]',
          project.project_id,
        );
    });
    const restarted = await startServer();

    // WHEN: A Client requests the structurally invalid persisted context.
    const result = await resume(restarted.url, project.project_id);

    // THEN: Parsing JSON alone does not make incomplete Evidence valid.
    expect(result.isError).toBe(true);
    expect(result.content).toEqual([
      {
        type: 'text',
        text: expect.stringContaining('"code":"PERSISTED_STATE_INVALID"'),
      },
    ]);
  });

  // Four real process starts need CI headroom beyond a single operation's deadline.
  it('preserves invalid saved progress until repaired before beginning the first Work Session', async () => {
    // GIVEN: A persisted draft has invalid progress and has never begun a Work Session.
    const first = await startServer();
    const project = await createManagedProject(first.url);
    await stopServer(first.child);
    preparePersistedState((database) => {
      database
        .prepare(
          'UPDATE project_workflow_state SET last_successful_step = ? WHERE project_id = ?',
        )
        .run('', project.project_id);
    });
    const restarted = await startServer();

    // WHEN: A Client begins work for the first time.
    const result = await resume(restarted.url, project.project_id);

    // THEN: Beginning work rejects the invalid progress without erasing the problem.
    expect(result.isError).toBe(true);
    expect(result.content).toEqual([
      {
        type: 'text',
        text: expect.stringContaining('"code":"PERSISTED_STATE_INVALID"'),
      },
    ]);
    await stopServer(restarted.child);
    const retried = await startServer();
    const stillInvalid = await resume(retried.url, project.project_id);
    expect(stillInvalid.isError).toBe(true);
    expect(stillInvalid.content).toEqual(result.content);
    await stopServer(retried.child);

    preparePersistedState((database) => {
      database
        .prepare(
          'UPDATE project_workflow_state SET last_successful_step = ? WHERE project_id = ?',
        )
        .run('create_managed_project', project.project_id);
    });
    const repaired = await startServer();
    const begun = await resume(repaired.url, project.project_id);
    expect(begun.isError).not.toBe(true);
    expect(begun.structuredContent).toMatchObject({
      project_id: project.project_id,
      status: 'open',
      resume_context: {
        project_id: project.project_id,
        last_successful_step: 'begin_or_resume_work',
      },
    });
  }, 15_000);
});
