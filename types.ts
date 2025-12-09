export interface User {
  username: string;
  division: string;
  isAdmin: boolean;
}

export interface ScoreSet {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface QuarterData {
  scores: ScoreSet;
  comment: string;
}

export interface DivisionData {
  quarters: {
    [key: number]: QuarterData;
  };
}

export interface AllScores {
  [division: string]: DivisionData;
}

export interface LoginCredentials {
  username: string;
  password?: string;
}

export interface SaveScoreParams {
  division: string;
  quarter: number;
  scores: ScoreSet;
  comment: string;
}

// Declaration for Google Apps Script Client-side API
declare global {
  interface Window {
    google?: {
      script: {
        run: {
          withSuccessHandler: (callback: (result: any) => void) => {
            withFailureHandler: (callback: (error: Error) => void) => {
              [key: string]: (...args: any[]) => void;
            };
          };
        };
      };
    };
  }
}