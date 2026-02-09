import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { createServiceClient } from "@/libs/supabase/server";
import { aiConfig, commodities } from "@/config";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Commodity name mapping
const commodityNames: Record<string, string> = {
  GOLD: "Gold",
  SILVER: "Silver",
  COPPER: "Copper",
  CRUDE_OIL: "WTI Crude Oil",
  NATURAL_GAS: "Natural Gas",
  SOYBEAN: "Soybean",
};

// Simple hash for cache key
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in first" }, { status: 401 });
    }

    const { symbol, question, context } = await request.json();

    if (!question || question.trim().length === 0) {
      return NextResponse.json({ error: "Please enter a question" }, { status: 400 });
    }

    // Check commodity
    const commodity = commodities.find((c) => c.symbol === symbol);
    if (!commodity) {
      return NextResponse.json({ error: "Invalid commodity code" }, { status: 400 });
    }

    // Check if user has paid access
    const { data: profile } = await supabase
      .from("profiles")
      .select("has_access")
      .eq("id", user.id)
      .single();

    const isPaid = profile?.has_access || false;
    const dailyLimit = isPaid ? aiConfig.paidQuestionsPerDay : aiConfig.freeQuestionsPerDay;

    // Get today's usage
    const today = new Date().toISOString().split("T")[0];
    const { data: usage } = await supabase
      .from("ai_usage")
      .select("question_count")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    const currentCount = usage?.question_count || 0;

    if (currentCount >= dailyLimit) {
      return NextResponse.json(
        {
          error: isPaid
            ? "Daily question limit reached, please come back tomorrow"
            : "Daily free question limit reached, upgrade to get more",
          remainingQuestions: 0,
        },
        { status: 429 }
      );
    }

    // Check if question is asking for investment advice
    const forbiddenPatterns = [
      /should I buy|should I sell|buy recommendation|sell recommendation/i,
      /price target|price prediction|will it reach|will it drop to/i,
      /add position|reduce position|open position|close position|stop loss|take profit/i,
      /when to buy|when to sell|how much to invest/i,
    ];

    const isForbidden = forbiddenPatterns.some((pattern) => pattern.test(question));
    if (isForbidden) {
      // Update usage count (even if rejected, it counts as one question)
      await updateUsage(supabase, user.id, today, currentCount);

      return NextResponse.json({
        answer: "Sorry, I cannot provide specific investment advice (such as buy/sell recommendations, price predictions, etc.). I can help you understand market factors and fundamental concepts. Please try asking a different question.",
        remainingQuestions: dailyLimit - currentCount - 1,
      });
    }

    // Check Q&A cache (normalize question for better cache hits)
    const normalizedQuestion = question.trim().toLowerCase().replace(/\s+/g, " ");
    const cacheKey = `CHAT:${symbol}:${simpleHash(normalizedQuestion)}`;
    const serviceSupabase = createServiceClient();

    const { data: cached } = await serviceSupabase
      .from("analysis_cache")
      .select("analysis_data")
      .eq("symbol", cacheKey)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (cached) {
      // Cache hit — still count as a question
      await updateUsage(supabase, user.id, today, currentCount);

      return NextResponse.json({
        answer: cached.analysis_data.answer,
        remainingQuestions: dailyLimit - currentCount - 1,
        fromCache: true,
      });
    }

    // Build Gemini prompt
    const commodityName = commodityNames[symbol] || symbol;
    const prompt = `You are an educational consultant for commodity markets. The user is viewing impact factor analysis for ${commodityName}.

Current factor matrix:
${context || "No factor data available"}

User question: ${question}

Requirements:
1. Answer in clear, easy-to-understand language
2. You may reference the currently displayed factors
3. Do not give buy/sell recommendations
4. Keep answer within 200 words
5. If the question involves specific investment advice, politely decline and guide the user to ask other questions

Tone: Professional but friendly, like a teacher educating a student`;

    const response = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        },
      }),
    });

    if (!response.ok) {
      console.error("Gemini API error:", await response.text());
      return NextResponse.json({ error: "AI service temporarily unavailable" }, { status: 503 });
    }

    const result = await response.json();
    const answer = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!answer) {
      return NextResponse.json({ error: "AI returned no valid results" }, { status: 500 });
    }

    // Save to cache (24 hours, reuse analysis_cache table)
    const expiresAt = new Date(Date.now() + aiConfig.cacheHours * 60 * 60 * 1000).toISOString();
    await serviceSupabase.from("analysis_cache").insert({
      symbol: cacheKey,
      analysis_data: { answer, question: normalizedQuestion },
      generated_at: new Date().toISOString(),
      expires_at: expiresAt,
    });

    // Update usage count
    await updateUsage(supabase, user.id, today, currentCount);

    return NextResponse.json({
      answer,
      remainingQuestions: dailyLimit - currentCount - 1,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function updateUsage(supabase: any, userId: string, date: string, currentCount: number) {
  if (currentCount === 0) {
    await supabase.from("ai_usage").insert({
      user_id: userId,
      date,
      question_count: 1,
    });
  } else {
    await supabase
      .from("ai_usage")
      .update({ question_count: currentCount + 1 })
      .eq("user_id", userId)
      .eq("date", date);
  }
}
