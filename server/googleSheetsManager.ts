import { google } from 'googleapis';

/**
 * Creates a new Google Spreadsheet with the given title if it doesn't exist
 * Returns the spreadsheet ID
 */
export async function getOrCreateSpreadsheet(title: string): Promise<string> {
  try {
    // Load credentials from environment variable
    const credentials = JSON.parse(process.env.GOOGLE_API_CREDENTIALS || '{}');
    
    // Create a new JWT client using the credentials
    const auth = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']
    );
    
    // Create the sheets client
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Create the drive client
    const drive = google.drive({ version: 'v3', auth });
    
    // Check if the spreadsheet already exists
    const response = await drive.files.list({
      q: `name='${title}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      fields: 'files(id, name)'
    });
    
    if (response.data.files && response.data.files.length > 0) {
      // Spreadsheet exists, return its ID
      console.log(`Found existing spreadsheet with id: ${response.data.files[0].id}`);
      return response.data.files[0].id!;
    }
    
    // Create a new spreadsheet
    console.log(`Creating new spreadsheet with title: ${title}`);
    const createResponse = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title
        }
      }
    });
    
    if (!createResponse.data.spreadsheetId) {
      throw new Error('Failed to create spreadsheet - no ID returned');
    }
    
    console.log(`Created new spreadsheet with id: ${createResponse.data.spreadsheetId}`);
    return createResponse.data.spreadsheetId;
  } catch (error) {
    console.error('Error creating or finding spreadsheet:', error);
    throw new Error('Failed to create or find spreadsheet');
  }
}