
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Database } from 'lucide-react';

const EmptyDatasetsView = () => {
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
};

export default EmptyDatasetsView;
