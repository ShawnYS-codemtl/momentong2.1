import CollectionCard from "./CollectionCard";
import type { CollectionSummary } from "@/types/collection";

type Props = {
  collections: CollectionSummary[];
};

export default function CollectionGrid({ collections }: Props) {
  return (
    <div className="grid gap-x-9  gap-y-0 justify-center [grid-template-columns:repeat(auto-fit,minmax(350px,390px))]">
      {collections.map((c, i) => (
        <CollectionCard collection={c} key={c.cid}/>
      ))}
    </div>
  );
}