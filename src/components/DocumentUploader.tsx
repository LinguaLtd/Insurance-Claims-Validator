import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DocumentUploaderProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

export function DocumentUploader({ onFileUpload, isProcessing }: DocumentUploaderProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false,
    disabled: isProcessing
  });

  return (
    <Card className={cn(
      "border-2 border-dashed transition-all duration-300 cursor-pointer",
      "hover:border-primary hover:shadow-glow-primary",
      isDragActive ? "border-primary shadow-glow-primary bg-primary/5" : "border-border",
      isProcessing && "opacity-50 cursor-not-allowed"
    )}>
      <div
        {...getRootProps()}
        className="p-12 text-center space-y-6"
      >
        <input {...getInputProps()} />
        
        <div className="flex justify-center">
          {isProcessing ? (
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          ) : (
            <div className="relative">
              <Upload className="h-16 w-16 text-muted-foreground" />
              <FileText className="h-8 w-8 text-primary absolute -bottom-2 -right-2" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">
            {isProcessing ? "Processing Document..." : "Upload Your Document"}
          </h3>
          <p className="text-muted-foreground">
            {isProcessing 
              ? "Extracting text with Gemini AI..." 
              : "Drag and drop your file here, or click to browse"
            }
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
          <span className="px-2 py-1 bg-secondary rounded">PDF</span>
          <span className="px-2 py-1 bg-secondary rounded">Images</span>
          <span className="px-2 py-1 bg-secondary rounded">Word</span>
          <span className="px-2 py-1 bg-secondary rounded">Text</span>
        </div>

        {!isProcessing && (
          <Button 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Choose File
          </Button>
        )}
      </div>
    </Card>
  );
}