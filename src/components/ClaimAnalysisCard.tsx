import React from 'react';
import { FileText, AlertTriangle, CheckCircle, Clock, XCircle, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ClaimDocument } from '@/types/insurance';

interface ClaimAnalysisCardProps {
  document: ClaimDocument;
  onClick?: () => void;
}

export function ClaimAnalysisCard({ document, onClick }: ClaimAnalysisCardProps) {
  const getStatusIcon = () => {
    switch (document.status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'analyzing':
        return <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />;
      case 'completed':
        return document.analysisResult?.isConsistent 
          ? <CheckCircle className="h-5 w-5 text-green-500" />
          : <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  const getFlagSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-yellow-600';
      case 'medium': return 'text-orange-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card 
      className="bg-gradient-card cursor-pointer hover:shadow-lg transition-all duration-200" 
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-lg">
            {getStatusIcon()}
            <span className="truncate">{document.filename}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {document.analysisResult && (
              <>
                <Badge variant={getRiskBadgeVariant(document.analysisResult.riskLevel)}>
                  {document.analysisResult.riskLevel.toUpperCase()} RISK
                </Badge>
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground">
                    {document.analysisResult.confidence}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {document.status === 'analyzing' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Analyzing claim...</span>
              <span>Processing</span>
            </div>
            <Progress value={65} className="h-2" />
          </div>
        )}

        {document.status === 'error' && (
          <Alert className="border-red-200">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to analyze document. Please try uploading again.
            </AlertDescription>
          </Alert>
        )}

        {document.analysisResult && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Analysis Summary</h4>
              <p className="text-sm text-muted-foreground">{document.analysisResult.summary}</p>
            </div>

            {document.analysisResult.extractedData && (
              <div>
                <h4 className="font-medium mb-2">Extracted Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {document.analysisResult.extractedData.claimAmount && (
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="ml-2 font-medium">{document.analysisResult.extractedData.claimAmount}</span>
                    </div>
                  )}
                  {document.analysisResult.extractedData.incidentDate && (
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <span className="ml-2 font-medium">{document.analysisResult.extractedData.incidentDate}</span>
                    </div>
                  )}
                  {document.analysisResult.extractedData.policyNumber && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Policy:</span>
                      <span className="ml-2 font-medium">{document.analysisResult.extractedData.policyNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {document.analysisResult.flags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1 text-orange-500" />
                  Flags ({document.analysisResult.flags.length})
                </h4>
                <div className="space-y-2">
                  {document.analysisResult.flags.map((flag, index) => (
                    <Alert key={index} className="border-orange-200">
                      <AlertTriangle className={`h-4 w-4 ${getFlagSeverityColor(flag.severity)}`} />
                      <AlertDescription>
                        <div className="flex justify-between items-start">
                          <div>
                            <strong className="capitalize">{flag.type.replace('_', ' ')}:</strong>
                            <span className="ml-1">{flag.description}</span>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {flag.severity}
                          </Badge>
                        </div>
                        {flag.details && (
                          <p className="text-sm text-muted-foreground mt-1">{flag.details}</p>
                        )}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}