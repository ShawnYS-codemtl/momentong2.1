import FilmCam from "@/public/film_cam 2.svg"
import HKStampDay from "@/public/hkpost_stamp_day 1.svg"
import SalmonBagel from "@/public/salmon_bagel 1.svg"
import Image from "next/image"


export default function Hero () {
    return (
        <div className="hero-container">
            <h1>Because some <span className="accent stroke-word">moments</span> deserve to <span className="accent">stick</span>
            </h1>
            <h2 className="text-center">Capturing life’s fleeting magic in lovingly hand-drawn stickers</h2>
            <ul className="hero-stickers">
                <li><Image src={FilmCam} alt="film cam sticker" className="hero-sticker hero-sticker-filmcam" width={300} height={236}></Image></li>
                <li><Image src={HKStampDay} alt="HK stamp daytime sticker" className="hero-sticker hero-sticker-stamp" width={300} height={412}></Image></li>
                <li><Image src={SalmonBagel} alt="salmon bagel sticker" className="hero-sticker hero-sticker-bagel" width={300} height={220}></Image></li>
            </ul>
        </div>
    )
}