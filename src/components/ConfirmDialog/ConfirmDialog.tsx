import { useEffect, useId, useRef } from 'react';
import styles from './ConfirmDialog.module.css';

type Props = {
    open: boolean;
    message: string;
    detail?: string;        // an extra line, for example a warning
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
};

// Asks the player to confirm something before doing it, in a modal dialog.
function ConfirmDialog({ open, message, detail, confirmLabel, onConfirm, onCancel }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const messageId = useId();
    const detailId = useId();

    // Like in NoticeDialog, showModal() can only be called once the <dialog> is on the page.
    useEffect(() => {
        const dialog = dialogRef.current;
        if (dialog === null) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            onClose={onCancel}  // Escape also closes it, and that counts as cancelling
            aria-labelledby={messageId}
            aria-describedby={detail === undefined ? undefined : detailId}
            className={styles.dialog}
        >
            <p id={messageId} className={styles.message}>{message}</p>
            {detail !== undefined && <p id={detailId} className={styles.detail}>{detail}</p>}
            <div className={styles.buttons}>
                <button type="button" onClick={onCancel} className={styles.cancel}>
                    Cancelar
                </button>
                <button type="button" onClick={onConfirm} className={styles.confirm}>
                    {confirmLabel}
                </button>
            </div>
        </dialog>
    );
}

export default ConfirmDialog;