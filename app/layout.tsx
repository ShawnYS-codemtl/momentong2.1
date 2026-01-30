import "./globals.css";
import {Quicksand, Dancing_Script} from "next/font/google"
import Header from "./components/Header"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer";
import { BagProvider } from "./context/BagContext";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-quicksand",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dancing",
  display: "swap",
});

export const metadata = {
  title: 'momento.ng',
  description: 'Handmade stickers inspired by everyday life',
  icons: {
    icon: '/favicon.svg',               // primary SVG
    shortcut: '/favicon-32x32.png',    // fallback for browsers
    apple: '/apple-touch-icon.png',    // iOS home screen
    other: [
      { rel: 'icon', url: '/favicon-16x16.png', sizes: '16x16' },
      { rel: 'icon', url: '/android-chrome-192x192.png', sizes: '192x192' },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${quicksand.variable} ${dancingScript.variable}`}
      > 
        <Header />
        <BagProvider>
          <Navbar />
          <main className="
              mx-auto
              max-w-[1440px]
              px-4
              sm:px-6
              md:px-10
              lg:px-12
              xl:px-[50px]
            ">
            
                {children}
            
          </main>
          <Footer/>
        </BagProvider>
      </body>
    </html>
  );
}
