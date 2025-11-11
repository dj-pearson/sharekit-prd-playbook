import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-sky-100">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card>
          <CardContent className="p-8 md:p-12">
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-slate-600 mb-8">Last Updated: November 11, 2025</p>

            <div className="prose prose-slate max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="text-slate-700 leading-relaxed">
                  By accessing and using ShareKit ("the Service"), you accept and agree to be bound by the
                  terms and provision of this agreement. If you do not agree to these terms, please do not
                  use the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">2. Description of Service</h2>
                <p className="text-slate-700 leading-relaxed">
                  ShareKit provides a platform that enables creators, coaches, and consultants to share
                  digital resources (PDFs, documents, guides) through customizable landing pages that
                  capture emails and deliver content automatically.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">3. User Responsibilities</h2>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>You are responsible for all content you upload to ShareKit</li>
                  <li>You must own or have proper licenses for all resources you share</li>
                  <li>You agree not to use the Service for spam, illegal content, or malicious purposes</li>
                  <li>You will not upload content that infringes copyright, trademark, or other intellectual property rights</li>
                  <li>You will not distribute malware, viruses, or harmful code through the Service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">4. Acceptable Use Policy</h2>
                <p className="text-slate-700 leading-relaxed mb-3">
                  You agree NOT to use ShareKit for:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Sending unsolicited mass emails (spam)</li>
                  <li>Sharing illegal, harmful, or offensive content</li>
                  <li>Impersonating others or misrepresenting your identity</li>
                  <li>Violating any applicable laws or regulations</li>
                  <li>Attempting to gain unauthorized access to the Service or other users' accounts</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">5. Service Limitations</h2>
                <p className="text-slate-700 leading-relaxed">
                  ShareKit provides the Service on an "as is" and "as available" basis. We do not guarantee:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>100% uptime or uninterrupted access</li>
                  <li>That the Service will be error-free or secure</li>
                  <li>That all emails will be delivered successfully</li>
                  <li>That your data will be immune to loss or corruption</li>
                </ul>
                <p className="text-slate-700 leading-relaxed mt-3">
                  We recommend maintaining backups of your important resources.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">6. Payment and Refunds</h2>
                <p className="text-slate-700 leading-relaxed">
                  <strong>Free Plan:</strong> Available at no cost with limited features.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  <strong>Paid Plans:</strong> Billed monthly or annually. Prices are subject to change with
                  30 days notice.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  <strong>Refund Policy:</strong> We offer a 7-day money-back guarantee for new subscriptions.
                  No questions asked. Refunds are prorated for annual plans canceled within 30 days. No
                  refunds after 30 days of active use.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">7. Account Termination</h2>
                <p className="text-slate-700 leading-relaxed">
                  We reserve the right to suspend or terminate your account if you:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Violate these Terms of Service</li>
                  <li>Engage in fraudulent or illegal activity</li>
                  <li>Abuse the Service or negatively impact other users</li>
                  <li>Fail to pay for your subscription</li>
                </ul>
                <p className="text-slate-700 leading-relaxed mt-3">
                  You may cancel your account at any time from your account settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">8. Intellectual Property</h2>
                <p className="text-slate-700 leading-relaxed">
                  <strong>Your Content:</strong> You retain all rights to the content you upload. By using
                  ShareKit, you grant us a limited license to store, process, and deliver your content to
                  your users.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  <strong>Our Content:</strong> ShareKit's logo, brand, design, and code are protected by
                  copyright and trademark law. You may not copy, modify, or distribute our intellectual property
                  without permission.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">9. Limitation of Liability</h2>
                <p className="text-slate-700 leading-relaxed">
                  ShareKit and its affiliates will not be liable for:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Any indirect, incidental, or consequential damages</li>
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Damages resulting from unauthorized access to your account</li>
                  <li>Issues caused by third-party services (email providers, storage, etc.)</li>
                </ul>
                <p className="text-slate-700 leading-relaxed mt-3">
                  Our total liability is limited to the amount you paid us in the past 12 months.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">10. Privacy</h2>
                <p className="text-slate-700 leading-relaxed">
                  Your privacy is important to us. Please review our{" "}
                  <Link to="/privacy" className="text-cyan-600 hover:underline">
                    Privacy Policy
                  </Link>{" "}
                  to understand how we collect, use, and protect your data.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">11. Dispute Resolution</h2>
                <p className="text-slate-700 leading-relaxed">
                  Any disputes arising from these Terms will be resolved through good-faith negotiation.
                  If negotiation fails, disputes will be governed by the laws of the United States and
                  resolved in the appropriate courts.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">12. Changes to Terms</h2>
                <p className="text-slate-700 leading-relaxed">
                  We may update these Terms from time to time. We will notify you of significant changes
                  via email or through the Service. Continued use of ShareKit after changes constitutes
                  acceptance of the new Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">13. Contact Us</h2>
                <p className="text-slate-700 leading-relaxed">
                  If you have questions about these Terms, please contact us at:
                </p>
                <p className="text-slate-700 leading-relaxed">
                  <strong>Email:</strong> legal@sharekit.net
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
