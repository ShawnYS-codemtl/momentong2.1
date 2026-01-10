import Logo from "@/public/logo.svg"
import Vitasoy from "@/public/vitasoy 1.svg"
import Tofu from "@/public/tofu.svg"
import Tram from "@/public/hktram 1.svg"
import Typewriter from "@/public/typewriter.svg"
import Train from "@/public/old_port_train 1.svg"
import MapleSyrup from "@/public/maple_syrup 1.svg"
import Image from "next/image"

export default function Header() {
  return (
    <div className="logo-container">
        <Image src={Logo} alt="Logo" width={276} height={206} className="logo" />
        <Image src={Vitasoy} alt="vitasoy" className="sticker-1 h-sticker" width={300} height={301}/>
        <Image src={Tofu} alt="tofu" className="sticker-2 h-sticker" width={300} height={254}/>
        <Image src={Tram} alt="tram" className="sticker-3 h-sticker" width={300} height={314}/>
        <Image src={Typewriter} alt="typewriter" className="sticker-4 h-sticker" width={300} height={254}/>
        <Image src={Train} alt="train" className="sticker-5 h-sticker" width={300} height={220}/>
        <Image src={MapleSyrup} alt="maple syrup can" className="sticker-6 h-sticker" width={300} height={399}/>
    </div>
  )
}