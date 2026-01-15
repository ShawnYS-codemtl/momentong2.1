import Image from "next/image"
import Link from "next/link"
import Logo from "@/public/logo.svg"
// import { InstagramIcon, TwitterIcon, TikTokIcon } from "@/app/components/Icons" // placeholder icons

export default function Footer() {
  return (
    <footer className=" w-full bg-[var(--primary-dark)] text-white py-12 px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between px-12">
        {/* Brand */}
        <div className="flex-[1] max-w-full">
          <Image src={Logo} alt="logo" width={200}></Image>
          <p className="text-gray-200 mt-2 mb-12">
            Capture, collect, and cherish your memories
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-12 flex-[3] md:ml-12 justify-around">
            {/* Navigation */}
            <div className="flex flex-col gap-1">
                <h3 className="font-semibold mb-2">Pages</h3>
                <ul className="space-y-1 text-gray-200">
                    <li>
                    <Link href="/" className="hover:underline hover:decoration-[var(--button)] underline-offset-4">
                        Home
                    </Link>
                    </li>
                    <li>
                    <Link href="/collections" className="hover:underline hover:decoration-[var(--button)] underline-offset-4">
                        Collections
                    </Link>
                    </li>
                    <li>
                    <Link href="/stickers" className="hover:underline hover:decoration-[var(--button)] underline-offset-4">
                        Stickers
                    </Link>
                    </li>
                    <li>
                    <Link href="/about" className="hover:underline hover:decoration-[var(--button)] underline-offset-4">
                        About
                    </Link>
                    </li>
                    <li>
                    <Link href="/contact" className="hover:underline hover:decoration-[var(--button)] underline-offset-4">
                        Contact
                    </Link>
                    </li>
                    <li>
                    <Link href="/admin" className="hover:underline hover:decoration-[var(--button)] underline-offset-4">
                        Admin
                    </Link>
                    </li>
                </ul>
            </div>

            {/* Social */}
            <div className="flex flex-col gap-1">
                <h3 className="font-semibold mb-2">Follow</h3>
                <div className="flex space-x-4">
                    <Link href="#" aria-label="Instagram" className="hover:text-pink-500">
                    IG
                    </Link>
                    <Link href="#" aria-label="Twitter" className="hover:text-blue-400">
                        Twitter
                    </Link>
                    <Link href="#" aria-label="TikTok" className="hover:text-black">
                    Tiktok
                    </Link>
                </div>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-1">
                <h3 className="font-semibold mb-2">Legal</h3>
                <ul className="space-y-1 text-gray-400 text-sm">
                    <li>
                    <Link href="/privacy" className="hover:underline hover:decoration-[var(--primary-color)] underline-offset-4">
                        Privacy Policy
                    </Link>
                    </li>
                    <li>
                    <Link href="/terms" className="hover:underline hover:decoration-[var(--primary-color)] underline-offset-4">
                        Terms of Service
                    </Link>
                    </li>
                </ul>
            </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-8 border-t border-white-700 pt-4 text-gray-200 text-sm text-center">
        &copy; 2026 momento.ng
      </div>

      <div className="mt-2 text-gray-400 text-xs text-center">
        Made by ShawnYSCodeMtl
      </div>
    </footer>
  )
}
