"use client";

import Hero from "./components/Hero";
import HKStamp from "@/public/hkpost_stamp_sunset 1.svg"
import CollectionCard from "./components/CollectionCard";

export default function Home() {
  return (
    <div className="main-container">
    <Hero/>
    <h2 className="homepage-title">Collections</h2>
    <CollectionCard
      location = "Hong Kong"
      theme = "Childhood"
      stickerCount= {7}
      favourite = "Vita Soy"
    />
  </div>
  )
}
