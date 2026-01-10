"use client";

import Hero from "./components/Hero";
import CollectionGrid from "./components/CollectionGrid";
import StickerCard from "./components/StickerCard";
import MilkTea from "@/public/milk_tea 1.svg"

export default function Home() {

  const collections = [
    { location: "Hong Kong", theme: "Childhood", stickerCount: 7, favourite: "Vita Soy" },
    { location: "London", theme: "Independence", stickerCount: 3, favourite: "Typewriter" },
    { location: "Montreal", theme: "Maturing", stickerCount: 4, favourite: "McGill" },
  ];

  return (
    <div className="main-container">
      <Hero/>
      <h2 className="homepage-title">Collections</h2>
      <CollectionGrid collections={collections} />
      <h2 className="homepage-title">Stickers</h2>
      <div className="
        grid
        gap-x-8
        gap-y-0
        justify-center
        [grid-template-columns:repeat(auto-fit,286px)]
      ">
        <StickerCard 
          image="/milk_tea 1.svg"
          title="milk tea"
          width={300}
          height={245}
          
        />
        <StickerCard 
          image="/vitasoy 1.svg"
          title="vitasoy"
          width={300}
          height={301}
        />
        <StickerCard 
          image="/tofu.svg"
          title="tofu"
          width={300}
          height={254}
        />
        <StickerCard 
          image="/hkpost_stamp_day 1.svg"
          title="hkpost stamp"
          width={300}
          height={412}
        />
        <StickerCard 
          image="/lemon_tea 1.svg"
          title="lemon tea"
          width={300}
          height={301}
        />
       </div>
    </div>
  )
}
