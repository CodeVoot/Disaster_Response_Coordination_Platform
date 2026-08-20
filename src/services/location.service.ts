// extracting location from text

export class LocationService {
  static async resolveLocationFromText(description: string): Promise<{ location_name: string, lat: number, lng: number }> {
    // 500ms delay if we need to call external API
    await new Promise(resolve => setTimeout(resolve, 500));

    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('manhattan') || lowerDesc.includes('nyc') || lowerDesc.includes('new york')) {
      return { location_name: 'Manhattan, NYC', lat: 40.7831, lng: -73.9712 };
    }
    if (lowerDesc.includes('san francisco') || lowerDesc.includes('sf')) {
      return { location_name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194 };
    }

    return { location_name: 'Unknown Area (Global)', lat: 0, lng: 0 };
  }
}