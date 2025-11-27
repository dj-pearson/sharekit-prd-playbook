import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { organizationSchema } from "@/lib/structured-data";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-sky-100">
      <SEOHead
        title="Terms of Service"
        description="Read ShareKit's Terms of Service. Understand your rights and responsibilities when using our digital resource sharing and lead magnet delivery platform."
        canonical="https://sharekit.net/terms"
        keywords={[
          'ShareKit terms of service',
          'terms and conditions',
          'user agreement',
          'platform policies'
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
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-slate-600 mb-8">Last Updated: November 11, 2025</p>

            <div className="prose prose-slate max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-3">Introduction</h2>
                <p className="text-slate-700 leading-relaxed">
                  Welcome to ShareKit. These Terms of Service ("Terms") govern your access to and use of the ShareKit platform, website, and services ("ShareKit" or the "Platform"). By signing up for an account or using ShareKit in any way, you agree to these Terms and to our Privacy Policy. If you do not agree, you must not use ShareKit. "You" refers to you as a user of the Platform (including both content creators and anyone accessing shared content), and "we" or "us" refers to the ShareKit service provider.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  ShareKit is a U.S.-based Software-as-a-Service platform that enables creators, coaches, and consultants to upload digital files (such as PDFs, guides, checklists) and share them via landing pages. Our aim is to help you deliver resources to your audience easily, while protecting us from legal liability related to user-uploaded content. Please read these Terms carefully to understand your rights and responsibilities.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Eligibility and Account Registration</h2>
                <h3 className="text-xl font-semibold mb-2 mt-4">Minimum Age</h3>
                <p className="text-slate-700 leading-relaxed">
                  You must be at least 13 years old to use ShareKit, and at least 18 (or the age of majority in your jurisdiction) to create an account or purchase any paid services. By using ShareKit, you represent that you meet these age requirements. We do not knowingly allow children under 13 to use the Platform or collect their personal data (see Privacy Policy for more details on Children's Privacy).
                </p>
                <h3 className="text-xl font-semibold mb-2 mt-4">Account Information</h3>
                <p className="text-slate-700 leading-relaxed">
                  When you register, you agree to provide truthful, current, and complete information. You are responsible for maintaining the confidentiality of your account login credentials and for all activities that occur under your account. Notify us immediately at support@sharekit.net if you suspect any unauthorized use of your account or security breach. You must not share your password or allow others to use your account. We are not liable for any loss or damage arising from your failure to protect your credentials.
                </p>
                <h3 className="text-xl font-semibold mb-2 mt-4">Account Use</h3>
                <p className="text-slate-700 leading-relaxed">
                  You agree to use ShareKit only for legitimate purposes. If you are using ShareKit on behalf of a company or organization, you represent that you have authority to bind that entity to these Terms. You are responsible for any activity on your account, whether or not authorized by you, until you close or report misuse of your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">User Content and Ownership</h2>
                <h3 className="text-xl font-semibold mb-2 mt-4">Your Content</h3>
                <p className="text-slate-700 leading-relaxed">
                  "User Content" means any content that you upload, transmit, or store on ShareKit, including but not limited to digital files, documents, text, images, and email communications you send through the Platform. You retain all rights to your User Content. We do not claim ownership of the content you provide to ShareKit. However, by uploading or sharing content on the Platform, you grant ShareKit a non-exclusive, worldwide, royalty-free license to host, store, reproduce, and distribute your content solely for the purpose of operating the service and fulfilling your requests (for example, to display your landing page and deliver your file to users who request it). This license ends when you delete the content from our servers, except to the extent it has been shared with others and they have not deleted it, or it has been stored as part of routine backups.
                </p>
                <h3 className="text-xl font-semibold mb-2 mt-4">Your Responsibility for Content</h3>
                <p className="text-slate-700 leading-relaxed">
                  You are solely responsible for all User Content that you upload or share via ShareKit. This means you must ensure your content and your use of the Platform comply with these Terms and all applicable laws. We do not routinely monitor or edit user-uploaded content, and we are not responsible for its appropriateness, legality, or accuracy. However, we reserve the right to remove or disable access to any content at our discretion if we believe it violates these Terms, our Acceptable Use Policy, or the law. We also may suspend or terminate accounts associated with such content. You understand that any content you share through ShareKit may be viewed or downloaded by others with whom you share your landing page link. ShareKit is not responsible for what recipients do with the content you provide.
                </p>
                <h3 className="text-xl font-semibold mb-2 mt-4">Prohibited Content and Activities</h3>
                <p className="text-slate-700 leading-relaxed mb-3">
                  You agree not to use ShareKit for any improper or unlawful purposes. Specifically (and without limitation), you must not upload, share, or use the service to distribute any content that:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Infringes or violates the intellectual property rights or other rights of any person or entity (including content to which you do not hold the necessary rights or licenses).</li>
                  <li>Contains viruses, malware, or any code intended to harm or disrupt the software, hardware, or security of ShareKit or any user.</li>
                  <li>Is illegal, abusive, harassing, threatening, defamatory, obscene, pornographic (including any content involving minors, which is strictly prohibited), or otherwise objectionable or harmful (for example, hate speech or content that incites violence).</li>
                  <li>Violates privacy or data protection rights of others, such as by disclosing personal information of individuals without consent.</li>
                  <li>Constitutes unauthorized advertising, junk mail, spam, chain letters, pyramid schemes, or any other form of solicitation. You may not use ShareKit's email delivery features to send unsolicited bulk emails or communications that violate the CAN-SPAM Act.</li>
                  <li>Attempts to impersonate any person or entity, or falsely states or misrepresents your identity or affiliation.</li>
                  <li>Attempts to gain unauthorized access to ShareKit, our systems, or other users' accounts or data, or to probe, scan, or test the vulnerability of any system or network related to the Platform.</li>
                  <li>Attempts to reverse engineer, decompile, or extract our source code, or to circumvent any security or access controls of ShareKit.</li>
                  <li>Uses ShareKit in a manner that could interfere with, disrupt, or create undue burden on the Platform or the networks or services connected to the Platform.</li>
                </ul>
                <p className="text-slate-700 leading-relaxed mt-3">
                  These examples are further detailed in our Acceptable Use Policy, which is incorporated into these Terms by reference. Violation of any of the above may result in immediate suspension or termination of your account, removal of prohibited content, and potential legal action where appropriate.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Acceptable Use Policy</h2>
                <p className="text-slate-700 leading-relaxed">
                  Our Acceptable Use Policy provides a comprehensive list of allowed and disallowed activities on ShareKit. By using ShareKit, you agree to abide by the rules outlined in that policy at all times. We have a zero-tolerance stance toward harmful or unlawful content and activities. If you witness or experience any content or behavior that violates our policies, please report it as described under "Content Reporting" below.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Content Reporting and Enforcement</h2>
                <h3 className="text-xl font-semibold mb-2 mt-4">Reporting Violations</h3>
                <p className="text-slate-700 leading-relaxed">
                  ShareKit takes the integrity of the Platform seriously. If you discover content that you believe violates these Terms, the Acceptable Use Policy, or is otherwise illegal or harmful, please notify us immediately. You can report abuse by emailing abuse@sharekit.net or support@sharekit.net with a description of the issue and a link to the content or user in question. We have a mechanism to review and respond to such reports promptly.
                </p>
                <h3 className="text-xl font-semibold mb-2 mt-4">Our Response</h3>
                <p className="text-slate-700 leading-relaxed">
                  We reserve the right to investigate any alleged violation of these Terms or our policies. We may remove or disable access to any content or accounts that we find violate our rules or applicable law. In serious cases (such as content involving child exploitation or threats of violence), we may report the matter to law enforcement. We are not required to return removed content to you. If your content is removed or your account is suspended/terminated, we will, where reasonably possible, notify you of the action and the reason (unless the notification is prohibited by law or we determine in our good faith that doing so could result in legal liability or harm to others).
                </p>
                <h3 className="text-xl font-semibold mb-2 mt-4">No Pre-Screening</h3>
                <p className="text-slate-700 leading-relaxed">
                  ShareKit is a platform for user-generated content. As such, we generally do not pre-screen content before it is posted. We rely on users to adhere to these Terms and on community reporting to flag issues. You acknowledge that there may be content accessible through ShareKit that you find offensive or that violates your rights. Use caution and discretion when accessing content through shared links. We are not liable for content provided by users, but we will act to remove infringing or violating content once we are aware of it.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Intellectual Property Rights</h2>
                <h3 className="text-xl font-semibold mb-2 mt-4">ShareKit's Intellectual Property</h3>
                <p className="text-slate-700 leading-relaxed">
                  Apart from your content, all other materials on the Platform, including the ShareKit name, logos, trademarks, branding, software code, and design, are owned by or licensed to us and are protected by intellectual property laws. We grant you a limited, revocable, non-exclusive, non-transferable license to use the Platform and any provided tools or software as intended for your personal or internal business use. You may not copy, modify, distribute, sell, or lease any part of our intellectual property, nor may you reverse engineer or attempt to extract our source code, except as permitted by law. Any feedback or suggestions you provide regarding ShareKit may be used by us without obligation to you.
                </p>
                <h3 className="text-xl font-semibold mb-2 mt-4">Your Intellectual Property</h3>
                <p className="text-slate-700 leading-relaxed">
                  You must only upload content that you have the right to share. By uploading content, you represent and warrant that you own or have obtained all necessary rights, licenses, consents, and permissions to lawfully share the content and to grant us the limited license above. You also promise that your content and the sharing of it via ShareKit will not violate any third-party rights (including copyrights, trademarks, privacy, or publicity rights) or any laws. You agree to indemnify us (meaning you will defend and hold us harmless) for any costs, claims, or liabilities arising from your content. This means if your content causes a legal dispute, you will be responsible for the costs and damages we suffer due to that dispute.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">DMCA Copyright Policy</h2>
                <p className="text-slate-700 leading-relaxed">
                  We respect copyright law and expect you to do the same. If you believe that content on ShareKit infringes your copyright, you (or your agent) may send us a DMCA Takedown Notice. Our separate{" "}
                  <Link to="/dmca" className="text-cyan-600 hover:underline">
                    DMCA Policy
                  </Link>{" "}
                  provides instructions on how to submit a proper notice under the Digital Millennium Copyright Act. Upon receiving a valid DMCA notice, we will expeditiously remove or disable access to the allegedly infringing content and notify the user who posted it. That user then has the option to send us a Counter Notification if they believe a takedown was mistaken. We will follow the DMCA's procedures for such counter notices, including restoring content if appropriate after 10 business days, unless the original complainant informs us they have filed a court action. Repeat copyright infringers will have their accounts terminated in appropriate circumstances. Please refer to the DMCA Policy for full details.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Privacy and Data Protection</h2>
                <p className="text-slate-700 leading-relaxed">
                  Your privacy is very important to us. Our{" "}
                  <Link to="/privacy" className="text-cyan-600 hover:underline">
                    Privacy Policy
                  </Link>{" "}
                  explains what personal information we collect from you and your end-users, and how we use, share, and protect it. By using ShareKit, you acknowledge that you have read the Privacy Policy and agree to ShareKit's data practices. In particular, if you are a content creator using ShareKit to collect email addresses or other data from people who request your content, you agree to handle that data lawfully. This includes complying with privacy laws (such as the CCPA and GDPR) when you export, use, or otherwise process the personal data of your subscribers. You should only email or contact people who have given you consent to do so, and you must provide a clear way for them to unsubscribe from future emails.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Payments, Subscriptions, and Refunds</h2>
                <h3 className="text-xl font-semibold mb-2 mt-4">Fees and Billing</h3>
                <p className="text-slate-700 leading-relaxed">
                  ShareKit may offer both free and paid subscription plans. If you subscribe to a paid plan, you agree to pay all applicable fees, which will be charged on a periodic basis (e.g., monthly or annually) as described at the time of purchase. Prices are stated in U.S. dollars unless otherwise specified. You authorize ShareKit (or our third-party payment processor, such as Stripe) to charge your provided payment method for the recurring subscription fee and any other applicable charges. If your payment fails or cannot be processed, we may suspend or cancel your access to paid features.
                </p>
                <h3 className="text-xl font-semibold mb-2 mt-4">Automatic Renewal</h3>
                <p className="text-slate-700 leading-relaxed">
                  Unless otherwise noted, subscriptions will automatically renew at the end of each billing cycle (monthly or annually) at the then-current rate, unless you cancel beforehand. You can cancel renewal by visiting your account settings or contacting support. If you cancel, you will retain access to paid features until the end of your current paid term, and your subscription will not renew thereafter.
                </p>
                <h3 className="text-xl font-semibold mb-2 mt-4">Refund Policy</h3>
                <p className="text-slate-700 leading-relaxed">
                  Payments are generally non-refundable. We provide digital services that begin immediately upon purchase, so we do not typically offer refunds for subscription fees already paid. However, we want you to be satisfied with ShareKit, so if you believe there has been a billing error or you are unsatisfied due to a technical issue on our part, please contact us at billing@sharekit.net. In some cases, at our sole discretion, we may provide a pro rata refund or credit.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Transactions Between Creators and End Users</h2>
                <p className="text-slate-700 leading-relaxed">
                  ShareKit's role is to provide the platform for sharing digital content. If you (a creator) offer content (whether free or paid) to end users via ShareKit, any relationship or transaction that arises is solely between you and the end user. ShareKit is not a party to any sale or contract between you and those who download or receive your content. Content creators are responsible for setting their own terms with their customers. ShareKit does not control, guarantee, or assume responsibility for the quality, legality, or delivery of user-offered content beyond providing the technical service. We do not mediate disputes between you and your customers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Disclaimers of Warranties</h2>
                <p className="text-slate-700 leading-relaxed">
                  ShareKit is provided on an "AS IS" and "AS AVAILABLE" basis. While we strive to provide a great service, we make no warranties or guarantees that ShareKit will be uninterrupted, error-free, or secure, or that it will meet your expectations or requirements. Use of the Platform is at your own risk. To the fullest extent permitted by law, ShareKit disclaims all warranties and conditions, whether express, implied, or statutory, including but not limited to any implied warranties of title, non-infringement, merchantability, fitness for a particular purpose, accuracy, or availability. We do not guarantee that any content (including your User Content) will be preserved or maintained without loss.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Limitation of Liability</h2>
                <p className="text-slate-700 leading-relaxed">
                  To the maximum extent permitted by law, in no event will ShareKit or its founders, owners, employees, affiliates, or partners be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of (or inability to use) the Platform or any content on the Platform. This includes, without limitation, damages for loss of profits, loss of data, business interruption, computer damage, or other intangible losses, even if we have been advised of the possibility of such damages.
                </p>
                <p className="text-slate-700 leading-relaxed mt-3">
                  <strong>Cap on Liability:</strong> To the extent permitted by law, our total liability to you for any claim arising from or related to the use of ShareKit is limited to the amount you have paid to us for the service in the 12 months immediately preceding the event giving rise to the liability, or $100 USD, whichever is greater. If you have paid us nothing, our total liability shall not exceed $100. This overall cap applies to all claims of any kind, whether based in contract, tort, or any other legal theory.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Indemnification</h2>
                <p className="text-slate-700 leading-relaxed">
                  You agree to indemnify, defend, and hold harmless ShareKit and its officers, directors, employees, and agents, from and against any and all claims, liabilities, damages, losses, and expenses (including reasonable attorneys' fees and costs) arising out of or in any way connected with: (a) your access to or use of the Platform, (b) your User Content, (c) your violation of any of these Terms or any policy incorporated into these Terms, or (d) your violation of any law or the rights of any third party. This means that if a third party brings a claim against ShareKit related to your content or your use of the service, you will be responsible for any costs or damages we incur.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Termination of Service</h2>
                <h3 className="text-xl font-semibold mb-2 mt-4">By You</h3>
                <p className="text-slate-700 leading-relaxed">
                  You may stop using ShareKit at any time. You may also delete your account by following the instructions in your account settings or contacting us at support@sharekit.net. Deleting your account will generally remove your profile and content from the Platform, but note that content you shared publicly or with others may continue to exist.
                </p>
                <h3 className="text-xl font-semibold mb-2 mt-4">By Us</h3>
                <p className="text-slate-700 leading-relaxed">
                  We may suspend or terminate your access to ShareKit (or terminate these Terms with respect to you) at any time, with or without cause, and with or without notice. However, if we terminate your account without cause, we will typically provide a pro-rated refund of any prepaid subscription fees covering the remaining period (if applicable). Termination for cause will not require any refund.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Governing Law and Dispute Resolution</h2>
                <p className="text-slate-700 leading-relaxed">
                  These Terms and any dispute arising out of or relating to these Terms or your use of ShareKit will be governed by and construed in accordance with the laws of the United States and the laws of the State of Delaware, without regard to its conflict of law principles. You agree that any legal action or proceeding arising under these Terms will be brought exclusively in the federal or state courts located in the State of Delaware, USA, and you consent to the personal jurisdiction of those courts.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Changes to These Terms</h2>
                <p className="text-slate-700 leading-relaxed">
                  We may update or modify these Terms from time to time. If we make material changes, we will notify you by email (to the address associated with your account) or by posting a notice on our website or within the Platform. By continuing to use ShareKit after any changes to the Terms become effective, you agree to be bound by the revised Terms. If you do not agree to the updated Terms, you must stop using the Platform before the changes take effect.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Miscellaneous</h2>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li><strong>Entire Agreement:</strong> These Terms (along with the Privacy Policy, Acceptable Use Policy, and any other policies or guidelines we link to or incorporate by reference) constitute the entire agreement between you and ShareKit regarding your use of the Platform.</li>
                  <li><strong>Severability:</strong> If any provision of these Terms is held to be invalid or unenforceable by a court of competent jurisdiction, that provision will be enforced to the maximum extent permissible and the remaining provisions of these Terms will remain in full force and effect.</li>
                  <li><strong>No Waiver:</strong> Our failure to enforce any right or provision of these Terms does not constitute a waiver of future enforcement of that right or provision.</li>
                  <li><strong>Assignment:</strong> You may not assign or transfer these Terms without our prior written consent. We may assign these Terms to an affiliate or in connection with a merger, acquisition, reorganization, or sale of assets.</li>
                  <li><strong>Force Majeure:</strong> ShareKit will not be liable for any delay or failure to perform its obligations resulting from causes outside its reasonable control.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Contact Information</h2>
                <p className="text-slate-700 leading-relaxed">
                  If you have any questions, concerns, or feedback about these Terms or the ShareKit Platform, please contact us:
                </p>
                <p className="text-slate-700 leading-relaxed">
                  <strong>Email:</strong> support@sharekit.net
                </p>
                <p className="text-slate-700 leading-relaxed">
                  By using the Platform, you acknowledge that you have read and understood these Terms of Service, and you agree to be bound by them. Thank you for choosing ShareKit!
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
