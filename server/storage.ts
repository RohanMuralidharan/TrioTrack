import { 
  User, InsertUser, 
  AirQualityData, InsertAirQualityData,
  TrafficData, InsertTrafficData,
  Report, InsertReport,
  Location, InsertLocation,
  Prediction, InsertPrediction
} from "@shared/schema";

// Modify the interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Air quality methods
  getAirQualityData(locationId?: string): Promise<AirQualityData[]>;
  addAirQualityData(data: InsertAirQualityData): Promise<AirQualityData>;
  
  // Traffic methods
  getTrafficData(locationId?: string): Promise<TrafficData[]>;
  getTrafficHotspots(): Promise<any[]>;
  addTrafficData(data: InsertTrafficData): Promise<TrafficData>;
  
  // Reports methods
  getReports(filter?: string, page?: number, perPage?: number): Promise<any>;
  getReport(id: number): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: number, status: string): Promise<Report | undefined>;
  
  // Locations methods
  getLocations(): Promise<Location[]>;
  addLocation(location: InsertLocation): Promise<Location>;
  
  // Predictions methods
  getPrediction(locationId: string, type: string): Promise<Prediction | undefined>;
  addPrediction(prediction: InsertPrediction): Promise<Prediction>;
  
  // Dashboard methods
  getStatsOverview(): Promise<any>;
  getMapData(): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private airQualityData: Map<string, AirQualityData[]>;
  private trafficData: Map<string, TrafficData[]>;
  private reports: Report[];
  private locations: Map<string, Location>;
  private predictions: Map<string, Prediction[]>;
  
  private userId: number;
  private airQualityId: number;
  private trafficId: number;
  private reportId: number;
  private predictionId: number;

  constructor() {
    this.users = new Map();
    this.airQualityData = new Map();
    this.trafficData = new Map();
    this.reports = [];
    this.locations = new Map();
    this.predictions = new Map();
    
    this.userId = 1;
    this.airQualityId = 1;
    this.trafficId = 1;
    this.reportId = 1;
    this.predictionId = 1;

    this.initializeData();
  }

  private initializeData() {
    // Initialize with Indian cities data
    const locations: InsertLocation[] = [
      { id: "delhi", name: "Delhi", district: "NCR", coordinates: { lat: 28.6139, lng: 77.2090 } },
      { id: "mumbai", name: "Mumbai", district: "Maharashtra", coordinates: { lat: 19.0760, lng: 72.8777 } },
      { id: "bangalore", name: "Bangalore", district: "Karnataka", coordinates: { lat: 12.9716, lng: 77.5946 } },
      { id: "chennai", name: "Chennai", district: "Tamil Nadu", coordinates: { lat: 13.0827, lng: 80.2707 } },
      { id: "kolkata", name: "Kolkata", district: "West Bengal", coordinates: { lat: 22.5726, lng: 88.3639 } },
      { id: "hyderabad", name: "Hyderabad", district: "Telangana", coordinates: { lat: 17.3850, lng: 78.4867 } },
      { id: "pune", name: "Pune", district: "Maharashtra", coordinates: { lat: 18.5204, lng: 73.8567 } },
      { id: "ahmedabad", name: "Ahmedabad", district: "Gujarat", coordinates: { lat: 23.0225, lng: 72.5714 } }
    ];

    locations.forEach(location => this.addLocation(location));

    // Add sample air quality data for Indian cities
    const airQualitySamples: InsertAirQualityData[] = [
      { locationId: "delhi", aqi: 204, pm25: 160, pm10: 210, no2: 88, o3: 32, co: 12, so2: 18, source: "sensor" },
      { locationId: "mumbai", aqi: 156, pm25: 65, pm10: 122, no2: 51, o3: 28, co: 8, so2: 14, source: "sensor" },
      { locationId: "bangalore", aqi: 95, pm25: 35, pm10: 68, no2: 32, o3: 18, co: 4, so2: 8, source: "sensor" },
      { locationId: "chennai", aqi: 110, pm25: 42, pm10: 85, no2: 39, o3: 21, co: 6, so2: 11, source: "sensor" },
      { locationId: "kolkata", aqi: 184, pm25: 89, pm10: 156, no2: 61, o3: 29, co: 9, so2: 16, source: "sensor" },
      { locationId: "hyderabad", aqi: 112, pm25: 45, pm10: 87, no2: 38, o3: 22, co: 5, so2: 10, source: "sensor" },
      { locationId: "pune", aqi: 84, pm25: 32, pm10: 62, no2: 28, o3: 15, co: 3, so2: 7, source: "sensor" },
      { locationId: "ahmedabad", aqi: 168, pm25: 78, pm10: 140, no2: 58, o3: 27, co: 8, so2: 15, source: "sensor" }
    ];

    airQualitySamples.forEach(sample => this.addAirQualityData(sample));

    // Add sample traffic data for Indian cities
    const trafficSamples: InsertTrafficData[] = [
      { locationId: "delhi", congestionLevel: 92, vehicleCount: 1850, averageSpeed: 8, isHotspot: true },
      { locationId: "mumbai", congestionLevel: 88, vehicleCount: 1720, averageSpeed: 10, isHotspot: true },
      { locationId: "bangalore", congestionLevel: 82, vehicleCount: 1450, averageSpeed: 12, isHotspot: true },
      { locationId: "chennai", congestionLevel: 78, vehicleCount: 1320, averageSpeed: 14, isHotspot: true },
      { locationId: "kolkata", congestionLevel: 85, vehicleCount: 1550, averageSpeed: 11, isHotspot: true },
      { locationId: "hyderabad", congestionLevel: 75, vehicleCount: 1280, averageSpeed: 15, isHotspot: true },
      { locationId: "pune", congestionLevel: 68, vehicleCount: 980, averageSpeed: 18, isHotspot: false },
      { locationId: "ahmedabad", congestionLevel: 72, vehicleCount: 1150, averageSpeed: 16, isHotspot: true }
    ];

    trafficSamples.forEach(sample => this.addTrafficData(sample));

    // Add sample predictions for Indian cities
    const predictionSamples: InsertPrediction[] = [
      { 
        locationId: "delhi", 
        type: "air", 
        currentValue: 204,
        predictedValues: { "2h": 215, "4h": 198, "6h": 175 },
        confidence: 91
      },
      { 
        locationId: "delhi", 
        type: "traffic", 
        currentValue: 92,
        predictedValues: { "1h": 94, "2h": 85, "3h": 76 },
        confidence: 88
      },
      { 
        locationId: "mumbai", 
        type: "air", 
        currentValue: 156,
        predictedValues: { "2h": 168, "4h": 142, "6h": 122 },
        confidence: 89
      },
      { 
        locationId: "mumbai", 
        type: "traffic", 
        currentValue: 88,
        predictedValues: { "1h": 92, "2h": 82, "3h": 75 },
        confidence: 86
      },
      { 
        locationId: "bangalore", 
        type: "air", 
        currentValue: 95,
        predictedValues: { "2h": 105, "4h": 88, "6h": 72 },
        confidence: 84
      }
    ];

    predictionSamples.forEach(sample => this.addPrediction(sample));

    // Add sample reports
    const reportSamples: InsertReport[] = [
      {
        issueType: "airPollution",
        location: "North Industrial Zone, Block 4, Building 7",
        description: "Factory emitting heavy black smoke throughout the day",
        userId: undefined,
        photoUrl: undefined
      },
      {
        issueType: "trafficCongestion",
        location: "West Highway, Mile 23, Exit 12",
        description: "Major accident blocking 2 lanes",
        userId: undefined,
        photoUrl: undefined
      },
      {
        issueType: "flooding",
        location: "Downtown, Oak Street & 7th Avenue",
        description: "Street flooding after heavy rain, water level is about 1 foot",
        userId: undefined,
        photoUrl: undefined
      }
    ];

    reportSamples.forEach(sample => this.createReport(sample));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  // Air quality methods
  async getAirQualityData(locationId?: string): Promise<AirQualityData[]> {
    if (locationId) {
      return this.airQualityData.get(locationId) || [];
    }
    
    // If no locationId provided, return all data
    const allData: AirQualityData[] = [];
    this.airQualityData.forEach(dataArray => {
      allData.push(...dataArray);
    });
    
    return allData;
  }
  
  async addAirQualityData(data: InsertAirQualityData): Promise<AirQualityData> {
    const id = this.airQualityId++;
    const now = new Date();
    const newData = { ...data, id, timestamp: now };
    
    const locationData = this.airQualityData.get(data.locationId) || [];
    locationData.push(newData);
    this.airQualityData.set(data.locationId, locationData);
    
    return newData;
  }
  
  // Traffic methods
  async getTrafficData(locationId?: string): Promise<TrafficData[]> {
    if (locationId) {
      return this.trafficData.get(locationId) || [];
    }
    
    // If no locationId provided, return all data
    const allData: TrafficData[] = [];
    this.trafficData.forEach(dataArray => {
      allData.push(...dataArray);
    });
    
    return allData;
  }
  
  async getTrafficHotspots(): Promise<any[]> {
    const hotspots: any[] = [];
    
    // Get data for all locations
    const allTrafficData = await this.getTrafficData();
    
    // Find hotspots (those with isHotspot = true or congestionLevel > 70)
    const hotspotData = allTrafficData.filter(data => 
      data.isHotspot || data.congestionLevel > 70
    );
    
    // Format data for frontend
    for (const data of hotspotData) {
      const location = this.locations.get(data.locationId);
      if (!location) continue;
      
      let severity: 'L' | 'M' | 'H' = 'L';
      if (data.congestionLevel >= 90) severity = 'H';
      else if (data.congestionLevel >= 70) severity = 'M';
      
      hotspots.push({
        id: data.id.toString(),
        location: location.name,
        description: severity === 'H' ? 'Severe congestion' : 
                     severity === 'M' ? 'Heavy traffic' : 'Moderate congestion',
        congestionLevel: data.congestionLevel,
        severity
      });
    }
    
    // Sort by congestion level (descending)
    hotspots.sort((a, b) => b.congestionLevel - a.congestionLevel);
    
    return hotspots;
  }
  
  async addTrafficData(data: InsertTrafficData): Promise<TrafficData> {
    const id = this.trafficId++;
    const now = new Date();
    const newData = { ...data, id, timestamp: now };
    
    const locationData = this.trafficData.get(data.locationId) || [];
    locationData.push(newData);
    this.trafficData.set(data.locationId, locationData);
    
    return newData;
  }
  
  // Reports methods
  async getReports(filter: string = 'all', page: number = 1, perPage: number = 10): Promise<any> {
    let filteredReports = [...this.reports];
    
    // Apply filter if specified
    if (filter !== 'all') {
      filteredReports = filteredReports.filter(report => {
        // Extract the type from report.issueType
        return report.issueType.toLowerCase().includes(filter.toLowerCase());
      });
    }
    
    // Sort by creation date (newest first)
    filteredReports.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Paginate
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedReports = filteredReports.slice(startIndex, endIndex);
    
    // Format for frontend
    const formattedReports = paginatedReports.map(report => {
      const issueParts = formatIssueType(report.issueType);
      const date = formatDate(report.createdAt);
      const status = formatStatus(report.status);
      
      return {
        id: report.id.toString(),
        issue: {
          title: capitalizeFirstLetter(report.issueType),
          type: issueParts.type,
          icon: issueParts.icon,
          iconBg: issueParts.iconBg,
          iconColor: issueParts.iconColor
        },
        location: {
          area: report.location.split(',')[0],
          details: report.location.split(',').slice(1).join(',').trim()
        },
        reporter: {
          name: "Citizen Reporter", // In a real app, would get from user record
          role: "Citizen"
        },
        date,
        status
      };
    });
    
    return {
      reports: formattedReports,
      total: filteredReports.length,
      page,
      perPage,
      totalPages: Math.ceil(filteredReports.length / perPage)
    };
  }
  
  async getReport(id: number): Promise<Report | undefined> {
    return this.reports.find(report => report.id === id);
  }
  
  async createReport(report: InsertReport): Promise<Report> {
    const id = this.reportId++;
    const now = new Date();
    const newReport = { 
      ...report, 
      id, 
      status: "pending", 
      createdAt: now, 
      updatedAt: now 
    };
    
    this.reports.push(newReport);
    return newReport;
  }
  
  async updateReport(id: number, status: string): Promise<Report | undefined> {
    const reportIndex = this.reports.findIndex(report => report.id === id);
    if (reportIndex === -1) return undefined;
    
    const now = new Date();
    this.reports[reportIndex] = {
      ...this.reports[reportIndex],
      status,
      updatedAt: now
    };
    
    return this.reports[reportIndex];
  }
  
  // Locations methods
  async getLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }
  
  async addLocation(location: InsertLocation): Promise<Location> {
    this.locations.set(location.id, location);
    return location;
  }
  
  // Predictions methods
  async getPrediction(locationId: string, type: string): Promise<Prediction | undefined> {
    const key = `${locationId}-${type}`;
    const predictions = this.predictions.get(key);
    
    if (!predictions || predictions.length === 0) {
      return undefined;
    }
    
    // Return the most recent prediction
    return predictions.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })[0];
  }
  
  async addPrediction(prediction: InsertPrediction): Promise<Prediction> {
    const id = this.predictionId++;
    const now = new Date();
    const newPrediction = { ...prediction, id, createdAt: now };
    
    const key = `${prediction.locationId}-${prediction.type}`;
    const existingPredictions = this.predictions.get(key) || [];
    existingPredictions.push(newPrediction);
    this.predictions.set(key, existingPredictions);
    
    return newPrediction;
  }
  
  // Dashboard methods
  async getStatsOverview(): Promise<any> {
    // Collect & summarize data for the dashboard
    const airQualityAll = await this.getAirQualityData();
    const trafficAll = await this.getTrafficData();
    const reportsAll = this.reports;
    
    // Air quality stats
    const recentAqi = airQualityAll.length > 0 
      ? airQualityAll.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0].aqi
      : 0;
    
    const lastWeekAqi = 120; // In a real app, would calculate from historical data
    const aqiChange = recentAqi > lastWeekAqi 
      ? { value: `${Math.round((recentAqi - lastWeekAqi) / lastWeekAqi * 100)}%`, type: 'increase' as const } 
      : { value: `${Math.round((lastWeekAqi - recentAqi) / lastWeekAqi * 100)}%`, type: 'decrease' as const };
    
    let aqiStatus = 'Good';
    if (recentAqi > 300) aqiStatus = 'Hazardous';
    else if (recentAqi > 200) aqiStatus = 'Very unhealthy';
    else if (recentAqi > 150) aqiStatus = 'Unhealthy';
    else if (recentAqi > 100) aqiStatus = 'Unhealthy for sensitive groups';
    else if (recentAqi > 50) aqiStatus = 'Moderate';
    
    // Traffic congestion stats
    const avgCongestion = trafficAll.length > 0
      ? Math.round(trafficAll.reduce((sum, item) => sum + item.congestionLevel, 0) / trafficAll.length)
      : 0;
    
    const lastWeekCongestion = 72; // In a real app, would calculate from historical data
    const congestionChange = avgCongestion > lastWeekCongestion
      ? { value: `${Math.abs(avgCongestion - lastWeekCongestion)}%`, type: 'increase' as const }
      : { value: `${Math.abs(lastWeekCongestion - avgCongestion)}%`, type: 'decrease' as const };
    
    let congestionStatus = 'Light traffic';
    if (avgCongestion > 80) congestionStatus = 'Severe congestion';
    else if (avgCongestion > 60) congestionStatus = 'Moderate congestion';
    else if (avgCongestion > 40) congestionStatus = 'Some congestion';
    
    // Flood risk areas (in a real app would come from flood sensors)
    const floodRiskAreas = 3;
    const lastWeekFloodRisk = 2;
    const floodChange = floodRiskAreas > lastWeekFloodRisk
      ? { value: floodRiskAreas - lastWeekFloodRisk, type: 'increase' as const }
      : { value: lastWeekFloodRisk - floodRiskAreas, type: 'decrease' as const };
    
    // Reports stats
    const todayReports = reportsAll.filter(report => {
      const today = new Date();
      const reportDate = new Date(report.createdAt);
      return reportDate.getDate() === today.getDate() && 
             reportDate.getMonth() === today.getMonth() &&
             reportDate.getFullYear() === today.getFullYear();
    }).length;
    
    const yesterdayReports = 20; // In a real app, would calculate from historical data
    const reportsChange = todayReports > yesterdayReports
      ? { value: todayReports - yesterdayReports, type: 'increase' as const }
      : { value: yesterdayReports - todayReports, type: 'decrease' as const };
    
    const resolvedReports = reportsAll.filter(report => report.status === 'resolved').length;
    const pendingReports = reportsAll.length - resolvedReports;
    
    return {
      airQuality: {
        value: recentAqi,
        change: aqiChange,
        status: aqiStatus
      },
      trafficCongestion: {
        value: `${avgCongestion}%`,
        change: congestionChange,
        status: congestionStatus
      },
      floodRisk: {
        value: floodRiskAreas,
        change: floodChange,
        status: `2 low risk, 1 medium risk`
      },
      citizenReports: {
        value: todayReports,
        change: reportsChange,
        status: `${resolvedReports} resolved, ${pendingReports} pending`
      }
    };
  }
  
  async getMapData(): Promise<any> {
    const locations = await this.getLocations();
    const airQualityData = await this.getAirQualityData();
    const trafficData = await this.getTrafficData();
    
    // Create GeoJSON features
    const features = locations.map(location => {
      // Find latest air quality and traffic data for this location
      const locationAirQuality = airQualityData
        .filter(d => d.locationId === location.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        
      const locationTraffic = trafficData
        .filter(d => d.locationId === location.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [location.coordinates.lng, location.coordinates.lat]
        },
        properties: {
          id: location.id,
          name: location.name,
          district: location.district,
          airQuality: locationAirQuality ? {
            aqi: locationAirQuality.aqi,
            status: getAqiStatus(locationAirQuality.aqi),
            color: getAqiColor(locationAirQuality.aqi)
          } : null,
          traffic: locationTraffic ? {
            congestionLevel: locationTraffic.congestionLevel,
            status: getTrafficStatus(locationTraffic.congestionLevel),
            color: getTrafficColor(locationTraffic.congestionLevel)
          } : null
        }
      };
    });
    
    return {
      type: "FeatureCollection",
      features
    };
  }
}

// Helper functions
function formatIssueType(issueType: string) {
  switch (issueType.toLowerCase()) {
    case 'airpollution':
      return {
        type: 'Air Pollution',
        icon: 'ri-bubble-chart-line',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600'
      };
    case 'trafficcongestion':
      return {
        type: 'Traffic Congestion',
        icon: 'ri-traffic-line',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600'
      };
    case 'flooding':
      return {
        type: 'Flooding',
        icon: 'ri-flood-line',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600'
      };
    case 'noisepollution':
      return {
        type: 'Noise Pollution',
        icon: 'ri-volume-up-line',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600'
      };
    default:
      return {
        type: 'Other',
        icon: 'ri-error-warning-line',
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-600'
      };
  }
}

function formatDate(dateString: Date) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  } else if (diffInDays === 1) {
    return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + 
           `, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }
}

function formatStatus(status: string) {
  switch(status) {
    case 'pending':
      return {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800'
      };
    case 'in_progress':
      return {
        label: 'In Progress',
        color: 'bg-yellow-100 text-yellow-800'
      };
    case 'resolved':
      return {
        label: 'Resolved',
        color: 'bg-green-100 text-green-800'
      };
    case 'urgent':
      return {
        label: 'Urgent',
        color: 'bg-red-100 text-red-800'
      };
    default:
      return {
        label: 'Unknown',
        color: 'bg-gray-100 text-gray-800'
      };
  }
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getAqiStatus(aqi: number) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

function getAqiColor(aqi: number) {
  if (aqi <= 50) return "#10B981"; // green-500
  if (aqi <= 100) return "#F59E0B"; // yellow-500
  if (aqi <= 150) return "#F97316"; // orange-500
  if (aqi <= 200) return "#EF4444"; // red-500
  if (aqi <= 300) return "#8B5CF6"; // purple-500
  return "#7F1D1D"; // rose-900
}

function getTrafficStatus(congestion: number) {
  if (congestion <= 30) return "Light";
  if (congestion <= 60) return "Moderate";
  if (congestion <= 80) return "Heavy";
  return "Severe";
}

function getTrafficColor(congestion: number) {
  if (congestion <= 30) return "#10B981"; // green-500
  if (congestion <= 60) return "#F59E0B"; // yellow-500
  if (congestion <= 80) return "#F97316"; // orange-500
  return "#EF4444"; // red-500
}

export const storage = new MemStorage();
