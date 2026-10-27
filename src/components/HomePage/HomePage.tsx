import { getChallengeNumber } from "../../domain/cifras/challenge";

function HomePage() {
    return (
        <main>
            <p>Reto nº {getChallengeNumber(new Date())}</p>
        </main>
    )
}

export default HomePage