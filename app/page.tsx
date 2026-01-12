import Hero from "./components/Hero";
import CollectionGrid from "./components/CollectionGrid";
import StickerGrid from "./components/StickerGrid";
import { getAllCollections } from "@/lib/data/collections";

export default async function Home() {

  const featuredCollections = await getAllCollections();

  const stickers = [
    {
      image: "/milk_tea 1.svg",
      title: "milk tea",
      width: 300,
      height: 245,
    },
    {
      image: "/vitasoy 1.svg",
      title: "vitasoy",
      width: 300,
      height: 301,
    },
    {
      image: "/tofu.svg",
      title: "tofu",
      width: 300,
      height: 254,
    },
    {
      image: "/hkpost_stamp_day 1.svg",
      title: "hkpost stamp",
      width: 300,
      height: 412,
    },
    {
      image: "/lemon_tea 1.svg",
      title: "lemon tea",
      width: 300,
      height: 301,
    },
  ];
  

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
