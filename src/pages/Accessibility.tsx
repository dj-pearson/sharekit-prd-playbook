import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Mail, Phone, ExternalLink } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { organizationSchema } from "@/lib/structured-data";

export default function Accessibility() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-sky-100 dark:from-slate-900 dark:to-slate-800">
      <SEOHead
        title="Accessibility Statement"
        description="ShareKit is committed to ensuring digital accessibility for people with disabilities. Learn about our accessibility features, WCAG 2.1 AA compliance, and how to request accommodations."
        canonical="https://sharekit.net/accessibility"
        keywords={[
          'accessibility statement',
          'ADA compliance',
          'WCAG 2.1',
          'digital accessibility',
          'screen reader support',
          'keyboard navigation'
        ]}
        structuredData={[organizationSchema]}
      />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Back to Home
          </Button>
        </Link>

        <Card>
          <CardContent className="p-8 md:p-12">
            <h1 className="text-4xl font-bold mb-4">Accessibility Statement</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">Last Updated: January 12, 2026</p>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
              {/* Commitment Section */}
              <section aria-labelledby="commitment-heading">
                <h2 id="commitment-heading" className="text-2xl font-semibold mb-3">Our Commitment to Accessibility</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  ShareKit is committed to ensuring digital accessibility for people with disabilities. We are
                  continually improving the user experience for everyone and applying the relevant accessibility
                  standards to ensure we provide equal access to all users.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
                  We believe that the internet should be available and accessible to anyone, and are committed
                  to providing a website that is accessible to the widest possible audience, regardless of
                  circumstance and ability.
                </p>
              </section>

              {/* Conformance Status */}
              <section aria-labelledby="conformance-heading">
                <h2 id="conformance-heading" className="text-2xl font-semibold mb-3">Conformance Status</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and
                  developers to improve accessibility for people with disabilities. ShareKit strives to
                  conform to <strong>WCAG 2.1 Level AA</strong> standards.
                </p>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-200">Partially Conformant</p>
                      <p className="text-green-700 dark:text-green-300 text-sm">
                        ShareKit is partially conformant with WCAG 2.1 Level AA. Partially conformant means
                        that some parts of the content do not fully conform to the accessibility standard.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Accessibility Features */}
              <section aria-labelledby="features-heading">
                <h2 id="features-heading" className="text-2xl font-semibold mb-3">Accessibility Features</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  ShareKit includes the following accessibility features:
                </p>

                <h3 className="text-xl font-semibold mb-2 mt-4">Keyboard Navigation</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>All interactive elements are accessible via keyboard</li>
                  <li>Skip navigation links allow users to bypass repetitive content</li>
                  <li>Visible focus indicators on all focusable elements</li>
                  <li>Logical tab order throughout all pages</li>
                  <li>Keyboard shortcuts for common actions (press <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm">?</kbd> to view)</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">Screen Reader Support</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>Proper heading hierarchy (H1-H6) for easy navigation</li>
                  <li>ARIA landmarks to identify page regions</li>
                  <li>Descriptive link text and button labels</li>
                  <li>Alternative text for all meaningful images</li>
                  <li>Form labels properly associated with inputs</li>
                  <li>Error messages announced to screen readers</li>
                  <li>Live regions for dynamic content updates</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">Visual Accessibility</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>Color contrast ratios meet WCAG AA standards (minimum 4.5:1 for text)</li>
                  <li>Dark mode support for reduced eye strain</li>
                  <li>High contrast mode option available</li>
                  <li>Text can be resized up to 200% without loss of functionality</li>
                  <li>No content flashes more than 3 times per second</li>
                  <li>Information is not conveyed by color alone</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">Motor Accessibility</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>Large click/touch targets (minimum 44x44 pixels)</li>
                  <li>No time limits on completing actions</li>
                  <li>Reduced motion mode respects system preferences</li>
                  <li>Drag-and-drop alternatives available where applicable</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">Cognitive Accessibility</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>Clear and consistent navigation</li>
                  <li>Simple, plain language throughout</li>
                  <li>Error prevention and clear error messages</li>
                  <li>Consistent layout across pages</li>
                  <li>Help and documentation available</li>
                </ul>
              </section>

              {/* Assistive Technologies */}
              <section aria-labelledby="assistive-heading">
                <h2 id="assistive-heading" className="text-2xl font-semibold mb-3">Assistive Technologies</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  ShareKit is designed to be compatible with the following assistive technologies:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li><strong>Screen Readers:</strong> NVDA, JAWS, VoiceOver (macOS/iOS), TalkBack (Android)</li>
                  <li><strong>Voice Control:</strong> Dragon NaturallySpeaking, Voice Control (macOS/iOS)</li>
                  <li><strong>Screen Magnifiers:</strong> ZoomText, Windows Magnifier, macOS Zoom</li>
                  <li><strong>Alternative Input Devices:</strong> Switch devices, eye-tracking systems</li>
                </ul>
              </section>

              {/* Browser Support */}
              <section aria-labelledby="browser-heading">
                <h2 id="browser-heading" className="text-2xl font-semibold mb-3">Browser Compatibility</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  ShareKit is designed to work with the latest versions of:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>Google Chrome</li>
                  <li>Mozilla Firefox</li>
                  <li>Apple Safari</li>
                  <li>Microsoft Edge</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
                  We recommend using the most recent version of your browser for the best experience.
                </p>
              </section>

              {/* Known Limitations */}
              <section aria-labelledby="limitations-heading">
                <h2 id="limitations-heading" className="text-2xl font-semibold mb-3">Known Limitations</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Despite our best efforts, some limitations may exist:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li><strong>Third-party content:</strong> Some embedded content from third parties may not be fully accessible</li>
                  <li><strong>Legacy PDF documents:</strong> Older PDFs uploaded by users may not be fully accessible</li>
                  <li><strong>Complex data visualizations:</strong> Charts and graphs include text alternatives but may have limited interactivity</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
                  We are actively working to address these limitations and improve accessibility across all areas.
                </p>
              </section>

              {/* Accessibility Settings */}
              <section aria-labelledby="settings-heading">
                <h2 id="settings-heading" className="text-2xl font-semibold mb-3">Accessibility Settings</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  ShareKit provides several accessibility settings you can customize:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li><strong>Dark Mode:</strong> Reduces eye strain in low-light environments</li>
                  <li><strong>High Contrast Mode:</strong> Increases contrast for better visibility</li>
                  <li><strong>Reduced Motion:</strong> Minimizes animations and transitions</li>
                  <li><strong>Font Size:</strong> Text can be adjusted using browser settings</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
                  Access these settings from your account settings page or by using your browser/operating
                  system accessibility features.
                </p>
              </section>

              {/* Feedback */}
              <section aria-labelledby="feedback-heading">
                <h2 id="feedback-heading" className="text-2xl font-semibold mb-3">Feedback and Contact Information</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  We welcome your feedback on the accessibility of ShareKit. Please let us know if you
                  encounter accessibility barriers:
                </p>

                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a
                        href="mailto:accessibility@sharekit.net"
                        className="text-cyan-600 dark:text-cyan-400 hover:underline"
                      >
                        accessibility@sharekit.net
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-medium">Response Time</p>
                      <p className="text-slate-600 dark:text-slate-400">We aim to respond within 5 business days</p>
                    </div>
                  </div>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
                  When contacting us, please include:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>The web address (URL) of the content</li>
                  <li>The issue you encountered</li>
                  <li>The assistive technology you were using (if applicable)</li>
                  <li>Your contact information</li>
                </ul>
              </section>

              {/* Formal Complaints */}
              <section aria-labelledby="complaints-heading">
                <h2 id="complaints-heading" className="text-2xl font-semibold mb-3">Formal Complaints</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  If you are not satisfied with our response, you may file a complaint with the
                  U.S. Department of Justice, Civil Rights Division:
                </p>
                <div className="mt-4">
                  <a
                    href="https://www.ada.gov/file-a-complaint/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    ADA.gov - File a Complaint
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    <span className="sr-only">(opens in new tab)</span>
                  </a>
                </div>
              </section>

              {/* Technical Specifications */}
              <section aria-labelledby="technical-heading">
                <h2 id="technical-heading" className="text-2xl font-semibold mb-3">Technical Specifications</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Accessibility of ShareKit relies on the following technologies:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>HTML5</li>
                  <li>WAI-ARIA 1.2</li>
                  <li>CSS3</li>
                  <li>JavaScript (ECMAScript 2020+)</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
                  These technologies are relied upon for conformance with WCAG 2.1 Level AA.
                </p>
              </section>

              {/* Assessment Methods */}
              <section aria-labelledby="assessment-heading">
                <h2 id="assessment-heading" className="text-2xl font-semibold mb-3">Assessment Methods</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  ShareKit assesses accessibility through the following methods:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>Self-evaluation using automated testing tools (axe, WAVE, Lighthouse)</li>
                  <li>Manual testing with keyboard-only navigation</li>
                  <li>Testing with screen readers (VoiceOver, NVDA)</li>
                  <li>Color contrast analysis</li>
                  <li>User feedback and testing</li>
                </ul>
              </section>

              {/* Continuous Improvement */}
              <section aria-labelledby="improvement-heading">
                <h2 id="improvement-heading" className="text-2xl font-semibold mb-3">Continuous Improvement</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  We are committed to continuously improving the accessibility of ShareKit. Our ongoing
                  efforts include:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300 mt-4">
                  <li>Regular accessibility audits</li>
                  <li>Training for our development team on accessibility best practices</li>
                  <li>Including accessibility requirements in our development process</li>
                  <li>Engaging with users who have disabilities for feedback</li>
                  <li>Staying current with accessibility standards and guidelines</li>
                </ul>
              </section>

              {/* Legal Compliance */}
              <section aria-labelledby="legal-heading">
                <h2 id="legal-heading" className="text-2xl font-semibold mb-3">Legal Compliance</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  ShareKit strives to comply with the following accessibility laws and regulations:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300 mt-4">
                  <li><strong>Americans with Disabilities Act (ADA)</strong> - Title III</li>
                  <li><strong>Section 508</strong> of the Rehabilitation Act</li>
                  <li><strong>Web Content Accessibility Guidelines (WCAG) 2.1</strong> Level AA</li>
                  <li><strong>European Accessibility Act (EAA)</strong> where applicable</li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
