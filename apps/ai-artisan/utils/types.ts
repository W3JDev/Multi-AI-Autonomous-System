// Core types for AI-Artisan Resume Builder

export interface ResumeContent {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location?: string;
    linkedin?: string;
    website?: string;
    summary?: string;
  };
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  certifications?: Certification[];
  projects?: Project[];
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  startDate?: string;
  endDate?: string;
}

export interface ATSAnalysis {
  score: number;
  keywords: string[];
  missing: string[];
  suggestions: string[];
  keywordDensity: Record<string, number>;
  formatIssues: string[];
}

export interface CoverLetterData {
  jobTitle: string;
  company: string;
  jobDescription?: string;
  tone: 'professional' | 'casual' | 'enthusiastic';
  content?: string;
}

export interface JobMatch {
  title: string;
  company: string;
  location?: string;
  description: string;
  matchScore: number;
  matchReasons: string[];
  missingSkills: string[];
  url?: string;
}

export const RESUME_TEMPLATES = [
  'modern',
  'classic',
  'minimal',
  'creative',
  'professional',
] as const;

export type ResumeTemplate = (typeof RESUME_TEMPLATES)[number];

export const emptyResume: ResumeContent = {
  personalInfo: {
    name: '',
    email: '',
    phone: '',
  },
  experience: [],
  education: [],
  skills: [],
};
