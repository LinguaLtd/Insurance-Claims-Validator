export interface ClaimDocument {
  id: string;
  filename: string;
  file: File;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  analysisResult?: ClaimAnalysisResult;
}

export interface ClaimAnalysisResult {
  isConsistent: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  flags: ClaimFlag[];
  confidence: number;
  summary: string;
  extractedData?: {
    claimAmount?: string;
    incidentDate?: string;
    policyNumber?: string;
    description?: string;
  };
}

export interface ClaimFlag {
  type: 'inconsistency' | 'suspicious' | 'missing_info' | 'photo_mismatch' | 'amount_discrepancy';
  severity: 'low' | 'medium' | 'high';
  description: string;
  details: string;
}