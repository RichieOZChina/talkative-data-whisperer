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
import { BasicDatasetMetadata } from './DatasetPreview/metadataExtraction';

interface DatasetPreviewProps {
  dataset: {
    id: string;
    name: string;
    file_path: string;
    row_count: number;
    column_count: number;
    basic_metadata?: BasicDatasetMetadata;
  };
}

const DatasetPreview = ({ dataset }: DatasetPreviewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Fetch basic metadata from dataset
  const { data: datasetWithMetadata, isLoading: datasetLoading } = useQuery({
    queryKey: ['dataset-with-metadata', dataset.id],
    queryFn: async () => {
      console.log('Fetching dataset with metadata:', dataset.id);
      const { data, error } = await supabase
        .from('datasets')
        .select('*, basic_metadata')
        .eq('id', dataset.id)
        .single();
      
      if (error) {
        console.log('Error fetching dataset:', error);
        return null;
      }
      console.log('Dataset with metadata:', data);
      return data;
    },
    enabled: isOpen,
  });

  // Fetch AI schema analysis if available
  const { data: schemaData, isLoading: schemaLoading, refetch: refetchSchema } = useQuery({
    queryKey: ['dataset-schema', dataset.id],
    queryFn: async () => {
      console.log('Fetching AI schema for dataset:', dataset.id);
      const { data, error } = await supabase
        .from('dataset_schemas')
        .select('*')
        .eq('dataset_id', dataset.id)
        .single();
      
      if (error) {
        console.log('No AI schema found:', error);
        return null;
      }
      console.log('AI Schema data:', data);
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

  const handleGenerateAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      console.log('Triggering AI analysis for dataset:', dataset.id);
      
      const { data, error } = await supabase.functions.invoke('analyze-csv-metadata', {
        body: { datasetId: dataset.id }
      });

      if (error) {
        console.error('Analysis error:', error);
        throw error;
      }

      console.log('Analysis completed:', data);
      toast({
        title: "AI Analysis completed",
        description: "Enhanced metadata analysis has been generated successfully",
      });

      // Refetch the schema data to show the new analysis
      refetchSchema();
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast({
        title: "Error generating AI analysis",
        description: error instanceof Error ? error.message : "Failed to generate AI analysis",
        variant: "destructive",
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      loadPreviewData();
    }
  };

  const aiAnalysis = getAnalysisData(schemaData);
  const basicMetadata = datasetWithMetadata?.basic_metadata as BasicDatasetMetadata | null;

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
            {basicMetadata && " with immediate metadata analysis"}
            {aiAnalysis && " and AI-enhanced insights"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading data preview...
          </div>
        ) : (
          <div className="space-y-6">
            <MetadataAnalysisCard 
              analysis={aiAnalysis} 
              basicMetadata={basicMetadata}
              isLoading={datasetLoading || schemaLoading || analysisLoading}
              datasetId={dataset.id}
              onGenerateAnalysis={handleGenerateAnalysis}
            />
            <DataTable csvData={csvData} analysis={aiAnalysis} />
            <PreviewSummary csvData={csvData} analysis={aiAnalysis} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DatasetPreview;
