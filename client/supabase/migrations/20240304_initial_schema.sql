-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS trip_matches;
DROP TABLE IF EXISTS trip_connections;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    aadhar_number TEXT UNIQUE NOT NULL,
    is_aadhar_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create trips table
CREATE TABLE trips (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_wallet TEXT NOT NULL REFERENCES users(wallet_address),
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    travel_style TEXT NOT NULL,
    interests TEXT[] NOT NULL,
    description TEXT,
    max_companions INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create trip_connections table
CREATE TABLE trip_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES trips(id),
    requester_wallet TEXT NOT NULL REFERENCES users(wallet_address),
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(trip_id, requester_wallet)
);

-- Create trip_matches table
CREATE TABLE trip_matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES trips(id),
    matched_trip_id UUID NOT NULL REFERENCES trips(id),
    compatibility_score DECIMAL(5,2) NOT NULL,
    match_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(trip_id, matched_trip_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_matches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Anyone can view active trips" ON trips;
DROP POLICY IF EXISTS "Users can view their own trips" ON trips;
DROP POLICY IF EXISTS "Users can create their own trips" ON trips;
DROP POLICY IF EXISTS "Users can update their own trips" ON trips;
DROP POLICY IF EXISTS "Users can view their own connections" ON trip_connections;
DROP POLICY IF EXISTS "Users can create connection requests" ON trip_connections;
DROP POLICY IF EXISTS "Trip creators can update connection status" ON trip_connections;
DROP POLICY IF EXISTS "Users can view matches for their trips" ON trip_matches;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on wallet_address" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON trips;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON trips;
DROP POLICY IF EXISTS "Enable update for trip creators" ON trips;
DROP POLICY IF EXISTS "Enable read access for all users" ON trip_connections;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON trip_connections;
DROP POLICY IF EXISTS "Enable update for trip creators" ON trip_connections;
DROP POLICY IF EXISTS "Enable read access for all users" ON trip_matches;

-- Create policies for users table
CREATE POLICY "Enable read access for all users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for users based on wallet_address" ON users
    FOR UPDATE USING (wallet_address = current_user);

-- Create policies for trips table
CREATE POLICY "Enable read access for all users" ON trips
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON trips
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for trip creators" ON trips
    FOR UPDATE USING (creator_wallet = current_user);

-- Create policies for trip_connections table
CREATE POLICY "Enable read access for all users" ON trip_connections
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON trip_connections
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for trip creators" ON trip_connections
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM trips
            WHERE trips.id = trip_connections.trip_id
            AND trips.creator_wallet = current_user
        )
    );

-- Create policies for trip_matches table
CREATE POLICY "Enable read access for all users" ON trip_matches
    FOR SELECT USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_trips_updated_at ON trips;
DROP TRIGGER IF EXISTS update_trip_connections_updated_at ON trip_connections;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at
    BEFORE UPDATE ON trips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trip_connections_updated_at
    BEFORE UPDATE ON trip_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 