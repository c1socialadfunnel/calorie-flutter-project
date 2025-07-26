# Calorie.Help API Documentation

This document provides a comprehensive overview of the API endpoints for the Calorie.Help application, powered by Supabase.

## Base URL

All API endpoints are relative to your Supabase project URL:

`https://<your-project-ref>.supabase.co`

## Authentication

Most endpoints require authentication. Requests must include an `Authorization` header with the user's Supabase JWT token.

`Authorization: Bearer <supabase-jwt-token>`

Additionally, the Supabase `apikey` header is required for all requests.

`apikey: <supabase-anon-key>`

## Endpoints

The API is divided into direct database access via the Supabase REST API and custom logic via Edge Functions.

---

### 1. Edge Functions

These functions contain the core business logic.

#### 1.1 Analyze Food

Analyzes a food item from an image or text description using Google's Gemini AI.

- **Endpoint**: `POST /functions/v1/analyze-food`
- **Auth**: Required

**Request Body:**

```json
{
  "description": "string (optional)",
  "imageUrl": "string (optional, base64 data URL)"
}
```
*Either `description` or `imageUrl` is required.*

**Response (200 OK):**

```json
{
  "foodName": "string",
  "estimatedServingSize": "string",
  "calories": "number",
  "proteinG": "number",
  "carbsG": "number",
  "fatG": "number",
  "confidence": "number",
  "additionalNutrition": {
    "fiber": "number",
    "sugar": "number",
    "sodium": "number",
    "cholesterol": "number",
    "saturatedFat": "number"
  },
  "healthInsights": ["string"],
  "ingredients": ["string"]
}
```

#### 1.2 Send Message to Coach

Sends a message to the AI health coach and gets a response.

- **Endpoint**: `POST /functions/v1/send-message`
- **Auth**: Required

**Request Body:**

```json
{
  "sessionId": "string (optional)",
  "message": "string"
}
```
*If `sessionId` is omitted, a new chat session is created.*

**Response (200 OK):**

```json
{
  "sessionId": "string",
  "userMessage": {
    "id": "string",
    "session_id": "string",
    "role": "user",
    "content": "string",
    "created_at": "timestamp"
  },
  "assistantMessage": {
    "id": "string",
    "session_id": "string",
    "role": "assistant",
    "content": "string",
    "created_at": "timestamp"
  }
}
```

#### 1.3 Create Checkout Session

Creates a Stripe checkout session for a subscription plan.

- **Endpoint**: `POST /functions/v1/create-checkout-session`
- **Auth**: Required

**Request Body:**

```json
{
  "planType": "steady" | "intensive" | "accelerated",
  "successUrl": "string",
  "cancelUrl": "string"
}
```

**Response (200 OK):**

```json
{
  "sessionId": "string",
  "url": "string"
}
```

#### 1.4 Manage Subscription

Manages a user's subscription (e.g., gets billing portal URL).

- **Endpoint**: `POST /functions/v1/manage-subscription`
- **Auth**: Required

**Request Body:**

```json
{
  "action": "get_portal_url",
  "returnUrl": "string"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "url": "string"
}
```

#### 1.5 Delete Account

Permanently deletes a user's account and all associated data.

- **Endpoint**: `POST /functions/v1/delete-account`
- **Auth**: Required

**Request Body:** (empty)

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

### 2. Database API

These endpoints interact directly with the PostgreSQL database via Supabase's REST API. RLS policies ensure users can only access their own data.

#### 2.1 User Profiles

- **Get Profile**: `GET /rest/v1/user_profiles?select=*&user_id=eq.<user-id>`
- **Update Profile**: `PATCH /rest/v1/user_profiles?user_id=eq.<user-id>`

**`user_profiles` Schema:**

| Column | Type | Description |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | Foreign key to `auth.users` |
| `gender` | `text` | 'male' or 'female' |
| `height_cm` | `integer` | Height in centimeters |
| `birth_date` | `date` | User's birth date |
| `current_weight_kg` | `float8` | Weight in kilograms |
| `target_weight_kg` | `float8` | Target weight in kilograms |
| `activity_level` | `text` | 'sedentary', 'low_active', 'active', 'very_active' |
| `plan_type` | `text` | 'steady', 'intensive', 'accelerated' |
| `daily_calorie_target` | `integer` | Calculated daily calorie goal |
| `stripe_customer_id` | `text` | Stripe customer ID |
| `subscription_id` | `text` | Stripe subscription ID |
| `subscription_status` | `text` | e.g., 'active', 'canceled' |

#### 2.2 Food Logs

- **Get Daily Logs**: `GET /rest/v1/food_logs?select=*&user_id=eq.<user-id>&logged_at=gte.<start-of-day>&logged_at=lt.<end-of-day>`
- **Log Food**: `POST /rest/v1/food_logs`

**`food_logs` Schema:**

| Column | Type | Description |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | Foreign key to `auth.users` |
| `custom_food_name` | `text` | Name of the logged food |
| `serving_size_g` | `float8` | Serving size in grams |
| `calories` | `integer` | Calories for the serving |
| `protein_g` | `float8` | Protein in grams |
| `carbs_g` | `float8` | Carbs in grams |
| `fat_g` | `float8` | Fat in grams |
| `meal_type` | `text` | 'breakfast', 'lunch', 'dinner', 'snack' |
| `logged_at` | `timestamptz` | Timestamp of the log |

#### 2.3 Chat History

- **Get Sessions**: `GET /rest/v1/chat_sessions?select=*&user_id=eq.<user-id>`
- **Get Messages**: `GET /rest/v1/chat_messages?select=*&session_id=eq.<session-id>`

