# Yummii

Yummii is a meal planning and recipe management web application built with Next.js and Supabase.

## Features

- **Meal Library**: Browse and manage your personal collection of recipes
- **Meal Planning**: Create weekly meal plans with flexible day naming
- **Recipe Management**: Store ingredients, instructions, and YouTube video links
- **Multi-user Support**: Each user has their own private meal library and plans
- **Mobile Responsive**: Works great on phones, tablets, and desktop

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Google OAuth
- **UI**: Radix UI + Tailwind CSS
- **Drag & Drop**: dnd-kit

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   ```

3. Run the database migration:
   - Go to your Supabase Dashboard
   - Open SQL Editor
   - Run the `database_setup_cooking.sql` file

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3001](http://localhost:3001)

## Database Schema

- **meals**: Recipe/meal information (name, ingredients, instructions, video)
- **meal_plan_days**: Day cards in meal plan (Monday, Anniversary Dinner, etc.)
- **meal_plan_day_meals**: Junction table linking days to meals

## Made with ❤️

Built by adapting the [GymTracker](../gymtracker) codebase.
