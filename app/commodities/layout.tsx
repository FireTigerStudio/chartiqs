import { ReactNode, Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CommoditiesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      {children}
      <Footer />
    </>
  );
}
