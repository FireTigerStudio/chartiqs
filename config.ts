import { ConfigProps } from "./types/config";

// Chartiqs commodity configuration
export const commodities = [
  { symbol: "GOLD", name: "Gold", tvSymbol: "CMCMARKETS:GOLD", icon: "🥇" },
  { symbol: "SILVER", name: "Silver", tvSymbol: "CMCMARKETS:SILVER", icon: "🥈" },
  { symbol: "COPPER", name: "Copper", tvSymbol: "CMCMARKETS:COPPER", icon: "🔶" },
  { symbol: "CRUDE_OIL", name: "WTI Crude Oil", tvSymbol: "CMCMARKETS:USCRUDEOIL", icon: "🛢️" },
  { symbol: "NATURAL_GAS", name: "Natural Gas", tvSymbol: "CMCMARKETS:USNATGAS", icon: "🔥" },
  { symbol: "SOYBEAN", name: "Soybean", tvSymbol: "CMCMARKETS:SOYBEAN1!", icon: "🫘" },
];

// AI configuration
export const aiConfig = {
  freeQuestionsPerDay: 3,
  paidQuestionsPerDay: 50,
  cacheHours: 24,
};

const config = {
  // REQUIRED
  appName: "Chartiqs",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "AI-powered commodity impact factor analysis tool — understand what drives price movements",
  // REQUIRED (no https://, not trialing slash at the end, just the naked domain)
  domainName: "chartiqs.com",
  crisp: {
    id: "",
    onlyShowOnRoutes: ["/"],
  },
  stripe: {
    // 3-day free trial
    trialDays: 3,
    plans: [
      {
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || "price_monthly",
        name: "Monthly",
        description: "Unlimited AI questions, all commodities",
        price: 29,
        priceAnchor: 49,
        features: [
          { name: "pricing.feature.unlimitedAI" },
          { name: "pricing.feature.allCommodities" },
          { name: "pricing.feature.realtimeCharts" },
          { name: "pricing.feature.factorMatrix" },
        ],
      },
      {
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || "price_yearly",
        isFeatured: true,
        name: "Yearly",
        description: "Save 14% — best value",
        price: 299,
        priceAnchor: 348,
        features: [
          { name: "pricing.feature.unlimitedAI" },
          { name: "pricing.feature.allCommodities" },
          { name: "pricing.feature.realtimeCharts" },
          { name: "pricing.feature.factorMatrix" },
          { name: "pricing.feature.save14" },
        ],
      },
    ],
  },
  aws: {
    bucket: "bucket-name",
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
  },
  resend: {
    fromNoReply: `Chartiqs <noreply@chartiqs.com>`,
    fromAdmin: `Chartiqs <support@chartiqs.com>`,
    supportEmail: "support@chartiqs.com",
  },
  colors: {
    theme: "light",
    main: "#1e3a5f",
  },
  auth: {
    loginUrl: "/signin",
    callbackUrl: "/commodities",
  },
} as ConfigProps;

export default config;
