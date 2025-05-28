
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Eye, FileText, Loader2 } from 'lucide-react';
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

const DatasetPreview = ({ dataset }: DatasetPreviewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);

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

  const headers = csvData.length > 0 ? csvData[0] : [];
  const rows = csvData.length > 1 ? csvData.slice(1) : [];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          View Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {dataset.name} - Data Preview
          </DialogTitle>
          <DialogDescription>
            Showing first 50 rows of your dataset ({dataset.row_count} total rows, {dataset.column_count} columns)
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading data preview...
          </div>
        ) : csvData.length > 0 ? (
          <ScrollArea className="h-[500px] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header, index) => (
                    <TableHead key={index} className="font-semibold bg-muted/50">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex} className="max-w-xs truncate">
                        {cell || <span className="text-muted-foreground italic">empty</span>}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No data to display
          </div>
        )}

        {csvData.length > 0 && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-4">
            <Badge variant="secondary">
              {rows.length} rows shown
            </Badge>
            <Badge variant="secondary">
              {headers.length} columns
            </Badge>
            {rows.length >= 49 && (
              <span className="text-xs">
                * Preview limited to first 50 rows
              </span>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DatasetPreview;
