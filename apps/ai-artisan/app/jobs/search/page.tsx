'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  matchScore: number;
  matchReasons: string[];
  missingSkills: string[];
  salary?: string;
  posted: string;
}

export default function JobSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [jobs, setJobs] = useState<JobMatch[]>([]);

  const mockJobs: JobMatch[] = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Tech Innovations Inc.',
      location: 'San Francisco, CA',
      description: 'We are looking for an experienced software engineer to join our team...',
      matchScore: 92,
      matchReasons: [
        'Strong match in React and TypeScript skills',
        '5+ years experience requirement matches',
        'Located in preferred city',
      ],
      missingSkills: ['Kubernetes', 'GraphQL'],
      salary: '$150,000 - $200,000',
      posted: '2 days ago',
    },
    {
      id: '2',
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      location: 'Remote',
      description: 'Join our fast-paced startup as a full stack developer...',
      matchScore: 85,
      matchReasons: [
        'Matches your full stack experience',
        'Remote work preference aligned',
      ],
      missingSkills: ['MongoDB', 'Docker'],
      salary: '$120,000 - $160,000',
      posted: '1 week ago',
    },
    {
      id: '3',
      title: 'Frontend Engineer',
      company: 'Digital Solutions Co.',
      location: 'New York, NY',
      description: 'Looking for a talented frontend engineer...',
      matchScore: 78,
      matchReasons: [
        'React expertise is a strong match',
        'UI/UX skills align well',
      ],
      missingSkills: ['Vue.js', 'Tailwind CSS'],
      salary: '$130,000 - $170,000',
      posted: '3 days ago',
    },
  ];

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setJobs(mockJobs);
    } catch (error) {
      console.error('Failed to search jobs:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
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
            <h1 className="text-2xl font-bold text-gray-900">Job Search</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <Card className="p-6 bg-white mb-8">
          <h2 className="text-xl font-semibold mb-4">AI-Powered Job Matching</h2>
          <p className="text-gray-600 mb-4">
            Find jobs that match your skills and experience with AI-powered recommendations
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">Job Title or Keywords</Label>
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., Software Engineer, Product Manager"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., San Francisco, Remote"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search Jobs'}
            </Button>
            <Button variant="outline">
              Use My Resume
            </Button>
          </div>
        </Card>

        {/* Results */}
        {jobs.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Found {jobs.length} matching jobs
              </h2>
              <select className="p-2 border rounded-md">
                <option>Best Match</option>
                <option>Most Recent</option>
                <option>Highest Salary</option>
              </select>
            </div>

            {jobs.map((job) => (
              <Card key={job.id} className="p-6 bg-white hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {job.company} • {job.location}
                    </p>
                    {job.salary && (
                      <p className="text-sm text-gray-600 mb-2">💰 {job.salary}</p>
                    )}
                    <p className="text-sm text-gray-500">{job.posted}</p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-block px-4 py-2 rounded-full font-bold ${getMatchColor(job.matchScore)}`}>
                      {job.matchScore}% Match
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{job.description}</p>

                {/* Match Reasons */}
                <div className="mb-4">
                  <h4 className="font-semibold text-sm text-gray-900 mb-2">
                    ✓ Why you're a great fit:
                  </h4>
                  <ul className="space-y-1">
                    {job.matchReasons.map((reason, idx) => (
                      <li key={idx} className="text-sm text-green-700">
                        • {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Missing Skills */}
                {job.missingSkills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">
                      Skills to develop:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {job.missingSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button>Apply Now</Button>
                  <Button variant="outline">View Details</Button>
                  <Button variant="outline">Save Job</Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 bg-white text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No jobs found yet</h3>
            <p className="text-gray-600 mb-4">
              Enter search criteria above to find jobs that match your skills
            </p>
            <p className="text-sm text-gray-500">
              Tip: Upload your resume for personalized job recommendations
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
