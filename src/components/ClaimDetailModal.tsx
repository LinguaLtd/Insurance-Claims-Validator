import React from 'react';
import { X, Calendar, DollarSign, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ClaimDocument } from '@/types/insurance';

interface ClaimDetailModalProps {
  document: ClaimDocument;
  isOpen: boolean;
  onClose: () => void;
}

export function ClaimDetailModal({ document, isOpen, onClose }: ClaimDetailModalProps) {
  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  const getFlagIcon = (type: string) => {
    switch (type) {
      case 'inconsistency':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'suspicious':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'missing_info':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'photo_mismatch':
        return <FileText className="h-4 w-4 text-purple-500" />;
      case 'amount_discrepancy':
        return <DollarSign className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return document.analysisResult?.isConsistent ? 'text-green-600' : 'text-red-600';
      case 'analyzing':
        return 'text-blue-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">{document.filename}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Claim Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className={`font-medium capitalize ${getStatusColor(document.status)}`}>
                  {document.status}
                </p>
              </div>
              {document.analysisResult && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Risk Level</p>
                    <Badge variant={getRiskBadgeVariant(document.analysisResult.riskLevel)}>
                      {document.analysisResult.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Confidence</p>
                    <p className="font-medium">{document.analysisResult.confidence}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Consistency</p>
                    <div className="flex items-center space-x-1">
                      {document.analysisResult.isConsistent ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">
                        {document.analysisResult.isConsistent ? 'Consistent' : 'Inconsistent'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Analysis Summary */}
          {document.analysisResult && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {document.analysisResult.summary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Extracted Information */}
          {document.analysisResult?.extractedData && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Extracted Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {document.analysisResult.extractedData.claimAmount && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Claim Amount</p>
                      <p className="font-medium">{document.analysisResult.extractedData.claimAmount}</p>
                    </div>
                  </div>
                )}
                {document.analysisResult.extractedData.incidentDate && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Incident Date</p>
                      <p className="font-medium">{document.analysisResult.extractedData.incidentDate}</p>
                    </div>
                  </div>
                )}
                {document.analysisResult.extractedData.policyNumber && (
                  <div className="flex items-center space-x-2 md:col-span-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Policy Number</p>
                      <p className="font-medium">{document.analysisResult.extractedData.policyNumber}</p>
                    </div>
                  </div>
                )}
                {document.analysisResult.extractedData.description && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{document.analysisResult.extractedData.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Flags and Issues */}
          {document.analysisResult && document.analysisResult.flags.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                  Issues Detected ({document.analysisResult.flags.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {document.analysisResult.flags.map((flag, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getFlagIcon(flag.type)}
                        <h4 className="font-medium capitalize">
                          {flag.type.replace('_', ' ')}
                        </h4>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {flag.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{flag.description}</p>
                    {flag.details && (
                      <>
                        <Separator className="my-2" />
                        <p className="text-xs text-muted-foreground">{flag.details}</p>
                      </>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Processing Status */}
          {document.status === 'analyzing' && (
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-pulse" />
                <p className="text-lg font-medium">Analysis in Progress</p>
                <p className="text-sm text-muted-foreground">
                  Please wait while we analyze the claim document...
                </p>
              </CardContent>
            </Card>
          )}

          {document.status === 'error' && (
            <Card className="border-red-200">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-lg font-medium text-red-600">Analysis Failed</p>
                <p className="text-sm text-muted-foreground">
                  There was an error processing this document. Please try uploading again.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}