## Description
<!-- Provide a brief description of the changes or plays introduced in this PR. -->

## Type of Change
- [ ] New Play / Scheme System
- [ ] Coaching Tree & Lineage Update
- [ ] Engine / Mathematical Interpolation Enhancement
- [ ] UI / Presentation Layer Improvement
- [ ] Documentation / SEO / Typo Fix

## Validation Checklist
- [ ] `bun run test` passes with 0 errors (all plays mathematically validated)
- [ ] `bun run typecheck` passes with 0 TypeScript errors (`tsc --noEmit`)
- [ ] Play coordinates strictly adhere to LOS-relative yards (`x: 0..53.33`, `y: -15..+25`)
- [ ] No `package-lock.json` or `yarn.lock` added
