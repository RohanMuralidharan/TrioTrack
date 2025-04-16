import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertReportSchema } from "@shared/schema";
import { airQualityModel } from "./models/airQualityModel";
import { trafficModel } from "./models/trafficModel";
import { analyzeAirQuality, AirQualityInput } from "./airQualityAnalysis";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  const apiRouter = express.Router();
  app.use("/api", apiRouter);

  // Stats overview
  apiRouter.get("/stats/overview", async (req, res) => {
    try {
      const stats = await storage.getStatsOverview();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats overview" });
    }
  });

  // Air quality endpoints
  apiRouter.get("/air-quality/data", async (req, res) => {
    try {
      const locationId = req.query.locationId as string;
      const data = await storage.getAirQualityData(locationId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch air quality data" });
    }
  });

  apiRouter.get("/air-quality/prediction", async (req, res) => {
    try {
      const locationId = req.query.locationId as string || "delhi";
      const prediction = await airQualityModel.predict(locationId);
      res.json(prediction);
    } catch (error) {
      console.error('Air quality prediction error:', error);
      res.status(500).json({ message: "Failed to generate air quality prediction" });
    }
  });
  
  // New air quality analysis endpoint that implements the Python model
  apiRouter.post("/air-quality/analyze", async (req, res) => {
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

  // Traffic endpoints
  apiRouter.get("/traffic/data", async (req, res) => {
    try {
      const locationId = req.query.locationId as string;
      const data = await storage.getTrafficData(locationId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch traffic data" });
    }
  });

  apiRouter.get("/traffic/hotspots", async (req, res) => {
    try {
      const hotspots = await storage.getTrafficHotspots();
      res.json(hotspots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch traffic hotspots" });
    }
  });

  apiRouter.get("/traffic/predict", async (req, res) => {
    try {
      const locationId = req.query.locationId as string || "delhi";
      const prediction = await trafficModel.predict(locationId);
      res.json(prediction);
    } catch (error) {
      console.error('Traffic prediction error:', error);
      res.status(500).json({ message: "Failed to generate traffic prediction" });
    }
  });

  // Map data
  apiRouter.get("/map/data", async (req, res) => {
    try {
      const mapData = await storage.getMapData();
      res.json(mapData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch map data" });
    }
  });

  // Reporting endpoints
  apiRouter.get("/reports", async (req, res) => {
    try {
      const filter = req.query.filter as string || "all";
      const page = parseInt(req.query.page as string || "1");
      const perPage = parseInt(req.query.perPage as string || "10");
      
      const reports = await storage.getReports(filter, page, perPage);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  apiRouter.post("/reports", async (req, res) => {
    try {
      const reportData = insertReportSchema.parse(req.body);
      const newReport = await storage.createReport(reportData);
      res.status(201).json(newReport);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid report data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
