const GEMINI_API_KEY = 'AIzaSyBMbxFXZtvZGritVobyu5U5XbzR4xYNOVA';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface DocumentAnalysisResult {
  extractedText: string;
  filename: string;
}

export interface TextAnalysisResult {
  isCoherent: boolean;
  discrepancies: string[];
  overallAssessment: string;
  confidence: number;
}

export class GeminiService {
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private getMimeType(file: File): string {
    // Handle specific cases for Gemini API
    if (file.type === 'application/pdf') return 'application/pdf';
    if (file.type.startsWith('image/')) return file.type;
    if (file.type === 'text/plain') return 'text/plain';
    if (file.name.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (file.name.endsWith('.doc')) return 'application/msword';
    
    return file.type || 'application/octet-stream';
  }

  async extractTextFromDocument(file: File): Promise<DocumentAnalysisResult> {
    try {
      const base64Data = await this.fileToBase64(file);
      const mimeType = this.getMimeType(file);

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `Please extract all text content from this document. Return only the extracted text without any additional formatting, explanations, or metadata. If the document contains tables, preserve their structure using plain text formatting. If there are multiple columns, present them in a logical reading order.`
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 8192,
        }
      };

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('No text content found in the API response');
      }

      const extractedText = data.candidates[0].content.parts[0].text;
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text could be extracted from this document');
      }

      return {
        extractedText: extractedText.trim(),
        filename: file.name
      };

    } catch (error) {
      console.error('Error extracting text:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Failed to extract text from document. Please try again.');
    }
  }

  async analyzeInsuranceClaim(file: File): Promise<import('@/types/insurance').ClaimAnalysisResult> {
    try {
      const base64Data = await this.fileToBase64(file);
      const mimeType = this.getMimeType(file);

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `Analyze this insurance claim document for fraud indicators and inconsistencies. Look for:
1. Inconsistent information (dates, amounts, descriptions)
2. Suspicious patterns in damage descriptions vs photos
3. Unrealistic claim amounts or circumstances
4. Missing critical information
5. Photo authenticity and consistency with description
6. Timeline inconsistencies

Extract key information and provide a detailed analysis.

Respond with a JSON object in this exact format:
{
  "isConsistent": boolean,
  "riskLevel": "low" | "medium" | "high",
  "flags": [
    {
      "type": "inconsistency" | "suspicious" | "missing_info" | "photo_mismatch" | "amount_discrepancy",
      "severity": "low" | "medium" | "high", 
      "description": "brief description",
      "details": "detailed explanation"
    }
  ],
  "confidence": number (0-100),
  "summary": "overall assessment summary",
  "extractedData": {
    "claimAmount": "amount if found",
    "incidentDate": "date if found", 
    "policyNumber": "policy number if found",
    "description": "incident description if found"
  }
}`
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        }
      };

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('No analysis content found in the API response');
      }

      const analysisText = data.candidates[0].content.parts[0].text;
      
      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        
        // Fallback response
        return {
          isConsistent: true,
          riskLevel: 'low',
          flags: [],
          confidence: 50,
          summary: 'Analysis completed but could not parse structured results.',
          extractedData: {}
        };
      } catch (parseError) {
        throw new Error('Failed to parse analysis results');
      }

    } catch (error) {
      console.error('Error analyzing insurance claim:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Failed to analyze insurance claim. Please try again.');
    }
  }

  async analyzeTextCoherence(text: string): Promise<TextAnalysisResult> {
    try {
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `Analyze the following extracted text for coherence, logical flow, and potential discrepancies. Look for:
1. Inconsistent information or contradictions
2. Missing context or incomplete sentences
3. Formatting errors that affect readability
4. Logical flow issues
5. Data integrity problems

Provide a JSON response with the following structure:
{
  "isCoherent": boolean,
  "discrepancies": ["list of specific issues found"],
  "overallAssessment": "detailed assessment summary",
  "confidence": number (0-100)
}

Text to analyze:
${text}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        }
      };

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('No analysis content found in the API response');
      }

      const analysisText = data.candidates[0].content.parts[0].text;
      
      try {
        // Try to extract JSON from the response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        
        // Fallback: create a basic response if JSON parsing fails
        return {
          isCoherent: !analysisText.toLowerCase().includes('issue') && !analysisText.toLowerCase().includes('problem'),
          discrepancies: analysisText.toLowerCase().includes('issue') || analysisText.toLowerCase().includes('problem') 
            ? ['Text analysis found potential issues - see detailed assessment'] 
            : [],
          overallAssessment: analysisText,
          confidence: 75
        };
      } catch (parseError) {
        throw new Error('Failed to parse analysis results');
      }

    } catch (error) {
      console.error('Error analyzing text:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Failed to analyze text. Please try again.');
    }
  }
}