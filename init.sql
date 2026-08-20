-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Create the disasters table
CREATE TABLE IF NOT EXISTS disasters (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    location GEOMETRY(Point, 4326) NOT NULL, -- PostGIS geospatial column
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create the resources table (linking to disasters)
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    disaster_id INTEGER REFERENCES disasters(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- e.g., 'medical', 'food', 'equipment'
    quantity INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Insert mock disasters
INSERT INTO disasters (title, description, type, severity, status, location)
VALUES 
('Downtown Flooding', 'Severe flooding in the lower east side.', 'flood', 'high', 'active', ST_SetSRID(ST_MakePoint(-73.9851, 40.7589), 4326)),
('Suburban Wildfire', 'Brush fire spreading near the hills.', 'fire', 'critical', 'active', ST_SetSRID(ST_MakePoint(-118.2437, 34.0522), 4326)),
('Highway Earthquake Damage', 'Overpass collapsed on route 66.', 'earthquake', 'high', 'resolved', ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326));

-- 4. Insert mock resources
INSERT INTO resources (disaster_id, name, type, quantity, status)
VALUES 
(1, 'Bottled Water', 'supplies', 1000, 'available'),
(1, 'Rescue Boats', 'equipment', 4, 'deployed'),
(2, 'Firefighting Helicopters', 'equipment', 2, 'deployed'),
(3, 'Medical Kits', 'medical', 200, 'available');