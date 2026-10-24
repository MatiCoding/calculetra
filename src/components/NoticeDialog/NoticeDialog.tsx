import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import styles from './NoticeDialog.module.css';

// Shows, in a dialog, a message that another page left when it navigated here,
// for example navigate('/', { state: { notice: 'Tu cuenta se ha eliminado.' } }).
function NoticeDialog() {
    const { pathname, state } = useLocation();
    const navigate = useNavigate();
    const dialogRef = useRef<HTMLDialogElement>(null);

    // state can be anything (or null), so check that notice is really a string.
    const notice: unknown = state?.notice;
    const hasNotice = typeof notice === 'string';

    // showModal() is what makes it modal: the page behind can not be used,
    // focus goes inside the dialog and Escape closes it. React can only call
    // it once the <dialog> is on the page, so it goes in an effect.
    useEffect(() => {
        if (hasNotice) dialogRef.current?.showModal();
    }, [hasNotice]);

    if (!hasNotice) return null;

    // The browser keeps state on reload, so the message is removed from the
    // history entry when the dialog closes (with the button or with Escape).
    function handleClose() {
        navigate(pathname, { replace: true, state: null });
    }

    return (
        <dialog ref={dialogRef} onClose={handleClose} aria-labelledby="notice-text" className={styles.dialog}>
            <p id="notice-text">{notice}</p>
            <button type="button" onClick={() => dialogRef.current?.close()}>Aceptar</button>
        </dialog>
    );
}

export default NoticeDialog;