import { useState, type ComponentProps } from 'react'
import styles from './PasswordInput.module.css'

type PasswordInputProps = Omit<ComponentProps<'input'>, 'type'>

function PasswordInput(props: PasswordInputProps){
    const[visible, setVisible] = useState(false)

    return (
        <div className={styles.wrapper}>
            <input {...props} type={visible ? 'text' : 'password'} className={styles.input} />
            <button 
                type="button" 
                className={styles.toggle} 
                aria-label={visible? "Ocultar contraseña": "Mostrar contraseña"}
                onClick={() => setVisible(!visible)}
            >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                    {visible && <line x1="3" y1="3" x2="21" y2="21" />}
                </svg>
                
            </button>
        </div>
    )
}

export default PasswordInput