/*
  # Travel Itinerary Planner Schema

  ## Overview
  Creates the database structure for a travel itinerary planning application that generates
  optimized day-wise travel plans based on destination, budget, and preferences.

  ## New Tables
  
  ### trips
  Main table storing trip information and user inputs
  - `id` (uuid, primary key) - Unique trip identifier
  - `destination` (text) - Country or city name
  - `days` (integer) - Number of days for the trip
  - `budget` (decimal) - Total budget for the trip
  - `currency` (text) - Currency code (USD, INR, etc.)
  - `travel_style` (text) - Travel style preference (Solo/Family/Backpacker)
  - `starting_location` (text) - Hotel or landmark to start from
  - `created_at` (timestamptz) - When the trip was created

  ### itinerary_items
  Stores individual items in the day-by-day itinerary
  - `id` (uuid, primary key) - Unique item identifier
  - `trip_id` (uuid, foreign key) - Reference to trips table
  - `day_number` (integer) - Which day of the trip (1, 2, 3, etc.)
  - `time_slot` (text) - Time of activity (Morning/Afternoon/Evening)
  - `category` (text) - Type of item (place/food/travel)
  - `name` (text) - Name of place, restaurant, or activity
  - `description` (text) - Details about the item
  - `estimated_cost` (decimal) - Estimated cost for this item
  - `estimated_duration` (integer) - Duration in minutes
  - `order_index` (integer) - Order within the day
  - `created_at` (timestamptz) - When the item was created

  ## Security
  - Enable RLS on both tables
  - Public read access for now (can be restricted later with auth)
  - Public insert access for creating trips and itineraries
*/

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination text NOT NULL,
  days integer NOT NULL CHECK (days > 0 AND days <= 30),
  budget decimal(10, 2) NOT NULL CHECK (budget > 0),
  currency text NOT NULL DEFAULT 'USD',
  travel_style text NOT NULL CHECK (travel_style IN ('Solo', 'Family', 'Backpacker')),
  starting_location text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create itinerary_items table
CREATE TABLE IF NOT EXISTS itinerary_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number integer NOT NULL CHECK (day_number > 0),
  time_slot text NOT NULL CHECK (time_slot IN ('Morning', 'Afternoon', 'Evening')),
  category text NOT NULL CHECK (category IN ('place', 'food', 'travel')),
  name text NOT NULL,
  description text DEFAULT '',
  estimated_cost decimal(10, 2) DEFAULT 0 CHECK (estimated_cost >= 0),
  estimated_duration integer DEFAULT 60 CHECK (estimated_duration > 0),
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_itinerary_items_trip_id ON itinerary_items(trip_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_day ON itinerary_items(trip_id, day_number);

-- Enable Row Level Security
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;

-- Public access policies for MVP (can be restricted with auth later)
CREATE POLICY "Anyone can view trips"
  ON trips FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can create trips"
  ON trips FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view itinerary items"
  ON itinerary_items FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can create itinerary items"
  ON itinerary_items FOR INSERT
  TO anon
  WITH CHECK (true);