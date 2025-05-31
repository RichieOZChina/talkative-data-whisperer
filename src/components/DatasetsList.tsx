import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import DatasetCard from './DatasetCard';
import EmptyDatasetsView from './EmptyDatasetsView';

const DatasetsList = () => {
  const [selectedPrompts, setSelectedPrompts] = useState<{[key: string]: string}>({});
  const [selectedModels, setSelectedModels] = useState<{[key: string]: string}>({});

  const { data: datasets, isLoading } = useQuery({
    queryKey: ['datasets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: prompts } = useQuery({
    queryKey: ['prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: models } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const handlePromptChange = (datasetId: string, promptId: string) => {
    setSelectedPrompts(prev => ({...prev, [datasetId]: promptId}));
  };

  const handleModelChange = (datasetId: string, modelId: string) => {
    setSelectedModels(prev => ({...prev, [datasetId]: modelId}));
  };

  const getDatasetPreview = async (dataset: any) => {
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

  const startAnalysis = async (datasetId: string) => {
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

      const selectedPromptId = selectedPrompts[datasetId];
      const selectedModelId = selectedModels[datasetId];

      if (!selectedPromptId || !selectedModelId) {
        toast({
          title: "Selection required",
          description: "Please select both a prompt and model for analysis",
          variant: "destructive",
        });
        return;
      }

      const selectedPrompt = prompts?.find(p => p.id === selectedPromptId);
      const selectedModel = models?.find(m => m.id === selectedModelId);
      const dataset = datasets?.find(d => d.id === datasetId);

      if (!selectedPrompt || !selectedModel || !dataset) {
        toast({
          title: "Error",
          description: "Could not find selected prompt, model, or dataset",
          variant: "destructive",
        });
        return;
      }

      // Create analysis record
      const { data: analysisData, error: analysisError } = await supabase
        .from('analyses')
        .insert({
          dataset_id: datasetId,
          user_id: session.session.user.id,
          analysis_type: selectedPrompt.analysis_type,
          status: 'running',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (analysisError) throw analysisError;

      toast({
        title: "Analysis started",
        description: `Analysis queued using ${selectedPrompt.name} with ${selectedModel.name}`,
      });

      // Get dataset preview
      const datasetPreview = await getDatasetPreview(dataset);

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

      toast({
        title: "Analysis completed",
        description: "Your dataset analysis has been completed successfully",
      });

      console.log('Analysis completed:', aiResponse);

    } catch (error) {
      console.error('Error during analysis:', error);
      
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "An error occurred during analysis",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Datasets</h3>
        <p className="text-muted-foreground">Loading datasets...</p>
      </div>
    );
  }

  if (!datasets || datasets.length === 0) {
    return <EmptyDatasetsView />;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Datasets</h3>
      <div className="grid gap-4">
        {datasets.map((dataset) => (
          <DatasetCard
            key={dataset.id}
            dataset={dataset}
            prompts={prompts}
            models={models}
            selectedPrompts={selectedPrompts}
            selectedModels={selectedModels}
            onPromptChange={handlePromptChange}
            onModelChange={handleModelChange}
            onStartAnalysis={startAnalysis}
          />
        ))}
      </div>
    </div>
  );
};

export default DatasetsList;
