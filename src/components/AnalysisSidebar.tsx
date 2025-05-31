
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Brain, Settings, Play } from 'lucide-react';

interface AnalysisSidebarProps {
  prompts: any[] | undefined;
  models: any[] | undefined;
  selectedPromptId: string;
  selectedModelId: string;
  onPromptSelect: (promptId: string) => void;
  onModelSelect: (modelId: string) => void;
  dataset: any;
  onAnalysisComplete: (result: any) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

const AnalysisSidebar = ({
  prompts,
  models,
  selectedPromptId,
  selectedModelId,
  onPromptSelect,
  onModelSelect,
  dataset,
  onAnalysisComplete,
  isAnalyzing,
  setIsAnalyzing
}: AnalysisSidebarProps) => {
  
  const getDatasetPreview = async () => {
    try {
      const { data: fileData, error } = await supabase.storage
        .from('datasets')
        .download(dataset.file_path);

      if (error) {
        console.error('File download error:', error);
        throw error;
      }

      const csvText = await fileData.text();
      const lines = csvText.split('\n').filter(line => line.trim());
      
      // Get first 10 rows for preview
      const previewLines = lines.slice(0, 10);
      return previewLines.join('\n');
    } catch (error) {
      console.error('Error getting dataset preview:', error);
      return 'Unable to load dataset preview';
    }
  };

  const runAnalysis = async () => {
    if (!selectedPromptId || !selectedModelId) {
      toast({
        title: "Selection required",
        description: "Please select both a prompt and model for analysis",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to start analysis",
          variant: "destructive",
        });
        return;
      }

      const selectedPrompt = prompts?.find(p => p.id === selectedPromptId);
      const selectedModel = models?.find(m => m.id === selectedModelId);

      if (!selectedPrompt || !selectedModel) {
        toast({
          title: "Error",
          description: "Could not find selected prompt or model",
          variant: "destructive",
        });
        return;
      }

      // Create analysis record
      const { data: analysisData, error: analysisError } = await supabase
        .from('analyses')
        .insert({
          dataset_id: dataset.id,
          user_id: session.session.user.id,
          analysis_type: selectedPrompt.analysis_type,
          status: 'running',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (analysisError) throw analysisError;

      // Get dataset preview
      const datasetPreview = await getDatasetPreview();

      // Prepare prompt with variables
      let processedPrompt = selectedPrompt.prompt_text
        .replace('{dataset_preview}', datasetPreview)
        .replace('{dataset_name}', dataset.name)
        .replace('{row_count}', dataset.row_count?.toString() || 'Unknown')
        .replace('{column_count}', dataset.column_count?.toString() || 'Unknown');

      // Call the OpenAI edge function
      const response = await supabase.functions.invoke('chat-with-openai', {
        body: {
          messages: [
            { role: 'user', content: processedPrompt }
          ],
          model: selectedModel.model_id
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to get AI response');
      }

      const aiResponse = response.data.choices[0].message.content;

      // Store the analysis result
      await supabase
        .from('analysis_results')
        .insert({
          analysis_id: analysisData.id,
          title: `${selectedPrompt.name} - ${dataset.name}`,
          content: { analysis: aiResponse },
          result_type: 'text_analysis'
        });

      // Update analysis status
      await supabase
        .from('analyses')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', analysisData.id);

      // Add to results
      onAnalysisComplete({
        id: analysisData.id,
        title: `${selectedPrompt.name}`,
        content: aiResponse,
        timestamp: new Date().toISOString(),
        prompt: selectedPrompt.name,
        model: selectedModel.name
      });

      toast({
        title: "Analysis completed",
        description: "Your analysis has been completed successfully",
      });

    } catch (error) {
      console.error('Error during analysis:', error);
      
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "An error occurred during analysis",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Analysis Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prompt Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Brain className="h-4 w-4" />
            Analysis Type
          </label>
          <Select value={selectedPromptId} onValueChange={onPromptSelect}>
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

        {/* Model Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Settings className="h-4 w-4" />
            AI Model
          </label>
          <Select value={selectedModelId} onValueChange={onModelSelect}>
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

        {/* Run Analysis Button */}
        <Button 
          onClick={runAnalysis}
          disabled={!selectedPromptId || !selectedModelId || isAnalyzing}
          className="w-full flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          {isAnalyzing ? 'Running Analysis...' : 'Run Analysis'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AnalysisSidebar;
