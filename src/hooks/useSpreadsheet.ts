// src/hooks/useSpreadsheet.ts
import { useState, useEffect } from 'react';

interface SpreadsheetCell {
  value: string;
  formula?: string;
  hasNote?: boolean;
}

interface SpreadsheetData {
  [rowIndex: number]: {
    [colIndex: string]: SpreadsheetCell;
  };
}

export function useSpreadsheet() {
  const [data, setData] = useState<SpreadsheetData>({});
  const [activeCell, setActiveCell] = useState<{row: number, col: string} | null>(null);
  
  useEffect(() => {
    // Initialize with some default data
    const defaultData = generateDefaultSpreadsheetData();
    setData(defaultData);
  }, []);
  
  const updateCell = (row: number, col: string, value: string) => {
    setData(prevData => ({
      ...prevData,
      [row]: {
        ...prevData[row],
        [col]: {
          ...prevData[row]?.[col],
          value
        }
      }
    }));
  };
  
  const toggleCellNote = (row: number, col: string) => {
    setData(prevData => ({
      ...prevData,
      [row]: {
        ...prevData[row],
        [col]: {
          ...prevData[row]?.[col],
          hasNote: !prevData[row]?.[col]?.hasNote
        }
      }
    }));
  };
  
  const getCellContent = (row: number, col: string): SpreadsheetCell => {
    return data[row]?.[col] || { value: '' };
  };
  
  return {
    data,
    activeCell,
    setActiveCell,
    updateCell,
    toggleCellNote,
    getCellContent
  };
}

// Helper function to generate default spreadsheet data
function generateDefaultSpreadsheetData(): SpreadsheetData {
  const data: SpreadsheetData = {};
  
  // Header row
  data[0] = {
    'A': { value: 'Date' },
    'B': { value: 'Category' },
    'C': { value: 'Amount' },
    'D': { value: 'Notes' },
    'E': { value: 'Running Total' },
    'F': { value: 'Budget' },
    'G': { value: 'Variance' }
  };
  
  // Sample data rows
  data[1] = {
    'A': { value: '07/15/2025' },
    'B': { value: 'Groceries' },
    'C': { value: '127.84' },
    'D': { value: 'Weekly shopping' },
    'E': { value: '127.84', formula: '=C1' },
    'F': { value: '150.00' },
    'G': { value: '22.16', formula: '=F1-C1' }
  };
  
  data[2] = {
    'A': { value: '07/18/2025' },
    'B': { value: 'Utilities' },
    'C': { value: '94.32' },
    'D': { value: 'Electricity bill' },
    'E': { value: '222.16', formula: '=E1+C2' },
    'F': { value: '100.00' },
    'G': { value: '5.68', formula: '=F2-C2' }
  };
  
  data[3] = {
    'A': { value: '07/20/2025' },
    'B': { value: 'Entertainment' },
    'C': { value: '45.99' },
    'D': { value: 'Movie tickets' },
    'E': { value: '268.15', formula: '=E2+C3' },
    'F': { value: '50.00' },
    'G': { value: '4.01', formula: '=F3-C3' }
  };
  
  return data;
}