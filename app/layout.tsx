import "./globals.css";
import {Quicksand, Dancing_Script} from "next/font/google"
import Header from "./components/Header"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer";

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
      </body>
    </html>
  );
}
