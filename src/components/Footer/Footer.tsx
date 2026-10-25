import { Link } from 'react-router'

function Footer() {
    return (
        <footer>
            <p><a href="https://github.com/MatiCoding/calculetra" target="_blank" rel="noopener noreferrer">Enlace al repositorio</a></p>
            <p><Link to="/privacy">Privacidad</Link></p>
        </footer>
    );
}

export default Footer
