import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MultipleDocumentUploaderProps {
  onFilesUpload: (files: File[]) => void;
  isProcessing: boolean;
}

export function MultipleDocumentUploader({ onFilesUpload, isProcessing }: MultipleDocumentUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesUpload(acceptedFiles);
  }, [onFilesUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: true,
    disabled: isProcessing,
  });

  return (
    <Card className={`border-2 border-dashed transition-all duration-200 ${
      isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <CardContent className="p-12">
        <div {...getRootProps()} className="text-center space-y-6">
          <input {...getInputProps()} />
          
          {isProcessing ? (
            <div className="space-y-4">
              <div className="animate-spin mx-auto h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Processing Claims...</h3>
                <p className="text-muted-foreground">
                  Analyzing documents for inconsistencies and fraud indicators
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <Upload className="h-16 w-16 text-primary mx-auto" />
                  <FileText className="h-8 w-8 text-accent absolute -bottom-2 -right-2 bg-background rounded-full p-1" />
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Upload Insurance Claim Documents
                </h3>
                <p className="text-muted-foreground mb-4">
                  Drop multiple PDF files here or click to browse
                </p>
                
                <Button 
                  variant="outline" 
                  className="hover:bg-primary hover:text-primary-foreground"
                >
                  Choose Files
                </Button>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                {/* <AlertCircle className="h-4 w-4" /> */}
                <span></span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}