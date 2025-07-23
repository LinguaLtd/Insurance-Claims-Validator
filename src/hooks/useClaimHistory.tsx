import { useState, useEffect } from 'react';
import { ClaimDocument } from '@/types/insurance';

const STORAGE_KEY = 'insurance-claims-history';

export function useClaimHistory() {
  const [history, setHistory] = useState<ClaimDocument[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedHistory = JSON.parse(saved);
        // Filter out file objects that can't be serialized
        const cleanHistory = parsedHistory.map((doc: any) => ({
          ...doc,
          file: null // Remove file object as it can't be persisted
        }));
        setHistory(cleanHistory);
      }
    } catch (error) {
      console.error('Error loading claim history:', error);
    }
  }, []);

  // Save to localStorage whenever history changes
  const saveToStorage = (documents: ClaimDocument[]) => {
    try {
      // Remove file objects before saving
      const serializableHistory = documents.map(doc => ({
        ...doc,
        file: null
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableHistory));
    } catch (error) {
      console.error('Error saving claim history:', error);
    }
  };

  const addClaims = (newClaims: ClaimDocument[]) => {
    setHistory(prev => {
      const updated = [...prev, ...newClaims];
      saveToStorage(updated);
      return updated;
    });
  };

  const updateClaim = (claimId: string, updates: Partial<ClaimDocument>) => {
    setHistory(prev => {
      const updated = prev.map(doc => 
        doc.id === claimId ? { ...doc, ...updates } : doc
      );
      saveToStorage(updated);
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getClaimById = (id: string) => {
    return history.find(doc => doc.id === id);
  };

  const getClaimsByStatus = (status: ClaimDocument['status']) => {
    return history.filter(doc => doc.status === status);
  };

  const getFlaggedClaims = () => {
    return history.filter(doc => 
      doc.analysisResult && doc.analysisResult.flags.length > 0
    );
  };

  const getApprovedClaims = () => {
    return history.filter(doc => 
      doc.analysisResult && 
      doc.analysisResult.flags.length === 0 && 
      doc.analysisResult.isConsistent
    );
  };

  const getStats = () => {
    const completed = history.filter(doc => doc.status === 'completed');
    const flagged = getFlaggedClaims();
    const approved = getApprovedClaims();
    
    // Calculate average risk level
    const riskLevels = completed
      .filter(doc => doc.analysisResult)
      .map(doc => doc.analysisResult!.riskLevel);
    
    const highRisk = riskLevels.filter(r => r === 'high').length;
    const mediumRisk = riskLevels.filter(r => r === 'medium').length;
    
    let avgRisk: 'low' | 'medium' | 'high' = 'low';
    if (highRisk > completed.length * 0.3) avgRisk = 'high';
    else if (mediumRisk > completed.length * 0.5) avgRisk = 'medium';

    return {
      total: history.length,
      processed: completed.length,
      flagged: flagged.length,
      approved: approved.length,
      avgRisk
    };
  };

  return {
    history,
    addClaims,
    updateClaim,
    clearHistory,
    getClaimById,
    getClaimsByStatus,
    getFlaggedClaims,
    getApprovedClaims,
    getStats
  };
}