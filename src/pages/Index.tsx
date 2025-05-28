
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DataAgentHeader from '@/components/DataAgentHeader';
import FileUpload from '@/components/FileUpload';
import AuthComponent from '@/components/AuthComponent';
import DatasetsList from '@/components/DatasetsList';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [session, setSession] = useState(null);

  const { data: currentSession, refetch } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  useEffect(() => {
    setSession(currentSession);
  }, [currentSession]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        refetch();
        if (event === 'SIGNED_IN') {
          toast({
            title: "Welcome!",
            description: "You're now signed in and ready to upload data",
          });
        }
        if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out",
            description: "You've been signed out successfully",
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [refetch]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <DataAgentHeader />
        
        {session && (
          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                {session.user.email}
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
        
        <div className="grid gap-8">
          {!session ? (
            <div className="flex justify-center">
              <AuthComponent />
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <FileUpload />
              </div>
              
              <DatasetsList />
            </>
          )}
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
