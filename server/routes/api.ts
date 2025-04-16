import { Router } from 'express';
import { airQualityModel } from '../models/airQualityModel';
import { analyzeAirQuality, AirQualityInput } from '../airQualityAnalysis';
import { storage } from '../storage';

const router = Router();

// Air quality analysis endpoint
router.post('/air-quality/analyze', async (req, res) => {
  try {
    const locationId = req.body.locationId;
    if (!locationId) {
      return res.status(400).json({ error: 'Location ID is required' });
    }

    // Get current air quality data
    const airQualityData = await storage.getAirQualityData(locationId);
    if (!airQualityData || airQualityData.length === 0) {
      return res.status(404).json({ error: 'No air quality data found for this location' });
    }

    // Get the most recent data
    const currentData = airQualityData[0];

    // Prepare input for analysis
    const input: AirQualityInput = {
      pm25: currentData.pm25 || 0,
      pm10: currentData.pm10 || 0,
      no2: currentData.no2 || 0,
      co: currentData.co || 0,
      so2: currentData.so2 || 0,
      o3: currentData.o3 || 0,
      temperature: 25, // default values since not available in data
      humidity: 50,
      windSpeed: 0,
      windDirection: undefined
    };

    // Get current analysis
    const analysis = analyzeAirQuality(input);

    // Get predictions
    const predictions = await airQualityModel.predict(locationId);

    // Combine analysis and predictions
    const response = {
      ...analysis,
      predictions
    };

    res.json(response);
  } catch (error) {
    console.error('Error in air quality analysis:', error);
    res.status(500).json({ 
      error: 'Failed to analyze air quality',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 