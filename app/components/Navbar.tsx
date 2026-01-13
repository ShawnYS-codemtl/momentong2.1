import Image from "next/image"
import Link from "next/link"
import UserIcon from "@/public/user-icon.svg"
import HeartIcon from "@/public/Heart.svg"
import BagIcon from "@/public/bag-icon.svg"

export default function Navbar() {
  return (
    <nav className="navbar-container">
      <ul className="navbar-links">
        <li><Link href="/"><h3>Home</h3></Link></li>
        <li><Link href="/collections"><h3>Collections</h3></Link></li>
        <li><Link href="/stickers"><h3>Stickers</h3></Link></li>
        <li><Link href="/about"><h3>About</h3></Link></li>
        <li><Link href="/admin"><h3>Admin</h3></Link></li>
      </ul>
      <ul className="navbar-icons">
        <Image src={UserIcon} alt="User Icon" width={32} height={32} className="navbar-icon" />
        <Image src={HeartIcon} alt="Heart Icon" width={32} height={32} className="navbar-icon" />
        <Image src={BagIcon} alt="Bag Icon" width={32} height={32} className="navbar-icon" />
      </ul>
    </nav>
  )
}