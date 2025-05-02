'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoadingAnimation from '@/app/components/LoadingAnimation';
import StatisticsChart from '@/app/components/StatisticsChart';

interface Career {
  title: string;
  industry: string;
  description: string;
  skills: string[];
  qualifications: string[];
  salaryRange: {
    entry: string;
    mid: string;
    senior: string;
  };
  growth: string;
  matchReason: string;
  nextSteps: string[];
  challenges: string;
  relatedCareers: string[];
  matchScore?: number;
}

interface Recommendations {
  analysis: string;
  careers: Career[];
  recommendations: {
    skills: string[];
    certifications: string[];
    networking: string;
    organizations: string[];
    resources: string[];
  };
}

export default function RecommendationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recommendation, setRecommendation] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch('/api/recommendations');
        const data = await response.json();
        setRecommendation(data.recommendations);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchRecommendations();
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Career Recommendations
            </h2>
            
            {!recommendation ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No recommendations found. Please complete the assessment first.</p>
                <button
                  onClick={() => router.push('/assessment')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Take Assessment
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Analysis</h3>
                  <p className="text-gray-700">{recommendation.analysis}</p>
                </div>

                {recommendation.careers && recommendation.careers.length > 0 && (
                  <StatisticsChart
                    careers={recommendation.careers.map(career => ({
                      title: career.title,
                      matchScore: career.matchScore || 0,
                      salaryRange: {
                        entry: parseInt(career.salaryRange.entry.replace(/[^0-9]/g, '')),
                        mid: parseInt(career.salaryRange.mid.replace(/[^0-9]/g, '')),
                        senior: parseInt(career.salaryRange.senior.replace(/[^0-9]/g, ''))
                      },
                      skills: career.skills
                    }))}
                  />
                )}

                {recommendation.careers && recommendation.careers.length > 0 ? (
                  <div className="space-y-6">
                    {recommendation.careers.map((career, index) => (
                      <div key={index} className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {career.title}
                        </h3>
                        <p className="text-gray-600 mb-4">{career.industry}</p>
                        <p className="text-gray-700 mb-4">{career.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
                            <ul className="list-disc list-inside text-gray-600">
                              {career.skills?.map((skill, i) => (
                                <li key={i}>{skill}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Qualifications</h4>
                            <ul className="list-disc list-inside text-gray-600">
                              {career.qualifications?.map((qual, i) => (
                                <li key={i}>{qual}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Salary Ranges</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-3 rounded">
                              <p className="text-sm text-gray-600">Entry Level</p>
                              <p className="font-medium">{career.salaryRange?.entry}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                              <p className="text-sm text-gray-600">Mid Career</p>
                              <p className="font-medium">{career.salaryRange?.mid}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                              <p className="text-sm text-gray-600">Senior Level</p>
                              <p className="font-medium">{career.salaryRange?.senior}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Growth Opportunities</h4>
                          <p className="text-gray-600">{career.growth}</p>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Why This Career Matches You</h4>
                          <p className="text-gray-600">{career.matchReason}</p>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
                          <ul className="list-disc list-inside text-gray-600">
                            {career.nextSteps?.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Potential Challenges</h4>
                          <p className="text-gray-600">{career.challenges}</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Related Careers</h4>
                          <ul className="list-disc list-inside text-gray-600">
                            {career.relatedCareers?.map((related, i) => (
                              <li key={i}>{related}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No career recommendations available.</p>
                  </div>
                )}

                {recommendation.recommendations && (
                  <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Recommendations</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Skills to Develop</h4>
                        <ul className="list-disc list-inside text-gray-600">
                          {recommendation.recommendations.skills?.map((skill, i) => (
                            <li key={i}>{skill}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Certifications to Consider</h4>
                        <ul className="list-disc list-inside text-gray-600">
                          {recommendation.recommendations.certifications?.map((cert, i) => (
                            <li key={i}>{cert}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Networking Opportunities</h4>
                        <p className="text-gray-600">{recommendation.recommendations.networking}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Professional Organizations</h4>
                        <ul className="list-disc list-inside text-gray-600">
                          {recommendation.recommendations.organizations?.map((org, i) => (
                            <li key={i}>{org}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="md:col-span-2">
                        <h4 className="font-medium text-gray-900 mb-2">Additional Resources</h4>
                        <ul className="list-disc list-inside text-gray-600">
                          {recommendation.recommendations.resources?.map((resource, i) => (
                            <li key={i}>{resource}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <button
                    onClick={() => router.push('/assessment')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Retake Assessment
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 