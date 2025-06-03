
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AuthGuard = () => {
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
};

export default AuthGuard;
