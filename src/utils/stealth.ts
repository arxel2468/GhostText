// src/utils/stealth.ts
export function disguiseMessage(message: string): string {
    // Convert real messages to boring spreadsheet notes
    const boringNotes = [
      "Updated quarterly projections",
      "Fixed calculation error",
      "Added new expense category",
      "Verified with accounting",
      "Adjusted for inflation rate",
      "Included tax considerations",
      "Referenced last month's data",
      "Normalized for seasonal variance",
      "Applied department guidelines",
      "Corrected formula reference",
      "Reconciled with bank statement",
      "Added footnote for clarification",
      "Implemented manager's feedback",
      "Standardized formatting",
      "Updated currency conversion"
    ];
    
    // Use the message length to select a boring note (or combine multiple)
    const noteIndex = Math.abs(message.length % boringNotes.length);
    
    // For longer messages, make it look like a more detailed note
    if (message.length > 50) {
      const secondIndex = Math.abs((message.length * 2) % boringNotes.length);
      return `${boringNotes[noteIndex]}; ${boringNotes[secondIndex].toLowerCase()}`;
    }
    
    return boringNotes[noteIndex];
  }
  
  export function generateFakeNote(): string {
    const boringNotes = [
      "Updated quarterly projections",
      "Fixed calculation error",
      "Added new expense category",
      "Verified with accounting",
      "Adjusted for inflation rate"
    ];
    
    const randomIndex = Math.floor(Math.random() * boringNotes.length);
    return boringNotes[randomIndex];
  }
  
  // Function to check if a key combination is the secret trigger
  export function isSecretTrigger(event: React.MouseEvent | React.TouchEvent | KeyboardEvent): boolean {
    // For desktop: Alt+Click
    if ('altKey' in event) {
      return event.altKey;
    }
    
    // For mobile: Long press (handled separately with timer)
    return false;
  }
  
  // Function for mobile long press detection
  export function setupLongPressDetection(
    element: HTMLElement, 
    callback: () => void, 
    duration: number = 800
  ): () => void {
    let timer: number | null = null;
    let isLongPress = false;
    
    const start = () => {
      isLongPress = false;
      timer = window.setTimeout(() => {
        isLongPress = true;
        callback();
      }, duration);
    };
    
    const cancel = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };
    
    const handleTouchStart = () => start();
    const handleTouchEnd = (e: TouchEvent) => {
      cancel();
      // Prevent normal click if this was a long press
      if (isLongPress) {
        e.preventDefault();
      }
    };
    const handleTouchMove = () => cancel();
    
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchmove', handleTouchMove);
    
    // Return cleanup function
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }
  
  // Function to generate a plausible spreadsheet formula
  export function generatePlausibleFormula(cell: { row: number, col: string }): string {
    const formulas = [
      `=SUM(${cell.col}1:${cell.col}${cell.row})`,
      `=AVERAGE(${cell.col}1:${cell.col}${cell.row})`,
      `=IF(${cell.col}${cell.row}>100,"High","Low")`,
      `=VLOOKUP(${cell.col}${cell.row},A1:F10,2,FALSE)`,
      `=${String.fromCharCode(cell.col.charCodeAt(0) - 1)}${cell.row}*1.05`
    ];
    
    const index = (cell.row + cell.col.charCodeAt(0)) % formulas.length;
    return formulas[index];
  }
  
  // Detect if the user is on a mobile device
  export function isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }