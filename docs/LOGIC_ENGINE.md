# Election Logic Engine

The core differentiation of NagrikAI Pro is its deterministic backend engine, serving as the system's "Source of Truth." The logic engine ensures users are only assigned legally viable election forms.

## Priority Constraints
### 1. The Statutory Age Intercept
The highest priority layer in the execution stack evaluates numerical age boundaries.
* **Rule**: Input must be `Age >= 18`.
* **Execution Bypass**: If evaluated `isEligible === false`, the system universally intercepts the context, hard-locking the response loop. It returns a locked payload (`eligibilityStatus: "NOT_ELIGIBLE_AGE"`).
* **Consequence**: Users under 18 cannot be guided to form assignment matrices, blocking mis-applications system-wide.

## Scenario Resolution Matrix
If baseline eligibility clears, the logic engine traverses the state matrix mapping Intents against Context Variables (e.g., `registrationStatus === "registered"` AND `movedRecently === true` equates to `SCENARIOS.MIGRATED`). This ensures the voter flow assigns Form 8 vs Form 6 deterministically.

## The Rule + Why + Risk Framework
Instead of telling users "Do X", the engine computes context mappings structurally:
1. **Rule**: States the official Election Commission regulation.
2. **Why**: Justifies the rule realistically (e.g., "Constutuency records match your physical residence").
3. **Risk**: Applies urgency logic (e.g., "Mismatched IDs may confuse polling staff").
