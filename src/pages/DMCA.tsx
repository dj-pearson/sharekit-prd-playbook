import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function DMCA() {
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
            <h1 className="text-4xl font-bold mb-4">Digital Millennium Copyright Act Policy</h1>
            <p className="text-slate-600 mb-8">Last Updated: November 11, 2025</p>

            <div className="prose prose-slate max-w-none space-y-6">
              <section>
                <p className="text-slate-700 leading-relaxed">
                  ShareKit respects intellectual property rights and complies with the Digital Millennium Copyright Act (17 U.S.C. § 512). We terminate accounts of repeat infringers in appropriate circumstances.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">DMCA Designated Agent</h2>
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <p className="text-slate-700 leading-relaxed mb-2">
                    <strong>Company:</strong> Pearson Media LLC
                  </p>
                  <p className="text-slate-700 leading-relaxed mb-2">
                    <strong>DMCA Registration Number:</strong> DMCA-1065636
                  </p>
                  <p className="text-slate-700 leading-relaxed mb-2">
                    <strong>Copyright Agent:</strong> Dan Pearson
                  </p>
                  <p className="text-slate-700 leading-relaxed mb-2">
                    <strong>Email:</strong> copyright@sharekit.net
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    <strong>Platform:</strong> ShareKit
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Filing a Takedown Notice</h2>
                <p className="text-slate-700 leading-relaxed mb-3">
                  To report copyright infringement, provide our Copyright Agent with:
                </p>
                <ol className="list-decimal pl-6 space-y-2 text-slate-700">
                  <li>Physical or electronic signature of the copyright owner or authorized agent</li>
                  <li>Identification of the copyrighted work claimed to be infringed</li>
                  <li>Identification of the infringing material with specific URLs and file locations</li>
                  <li>Your contact information (name, address, telephone, email)</li>
                  <li>Statement of good faith belief that use is unauthorized</li>
                  <li>Statement under penalty of perjury that information is accurate and you are authorized to act on behalf of the copyright owner</li>
                </ol>
                <p className="text-slate-700 leading-relaxed mt-3">
                  Send notices to <a href="mailto:copyright@sharekit.net" className="text-cyan-600 hover:underline">copyright@sharekit.net</a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Response to Notices</h2>
                <p className="text-slate-700 leading-relaxed mb-3">
                  Upon receiving a valid notice, we will:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Remove or disable access to allegedly infringing material within 24-48 hours</li>
                  <li>Notify the creator who posted the material</li>
                  <li>Maintain records of all notifications</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Counter-Notification Procedure</h2>
                <p className="text-slate-700 leading-relaxed mb-3">
                  If you believe content was removed in error, submit a counter-notification with:
                </p>
                <ol className="list-decimal pl-6 space-y-2 text-slate-700">
                  <li>Your physical or electronic signature</li>
                  <li>Identification of removed material and its prior location</li>
                  <li>Statement under penalty of perjury of good faith belief in mistake or misidentification</li>
                  <li>Your name, address, and telephone number</li>
                  <li>Consent to federal district court jurisdiction</li>
                  <li>Agreement to accept service of process from the original complainant</li>
                </ol>
                <p className="text-slate-700 leading-relaxed mt-3">
                  We will forward counter-notifications to the original complainant. If no court action is filed within 10-14 business days, we may restore the content.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Repeat Infringer Policy</h2>
                <p className="text-slate-700 leading-relaxed mb-3">
                  ShareKit tracks all infringement notices and terminates accounts that:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Receive three substantiated infringement notices</li>
                  <li>Demonstrate patterns of uploading infringing content</li>
                  <li>Fail to respond appropriately to notices</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">False Statements</h2>
                <p className="text-slate-700 leading-relaxed">
                  Under 17 U.S.C. § 512(f), you may be liable for damages including costs and attorneys' fees if you knowingly misrepresent that material is infringing or was removed by mistake.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Contact Information</h2>
                <p className="text-slate-700 leading-relaxed">
                  For DMCA-related inquiries, please contact our designated Copyright Agent at <a href="mailto:copyright@sharekit.net" className="text-cyan-600 hover:underline">copyright@sharekit.net</a>
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
