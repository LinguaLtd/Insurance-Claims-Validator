import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Shield, TrendingUp, AlertTriangle, CheckCircle, ArrowLeft, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClaimAnalysisCard } from '@/components/ClaimAnalysisCard';
import { GeminiService } from '@/services/geminiService';
import { ClaimDocument } from '@/types/insurance';
import { toast } from 'sonner';

export default function Dashboard() {
  const location = useLocation();
  const [documents, setDocuments] = useState<ClaimDocument[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    flagged: 0,
    processed: 0,
    avgRisk: 'low' as 'low' | 'medium' | 'high'
  });

  const geminiService = new GeminiService();

  useEffect(() => {
    if (location.state?.files) {
      const files = location.state.files as File[];
      const initialDocuments: ClaimDocument[] = files.map((file, index) => ({
        id: `doc-${index}`,
        filename: file.name,
        file,
        status: 'pending'
      }));
      
      setDocuments(initialDocuments);
      processDocuments(initialDocuments);
    }
  }, [location.state]);

  const processDocuments = async (docs: ClaimDocument[]) => {
    setStats(prev => ({ ...prev, total: docs.length }));

    for (const doc of docs) {
      setDocuments(prev => prev.map(d => 
        d.id === doc.id ? { ...d, status: 'analyzing' } : d
      ));

      try {
        const result = await geminiService.analyzeInsuranceClaim(doc.file);
        
        setDocuments(prev => prev.map(d => 
          d.id === doc.id 
            ? { 
                ...d, 
                status: 'completed',
                analysisResult: result
              } 
            : d
        ));

        setStats(prev => ({
          ...prev,
          processed: prev.processed + 1,
          flagged: prev.flagged + (result.flags.length > 0 ? 1 : 0)
        }));

      } catch (error) {
        console.error('Analysis error:', error);
        setDocuments(prev => prev.map(d => 
          d.id === doc.id ? { ...d, status: 'error' } : d
        ));
        toast.error(`Failed to analyze ${doc.filename}`);
      }
    }

    // Calculate average risk level
    setTimeout(() => {
      setDocuments(prev => {
        const completedDocs = prev.filter(d => d.analysisResult);
        const riskLevels = completedDocs.map(d => d.analysisResult!.riskLevel);
        const highRisk = riskLevels.filter(r => r === 'high').length;
        const mediumRisk = riskLevels.filter(r => r === 'medium').length;
        
        let avgRisk: 'low' | 'medium' | 'high' = 'low';
        if (highRisk > completedDocs.length * 0.3) avgRisk = 'high';
        else if (mediumRisk > completedDocs.length * 0.5) avgRisk = 'medium';
        
        setStats(s => ({ ...s, avgRisk }));
        return prev;
      });
    }, 1000);
  };

  const flaggedDocuments = documents.filter(d => 
    d.analysisResult && d.analysisResult.flags.length > 0
  );

  const approvedDocuments = documents.filter(d => 
    d.analysisResult && d.analysisResult.flags.length === 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Upload
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Claims Analysis Dashboard</h1>
              <p className="text-muted-foreground">Automated fraud detection and consistency analysis</p>
            </div>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <Shield className="h-4 w-4 mr-1" />
            DeepExtract AI
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Claims</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{stats.processed}</div>
              <div className="text-sm text-muted-foreground">Processed</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{stats.flagged}</div>
              <div className="text-sm text-muted-foreground">Flagged</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground capitalize">{stats.avgRisk}</div>
              <div className="text-sm text-muted-foreground">Avg Risk</div>
            </CardContent>
          </Card>
        </div>

        {/* Flagged Claims Section */}
        {flaggedDocuments.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
              Flagged Claims ({flaggedDocuments.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {flaggedDocuments.map(doc => (
                <ClaimAnalysisCard key={doc.id} document={doc} />
              ))}
            </div>
          </div>
        )}

        {/* Approved Claims Section */}
        {approvedDocuments.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
              <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              Approved Claims ({approvedDocuments.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {approvedDocuments.map(doc => (
                <ClaimAnalysisCard key={doc.id} document={doc} />
              ))}
            </div>
          </div>
        )}

        {/* All Documents */}
        {documents.filter(d => d.status === 'pending' || d.status === 'analyzing' || d.status === 'error').length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Processing Queue</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {documents
                .filter(d => d.status === 'pending' || d.status === 'analyzing' || d.status === 'error')
                .map(doc => (
                  <ClaimAnalysisCard key={doc.id} document={doc} />
                ))}
            </div>
          </div>
        )}

        {documents.length === 0 && (
          <Card className="text-center p-12">
            <CardContent>
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No documents uploaded</h3>
              <p className="text-muted-foreground mb-4">
                Upload insurance claim documents to start the analysis
              </p>
              <Link to="/">
                <Button>Upload Documents</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}