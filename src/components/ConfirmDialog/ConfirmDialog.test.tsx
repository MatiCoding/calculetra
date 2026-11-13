// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { fakeDialog } from '../../test/fakeDialog';
import ConfirmDialog from './ConfirmDialog';

function renderDialog(props: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const utils = render(
        <ConfirmDialog
            open
            message="¿Usar una pista?"
            confirmLabel="Usar pista"
            onConfirm={onConfirm}
            onCancel={onCancel}
            {...props}
        />,
    );
    return { ...utils, onConfirm, onCancel };
}

describe('ConfirmDialog', () => {
    beforeAll(fakeDialog);

    afterEach(cleanup);

    it('opens a dialog named after the message', () => {
        renderDialog();

        const dialog = screen.getByRole('dialog', { name: '¿Usar una pista?' });
        expect(dialog.hasAttribute('open')).toBe(true);
    });

    it('is closed when open is false', () => {
        renderDialog({ open: false });

        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('shows the detail and uses it as the description', () => {
        renderDialog({ detail: 'Se borrará lo que has escrito.' });

        expect(screen.getByRole('dialog').getAttribute('aria-describedby')).toBe(
            screen.getByText('Se borrará lo que has escrito.').id,
        );
    });

    it('has no description without detail', () => {
        renderDialog();

        expect(screen.getByRole('dialog').hasAttribute('aria-describedby')).toBe(false);
    });

    it('calls onConfirm with the confirm button', () => {
        const { onConfirm, onCancel } = renderDialog();

        fireEvent.click(screen.getByRole('button', { name: 'Usar pista' }));

        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(onCancel).not.toHaveBeenCalled();
    });

    it('calls onCancel with the cancel button', () => {
        const { onCancel } = renderDialog();

        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('closes when open turns false', () => {
        const { rerender, onConfirm, onCancel } = renderDialog();

        rerender(
            <ConfirmDialog open={false} message="¿Usar una pista?" confirmLabel="Usar pista" onConfirm={onConfirm} onCancel={onCancel} />,
        );

        expect(screen.queryByRole('dialog')).toBeNull();
    });
});
