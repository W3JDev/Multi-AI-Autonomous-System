import Link from 'next/link';
import { Button, Card } from '@/components/ui';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-gray-900 cursor-pointer">Ai-Artisan</h1>
          </Link>
          <nav className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link href="/resumes/new">
              <Button>Create Resume</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Manage your resumes, cover letters, and job applications</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white">
            <div className="text-sm text-gray-600 mb-1">Total Resumes</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
          </Card>
          <Card className="p-6 bg-white">
            <div className="text-sm text-gray-600 mb-1">Cover Letters</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
          </Card>
          <Card className="p-6 bg-white">
            <div className="text-sm text-gray-600 mb-1">Applications</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
          </Card>
          <Card className="p-6 bg-white">
            <div className="text-sm text-gray-600 mb-1">Avg ATS Score</div>
            <div className="text-3xl font-bold text-gray-900">--</div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-white">
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/resumes/new">
                <Button className="w-full justify-start">
                  📝 Create New Resume
                </Button>
              </Link>
              <Link href="/cover-letters/generate">
                <Button variant="outline" className="w-full justify-start">
                  ✉️ Generate Cover Letter
                </Button>
              </Link>
              <Link href="/jobs/search">
                <Button variant="outline" className="w-full justify-start">
                  🔍 Search Jobs
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity</p>
              <p className="text-sm mt-2">Start by creating your first resume!</p>
            </div>
          </Card>
        </div>

        {/* My Resumes Section */}
        <Card className="p-6 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">My Resumes</h3>
            <Link href="/resumes/new">
              <Button>New Resume</Button>
            </Link>
          </div>
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-lg mb-2">No resumes yet</p>
            <p className="text-sm mb-4">Create your first resume to get started</p>
            <Link href="/resumes/new">
              <Button>Create Resume</Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
