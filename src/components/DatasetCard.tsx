
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Database, Calendar, BarChart } from 'lucide-react';
import DatasetPreview from './DatasetPreview';
import DatasetAnalysisControls from './DatasetAnalysisControls';

interface Dataset {
  id: string;
  name: string;
  file_name: string;
  file_size: number;
  row_count: number;
  column_count: number;
  created_at: string;
  status: string;
}

interface Prompt {
  id: string;
  name: string;
  description: string;
  analysis_type: string;
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
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {dataset.name}
            </CardTitle>
            <CardDescription>
              {dataset.file_name} • {(dataset.file_size / 1024).toFixed(1)} KB
            </CardDescription>
          </div>
          <Badge variant={dataset.status === 'ready' ? 'default' : 'secondary'}>
            {dataset.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Database className="h-4 w-4" />
            {dataset.row_count} rows
          </div>
          <div className="flex items-center gap-1">
            <BarChart className="h-4 w-4" />
            {dataset.column_count} columns
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(dataset.created_at).toLocaleDateString()}
          </div>
        </div>
        
        {dataset.status === 'ready' && (
          <div className="space-y-4">
            <DatasetAnalysisControls
              datasetId={dataset.id}
              prompts={prompts}
              models={models}
              selectedPrompts={selectedPrompts}
              selectedModels={selectedModels}
              onPromptChange={onPromptChange}
              onModelChange={onModelChange}
            />

            <div className="flex gap-2">
              <DatasetPreview dataset={dataset} />
              <Button 
                onClick={() => onStartAnalysis(dataset.id)}
                className="flex-1"
                disabled={!selectedPrompts[dataset.id] || !selectedModels[dataset.id]}
              >
                Start AI Analysis
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatasetCard;
