import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App.tsx';

describe('McpApp UI bootstrap', () => {
  it('renders an honest placeholder for the future Project Console', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'McpApp' })).toBeVisible();
    expect(screen.getByText(/Runtime Foundation/i)).toBeVisible();
  });
});
