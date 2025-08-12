# KidMap TODO / Suggestions List

## 🚀 Sprint 1 – Remaining tasks (Validation + Toast UX)

- [ ] Convert remaining Alert usages to toasts where appropriate
  - CategoryManagement: convert non-confirmation alerts (cannot delete default, delete success/error) to toasts; keep delete confirmation as Alert
  - CityManagement: surface Add/Edit form validation errors via toast (pass showToast to form)
  - Keep system permission and multi-button confirmation dialogs as Alert

- [ ] Introduce a reusable ConfirmDialog component to standardize confirmations (replace ad-hoc Alert.confirm patterns)

- [ ] Add a global Toast host at the app root (e.g., app/_layout.tsx) and refactor components to rely on a single provider

- [ ] Validation consolidation cleanup
  - Ensure all imports come from '@/core/validation' barrel
  - Remove any residual/duplicated logic from utils/validation (file now re-exports core) and update docs with @deprecated notes
  - Migrate any sanitize/validateDistance usages to '@/core/validation/helpers'

- [ ] Tests for schemas and helpers (Jest + Testing Library)
  - SafeZoneSchema, EmergencyContactSchema, PinSchema
  - CategoryCreateSchema/CategoryUpdateSchema
  - PhotoCheckInSchema and validateDistance
  - safeParseWithToast happy/invalid paths
  - Store integration tests: categoryStore add/update, navigationStore addPhotoCheckIn

- [ ] Fix current TypeScript typecheck failures after toast integration

- [ ] Update docs (TESTING_GUIDE.md, SAFETY_IMPLEMENTATION_REPORT.md) with validation/UX patterns and examples

- [ ] Optional: Add a small error-mapping utility for Zod issues → field-level messages in forms (CategoryManagement)

## � Medium Priority (Next Steps)

- Integration test automation for safety flows and error recovery
- Performance optimization review (profiling, bundle analysis)
- Component size reduction (split large/complex components)
- Documentation improvements (usage, error handling, troubleshooting)
- Security audit implementation (static analysis, dependency checks)

## 🟢 Low Priority (Future Enhancements)

- Advanced error analytics (external crash/error reporting integration)
- A/B testing for error messaging and user flows
- Automated error reporting to parents/guardians
- Performance monitoring integration (e.g., web/app metrics, alerts)
