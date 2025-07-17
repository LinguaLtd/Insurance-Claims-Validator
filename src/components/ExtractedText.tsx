import React, { useState, useMemo } from 'react';
import { Copy, Download, FileText, CheckCircle, Search, X, Brain, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { GeminiService, TextAnalysisResult } from '@/services/geminiService';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ExtractedTextProps {
  text: string;
  filename: string;
  onClear: () => void;
}

export function ExtractedText({ text, filename, onClear }: ExtractedTextProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [analysisResult, setAnalysisResult] = useState<TextAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const geminiService = new GeminiService();

  const highlightedText = useMemo(() => {
    if (!searchQuery.trim()) return text;
    
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.replace(regex, '<mark class="bg-primary/20 text-primary font-medium rounded px-1">$1</mark>');
  }, [text, searchQuery]);

  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return (text.match(regex) || []).length;
  }, [text, searchQuery]);

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

  const analyzeText = async () => {
    setIsAnalyzing(true);
    try {
      const result = await geminiService.analyzeTextCoherence(text);
      setAnalysisResult(result);
      toast.success('Text analysis completed');
    } catch (error) {
      toast.error('Failed to analyze text');
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
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
              {searchMatches > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({searchMatches} matches)
                </span>
              )}
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={analyzeText}
                disabled={isAnalyzing}
                className="hover:bg-purple-500 hover:text-white"
              >
                <Brain className="h-4 w-4 mr-2" />
                {isAnalyzing ? 'Analyzing...' : 'Analyze with Gemini'}
              </Button>
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
          
          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search in extracted text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-background/50 border-border/50 focus:border-primary"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-background/80"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <Separator className="bg-border" />
        <CardContent className="p-0">
          <ScrollArea className="h-96 p-6">
            <pre 
              className="whitespace-pre-wrap font-mono text-sm text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightedText }}
            />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <span>Gemini Analysis Results</span>
              <span className={`text-sm font-normal px-2 py-1 rounded-full ${
                analysisResult.isCoherent 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {analysisResult.isCoherent ? 'Coherent' : 'Issues Found'}
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                Confidence: {analysisResult.confidence}%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Overall Assessment:</h4>
              <p className="text-muted-foreground">{analysisResult.overallAssessment}</p>
            </div>
            
            {analysisResult.discrepancies.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1 text-orange-500" />
                  Issues Found:
                </h4>
                <div className="space-y-2">
                  {analysisResult.discrepancies.map((issue, index) => (
                    <Alert key={index} className="border-orange-200">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{issue}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}