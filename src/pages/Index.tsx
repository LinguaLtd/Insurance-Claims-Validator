import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Brain, AlertTriangle, TrendingUp } from 'lucide-react';
import { MultipleDocumentUploader } from '@/components/MultipleDocumentUploader';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleFilesUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    toast.info(`Processing ${files.length} document${files.length > 1 ? 's' : ''}...`);
    
    // Navigate to dashboard with the files
    navigate('/dashboard', { state: { files } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12">
          <div className="flex justify-center">
            <div className="relative">
              <Shield className="h-20 w-20 text-primary" />
              <div className="absolute -top-2 -right-2 h-8 w-8 bg-accent rounded-full flex items-center justify-center">
                <Brain className="h-5 w-5 text-accent-foreground" />
              </div>
            </div>
          </div>
          
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              DeepExtract
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              AI-powered insurance claims fraud detection and analysis. Upload multiple documents 
              to automatically identify inconsistencies, suspicious patterns, and potential fraud indicators.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          <MultipleDocumentUploader 
            onFilesUpload={handleFilesUpload}
            isProcessing={isProcessing}
          />

          {/* Features Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-semibold text-center text-foreground mb-8">
              Advanced Insurance Claims Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-card border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="flex justify-center">
                    <AlertTriangle className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Fraud Detection</h3>
                  <p className="text-muted-foreground">
                    Automatically identify suspicious patterns and potential fraud indicators in claims
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-card border-accent/20 hover:border-accent/40 transition-colors">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="flex justify-center">
                    <TrendingUp className="h-12 w-12 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Risk Assessment</h3>
                  <p className="text-muted-foreground">
                    Get comprehensive risk scores and confidence levels for each claim
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-card border-secondary/20 hover:border-secondary/40 transition-colors">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="flex justify-center">
                    <Brain className="h-12 w-12 text-secondary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">AI Analysis</h3>
                  <p className="text-muted-foreground">
                    Advanced AI analyzes document consistency and photo authenticity
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center border-t border-border pt-8">
          <p className="text-muted-foreground">
            Streamline your insurance claims processing with AI-powered fraud detection.
            Protect your business with intelligent document analysis.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
