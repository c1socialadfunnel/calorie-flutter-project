# Calorie.Help - AI-Powered Calorie Tracker

A comprehensive AI-powered calorie tracking mobile application built with React, TypeScript, and Supabase, featuring real Gemini AI integration for food analysis and nutrition coaching, with complete Stripe subscription management.

## Features

- **Smart Onboarding**: 3-screen introduction with comprehensive plan creation
- **AI-Powered Food Analysis**: Real Gemini AI integration for accurate food recognition and calorie calculation
- **Subscription Plans**: Steady ($9.99), Intensive ($14.99), and Accelerated ($19.99) monthly plans
- **Stripe Integration**: Complete payment processing and subscription management
- **24/7 AI Health Coach**: Intelligent chat interface powered by Gemini AI for nutrition guidance and motivation
- **Progress Tracking**: Daily calorie monitoring with macro breakdown
- **User Authentication**: Secure sign-up and sign-in with Supabase Auth

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS v4** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **React Query** for data fetching and caching
- **Lucide React** for icons

### Backend
- **Supabase** for database, authentication, and edge functions
- **PostgreSQL** database with Row Level Security (RLS)
- **Edge Functions** for AI food analysis, chat functionality, and payment processing
- **Google Gemini AI** for intelligent food analysis and conversational AI
- **Stripe** for subscription management and payment processing

## Getting Started

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Supabase Account** - [Sign up here](https://supabase.com)
3. **Google AI Studio Account** - [Get API key here](https://aistudio.google.com/app/apikey)
4. **Stripe Account** - [Sign up here](https://stripe.com)

### Setup Instructions

#### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install
```

#### 2. Supabase Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database migrations**:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
   - Run the migration
   - Copy and paste the contents of `supabase/migrations/002_add_subscription_fields.sql`
   - Run the second migration

3. **Set up environment variables for Edge Functions**:
   - Go to your Supabase dashboard → Settings → Edge Functions
   - Add the following secrets:
     - `GEMINI_API_KEY`: Your Google AI Studio API key
     - `STRIPE_SECRET_KEY`: Your Stripe secret key
     - `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook endpoint secret

4. **Deploy Edge Functions**:
   ```bash
   # Install Supabase CLI if you haven't already
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Link your project (replace with your project reference)
   supabase link --project-ref your-project-ref

   # Deploy edge functions
   supabase functions deploy analyze-food
   supabase functions deploy send-message
   supabase functions deploy create-checkout-session
   supabase functions deploy stripe-webhook
   supabase functions deploy manage-subscription
   ```

5. **Configure Environment Variables**:
   - Go to your Supabase dashboard → Settings → API
   - Copy your Project URL and anon public key
   - Update `frontend/lib/supabase.ts` with your actual values:

   ```typescript
   const supabaseUrl = 'https://your-project-ref.supabase.co'
   const supabaseAnonKey = 'your-anon-key'
   ```

#### 3. Google Gemini AI Setup

1. **Get your API key**:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Copy the key for use in Supabase Edge Functions

2. **Add the API key to Supabase**:
   - In your Supabase dashboard, go to Settings → Edge Functions
   - Add a new secret named `GEMINI_API_KEY`
   - Paste your Google AI Studio API key as the value

#### 4. Stripe Setup

1. **Create Stripe Account**:
   - Sign up at [stripe.com](https://stripe.com)
   - Get your API keys from the Stripe dashboard

2. **Create Products and Prices**:
   - In Stripe dashboard, create products for each plan:
     - Steady Plan: $9.99/month
     - Intensive Plan: $14.99/month  
     - Accelerated Plan: $19.99/month
   - Copy the price IDs and update them in `supabase/functions/create-checkout-session/index.ts`

3. **Set up Webhook**:
   - In Stripe dashboard → Webhooks
   - Add endpoint: `https://your-project-ref.supabase.co/functions/v1/stripe-webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`
   - Copy the webhook signing secret

4. **Add Stripe secrets to Supabase**:
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET`: Your webhook signing secret

#### 5. Run the Application

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
├── frontend/
│   ├── components/           # React components
│   │   ├── main/            # Main app components (Dashboard, Profile, etc.)
│   │   ├── onboarding/      # Onboarding flow components
│   │   └── ui/              # shadcn/ui components (auto-generated)
│   ├── contexts/            # React contexts (Auth)
│   ├── lib/                 # Utilities and API functions
│   │   ├── api.ts           # Backend API integration
│   │   ├── stripe.ts        # Stripe integration
│   │   └── supabase.ts      # Supabase client
│   └── App.tsx              # Main app component
├── supabase/
│   ├── functions/           # Edge functions
│   │   ├── analyze-food/    # Gemini AI food analysis function
│   │   ├── send-message/    # Gemini AI chat message handling function
│   │   ├── create-checkout-session/  # Stripe checkout creation
│   │   ├── stripe-webhook/  # Stripe webhook handler
│   │   └── manage-subscription/      # Subscription management
│   └── migrations/          # Database schema migrations
└── README.md
```

## Key Features Implementation

### Authentication Flow
- Supabase Auth with email/password
- Automatic user profile creation via database triggers
- Protected routes with authentication context

### Subscription Management
- **Plan Selection**: Three tiers with different pricing and features
- **Stripe Checkout**: Secure payment processing with Stripe Checkout
- **Webhook Handling**: Real-time subscription status updates
- **Billing Portal**: Customer self-service billing management
- **Feature Gating**: Premium features locked behind subscription

### Onboarding Process
1. **Welcome Screens**: Feature introduction (3 screens)
2. **Plan Creation**: Comprehensive profile setup
   - Gender selection
   - Height and weight input
   - Activity level assessment
   - Plan type selection (Steady/Intensive/Accelerated)
   - Target weight setting
   - Plan summary and Stripe checkout

### Main Application
- **Dashboard**: Daily calorie progress, macro tracking, subscription status
- **Food Logger**: Gemini AI-powered food analysis and logging (Premium)
- **Health Coach**: 24/7 Gemini AI chat assistant for nutrition guidance (Premium)
- **Profile**: User settings, plan management, and billing portal access

### AI Features
- **Food Analysis**: Real Gemini AI integration for accurate food recognition with nutritional breakdown
- **Health Coach**: Contextual responses using Gemini AI with user profile awareness and conversation history
- **Fallback System**: Graceful degradation to basic responses if AI services are unavailable

## Database Schema

The application uses a PostgreSQL database with the following main tables:

- `users` - User account information
- `user_profiles` - Detailed user profiles with health metrics and subscription data
- `food_items` - Food database with nutritional information
- `food_logs` - User food consumption logs
- `chat_sessions` - AI coach conversation sessions
- `chat_messages` - Individual chat messages
- `subscription_events` - Audit trail for subscription changes

## Security

- **Row Level Security (RLS)** enabled on all tables
- **Authentication required** for all user data access
- **Edge Functions** with built-in authentication verification
- **CORS headers** properly configured for cross-origin requests
- **API key security** through Supabase environment variables
- **Stripe webhook verification** for secure payment processing

## AI Integration Details

### Gemini AI Food Analysis
- Uses Google's Gemini 1.5 Flash model for food recognition
- Provides detailed nutritional breakdown including calories, protein, carbs, and fat
- Estimates serving sizes based on food descriptions
- Includes confidence scoring for analysis accuracy
- Fallback to basic food database if AI service is unavailable

### Gemini AI Health Coach
- Personalized responses based on user profile data
- Conversation history awareness for context
- Nutrition-focused guidance and motivation
- Safety filters to ensure appropriate health advice
- Graceful fallback to predefined responses

## Subscription Plans

### Steady Plan - $9.99/month
- Weekly Weight Loss: 1 lb
- Daily Calorie Cut: -500 kcal
- AI Food Analysis
- 24/7 Health Coach
- Progress Tracking

### Intensive Plan - $14.99/month
- Weekly Weight Loss: 2 lb
- Daily Calorie Cut: -1000 kcal
- All Steady features
- Advanced Analytics

### Accelerated Plan - $19.99/month
- Weekly Weight Loss: 3+ lb
- Daily Calorie Cut: -750 kcal
- All Intensive features
- Priority Support

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. **Database Changes**: Add new migrations in `supabase/migrations/`
2. **API Changes**: Update type definitions in `frontend/lib/supabase.ts`
3. **UI Components**: Use shadcn/ui components from `@/components/ui/`
4. **Styling**: Use Tailwind CSS v4 classes
5. **AI Features**: Modify edge functions in `supabase/functions/`
6. **Payment Features**: Update Stripe integration in `frontend/lib/stripe.ts`

## Deployment

### Frontend Deployment
The frontend can be deployed to any static hosting service:
- Vercel (recommended)
- Netlify
- GitHub Pages

### Backend Deployment
Supabase handles all backend infrastructure:
- Database hosting
- Edge Functions with AI integration
- Authentication
- Real-time subscriptions

### Environment Variables
Make sure to set the following in your deployment:
- Supabase project URL and anon key
- Gemini API key in Supabase Edge Functions secrets
- Stripe API keys and webhook secrets in Supabase Edge Functions secrets

## API Usage and Costs

### Google Gemini AI
- **Free tier**: 15 requests per minute, 1,500 requests per day
- **Paid tier**: Higher rate limits available
- Monitor usage in Google AI Studio console

### Stripe
- **Transaction fees**: 2.9% + 30¢ per successful charge
- **Subscription management**: No additional fees
- **Webhook delivery**: Free

### Supabase
- **Free tier**: 500MB database, 2GB bandwidth, 500,000 edge function invocations
- **Paid tiers**: Scale based on usage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (including AI integrations and payment flows)
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **AI responses not working**:
   - Check Gemini API key is set in Supabase Edge Functions
   - Verify API key has proper permissions
   - Check edge function logs in Supabase dashboard

2. **Food analysis failing**:
   - Ensure analyze-food function is deployed
   - Check network connectivity
   - Verify user authentication

3. **Chat not responding**:
   - Check send-message function deployment
   - Verify Gemini API quota limits
   - Review edge function logs

4. **Payment issues**:
   - Verify Stripe keys are correctly set
   - Check webhook endpoint is accessible
   - Review Stripe dashboard for failed payments
   - Ensure webhook events are properly configured

5. **Subscription status not updating**:
   - Check Stripe webhook delivery in dashboard
   - Verify webhook secret matches
   - Review edge function logs for webhook processing

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the documentation
- Review the code comments
- Check Supabase, Gemini AI, and Stripe documentation
- Open an issue on GitHub

---

Built with ❤️ using React, TypeScript, Supabase, Google Gemini AI, and Stripe.
