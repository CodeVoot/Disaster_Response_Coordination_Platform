export class ExternalReportsService {
  /**
   * Mocks a real external API (like Twitter/X) that returns messy data,
   * has network latency, and randomly fails 20% of the time.
   */
  static async fetchRawReports(locationName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate a 20% chance of the external API crashing
        if (Math.random() < 0.2) {
          return reject(new Error('External Social Media API is down or rate-limited.'));
        }

        // Mock "messy" external data (wrong key names, etc.)
        resolve([
          { 
            raw_text: `Need drinking water urgently near ${locationName}`, 
            username_handle: "citizen123", 
            timestamp: new Date().toISOString() 
          },
          { 
            raw_text: `Roads are completely flooded in ${locationName}. Send boats!`, 
            username_handle: "rescue_watcher", 
            timestamp: new Date().toISOString() 
          }
        ]);
      }, 800); // 800ms network delay
    });
  }
}