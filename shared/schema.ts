import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Storage interface for both in-memory and Google Sheets
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

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("citizen"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

// Air Quality data table
export const airQualityData = pgTable("air_quality_data", {
  id: serial("id").primaryKey(),
  locationId: text("location_id").notNull(),
  aqi: integer("aqi").notNull(),
  pm25: integer("pm25"),
  pm10: integer("pm10"),
  no2: integer("no2"),
  o3: integer("o3"),
  co: integer("co"),
  so2: integer("so2"),
  timestamp: timestamp("timestamp").defaultNow(),
  source: text("source") // sensor, prediction, etc.
});

export const insertAirQualitySchema = createInsertSchema(airQualityData).pick({
  locationId: true,
  aqi: true,
  pm25: true,
  pm10: true,
  no2: true,
  o3: true,
  co: true,
  so2: true,
  source: true
});

// Traffic data table
export const trafficData = pgTable("traffic_data", {
  id: serial("id").primaryKey(),
  locationId: text("location_id").notNull(),
  congestionLevel: integer("congestion_level").notNull(), // 0-100 percentage
  vehicleCount: integer("vehicle_count"),
  averageSpeed: integer("average_speed"),
  timestamp: timestamp("timestamp").defaultNow(),
  isHotspot: boolean("is_hotspot").default(false)
});

export const insertTrafficSchema = createInsertSchema(trafficData).pick({
  locationId: true,
  congestionLevel: true,
  vehicleCount: true,
  averageSpeed: true,
  isHotspot: true
});

// User Reports table
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  issueType: text("issue_type").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  photoUrl: text("photo_url"),
  userId: integer("user_id"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertReportSchema = createInsertSchema(reports).pick({
  issueType: true,
  location: true,
  description: true,
  photoUrl: true,
  userId: true
});

// Locations table
export const locations = pgTable("locations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  district: text("district").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  state: text("state"),
  country: text("country"),
  population: integer("population")
});

export const insertLocationSchema = createInsertSchema(locations);

// ML Predictions table
export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  locationId: text("location_id").notNull(),
  type: text("type").notNull(), // air, traffic, etc.
  currentValue: integer("current_value").notNull(),
  predictedValues: jsonb("predicted_values").notNull(), // { 2h: 120, 4h: 100, etc. }
  confidence: integer("confidence").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertPredictionSchema = createInsertSchema(predictions).pick({
  locationId: true,
  type: true,
  currentValue: true,
  predictedValues: true,
  confidence: true
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type AirQualityData = typeof airQualityData.$inferSelect;
export type InsertAirQualityData = z.infer<typeof insertAirQualitySchema>;

export type TrafficData = typeof trafficData.$inferSelect;
export type InsertTrafficData = z.infer<typeof insertTrafficSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
