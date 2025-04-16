/**
 * Air Quality Analysis Module
 * Implements the Python air quality monitoring model in TypeScript
 */

// AQI Calculation for PM2.5 (EPA Standard)
export function calculateAQI(pm25: number): { label: string; value: number } {
  const breakpoints = [
    { low: 0.0, high: 12.0, aqiLow: 0, aqiHigh: 50 },
    { low: 12.1, high: 35.4, aqiLow: 51, aqiHigh: 100 },
    { low: 35.5, high: 55.4, aqiLow: 101, aqiHigh: 150 },
    { low: 55.5, high: 150.4, aqiLow: 151, aqiHigh: 200 },
    { low: 150.5, high: 250.4, aqiLow: 201, aqiHigh: 300 },
    { low: 250.5, high: 500.4, aqiLow: 301, aqiHigh: 500 }
  ];
  
  const labels = ['Good', 'Moderate', 'Unhealthy for Sensitive Groups', 'Unhealthy', 'Very Unhealthy', 'Hazardous'];
  
  for (let i = 0; i < breakpoints.length; i++) {
    const { low, high, aqiLow, aqiHigh } = breakpoints[i];
    if (low <= pm25 && pm25 <= high) {
      const aqi = ((aqiHigh - aqiLow) / (high - low)) * (pm25 - low) + aqiLow;
      return { label: labels[i], value: Math.round(aqi) };
    }
  }
  
  if (pm25 > 500.4) {
    return { label: 'Hazardous', value: 501 };
  }
  
  return { label: 'Good', value: 0 };
}

// Health Recommendations with Emoji based on AQI
export function getHealthRecommendation(aqi: number): { text: string; emoji: string } {
  if (0 <= aqi && aqi <= 50) {
    return { text: "Air quality is good. No precautions needed.", emoji: "😊" };
  } else if (51 <= aqi && aqi <= 100) {
    return { text: "Air quality is acceptable. Sensitive groups may take care.", emoji: "🙂" };
  } else if (101 <= aqi && aqi <= 150) {
    return { text: "Reduce outdoor activities for sensitive groups.", emoji: "😷" };
  } else if (151 <= aqi && aqi <= 200) {
    return { text: "Wear a mask and limit outdoor exposure.", emoji: "😷" };
  } else if (201 <= aqi && aqi <= 300) {
    return { text: "Stay indoors and use air purifiers.", emoji: "🏠" };
  } else {
    return { text: "Avoid all outdoor activities; wear N95 masks if outside.", emoji: "⚠️" };
  }
}

// Function to create visualization data for map
export function generateMapData(pm25: number, nx = 100, ny = 80, dx = 80, dy = 87.5): {
  data: number[][];
  x: number[];
  y: number[];
  title: string;
} {
  // Create grid arrays
  const x = Array.from({ length: nx }, (_, i) => i * dx);
  const y = Array.from({ length: ny }, (_, i) => i * dy);
  
  // Create empty 2D array for data
  const data: number[][] = Array.from({ length: ny }, () => Array(nx).fill(0));
  
  // Fill with smooth gradient around pm25_base (like in Python version)
  for (let yi = 0; yi < ny; yi++) {
    for (let xi = 0; xi < nx; xi++) {
      // Simplified version of: pm25_base + np.sin(X * 0.1) * np.cos(Y * 0.1) * 2.5 + np.random.normal(0, 1)
      data[yi][xi] = pm25 + Math.sin(xi * 0.1) * Math.cos(yi * 0.1) * 2.5 + (Math.random() * 2 - 1);
      
      // Clip values to reasonable range
      data[yi][xi] = Math.max(0, Math.min(500, data[yi][xi]));
    }
  }
  
  const { label } = calculateAQI(pm25);
  
  return {
    data,
    x,
    y,
    title: `Air Quality Map: ${label}`
  };
}

// Process user input for air quality analysis
export interface AirQualityInput {
  pm25: number;
  pm10: number;
  no2: number;
  co: number;
  so2: number;
  o3: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection?: number;
}

export interface AirQualityAnalysisResult {
  aqi: {
    value: number;
    label: string;
  };
  recommendation: {
    text: string;
    emoji: string;
  };
  mapData: {
    data: number[][];
    x: number[];
    y: number[];
    title: string;
  };
  ranges: {
    good: string;
    moderate: string;
    unhealthySensitive: string;
    unhealthy: string;
    veryUnhealthy: string;
    hazardous: string;
  };
  input: AirQualityInput;
}

export function analyzeAirQuality(input: AirQualityInput): AirQualityAnalysisResult {
  // Ensure non-negative PM2.5
  const pm25 = Math.max(0, input.pm25);
  
  // Compute AQI
  const aqi = calculateAQI(pm25);
  
  // Get health recommendation
  const recommendation = getHealthRecommendation(aqi.value);
  
  // Generate map data
  const mapData = generateMapData(pm25);
  
  // Create response
  return {
    aqi,
    recommendation,
    mapData,
    ranges: {
      good: "0-50: Good",
      moderate: "51-100: Moderate",
      unhealthySensitive: "101-150: Unhealthy for Sensitive Groups",
      unhealthy: "151-200: Unhealthy",
      veryUnhealthy: "201-300: Very Unhealthy",
      hazardous: "301-500: Hazardous"
    },
    input
  };
}