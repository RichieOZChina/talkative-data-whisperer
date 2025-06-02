
export interface ColumnAnalysis {
  column_name: string;
  data_type: string;
  sql_type: string;
  sample_values?: string[];
  null_count?: number;
  unique_count?: number;
  description: string;
}

export interface AnalysisData {
  column_analysis?: ColumnAnalysis[];
  table_name?: string;
  total_columns?: number;
}

export const parseCSV = (csvText: string): string[][] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  return lines.map(line => {
    // Simple CSV parsing - handles basic cases
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i-1] === ',')) {
        inQuotes = true;
      } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i+1] === ',')) {
        inQuotes = false;
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    cells.push(current.trim());
    return cells.map(cell => cell.replace(/^"|"$/g, ''));
  });
};

export const getAnalysisData = (schemaData: any): AnalysisData | null => {
  if (!schemaData?.column_analysis || typeof schemaData.column_analysis !== 'object') {
    return null;
  }
  
  // Handle the case where column_analysis might be nested
  const analysis = schemaData.column_analysis as any;
  if (analysis.column_analysis) {
    return analysis as AnalysisData;
  }
  
  // Handle direct column_analysis array
  if (Array.isArray(analysis)) {
    return {
      column_analysis: analysis,
      table_name: 'Generated',
      total_columns: analysis.length
    };
  }
  
  return analysis as AnalysisData;
};
