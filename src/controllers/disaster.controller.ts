import { Request, Response } from 'express';
import { DisasterService } from '../services/disaster.service';
import { CreateDisasterSchema, UpdateDisasterSchema } from '../types/disaster.schema';

import { ResourceQuerySchema } from '../types/disaster.schema';

import NodeCache from 'node-cache';
import { ExternalReportsService } from '../services/external-reports.service';

// Initialize cache: items live for 60 seconds (stdTTL)
const reportsCache = new NodeCache({ stdTTL: 60 });


export class DisasterController {

  // Now we need to tell our API to broadcast a message to all connected 
  // clients whenever a disaster is created.
  static async create(req: Request, res: Response) {
    try {
      const validatedData = CreateDisasterSchema.parse(req.body); // validation point
      const disaster = await DisasterService.create(validatedData);

      const io = req.app.get('io'); 
      io.emit('disaster_updated', { type: 'NEW_DISASTER', data: disaster });

      res.status(201).json(disaster);
    } catch (error: any) {
      if (error.name === 'ZodError') return res.status(400).json({ error: error.errors });
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const tag = req.query.tag as string;
      const disasters = await DisasterService.getAll(tag);
      res.status(200).json(disasters);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const disaster = await DisasterService.getById(Number(req.params.id));
      if (!disaster) return res.status(404).json({ error: 'Disaster not found' });
      res.status(200).json(disaster);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const validatedData = UpdateDisasterSchema.parse(req.body);
      const updated = await DisasterService.update(Number(req.params.id), validatedData);
      
      if (!updated) return res.status(404).json({ error: 'Disaster not found or no data provided' });

      const io = req.app.get('io');
      io.emit('disaster_updated', { type: 'DISASTER_UPDATED', data: updated });

      res.status(200).json(updated);
    } catch (error: any) {
      if (error.name === 'ZodError') return res.status(400).json({ error: error.errors });
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const deleted = await DisasterService.delete(Number(req.params.id));
      if (!deleted) return res.status(404).json({ error: 'Disaster not found' });
      res.status(204).send(); // 204 No Content is standard for successful deletions
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }


  // Import ResourceQuerySchema at the top!
  static async getResources(req: Request, res: Response) {
    try {
      const queryParams = ResourceQuerySchema.parse(req.query);
      
      const resources = await DisasterService.getNearbyResources(
        queryParams.lat, 
        queryParams.lng, 
        queryParams.radius
      );
      
      res.status(200).json(resources);
    } catch (error: any) {
      if (error.name === 'ZodError') return res.status(400).json({ error: error.errors });
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getReports(req: Request, res: Response) {
    try {
      const disasterId = Number(req.params.id);
      
      // disaster location from db first 
      const disaster = await DisasterService.getById(disasterId);
      if (!disaster) {
        return res.status(404).json({ error: 'Disaster not found' });
      }

      const cacheKey = `reports_${disasterId}`;

      // 2. cahcec check
      if (reportsCache.has(cacheKey)) {
        console.log(`Cache Hit for disaster ${disasterId}`);
        return res.status(200).json(reportsCache.get(cacheKey));
      }

      console.log(`Cache Miss. Fetching external data for ${disaster.location}...`);

      // 3. fetch external data available in my db
      const rawReports = await ExternalReportsService.fetchRawReports(disaster.location);

      // 4. NORMALIZE DATA: Map messy external fields to our required API contract
      const normalizedReports = rawReports.map((report: any) => ({
        content: report.raw_text,
        user: report.username_handle,
        created_at: report.timestamp
      }));

      // 5. SAVE TO CACHE
      reportsCache.set(cacheKey, normalizedReports);

      return res.status(200).json(normalizedReports);

    } catch (error: any) {
      console.error('External API Error:', error.message);
      
      return res.status(502).json({ 
        error: 'Failed to fetch community reports from external providers at this time.',
        data: [] 
      });
    }
  }

  
}