# Product Requirements Document: Calorie.Help Flutter Mobile App

**Version**: 1.0  
**Date**: 2024-07-26

## 1. Introduction

### 1.1. Purpose
This document outlines the product requirements for the Calorie.Help mobile application, built with Flutter for iOS and Android. It serves as the central guide for the development team, designers, and stakeholders.

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
  - Email/password-based authentication.
  - New users are automatically assigned a user profile in the database.
  - "Forgot Password" functionality.
  - Secure session management using JWTs.

### 4.2. Onboarding Flow
- **Description**: A guided setup process for new users to create a personalized nutrition plan.
- **Requirements**:
  - **Welcome Screens**: A 3-screen carousel introducing the app's key features (Smart Meal Planning, AI Analysis, AI Coach).
  - **Profile Creation**: A multi-step flow to gather user data:
    1.  Gender
    2.  Height (metric/imperial)
    3.  Birth Date
    4.  Current Weight (metric/imperial)
    5.  Activity Level (Sedentary, Low Active, Active, Very Active)
    6.  Target Weight
  - **Plan Selection & Subscription**:
    1.  Present three subscription plans (Steady, Intensive, Accelerated) with features and pricing.
    2.  Show a plan summary with calculated daily calorie targets and macro splits.
    3.  Integrate with Stripe for a seamless checkout process.

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
  - **Camera Scan**: Allow users to take a photo of their meal. The image is sent to the backend for AI analysis, which returns the food name, serving size, and nutritional information.
  - **Text Description**: Allow users to type a description of their meal for AI analysis.
  - **Analysis Review**: Display the AI's analysis for user confirmation.
  - **Log to Diary**: Allow users to log the analyzed food to their daily diary under a specific meal type (Breakfast, Lunch, Dinner, Snack).

### 4.5. AI Health Coach (Premium Feature)
- **Description**: A 24/7 chat interface with an AI-powered nutrition coach.
- **Requirements**:
  - A real-time chat interface.
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
- **Framework**: Flutter with Dart.
- **State Management**: Provider, Riverpod, or BLoC.
- **Backend**: Supabase (Authentication, PostgreSQL Database, Edge Functions).
- **Third-Party Integrations**:
  - **Stripe**: For payment processing and subscriptions.
  - **Google Gemini**: For AI food analysis and health coach chat.
  - **Native Camera/Photo Library**: For the AI Food Logger.

## 7. Non-Functional Requirements

- **Performance**: The app must be responsive, with UI rendering at 60fps. AI analysis should provide feedback within 5-10 seconds.
- **Security**: All user data must be transmitted securely over HTTPS. Sensitive data in the database must be protected by RLS policies.
- **Usability**: The interface should be intuitive, clean, and follow platform-specific design guidelines (Material Design for Android, Cupertino for iOS).
- **Offline Support**: The app should have basic offline capabilities, such as viewing previously loaded data. Caching of API responses is required.

## 8. Future Considerations

- Wearable device integration (Apple Watch, Wear OS) for activity tracking.
- Barcode scanner for packaged foods.
- Community features for sharing progress and recipes.
- Advanced reporting and trend analysis.
- Support for more dietary preferences (e.g., vegan, keto, gluten-free).

