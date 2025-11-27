import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { organizationSchema } from "@/lib/structured-data";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-sky-100">
      <SEOHead
        title="Privacy Policy"
        description="Learn how ShareKit collects, uses, and protects your data. Our privacy policy covers GDPR compliance, data retention, cookies, and your privacy rights."
        canonical="https://sharekit.net/privacy"
        keywords={[
          'ShareKit privacy policy',
          'data protection',
          'GDPR compliance',
          'privacy rights',
          'data security'
        ]}
        structuredData={[organizationSchema]}
      />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card>
          <CardContent className="p-8 md:p-12">
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-slate-600 mb-8">Last Updated: November 11, 2025</p>

            <div className="prose prose-slate max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
                <p className="text-slate-700 leading-relaxed">
                  ShareKit ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
                  explains how we collect, use, disclose, and safeguard your information when you use our
                  platform.
                </p>
                <p className="text-slate-700 leading-relaxed mt-3">
                  By using ShareKit, you agree to the collection and use of information in accordance with
                  this policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>

                <h3 className="text-xl font-semibold mb-2 mt-4">2.1 Information You Provide</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li><strong>Account Information:</strong> Email address, full name, password (encrypted)</li>
                  <li><strong>Profile Data:</strong> Display name, avatar, website URL, bio</li>
                  <li><strong>Payment Information:</strong> Billing details processed by Stripe (we do not store full credit card numbers)</li>
                  <li><strong>Content:</strong> Resources you upload (PDFs, documents), page content, custom CSS</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">2.2 Information We Collect Automatically</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li><strong>Usage Data:</strong> Page views, clicks, time spent on pages</li>
                  <li><strong>Device Information:</strong> Browser type, IP address, device type</li>
                  <li><strong>Analytics:</strong> Signup rates, download counts, traffic sources</li>
                  <li><strong>Cookies:</strong> Essential cookies for authentication and preferences</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">2.3 Information from Your Users</h3>
                <p className="text-slate-700 leading-relaxed">
                  When someone downloads a resource from your share page, we collect:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Email address</li>
                  <li>Full name (if provided)</li>
                  <li>IP address (for analytics and security)</li>
                  <li>Download timestamp</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
                <p className="text-slate-700 leading-relaxed mb-3">We use your information to:</p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li><strong>Provide the Service:</strong> Deliver resources, send emails, manage your account</li>
                  <li><strong>Process Payments:</strong> Handle subscriptions and billing</li>
                  <li><strong>Analytics:</strong> Show you how your pages are performing</li>
                  <li><strong>Communication:</strong> Send transactional emails (download confirmations, receipts)</li>
                  <li><strong>Improvements:</strong> Improve our platform and fix bugs</li>
                  <li><strong>Security:</strong> Detect and prevent fraud, spam, and abuse</li>
                  <li><strong>Legal:</strong> Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">4. How We Share Your Information</h2>
                <p className="text-slate-700 leading-relaxed mb-3">
                  We do NOT sell your personal information. We may share your data with:
                </p>

                <h3 className="text-xl font-semibold mb-2 mt-4">4.1 Service Providers</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li><strong>Supabase:</strong> Database and authentication (data stored in USA)</li>
                  <li><strong>Resend:</strong> Email delivery service</li>
                  <li><strong>Stripe:</strong> Payment processing</li>
                  <li><strong>Cloudflare:</strong> CDN and security</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">4.2 Legal Requirements</h3>
                <p className="text-slate-700 leading-relaxed">
                  We may disclose your information if required by law, court order, or to protect our rights
                  and safety.
                </p>

                <h3 className="text-xl font-semibold mb-2 mt-4">4.3 Business Transfers</h3>
                <p className="text-slate-700 leading-relaxed">
                  If ShareKit is acquired or merged, your information may be transferred to the new owners.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">5. Your Privacy Rights</h2>
                <p className="text-slate-700 leading-relaxed mb-3">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li><strong>Access:</strong> Request a copy of your data</li>
                  <li><strong>Rectification:</strong> Correct inaccurate data</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                  <li><strong>Export:</strong> Download your data in CSV format</li>
                  <li><strong>Objection:</strong> Object to processing of your data</li>
                  <li><strong>Portability:</strong> Transfer your data to another service</li>
                </ul>
                <p className="text-slate-700 leading-relaxed mt-3">
                  To exercise these rights, contact us at{" "}
                  <a href="mailto:privacy@sharekit.net" className="text-cyan-600 hover:underline">
                    privacy@sharekit.net
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">6. GDPR Compliance (EU Users)</h2>
                <p className="text-slate-700 leading-relaxed">
                  If you are in the European Economic Area (EEA), we process your data based on:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li><strong>Consent:</strong> You explicitly agreed to data collection (e.g., email signups)</li>
                  <li><strong>Contract:</strong> Necessary to provide the Service</li>
                  <li><strong>Legitimate Interest:</strong> Analytics, security, service improvements</li>
                  <li><strong>Legal Obligation:</strong> Compliance with laws</li>
                </ul>
                <p className="text-slate-700 leading-relaxed mt-3">
                  You have additional rights under GDPR, including the right to lodge a complaint with your
                  local data protection authority.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">7. Data Retention</h2>
                <p className="text-slate-700 leading-relaxed">
                  We retain your data as long as your account is active or as needed to provide services.
                  When you delete your account:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Your profile and resources are deleted within 30 days</li>
                  <li>Email captures from your pages are anonymized (email addresses removed)</li>
                  <li>Analytics data is aggregated and de-identified</li>
                  <li>Billing records are retained for 7 years for tax compliance</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">8. Data Security</h2>
                <p className="text-slate-700 leading-relaxed">
                  We implement industry-standard security measures:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Encrypted data transmission (HTTPS/TLS)</li>
                  <li>Encrypted passwords (bcrypt hashing)</li>
                  <li>Row-level security on databases</li>
                  <li>Regular security audits</li>
                  <li>DDoS protection via Cloudflare</li>
                </ul>
                <p className="text-slate-700 leading-relaxed mt-3">
                  However, no method of transmission over the Internet is 100% secure. We cannot guarantee
                  absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">9. Cookies Policy</h2>
                <p className="text-slate-700 leading-relaxed mb-3">
                  We use cookies to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li><strong>Essential Cookies:</strong> Authentication, security (cannot be disabled)</li>
                  <li><strong>Analytics Cookies:</strong> Privacy-friendly analytics via Plausible (no personal data)</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings</li>
                </ul>
                <p className="text-slate-700 leading-relaxed mt-3">
                  We do NOT use third-party advertising or tracking cookies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">10. Third-Party Links</h2>
                <p className="text-slate-700 leading-relaxed">
                  Our Service may contain links to third-party websites. We are not responsible for their
                  privacy practices. Please review their privacy policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">11. Children's Privacy</h2>
                <p className="text-slate-700 leading-relaxed">
                  ShareKit is not intended for children under 16. We do not knowingly collect data from
                  children. If you are a parent and believe your child provided us data, contact us to
                  delete it.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">12. Changes to This Policy</h2>
                <p className="text-slate-700 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of significant
                  changes via email or a notice on the Service. The "Last Updated" date will always reflect
                  the current version.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">13. Contact Us</h2>
                <p className="text-slate-700 leading-relaxed">
                  For privacy-related questions or to exercise your rights, contact us at:
                </p>
                <p className="text-slate-700 leading-relaxed mt-2">
                  <strong>Email:</strong>{" "}
                  <a href="mailto:privacy@sharekit.net" className="text-cyan-600 hover:underline">
                    privacy@sharekit.net
                  </a>
                </p>
                <p className="text-slate-700 leading-relaxed">
                  <strong>Response Time:</strong> We will respond to your request within 30 days.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">14. Data Protection Officer</h2>
                <p className="text-slate-700 leading-relaxed">
                  For GDPR-related inquiries, you can contact our Data Protection Officer at:
                </p>
                <p className="text-slate-700 leading-relaxed">
                  <strong>Email:</strong> dpo@sharekit.net
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
