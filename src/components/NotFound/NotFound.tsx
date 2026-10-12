import {Link, useLocation, useNavigate} from 'react-router'

function NotFound() {
    const {pathname, key} = useLocation()
    const navigate = useNavigate()

    return (
        <main>
            <h2>Esta página no existe</h2>
            <p>
                <span>100 × 4 + 4 = 404</span>
                <span>cuenta exacta, pero sin página</span>
            </p>

            <p>
                La ruta <code>{pathname}</code> no lleva a ningún sitio. Puede que el enlace esté mal escrito o que la página se haya movido.
            </p>

            <Link to="/">Ir al reto de hoy</Link>
            {key !== 'default' && (
                <button type="button" onClick={() => navigate(-1)}>Volver atrás</button>
            )}
        </main>
    )
}

export default NotFound