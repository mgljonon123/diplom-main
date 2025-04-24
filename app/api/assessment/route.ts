import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { answers } = await req.json();

    // Create assessment record
    const assessment = await prisma.assessment.create({
      data: {
        userId: session.user.id,
        answers: answers,
        completedAt: new Date(),
      }
    });

    // Format answers for AI analysis
    const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => {
      const question = questions[parseInt(questionId)];
      return {
        question: question.question,
        answer: Array.isArray(answer) ? answer.join(', ') : answer
      };
    });

    // Get career recommendations from AI
    const prompt = `You are a professional career counselor. Analyze the following assessment answers and provide detailed career recommendations.

Assessment Answers:
${formattedAnswers.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n')}

Please provide:
1. A comprehensive analysis of the user's profile based on their answers
2. 3-5 career recommendations that match their interests, skills, and preferences

For each career recommendation, include:
- Career title
- Brief description
- Required skills and qualifications
- Potential salary range
- Growth opportunities
- Why this career matches their profile
- Next steps to pursue this career

Format your response as a JSON object with this structure:
{
  "analysis": "Detailed analysis of the user's profile, interests, and potential career paths",
  "careers": [
    {
      "title": "Career Title",
      "description": "Brief description of the career",
      "skills": ["Required skill 1", "Required skill 2"],
      "qualifications": ["Required qualification 1", "Required qualification 2"],
      "salaryRange": "Expected salary range",
      "growth": "Career growth opportunities",
      "matchReason": "Why this career matches their profile",
      "nextSteps": ["Step 1", "Step 2", "Step 3"]
    }
  ]
}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Career Recommendation App'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct', // Using Mistral 7B which is a valid model
        messages: [
          {
            role: 'system',
            content: 'You are an expert career counselor with deep knowledge of various professions, required skills, and career paths. Provide detailed, accurate, and practical career recommendations based on user assessment answers. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API Error:', errorData);
      throw new Error(`AI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response:', data); // Log the response for debugging
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid API Response:', data);
      throw new Error('Invalid response format from AI API');
    }

    let recommendations;
    try {
      const content = data.choices[0].message.content;
      // Clean the response if needed
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      recommendations = JSON.parse(cleanedContent);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.error('Raw content:', data.choices[0].message.content);
      throw new Error('Failed to parse AI response');
    }

    // Validate the recommendations structure
    if (!recommendations.analysis || !Array.isArray(recommendations.careers)) {
      console.error('Invalid recommendations structure:', recommendations);
      throw new Error('Invalid recommendations structure');
    }

    // Create recommendations record
    await prisma.recommendation.create({
      data: {
        userId: session.user.id,
        assessmentId: assessment.id,
        careers: recommendations.careers,
        analysis: recommendations.analysis,
        createdAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      assessmentId: assessment.id,
      recommendations
    });
  } catch (error) {
    console.error('Assessment submission error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Questions from the assessment page
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