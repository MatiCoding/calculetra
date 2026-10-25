// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FormEvent } from 'react';
import PasswordInput from './PasswordInput';

function renderInput() {
  render(
    <>
      <label htmlFor="password">Contraseña</label>
      <PasswordInput id="password" defaultValue="secreta" />
    </>,
  );
  return screen.getByLabelText('Contraseña') as HTMLInputElement;
}

describe('PasswordInput', () => {
  afterEach(cleanup);

  it('hides the password at first', () => {
    const input = renderInput();

    expect(input.type).toBe('password');
    expect(screen.getByRole('button', { name: 'Mostrar contraseña' })).toBeTruthy();
  });

  it('shows the password when you press the button', () => {
    const input = renderInput();

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));

    expect(input.type).toBe('text');
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toBeTruthy();
  });

  it('hides it again when you press the button a second time', () => {
    const input = renderInput();

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));

    expect(input.type).toBe('password');
  });

  it('passes its props to the input', () => {
    const input = renderInput();

    expect(input.id).toBe('password');
    expect(input.value).toBe('secreta');
  });

  it('does not submit the form when you press the button', () => {
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <PasswordInput aria-label="Contraseña" />
      </form>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
