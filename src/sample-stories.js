export const sampleStories = [
  {
    id: "poor-dashboard",
    domain: "B2B SaaS",
    expectedBand: "Poor",
    title: "Too vague for reliable testing",
    relevance: "Shows how common dashboard wording creates no reliable regression target.",
    story:
      "As a user, I want the dashboard to work properly and be easy to use so that I can see my account information quickly. It should be intuitive and fast."
  },
  {
    id: "fair-billing-card",
    domain: "Subscription SaaS",
    expectedBand: "Fair",
    title: "Partially testable, missing risk paths",
    relevance: "A realistic billing story that sounds clear but omits invalid-card and processor-failure behavior.",
    story:
      "As a customer, I want to update my billing card so that future renewals use the new card. When I save the card, the system should update my payment method and show a success message. The old card should no longer be used for future renewals. It should be easy to use and work correctly."
  },
  {
    id: "good-partial-refund",
    domain: "Commerce Ops",
    expectedBand: "Good",
    title: "Testable with minor gaps",
    relevance: "Good enough for scenario planning, but TracePilot can still expose duplicate-submit and processor-timeout cases.",
    story:
      "As a support agent with refund permission, I want to issue a partial refund for a paid order so that I can resolve billing mistakes. The order must already be paid. When I submit a valid partial refund amount, the refund is recorded and a success message is displayed. If the amount is greater than the paid amount, the system displays an error."
  },
  {
    id: "strong-password-reset",
    domain: "Identity",
    expectedBand: "Strong",
    title: "Ready for scenario planning",
    relevance: "Demonstrates the ideal TracePilot path from strong criteria to reviewed Playwright scenarios.",
    story: `As a returning customer with an existing account, I want to reset my password so that I can regain access if I forget it.

Acceptance criteria:
- Given I enter the email address for an existing account, when I request a password reset, then the system sends a reset email and shows a confirmation message.
- Given I open a valid reset link, when I submit a new password that meets the password rules, then my password is updated and I can log in with the new password.
- Given the reset link is expired or already used, when I try to submit a new password, then the system blocks the reset and explains how to request a new link.
- Given I enter an email address that is not registered, when I request a reset, then the system shows the same neutral confirmation message without revealing whether the account exists.
- Given I submit an empty or weak password, when I try to save it, then the system shows the password rule that failed and does not update the password.`
  },
  {
    id: "fair-promo-code",
    domain: "Ecommerce",
    expectedBand: "Fair",
    title: "Promo code story with hidden revenue risk",
    relevance: "Discount logic often ships with happy-path tests while expiry, stacking, and minimum-cart rules stay vague.",
    story:
      "As a shopper, I want to apply a promo code during checkout so that I can receive a discount on my order. When the code is valid, the cart total should update and the discount should be shown before payment. The checkout should handle promo codes properly and be simple for customers."
  },
  {
    id: "strong-kyc-upload",
    domain: "Fintech",
    expectedBand: "Strong",
    title: "KYC document upload before account approval",
    relevance: "Shows how TracePilot catches operational risk before a regulated flow becomes a brittle test suite.",
    story:
      "As a new customer with an unverified account, I want to upload my identity document so that my account can be reviewed for approval. Given I upload a supported image file below the size limit, when I submit it, then the document status changes to pending review and I see a confirmation message. If I upload an unsupported file type or an empty file, then the system blocks the upload and explains the issue."
  },
  {
    id: "strong-pto-approval",
    domain: "HR Tech",
    expectedBand: "Strong",
    title: "Manager approval flow with auditability",
    relevance: "Connects requirement clarity to regression coverage for permissions, notifications, and audit history.",
    story: `As a manager with approval permission, I want to approve or reject an employee PTO request so that staffing calendars stay accurate.

Acceptance criteria:
- Given a pending PTO request exists for my direct report, when I approve it, then the request status changes to approved and the employee receives a notification.
- Given I reject the request with a required reason, when I submit the rejection, then the status changes to rejected and the reason is visible to the employee.
- Given I am not the employee's manager, when I open the request, then approve and reject actions are not available.
- Given the request was already approved or cancelled, when I try to act on it, then the system blocks the change and shows the current status.
- Given an approval or rejection succeeds, then the action, actor, timestamp, and reason are recorded in the audit history.`
  },
  {
    id: "strong-marketplace-dispute",
    domain: "Marketplace",
    expectedBand: "Strong",
    title: "Buyer dispute intake with evidence",
    relevance: "Proves TracePilot can turn messy support workflows into criteria-mapped regression scenarios.",
    story:
      "As a buyer with a delivered order, I want to open a dispute and attach evidence so that marketplace support can review my claim. Given the order was delivered within the dispute window, when I submit a reason and at least one supported attachment, then a dispute case is created and I receive a case number. If the order is outside the dispute window or the attachment is too large, then the system blocks submission and shows a clear message."
  },
  {
    id: "good-edtech-retake",
    domain: "Edtech",
    expectedBand: "Good",
    title: "Assessment retake eligibility",
    relevance: "Highlights policy-heavy requirements where edge cases are more important than the happy path.",
    story:
      "As a student who failed an assessment, I want to request a retake so that I can improve my score. The course must allow retakes and the request must be within the retake window. When I request a retake, the system should create a pending request and show the review status. If the retake window has passed or I already used my allowed retake, the system should display an error."
  }
];
