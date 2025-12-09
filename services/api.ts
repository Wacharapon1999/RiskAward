import { AllScores, LoginCredentials, SaveScoreParams, User } from '../types';

// ============================================================================
// ⚠️ สำคัญ: นำ URL ที่ได้จากการ Deploy Google Apps Script มาวางตรงนี้ครับ ⚠️
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxWH1jbk9kvdN__PsCD4_JULJhWhhNbNFkMv21bVYKlnIMBaWx2ptScznQvCtocQ0_E/exec"; 
// ============================================================================

/**
 * Helper to call the GAS API via HTTP Fetch
 */
const apiCall = async <T>(method: 'GET' | 'POST', params: any = {}): Promise<T> => {
  // If no URL is set, return mock data or error
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("ใส่_URL")) {
    console.warn("Please set the GOOGLE_SCRIPT_URL in services/api.ts");
    throw new Error("กรุณาใส่ URL ของ Google Apps Script ในไฟล์ services/api.ts");
  }

  let url = GOOGLE_SCRIPT_URL;
  let options: RequestInit = {
    method: method,
    // 'follow' is crucial for GAS redirects
    redirect: 'follow', 
  };

  if (method === 'GET') {
    // Convert params to query string
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  } else {
    // For POST, we use text/plain to avoid CORS preflight (OPTIONS) issues with GAS
    options.headers = { 'Content-Type': 'text/plain;charset=utf-8' };
    options.body = JSON.stringify(params);
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Read text first to check if it's JSON or HTML (Login page)
    const textData = await response.text();

    try {
      const data = JSON.parse(textData);
      
      // Check for Google Script specific error objects
      if (data && data.status === 'error') {
         throw new Error(data.message || 'Script Error');
      }
      
      return data as T;
    } catch (e) {
      // If parsing fails, it's likely HTML (Google Login Page) because of permissions
      console.error("Failed to parse JSON. Response was:", textData.substring(0, 100) + "...");
      if (textData.includes("<!DOCTYPE html") || textData.includes("Sign in")) {
         throw new Error("Access Denied: Please check Google Script permissions (Must be 'Anyone').");
      }
      throw new Error("Invalid server response");
    }

  } catch (error) {
    console.error("API Call Error:", error);
    throw error;
  }
};

export const api = {
  login: async (credentials: LoginCredentials): Promise<User | null> => {
    try {
      // Send as POST
      return await apiCall<User | null>('POST', { 
        action: 'login', 
        username: credentials.username, 
        password: credentials.password 
      });
    } catch (e) {
      console.error("Login failed", e);
      throw e; // Rethrow to show error in UI
    }
  },

  getScores: async (division?: string): Promise<AllScores> => {
    try {
      // Send as GET
      return await apiCall<AllScores>('GET', { 
        action: 'getScores', 
        division: division || 'all' 
      });
    } catch (e) {
      console.error("Get scores failed", e);
      return {};
    }
  },

  getDivisions: async (): Promise<string[]> => {
    try {
      return await apiCall<string[]>('GET', { action: 'getDivisions' });
    } catch (e) {
      console.error("Get divisions failed", e);
      return [];
    }
  },

  saveScores: async (params: SaveScoreParams): Promise<boolean> => {
    try {
      const res = await apiCall<{success: boolean}>('POST', { 
        action: 'saveScores', 
        ...params 
      });
      return res.success;
    } catch (e) {
      console.error("Save scores failed", e);
      return false;
    }
  }
};