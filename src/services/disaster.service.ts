import { db } from '../db';
import { CreateDisasterDTO, UpdateDisasterDTO } from '../types/disaster.schema';

import { LocationService } from './location.service';

export class DisasterService {
  
  static async create(data: CreateDisasterDTO) {
    // default coordinates (0,0) here. 

    const geoInfo = await LocationService.resolveLocationFromText(data.description);


    // without lat and long

    // const query = `
    //   INSERT INTO disasters (title, description, location_name, geom, tags, status, created_by)
    //   VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint(0, 0), 4326), $4, $5, $6)
    //   RETURNING id, title, description, location_name as location, tags, status, created_by, created_at, updated_at;
    // `;

    // with latitude and longitide
    const query = `
      INSERT INTO disasters (title, description, location_name, geom, tags, status, created_by)
      VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6, $7, $8)
      RETURNING 
        id, title, description, location_name as location, 
        ST_Y(geom::geometry) as lat, ST_X(geom::geometry) as lng, -- Return the coordinates to the user
        tags, status, created_by, created_at, updated_at;
    `;


    const values = [data.title, data.description, geoInfo.location_name,geoInfo.lng,
        geoInfo.lat,data.tags, data.status, data.created_by];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async getAll(tag?: string) {
    let query = `
      SELECT id, title, description, location_name as location, tags, status, created_by, created_at, updated_at
      FROM disasters
    `;
    const values: any[] = [];

    // Filters like (?tag=flood)
    if (tag) {
      query += ` WHERE $1 = ANY(tags)`;
      values.push(tag);
    }

    query += ` ORDER BY created_at DESC;`;
    const result = await db.query(query, values);
    return result.rows;
  }

  static async getById(id: number) {
    const query = `
      SELECT id, title, description, location_name as location, tags, status, created_by, created_at, updated_at
      FROM disasters WHERE id = $1;
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  static async update(id: number, data: UpdateDisasterDTO) {
    const fields: string[] = [];
    const values: any[] = [];
    let queryIdx = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        // Map 'location' from DTO to 'location_name' in DB
        const dbColumn = key === 'location' ? 'location_name' : key;
        fields.push(`${dbColumn} = $${queryIdx}`);
        values.push(value);
        queryIdx++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE disasters SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${queryIdx}
      RETURNING id, title, description, location_name as location, status, updated_at;
    `;

    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  static async delete(id: number) {
    const query = `DELETE FROM disasters WHERE id = $1 RETURNING id;`;
    const result = await db.query(query, [id]);
    return result.rowCount ? true : false;
  }

  
    // This will convert the distance search from O(N) to O(logN)
    static async getNearbyResources(lat: number, lng: number, radiusKm: number) {    
    const radiusMeters = radiusKm * 1000;

    const query = `
      SELECT 
        id, name, type, location_name as location,
        ST_Y(geom::geometry) as lat, ST_X(geom::geometry) as lng,
        ROUND((ST_Distance(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)) / 1000)::numeric, 2) AS distance_km
        FROM resources
        WHERE ST_DWithin(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326), $3)
        ORDER BY geom <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)
        LIMIT 100;
    `;
    
    const result = await db.query(query, [lng, lat, radiusMeters]);
    return result.rows;
  }
}