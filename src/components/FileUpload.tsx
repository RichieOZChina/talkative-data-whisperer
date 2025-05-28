
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  // Check if user is authenticated
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setUploadComplete(false);
        toast({
          title: "File selected",
          description: `${file.name} is ready to upload`,
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV file",
          variant: "destructive",
        });
      }
    }
  };

  const parseCSVHeaders = (csvText: string) => {
    const lines = csvText.split('\n');
    if (lines.length === 0) return [];
    
    // Parse the first line as headers
    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    return headers;
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
      const headers = parseCSVHeaders(fileText);
      const lines = fileText.split('\n').filter(line => line.trim());
      const rowCount = Math.max(0, lines.length - 1); // Subtract header row

      console.log('CSV analysis:', { headers, rowCount });

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
          column_count: headers.length,
          status: 'ready'
        })
        .select()
        .single();

      if (datasetError) {
        console.error('Dataset creation error:', datasetError);
        throw datasetError;
      }

      console.log('Dataset created:', datasetData);

      // Save column information
      const columnPromises = headers.map((header, index) => 
        supabase.from('dataset_columns').insert({
          dataset_id: datasetData.id,
          column_name: header,
          column_type: 'text', // Default to text, can be enhanced later
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
  };

  if (!session) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <FileText className="h-6 w-6" />
            CSV Upload
          </CardTitle>
          <CardDescription>
            Please sign in to upload and analyze your CSV files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => {
              // This will be updated when we add authentication
              toast({
                title: "Authentication coming soon",
                description: "User authentication will be implemented next",
              });
            }}
            className="w-full"
          >
            Sign In to Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <FileText className="h-6 w-6" />
          CSV Upload
        </CardTitle>
        <CardDescription>
          Upload your CSV file to start AI data analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!uploadComplete ? (
          <>
            <div className="space-y-2">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
            
            <Button 
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload CSV
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <p className="font-medium">Upload Complete!</p>
              <p className="text-sm text-muted-foreground">
                Your data is ready for AI analysis
              </p>
            </div>
            <Button onClick={resetUpload} variant="outline" className="w-full">
              Upload Another File
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;
