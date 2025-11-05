'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card } from '@/components/ui';
import { ResumeEditor } from '@/components/ResumeEditor';
import { ResumePreview } from '@/components/ResumeEditor/ResumePreview';
import { ATSScoreDisplay } from '@/components/ResumeEditor/ATSScoreDisplay';
import { emptyResume, type ResumeContent, type ATSAnalysis, RESUME_TEMPLATES } from '@/utils/types';
import { analyzeATS } from '@/utils/ats-analyzer';
import { generateResumePDF, downloadPDF } from '@/utils/pdf-generator';

export default function NewResume() {
  const [resumeData, setResumeData] = useState<ResumeContent>(emptyResume);
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<typeof RESUME_TEMPLATES[number]>('modern');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'ats'>('edit');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeATS = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeATS(resumeData, jobDescription || undefined);
      setAtsAnalysis(analysis);
      setActiveTab('ats');
    } catch (error) {
      console.error('Failed to analyze resume:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportPDF = () => {
    const pdfBlob = generateResumePDF(resumeData, selectedTemplate);
    const filename = `${resumeData.personalInfo.name || 'resume'}_${Date.now()}.pdf`;
    downloadPDF(pdfBlob, filename);
  };

  const handleSave = () => {
    // In a real app, this would save to the database via API
    localStorage.setItem('draft-resume', JSON.stringify(resumeData));
    alert('Resume saved to local storage!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">← Back</Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Create New Resume</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSave}>
                Save Draft
              </Button>
              <Button variant="outline" onClick={handleAnalyzeATS} disabled={isAnalyzing}>
                {isAnalyzing ? 'Analyzing...' : 'Analyze ATS'}
              </Button>
              <Button onClick={handleExportPDF}>
                Export PDF
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4 border-b">
            <button
              onClick={() => setActiveTab('edit')}
              className={`pb-2 px-4 font-medium ${
                activeTab === 'edit'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`pb-2 px-4 font-medium ${
                activeTab === 'preview'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab('ats')}
              className={`pb-2 px-4 font-medium ${
                activeTab === 'ats'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ATS Score {atsAnalysis && `(${atsAnalysis.score})`}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'edit' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="p-6 bg-white">
              <h2 className="text-xl font-semibold mb-4">Resume Details</h2>
              <ResumeEditor data={resumeData} onChange={setResumeData} />
            </Card>
            <div className="space-y-4">
              <Card className="p-6 bg-white">
                <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value as any)}
                    className="w-full p-2 border rounded-md"
                  >
                    {RESUME_TEMPLATES.map((template) => (
                      <option key={template} value={template}>
                        {template.charAt(0).toUpperCase() + template.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </Card>
              <div className="max-h-[800px] overflow-y-auto">
                <ResumePreview data={resumeData} template={selectedTemplate} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 bg-white mb-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Resume Preview</h2>
                <div className="flex gap-2">
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value as any)}
                    className="p-2 border rounded-md"
                  >
                    {RESUME_TEMPLATES.map((template) => (
                      <option key={template} value={template}>
                        {template.charAt(0).toUpperCase() + template.slice(1)}
                      </option>
                    ))}
                  </select>
                  <Button onClick={handleExportPDF}>Download PDF</Button>
                </div>
              </div>
            </Card>
            <ResumePreview data={resumeData} template={selectedTemplate} />
          </div>
        )}

        {activeTab === 'ats' && (
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 bg-white mb-6">
              <h2 className="text-xl font-semibold mb-4">ATS Optimization</h2>
              <p className="text-gray-600 mb-4">
                Paste a job description below to see how well your resume matches and get suggestions
                for improvement.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description (Optional)
                </label>
                <textarea
                  className="w-full min-h-[150px] p-3 border rounded-md"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here to get better keyword matching..."
                />
              </div>
              <Button onClick={handleAnalyzeATS} disabled={isAnalyzing}>
                {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
              </Button>
            </Card>

            {atsAnalysis ? (
              <ATSScoreDisplay analysis={atsAnalysis} />
            ) : (
              <Card className="p-12 bg-white text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-2">No ATS Analysis Yet</h3>
                <p className="text-gray-600 mb-4">
                  Click "Analyze Resume" above to check your resume's ATS compatibility
                </p>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
