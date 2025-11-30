# Alyssa's Esthetics Scheduler

This is a small Flask application for scheduling mobile lash appointments. Clients can request appointments for a variety of lash styles and manage their information in a simple portal.

## Features

- Request appointments for Classic, Hybrid, Volume, Mega Volume, fills, brow, and lash services (with adjustable price/duration per booking).
- Build invoices with tax, optional travel fees, optional tips, and per-line service totals; supports VIP and loyalty-tier discounts for fills.
- Save Stripe payment_method IDs (card on file) instead of raw card numbers.
- Track client health/EHR-style data fields (DOB, medications, pregnancy/breastfeeding) plus VIP and loyalty tags in the portal.
- View and send simple messages to the artist.
- Simple lavender and grey themed interface with glassy accents.

## Setup

1. Create a virtual environment and install requirements:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the application:
   ```bash
   python run.py
   ```

This is an early prototype and does not include full payment or authentication functionality.

## Mobile App (React Native)

A sample React Native client is provided in the `mobile/` directory using Expo and Supabase.

### Running the mobile app

1. Install dependencies with `npm install` inside the `mobile/` folder.
2. Set your Supabase project URL and anon key in `mobile/supabase.js`.
3. Start the Expo development server:
   ```bash
   npm start
   ```

The app contains four tabs: booking, payment, portal, and messages. Appointment requests are saved to the `appointments` table in Supabase and linked to invoice line items and multi-selected services. Payment details should be tokenized with Stripe before being stored; only store Stripe payment method IDs in Supabase.

### Supabase schema

SQL definitions for the required tables are provided in `supabase_schema.sql`.
Run these commands in your Supabase SQL editor to create the tables for clients, services, appointments, appointment-services, invoices, invoice items, documents, messages, payment methods, and loyalty transactions.
