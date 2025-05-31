
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Database, Calendar, BarChart, Brain, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import DatasetPreview from './DatasetPreview';

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

      const { data, error } = await supabase
        .from('analyses')
        .insert({
          dataset_id: datasetId,
          user_id: session.session.user.id,
          analysis_type: selectedPrompt?.analysis_type || 'general_insights',
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Analysis started:', data);
      console.log('Using prompt:', selectedPrompt?.name);
      console.log('Using model:', selectedModel?.name);

      toast({
        title: "Analysis started",
        description: `Analysis queued using ${selectedPrompt?.name} with ${selectedModel?.name}`,
      });
    } catch (error) {
      toast({
        title: "Error starting analysis",
        description: error instanceof Error ? error.message : "An error occurred",
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
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Datasets</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No datasets uploaded yet</p>
              <p className="text-sm">Upload your first CSV file to get started</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Datasets</h3>
      <div className="grid gap-4">
        {datasets.map((dataset) => (
          <Card key={dataset.id}>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <Brain className="h-4 w-4" />
                        Analysis Type
                      </label>
                      <Select
                        value={selectedPrompts[dataset.id] || ''}
                        onValueChange={(value) => setSelectedPrompts(prev => ({...prev, [dataset.id]: value}))}
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
                        value={selectedModels[dataset.id] || ''}
                        onValueChange={(value) => setSelectedModels(prev => ({...prev, [dataset.id]: value}))}
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

                  <div className="flex gap-2">
                    <DatasetPreview dataset={dataset} />
                    <Button 
                      onClick={() => startAnalysis(dataset.id)}
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
        ))}
      </div>
    </div>
  );
};

export default DatasetsList;
