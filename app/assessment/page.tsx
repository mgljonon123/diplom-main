'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LoadingAnimation from '@/app/components/LoadingAnimation';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  id: number;
  question: string;
  options: string[];
  type: 'single' | 'multiple';
}

const questions: Question[] = [
  {
    id: 1,
    question: "What are your main interests?",
    options: [
      "Technology and Innovation",
      "Business and Finance",
      "Healthcare and Medicine",
      "Arts and Creativity",
      "Science and Research",
      "Education and Training",
      "Social Services",
      "Engineering and Construction"
    ],
    type: "multiple"
  },
  {
    id: 2,
    question: "What type of work environment do you prefer?",
    options: [
      "Office setting",
      "Remote work",
      "Outdoor/Field work",
      "Laboratory",
      "Classroom",
      "Healthcare facility",
      "Creative studio",
      "Construction site"
    ],
    type: "single"
  },
  {
    id: 3,
    question: "What are your strongest skills?",
    options: [
      "Analytical thinking",
      "Communication",
      "Leadership",
      "Technical skills",
      "Creative problem-solving",
      "Attention to detail",
      "Team collaboration",
      "Project management"
    ],
    type: "multiple"
  },
  {
    id: 4,
    question: "What level of education are you willing to pursue?",
    options: [
      "High school diploma",
      "Associate's degree",
      "Bachelor's degree",
      "Master's degree",
      "Doctoral degree",
      "Professional certification",
      "Trade school",
      "On-the-job training"
    ],
    type: "single"
  },
  {
    id: 5,
    question: "What is your preferred work schedule?",
    options: [
      "Regular 9-5",
      "Flexible hours",
      "Shift work",
      "Part-time",
      "Freelance/Contract",
      "Seasonal",
      "On-call",
      "Remote with flexible hours"
    ],
    type: "single"
  }
];

export default function AssessmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [loading, setLoading] = useState(false);

  if (status === 'loading') {
    return <LoadingAnimation />;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleAnswer = (option: string) => {
    const question = questions[currentQuestion];
    setAnswers(prev => {
      if (question.type === 'single') {
        return { ...prev, [question.id]: option };
      } else {
        const currentAnswers = (prev[question.id] as string[]) || [];
        if (currentAnswers.includes(option)) {
          return {
            ...prev,
            [question.id]: currentAnswers.filter(a => a !== option)
          };
        } else {
          return {
            ...prev,
            [question.id]: [...currentAnswers, option]
          };
        }
      }
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit assessment');
      }

      const data = await response.json();
      router.push('/recommendations');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const question = questions[currentQuestion];
  const currentAnswer = answers[question.id];

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg transition-all duration-300 hover:shadow-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-8 transform transition-all duration-300">
              <h2 className="text-2xl font-bold text-black mb-2 transform transition-all duration-300 hover:scale-105">
                Question {currentQuestion + 1} of {questions.length}
              </h2>
              <p className="text-black text-lg transform transition-all duration-300 hover:translate-x-2">
                {question.question}
              </p>
            </div>

            <div className="space-y-3">
              {question.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                    question.type === 'single'
                      ? currentAnswer === option
                        ? 'border-indigo-600 bg-indigo-50 text-black shadow-md'
                        : 'border-gray-300 hover:border-indigo-600 text-black hover:shadow-sm'
                      : Array.isArray(currentAnswer) && currentAnswer.includes(option)
                      ? 'border-indigo-600 bg-indigo-50 text-black shadow-md'
                      : 'border-gray-300 hover:border-indigo-600 text-black hover:shadow-sm'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50 disabled:opacity-50 transform transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Previous
              </button>

              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading || !currentAnswer}
                  className="px-4 py-2 border border-transparent rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transform transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md"
                >
                  Submit Assessment
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!currentAnswer}
                  className="px-4 py-2 border border-transparent rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transform transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .space-y-3 > button {
          animation: fadeIn 0.3s ease-out forwards;
          animation-delay: calc(var(--index) * 0.1s);
        }

        .space-y-3 > button:nth-child(1) { --index: 0; }
        .space-y-3 > button:nth-child(2) { --index: 1; }
        .space-y-3 > button:nth-child(3) { --index: 2; }
        .space-y-3 > button:nth-child(4) { --index: 3; }
        .space-y-3 > button:nth-child(5) { --index: 4; }
        .space-y-3 > button:nth-child(6) { --index: 5; }
        .space-y-3 > button:nth-child(7) { --index: 6; }
        .space-y-3 > button:nth-child(8) { --index: 7; }
      `}</style>
    </div>
  );
} 