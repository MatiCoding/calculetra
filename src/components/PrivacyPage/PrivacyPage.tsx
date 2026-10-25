import { Link } from 'react-router'

function PrivacyPage() {
    return (
        <main>
            <h1>Política de privacidad</h1>
            <p>Última actualización: 25 de octubre de 2026.</p>

            <h2>Qué datos guardamos</h2>
            <p>
                Cuando creas una cuenta guardamos tu correo electrónico.
                Si entras con Google o GitHub, ellos nos pasan también tu nombre
                y tu foto de perfil.
            </p>
            <h2>Para qué los usamos</h2>
            <p>
                Solo para que puedas iniciar sesión y guardar tus partidas.
                No mostramos anuncios, no vendemos tus datos y no te rastreamos.
            </p>

            <h2>Quién los trata</h2>
            <p>
                Tus datos se guardan en Supabase, que nos da la base de datos y el
                inicio de sesión. La web está alojada en Vercel. No los compartimos
                con nadie más.
            </p>
            
            <h2>Cómo borrar tus datos</h2>
            <p>
                Puedes borrar tu cuenta cuando quieras desde{' '}
                <Link to="/account">Mi cuenta</Link>, con el botón "Eliminar cuenta".
                Se borran tu cuenta y todos sus datos.
            </p>

            <h2>Contacto</h2>
            <p>
                Si tienes cualquier duda sobre tus datos, escríbeme a{' '}
                <a href="mailto:mateorz2308@gmail.com">mateorz2308@gmail.com</a>.
            </p>
        </main>
    )
}

export default PrivacyPage