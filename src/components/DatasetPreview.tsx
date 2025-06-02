
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { parseCSV, getAnalysisData } from './DatasetPreview/utils';
import MetadataAnalysisCard from './DatasetPreview/MetadataAnalysisCard';
import DataTable from './DatasetPreview/DataTable';
import PreviewSummary from './DatasetPreview/PreviewSummary';

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

  const analysis = getAnalysisData(schemaData);

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
            <MetadataAnalysisCard analysis={analysis} isLoading={schemaLoading} />
            <DataTable csvData={csvData} analysis={analysis} />
            <PreviewSummary csvData={csvData} analysis={analysis} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DatasetPreview;
