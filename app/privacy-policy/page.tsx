import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Privacy Policy | ${config.appName}`,
  canonicalUrlRelative: "/privacy-policy",
});

const PrivacyPolicy = () => {
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
          </svg>{" "}
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Privacy Policy for {config.appName}
        </h1>

        <div className="prose prose-neutral max-w-none">
          <p className="text-sm text-base-content/70 mb-8">
            <strong>Last Updated:</strong> February 8, 2026
          </p>

          <p className="mb-6">
            Welcome to {config.appName} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). This Privacy Policy
            describes how {config.appName} (&quot;Service&quot;) collects, uses, discloses, and
            protects your information when you use our website at https://chartiqs.com
            (the &quot;Website&quot;) and our AI-powered commodity impact factor analysis services.
          </p>

          <p className="mb-6">
            By accessing or using the Service, you acknowledge that you have read,
            understood, and agree to be bound by this Privacy Policy. If you do not
            agree with our policies and practices, please do not use the Service.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">1.1 Personal Information</h3>
          <p className="mb-4">
            We collect personal information that you voluntarily provide to us when you
            register for an account, subscribe to our services, or contact us. This includes:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Email Address:</strong> Used for account creation, authentication
              via Supabase Auth (magic link login), service communications, and subscription
              management.
            </li>
            <li>
              <strong>Name:</strong> Optional profile information to personalize your
              experience.
            </li>
            <li>
              <strong>Account Credentials:</strong> Authentication tokens managed
              securely by Supabase.
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">1.2 Payment Information</h3>
          <p className="mb-4">
            Payment information is processed entirely by Stripe, our third-party payment
            processor. We do not collect, store, or have access to your complete credit
            card numbers or banking details. Stripe provides us with limited information
            such as:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Last four digits of your payment card</li>
            <li>Payment card brand (Visa, Mastercard, etc.)</li>
            <li>Billing address (if provided)</li>
            <li>Stripe customer ID for subscription management</li>
            <li>Payment transaction status and history</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">1.3 Usage Data</h3>
          <p className="mb-4">
            We automatically collect information about your interaction with our Service:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>AI Interaction Data:</strong> Questions you ask our AI assistant,
              commodity analysis requests, timestamps, and daily usage counts (to enforce
              question limits: 3/day for free users, 20/day for paid subscribers).
            </li>
            <li>
              <strong>Service Usage:</strong> Commodities viewed, pages accessed,
              features used, session duration, and interaction patterns.
            </li>
            <li>
              <strong>Subscription Data:</strong> Plan type, subscription status,
              trial period information, and billing history.
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">1.4 Technical Information</h3>
          <p className="mb-4">
            We collect technical data to provide and improve our services:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Device Information:</strong> Browser type and version, operating
              system, device type, screen resolution.
            </li>
            <li>
              <strong>Network Information:</strong> IP address, approximate geographic
              location (country/region level), internet service provider.
            </li>
            <li>
              <strong>Cookies and Similar Technologies:</strong> Session identifiers,
              authentication tokens, preference settings, and analytics data.
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">We use the collected information for the following purposes:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Service Delivery:</strong> Provide access to commodity analysis,
              AI-powered factor matrices, real-time price charts, and AI Q&A features.
            </li>
            <li>
              <strong>Account Management:</strong> Create and manage your account,
              authenticate users, process subscriptions, and enforce usage limits.
            </li>
            <li>
              <strong>Payment Processing:</strong> Process subscription payments, manage
              billing cycles, handle refunds, and maintain transaction records.
            </li>
            <li>
              <strong>Communication:</strong> Send transactional emails (login links,
              subscription confirmations, payment receipts), service updates, and
              customer support responses.
            </li>
            <li>
              <strong>Service Improvement:</strong> Analyze usage patterns, identify
              bugs, optimize performance, and develop new features.
            </li>
            <li>
              <strong>Compliance and Security:</strong> Detect and prevent fraud,
              enforce our Terms of Service, comply with legal obligations, and protect
              user safety.
            </li>
            <li>
              <strong>Analytics:</strong> Understand how users interact with our Service
              to improve user experience and content relevance.
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            3. AI Data Processing (Google Gemini)
          </h2>
          <p className="mb-4">
            {config.appName} uses Google Gemini API to power our AI analysis and Q&A features.
            When you use these features:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              Your questions and commodity analysis requests are sent to Google&apos;s
              servers for processing via the Gemini API.
            </li>
            <li>
              Google processes this data according to their own privacy policies and
              terms of service. We recommend reviewing{" "}
              <a
                href="https://ai.google.dev/gemini-api/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary"
              >
                Google&apos;s Gemini API Terms
              </a>{" "}
              and{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary"
              >
                Google Privacy Policy
              </a>
              .
            </li>
            <li>
              According to Google&apos;s policies, your data sent to Gemini API is not
              used to train Google&apos;s models or improve their services beyond providing
              the immediate API response.
            </li>
            <li>
              We cache AI-generated analysis results for up to 24 hours to improve
              performance and reduce API costs, but user questions are not stored
              long-term beyond usage count tracking.
            </li>
            <li>
              We do not share personally identifiable information with Google beyond
              what is necessary to process your AI requests.
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Third-Party Services</h2>
          <p className="mb-4">
            We work with trusted third-party service providers to operate our Service:
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Supabase</h3>
          <p className="mb-4">
            <strong>Purpose:</strong> Database hosting, user authentication, and data storage.
          </p>
          <p className="mb-4">
            <strong>Data Shared:</strong> Email addresses, authentication tokens, user
            profiles, usage records, and service data.
          </p>
          <p className="mb-4">
            <strong>Privacy Policy:</strong>{" "}
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary"
            >
              https://supabase.com/privacy
            </a>
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Stripe</h3>
          <p className="mb-4">
            <strong>Purpose:</strong> Payment processing and subscription management.
          </p>
          <p className="mb-4">
            <strong>Data Shared:</strong> Email, billing information, payment details,
            and transaction history (all processed directly by Stripe).
          </p>
          <p className="mb-4">
            <strong>Privacy Policy:</strong>{" "}
            <a
              href="https://stripe.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary"
            >
              https://stripe.com/privacy
            </a>
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">4.3 Google Gemini API</h3>
          <p className="mb-4">
            <strong>Purpose:</strong> AI-powered commodity analysis and question answering.
          </p>
          <p className="mb-4">
            <strong>Data Shared:</strong> User questions, commodity data, and analysis
            requests (see Section 3 above).
          </p>
          <p className="mb-4">
            <strong>Privacy Policy:</strong>{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary"
            >
              https://policies.google.com/privacy
            </a>
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">4.4 TradingView</h3>
          <p className="mb-4">
            <strong>Purpose:</strong> Embedded real-time commodity price charts via
            TradingView widgets.
          </p>
          <p className="mb-4">
            <strong>Data Shared:</strong> TradingView widgets may set their own cookies
            and collect usage data according to their privacy policy. We do not control
            TradingView&apos;s data practices.
          </p>
          <p className="mb-4">
            <strong>Privacy Policy:</strong>{" "}
            <a
              href="https://www.tradingview.com/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary"
            >
              https://www.tradingview.com/privacy-policy/
            </a>
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">4.5 Cloudflare</h3>
          <p className="mb-4">
            <strong>Purpose:</strong> Website hosting, content delivery network (CDN),
            and DDoS protection.
          </p>
          <p className="mb-4">
            <strong>Data Shared:</strong> IP addresses, browser information, and
            network request data for security and performance optimization.
          </p>
          <p className="mb-4">
            <strong>Privacy Policy:</strong>{" "}
            <a
              href="https://www.cloudflare.com/privacypolicy/"
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary"
            >
              https://www.cloudflare.com/privacypolicy/
            </a>
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. Data Retention</h2>
          <p className="mb-4">We retain your information for the following periods:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Account Data:</strong> Retained for the duration of your active
              account plus 90 days after account closure (for billing disputes and
              legal compliance).
            </li>
            <li>
              <strong>Usage Records:</strong> Daily AI question counts retained for
              current subscription period plus 1 year for analytics and dispute
              resolution.
            </li>
            <li>
              <strong>Transaction History:</strong> Retained for 7 years to comply with
              financial regulations and tax requirements.
            </li>
            <li>
              <strong>Cached Analysis Data:</strong> Automatically deleted after 24
              hours.
            </li>
            <li>
              <strong>Technical Logs:</strong> Retained for 90 days for security and
              troubleshooting purposes.
            </li>
          </ul>
          <p className="mb-4">
            Upon account deletion request, we will delete or anonymize your personal
            information within 30 days, except where retention is required by law or
            for legitimate business purposes (e.g., preventing fraud, enforcing
            agreements).
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">6. Data Security</h2>
          <p className="mb-4">
            We implement industry-standard security measures to protect your information:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Encryption:</strong> All data transmitted between your browser and
              our servers is encrypted using TLS/SSL. Database connections use encrypted
              channels.
            </li>
            <li>
              <strong>Authentication:</strong> Secure magic link authentication via
              Supabase with token-based session management.
            </li>
            <li>
              <strong>Access Controls:</strong> Strict access controls limit employee
              and contractor access to personal data on a need-to-know basis.
            </li>
            <li>
              <strong>Infrastructure Security:</strong> Our hosting providers (Supabase,
              Cloudflare) maintain SOC 2 Type II compliance and implement robust
              physical and network security measures.
            </li>
            <li>
              <strong>Regular Audits:</strong> We conduct regular security reviews and
              vulnerability assessments.
            </li>
          </ul>
          <p className="mb-4">
            While we take reasonable measures to protect your data, no method of
            transmission over the internet or electronic storage is 100% secure. We
            cannot guarantee absolute security of your information.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">7. Cookies and Tracking</h2>
          <p className="mb-4">
            We use cookies and similar tracking technologies to provide functionality
            and analyze usage:
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">7.1 Essential Cookies</h3>
          <p className="mb-4">
            Required for Service functionality: authentication tokens, session management,
            security features. These cannot be disabled without affecting Service
            functionality.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">7.2 Analytics Cookies</h3>
          <p className="mb-4">
            Help us understand how users interact with our Service to improve user
            experience and identify technical issues.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">7.3 Third-Party Cookies</h3>
          <p className="mb-4">
            TradingView widgets and other embedded content may set their own cookies.
            We do not control these third-party cookies.
          </p>

          <p className="mb-4">
            Most web browsers allow you to control cookies through their settings.
            However, disabling essential cookies will prevent you from using the Service.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">8. Children&apos;s Privacy</h2>
          <p className="mb-4">
            {config.appName} is not intended for use by individuals under 18 years of age.
            We do not knowingly collect personal information from children under 18.
            If you are a parent or guardian and believe your child has provided us with
            personal information, please contact us at support@chartiqs.com, and we
            will promptly delete such information from our systems.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">9. Your Rights</h2>
          <p className="mb-4">
            Depending on your jurisdiction, you may have the following rights regarding
            your personal information:
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">9.1 Access and Portability</h3>
          <p className="mb-4">
            You have the right to request a copy of the personal information we hold
            about you. We will provide this in a structured, commonly used, and
            machine-readable format.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">9.2 Correction</h3>
          <p className="mb-4">
            You can update your account information at any time through your account
            settings. You may also request correction of inaccurate data by contacting us.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">9.3 Deletion</h3>
          <p className="mb-4">
            You can request deletion of your account and associated personal data by
            contacting support@chartiqs.com. We will honor your request within 30 days,
            subject to legal retention requirements.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">9.4 Objection and Restriction</h3>
          <p className="mb-4">
            You may object to certain processing of your data or request restriction
            of processing in specific circumstances.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">9.5 Withdraw Consent</h3>
          <p className="mb-4">
            Where we process your data based on consent, you may withdraw that consent
            at any time. This will not affect the lawfulness of processing before
            withdrawal.
          </p>

          <p className="mb-4">
            To exercise any of these rights, please contact us at support@chartiqs.com.
            We will respond to your request within 30 days. We may need to verify your
            identity before processing your request.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">10. International Data Transfers</h2>
          <p className="mb-4">
            Your information may be transferred to and processed in countries other than
            your country of residence. These countries may have data protection laws
            that differ from your jurisdiction.
          </p>
          <p className="mb-4">
            Our service providers (Supabase, Google, Stripe, Cloudflare) operate globally
            and may process data in various regions including the United States, Europe,
            and Asia-Pacific. These providers implement appropriate safeguards such as
            Standard Contractual Clauses (SCCs) and comply with applicable data
            protection frameworks.
          </p>
          <p className="mb-4">
            By using our Service, you consent to the transfer of your information to
            countries outside your country of residence, including the United States,
            which may have different data protection rules.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">11. Do Not Track</h2>
          <p className="mb-4">
            Some browsers have a &quot;Do Not Track&quot; (DNT) feature that lets you tell
            websites you do not want to have your online activities tracked. We do not
            currently respond to DNT signals or similar mechanisms.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">12. Changes to This Privacy Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time to reflect changes in
            our practices, legal requirements, or Service features. When we make
            material changes, we will:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Update the &quot;Last Updated&quot; date at the top of this policy</li>
            <li>
              Notify you via email (if you have an account) or through a prominent
              notice on our Website
            </li>
            <li>
              For significant changes affecting your rights, we may require your
              renewed consent
            </li>
          </ul>
          <p className="mb-4">
            We encourage you to review this Privacy Policy periodically. Your continued
            use of the Service after changes become effective constitutes acceptance of
            the revised policy.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">13. California Privacy Rights</h2>
          <p className="mb-4">
            If you are a California resident, you have specific rights under the
            California Consumer Privacy Act (CCPA):
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Right to know what personal information is collected and how it is used</li>
            <li>Right to delete personal information</li>
            <li>Right to opt-out of the sale of personal information (we do not sell
              personal information)</li>
            <li>Right to non-discrimination for exercising your privacy rights</li>
          </ul>
          <p className="mb-4">
            To exercise these rights, contact us at support@chartiqs.com with
            &quot;California Privacy Rights&quot; in the subject line.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">14. European Union Users (GDPR)</h2>
          <p className="mb-4">
            If you are located in the European Economic Area (EEA), United Kingdom, or
            Switzerland, you have additional rights under the General Data Protection
            Regulation (GDPR):
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Right to access your personal data</li>
            <li>Right to rectify inaccurate personal data</li>
            <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
            <li>Right to restrict processing</li>
            <li>Right to data portability</li>
            <li>Right to object to processing</li>
            <li>Right to withdraw consent</li>
            <li>Right to lodge a complaint with your local supervisory authority</li>
          </ul>
          <p className="mb-4">
            Our legal basis for processing your personal data includes: (a) your
            consent, (b) performance of a contract with you, (c) compliance with legal
            obligations, and (d) our legitimate interests in providing and improving
            our Service.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">15. Contact Information</h2>
          <p className="mb-4">
            If you have any questions, concerns, or requests regarding this Privacy
            Policy or our data practices, please contact us:
          </p>
          <div className="bg-base-200 p-4 rounded-lg mb-6">
            <p className="mb-2">
              <strong>Email:</strong>{" "}
              <a href="mailto:support@chartiqs.com" className="link link-primary">
                support@chartiqs.com
              </a>
            </p>
            <p className="mb-2">
              <strong>Website:</strong>{" "}
              <a
                href="https://chartiqs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary"
              >
                https://chartiqs.com
              </a>
            </p>
            <p className="mb-2">
              <strong>Company:</strong>{" "}
              <a
                href="https://firetigerstudio.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary"
              >
                FireTigerStudio
              </a>
            </p>
            <p>
              <strong>Response Time:</strong> We will respond to privacy inquiries
              within 30 days.
            </p>
          </div>

          <div className="border-t border-base-300 pt-6 mt-8">
            <p className="text-sm text-base-content/70">
              By using {config.appName}, you acknowledge that you have read and understood
              this Privacy Policy and agree to its terms. This Privacy Policy is part
              of our Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
