# UI / UX Strategies

NagrikAI Pro deliberately breaks from the industry standard of complex paginated FAQ flows that overwhelm citizens. 

## Action-First Design Paradigm (DoThisNow)
Instead of returning 15 dense paragraphs, NagrikAI parses the logic structure and outputs a "Next Best Action."
The `DoThisNow` component strictly isolates three physical actions (e.g., *Check roll status*, *Download Form 6*, *Upload Utility Bill*). This drops cognitive load instantaneously, creating an accessible flow for voters regardless of technological literacy limits.

## Glassmorphism & High-Contrast Design
The UI builds upon modern TailWind CSS aesthetic profiles mapping clean `glass-card` structural bounds natively. Complex visual hierarchy differentiates standard prompts from structural actions. 

## Non-Eligible Fallback Trap
A powerful conditional structural boundary locks the DOM array on the frontend natively reading structural flags. If `eligibilityStatus: "NOT_ELIGIBLE_AGE"` appears inside the payload, all Action buttons, Next Steps summaries, and Chat elements unmount. The voter natively observes an unmistakable red bounding box clarifying exactly why the Indian constitution currently blocks their advancement. 

## Accessible Native Trees
All dynamic components execute inside React `<Suspense>` lazy-loaders preserving UI interactivity on constrained 3G/4G bandwidth networks. Component wrappers strictly enforce `aria-live` regions allowing screen readers to dynamically interpret guidance shifts cleanly.
