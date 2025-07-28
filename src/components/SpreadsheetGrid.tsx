// src/components/SpreadsheetGrid.tsx
import React, { useState } from 'react';

interface SpreadsheetGridProps {
  data: any;
  activeCell: { row: number, col: string } | null;
  onCellDoubleClick: (row: number, col: string) => void;
  onCellUpdate: (row: number, col: string, value: string) => void;
  isMobile?: boolean;
}

const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  data,
  activeCell,
  onCellDoubleClick,
  onCellUpdate,
  isMobile = false
}) => {
  const [editingCell, setEditingCell] = useState<{ row: number, col: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // Generate column headers (A, B, C, etc.)
  // For mobile, show fewer columns
  const columnCount = isMobile ? 5 : 10;
  const columns = Array.from({ length: columnCount }, (_, i) => 
    String.fromCharCode(65 + i)
  );
  
  // For mobile, show fewer rows
  const rowCount = isMobile ? 10 : 20;
  
  const handleCellClick = (row: number, col: string) => {
    // If already editing, finish that edit first
    if (editingCell) {
      finishEditing();
    }
    
    // On mobile, single tap to select cell
    if (isMobile) {
      onCellDoubleClick(row, col);
    }
  };
  
  const handleCellDoubleClick = (row: number, col: string) => {
    // Start editing the cell
    setEditingCell({ row, col });
    setEditValue(data[row]?.[col]?.value || '');
    
    // Also notify parent component
    if (!isMobile) {
      onCellDoubleClick(row, col);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!editingCell) return;
    
    if (e.key === 'Enter') {
      e.preventDefault();
      finishEditing();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };
  
  const finishEditing = () => {
    if (!editingCell) return;
    
    onCellUpdate(editingCell.row, editingCell.col, editValue);
    setEditingCell(null);
  };
  
  const getCellClassName = (row: number, col: string) => {
    let className = 'cell';
    
    // Add active class if this is the active cell
    if (activeCell && activeCell.row === row && activeCell.col === col) {
      className += ' active-cell';
    }
    
    // Add editing class if this cell is being edited
    if (editingCell && editingCell.row === row && editingCell.col === col) {
      className += ' editing-cell';
    }
    
    // Add note indicator if cell has a note
    if (data[row]?.[col]?.hasNote) {
      className += ' has-note';
    }
    
    return className;
  };
  
  return (
    <div className={`spreadsheet-grid ${isMobile ? 'mobile' : ''}`}>
      <table>
        <thead>
          <tr>
            <th className="row-header"></th>
            {columns.map(col => (
              <th key={col} className="column-header">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }, (_, rowIndex) => (
            <tr key={rowIndex}>
              <td className="row-header">{rowIndex + 1}</td>
              {columns.map(col => (
                <td 
                  key={`${rowIndex}-${col}`}
                  className={getCellClassName(rowIndex, col)}
                  onClick={() => handleCellClick(rowIndex, col)}
                  onDoubleClick={() => handleCellDoubleClick(rowIndex, col)}
                >
                  {editingCell && 
                   editingCell.row === rowIndex && 
                   editingCell.col === col ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={finishEditing}
                      autoFocus
                      className="cell-input"
                    />
                  ) : (
                    data[rowIndex]?.[col]?.value || ''
                  )}
                  
                  {data[rowIndex]?.[col]?.hasNote && (
                    <div className="note-indicator"></div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SpreadsheetGrid;