const GEMINI_API_KEY = 'AIzaSyBMbxFXZtvZGritVobyu5U5XbzR4xYNOVA';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface DocumentAnalysisResult {
  extractedText: string;
  filename: string;
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
}