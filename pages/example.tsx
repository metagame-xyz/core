import enigma from 'public/static/animations/enigma-small.json'
import Lottie from 'react-lottie'

const options = {
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: enigma,
    renderingSettings: {
        preserveAspectRatio: 'xMidYMid slice',
    },
}

export default function Home() {
    return (
        <div>
            <Lottie isClickToPauseDisabled options={options} width={3000} />
            <main>
                <h1>Enigma</h1>
            </main>
        </div>
    )
}
