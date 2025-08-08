# KidMap Feature Roadmap: Parental Controls & Safety

## Phase 1: Custom Categories & Kid-Friendly UI

- [ ] Design data model for custom categories (parent/child editable)
- [ ] Add UI for creating/editing/deleting categories
- [ ] Store categories securely (local or backend)
- [ ] Make icons larger and more visually kid-friendly throughout the app
- [ ] Update category icons (e.g., food: pizza, burger, etc. instead of just restaurant)

## Phase 2: Parental Controls Dashboard & Parent App

- [ ] Design in-app dashboard for parent/guardian
- [ ] Add PIN/biometric protection for parent mode
- [ ] Features: manage categories, safe zones, check-ins, device settings
- [ ] (Optional) Plan for future standalone parent app for parents to monitor and approve
- [ ] Allow parent to approve or reject categories/places added by child
- [ ] Parent can request a check-in from child on demand

## Phase 3: Multi-Modal Routing

- [ ] Integrate walking, bike, and transit routing APIs
- [ ] Add UI for selecting travel mode
- [ ] Display and test new route types

## Phase 4: Photo Check-in Accuracy

- [ ] Require location check at photo check-in
- [ ] Only allow check-in within allowed radius
- [ ] Prevent spoofing (use device APIs, consider server validation)

## Phase 5: Safe Zone Alerts

- [ ] Allow parents to set geofenced safe zones
- [ ] Notify on entry/exit (child and parent)
- [ ] UI for managing safe zones

## Phase 6: Device Ping/Locate

- [ ] Implement phone ping (ring or location update)
- [ ] Use push notifications/background location
- [ ] UI for parent to trigger ping

## Phase 7: Safety Tools Refactor & Language Improvements

- [ ] Move photo check-in to safety tools section
- [ ] Group all safety features in one UI area
- [ ] Improve icons and language for safety tools (e.g., use "I made it!" or "I'm OK" instead of "I'm safe")

---

**General:**

- [ ] Update documentation and onboarding
- [ ] Add tests for new features
- [ ] Gather feedback from parents/children

> Review and adjust priorities as needed. Each phase can be tracked as issues or milestones in your repo.
