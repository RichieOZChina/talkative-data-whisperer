
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Brain, Database } from 'lucide-react';

interface UploadStatusDisplayProps {
  extractingMetadata: boolean;
  analyzing: boolean;
  onReset: () => void;
}

const UploadStatusDisplay = ({ extractingMetadata, analyzing, onReset }: UploadStatusDisplayProps) => {
  return (
    <div className="text-center space-y-4">
      {extractingMetadata ? (
        <>
          <Database className="h-12 w-12 text-blue-500 mx-auto animate-pulse" />
          <div>
            <p className="font-medium">Extracting metadata...</p>
            <p className="text-sm text-muted-foreground">
              Analyzing columns and data types
            </p>
          </div>
        </>
      ) : analyzing ? (
        <>
          <Brain className="h-12 w-12 text-purple-500 mx-auto animate-pulse" />
          <div>
            <p className="font-medium">AI is analyzing your data...</p>
            <p className="text-sm text-muted-foreground">
              Generating enhanced metadata and SQL schema
            </p>
          </div>
        </>
      ) : (
        <>
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
          <div>
            <p className="font-medium">Upload & Analysis Complete!</p>
            <p className="text-sm text-muted-foreground">
              Your data is ready for preview and analysis
            </p>
          </div>
        </>
      )}
      <Button onClick={onReset} variant="outline" className="w-full">
        Upload Another File
      </Button>
    </div>
  );
};

export default UploadStatusDisplay;
