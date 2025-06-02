
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Play, Database, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DatasetAnalysisControls from './DatasetAnalysisControls';
import DatasetPreview from './DatasetPreview';

interface Dataset {
  id: string;
  name: string;
  file_path: string;
  row_count: number;
  column_count: number;
  created_at: string;
  status?: string;
}

interface Prompt {
  id: string;
  name: string;
  description: string;
}

interface Model {
  id: string;
  name: string;
  provider: string;
  context_length: number;
}

interface DatasetCardProps {
  dataset: Dataset;
  prompts: Prompt[] | undefined;
  models: Model[] | undefined;
  selectedPrompts: {[key: string]: string};
  selectedModels: {[key: string]: string};
  onPromptChange: (datasetId: string, promptId: string) => void;
  onModelChange: (datasetId: string, modelId: string) => void;
  onStartAnalysis: (datasetId: string) => void;
}

const DatasetCard = ({
  dataset,
  prompts,
  models,
  selectedPrompts,
  selectedModels,
  onPromptChange,
  onModelChange,
  onStartAnalysis
}: DatasetCardProps) => {
  const navigate = useNavigate();
  const selectedPromptId = selectedPrompts[dataset.id];
  const selectedModelId = selectedModels[dataset.id];
  const canStartAnalysis = selectedPromptId && selectedModelId;

  // Check if we have the required data for preview
  const canShowPreview = dataset.file_path && dataset.row_count && dataset.column_count;

  // Check if schema exists for this dataset
  const { data: schemaExists } = useQuery({
    queryKey: ['dataset-schema-exists', dataset.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dataset_schemas')
        .select('id')
        .eq('dataset_id', dataset.id)
        .single();
      
      return !error && data;
    },
  });

  const getStatusBadge = () => {
    switch (dataset.status) {
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'analyzed':
        return <Badge variant="default" className="bg-green-500">Analyzed</Badge>;
      case 'ready':
        return <Badge variant="outline">Ready</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {dataset.name}
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-medium">Rows:</span> {dataset.row_count || 'Unknown'}
          </div>
          <div>
            <span className="font-medium">Columns:</span> {dataset.column_count || 'Unknown'}
          </div>
          <div>
            <span className="font-medium">Uploaded:</span> {new Date(dataset.created_at).toLocaleDateString()}
          </div>
        </div>

        {schemaExists && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <Database className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">SQL schema generated</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/schema/${dataset.id}`)}
              className="ml-auto"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Schema
            </Button>
          </div>
        )}

        <DatasetAnalysisControls
          datasetId={dataset.id}
          prompts={prompts}
          models={models}
          selectedPrompts={selectedPrompts}
          selectedModels={selectedModels}
          onPromptChange={onPromptChange}
          onModelChange={onModelChange}
        />

        <div className="flex justify-between items-center">
          {canShowPreview && <DatasetPreview dataset={dataset} />}
          <Button 
            onClick={() => onStartAnalysis(dataset.id)}
            disabled={!canStartAnalysis}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Start Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatasetCard;
