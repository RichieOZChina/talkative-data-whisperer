
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Settings } from 'lucide-react';

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

interface DatasetAnalysisControlsProps {
  datasetId: string;
  prompts: Prompt[] | undefined;
  models: Model[] | undefined;
  selectedPrompts: {[key: string]: string};
  selectedModels: {[key: string]: string};
  onPromptChange: (datasetId: string, promptId: string) => void;
  onModelChange: (datasetId: string, modelId: string) => void;
}

const DatasetAnalysisControls = ({
  datasetId,
  prompts,
  models,
  selectedPrompts,
  selectedModels,
  onPromptChange,
  onModelChange
}: DatasetAnalysisControlsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-1">
          <Brain className="h-4 w-4" />
          Analysis Type
        </label>
        <Select
          value={selectedPrompts[datasetId] || ''}
          onValueChange={(value) => onPromptChange(datasetId, value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select analysis type" />
          </SelectTrigger>
          <SelectContent>
            {prompts?.map((prompt) => (
              <SelectItem key={prompt.id} value={prompt.id}>
                <div className="space-y-1">
                  <div className="font-medium">{prompt.name}</div>
                  <div className="text-xs text-muted-foreground">{prompt.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-1">
          <Settings className="h-4 w-4" />
          AI Model
        </label>
        <Select
          value={selectedModels[datasetId] || ''}
          onValueChange={(value) => onModelChange(datasetId, value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select AI model" />
          </SelectTrigger>
          <SelectContent>
            {models?.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                <div className="space-y-1">
                  <div className="font-medium">{model.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {model.provider} • {model.context_length?.toLocaleString()} tokens
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default DatasetAnalysisControls;
