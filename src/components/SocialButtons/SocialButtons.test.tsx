// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import SocialButtons from './SocialButtons';

describe('SocialButtons', () => {
  afterEach(cleanup);

  it.each(['Google', 'Facebook', 'GitHub', 'LinkedIn'])('shows a disabled %s button marked as coming soon', (name) => {
    render(<SocialButtons dividerText="o entra con tu email" />);

    const button = screen.getByRole('button', { name: `${name}, próximamente` }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('shows the divider text', () => {
    render(<SocialButtons dividerText="o regístrate con tu email" />);

    expect(screen.getByText('o regístrate con tu email')).toBeTruthy();
  });
});
