import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient, createServiceClient } from "@/libs/supabase/server";
import { aiConfig } from "@/config";
import { getInstrumentBySymbol } from "@/libs/instruments";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Auth is optional — anonymous users can view cached analysis
    const { data: { user } } = await supabase.auth.getUser();
    void user;

    const { symbol } = await request.json();

    // Validate commodity
    const instrument = await getInstrumentBySymbol(symbol);
    if (!instrument) {
      return NextResponse.json({ error: "Invalid commodity code" }, { status: 400 });
    }

    const serviceSupabase = createServiceClient();

    // Read language preference
    const cookieStore = await cookies();
    const lang = cookieStore.get("lang")?.value || "en";
    const languageInstruction = lang === "zh"
      ? "Respond entirely in Chinese (Simplified)."
      : "Respond entirely in English.";
    const cacheSymbol = `${symbol}:${lang}`;

    // Check cache (service client bypasses RLS — analysis_cache has no user INSERT policy)
    const { data: cached } = await serviceSupabase
      .from("analysis_cache")
      .select("*")
      .eq("symbol", cacheSymbol)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (cached) {
      return NextResponse.json({
        ...cached.analysis_data,
        generatedAt: cached.generated_at,
        fromCache: true,
      });
    }

    // Call Gemini API
    const commodityName = lang === "zh" && instrument.name_zh ? instrument.name_zh : instrument.name;
    const prompt = `You are a professional commodity market analyst. Analyze the key price impact factors for ${commodityName}.

Requirements:
1. Identify 6-10 key impact factors
2. Classify by time horizon: short (days to weeks), medium (months to years), long (5-20 years)
3. Classify by impact level: high, medium, low
4. Provide a brief description for each factor (within 50 words)
5. Assess importance weight (1-10)
6. ${languageInstruction}

Output JSON format (without markdown code block markers):
{
  "factors": [
    {
      "name": "Factor Name",
      "nameEn": "Factor Name in English",
      "impact": "high or medium or low",
      "timeHorizon": "short or medium or long",
      "weight": number from 1 to 10,
      "description": "Brief description"
    }
  ],
  "summary": "Overall analysis summary (within 100 words)"
}

Important: Do not give buy/sell recommendations, only analyze impact factors. Output JSON directly with no other text.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API error:", error);
      return NextResponse.json({ error: "AI analysis service temporarily unavailable" }, { status: 503 });
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json({ error: "AI returned no valid results" }, { status: 500 });
    }

    // Parse JSON
    let analysisData;
    try {
      // Remove possible markdown code block markers
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
      analysisData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Text:", text);
      return NextResponse.json({ error: "AI returned invalid format" }, { status: 500 });
    }

    // Save to cache
    const generatedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + aiConfig.cacheHours * 60 * 60 * 1000).toISOString();

    await serviceSupabase.from("analysis_cache").insert({
      symbol: cacheSymbol,
      analysis_data: analysisData,
      generated_at: generatedAt,
      expires_at: expiresAt,
    });

    return NextResponse.json({
      ...analysisData,
      generatedAt,
      fromCache: false,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
