import request from 'supertest';
import app from '../app';
import { DisasterService } from '../services/disaster.service';
import { ExternalReportsService } from '../services/external-reports.service';

jest.mock('../services/disaster.service');
jest.mock('../services/external-reports.service');

describe('Disaster API Tests', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // API Endpoint 
  it('GET /disasters/:id - should return a disaster successfully', async () => {
    const mockDisaster = { id: 1, title: 'Flood', description: 'Heavy rain' };
    
    // Cleaner syntax that won't break the parser!
    jest.mocked(DisasterService.getById).mockResolvedValue(mockDisaster as any);

    const res = await request(app).get('/disasters/1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockDisaster);
    expect(DisasterService.getById).toHaveBeenCalledWith(1);
  });

  // Validation/Error Scenario
  it('POST /disasters - should fail with 400 if validation (Zod) fails', async () => {
    const res = await request(app)
      .post('/disasters')
      .set('Authorization', 'Bearer admin-secret-token')
      .send({}); // Missing title, description, etc.

     expect(res.status).toBe(400);
    expect(DisasterService.create).not.toHaveBeenCalled();
  });

  // Role-Based Access Control
  it('DELETE /disasters/:id - should block Contributors (403 Forbidden)', async () => {
    const res = await request(app)
      .delete('/disasters/1')
      .set('Authorization', 'Bearer contrib-secret-token');

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Forbidden');
  });

  // External Integration/Mock
  it('GET /disasters/:id/reports - should fetch external data and normalize it', async () => {
    jest.mocked(DisasterService.getById).mockResolvedValue({ location: 'Manhattan, NYC' } as any);
    
    const mockMessyData = [
      { raw_text: "Need water", username_handle: "user1", timestamp: "2026-08-21T00:00:00Z" }
    ];
    jest.mocked(ExternalReportsService.fetchRawReports).mockResolvedValue(mockMessyData as any);

    const res = await request(app).get('/disasters/1/reports');

    expect(res.status).toBe(200);
    expect(res.body[0]).toHaveProperty('content', 'Need water');
    expect(res.body[0]).toHaveProperty('user', 'user1');
    expect(res.body[0]).toHaveProperty('created_at', '2026-08-21T00:00:00Z');
  });

});