# Calorie.Help React Native API Documentation

This document provides a comprehensive overview of the API endpoints for the Calorie.Help React Native application, powered by Supabase.

## Base URL

All API endpoints are relative to your Supabase project URL:

`https://<your-project-ref>.supabase.co`

## Authentication

Most endpoints require authentication. Requests must include an `Authorization` header with the user's Supabase JWT token.

`Authorization: Bearer <supabase-jwt-token>`

Additionally, the Supabase `apikey` header is required for all requests.

`apikey: <supabase-anon-key>`

## React Native Specific Considerations

### 1. Supabase Client Setup

```javascript
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = 'https://your-project-ref.supabase.co'
const supabaseAnonKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
```

### 2. Image Handling for React Native

```javascript
// Convert image to base64 for AI analysis
import * as FileSystem from 'expo-file-system'

const convertImageToBase64 = async (imageUri) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    })
    return `data:image/jpeg;base64,${base64}`
  } catch (error) {
    throw new Error('Failed to convert image to base64')
  }
}
```

### 3. Camera Integration

```javascript
import { Camera } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'

// Request camera permissions
const requestCameraPermissions = async () => {
  const { status } = await Camera.requestCameraPermissionsAsync()
  return status === 'granted'
}

// Take photo with camera
const takePhoto = async (cameraRef) => {
  if (cameraRef.current) {
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
      base64: false,
    })
    return photo.uri
  }
}

// Pick image from gallery
const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  })
  
  if (!result.canceled) {
    return result.assets[0].uri
  }
}
```

## Endpoints

The API is divided into direct database access via the Supabase REST API and custom logic via Edge Functions.

---

### 1. Edge Functions

These functions contain the core business logic and are called from React Native.

#### 1.1 Analyze Food

Analyzes a food item from an image or text description using Google's Gemini AI.

- **Endpoint**: `POST /functions/v1/analyze-food`
- **Auth**: Required

**React Native Usage:**

```javascript
const analyzeFood = async (description, imageUri) => {
  try {
    let requestBody = {}
    
    if (imageUri) {
      const base64Image = await convertImageToBase64(imageUri)
      requestBody.imageUrl = base64Image
    }
    
    if (description) {
      requestBody.description = description
    }
    
    const { data, error } = await supabase.functions.invoke('analyze-food', {
      body: requestBody
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Food analysis error:', error)
    throw error
  }
}
```

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

**React Native Usage:**

```javascript
const sendMessageToCoach = async (message, sessionId = null) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-message', {
      body: {
        message,
        sessionId
      }
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Send message error:', error)
    throw error
  }
}
```

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

**React Native Usage:**

```javascript
import { Linking } from 'react-native'

const createCheckoutSession = async (planType) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        planType,
        successUrl: 'caloriehelp://payment-success',
        cancelUrl: 'caloriehelp://payment-cancel'
      }
    })
    
    if (error) throw error
    
    // Open Stripe checkout in browser
    await Linking.openURL(data.url)
    
    return data
  } catch (error) {
    console.error('Checkout error:', error)
    throw error
  }
}
```

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

**React Native Usage:**

```javascript
const openBillingPortal = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('manage-subscription', {
      body: {
        action: 'get_portal_url',
        returnUrl: 'caloriehelp://billing-return'
      }
    })
    
    if (error) throw error
    
    // Open billing portal in browser
    await Linking.openURL(data.url)
    
    return data
  } catch (error) {
    console.error('Billing portal error:', error)
    throw error
  }
}
```

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

**React Native Usage:**

```javascript
const deleteAccount = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('delete-account', {
      body: {}
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Delete account error:', error)
    throw error
  }
}
```

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

**React Native Usage:**

```javascript
// Get user profile
const getUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  if (error) throw error
  return data
}

// Update user profile
const updateUserProfile = async (updates) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single()
  
  if (error) throw error
  return data
}
```

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

**React Native Usage:**

```javascript
// Get daily food logs
const getDailyFoodLogs = async (date) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const startOfDay = `${date}T00:00:00.000Z`
  const endOfDay = `${date}T23:59:59.999Z`
  
  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('logged_at', startOfDay)
    .lt('logged_at', endOfDay)
    .order('logged_at', { ascending: true })
  
  if (error) throw error
  return data
}

// Log food
const logFood = async (foodData) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('food_logs')
    .insert({
      user_id: user.id,
      ...foodData,
      logged_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}
```

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

**React Native Usage:**

```javascript
// Get chat sessions
const getChatSessions = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Get messages for a session
const getChatMessages = async (sessionId) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
}
```

- **Get Sessions**: `GET /rest/v1/chat_sessions?select=*&user_id=eq.<user-id>`
- **Get Messages**: `GET /rest/v1/chat_messages?select=*&session_id=eq.<session-id>`

## React Native Specific API Patterns

### 1. Authentication State Management

```javascript
import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

### 2. Real-time Data Updates

```javascript
// Subscribe to food log changes
useEffect(() => {
  if (!user) return

  const subscription = supabase
    .channel('food_logs')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'food_logs',
        filter: `user_id=eq.${user.id}`,
      },
      (payload) => {
        // Handle real-time updates
        console.log('Food log updated:', payload)
        // Refresh data or update state
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}, [user])
```

### 3. Error Handling

```javascript
const handleApiError = (error) => {
  console.error('API Error:', error)
  
  if (error.message?.includes('JWT')) {
    // Handle authentication errors
    Alert.alert('Session Expired', 'Please sign in again.')
    // Navigate to login screen
  } else if (error.message?.includes('Network')) {
    // Handle network errors
    Alert.alert('Network Error', 'Please check your internet connection.')
  } else {
    // Handle other errors
    Alert.alert('Error', error.message || 'Something went wrong.')
  }
}
```

### 4. Offline Data Handling

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage'

const cacheData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Cache error:', error)
  }
}

const getCachedData = async (key) => {
  try {
    const data = await AsyncStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Cache retrieval error:', error)
    return null
  }
}
```

## Deep Linking Configuration

For handling Stripe payment redirects and other deep links:

```javascript
// app.json
{
  "expo": {
    "scheme": "caloriehelp",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "caloriehelp"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

```javascript
// Handle deep links in React Native
import { Linking } from 'react-native'

useEffect(() => {
  const handleDeepLink = (url) => {
    if (url.includes('payment-success')) {
      // Handle successful payment
      navigation.navigate('Dashboard')
    } else if (url.includes('payment-cancel')) {
      // Handle cancelled payment
      navigation.goBack()
    }
  }

  // Handle app opened from deep link
  Linking.getInitialURL().then((url) => {
    if (url) handleDeepLink(url)
  })

  // Handle deep links while app is running
  const subscription = Linking.addEventListener('url', ({ url }) => {
    handleDeepLink(url)
  })

  return () => subscription?.remove()
}, [])
```
