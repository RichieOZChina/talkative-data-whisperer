
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
  const { data: schemaData, isLoading: schemaLoading } = useQuery({
    queryKey: ['dataset-schema', dataset.id],
    queryFn: async () => {
      console.log('Fetching schema for dataset:', dataset.id);
      const { data, error } = await supabase
        .from('dataset_schemas')
        .select('*')
        .eq('dataset_id', dataset.id)
        .single();
      
      if (error) {
        console.log('No schema found:', error);
        return null;
      }
      console.log('Schema data:', data);
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
    
    // Handle the case where column_analysis might be nested
    const analysis = schemaData.column_analysis as any;
    if (analysis.column_analysis) {
      return analysis as AnalysisData;
    }
    
    // Handle direct column_analysis array
    if (Array.isArray(analysis)) {
      return {
        column_analysis: analysis,
        table_name: schemaData.table_name || 'Unknown',
        total_columns: analysis.length
      };
    }
    
    return analysis as AnalysisData;
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

        {(loading || schemaLoading) ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading data preview and analysis...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Column Analysis Section - Always show if available */}
            {analysis && analysis.column_analysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Database className="h-5 w-5" />
                    AI Metadata Analysis
                    <Badge variant="secondary" className="ml-2">
                      {analysis.column_analysis.length} columns analyzed
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {analysis.column_analysis.map((column: ColumnAnalysis, index: number) => (
                      <div key={index} className="border rounded-lg p-4 bg-muted/20">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{column.column_name}</h4>
                          <Badge variant="secondary">{column.sql_type}</Badge>
                          <Badge variant="outline">{column.data_type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{column.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="space-y-1">
                            <span className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Statistics</span>
                            <div className="space-y-1">
                              <div><span className="font-medium">Unique:</span> {column.unique_count || 'N/A'}</div>
                              <div><span className="font-medium">Nulls:</span> {column.null_count || 0}</div>
                            </div>
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <span className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Sample Values</span>
                            <div className="flex flex-wrap gap-1">
                              {column.sample_values?.slice(0, 4).map((value: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs px-2 py-1">
                                  {value.length > 15 ? `${value.substring(0, 15)}...` : value}
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

            {/* Show message if no analysis available */}
            {!analysis && !schemaLoading && (
              <Card>
                <CardContent className="py-6">
                  <div className="text-center text-muted-foreground">
                    <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No AI analysis available for this dataset yet.</p>
                    <p className="text-sm">Analysis will be generated automatically after upload.</p>
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
                              <TableHead key={index} className="font-semibold bg-muted/50 min-w-[150px]">
                                <div className="space-y-2">
                                  <div className="font-medium">{header}</div>
                                  {colAnalysis && (
                                    <div className="flex flex-col gap-1">
                                      <Badge variant="outline" className="text-xs px-1 w-fit">
                                        {colAnalysis.sql_type}
                                      </Badge>
                                      <div className="text-xs text-muted-foreground font-normal">
                                        {colAnalysis.data_type}
                                      </div>
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
