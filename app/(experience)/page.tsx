import HomeExperience, { type HomeCollectionStatus } from "@/components/HomeExperience";
import { getCollectionAvailability, isStorefrontConfigured } from "@/lib/shopify";
import { CURRENT_COLLECTION_HANDLE } from "@/lib/shopify/config";

async function collectionStatus(): Promise<HomeCollectionStatus> {
  if (!isStorefrontConfigured()) return "unknown";
  try {
    const availability = await getCollectionAvailability(CURRENT_COLLECTION_HANDLE);
    if (availability === "sold-out") return "sold-out";
    return availability === "available" ? "available" : "unknown";
  } catch {
    return "unknown";
  }
}

export default async function Home() {
  return <HomeExperience status={await collectionStatus()} />;
}
