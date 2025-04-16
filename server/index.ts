import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { getOrCreateSpreadsheet } from "./googleSheetsManager";
import { GoogleSheetsStorage } from "./googleSheetsStorage";
import { storage } from "./storage";

// Define the spreadsheet name for our application
const SPREADSHEET_NAME = "Urban Monitoring Platform Data";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Initialize Google Sheets storage if we have credentials
    if (process.env.GOOGLE_API_CREDENTIALS) {
      console.log('Google API credentials found, initializing Google Sheets storage...');
      
      // Get or create the spreadsheet
      const spreadsheetId = await getOrCreateSpreadsheet(SPREADSHEET_NAME);
      
      if (spreadsheetId) {
        // Create a new Google Sheets storage instance
        const sheetsStorage = new GoogleSheetsStorage(spreadsheetId);
        
        // Initialize the spreadsheet with required sheets and headers
        try {
          await sheetsStorage.initializeSpreadsheet();
          
          // Replace the storage reference with our Google Sheets implementation
          Object.assign(storage, sheetsStorage);
          
          console.log("Successfully switched to Google Sheets storage");
        } catch (initError) {
          console.error("Error initializing Google Sheets spreadsheet:", initError);
          console.log("Falling back to in-memory storage due to spreadsheet initialization error");
        }
      } else {
        console.error('Failed to get or create spreadsheet. Using in-memory storage instead.');
      }
    } else {
      console.log('No Google API credentials found. Using in-memory storage.');
    }
  } catch (error) {
    console.error('Error initializing Google Sheets storage:', error);
    console.log('Falling back to in-memory storage.');
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
