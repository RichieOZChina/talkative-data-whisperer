
export interface BasicColumnMetadata {
  column_name: string;
  data_type_detected: string;
  sample_values: string[];
  null_count: number;
  unique_count: number;
  min_value?: string;
  max_value?: string;
  mean_value?: number;
  std_dev?: number;
}

export interface BasicDatasetMetadata {
  total_rows: number;
  total_columns: number;
  columns: BasicColumnMetadata[];
  file_size: number;
  processing_time: number;
}

export const detectDataType = (values: string[]): string => {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (nonNullValues.length === 0) return 'text';
  
  // Check if all values are numbers
  const numericValues = nonNullValues.filter(v => !isNaN(Number(v)) && v.trim() !== '');
  if (numericValues.length === nonNullValues.length) {
    // Check if they're integers or floats
    const hasDecimals = numericValues.some(v => v.includes('.'));
    return hasDecimals ? 'numeric' : 'integer';
  }
  
  // Check if all values are dates
  const dateValues = nonNullValues.filter(v => {
    const date = new Date(v);
    return !isNaN(date.getTime()) && v.match(/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4}/);
  });
  if (dateValues.length === nonNullValues.length) {
    return 'date';
  }
  
  // Check if all values are booleans
  const booleanValues = nonNullValues.filter(v => 
    v.toLowerCase() === 'true' || v.toLowerCase() === 'false' || 
    v === '1' || v === '0' || v.toLowerCase() === 'yes' || v.toLowerCase() === 'no'
  );
  if (booleanValues.length === nonNullValues.length) {
    return 'boolean';
  }
  
  return 'text';
};

export const calculateColumnStats = (values: string[], dataType: string): {
  min_value?: string;
  max_value?: string;
  mean_value?: number;
  std_dev?: number;
} => {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (dataType === 'numeric' || dataType === 'integer') {
    const numbers = nonNullValues.map(v => Number(v)).filter(n => !isNaN(n));
    if (numbers.length > 0) {
      const min = Math.min(...numbers);
      const max = Math.max(...numbers);
      const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
      const variance = numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
      const stdDev = Math.sqrt(variance);
      
      return {
        min_value: min.toString(),
        max_value: max.toString(),
        mean_value: mean,
        std_dev: stdDev
      };
    }
  } else if (dataType === 'text') {
    if (nonNullValues.length > 0) {
      const sortedValues = [...nonNullValues].sort();
      return {
        min_value: sortedValues[0],
        max_value: sortedValues[sortedValues.length - 1]
      };
    }
  }
  
  return {};
};

export const extractBasicMetadata = (csvData: string[][]): BasicDatasetMetadata => {
  const startTime = Date.now();
  
  if (csvData.length === 0) {
    return {
      total_rows: 0,
      total_columns: 0,
      columns: [],
      file_size: 0,
      processing_time: Date.now() - startTime
    };
  }
  
  const headers = csvData[0];
  const dataRows = csvData.slice(1);
  
  const columns: BasicColumnMetadata[] = headers.map((header, index) => {
    const columnValues = dataRows.map(row => row[index] || '');
    const nonEmptyValues = columnValues.filter(v => v !== null && v !== undefined && v.trim() !== '');
    
    const dataType = detectDataType(columnValues);
    const nullCount = columnValues.length - nonEmptyValues.length;
    const uniqueValues = [...new Set(nonEmptyValues)];
    const sampleValues = uniqueValues.slice(0, 5); // First 5 unique values
    const stats = calculateColumnStats(columnValues, dataType);
    
    return {
      column_name: header.trim(),
      data_type_detected: dataType,
      sample_values: sampleValues,
      null_count: nullCount,
      unique_count: uniqueValues.length,
      ...stats
    };
  });
  
  return {
    total_rows: dataRows.length,
    total_columns: headers.length,
    columns,
    file_size: 0, // Will be set from file info
    processing_time: Date.now() - startTime
  };
};
