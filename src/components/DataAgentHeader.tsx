
import React from 'react';
import { Brain, Database } from 'lucide-react';

const DataAgentHeader = () => {
  return (
    <div className="text-center space-y-4 mb-8">
      <div className="flex items-center justify-center gap-3">
        <Brain className="h-8 w-8 text-blue-600" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI Data Agent
        </h1>
        <Database className="h-8 w-8 text-purple-600" />
      </div>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Upload your CSV data and let AI automations analyze, process, and extract insights from your datasets
      </p>
    </div>
  );
};

export default DataAgentHeader;
