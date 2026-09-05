import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_LINES = 600;

const CODE_EXTENSIONS = new Set([
  '.astro',
  '.bash',
  '.c',
  '.cc',
  '.cjs',
  '.clj',
  '.cljs',
  '.cpp',
  '.cs',
  '.css',
  '.dart',
  '.ex',
  '.exs',
  '.fs',
  '.fsx',
  '.go',
  '.h',
  '.hpp',
  '.html',
  '.java',
  '.js',
  '.jsx',
  '.kt',
  '.kts',
  '.lua',
  '.mjs',
  '.php',
  '.pl',
  '.pm',
  '.py',
  '.r',
  '.rb',
  '.rs',
  '.sass',
  '.scala',
  '.scss',
  '.sh',
  '.sql',
  '.svelte',
  '.swift',
  '.ts',
  '.tsx',
  '.vue',
  '.zig',
]);

const CODE_FILENAMES = new Set([
  'dockerfile',
  'gemfile',
  'makefile',
  'rakefile',
]);
const TEST_DIRECTORIES = new Set(['__tests__', 'e2e', 'test', 'tests']);

export function countPhysicalLines(content) {
  if (content.length === 0) {
    return 0;
  }

  const lines = content.split(/\r\n|\r|\n/);
  if (lines.at(-1) === '') {
    lines.pop();
  }
  return lines.length;
}

export function isCodeFile(path) {
  const filename = basename(path).toLowerCase();
  return CODE_FILENAMES.has(filename) || CODE_EXTENSIONS.has(extname(filename));
}

export function isTestFile(path) {
  const normalizedPath = path.replaceAll('\\', '/').toLowerCase();
  const segments = normalizedPath.split('/');
  const filename = segments.at(-1) ?? '';

  return (
    segments.slice(0, -1).some((segment) => TEST_DIRECTORIES.has(segment)) ||
    filename.includes('.test.') ||
    filename.includes('.spec.')
  );
}

export function findOversizedFiles(files, maxLines = MAX_LINES) {
  return files
    .filter(({ path }) => isCodeFile(path) && !isTestFile(path))
    .map(({ path, content }) => ({ path, lines: countPhysicalLines(content) }))
    .filter(({ lines }) => lines > maxLines);
}

function trackedAndUnignoredFiles() {
  const output = execFileSync(
    'git',
    ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
    { encoding: 'utf8' },
  );

  return [...new Set(output.split('\0').filter(Boolean))];
}

function main() {
  const files = trackedAndUnignoredFiles()
    .filter((path) => isCodeFile(path) && !isTestFile(path))
    .map((path) => ({ path, content: readFileSync(path, 'utf8') }));
  const violations = findOversizedFiles(files);

  if (violations.length === 0) {
    return;
  }

  console.error(
    `Non-test code files may not exceed ${MAX_LINES} physical lines:`,
  );
  for (const { path, lines } of violations) {
    console.error(`- ${path}: ${lines} lines`);
  }
  console.error('Split each oversized module into smaller, focused modules.');
  process.exitCode = 1;
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (fileURLToPath(import.meta.url) === invokedPath) {
  main();
}
