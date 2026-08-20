# Deployment Guide (Vercel)

When deploying this Next.js application to Vercel, you need to configure the Environment Variables so the live app can connect to your Supabase database and authentication.

Follow these exact steps:

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** and select **Project**.
3. Import your GitHub repository (`jinendrabanthia/bill-maker-website`).
4. In the **Configure Project** section, before clicking Deploy, locate the **Environment Variables** section.
5. You need to add **two** environment variables. Copy and paste the names and values exactly as shown below:

### Variable 1
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://wbsqkidnupwepvxsmqfk.supabase.co`

### Variable 2
- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indic3FraWRudXB3ZXB2eHNtcWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNjU0MzIsImV4cCI6MjEwMjY0MTQzMn0.Isc5Ir2ZKaulGfLAa44zDAe-iKxpdSO6fkz98qwaGz8`

*(Note: The `DATABASE_URL` and `GEMINI_API_KEY` are not strictly required in Vercel for this app to run, as it relies on the Supabase Client which only needs the URL and ANON_KEY).*

6. Click **Add** for both variables, and then click **Deploy**.

That's it! Vercel will build the app and give you a live production URL where your authentication and database will work just like they do on your local computer.
