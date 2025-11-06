import { jsPDF } from 'jspdf';
import type { ResumeContent, ResumeTemplate } from './types';

/**
 * Generates a PDF from resume content using the specified template
 */
export function generateResumePDF(
  resume: ResumeContent,
  template: ResumeTemplate = 'modern'
): Blob {
  const doc = new jsPDF();
  
  switch (template) {
    case 'modern':
      return generateModernTemplate(doc, resume);
    case 'classic':
      return generateClassicTemplate(doc, resume);
    case 'minimal':
      return generateMinimalTemplate(doc, resume);
    case 'creative':
      return generateCreativeTemplate(doc, resume);
    case 'professional':
      return generateProfessionalTemplate(doc, resume);
    default:
      return generateModernTemplate(doc, resume);
  }
}

function generateModernTemplate(doc: jsPDF, resume: ResumeContent): Blob {
  let yPosition = 20;
  const leftMargin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header - Name and Contact
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(resume.personalInfo.name, leftMargin, yPosition);
  yPosition += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const contactInfo = [
    resume.personalInfo.email,
    resume.personalInfo.phone,
    resume.personalInfo.location,
  ].filter(Boolean).join(' | ');
  doc.text(contactInfo, leftMargin, yPosition);
  yPosition += 5;
  
  if (resume.personalInfo.linkedin || resume.personalInfo.website) {
    const links = [
      resume.personalInfo.linkedin,
      resume.personalInfo.website,
    ].filter(Boolean).join(' | ');
    doc.text(links, leftMargin, yPosition);
    yPosition += 10;
  } else {
    yPosition += 5;
  }
  
  // Professional Summary
  if (resume.personalInfo.summary) {
    yPosition = addSection(doc, 'PROFESSIONAL SUMMARY', yPosition, leftMargin);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(resume.personalInfo.summary, pageWidth - 40);
    doc.text(summaryLines, leftMargin, yPosition);
    yPosition += (summaryLines.length * 5) + 10;
  }
  
  // Experience
  if (resume.experience.length > 0) {
    yPosition = checkPageBreak(doc, yPosition, 40);
    yPosition = addSection(doc, 'WORK EXPERIENCE', yPosition, leftMargin);
    
    resume.experience.forEach((exp, index) => {
      yPosition = checkPageBreak(doc, yPosition, 30);
      
      // Company and position
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(exp.position, leftMargin, yPosition);
      yPosition += 5;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      const expDetails = `${exp.company}${exp.location ? `, ${exp.location}` : ''}`;
      doc.text(expDetails, leftMargin, yPosition);
      
      const dateRange = `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || ''}`;
      doc.text(dateRange, pageWidth - 20, yPosition, { align: 'right' });
      yPosition += 7;
      
      // Description bullets
      doc.setFont('helvetica', 'normal');
      exp.description.forEach(bullet => {
        yPosition = checkPageBreak(doc, yPosition, 15);
        const bulletLines = doc.splitTextToSize(`• ${bullet}`, pageWidth - 45);
        doc.text(bulletLines, leftMargin + 3, yPosition);
        yPosition += (bulletLines.length * 5);
      });
      
      yPosition += 5;
    });
  }
  
  // Education
  if (resume.education.length > 0) {
    yPosition = checkPageBreak(doc, yPosition, 40);
    yPosition = addSection(doc, 'EDUCATION', yPosition, leftMargin);
    
    resume.education.forEach(edu => {
      yPosition = checkPageBreak(doc, yPosition, 20);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(edu.degree, leftMargin, yPosition);
      yPosition += 5;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      const eduDetails = `${edu.school}${edu.location ? `, ${edu.location}` : ''}`;
      doc.text(eduDetails, leftMargin, yPosition);
      
      const eduDateRange = `${edu.startDate} - ${edu.endDate || ''}`;
      doc.text(eduDateRange, pageWidth - 20, yPosition, { align: 'right' });
      yPosition += 10;
    });
  }
  
  // Skills
  if (resume.skills.length > 0) {
    yPosition = checkPageBreak(doc, yPosition, 30);
    yPosition = addSection(doc, 'SKILLS', yPosition, leftMargin);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const skillsText = resume.skills.join(' • ');
    const skillsLines = doc.splitTextToSize(skillsText, pageWidth - 40);
    doc.text(skillsLines, leftMargin, yPosition);
    yPosition += (skillsLines.length * 5) + 10;
  }
  
  // Certifications
  if (resume.certifications && resume.certifications.length > 0) {
    yPosition = checkPageBreak(doc, yPosition, 30);
    yPosition = addSection(doc, 'CERTIFICATIONS', yPosition, leftMargin);
    
    resume.certifications.forEach(cert => {
      yPosition = checkPageBreak(doc, yPosition, 15);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(cert.name, leftMargin, yPosition);
      yPosition += 5;
      
      doc.setFont('helvetica', 'normal');
      const certDetails = `${cert.issuer} - ${cert.date}`;
      doc.text(certDetails, leftMargin, yPosition);
      yPosition += 8;
    });
  }
  
  return doc.output('blob');
}

// NOTE: Template variations below are placeholders for future implementation
// Currently all use the modern template structure with planned variations:
// - Classic: Traditional serif fonts, conservative layout
// - Minimal: Clean lines, lots of whitespace
// - Creative: Bold typography, accent colors
// - Professional: Corporate-friendly, structured sections

function generateClassicTemplate(doc: jsPDF, resume: ResumeContent): Blob {
  // TODO: Implement classic template with serif fonts and traditional layout
  return generateModernTemplate(doc, resume);
}

function generateMinimalTemplate(doc: jsPDF, resume: ResumeContent): Blob {
  // TODO: Implement minimal template with clean lines and whitespace
  return generateModernTemplate(doc, resume);
}

function generateCreativeTemplate(doc: jsPDF, resume: ResumeContent): Blob {
  // TODO: Implement creative template with bold design elements
  return generateModernTemplate(doc, resume);
}

function generateProfessionalTemplate(doc: jsPDF, resume: ResumeContent): Blob {
  // TODO: Implement professional template for corporate settings
  return generateModernTemplate(doc, resume);
}

function addSection(doc: jsPDF, title: string, yPosition: number, leftMargin: number): number {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, leftMargin, yPosition);
  doc.setLineWidth(0.5);
  doc.line(leftMargin, yPosition + 2, doc.internal.pageSize.getWidth() - 20, yPosition + 2);
  return yPosition + 10;
}

function checkPageBreak(doc: jsPDF, yPosition: number, requiredSpace: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (yPosition + requiredSpace > pageHeight - 20) {
    doc.addPage();
    return 20;
  }
  return yPosition;
}

/**
 * Downloads the PDF file
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
