import React, { useState } from 'react';
import { FileText, Bot, Sparkles } from 'lucide-react';
import { DocumentUploader } from '@/components/DocumentUploader';
import { ExtractedText } from '@/components/ExtractedText';
import { GeminiService, DocumentAnalysisResult } from '@/services/geminiService';
import { toast } from 'sonner';

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<DocumentAnalysisResult | null>(null);
  const geminiService = new GeminiService();

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    
    try {
      toast.info(`Processing ${file.name}...`);
      const result = await geminiService.extractTextFromDocument(file);
      setExtractedData(result);
      toast.success('Text extraction completed successfully!');
    } catch (error) {
      console.error('Error processing document:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process document');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setExtractedData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-gradient-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="relative">
              <FileText className="h-10 w-10 text-primary" />
              <Bot className="h-5 w-5 text-accent absolute -top-1 -right-1" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Docu Gemini View
              </h1>
              <p className="text-muted-foreground">
                AI-Powered Document Text Extraction
              </p>
            </div>
            <Sparkles className="h-6 w-6 text-accent animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {!extractedData ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  Extract Text from Any Document
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Upload your documents and let Google's Gemini AI extract all the text content. 
                  Perfect for PDFs, images, Word documents, and more.
                </p>
              </div>
              
              <DocumentUploader 
                onFileUpload={handleFileUpload}
                isProcessing={isProcessing}
              />

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Multiple Formats</h3>
                  <p className="text-sm text-muted-foreground">
                    Supports PDF, images, Word documents, and text files
                  </p>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                    <Bot className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground">AI-Powered</h3>
                  <p className="text-sm text-muted-foreground">
                    Uses Google's Gemini AI for accurate text extraction
                  </p>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mx-auto">
                    <Sparkles className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground">Smart Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    Preserves structure and handles complex layouts
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <ExtractedText 
              text={extractedData.extractedText}
              filename={extractedData.filename}
              onClear={handleClear}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-gradient-card mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-muted-foreground">
            <p>Powered by Google Gemini AI • Built with React & Tailwind CSS</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
