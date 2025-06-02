
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Database, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const DatasetSchemaView = () => {
  const { datasetId } = useParams();
  const navigate = useNavigate();

  const { data: schema, isLoading } = useQuery({
    queryKey: ['dataset-schema', datasetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dataset_schemas')
        .select(`
          *,
          datasets!inner(name, file_name)
        `)
        .eq('dataset_id', datasetId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "SQL schema has been copied to your clipboard",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <p>Loading schema...</p>
        </div>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <p>Schema not found</p>
        </div>
      </div>
    );
  }

  const analysis = schema.column_analysis;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Datasets
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Dataset Schema</h1>
            <p className="text-muted-foreground">{schema.datasets.name}</p>
          </div>
        </div>

        {/* Generated SQL Schema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Generated SQL Schema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 z-10"
                onClick={() => copyToClipboard(schema.generated_sql)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                {schema.generated_sql}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Column Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Column Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {analysis.column_analysis?.map((column: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">{column.column_name}</h3>
                    <Badge variant="secondary">{column.sql_type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {column.description}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Data Type:</span> {column.data_type}
                    </div>
                    <div>
                      <span className="font-medium">Unique Count:</span> {column.unique_count || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Null Count:</span> {column.null_count || 0}
                    </div>
                    <div>
                      <span className="font-medium">Sample Values:</span> 
                      <div className="mt-1">
                        {column.sample_values?.slice(0, 3).map((value: string, i: number) => (
                          <Badge key={i} variant="outline" className="mr-1 text-xs">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Table Name:</span> {analysis.table_name}
              </div>
              <div>
                <span className="font-medium">Total Columns:</span> {analysis.total_columns}
              </div>
              <div>
                <span className="font-medium">Analysis Date:</span> {new Date(schema.created_at).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">File:</span> {schema.datasets.file_name}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatasetSchemaView;
