'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';

export default function GenerateCoverLetter() {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState<'professional' | 'casual' | 'enthusiastic'>('professional');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI generation (in production, call the AI API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const letter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${company}. With my background and passion for innovation, I am confident that I would be a valuable addition to your team.

${jobDescription ? `I was particularly drawn to this role because of the opportunity to ${jobDescription.slice(0, 100)}...` : ''}

Throughout my career, I have developed a strong foundation in problem-solving and collaboration. I am excited about the possibility of bringing my skills and enthusiasm to ${company} and contributing to your continued success.

I would welcome the opportunity to discuss how my experience and skills align with your needs. Thank you for considering my application.

Sincerely,
[Your Name]`;

      setGeneratedLetter(letter);
    } catch (error) {
      console.error('Failed to generate cover letter:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    // Show success feedback (could be improved with a toast notification)
    const button = document.activeElement as HTMLButtonElement;
    if (button) {
      const originalText = button.textContent;
      button.textContent = '✓ Copied!';
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cover-letter-${company || 'template'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">← Back</Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Generate Cover Letter</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="p-6 bg-white">
            <h2 className="text-xl font-semibold mb-6">Job Details</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>

              <div>
                <Label htmlFor="company">Company Name *</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Tech Corp"
                />
              </div>

              <div>
                <Label htmlFor="jobDescription">Job Description</Label>
                <textarea
                  id="jobDescription"
                  className="w-full min-h-[150px] p-3 border rounded-md"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                />
              </div>

              <div>
                <Label htmlFor="tone">Tone</Label>
                <select
                  id="tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="enthusiastic">Enthusiastic</option>
                </select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!jobTitle || !company || isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Include specific job requirements for better results</li>
                <li>• Choose a tone that matches the company culture</li>
                <li>• Review and personalize the generated letter</li>
                <li>• Mention specific achievements from your resume</li>
              </ul>
            </div>
          </Card>

          {/* Generated Letter */}
          <Card className="p-6 bg-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Generated Cover Letter</h2>
              {generatedLetter && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    Download
                  </Button>
                </div>
              )}
            </div>

            {generatedLetter ? (
              <div>
                <textarea
                  className="w-full min-h-[500px] p-4 border rounded-md font-serif"
                  value={generatedLetter}
                  onChange={(e) => setGeneratedLetter(e.target.value)}
                  placeholder="Your cover letter will appear here..."
                />
                <p className="text-sm text-gray-500 mt-2">
                  Feel free to edit the generated letter to add your personal touch
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[500px] text-center text-gray-500">
                <div className="text-6xl mb-4">✉️</div>
                <p className="text-lg mb-2">No cover letter generated yet</p>
                <p className="text-sm">
                  Fill in the job details and click "Generate Cover Letter" to get started
                </p>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
