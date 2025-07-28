// Cell data structure
export interface Cell {
    value: string;
    formula?: string;
    comment?: string;
  }
  
  // Spreadsheet data structure
  export interface SpreadsheetData {
    [row: number]: {
      [col: number]: Cell;
    };
  }
  
  // Message structure
  export interface EncryptedMessage {
    encrypted: string;
    timestamp: number;
    cellRef?: string; // e.g., "A1", "B2"
    ttl?: number; // Time to live in milliseconds
  }
  
  // Decrypted message
  export interface DecryptedMessage {
    text: string;
    timestamp: number;
    cellRef?: string;
    expiresAt?: number;
  }