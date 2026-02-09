import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Terms of Service | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
  return (
    <main className="max-w-4xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Terms of Service for {config.appName}
        </h1>

        <div className="prose prose-neutral max-w-none">
          <p className="text-sm text-gray-600 mb-8">
            <strong>Last Updated:</strong> February 8, 2026
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. User Agreement</h2>
              <p className="mb-4">
                Welcome to {config.appName} (&ldquo;Service&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User&rdquo;, &ldquo;you&rdquo;, or &ldquo;your&rdquo;) and {config.appName}, accessible at https://chartiqs.com.
              </p>
              <p className="mb-4">
                By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access the Service. These Terms apply to all visitors, users, and others who access or use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Service Description</h2>
              <p className="mb-4">
                {config.appName} is an AI-powered educational platform that provides commodity market impact factor analysis and visualization tools. The Service includes:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>AI-generated analysis of factors affecting commodity price movements for gold, silver, copper, crude oil, natural gas, and soybeans</li>
                <li>Interactive impact factor matrix visualization</li>
                <li>Real-time commodity price charts powered by TradingView</li>
                <li>AI-powered question and answer functionality regarding commodity market factors</li>
                <li>Educational content to help beginner investors understand commodity markets</li>
              </ul>
              <p className="mb-4">
                The Service is designed for educational purposes only and does not constitute investment advice, financial advice, trading advice, or any other sort of advice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Account Registration and Security</h2>
              <h3 className="text-xl font-semibold mb-3">3.1 Account Creation</h3>
              <p className="mb-4">
                To access certain features of the Service, you must create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </p>
              <h3 className="text-xl font-semibold mb-3">3.2 Account Security</h3>
              <p className="mb-4">
                You are responsible for safeguarding the password or credentials used to access your account and for any activities or actions under your account. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
              </p>
              <h3 className="text-xl font-semibold mb-3">3.3 Account Eligibility</h3>
              <p className="mb-4">
                You must be at least 18 years of age to use the Service. By agreeing to these Terms, you represent and warrant that you are at least 18 years of age.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Subscription and Payment Terms</h2>
              <h3 className="text-xl font-semibold mb-3">4.1 Subscription Plans</h3>
              <p className="mb-4">
                {config.appName} offers both free and paid subscription plans:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Free Plan:</strong> Limited to 3 AI questions per day with access to basic features</li>
                <li><strong>Monthly Plan:</strong> $29 USD per month, includes 20 AI questions per day and full feature access</li>
                <li><strong>Yearly Plan:</strong> $299 USD per year (equivalent to $24.92/month), includes 20 AI questions per day and full feature access</li>
              </ul>
              <h3 className="text-xl font-semibold mb-3">4.2 Payment Processing</h3>
              <p className="mb-4">
                All payments are processed securely through Stripe, Inc. (&ldquo;Stripe&rdquo;). By providing payment information, you authorize us to charge your payment method for the applicable subscription fees. You represent and warrant that you have the legal right to use any payment method you provide.
              </p>
              <h3 className="text-xl font-semibold mb-3">4.3 Free Trial</h3>
              <p className="mb-4">
                New paid subscribers may be eligible for a 3-day free trial period. If you do not cancel before the trial period ends, your payment method will be automatically charged the applicable subscription fee.
              </p>
              <h3 className="text-xl font-semibold mb-3">4.4 Automatic Renewal</h3>
              <p className="mb-4">
                Paid subscriptions automatically renew at the end of each billing period (monthly or yearly) unless cancelled prior to the renewal date. You will be charged the then-current subscription fee for your plan. We will provide you with reasonable advance notice of any fee increases.
              </p>
              <h3 className="text-xl font-semibold mb-3">4.5 Cancellation</h3>
              <p className="mb-4">
                You may cancel your paid subscription at any time through your account settings or by contacting support@chartiqs.com. Upon cancellation, you will retain access to paid features until the end of your current billing period. No refunds will be provided for partial billing periods.
              </p>
              <h3 className="text-xl font-semibold mb-3">4.6 Refund Policy</h3>
              <p className="mb-4">
                We offer a 7-day money-back guarantee for first-time paid subscribers. If you are not satisfied with the Service within the first 7 days of your initial paid subscription, you may request a full refund by contacting support@chartiqs.com. Refunds are not available for renewals or after the initial 7-day period.
              </p>
              <h3 className="text-xl font-semibold mb-3">4.7 Usage Limits</h3>
              <p className="mb-4">
                AI question quotas reset daily at midnight UTC. Unused questions do not roll over to the next day. We reserve the right to modify usage limits with reasonable advance notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. AI-Generated Content Disclaimer</h2>
              <p className="mb-4">
                The Service utilizes artificial intelligence technology (Google Gemini API) to generate commodity market analysis and answer user questions. You acknowledge and agree that:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>AI-generated content may contain errors, inaccuracies, or outdated information</li>
                <li>The AI system may occasionally produce incomplete or inconsistent analysis</li>
                <li>AI-generated content should not be relied upon as the sole basis for any investment or trading decisions</li>
                <li>We do not guarantee the accuracy, completeness, or reliability of any AI-generated content</li>
                <li>You should independently verify any information provided by the AI system before making any decisions based on such information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Risk Warning and Investment Disclaimer</h2>
              <p className="mb-4 font-bold text-red-600">
                IMPORTANT: THE SERVICE IS FOR EDUCATIONAL PURPOSES ONLY AND DOES NOT CONSTITUTE INVESTMENT ADVICE.
              </p>
              <h3 className="text-xl font-semibold mb-3">6.1 Not Investment Advice</h3>
              <p className="mb-4">
                {config.appName} is an educational tool designed to help users understand factors that may influence commodity prices. Nothing on the Service constitutes, or should be construed as, investment advice, financial advice, trading advice, or a recommendation to buy, sell, or hold any security, commodity, or financial instrument.
              </p>
              <h3 className="text-xl font-semibold mb-3">6.2 Trading Risks</h3>
              <p className="mb-4">
                Trading commodities, futures, options, and other financial instruments involves substantial risk of loss and is not suitable for all investors. Past performance is not indicative of future results. You should carefully consider whether such trading is suitable for you in light of your circumstances, knowledge, and financial resources.
              </p>
              <h3 className="text-xl font-semibold mb-3">6.3 Consult Professionals</h3>
              <p className="mb-4">
                Before making any investment decisions, you should consult with licensed financial advisors, investment professionals, or other qualified experts who can assess your specific situation and risk tolerance.
              </p>
              <h3 className="text-xl font-semibold mb-3">6.4 No Guaranteed Results</h3>
              <p className="mb-4">
                We make no representations or warranties regarding the potential profitability of any investment strategy or approach. You acknowledge that you may lose some or all of your invested capital.
              </p>
              <h3 className="text-xl font-semibold mb-3">6.5 User Responsibility</h3>
              <p className="mb-4">
                You acknowledge that any investment or trading decisions you make are your sole responsibility and that we will not be liable for any losses, damages, or consequences resulting from your use of the Service or reliance on information provided through the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Intellectual Property</h2>
              <h3 className="text-xl font-semibold mb-3">7.1 Ownership</h3>
              <p className="mb-4">
                The Service and its original content, features, and functionality are and will remain the exclusive property of {config.appName} and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
              </p>
              <h3 className="text-xl font-semibold mb-3">7.2 Trademarks</h3>
              <p className="mb-4">
                {config.appName} name and logo are trademarks of {config.appName}. You may not use these marks without our prior written permission. All other trademarks, service marks, and logos used on the Service are the trademarks of their respective owners.
              </p>
              <h3 className="text-xl font-semibold mb-3">7.3 Limited License</h3>
              <p className="mb-4">
                Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your personal, non-commercial use. This license does not include any right to: (a) resell or make commercial use of the Service; (b) modify, distribute, or publicly display any content from the Service; (c) use any data mining, robots, or similar data gathering methods; or (d) use the Service in any manner that could damage, disable, or impair the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Third-Party Services</h2>
              <p className="mb-4">
                The Service integrates with and relies upon certain third-party services:
              </p>
              <h3 className="text-xl font-semibold mb-3">8.1 TradingView</h3>
              <p className="mb-4">
                Real-time commodity price charts are provided by TradingView. Your use of TradingView widgets is subject to TradingView&apos;s terms of service and privacy policy. We are not responsible for the accuracy, availability, or content of TradingView charts.
              </p>
              <h3 className="text-xl font-semibold mb-3">8.2 Google Gemini API</h3>
              <p className="mb-4">
                AI-generated analysis is powered by Google&apos;s Gemini API. We are not responsible for the accuracy, reliability, or availability of Google&apos;s AI services.
              </p>
              <h3 className="text-xl font-semibold mb-3">8.3 Supabase</h3>
              <p className="mb-4">
                Authentication and data storage services are provided by Supabase. We implement industry-standard security practices, but we are not responsible for any unauthorized access resulting from vulnerabilities in third-party services.
              </p>
              <h3 className="text-xl font-semibold mb-3">8.4 Stripe</h3>
              <p className="mb-4">
                Payment processing is handled by Stripe, Inc. Your payment information is subject to Stripe&apos;s privacy policy and terms of service. We do not store your complete credit card information on our servers.
              </p>
              <h3 className="text-xl font-semibold mb-3">8.5 No Endorsement</h3>
              <p className="mb-4">
                The inclusion of third-party services does not imply endorsement or recommendation by {config.appName}. We are not responsible for the content, accuracy, or availability of any third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. User Conduct and Acceptable Use</h2>
              <p className="mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Violate any applicable laws, regulations, or third-party rights</li>
                <li>Transmit any harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable content</li>
                <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with any person or entity</li>
                <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
                <li>Attempt to gain unauthorized access to any portion of the Service, other accounts, or computer systems or networks</li>
                <li>Use any automated means (including bots, scripts, or web scraping tools) to access the Service or collect data</li>
                <li>Attempt to reverse engineer, decompile, or discover the source code of the Service</li>
                <li>Circumvent or manipulate the AI question quota system or usage limits</li>
                <li>Share your account credentials with others or create multiple accounts to evade usage restrictions</li>
                <li>Use the Service to engage in any form of market manipulation or illegal trading activities</li>
              </ul>
              <p className="mb-4">
                We reserve the right to investigate and take appropriate legal action against anyone who violates these provisions, including suspending or terminating accounts without refund.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Limitation of Liability</h2>
              <p className="mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
              </p>
              <h3 className="text-xl font-semibold mb-3">10.1 Disclaimer of Warranties</h3>
              <p className="mb-4">
                THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
              </p>
              <h3 className="text-xl font-semibold mb-3">10.2 Limitation of Damages</h3>
              <p className="mb-4">
                IN NO EVENT SHALL {config.appName.toUpperCase()}, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Your access to or use of or inability to access or use the Service</li>
                <li>Any conduct or content of any third party on the Service</li>
                <li>Any content obtained from the Service</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                <li>Investment or trading losses resulting from your reliance on information from the Service</li>
              </ul>
              <h3 className="text-xl font-semibold mb-3">10.3 Cap on Liability</h3>
              <p className="mb-4">
                TO THE EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM OR RELATED TO THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM OR (B) ONE HUNDRED DOLLARS ($100 USD).
              </p>
              <h3 className="text-xl font-semibold mb-3">10.4 Jurisdictional Variations</h3>
              <p className="mb-4">
                Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability for incidental or consequential damages. In such jurisdictions, our liability will be limited to the greatest extent permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. Indemnification</h2>
              <p className="mb-4">
                You agree to defend, indemnify, and hold harmless {config.appName} and its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys&apos; fees and costs, arising out of or in any way connected with:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Your access to or use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights, including intellectual property rights or privacy rights</li>
                <li>Any investment or trading decisions you make based on information from the Service</li>
                <li>Any claim that your use of the Service caused damage to a third party</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">12. Termination</h2>
              <h3 className="text-xl font-semibold mb-3">12.1 Termination by You</h3>
              <p className="mb-4">
                You may terminate your account at any time by contacting us at support@chartiqs.com or through your account settings. Upon termination, your right to use the Service will immediately cease.
              </p>
              <h3 className="text-xl font-semibold mb-3">12.2 Termination by Us</h3>
              <p className="mb-4">
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms. Upon termination, any subscriptions will be cancelled and no refunds will be provided except as required by law.
              </p>
              <h3 className="text-xl font-semibold mb-3">12.3 Effect of Termination</h3>
              <p className="mb-4">
                Upon termination, all provisions of these Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">13. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision is material, we will provide at least 30 days&apos; notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
              <p className="mb-4">
                By continuing to access or use our Service after revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you must stop using the Service and cancel your account.
              </p>
              <p className="mb-4">
                We will notify you of changes via email to the address associated with your account and/or by posting a notice on the Service. It is your responsibility to review these Terms periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">14. Governing Law and Dispute Resolution</h2>
              <h3 className="text-xl font-semibold mb-3">14.1 Governing Law</h3>
              <p className="mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.
              </p>
              <h3 className="text-xl font-semibold mb-3">14.2 Jurisdiction</h3>
              <p className="mb-4">
                You agree that any dispute arising from or relating to the subject matter of these Terms shall be governed by the exclusive jurisdiction and venue of the state and federal courts located in Delaware, United States.
              </p>
              <h3 className="text-xl font-semibold mb-3">14.3 Arbitration</h3>
              <p className="mb-4">
                At our sole discretion, we may require you to submit any disputes arising from these Terms or use of the Service, including disputes arising from or concerning their interpretation, violation, invalidity, non-performance, or termination, to final and binding arbitration under the Rules of Arbitration of the American Arbitration Association.
              </p>
              <h3 className="text-xl font-semibold mb-3">14.4 Class Action Waiver</h3>
              <p className="mb-4">
                You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action. You and {config.appName} agree that each may bring claims against the other only in your or its individual capacity and not as a plaintiff or class member in any purported class or representative proceeding.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">15. Miscellaneous</h2>
              <h3 className="text-xl font-semibold mb-3">15.1 Entire Agreement</h3>
              <p className="mb-4">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and {config.appName} regarding the Service and supersede all prior agreements and understandings.
              </p>
              <h3 className="text-xl font-semibold mb-3">15.2 Severability</h3>
              <p className="mb-4">
                If any provision of these Terms is held to be invalid or unenforceable, such provision shall be struck and the remaining provisions shall remain in full force and effect.
              </p>
              <h3 className="text-xl font-semibold mb-3">15.3 Waiver</h3>
              <p className="mb-4">
                No waiver of any term of these Terms shall be deemed a further or continuing waiver of such term or any other term, and our failure to assert any right or provision under these Terms shall not constitute a waiver of such right or provision.
              </p>
              <h3 className="text-xl font-semibold mb-3">15.4 Assignment</h3>
              <p className="mb-4">
                You may not assign or transfer these Terms or your rights hereunder, in whole or in part, without our prior written consent. We may assign these Terms at any time without notice or consent.
              </p>
              <h3 className="text-xl font-semibold mb-3">15.5 Force Majeure</h3>
              <p className="mb-4">
                We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including acts of God, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, strikes, or fuel crises.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">16. Contact Information</h2>
              <p className="mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="bg-base-200 p-4 rounded-lg mb-4">
                <p className="mb-2">
                  <strong>Email:</strong> support@chartiqs.com
                </p>
                <p className="mb-2">
                  <strong>Website:</strong>{" "}
                  <a href="https://chartiqs.com" className="link link-primary">https://chartiqs.com</a>
                </p>
                <p>
                  <strong>Company:</strong>{" "}
                  <a href="https://firetigerstudio.com/" target="_blank" rel="noopener noreferrer" className="link link-primary">FireTigerStudio</a>
                </p>
              </div>
            </section>

            <section className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-600">
                By using {config.appName}, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
              <p className="text-sm text-gray-600 mt-4">
                <strong>Effective Date:</strong> February 8, 2026
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TOS;
