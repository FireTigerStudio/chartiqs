import { getActiveInstruments } from "@/libs/instruments";
import CommoditiesListClient from "@/components/CommoditiesListClient";

export default async function CommoditiesPage() {
  const instruments = await getActiveInstruments();

  return <CommoditiesListClient instruments={instruments} />;
}
