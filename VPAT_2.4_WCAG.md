# Voluntary Product Accessibility Template (VPAT)
## WCAG 2.1 Edition

**Product Name:** ShareKit
**Product Version:** Current Production
**Report Date:** January 2026
**Contact Information:** support@sharekit.net
**Evaluation Methods Used:** Manual testing, automated scanning, assistive technology testing

---

## Applicable Standards/Guidelines

This report covers the degree of conformance for the following accessibility standard/guidelines:

| Standard/Guideline | Included in Report |
|--------------------|-------------------|
| Web Content Accessibility Guidelines 2.1 | Level A: Yes |
| | Level AA: Yes |
| | Level AAA: No |

---

## Terms

The terms used in the Conformance Level information are defined as follows:

- **Supports:** The functionality of the product has at least one method that meets the criterion without known defects or meets with equivalent facilitation.
- **Partially Supports:** Some functionality of the product does not meet the criterion.
- **Does Not Support:** The majority of product functionality does not meet the criterion.
- **Not Applicable:** The criterion is not relevant to the product.
- **Not Evaluated:** The product has not been evaluated against the criterion.

---

## WCAG 2.1 Report

### Table 1: Success Criteria, Level A

| Criteria | Conformance Level | Remarks and Explanations |
|----------|-------------------|--------------------------|
| **1.1.1 Non-text Content** | Supports | All images have alt text via AccessibleImage component. Decorative images marked with aria-hidden. Form controls have labels. Icons use aria-hidden when accompanied by text. |
| **1.2.1 Audio-only and Video-only (Prerecorded)** | Not Applicable | Product does not include prerecorded audio-only or video-only content. |
| **1.2.2 Captions (Prerecorded)** | Not Applicable | Product does not include prerecorded audio content in synchronized media. |
| **1.2.3 Audio Description or Media Alternative (Prerecorded)** | Not Applicable | Product does not include prerecorded video content. |
| **1.3.1 Info and Relationships** | Supports | Semantic HTML5 used throughout. ARIA landmarks implemented. Form labels properly associated. Tables use proper markup. Heading hierarchy maintained. |
| **1.3.2 Meaningful Sequence** | Supports | DOM order matches visual presentation. Reading order is logical. |
| **1.3.3 Sensory Characteristics** | Supports | Instructions do not rely solely on sensory characteristics. Error messages use text and icons. |
| **1.4.1 Use of Color** | Supports | Color is never the sole means of conveying information. Links are distinguishable. Status indicators use text/icons. |
| **1.4.2 Audio Control** | Not Applicable | No audio plays automatically. |
| **2.1.1 Keyboard** | Supports | All functionality available via keyboard. Keyboard navigation utilities implemented. Tab navigation works throughout. |
| **2.1.2 No Keyboard Trap** | Supports | FocusTrap component allows escape from modals. No keyboard traps exist. |
| **2.1.4 Character Key Shortcuts** | Supports | Keyboard shortcuts use modifier keys. Can be disabled in settings. |
| **2.2.1 Timing Adjustable** | Supports | No time limits on essential interactions. Session warnings provided. |
| **2.2.2 Pause, Stop, Hide** | Supports | Animations respect prefers-reduced-motion. No auto-playing content that cannot be paused. |
| **2.3.1 Three Flashes or Below Threshold** | Supports | No content flashes more than 3 times per second. |
| **2.4.1 Bypass Blocks** | Supports | Skip navigation links provided via SkipNavigation component. Links to main content and navigation. |
| **2.4.2 Page Titled** | Supports | All pages have unique, descriptive titles via SEOHead component. |
| **2.4.3 Focus Order** | Supports | Focus order is logical and follows visual layout. Tab sequence is meaningful. |
| **2.4.4 Link Purpose (In Context)** | Supports | Link text is descriptive. Icon-only buttons have aria-label attributes. |
| **2.5.1 Pointer Gestures** | Supports | No multipoint or path-based gestures required. All functions work with single pointer. |
| **2.5.2 Pointer Cancellation** | Supports | Actions trigger on pointer up-event. Can be aborted. |
| **2.5.3 Label in Name** | Supports | Accessible names include visible text labels. |
| **2.5.4 Motion Actuation** | Not Applicable | No motion-actuated functionality. |
| **3.1.1 Language of Page** | Supports | HTML lang attribute set to "en". |
| **3.2.1 On Focus** | Supports | Focus does not initiate context changes. |
| **3.2.2 On Input** | Supports | Input does not cause unexpected context changes. Forms require explicit submission. |
| **3.3.1 Error Identification** | Supports | Form errors clearly identified with AccessibleFormError component. Errors announced to screen readers. |
| **3.3.2 Labels or Instructions** | Supports | Form fields have visible labels. Required fields indicated. Instructions provided. |
| **4.1.1 Parsing** | Not Applicable | Obsolete in WCAG 2.2. HTML is valid. |
| **4.1.2 Name, Role, Value** | Supports | Custom components use proper ARIA. Radix UI provides full accessibility. State changes are programmatically determinable. |

### Table 2: Success Criteria, Level AA

| Criteria | Conformance Level | Remarks and Explanations |
|----------|-------------------|--------------------------|
| **1.2.4 Captions (Live)** | Not Applicable | Product does not include live audio content. |
| **1.2.5 Audio Description (Prerecorded)** | Not Applicable | Product does not include prerecorded video content. |
| **1.3.4 Orientation** | Supports | Content displays in both portrait and landscape. No orientation restrictions. |
| **1.3.5 Identify Input Purpose** | Supports | Form inputs use appropriate autocomplete attributes. Input purpose is programmatically determinable. |
| **1.4.3 Contrast (Minimum)** | Supports | Text contrast meets 4.5:1 minimum. Large text meets 3:1. Color contrast utilities ensure compliance. High contrast mode available. |
| **1.4.4 Resize Text** | Supports | Text can be resized to 200% without loss. Font size settings available (Normal, Large, Larger). |
| **1.4.5 Images of Text** | Supports | No images of text except logos. Text is used for all content. |
| **1.4.10 Reflow** | Supports | Content reflows at 320px viewport width. No horizontal scrolling at 400% zoom. |
| **1.4.11 Non-text Contrast** | Supports | UI components have 3:1 contrast ratio. Focus indicators clearly visible. Form field boundaries distinguishable. |
| **1.4.12 Text Spacing** | Supports | Content functional with increased text spacing. No clipping or overlap. |
| **1.4.13 Content on Hover or Focus** | Supports | Tooltips and dropdowns are dismissible, hoverable, and persistent until dismissed. |
| **2.4.5 Multiple Ways** | Supports | Multiple navigation methods: main nav, sidebar navigation, breadcrumbs. |
| **2.4.6 Headings and Labels** | Supports | Headings are descriptive. Labels clearly describe form field purpose. |
| **2.4.7 Focus Visible** | Supports | All focusable elements have visible focus indicators. Enhanced in high contrast mode. |
| **3.1.2 Language of Parts** | Supports | No content in languages other than English currently present. |
| **3.2.3 Consistent Navigation** | Supports | Navigation appears in same location across pages. Consistent menu structure. |
| **3.2.4 Consistent Identification** | Supports | Components with same functionality have consistent labels. |
| **3.3.3 Error Suggestion** | Supports | Error messages provide suggestions for correction where format is known. |
| **3.3.4 Error Prevention (Legal, Financial, Data)** | Supports | Destructive actions require confirmation. Users can review before submission. |
| **4.1.3 Status Messages** | Supports | LiveAnnouncer component provides status messages. Toast notifications use aria-live. Loading states announced to screen readers. |

---

## Legal Disclaimer

This VPAT is provided for informational purposes and represents ShareKit's good faith effort to describe the accessibility of its platform as of the report date. Accessibility features may vary based on individual user configurations, assistive technologies used, and platform updates.

For the most current accessibility information or to report accessibility issues, please contact support@sharekit.net.

---

## Revision History

| Date | Version | Description |
|------|---------|-------------|
| January 2026 | 1.0 | Initial VPAT based on comprehensive accessibility audit |

