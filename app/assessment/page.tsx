'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const questions = [
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
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    router.push('/login');
    return null;
  }

  const handleAnswer = (option: string) => {
    const currentAnswers = answers[currentQuestion] || [];
    const question = questions[currentQuestion];

    if (question.type === "single") {
      setAnswers({ ...answers, [currentQuestion]: [option] });
    } else {
      if (currentAnswers.includes(option)) {
        setAnswers({
          ...answers,
          [currentQuestion]: currentAnswers.filter(a => a !== option)
        });
      } else {
        setAnswers({
          ...answers,
          [currentQuestion]: [...currentAnswers, option]
        });
      }
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          userId: session?.user?.id,
        }),
      });

      if (response.ok) {
        router.push('/recommendations');
      } else {
        console.error('Failed to submit assessment');
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentAnswers = answers[currentQuestion] || [];
  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-8">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Question {currentQuestion + 1} of {questions.length}
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>{question.question}</p>
              </div>
            </div>

            <div className="space-y-4">
              {question.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className={`w-full text-left px-4 py-3 border rounded-md ${
                    currentAnswers.includes(option)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 hover:border-indigo-500'
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
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>

              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || currentAnswers.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={currentAnswers.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 