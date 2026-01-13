import Hero from "./components/Hero";
import CollectionGrid from "./components/CollectionGrid";
import StickerGrid from "./components/StickerGrid";
import { getAllCollections } from "@/lib/data/collections";
import { getAllStickers } from "@/lib/data/stickers";

export default async function Home() {

  const featuredCollections = await getAllCollections();

  const stickers = await getAllStickers()

  return (
    <div className="main-container">
      <Hero/>
      <h2 className="homepage-title">Collections</h2>
      <CollectionGrid collections={featuredCollections} />
      <h2 className="homepage-title">Stickers</h2>
      <StickerGrid stickers={stickers} />
    </div>
  )
}
