
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, FileText, Loader2, Database, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DatasetPreviewProps {
  dataset: {
    id: string;
    name: string;
    file_path: string;
    row_count: number;
    column_count: number;
  };
}

interface ColumnAnalysis {
  column_name: string;
  data_type: string;
  sql_type: string;
  sample_values?: string[];
  null_count?: number;
  unique_count?: number;
  description: string;
}

interface AnalysisData {
  column_analysis?: ColumnAnalysis[];
  table_name?: string;
  total_columns?: number;
}

const DatasetPreview = ({ dataset }: DatasetPreviewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch schema analysis if available
  const { data: schemaData } = useQuery({
    queryKey: ['dataset-schema', dataset.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dataset_schemas')
        .select('*')
        .eq('dataset_id', dataset.id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: isOpen,
  });

  const parseCSV = (csvText: string): string[][] => {
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

  const loadPreviewData = async () => {
    if (csvData.length > 0) return; // Already loaded

    setLoading(true);
    try {
      console.log('Loading preview for file:', dataset.file_path);

      const { data: fileData, error } = await supabase.storage
        .from('datasets')
        .download(dataset.file_path);

      if (error) {
        console.error('File download error:', error);
        throw error;
      }

      const csvText = await fileData.text();
      const parsedData = parseCSV(csvText);
      
      // Limit to first 50 rows for preview
      const previewData = parsedData.slice(0, 50);
      setCsvData(previewData);
      
      console.log('Preview data loaded:', previewData.length, 'rows');
    } catch (error) {
      console.error('Error loading preview:', error);
      toast({
        title: "Error loading preview",
        description: error instanceof Error ? error.message : "Failed to load data preview",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      loadPreviewData();
    }
  };

  const getAnalysisData = (): AnalysisData | null => {
    if (!schemaData?.column_analysis || typeof schemaData.column_analysis !== 'object') {
      return null;
    }
    return schemaData.column_analysis as AnalysisData;
  };

  const analysis = getAnalysisData();
  const headers = csvData.length > 0 ? csvData[0] : [];
  const rows = csvData.length > 1 ? csvData.slice(1) : [];

  // Get column analysis for a specific column
  const getColumnAnalysis = (columnName: string): ColumnAnalysis | undefined => {
    return analysis?.column_analysis?.find(col => col.column_name === columnName);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          View Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {dataset.name} - Data Preview & Analysis
          </DialogTitle>
          <DialogDescription>
            Showing first 50 rows of your dataset ({dataset.row_count} total rows, {dataset.column_count} columns)
            {analysis && " with AI-generated metadata analysis"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading data preview...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Column Analysis Section */}
            {analysis && analysis.column_analysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Database className="h-5 w-5" />
                    AI Column Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {analysis.column_analysis.map((column: ColumnAnalysis, index: number) => (
                      <div key={index} className="border rounded-lg p-3 bg-muted/20">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-sm">{column.column_name}</h4>
                          <Badge variant="secondary" className="text-xs">{column.sql_type}</Badge>
                          <Badge variant="outline" className="text-xs">{column.data_type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{column.description}</p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="font-medium">Unique:</span> {column.unique_count || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Nulls:</span> {column.null_count || 0}
                          </div>
                          <div>
                            <span className="font-medium">Samples:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {column.sample_values?.slice(0, 2).map((value: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs px-1">
                                  {value.length > 10 ? `${value.substring(0, 10)}...` : value}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Data Table Section */}
            {csvData.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Info className="h-5 w-5" />
                    Raw Data Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {headers.map((header, index) => {
                            const colAnalysis = getColumnAnalysis(header);
                            return (
                              <TableHead key={index} className="font-semibold bg-muted/50 min-w-[120px]">
                                <div className="space-y-1">
                                  <div>{header}</div>
                                  {colAnalysis && (
                                    <div className="flex gap-1">
                                      <Badge variant="outline" className="text-xs px-1">
                                        {colAnalysis.sql_type}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </TableHead>
                            );
                          })}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <TableCell key={cellIndex} className="max-w-xs truncate text-sm">
                                {cell || <span className="text-muted-foreground italic">empty</span>}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No data to display
              </div>
            )}

            {/* Summary Stats */}
            {csvData.length > 0 && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-4">
                <Badge variant="secondary">
                  {rows.length} rows shown
                </Badge>
                <Badge variant="secondary">
                  {headers.length} columns
                </Badge>
                {analysis && (
                  <Badge variant="secondary">
                    AI Analysis: {analysis.table_name || 'Generated'}
                  </Badge>
                )}
                {rows.length >= 49 && (
                  <span className="text-xs">
                    * Preview limited to first 50 rows
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DatasetPreview;
