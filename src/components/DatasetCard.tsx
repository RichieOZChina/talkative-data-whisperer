
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Play } from 'lucide-react';
import DatasetAnalysisControls from './DatasetAnalysisControls';
import DatasetPreview from './DatasetPreview';

interface Dataset {
  id: string;
  name: string;
  file_path?: string;
  row_count?: number;
  column_count?: number;
  created_at: string;
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
  const selectedPromptId = selectedPrompts[dataset.id];
  const selectedModelId = selectedModels[dataset.id];
  const canStartAnalysis = selectedPromptId && selectedModelId;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {dataset.name}
        </CardTitle>
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
          <DatasetPreview dataset={dataset} />
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
