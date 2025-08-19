# KidMap

[![CI/CD Pipeline](https://github.com/tbmobb813/KidMap/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/tbmobb813/KidMap/actions/workflows/ci.yml)

Let me start by saying the reason for the creatation of this application is my son, who I love and adore. I want to build a kid-friendly navigation app that simplifies Google Maps functionality while adding subway/train navigation features. The app should be intuitive for children under 16 to use.

Key features to include:

1. Simple, colorful UI with large buttons and clear visuals
2. Easy destination search with kid-friendly categories (school, park, home, etc.)
3. Public transit focus with subway/train route planning
4. Real-time transit tracking
5. Simplified directions with visual cues
6. Safety features like preset destinations and simple interface

Design approach:

- Light theme with 1-2 pastel primary colors (blue/green)
- Large, clear typography
- Simplified map view with important landmarks highlighted
- Intuitive navigation flow
- Visual indicators for transit options

Let's structure the app with:

- Home screen with big search and favorites
- Map view with simplified controls
- Transit planner with visual route display
- Settings for parents/guardians

For the tech implementation:

- Use expo-location for getting user location
- Create a simplified map interface
- Build transit data integration
- Design kid-friendly UI components

This project is an on-going project and you are open to help and contribute! I have some ideas to also try and indroduce in future builds! Here are some standout features that would make your kid-friendly transit app truly special:

## 🎮 Gamification & Engagement

- Transit Explorer Badges: Earn badges for trying different transit modes, visiting new neighborhoods, or completing trips independently
- Safety Streak Counter: Track consecutive safe trips with positive reinforcement
- City Discovery Challenges: Weekly challenges like "Visit 3 libraries this week" or "Try a new park"

## 🛡️ Enhanced Safety Features

- Check-in System: Automatic "I arrived safely" notifications to parents/guardians
- Emergency Button: One-tap access to emergency contacts with location sharing
- Safe Zone Alerts: Notifications when entering/leaving designated safe areas
- Buddy System: Connect with friends taking similar routes

## 🎓 Educational Content

- Fun Transit Facts: Learn about subway history, how trains work, or city landmarks during trips
- Transit Etiquette Guide: Interactive lessons on being a good passenger
- City Explorer Mode: Discover interesting facts about neighborhoods you're traveling through

## 🗣️ Voice & Audio Features

- Kid-Friendly Voice Navigation: Simple, encouraging language ("Great job! Your train is coming in 2 minutes!")
- Audio Stop Announcements: Never miss your stop with clear audio cues
- Offline Voice Commands: Basic navigation even without internet

## 🌟 Practical Kid-Focused Features

- Bathroom Finder: Locate clean, safe restrooms along routes
- Weather Integration: "It's raining! Remember your umbrella" notifications
- Crowd Level Indicators: Avoid overwhelming rush hour crowds
- Kid-Friendly Places Nearby: Automatically suggest parks, libraries, or ice cream shops near destinations

## 👨‍👩‍👧‍👦 Family Integration

- Family Trip Planner: Parents can pre-approve routes and destinations
- Photo Journey: Safe photo diary of places visited (with parent approval)
- Family Challenges: Complete transit adventures together as a family

## 🎨 Visual & UX Enhancements

- Personalized Avatars: Kids can customize their own transit companion character
- Route Visualization: Animated, colorful route previews showing the journey step-by-step
- Celebration Animations: Fun animations when reaching destinations or earning achievements

## Tab Navigation

KidMap uses Expo Router’s tab layout for intuitive navigation. The main screens—Home, Map, Transit, Achievements, and Settings—are organized in the `(tabs)` folder, following Expo’s recommended conventions for layout groups.

## Accessibility

All interactive components are designed for accessibility:
- Buttons and cards use `accessibilityRole`, `accessibilityLabel`, and `accessibilityHint`.
- Touch targets meet the recommended minimum size (48x48).
- A development utility audits touch target sizes and accessibility props.

## Testing

KidMap includes behavior-driven tests for:
- Route caching and query metrics
- Accessibility labels and touch targets
- Error boundaries and defensive rendering
- Performance marks and cache hit/miss tracking

See `ARCHITECTURE.md` for more details on testing strategy and coverage.
