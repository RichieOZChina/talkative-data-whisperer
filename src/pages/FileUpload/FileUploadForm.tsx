
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FileUploadFormProps {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  uploading: boolean;
  onUpload: () => void;
}

const FileUploadForm = ({ selectedFile, setSelectedFile, uploading, onUpload }: FileUploadFormProps) => {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
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

  return (
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
        onClick={onUpload}
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
  );
};

export default FileUploadForm;
