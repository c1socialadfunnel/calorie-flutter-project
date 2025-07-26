# Product Requirements Document: Calorie.Help React Native Expo Mobile App

**Version**: 1.0  
**Date**: 2024-12-25

## 1. Introduction

### 1.1. Purpose
This document outlines the product requirements for the Calorie.Help mobile application, built with React Native and Expo for iOS and Android. It serves as the central guide for the development team, designers, and stakeholders.

### 1.2. Product Overview
Calorie.Help is an AI-powered calorie tracking and nutrition coaching application. It helps users achieve their health and weight goals through intelligent food analysis, personalized meal planning, and 24/7 AI-driven support. The app leverages Google's Gemini AI for its core intelligence and Stripe for subscription management.

## 2. Goals and Objectives

- **Primary Goal**: To provide users with an easy, accurate, and motivating way to track their food intake and make healthier choices.
- **Business Objective**: To acquire and retain users through a freemium model with premium subscription tiers, generating recurring revenue.
- **User Objective**: To achieve personal weight and health goals with the help of personalized, AI-driven guidance.

## 3. Target Audience

- **Primary**: Health-conscious individuals aged 18-45 who are looking to lose weight, maintain a healthy lifestyle, or better understand their nutritional habits.
- **Secondary**: Fitness enthusiasts who want to track macronutrients and optimize their diet for performance.
- **Characteristics**: Tech-savvy, own a smartphone (iOS or Android), and are looking for a modern, AI-powered solution over traditional manual-entry calorie counters.

## 4. Key Features

### 4.1. User Authentication
- **Description**: Secure user sign-up, sign-in, and sign-out functionality.
- **Requirements**:
  - Email/password-based authentication using Supabase Auth.
  - New users are automatically assigned a user profile in the database.
  - "Forgot Password" functionality.
  - Secure session management using JWTs.

### 4.2. Onboarding Flow
- **Description**: A guided setup process for new users to create a personalized nutrition plan.
- **Requirements**:
  - **Welcome Screens**: A 3-screen carousel introducing the app's key features (Smart Meal Planning, AI Analysis, AI Coach).
  - **Profile Creation**: A multi-step flow to gather user data:
    1. Gender
    2. Height (metric/imperial)
    3. Birth Date
    4. Current Weight (metric/imperial)
    5. Activity Level (Sedentary, Low Active, Active, Very Active)
    6. Target Weight
  - **Plan Selection & Subscription**:
    1. Present three subscription plans (Steady, Intensive, Accelerated) with features and pricing.
    2. Show a plan summary with calculated daily calorie targets and macro splits.
    3. Integrate with Stripe for a seamless checkout process.

### 4.3. Dashboard
- **Description**: The main screen providing a daily overview of the user's progress.
- **Requirements**:
  - Display daily calorie intake vs. target.
  - Show a progress bar for calorie consumption.
  - Summarize macronutrient intake (Protein, Carbs, Fat).
  - Display a list of today's logged meals grouped by meal type (Breakfast, Lunch, etc.).
  - Show a motivational message related to the user's plan.
  - Provide quick-access buttons to "AI Calorie Count" and "Ask Coach".
  - Display subscription status (e.g., "Pro") and an upgrade prompt for free users.

### 4.4. AI Food Logger (Premium Feature)
- **Description**: An intelligent food logging system using AI.
- **Requirements**:
  - **Camera Scan**: Allow users to take a photo of their meal using Expo Camera. The image is sent to the backend for AI analysis, which returns the food name, serving size, and nutritional information.
  - **Text Description**: Allow users to type a description of their meal for AI analysis.
  - **Analysis Review**: Display the AI's analysis for user confirmation.
  - **Log to Diary**: Allow users to log the analyzed food to their daily diary under a specific meal type (Breakfast, Lunch, Dinner, Snack).

### 4.5. AI Health Coach (Premium Feature)
- **Description**: A 24/7 chat interface with an AI-powered nutrition coach.
- **Requirements**:
  - A real-time chat interface using React Native components.
  - The AI should provide personalized, context-aware responses based on the user's profile and chat history.
  - Display quick suggestion prompts for new conversations.
  - Maintain a history of chat sessions.

### 4.6. Profile & Settings
- **Description**: A section for users to manage their account, plan, and subscription.
- **Requirements**:
  - View and adjust the current nutrition plan.
  - Manage subscription via a Stripe customer portal link.
  - Options to Rate the App, Invite Friends, and select Language.
  - Links to Privacy Policy and Terms & Conditions.
  - Secure sign-out functionality.
  - A secure, multi-step process for account deletion, which is disabled if a subscription is active.

## 5. User Stories

- **As a new user**, I want a simple onboarding process so I can get a personalized plan quickly.
- **As a busy professional**, I want to log my meals by taking a photo so I can save time.
- **As a user trying to lose weight**, I want to see my daily calorie progress at a glance so I can stay on track.
- **As a user with a nutrition question**, I want to ask an AI coach for quick advice so I don't have to search online.
- **As a subscriber**, I want to easily manage my billing and subscription details so I have control over my payments.

## 6. Technical Requirements

- **Platform**: iOS (13.0+) and Android (5.0+).
- **Framework**: React Native with Expo SDK 50+.
- **State Management**: React Context API with useReducer or Zustand.
- **Navigation**: React Navigation v6.
- **Backend**: Supabase (Authentication, PostgreSQL Database, Edge Functions).
- **Third-Party Integrations**:
  - **Stripe**: For payment processing and subscriptions.
  - **Google Gemini**: For AI food analysis and health coach chat.
  - **Expo Camera**: For the AI Food Logger camera functionality.
  - **Expo ImagePicker**: For selecting photos from gallery.

## 7. Non-Functional Requirements

- **Performance**: The app must be responsive, with smooth animations at 60fps. AI analysis should provide feedback within 5-10 seconds.
- **Security**: All user data must be transmitted securely over HTTPS. Sensitive data in the database must be protected by RLS policies.
- **Usability**: The interface should be intuitive, clean, and follow platform-specific design guidelines (Material Design for Android, iOS Human Interface Guidelines for iOS).
- **Offline Support**: The app should have basic offline capabilities, such as viewing previously loaded data. Caching of API responses is required.

## 8. React Native Specific Requirements

### 8.1. Expo Configuration
- Use Expo SDK 50+ for maximum compatibility and features.
- Configure app.json/app.config.js with proper permissions for camera, photo library, and notifications.
- Set up proper bundle identifiers and app icons.

### 8.2. Navigation Structure
- Tab-based navigation for main screens (Dashboard, Coach, Profile).
- Stack navigation for onboarding flow and detailed screens.
- Modal navigation for food logging and camera screens.

### 8.3. State Management
- Use React Context for global state (user authentication, profile data).
- Local state for component-specific data.
- Async storage for offline data persistence.

### 8.4. UI Components
- Use React Native Elements or NativeBase for consistent UI components.
- Custom components for specific features (progress bars, food cards, chat bubbles).
- Platform-specific styling using Platform.select().

### 8.5. Camera Integration
- Use Expo Camera for taking photos of food.
- Implement proper camera permissions handling.
- Image compression and optimization before sending to AI analysis.

### 8.6. Performance Optimization
- Use FlatList for large data sets (food logs, chat messages).
- Implement proper image caching and lazy loading.
- Optimize bundle size with proper tree shaking.

## 9. Development Phases

### Phase 1: Core Setup (Week 1-2)
- Project setup with Expo
- Basic navigation structure
- Authentication implementation
- Database schema setup

### Phase 2: Onboarding & Profile (Week 3-4)
- Welcome screens
- Profile creation flow
- Plan selection
- Stripe integration

### Phase 3: Dashboard & Food Logging (Week 5-6)
- Dashboard implementation
- Camera integration
- AI food analysis
- Food logging functionality

### Phase 4: AI Coach & Chat (Week 7-8)
- Chat interface
- AI integration
- Message history
- Real-time updates

### Phase 5: Profile & Settings (Week 9-10)
- Profile management
- Subscription management
- Settings screens
- Account deletion

### Phase 6: Testing & Polish (Week 11-12)
- Comprehensive testing
- Performance optimization
- UI/UX polish
- App store preparation

## 10. Future Considerations

- Push notifications for meal reminders and motivation.
- Wearable device integration (Apple Watch, Wear OS) for activity tracking.
- Barcode scanner for packaged foods.
- Community features for sharing progress and recipes.
- Advanced reporting and trend analysis.
- Support for more dietary preferences (e.g., vegan, keto, gluten-free).
- Offline mode with data synchronization.

## 11. Success Metrics

- **User Engagement**: Daily active users, session duration, feature usage.
- **Conversion**: Free to paid subscription conversion rate.
- **Retention**: 7-day, 30-day, and 90-day user retention rates.
- **AI Accuracy**: Food recognition accuracy and user satisfaction with AI responses.
- **Performance**: App load times, crash rates, and user ratings.
