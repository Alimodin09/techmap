# TechMap Setup Instructions

Follow these steps to set up Supabase and the TechMap application.

## 1. Supabase Project Setup
1. Go to [Supabase](https://supabase.com) and create a new project.
2. Once the project is created, navigate to **Project Settings -> API** to get your `Project URL` and `anon key`.
3. Rename the `.env.example` file in the project root to `.env.local`.
4. Replace the placeholder values in `.env.local` with your actual Supabase URL and anon key.

## 2. Database Schema Setup
1. In your Supabase dashboard, go to the **SQL Editor** (the \"< / >\" icon on the left).
2. Click **New Query**.
3. Copy the entire contents of the `setup-db.sql` file and paste it into the editor.
4. Click **Run** to execute the query. This will create the necessary tables (`profiles`, `issue_reports`, `issue_updates`), set up Row Level Security (RLS), and create a trigger to automatically add new users to the `profiles` table.

## 3. How to Assign an Admin User
By default, all new users are assigned the `user` role. If you want to make an account an `admin`, you need to do this manually in the database.
1. Sign up for a new account in the app.
2. In the Supabase dashboard, go to the **Table Editor** (the table icon on the left).
3. Select the `profiles` table.
4. Find your user row, double-click on the `role` cell, and change it from `user` to `admin`.
5. Save the change. This user will now have admin access to the `/admin` routes.

## 4. Running the App
1. Make sure you have Node.js installed.
2. Open your terminal in the project directory (`techmap`).
3. Run `npm install` (this was already done if the environment is set up, but good to ensure).
4. Run `npm run dev` to start the development server.
5. Open [http://localhost:3000](http://localhost:3000) in your browser.
