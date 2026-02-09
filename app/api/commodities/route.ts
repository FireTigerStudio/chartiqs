import { NextResponse } from "next/server";
import { commodities } from "@/config";

export async function GET() {
  return NextResponse.json(commodities);
}
