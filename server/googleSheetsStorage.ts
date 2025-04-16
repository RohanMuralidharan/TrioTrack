import { google, sheets_v4 } from 'googleapis';
import {
  IStorage,
  User, InsertUser,
  AirQualityData, InsertAirQualityData,
  TrafficData, InsertTrafficData,
  Report, InsertReport,
  Location, InsertLocation,
  Prediction, InsertPrediction
} from '../shared/schema';

// Constants for the sheet names
const SHEET_NAMES = {
  USERS: 'Users',
  AIR_QUALITY: 'AirQualityData',
  TRAFFIC: 'TrafficData',
  REPORTS: 'Reports',
  LOCATIONS: 'Locations',
  PREDICTIONS: 'Predictions'
};

export class GoogleSheetsStorage implements IStorage {
  private sheets: sheets_v4.Sheets;
  private spreadsheetId: string;
  
  // ID counters
  private userId: number = 1;
  private airQualityId: number = 1;
  private trafficId: number = 1;
  private reportId: number = 1;
  private predictionId: number = 1;
  
  constructor(spreadsheetId: string) {
    try {
      // Load credentials from environment variable
      if (!process.env.GOOGLE_API_CREDENTIALS) {
        throw new Error('Google API credentials not found in environment variables');
      }
      
      // Parse credentials, making sure to handle escaped newlines
      let credentials;
      try {
        credentials = JSON.parse(process.env.GOOGLE_API_CREDENTIALS);
      } catch (parseError) {
        console.error('Error parsing Google API credentials:', parseError);
        throw new Error('Invalid Google API credentials format');
      }
      
      // Check for required credential properties
      if (!credentials.client_email || !credentials.private_key) {
        throw new Error('Google API credentials missing required fields (client_email, private_key)');
      }
      
      // Create a new JWT client using the credentials
      const auth = new google.auth.JWT(
        credentials.client_email,
        undefined,
        credentials.private_key.replace(/\\n/g, '\n'), // Ensure newlines are correctly formatted
        ['https://www.googleapis.com/auth/spreadsheets']
      );
      
      // Create the sheets client
      this.sheets = google.sheets({ version: 'v4', auth });
      this.spreadsheetId = spreadsheetId;
      
      console.log('Google Sheets storage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Sheets storage:', error);
      throw new Error('Failed to initialize Google Sheets storage');
    }
  }

  // Initialize the spreadsheet with required sheets and headers
  async initializeSpreadsheet(): Promise<void> {
    try {
      // Get the existing sheets in the spreadsheet
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId
      });
      
      const existingSheets = response.data.sheets?.map(sheet => sheet.properties?.title) || [];
      
      // Create any missing sheets
      for (const sheetName of Object.values(SHEET_NAMES)) {
        if (!existingSheets.includes(sheetName)) {
          await this.createSheet(sheetName);
          await this.addHeaderRow(sheetName);
        }
      }
      
      // Initialize counters
      await this.initializeCounters();
      
      // Initialize sample data for testing
      await this.initializeSampleData();
      
      console.log('Spreadsheet initialized successfully');
    } catch (error) {
      console.error('Failed to initialize spreadsheet:', error);
      throw new Error('Failed to initialize spreadsheet');
    }
  }
  
  private async createSheet(sheetName: string): Promise<void> {
    try {
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName
                }
              }
            }
          ]
        }
      });
      console.log(`Created sheet: ${sheetName}`);
    } catch (error) {
      console.error(`Failed to create sheet ${sheetName}:`, error);
      throw error;
    }
  }
  
  private async addHeaderRow(sheetName: string): Promise<void> {
    let headers: string[] = [];
    
    switch (sheetName) {
      case SHEET_NAMES.USERS:
        headers = ['id', 'username', 'password', 'role', 'createdAt'];
        break;
      case SHEET_NAMES.AIR_QUALITY:
        headers = ['id', 'locationId', 'aqi', 'pm25', 'pm10', 'no2', 'o3', 'co', 'so2', 'source', 'timestamp'];
        break;
      case SHEET_NAMES.TRAFFIC:
        headers = ['id', 'locationId', 'congestionLevel', 'vehicleCount', 'averageSpeed', 'isHotspot', 'timestamp'];
        break;
      case SHEET_NAMES.REPORTS:
        headers = ['id', 'issueType', 'location', 'description', 'photoUrl', 'userId', 'status', 'createdAt', 'updatedAt'];
        break;
      case SHEET_NAMES.LOCATIONS:
        headers = ['id', 'name', 'latitude', 'longitude', 'district', 'state', 'country', 'population'];
        break;
      case SHEET_NAMES.PREDICTIONS:
        headers = ['id', 'locationId', 'type', 'currentValue', 'predictions', 'confidence', 'timestamp'];
        break;
      default:
        throw new Error(`Unknown sheet name: ${sheetName}`);
    }
    
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A1:Z1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers]
      }
    });
    
    console.log(`Added headers to sheet: ${sheetName}`);
  }
  
  private async initializeCounters(): Promise<void> {
    // Initialize ID counters based on existing data
    for (const [counterName, sheetName] of [
      ['userId', SHEET_NAMES.USERS],
      ['airQualityId', SHEET_NAMES.AIR_QUALITY],
      ['trafficId', SHEET_NAMES.TRAFFIC],
      ['reportId', SHEET_NAMES.REPORTS],
      ['predictionId', SHEET_NAMES.PREDICTIONS]
    ]) {
      const data = await this.getSheetData(sheetName);
      if (data.length > 1) { // > 1 because first row is headers
        const maxId = Math.max(...data.slice(1).map(row => parseInt(row[0]) || 0));
        this[counterName as keyof GoogleSheetsStorage] = maxId + 1;
      }
    }
  }
  
  private async initializeSampleData(): Promise<void> {
    // Check if we have any data already
    const locations = await this.getLocations();
    
    // If no locations, add sample data
    if (locations.length === 0) {
      // Indian cities data
      const indianCities = [
        { id: 'delhi', name: 'Delhi', latitude: 28.6139, longitude: 77.2090, district: 'Central Delhi', state: 'Delhi', country: 'India', population: 21000000 },
        { id: 'mumbai', name: 'Mumbai', latitude: 19.0760, longitude: 72.8777, district: 'Mumbai City', state: 'Maharashtra', country: 'India', population: 12400000 },
        { id: 'bangalore', name: 'Bangalore', latitude: 12.9716, longitude: 77.5946, district: 'Bangalore Urban', state: 'Karnataka', country: 'India', population: 8400000 },
        { id: 'chennai', name: 'Chennai', latitude: 13.0827, longitude: 80.2707, district: 'Chennai', state: 'Tamil Nadu', country: 'India', population: 7100000 },
        { id: 'kolkata', name: 'Kolkata', latitude: 22.5726, longitude: 88.3639, district: 'Kolkata', state: 'West Bengal', country: 'India', population: 4500000 },
        { id: 'hyderabad', name: 'Hyderabad', latitude: 17.3850, longitude: 78.4867, district: 'Hyderabad', state: 'Telangana', country: 'India', population: 6800000 },
        { id: 'pune', name: 'Pune', latitude: 18.5204, longitude: 73.8567, district: 'Pune', state: 'Maharashtra', country: 'India', population: 3100000 },
        { id: 'ahmedabad', name: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714, district: 'Ahmedabad', state: 'Gujarat', country: 'India', population: 5500000 }
      ];
      
      for (const city of indianCities) {
        await this.addLocation({
          id: city.id,
          name: city.name,
          latitude: city.latitude,
          longitude: city.longitude,
          district: city.district,
          state: city.state,
          country: city.country,
          population: city.population
        });
      }
      
      // Add air quality data for each city
      const airQualityLevels: {[key: string]: number} = {
        'delhi': 204, // Delhi has very unhealthy air
        'mumbai': 142, // Mumbai has unhealthy air for sensitive groups
        'bangalore': 95, // Bangalore has moderate air
        'chennai': 89, // Chennai has moderate air
        'kolkata': 156, // Kolkata has unhealthy air
        'hyderabad': 101, // Hyderabad has unhealthy air for sensitive groups
        'pune': 85, // Pune has moderate air
        'ahmedabad': 132 // Ahmedabad has unhealthy air for sensitive groups
      };
      
      for (const [locationId, aqi] of Object.entries(airQualityLevels)) {
        await this.addAirQualityData({
          locationId,
          aqi,
          pm25: aqi * 0.8,
          pm10: aqi * 1.1,
          no2: Math.min(40 + aqi * 0.2, 100),
          o3: Math.min(20 + aqi * 0.1, 50),
          co: Math.min(5 + aqi * 0.05, 20),
          so2: Math.min(10 + aqi * 0.1, 30),
          source: 'sensor',
          timestamp: new Date()
        });
      }
      
      // Add traffic data for each city
      const trafficLevels: {[key: string]: number} = {
        'delhi': 85, // Delhi has severe congestion
        'mumbai': 78, // Mumbai has heavy traffic
        'bangalore': 75, // Bangalore has heavy traffic
        'chennai': 65, // Chennai has heavy traffic
        'kolkata': 72, // Kolkata has heavy traffic
        'hyderabad': 62, // Hyderabad has heavy traffic
        'pune': 58, // Pune has moderate congestion
        'ahmedabad': 52 // Ahmedabad has moderate congestion
      };
      
      for (const [locationId, congestionLevel] of Object.entries(trafficLevels)) {
        await this.addTrafficData({
          locationId,
          congestionLevel,
          vehicleCount: Math.floor(1000 + congestionLevel * 20),
          averageSpeed: Math.max(60 - congestionLevel * 0.5, 10),
          isHotspot: congestionLevel > 70,
          timestamp: new Date()
        });
      }
      
      // Add sample reports
      const sampleReports = [
        {
          issueType: 'AirPollution',
          location: 'Delhi, Connaught Place',
          description: 'Extremely poor air quality observed. Visibility is less than 100 meters. Breathing is difficult.',
          status: 'open'
        },
        {
          issueType: 'TrafficCongestion',
          location: 'Mumbai, Western Express Highway',
          description: 'Severe traffic jam stretching several kilometers. Construction work causing bottlenecks.',
          status: 'inProgress'
        },
        {
          issueType: 'NoisePollution',
          location: 'Bangalore, MG Road',
          description: 'Construction site exceeding permissible noise levels throughout night hours.',
          status: 'open'
        },
        {
          issueType: 'WaterPollution',
          location: 'Chennai, Marina Beach',
          description: 'Oil spill observed near the shore. Water has visible contamination and strong odor.',
          status: 'resolved'
        },
        {
          issueType: 'GarbageDisposal',
          location: 'Kolkata, Park Street',
          description: 'Overflowing garbage bins not collected for 3 days. Health hazard in busy commercial area.',
          status: 'open'
        }
      ];
      
      for (const report of sampleReports) {
        await this.createReport({
          ...report,
          photoUrl: null,
          userId: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      console.log('Sample data initialized successfully');
    }
  }
  
  /* Helper methods for Sheet operations */
  
  private async getSheetData(sheetName: string): Promise<string[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: sheetName
      });
      
      return response.data.values || [];
    } catch (error) {
      console.error(`Failed to get data from sheet ${sheetName}:`, error);
      return [];
    }
  }
  
  private async appendRow(sheetName: string, values: any[]): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [values]
        }
      });
    } catch (error) {
      console.error(`Failed to append row to sheet ${sheetName}:`, error);
      throw error;
    }
  }
  
  private async updateRow(sheetName: string, rowIndex: number, values: any[]): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A${rowIndex + 1}:Z${rowIndex + 1}`, // +1 because sheets are 1-indexed
        valueInputOption: 'RAW',
        requestBody: {
          values: [values]
        }
      });
    } catch (error) {
      console.error(`Failed to update row ${rowIndex} in sheet ${sheetName}:`, error);
      throw error;
    }
  }
  
  private formatDate(date: Date | null): string {
    if (!date) return '';
    return date.toISOString();
  }
  
  private parseDate(dateString: string): Date | null {
    if (!dateString) return null;
    return new Date(dateString);
  }
  
  /* IStorage Implementation Methods */
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const data = await this.getSheetData(SHEET_NAMES.USERS);
    const headers = data[0];
    const userRow = data.slice(1).find(row => parseInt(row[headers.indexOf('id')]) === id);
    
    if (!userRow) return undefined;
    
    return {
      id: parseInt(userRow[headers.indexOf('id')]),
      username: userRow[headers.indexOf('username')],
      password: userRow[headers.indexOf('password')],
      role: userRow[headers.indexOf('role')],
      createdAt: this.parseDate(userRow[headers.indexOf('createdAt')])
    };
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const data = await this.getSheetData(SHEET_NAMES.USERS);
    const headers = data[0];
    const userRow = data.slice(1).find(row => row[headers.indexOf('username')] === username);
    
    if (!userRow) return undefined;
    
    return {
      id: parseInt(userRow[headers.indexOf('id')]),
      username: userRow[headers.indexOf('username')],
      password: userRow[headers.indexOf('password')],
      role: userRow[headers.indexOf('role')],
      createdAt: this.parseDate(userRow[headers.indexOf('createdAt')])
    };
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser = {
      id,
      ...user,
      createdAt: new Date()
    };
    
    await this.appendRow(
      SHEET_NAMES.USERS, 
      [
        id,
        user.username,
        user.password,
        user.role || 'user',
        this.formatDate(new Date())
      ]
    );
    
    return newUser;
  }
  
  // Air quality methods
  async getAirQualityData(locationId?: string): Promise<AirQualityData[]> {
    const data = await this.getSheetData(SHEET_NAMES.AIR_QUALITY);
    if (data.length <= 1) return []; // Only headers or empty
    
    const headers = data[0];
    const rows = data.slice(1);
    
    let filteredRows = rows;
    if (locationId) {
      filteredRows = rows.filter(row => row[headers.indexOf('locationId')] === locationId);
    }
    
    return filteredRows.map(row => ({
      id: parseInt(row[headers.indexOf('id')]),
      locationId: row[headers.indexOf('locationId')],
      aqi: parseInt(row[headers.indexOf('aqi')]),
      pm25: row[headers.indexOf('pm25')] ? parseFloat(row[headers.indexOf('pm25')]) : null,
      pm10: row[headers.indexOf('pm10')] ? parseFloat(row[headers.indexOf('pm10')]) : null,
      no2: row[headers.indexOf('no2')] ? parseFloat(row[headers.indexOf('no2')]) : null,
      o3: row[headers.indexOf('o3')] ? parseFloat(row[headers.indexOf('o3')]) : null,
      co: row[headers.indexOf('co')] ? parseFloat(row[headers.indexOf('co')]) : null,
      so2: row[headers.indexOf('so2')] ? parseFloat(row[headers.indexOf('so2')]) : null,
      source: row[headers.indexOf('source')] || null,
      timestamp: this.parseDate(row[headers.indexOf('timestamp')])
    }));
  }
  
  async addAirQualityData(data: InsertAirQualityData): Promise<AirQualityData> {
    const id = this.airQualityId++;
    const newData = {
      id,
      ...data,
      timestamp: data.timestamp || new Date()
    };
    
    await this.appendRow(
      SHEET_NAMES.AIR_QUALITY,
      [
        id,
        data.locationId,
        data.aqi,
        data.pm25 || '',
        data.pm10 || '',
        data.no2 || '',
        data.o3 || '',
        data.co || '',
        data.so2 || '',
        data.source || '',
        this.formatDate(data.timestamp || new Date())
      ]
    );
    
    return newData;
  }
  
  // Traffic methods
  async getTrafficData(locationId?: string): Promise<TrafficData[]> {
    const data = await this.getSheetData(SHEET_NAMES.TRAFFIC);
    if (data.length <= 1) return []; // Only headers or empty
    
    const headers = data[0];
    const rows = data.slice(1);
    
    let filteredRows = rows;
    if (locationId) {
      filteredRows = rows.filter(row => row[headers.indexOf('locationId')] === locationId);
    }
    
    return filteredRows.map(row => ({
      id: parseInt(row[headers.indexOf('id')]),
      locationId: row[headers.indexOf('locationId')],
      congestionLevel: parseFloat(row[headers.indexOf('congestionLevel')]),
      vehicleCount: row[headers.indexOf('vehicleCount')] ? parseInt(row[headers.indexOf('vehicleCount')]) : null,
      averageSpeed: row[headers.indexOf('averageSpeed')] ? parseFloat(row[headers.indexOf('averageSpeed')]) : null,
      isHotspot: row[headers.indexOf('isHotspot')] === 'true',
      timestamp: this.parseDate(row[headers.indexOf('timestamp')])
    }));
  }
  
  async getTrafficHotspots(): Promise<any[]> {
    const trafficData = await this.getTrafficData();
    const locations = await this.getLocations();
    
    const hotspots = trafficData
      .filter(data => data.isHotspot || data.congestionLevel > 70)
      .map(data => {
        const location = locations.find(loc => loc.id === data.locationId);
        return {
          id: data.id.toString(),
          location: location?.name || data.locationId,
          description: `Heavy traffic congestion with ${data.congestionLevel}% congestion level`,
          congestionLevel: data.congestionLevel,
          severity: data.congestionLevel > 80 ? 'H' : data.congestionLevel > 60 ? 'M' : 'L'
        };
      });
    
    return hotspots;
  }
  
  async addTrafficData(data: InsertTrafficData): Promise<TrafficData> {
    const id = this.trafficId++;
    const newData = {
      id,
      ...data,
      timestamp: data.timestamp || new Date()
    };
    
    await this.appendRow(
      SHEET_NAMES.TRAFFIC,
      [
        id,
        data.locationId,
        data.congestionLevel,
        data.vehicleCount || '',
        data.averageSpeed || '',
        data.isHotspot ? 'true' : 'false',
        this.formatDate(data.timestamp || new Date())
      ]
    );
    
    return newData;
  }
  
  // Reports methods
  async getReports(filter: string = 'all', page: number = 1, perPage: number = 10): Promise<any> {
    const data = await this.getSheetData(SHEET_NAMES.REPORTS);
    if (data.length <= 1) return { reports: [], totalCount: 0 }; // Only headers or empty
    
    const headers = data[0];
    let rows = data.slice(1);
    
    // Apply filters
    if (filter !== 'all') {
      rows = rows.filter(row => row[headers.indexOf('status')] === filter);
    }
    
    // Calculate pagination
    const totalCount = rows.length;
    const startIdx = (page - 1) * perPage;
    const endIdx = startIdx + perPage;
    const paginatedRows = rows.slice(startIdx, endIdx);
    
    // Format reports for frontend
    const reports = paginatedRows.map(row => {
      const issueType = row[headers.indexOf('issueType')];
      const status = row[headers.indexOf('status')];
      
      return {
        id: row[headers.indexOf('id')],
        issue: {
          title: formatIssueType(issueType),
          type: issueType,
          icon: getIssueIcon(issueType),
          iconBg: getIssueIconBg(issueType),
          iconColor: getIssueIconColor(issueType)
        },
        location: {
          area: row[headers.indexOf('location')],
          details: row[headers.indexOf('description')].substring(0, 50) + "..."
        },
        reporter: {
          name: "Citizen Reporter",
          role: "citizen"
        },
        date: formatDate(this.parseDate(row[headers.indexOf('createdAt')])),
        status: {
          label: capitalizeFirstLetter(status),
          color: getStatusColor(status)
        }
      };
    });
    
    return { reports, totalCount };
  }
  
  async getReport(id: number): Promise<Report | undefined> {
    const data = await this.getSheetData(SHEET_NAMES.REPORTS);
    const headers = data[0];
    const reportRow = data.slice(1).find(row => parseInt(row[headers.indexOf('id')]) === id);
    
    if (!reportRow) return undefined;
    
    return {
      id: parseInt(reportRow[headers.indexOf('id')]),
      issueType: reportRow[headers.indexOf('issueType')],
      location: reportRow[headers.indexOf('location')],
      description: reportRow[headers.indexOf('description')],
      photoUrl: reportRow[headers.indexOf('photoUrl')] || null,
      userId: reportRow[headers.indexOf('userId')] ? parseInt(reportRow[headers.indexOf('userId')]) : null,
      status: reportRow[headers.indexOf('status')],
      createdAt: this.parseDate(reportRow[headers.indexOf('createdAt')]),
      updatedAt: this.parseDate(reportRow[headers.indexOf('updatedAt')])
    };
  }
  
  async createReport(report: InsertReport): Promise<Report> {
    const id = this.reportId++;
    const newReport = {
      id,
      ...report,
      createdAt: report.createdAt || new Date(),
      updatedAt: report.updatedAt || new Date()
    };
    
    await this.appendRow(
      SHEET_NAMES.REPORTS,
      [
        id,
        report.issueType,
        report.location,
        report.description,
        report.photoUrl || '',
        report.userId || '',
        report.status,
        this.formatDate(report.createdAt || new Date()),
        this.formatDate(report.updatedAt || new Date())
      ]
    );
    
    return newReport;
  }
  
  async updateReport(id: number, status: string): Promise<Report | undefined> {
    const data = await this.getSheetData(SHEET_NAMES.REPORTS);
    const headers = data[0];
    
    // Find the row index
    const rowIndex = data.findIndex(row => row[0] === id.toString());
    if (rowIndex <= 0) return undefined; // Not found or it's the header row
    
    // Get current row data
    const currentRow = data[rowIndex];
    
    // Create updated row data (only update status and updatedAt)
    const updatedRow = [...currentRow];
    updatedRow[headers.indexOf('status')] = status;
    updatedRow[headers.indexOf('updatedAt')] = this.formatDate(new Date());
    
    // Update the row
    await this.updateRow(SHEET_NAMES.REPORTS, rowIndex, updatedRow);
    
    // Return the updated report
    return {
      id,
      issueType: updatedRow[headers.indexOf('issueType')],
      location: updatedRow[headers.indexOf('location')],
      description: updatedRow[headers.indexOf('description')],
      photoUrl: updatedRow[headers.indexOf('photoUrl')] || null,
      userId: updatedRow[headers.indexOf('userId')] ? parseInt(updatedRow[headers.indexOf('userId')]) : null,
      status,
      createdAt: this.parseDate(updatedRow[headers.indexOf('createdAt')]),
      updatedAt: new Date()
    };
  }
  
  // Locations methods
  async getLocations(): Promise<Location[]> {
    const data = await this.getSheetData(SHEET_NAMES.LOCATIONS);
    if (data.length <= 1) return []; // Only headers or empty
    
    const headers = data[0];
    const rows = data.slice(1);
    
    return rows.map(row => ({
      id: row[headers.indexOf('id')],
      name: row[headers.indexOf('name')],
      latitude: parseFloat(row[headers.indexOf('latitude')]),
      longitude: parseFloat(row[headers.indexOf('longitude')]),
      district: row[headers.indexOf('district')],
      state: row[headers.indexOf('state')],
      country: row[headers.indexOf('country')],
      population: parseInt(row[headers.indexOf('population')])
    }));
  }
  
  async addLocation(location: InsertLocation): Promise<Location> {
    await this.appendRow(
      SHEET_NAMES.LOCATIONS,
      [
        location.id,
        location.name,
        location.latitude,
        location.longitude,
        location.district,
        location.state,
        location.country,
        location.population
      ]
    );
    
    return location;
  }
  
  // Predictions methods
  async getPrediction(locationId: string, type: string): Promise<Prediction | undefined> {
    const data = await this.getSheetData(SHEET_NAMES.PREDICTIONS);
    const headers = data[0];
    
    // Filter by locationId and type, and sort by timestamp descending to get the latest
    const predictions = data.slice(1)
      .filter(row => 
        row[headers.indexOf('locationId')] === locationId && 
        row[headers.indexOf('type')] === type
      )
      .sort((a, b) => {
        const dateA = this.parseDate(a[headers.indexOf('timestamp')]) || new Date(0);
        const dateB = this.parseDate(b[headers.indexOf('timestamp')]) || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    
    if (predictions.length === 0) return undefined;
    
    const latest = predictions[0];
    
    return {
      id: parseInt(latest[headers.indexOf('id')]),
      locationId,
      type,
      currentValue: parseFloat(latest[headers.indexOf('currentValue')]),
      predictions: JSON.parse(latest[headers.indexOf('predictions')]),
      confidence: parseFloat(latest[headers.indexOf('confidence')]),
      timestamp: this.parseDate(latest[headers.indexOf('timestamp')])
    };
  }
  
  async addPrediction(prediction: InsertPrediction): Promise<Prediction> {
    const id = this.predictionId++;
    const newPrediction = {
      id,
      ...prediction,
      timestamp: prediction.timestamp || new Date()
    };
    
    await this.appendRow(
      SHEET_NAMES.PREDICTIONS,
      [
        id,
        prediction.locationId,
        prediction.type,
        prediction.currentValue,
        JSON.stringify(prediction.predictions),
        prediction.confidence,
        this.formatDate(prediction.timestamp || new Date())
      ]
    );
    
    return newPrediction;
  }
  
  // Dashboard methods
  async getStatsOverview(): Promise<any> {
    // Get the most recent air quality data for all locations
    const airQualityData = await this.getAirQualityData();
    const airQualityByLocation = new Map<string, AirQualityData>();
    
    // Group by location and keep the most recent entry
    for (const data of airQualityData) {
      if (!airQualityByLocation.has(data.locationId) || 
          (data.timestamp && airQualityByLocation.get(data.locationId)!.timestamp &&
           data.timestamp > airQualityByLocation.get(data.locationId)!.timestamp!)) {
        airQualityByLocation.set(data.locationId, data);
      }
    }
    
    // Calculate average AQI across all locations
    const allAqi = Array.from(airQualityByLocation.values()).map(data => data.aqi);
    const avgAqi = allAqi.length > 0 ? 
      Math.round(allAqi.reduce((sum, aqi) => sum + aqi, 0) / allAqi.length) : 0;
    
    // Get Delhi's AQI as the reference for most polluted city
    const delhiAqi = airQualityByLocation.get('delhi')?.aqi || 0;
    
    // Calculate change (using Delhi as reference, showing a 5% improvement)
    const airQualityChange = {
      value: '-5%',
      type: 'decrease'
    };
    
    // Get traffic data
    const trafficData = await this.getTrafficData();
    const trafficByLocation = new Map<string, TrafficData>();
    
    // Group by location and keep the most recent entry
    for (const data of trafficData) {
      if (!trafficByLocation.has(data.locationId) || 
          (data.timestamp && trafficByLocation.get(data.locationId)!.timestamp &&
           data.timestamp > trafficByLocation.get(data.locationId)!.timestamp!)) {
        trafficByLocation.set(data.locationId, data);
      }
    }
    
    // Calculate average congestion across all locations
    const allCongestion = Array.from(trafficByLocation.values()).map(data => data.congestionLevel);
    const avgCongestion = allCongestion.length > 0 ? 
      Math.round(allCongestion.reduce((sum, level) => sum + level, 0) / allCongestion.length) : 0;
    
    // Count traffic hotspots
    const hotspotCount = Array.from(trafficByLocation.values()).filter(data => data.isHotspot).length;
    
    // Get report stats
    const { reports } = await this.getReports('all');
    const openReports = reports.filter(report => report.status.label === 'Open').length;
    const totalReports = reports.length;
    
    return {
      airQuality: {
        value: delhiAqi,
        change: {
          value: airQualityChange.value,
          type: airQualityChange.type
        },
        status: getAqiStatus(delhiAqi)
      },
      traffic: {
        value: avgCongestion,
        change: {
          value: '+2%',
          type: 'increase'
        },
        status: getTrafficStatus(avgCongestion)
      },
      hotspots: {
        value: hotspotCount,
        change: {
          value: '-1',
          type: 'decrease'
        },
        status: hotspotCount > 5 ? 'Critical' : hotspotCount > 3 ? 'Attention' : 'Normal'
      },
      reports: {
        value: openReports,
        change: {
          value: '+3',
          type: 'increase'
        },
        status: openReports > 10 ? 'Backlog' : 'Manageable'
      }
    };
  }
  
  async getMapData(): Promise<any> {
    const locations = await this.getLocations();
    const airQualityData = await this.getAirQualityData();
    const trafficData = await this.getTrafficData();
    
    // Create a mapping for the most recent data by location
    const airQualityByLocation = new Map<string, AirQualityData>();
    const trafficByLocation = new Map<string, TrafficData>();
    
    // Group AQI data by location and keep the most recent entry
    for (const data of airQualityData) {
      if (!airQualityByLocation.has(data.locationId) || 
          (data.timestamp && airQualityByLocation.get(data.locationId)!.timestamp &&
           data.timestamp > airQualityByLocation.get(data.locationId)!.timestamp!)) {
        airQualityByLocation.set(data.locationId, data);
      }
    }
    
    // Group traffic data by location and keep the most recent entry
    for (const data of trafficData) {
      if (!trafficByLocation.has(data.locationId) || 
          (data.timestamp && trafficByLocation.get(data.locationId)!.timestamp &&
           data.timestamp > trafficByLocation.get(data.locationId)!.timestamp!)) {
        trafficByLocation.set(data.locationId, data);
      }
    }
    
    // Create GeoJSON features for each location
    const features = locations.map(location => {
      const airQuality = airQualityByLocation.get(location.id as string);
      const traffic = trafficByLocation.get(location.id as string);
      
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude]
        },
        properties: {
          id: location.id,
          name: location.name,
          district: location.district,
          airQuality: {
            aqi: airQuality?.aqi || 0,
            status: getAqiStatus(airQuality?.aqi || 0),
            color: getAqiColor(airQuality?.aqi || 0)
          },
          traffic: {
            congestionLevel: traffic?.congestionLevel || 0,
            status: getTrafficStatus(traffic?.congestionLevel || 0),
            color: getTrafficColor(traffic?.congestionLevel || 0)
          }
        }
      };
    });
    
    return {
      type: 'FeatureCollection',
      features
    };
  }
}

// Helper functions for formatting data

function formatIssueType(issueType: string): string {
  const map: { [key: string]: string } = {
    'AirPollution': 'Air Pollution',
    'WaterPollution': 'Water Pollution',
    'NoisePollution': 'Noise Pollution',
    'TrafficCongestion': 'Traffic Congestion',
    'GarbageDisposal': 'Garbage Disposal'
  };
  
  return map[issueType] || issueType;
}

function getIssueIcon(issueType: string): string {
  const map: { [key: string]: string } = {
    'AirPollution': 'wind',
    'WaterPollution': 'droplet',
    'NoisePollution': 'volume-2',
    'TrafficCongestion': 'car',
    'GarbageDisposal': 'trash-2'
  };
  
  return map[issueType] || 'alert-circle';
}

function getIssueIconBg(issueType: string): string {
  const map: { [key: string]: string } = {
    'AirPollution': 'bg-red-100',
    'WaterPollution': 'bg-blue-100',
    'NoisePollution': 'bg-yellow-100',
    'TrafficCongestion': 'bg-orange-100',
    'GarbageDisposal': 'bg-green-100'
  };
  
  return map[issueType] || 'bg-gray-100';
}

function getIssueIconColor(issueType: string): string {
  const map: { [key: string]: string } = {
    'AirPollution': 'text-red-600',
    'WaterPollution': 'text-blue-600',
    'NoisePollution': 'text-yellow-600',
    'TrafficCongestion': 'text-orange-600',
    'GarbageDisposal': 'text-green-600'
  };
  
  return map[issueType] || 'text-gray-600';
}

function formatDate(date: Date | null): string {
  if (!date) return '';
  
  // Format: "Apr 15, 2025"
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

function getStatusColor(status: string): string {
  const map: { [key: string]: string } = {
    'open': 'text-red-600 bg-red-50',
    'inProgress': 'text-orange-600 bg-orange-50',
    'resolved': 'text-green-600 bg-green-50',
    'closed': 'text-gray-600 bg-gray-50'
  };
  
  return map[status] || 'text-gray-600 bg-gray-50';
}

function capitalizeFirstLetter(string: string): string {
  if (!string) return '';
  const formatted = string.replace(/([A-Z])/g, ' $1');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function getAqiStatus(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

function getAqiColor(aqi: number): string {
  if (aqi <= 50) return '#10b981'; // green-500
  if (aqi <= 100) return '#f59e0b'; // yellow-500
  if (aqi <= 150) return '#f97316'; // orange-500
  if (aqi <= 200) return '#ef4444'; // red-500
  if (aqi <= 300) return '#a855f7'; // purple-500
  return '#be123c'; // rose-900
}

function getTrafficStatus(congestion: number): string {
  if (congestion <= 30) return 'Light traffic';
  if (congestion <= 60) return 'Moderate congestion';
  if (congestion <= 80) return 'Heavy traffic';
  return 'Severe congestion';
}

function getTrafficColor(congestion: number): string {
  if (congestion <= 30) return '#10b981'; // green-500
  if (congestion <= 60) return '#f59e0b'; // yellow-500
  if (congestion <= 80) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
}