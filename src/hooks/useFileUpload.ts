
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { parseCSV } from '@/components/DatasetPreview/utils';
import { extractBasicMetadata } from '@/components/DatasetPreview/metadataExtraction';

export const useFileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [extractingMetadata, setExtractingMetadata] = useState(false);

  // Check if user is authenticated
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const extractImmediateMetadata = async (csvText: string, datasetId: string, fileSize: number) => {
    try {
      setExtractingMetadata(true);
      console.log('Extracting immediate metadata for dataset:', datasetId);

      const parsedData = parseCSV(csvText);
      const basicMetadata = extractBasicMetadata(parsedData);
      basicMetadata.file_size = fileSize;

      console.log('Basic metadata extracted:', basicMetadata);

      // Update dataset with basic metadata - cast to Json type
      const { error: datasetError } = await supabase
        .from('datasets')
        .update({
          basic_metadata: basicMetadata as any, // Cast to Json type
          metadata_extracted_at: new Date().toISOString(),
          status: 'ready'
        })
        .eq('id', datasetId);

      if (datasetError) {
        console.error('Error updating dataset with metadata:', datasetError);
        throw datasetError;
      }

      // Update column information with immediate analysis
      const columnUpdates = basicMetadata.columns.map(async (column, index) => {
        const { error } = await supabase
          .from('dataset_columns')
          .update({
            data_type_detected: column.data_type_detected,
            null_count: column.null_count,
            unique_count: column.unique_count,
            sample_values: column.sample_values,
            min_value: column.min_value,
            max_value: column.max_value,
            mean_value: column.mean_value,
            std_dev: column.std_dev
          })
          .eq('dataset_id', datasetId)
          .eq('column_index', index);

        if (error) {
          console.error('Error updating column metadata:', error);
        }
      });

      await Promise.all(columnUpdates);
      console.log('Immediate metadata extraction completed');

      toast({
        title: "Metadata Extracted",
        description: "Basic metadata has been analyzed and is ready for preview",
      });

    } catch (error) {
      console.error('Error extracting immediate metadata:', error);
      toast({
        title: "Metadata Extraction Failed",
        description: "Could not extract basic metadata from the file",
        variant: "destructive",
      });
    } finally {
      setExtractingMetadata(false);
    }
  };

  const analyzeDatasetMetadata = async (datasetId: string) => {
    try {
      setAnalyzing(true);
      console.log('Starting AI metadata analysis for dataset:', datasetId);

      const { data, error } = await supabase.functions.invoke('analyze-csv-metadata', {
        body: { datasetId }
      });

      if (error) {
        console.error('AI Analysis error:', error);
        throw error;
      }

      console.log('AI Metadata analysis complete:', data);
      
      toast({
        title: "AI Analysis Complete",
        description: "AI has generated enhanced metadata and SQL schema",
      });

      return data;
    } catch (error) {
      console.error('Error analyzing metadata:', error);
      toast({
        title: "AI Analysis Failed", 
        description: "Could not generate AI analysis. Basic metadata is still available.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload files",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Create file path with user ID
      const fileName = `${Date.now()}-${selectedFile.name}`;
      const filePath = `${session.user.id}/${fileName}`;

      console.log('Uploading file to:', filePath);

      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('datasets')
        .upload(filePath, selectedFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully:', uploadData);

      // Read file content to analyze structure
      const fileText = await selectedFile.text();
      const parsedData = parseCSV(fileText);
      const rowCount = Math.max(0, parsedData.length - 1); // Subtract header row
      const columnCount = parsedData.length > 0 ? parsedData[0].length : 0;

      console.log('CSV analysis:', { rowCount, columnCount });

      // Save dataset metadata to database
      const { data: datasetData, error: datasetError } = await supabase
        .from('datasets')
        .insert({
          user_id: session.user.id,
          name: selectedFile.name.replace('.csv', ''),
          file_name: selectedFile.name,
          file_path: filePath,
          file_size: selectedFile.size,
          row_count: rowCount,
          column_count: columnCount,
          status: 'processing'
        })
        .select()
        .single();

      if (datasetError) {
        console.error('Dataset creation error:', datasetError);
        throw datasetError;
      }

      console.log('Dataset created:', datasetData);

      // Save column information
      const headers = parsedData.length > 0 ? parsedData[0] : [];
      const columnPromises = headers.map((header, index) => 
        supabase.from('dataset_columns').insert({
          dataset_id: datasetData.id,
          column_name: header,
          column_type: 'text', // Default, will be updated by immediate analysis
          column_index: index
        })
      );

      await Promise.all(columnPromises);
      console.log('Columns saved successfully');

      setUploadComplete(true);
      toast({
        title: "Upload successful",
        description: "Your CSV file has been processed and saved",
      });

      // Extract immediate metadata
      await extractImmediateMetadata(fileText, datasetData.id, selectedFile.size);

      // Optionally trigger AI analysis
      await analyzeDatasetMetadata(datasetData.id);

    } catch (error) {
      console.error('Upload process error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading your file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadComplete(false);
    setUploading(false);
    setAnalyzing(false);
    setExtractingMetadata(false);
  };

  return {
    selectedFile,
    setSelectedFile,
    uploading,
    uploadComplete,
    analyzing,
    extractingMetadata,
    session,
    handleUpload,
    resetUpload
  };
};
