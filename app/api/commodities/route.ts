import { NextResponse } from "next/server";
import { getActiveInstruments } from "@/libs/instruments";

export async function GET() {
  const instruments = await getActiveInstruments();
  return NextResponse.json(instruments);
}
