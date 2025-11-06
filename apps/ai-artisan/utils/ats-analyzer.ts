import type { ResumeContent, ATSAnalysis } from './types';

/**
 * Analyzes a resume for ATS (Applicant Tracking System) compatibility
 * Returns a score out of 100 and actionable suggestions
 */
export async function analyzeATS(
  resume: ResumeContent,
  jobDescription?: string
): Promise<ATSAnalysis> {
  // Common ATS-friendly keywords and skills
  const technicalKeywords = extractKeywords(resume);
  const jobKeywords = jobDescription ? extractKeywordsFromText(jobDescription) : [];
  
  // Calculate keyword match
  const matchedKeywords = technicalKeywords.filter(k => 
    jobKeywords.some(jk => jk.toLowerCase().includes(k.toLowerCase()))
  );
  
  const missingKeywords = jobKeywords.filter(k =>
    !technicalKeywords.some(tk => tk.toLowerCase().includes(k.toLowerCase()))
  );

  // Calculate base score
  let score = 60; // Base score
  
  // Check for required sections
  if (resume.personalInfo.email) score += 5;
  if (resume.personalInfo.phone) score += 5;
  if (resume.experience.length > 0) score += 10;
  if (resume.education.length > 0) score += 10;
  if (resume.skills.length > 0) score += 10;
  
  // Keyword matching bonus
  if (jobDescription && jobKeywords.length > 0) {
    const matchRate = matchedKeywords.length / jobKeywords.length;
    score = Math.min(100, score - 40 + (matchRate * 40));
  }

  // Format issues detection
  const formatIssues: string[] = [];
  if (!resume.personalInfo.name) formatIssues.push('Missing name');
  if (!resume.personalInfo.email) formatIssues.push('Missing email');
  if (resume.experience.length === 0) formatIssues.push('No work experience listed');
  
  // Generate suggestions
  const suggestions: string[] = [];
  if (resume.skills.length < 5) {
    suggestions.push('Add more skills to improve visibility');
  }
  if (resume.experience.length > 0 && resume.experience[0].description.length < 2) {
    suggestions.push('Add more bullet points to describe your achievements');
  }
  if (!resume.personalInfo.summary) {
    suggestions.push('Add a professional summary to introduce yourself');
  }
  if (missingKeywords.length > 0) {
    suggestions.push(`Consider adding these keywords: ${missingKeywords.slice(0, 5).join(', ')}`);
  }

  // Calculate keyword density
  const keywordDensity: Record<string, number> = {};
  technicalKeywords.forEach(keyword => {
    const count = countKeywordOccurrences(resume, keyword);
    keywordDensity[keyword] = count;
  });

  return {
    score: Math.round(score),
    keywords: technicalKeywords,
    missing: missingKeywords.slice(0, 10),
    suggestions,
    keywordDensity,
    formatIssues,
  };
}

function extractKeywords(resume: ResumeContent): string[] {
  const keywords = new Set<string>();
  
  // Extract from skills
  resume.skills.forEach(skill => keywords.add(skill));
  
  // Extract from experience descriptions
  resume.experience.forEach(exp => {
    exp.description.forEach(desc => {
      // Simple keyword extraction (in production, use NLP)
      const words = desc.split(/\s+/);
      words.forEach(word => {
        // Allow letters, numbers, hyphens, and dots for technical terms (e.g., React-18, Node.js)
        if (word.length > 3 && /^[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?$/.test(word)) {
          keywords.add(word);
        }
      });
    });
  });
  
  // Extract from certifications
  resume.certifications?.forEach(cert => {
    keywords.add(cert.name);
  });

  return Array.from(keywords);
}

function extractKeywordsFromText(text: string): string[] {
  // Simple extraction - in production, use NLP for better results
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
  const words = text.split(/\s+/);
  const keywords = new Set<string>();
  
  words.forEach(word => {
    // Allow letters, numbers, hyphens, and dots for technical terms (e.g., react-18, node.js, c++)
    const cleaned = word.toLowerCase().replace(/[^a-z0-9.-]/g, '');
    if (cleaned.length > 3 && /^[a-z0-9.-]+$/.test(cleaned) && !commonWords.has(cleaned)) {
      keywords.add(cleaned);
    }
  });
  
  return Array.from(keywords);
}

function countKeywordOccurrences(resume: ResumeContent, keyword: string): number {
  let count = 0;
  const lowerKeyword = keyword.toLowerCase();
  
  // Count in skills
  if (resume.skills.some(s => s.toLowerCase().includes(lowerKeyword))) count++;
  
  // Count in experience
  resume.experience.forEach(exp => {
    exp.description.forEach(desc => {
      const matches = desc.toLowerCase().match(new RegExp(lowerKeyword, 'g'));
      count += matches ? matches.length : 0;
    });
  });
  
  return count;
}

/**
 * Optimizes resume content based on job description using AI
 */
export async function optimizeResumeForJob(
  resume: ResumeContent,
  jobDescription: string,
  aiChat: (prompt: string) => Promise<string>
): Promise<ResumeContent> {
  const prompt = `
    Optimize this resume for the following job description.
    Suggest improved bullet points that highlight relevant experience and use keywords from the job description.
    Keep the same structure but enhance the content.
    
    Job Description:
    ${jobDescription}
    
    Current Resume:
    ${JSON.stringify(resume, null, 2)}
    
    Return ONLY valid JSON with the optimized resume in the same structure.
  `;
  
  const response = await aiChat(prompt);
  
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : response;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return resume; // Return original on error
  }
}
