import Link from "next/link";
import { getInstrumentBySymbol } from "@/libs/instruments";
import CommodityDetailClient from "@/components/CommodityDetailClient";

interface Props {
  params: Promise<{ symbol: string }>;
}

export default async function CommodityDetailPage({ params }: Props) {
  const { symbol } = await params;
  const instrument = await getInstrumentBySymbol(symbol);

  if (!instrument) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Commodity Not Found</h1>
          <Link href="/commodities" className="btn btn-primary">
            Back to Commodities
          </Link>
        </div>
      </main>
    );
  }

  return (
    <CommodityDetailClient
      symbol={instrument.symbol}
      name={instrument.name}
      tv_symbol={instrument.tv_symbol}
      icon={instrument.icon}
    />
  );
}
