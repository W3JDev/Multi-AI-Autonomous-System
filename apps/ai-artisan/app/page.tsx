import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Ai-Artisan</h1>
          <nav className="flex gap-4">
            <Link href="/dashboard" className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              Dashboard
            </Link>
            <Link href="/resumes/new" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Create Resume
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            AI-Powered Resume Builder
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Create professional, ATS-optimized resumes in minutes with AI assistance
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/resumes/new" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Get Started
            </Link>
            <Link href="/dashboard" className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
              View My Resumes
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Smart Resume Builder</h3>
            <p className="text-gray-600">
              Create and edit resumes with our intuitive editor.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">ATS Optimization</h3>
            <p className="text-gray-600">
              Get real-time ATS compatibility scores.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
            <p className="text-gray-600">
              Generate cover letters with AI.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center bg-white rounded-lg shadow-lg p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to land your dream job?
          </h2>
          <Link href="/resumes/new" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg">
            Create Your Resume Now
          </Link>
        </div>
      </main>

      <footer className="bg-white mt-16 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            Part of W3JDev AI Ecosystem
          </p>
        </div>
      </footer>
    </div>
  );
}
