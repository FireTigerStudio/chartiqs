import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import { commodities } from "@/config";

export default function Page() {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>

      <main>
        {/* Hero Section */}
        <section className="bg-base-100">
          <div className="max-w-7xl mx-auto px-8 py-24 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight">
                  AI-Powered Commodity
                  <span className="text-primary block mt-2">Impact Factor Analysis</span>
                </h1>
                <p className="text-lg lg:text-xl text-base-content/80 leading-relaxed">
                  Help beginner investors understand the logic behind futures and commodity price movements. Through AI-powered analysis, we visualize complex market factors to make investment decisions clearer.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/commodities"
                    className="btn btn-primary btn-lg"
                  >
                    Start Analysis
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                  <a
                    href="#pricing"
                    className="btn btn-outline btn-lg"
                  >
                    View Pricing
                  </a>
                </div>
              </div>

              {/* Factor Matrix Preview Mockup */}
              <div className="relative">
                <div className="bg-base-200 rounded-2xl p-8 shadow-2xl">
                  <div className="text-sm font-semibold mb-6 text-base-content/60">Impact Factor Matrix Preview</div>

                  {/* Simple visual mockup of factor matrix */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-base-content/50">Impact Level</span>
                      <div className="flex-1 mx-4 relative h-48">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 text-xs text-base-content/60">High</div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-base-content/60">Medium</div>
                        <div className="absolute left-0 bottom-0 text-xs text-base-content/60">Low</div>

                        {/* Grid background */}
                        <div className="absolute inset-0 ml-8 grid grid-cols-3 grid-rows-3 gap-2">
                          {/* Sample bubbles */}
                          <div className="col-start-1 row-start-1 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-error/30 flex items-center justify-center text-xs font-medium">
                              Fed Policy
                            </div>
                          </div>
                          <div className="col-start-2 row-start-1 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-warning/30 flex items-center justify-center text-xs font-medium">
                              Inflation
                            </div>
                          </div>
                          <div className="col-start-3 row-start-2 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center text-xs font-medium">
                              Supply
                            </div>
                          </div>
                          <div className="col-start-1 row-start-2 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-info/30 flex items-center justify-center text-xs font-medium">
                              Geopolitics
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center gap-8 text-xs text-base-content/60 mt-4">
                      <span>Short-term</span>
                      <span>Medium-term</span>
                      <span>Long-term</span>
                    </div>
                    <div className="text-center text-xs text-base-content/50">Time Horizon</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-base-200" id="features">
          <div className="max-w-7xl mx-auto px-8 py-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4">
                Core Features
              </h2>
              <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                The perfect combination of AI technology and financial analysis
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                    </svg>
                  </div>
                  <h3 className="card-title text-xl">AI Impact Factor Matrix</h3>
                  <p className="text-base-content/70">
                    Intelligently identify and visualize key factors affecting commodity prices, categorized by time horizon and impact level
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                  </div>
                  <h3 className="card-title text-xl">Real-time Price Charts</h3>
                  <p className="text-base-content/70">
                    Integrated TradingView professional charts, providing real-time price data and technical analysis tools
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                    </svg>
                  </div>
                  <h3 className="card-title text-xl">AI Q&A</h3>
                  <p className="text-base-content/70">
                    Deep insights on impact factors, ask questions anytime, and get detailed AI explanations of market logic
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
                    </svg>
                  </div>
                  <h3 className="card-title text-xl">Multiple Commodities</h3>
                  <p className="text-base-content/70">
                    Covering major commodities including gold, silver, copper, crude oil, natural gas, and soybeans
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-base-100">
          <div className="max-w-7xl mx-auto px-8 py-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4">
                How It Works
              </h2>
              <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                Get professional market analysis in three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-content rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold mb-4">Choose a Commodity</h3>
                <p className="text-base-content/70">
                  Select from various commodities like gold, silver, crude oil, and more that you&apos;re interested in
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-content rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold mb-4">View Factor Analysis</h3>
                <p className="text-base-content/70">
                  AI automatically generates an impact factor matrix, visually displaying key factors across short, medium, and long-term horizons
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-content rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  3
                </div>
                <h3 className="text-xl font-bold mb-4">AI Q&A Interaction</h3>
                <p className="text-base-content/70">
                  Questions about any factor or market logic? Ask AI anytime to get professional answers
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Commodity Preview Section */}
        <section className="bg-base-200">
          <div className="max-w-7xl mx-auto px-8 py-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4">
                Supported Commodities
              </h2>
              <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                Covering major commodity markets
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {commodities.map((commodity) => (
                <Link
                  key={commodity.symbol}
                  href="/commodities"
                  className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <div className="card-body items-center text-center p-6">
                    <div className="text-5xl mb-3">{commodity.icon}</div>
                    <h3 className="font-bold text-lg">{commodity.name}</h3>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/commodities" className="btn btn-primary btn-lg">
                Explore Now
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <Pricing />

        {/* FAQ Section */}
        <section className="bg-base-100" id="faq">
          <div className="max-w-3xl mx-auto px-8 py-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-base-content/70">
                Get to know Chartiqs quickly
              </p>
            </div>

            <div className="space-y-4">
              {/* FAQ 1 */}
              <div className="collapse collapse-plus bg-base-200">
                <input type="radio" name="faq-accordion" defaultChecked />
                <div className="collapse-title text-xl font-medium">
                  What is this tool?
                </div>
                <div className="collapse-content">
                  <p className="text-base-content/70">
                    Chartiqs is an AI-powered commodity impact factor analysis tool. It helps beginner investors understand the various factors that influence commodity price movements through a visual impact factor matrix, making complex market logic clear and easy to understand.
                  </p>
                </div>
              </div>

              {/* FAQ 2 */}
              <div className="collapse collapse-plus bg-base-200">
                <input type="radio" name="faq-accordion" />
                <div className="collapse-title text-xl font-medium">
                  How do I read the impact factor matrix?
                </div>
                <div className="collapse-content">
                  <p className="text-base-content/70">
                    The impact factor matrix is a two-dimensional chart. The X-axis represents the time horizon (short-term, medium-term, long-term), and the Y-axis represents the impact level (high, medium, low). Each bubble represents an impact factor, with the bubble size indicating the factor&apos;s importance weight and the color representing impact intensity. This allows you to see at a glance which factors have the greatest impact on prices during different time periods.
                  </p>
                </div>
              </div>

              {/* FAQ 3 */}
              <div className="collapse collapse-plus bg-base-200">
                <input type="radio" name="faq-accordion" />
                <div className="collapse-title text-xl font-medium">
                  What&apos;s the difference between free and paid users?
                </div>
                <div className="collapse-content">
                  <p className="text-base-content/70">
                    All users can view real-time price charts and AI-generated impact factor matrices. The main difference is in AI Q&A quota: free users get 3 questions per day, while paid members get 20 questions per day. Paid members can also view historical analysis data and enjoy a 3-day free trial period.
                  </p>
                </div>
              </div>

              {/* FAQ 4 */}
              <div className="collapse collapse-plus bg-base-200">
                <input type="radio" name="faq-accordion" />
                <div className="collapse-title text-xl font-medium">
                  Are the analysis results accurate?
                </div>
                <div className="collapse-content">
                  <p className="text-base-content/70">
                    Our AI analysis is based on extensive market data and professional financial knowledge, but markets are complex and constantly changing. Analysis results are for reference and learning purposes only, helping you understand market logic, and do not constitute any investment advice. Investing involves risks, and decisions should be made carefully.
                  </p>
                </div>
              </div>

              {/* FAQ 5 */}
              <div className="collapse collapse-plus bg-base-200">
                <input type="radio" name="faq-accordion" />
                <div className="collapse-title text-xl font-medium">
                  Will you provide investment advice?
                </div>
                <div className="collapse-content">
                  <p className="text-base-content/70">
                    No. Chartiqs is an educational tool designed to help users understand the factors affecting commodity prices and market logic. We do not provide any specific investment advice such as buy, sell, or hold recommendations. All investment decisions should be made independently by you and at your own risk.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Disclaimer Banner */}
        <section className="bg-warning/10 border-t border-warning/20">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="flex items-start gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-warning shrink-0 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div className="text-sm text-base-content/70 leading-relaxed">
                <strong className="font-semibold text-base-content">Disclaimer:</strong>
                All analysis and information provided by Chartiqs are for educational and reference purposes only and do not constitute any investment advice. Commodity investing carries risks, and past performance does not guarantee future results. Please consult a professional financial advisor before making any investment decisions. By using this tool, you understand and agree to assume all investment risks independently.
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
