import React from 'react';
import { Copy, Download, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface ExtractedTextProps {
  text: string;
  filename: string;
  onClear: () => void;
}

export function ExtractedText({ text, filename, onClear }: ExtractedTextProps) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Text copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy text');
    }
  };

  const downloadText = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_extracted.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Text file downloaded');
  };

  const wordCount = text.trim().split(/\s+/).length;
  const charCount = text.length;
  const lineCount = text.split('\n').length;

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card className="border-primary bg-gradient-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  Text Extraction Complete
                </h3>
                <p className="text-muted-foreground">
                  Successfully extracted text from {filename}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={onClear}
              className="hover:bg-destructive hover:text-destructive-foreground"
            >
              New Document
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{wordCount}</div>
            <div className="text-sm text-muted-foreground">Words</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">{charCount}</div>
            <div className="text-sm text-muted-foreground">Characters</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary-foreground">{lineCount}</div>
            <div className="text-sm text-muted-foreground">Lines</div>
          </CardContent>
        </Card>
      </div>

      {/* Extracted Text */}
      <Card className="bg-gradient-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Extracted Text</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="hover:bg-primary hover:text-primary-foreground"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadText}
                className="hover:bg-accent hover:text-accent-foreground"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <Separator className="bg-border" />
        <CardContent className="p-0">
          <ScrollArea className="h-96 p-6">
            <pre className="whitespace-pre-wrap font-mono text-sm text-foreground leading-relaxed">
              {text}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}