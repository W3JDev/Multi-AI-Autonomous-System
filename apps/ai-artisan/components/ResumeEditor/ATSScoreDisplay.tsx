'use client';

import type { ATSAnalysis } from '@/lib/types';
import { Card } from '@/components/ui';
import { Progress } from '@/components/ui';

interface ATSScoreDisplayProps {
  analysis: ATSAnalysis;
}

export function ATSScoreDisplay({ analysis }: ATSScoreDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">ATS Compatibility Score</h3>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
            {analysis.score}
          </span>
          <span className={`text-lg font-medium ${getScoreColor(analysis.score)}`}>
            {getScoreLabel(analysis.score)}
          </span>
        </div>
        <Progress value={analysis.score} className="h-3" />
        <p className="text-sm text-gray-600 mt-3">
          Your resume scores {analysis.score}/100 for ATS compatibility. 
          {analysis.score < 80 && ' Follow the suggestions below to improve your score.'}
        </p>
      </Card>

      {/* Keywords Found */}
      {analysis.keywords.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">Keywords Found</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.keywords.slice(0, 20).map((keyword, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {keyword}
                {analysis.keywordDensity[keyword] > 1 && (
                  <span className="ml-1 text-xs">×{analysis.keywordDensity[keyword]}</span>
                )}
              </span>
            ))}
          </div>
          {analysis.keywords.length > 20 && (
            <p className="text-sm text-gray-500 mt-2">
              +{analysis.keywords.length - 20} more keywords
            </p>
          )}
        </Card>
      )}

      {/* Missing Keywords */}
      {analysis.missing.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-orange-600">Missing Keywords</h3>
          <p className="text-sm text-gray-600 mb-3">
            Consider adding these keywords from the job description:
          </p>
          <div className="flex flex-wrap gap-2">
            {analysis.missing.map((keyword, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">Improvement Suggestions</h3>
          <ul className="space-y-2">
            {analysis.suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span className="text-sm text-gray-700">{suggestion}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Format Issues */}
      {analysis.formatIssues.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-red-600">Format Issues</h3>
          <ul className="space-y-2">
            {analysis.formatIssues.map((issue, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-red-600 mr-2">⚠</span>
                <span className="text-sm text-gray-700">{issue}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
