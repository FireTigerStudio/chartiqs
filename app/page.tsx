import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LandingPageClient from "@/components/LandingPageClient";
import { getActiveInstruments } from "@/libs/instruments";

export default async function Page() {
  const instruments = await getActiveInstruments();
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>

      <LandingPageClient instruments={instruments} />

      <Footer />
    </>
  );
}
