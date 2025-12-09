import { AllScores, LoginCredentials, SaveScoreParams, User } from '../types';

// ============================================================================
// ⚠️ ใส่ URL ของ Google Apps Script Web App ที่คุณ Deploy แล้ว ตรงนี้ครับ ⚠️
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzyjIBiZMUz9FIF9QBvRrB2gVL06-6ZpZc37AgvYYk83Eaa5YI12jAU1FkjWvduJ3Y6HQ/exec"; 
// ============================================================================

/**
 * Helper to call the GAS API via HTTP Fetch
 */
const apiCall = async <T>(method: 'GET' | 'POST', params: any = {}): Promise<T> => {
  // If no URL is set, return mock data or error
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("วาง_URL")) {
    console.warn("Please set the GOOGLE_SCRIPT_URL in services/api.ts");
    throw new Error("API URL not configured");
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
    const data = await response.json();
    return data as T;
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
      return null;
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