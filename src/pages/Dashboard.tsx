import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Shield, TrendingUp, AlertTriangle, CheckCircle, ArrowLeft, FileText, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClaimAnalysisCard } from '@/components/ClaimAnalysisCard';
import { ClaimDetailModal } from '@/components/ClaimDetailModal';
import { useClaimHistory } from '@/hooks/useClaimHistory';
import { GeminiService } from '@/services/geminiService';
import { ClaimDocument } from '@/types/insurance';
import { toast } from 'sonner';

export default function Dashboard() {
  const location = useLocation();
  const [documents, setDocuments] = useState<ClaimDocument[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<ClaimDocument | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    history,
    addClaims,
    updateClaim,
    clearHistory,
    getFlaggedClaims,
    getApprovedClaims,
    getStats
  } = useClaimHistory();

  const geminiService = new GeminiService();
  const stats = getStats();

  useEffect(() => {
    if (location.state?.files) {
      const files = location.state.files as File[];
      const initialDocuments: ClaimDocument[] = files.map((file, index) => ({
        id: `doc-${Date.now()}-${index}`,
        filename: file.name,
        file,
        status: 'pending'
      }));
      
      setDocuments(initialDocuments);
      addClaims(initialDocuments);
      processDocuments(initialDocuments);
    } else {
      // Load from history on page refresh
      setDocuments(history);
    }
  }, [location.state]);

  // Also load from history when component mounts
  useEffect(() => {
    if (!location.state?.files && history.length > 0) {
      setDocuments(history);
    }
  }, [history]);

  const processDocuments = async (docs: ClaimDocument[]) => {
    for (const doc of docs) {
      updateClaim(doc.id, { status: 'analyzing' });
      setDocuments(prev => prev.map(d => 
        d.id === doc.id ? { ...d, status: 'analyzing' } : d
      ));

      try {
        const result = await geminiService.analyzeInsuranceClaim(doc.file);
        
        const updatedDoc = { 
          ...doc, 
          status: 'completed' as const,
          analysisResult: result
        };
        
        updateClaim(doc.id, updatedDoc);
        setDocuments(prev => prev.map(d => 
          d.id === doc.id ? updatedDoc : d
        ));

      } catch (error) {
        console.error('Analysis error:', error);
        const errorDoc = { ...doc, status: 'error' as const };
        updateClaim(doc.id, errorDoc);
        setDocuments(prev => prev.map(d => 
          d.id === doc.id ? errorDoc : d
        ));
        toast.error(`Failed to analyze ${doc.filename}`);
      }
    }
  };

  const handleClaimClick = (document: ClaimDocument) => {
    setSelectedClaim(document);
    setIsModalOpen(true);
  };

  const handleClearHistory = () => {
    clearHistory();
    setDocuments([]);
    toast.success('History cleared successfully');
  };

  const flaggedDocuments = [...getFlaggedClaims(), ...documents.filter(d => 
    d.analysisResult && d.analysisResult.flags.length > 0
  )].filter((doc, index, self) => self.findIndex(d => d.id === doc.id) === index);

  const approvedDocuments = [...getApprovedClaims(), ...documents.filter(d => 
    d.analysisResult && d.analysisResult.flags.length === 0 && d.analysisResult.isConsistent
  )].filter((doc, index, self) => self.findIndex(d => d.id === doc.id) === index);

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
              <h1 className="text-3xl font-bold text-foreground">DeepTrack Foundry Dashboard</h1>
              <p className="text-muted-foreground">Automated fraud detection and consistency analysis</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {history.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearHistory}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            )}
            <Badge variant="outline" className="px-3 py-1">
              <Shield className="h-4 w-4 mr-1" />
              DeepTrack Foundry
            </Badge>
          </div>
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
                <ClaimAnalysisCard key={doc.id} document={doc} onClick={() => handleClaimClick(doc)} />
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
                <ClaimAnalysisCard key={doc.id} document={doc} onClick={() => handleClaimClick(doc)} />
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

        {/* Claim Detail Modal */}
        {selectedClaim && (
          <ClaimDetailModal
            document={selectedClaim}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedClaim(null);
            }}
          />
        )}
      </div>
    </div>
  );
}