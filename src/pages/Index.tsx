
import React from 'react';
import DataAgentHeader from '@/components/DataAgentHeader';
import FileUpload from '@/components/FileUpload';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <DataAgentHeader />
        
        <div className="flex justify-center">
          <FileUpload />
        </div>
        
        <div className="mt-12 text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-3">What happens next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="space-y-1">
                <div className="font-medium text-foreground">1. Upload</div>
                <div>Your CSV is securely stored in the database</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium text-foreground">2. Process</div>
                <div>AI automations analyze your data structure</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium text-foreground">3. Insights</div>
                <div>Get automated reports and recommendations</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
