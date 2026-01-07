import Logo from "@/public/logo.svg"
import Image from "next/image"

export default function Header() {
  return (
    <div className="logo-container">
        <Image src={Logo} alt="Logo" width={276} height={206} />
    </div>
  )
}