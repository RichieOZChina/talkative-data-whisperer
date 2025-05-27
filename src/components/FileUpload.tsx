
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

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

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // TODO: Integrate with Supabase for file upload and database storage
      // For now, simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUploadComplete(true);
      toast({
        title: "Upload successful",
        description: "Your CSV file has been processed and saved",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file",
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
