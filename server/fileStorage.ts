import fs from 'fs';
import path from 'path';
import { IStorage } from '@shared/schema';
import { MemStorage, storage } from './storage';

// Directory where data files will be stored
const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`Created data directory at ${DATA_DIR}`);
}

// File paths for each data type
const DATA_FILES = {
  USERS: path.join(DATA_DIR, 'users.json'),
  AIR_QUALITY: path.join(DATA_DIR, 'air_quality.json'),
  TRAFFIC: path.join(DATA_DIR, 'traffic.json'),
  REPORTS: path.join(DATA_DIR, 'reports.json'),
  LOCATIONS: path.join(DATA_DIR, 'locations.json'),
  PREDICTIONS: path.join(DATA_DIR, 'predictions.json')
};

/**
 * Enhanced memory storage with file persistence
 * Uses in-memory storage for performance but also saves data to disk
 */
export class FileStorage {
  private memStorage: MemStorage;
  
  constructor(memStorage: MemStorage) {
    this.memStorage = memStorage;
    this.loadFromDisk();
    console.log('File-based persistence storage initialized');
  }
  
  /**
   * Loads data from disk into memory storage if files exist
   */
  private loadFromDisk(): void {
    try {
      // Check each data file and load if exists
      if (fs.existsSync(DATA_FILES.USERS)) {
        const userData = JSON.parse(fs.readFileSync(DATA_FILES.USERS, 'utf8'));
        if (userData && userData.users) {
          this.memStorage['users'] = new Map(userData.users);
          this.memStorage['userId'] = userData.nextId || 1;
          console.log(`Loaded ${userData.users.length} users from disk`);
        }
      }
      
      if (fs.existsSync(DATA_FILES.AIR_QUALITY)) {
        const aqData = JSON.parse(fs.readFileSync(DATA_FILES.AIR_QUALITY, 'utf8'));
        if (aqData && aqData.data) {
          this.memStorage['airQualityData'] = new Map(aqData.data);
          this.memStorage['airQualityId'] = aqData.nextId || 1;
          console.log(`Loaded air quality data from disk`);
        }
      }
      
      if (fs.existsSync(DATA_FILES.TRAFFIC)) {
        const trafficData = JSON.parse(fs.readFileSync(DATA_FILES.TRAFFIC, 'utf8'));
        if (trafficData && trafficData.data) {
          this.memStorage['trafficData'] = new Map(trafficData.data);
          this.memStorage['trafficId'] = trafficData.nextId || 1;
          console.log(`Loaded traffic data from disk`);
        }
      }
      
      if (fs.existsSync(DATA_FILES.REPORTS)) {
        const reportsData = JSON.parse(fs.readFileSync(DATA_FILES.REPORTS, 'utf8'));
        if (reportsData && reportsData.reports) {
          this.memStorage['reports'] = reportsData.reports;
          this.memStorage['reportId'] = reportsData.nextId || 1;
          console.log(`Loaded ${reportsData.reports.length} reports from disk`);
        }
      }
      
      if (fs.existsSync(DATA_FILES.LOCATIONS)) {
        const locationsData = JSON.parse(fs.readFileSync(DATA_FILES.LOCATIONS, 'utf8'));
        if (locationsData && locationsData.locations) {
          this.memStorage['locations'] = new Map(locationsData.locations);
          console.log(`Loaded ${locationsData.locations.length} locations from disk`);
        }
      }
      
      if (fs.existsSync(DATA_FILES.PREDICTIONS)) {
        const predictionsData = JSON.parse(fs.readFileSync(DATA_FILES.PREDICTIONS, 'utf8'));
        if (predictionsData && predictionsData.predictions) {
          this.memStorage['predictions'] = new Map(predictionsData.predictions);
          this.memStorage['predictionId'] = predictionsData.nextId || 1;
          console.log(`Loaded predictions data from disk`);
        }
      }
      
      console.log('Successfully loaded all existing data from disk');
    } catch (error) {
      console.error('Error loading data from disk:', error);
      console.log('Using default in-memory initialization');
      // If loading fails, we'll use the default in-memory initialization
    }
  }
  
  /**
   * Saves all data from memory to disk
   */
  saveToDisk(): void {
    try {
      // Users
      fs.writeFileSync(
        DATA_FILES.USERS, 
        JSON.stringify({
          users: Array.from(this.memStorage['users'].entries()),
          nextId: this.memStorage['userId']
        })
      );
      
      // Air Quality
      fs.writeFileSync(
        DATA_FILES.AIR_QUALITY, 
        JSON.stringify({
          data: Array.from(this.memStorage['airQualityData'].entries()),
          nextId: this.memStorage['airQualityId']
        })
      );
      
      // Traffic
      fs.writeFileSync(
        DATA_FILES.TRAFFIC, 
        JSON.stringify({
          data: Array.from(this.memStorage['trafficData'].entries()),
          nextId: this.memStorage['trafficId']
        })
      );
      
      // Reports
      fs.writeFileSync(
        DATA_FILES.REPORTS, 
        JSON.stringify({
          reports: this.memStorage['reports'],
          nextId: this.memStorage['reportId']
        })
      );
      
      // Locations
      fs.writeFileSync(
        DATA_FILES.LOCATIONS, 
        JSON.stringify({
          locations: Array.from(this.memStorage['locations'].entries())
        })
      );
      
      // Predictions
      fs.writeFileSync(
        DATA_FILES.PREDICTIONS, 
        JSON.stringify({
          predictions: Array.from(this.memStorage['predictions'].entries()),
          nextId: this.memStorage['predictionId']
        })
      );
      
      console.log('Successfully saved all data to disk');
    } catch (error) {
      console.error('Error saving data to disk:', error);
    }
  }
  
  /**
   * Set up periodic auto-save to disk
   * @param intervalMinutes Interval in minutes between auto-saves
   */
  setupAutoSave(intervalMinutes: number = 5): void {
    const intervalMs = intervalMinutes * 60 * 1000;
    
    setInterval(() => {
      console.log(`Auto-saving data to disk (${new Date().toISOString()})`);
      this.saveToDisk();
    }, intervalMs);
    
    console.log(`Scheduled auto-save every ${intervalMinutes} minutes`);
    
    // Also save on process exit if possible
    process.on('SIGINT', () => {
      console.log('Process terminating, saving data to disk...');
      this.saveToDisk();
      process.exit(0);
    });
  }
}

/**
 * Initialize file storage and return a wrapper that auto-saves
 * @param autoSaveInterval The interval in minutes between auto-saves (default: 5)
 */
export function initializeFileStorage(autoSaveInterval: number = 5): IStorage {
  // Setup file storage
  const fileStorage = new FileStorage(storage as MemStorage);
  
  // Setup auto-save with the specified interval
  fileStorage.setupAutoSave(autoSaveInterval);
  
  // Return the original memory storage object, but enhanced with file persistence
  // The actual fileStorage will intercept on the side through auto-save
  return storage;
}