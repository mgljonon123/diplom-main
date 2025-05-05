'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Career {
  title: string;
  description: string;
  skills: string[];
  salaryRange: string;
  growth: string;
  matchReason: string;
}

interface Recommendation {
  analysis: string;
  careers: Career[];
}

export default function RecommendationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing your assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Career Recommendations
            </h2>
            
            {recommendation && (
              <>
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Analysis</h3>
                  <p className="text-gray-700">{recommendation.analysis}</p>
                </div>

                <div className="space-y-8">
                  {recommendation.careers.map((career, index) => (
                    <div key={index} className="border-t border-gray-200 pt-6">
                      <h3 className="text-xl font-semibold text-indigo-600 mb-2">{career.title}</h3>
                      <p className="text-gray-700 mb-4">{career.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
                          <ul className="list-disc list-inside text-gray-700">
                            {career.skills.map((skill, i) => (
                              <li key={i}>{skill}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Salary Range</h4>
                          <p className="text-gray-700">{career.salaryRange}</p>
                          
                          <h4 className="font-medium text-gray-900 mt-4 mb-2">Growth Opportunities</h4>
                          <p className="text-gray-700">{career.growth}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Why This Career Matches You</h4>
                        <p className="text-gray-700">{career.matchReason}</p>
                      </div>
                    </div>
                  ))}
                </div>

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