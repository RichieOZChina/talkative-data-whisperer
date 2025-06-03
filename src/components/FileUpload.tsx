
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import AuthGuard from '@/pages/FileUpload/AuthGuard';
import FileUploadForm from '@/pages/FileUpload/FileUploadForm';
import UploadStatusDisplay from '@/pages/FileUpload/UploadStatusDisplay';

const FileUpload = () => {
  const {
    selectedFile,
    setSelectedFile,
    uploading,
    uploadComplete,
    analyzing,
    extractingMetadata,
    session,
    handleUpload,
    resetUpload
  } = useFileUpload();

  if (!session) {
    return <AuthGuard />;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <FileText className="h-6 w-6" />
          CSV Upload
        </CardTitle>
        <CardDescription>
          Upload your CSV file for immediate metadata analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!uploadComplete ? (
          <FileUploadForm
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            uploading={uploading}
            onUpload={handleUpload}
          />
        ) : (
          <UploadStatusDisplay
            extractingMetadata={extractingMetadata}
            analyzing={analyzing}
            onReset={resetUpload}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;
