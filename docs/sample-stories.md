# Sample User Stories for Capability Testing

Use these stories to validate scoring behavior before launch demos. They are intentionally varied so the checker can show Poor, Fair, Good, and Strong outcomes.

## Poor: Too Vague for Reliable Testing

Expected band: `Poor`

```text
As a user, I want the dashboard to work properly and be easy to use so that I can see my account information quickly. It should be intuitive and fast.
```

Why it matters:

- Actor is generic.
- No acceptance criteria.
- No preconditions.
- Expected outcomes are subjective.
- Negative paths are absent.
- Vague terms should be flagged.

## Fair: Partially Testable, Missing Risk Paths

Expected band: `Fair`

```text
As a customer, I want to update my billing card so that future renewals use the new card. When I save the card, the system should update my payment method and show a success message. The old card should no longer be used for future renewals. It should be easy to use and work correctly.
```

Why it matters:

- Actor and desired outcome are clear.
- Some measurable behavior exists.
- Missing explicit acceptance criteria format.
- Missing invalid card, processor failure, permission, and duplicate-submit paths.

## Good: Testable With Minor Gaps

Expected band: `Good`

```text
As a support agent with refund permission, I want to issue a partial refund for a paid order so that I can resolve billing mistakes. The order must already be paid. When I submit a valid partial refund amount, the refund is recorded and a success message is displayed. If the amount is greater than the paid amount, the system displays an error.
```

Why it matters:

- Strong actor and preconditions.
- Clear happy path and negative path.
- Still leaves room for edge cases such as duplicate submission, processor timeout, or permission changes.

## Strong: Ready for Scenario Planning

Expected band: `Strong`

```text
As a returning customer with an existing account, I want to reset my password so that I can regain access if I forget it.

Acceptance criteria:
- Given I enter the email address for an existing account, when I request a password reset, then the system sends a reset email and shows a confirmation message.
- Given I open a valid reset link, when I submit a new password that meets the password rules, then my password is updated and I can log in with the new password.
- Given the reset link is expired or already used, when I try to submit a new password, then the system blocks the reset and explains how to request a new link.
- Given I enter an email address that is not registered, when I request a reset, then the system shows the same neutral confirmation message without revealing whether the account exists.
- Given I submit an empty or weak password, when I try to save it, then the system shows the password rule that failed and does not update the password.
```

Why it matters:

- Clear actor, context, and outcome.
- Multiple explicit acceptance criteria.
- Positive, negative, privacy, expiry, and validation paths.
- Good candidate for TracePilot Alpha scenario planning.
