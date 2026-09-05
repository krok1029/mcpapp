import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.get('http://mcpapp.test/bootstrap', () =>
    HttpResponse.json({ ready: true }),
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('MSW bootstrap', () => {
  it('intercepts an external HTTP boundary', async () => {
    const response = await fetch('http://mcpapp.test/bootstrap');

    await expect(response.json()).resolves.toEqual({ ready: true });
  });
});
