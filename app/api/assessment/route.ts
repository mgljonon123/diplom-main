import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

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
      const question = questions.find(q => q.id === parseInt(questionId));
      if (!question) {
        throw new Error(`Question with ID ${questionId} not found`);
      }
      return {
        question: question.question,
        answer: Array.isArray(answer) ? answer.join(', ') : answer
      };
    });

    // Get career recommendations from AI
    const prompt = `You are an expert career counselor with deep knowledge of various professions, required skills, and career paths. Analyze the following assessment answers and provide detailed career recommendations.

Assessment Answers:
${formattedAnswers.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n')}

Career Context:
1. Technology and Innovation:
   - Software Development: Creating applications and systems
   - Data Science: Analyzing and interpreting complex data
   - Cybersecurity: Protecting digital systems and data
   - AI/ML Engineering: Developing intelligent systems
   - Cloud Computing: Managing and deploying cloud services

2. Business and Finance:
   - Financial Analysis: Evaluating investments and markets
   - Business Consulting: Advising companies on strategy
   - Project Management: Leading and organizing projects
   - Marketing: Promoting products and services
   - Entrepreneurship: Starting and managing businesses

3. Healthcare and Medicine:
   - Medical Practice: Diagnosing and treating patients
   - Nursing: Providing patient care and support
   - Medical Research: Conducting health studies
   - Healthcare Administration: Managing medical facilities
   - Public Health: Improving community health

4. Arts and Creativity:
   - Graphic Design: Creating visual content
   - Writing/Editing: Producing written content
   - Music/Performing Arts: Entertaining and creating art
   - Architecture: Designing buildings and spaces
   - Film/Media Production: Creating visual media

5. Science and Research:
   - Scientific Research: Conducting experiments
   - Environmental Science: Studying ecosystems
   - Physics/Chemistry: Exploring natural phenomena
   - Biology: Studying living organisms
   - Astronomy: Exploring space

6. Education and Training:
   - Teaching: Educating students
   - Educational Administration: Managing schools
   - Curriculum Development: Creating educational content
   - Training: Developing professional skills
   - Educational Technology: Implementing tech in education

7. Social Services:
   - Social Work: Supporting individuals and communities
   - Counseling: Providing mental health support
   - Non-profit Management: Leading charitable organizations
   - Community Development: Improving neighborhoods
   - Human Services: Assisting vulnerable populations

8. Engineering and Construction:
   - Civil Engineering: Designing infrastructure
   - Mechanical Engineering: Creating mechanical systems
   - Electrical Engineering: Working with electrical systems
   - Construction Management: Overseeing building projects
   - Architecture: Designing structures

Please provide:
1. A comprehensive analysis of the user's profile based on their answers, focusing on:
   - Their primary interests and skills
   - Work environment preferences
   - Educational aspirations
   - Schedule preferences
   - Potential career paths that align with their profile

2. 3-5 career recommendations that match their interests, skills, and preferences, including for each:
   - Career title and industry
   - Detailed description of the role
   - Required skills and qualifications
   - Typical salary range (entry to senior level)
   - Career growth opportunities and progression paths
   - Why this career matches their profile
   - Specific next steps to pursue this career
   - Potential challenges and how to overcome them
   - Related career options to consider

3. Additional recommendations:
   - Skills to develop
   - Certifications or courses to consider
   - Networking opportunities
   - Professional organizations to join
   - Resources for further exploration

Format your response as a JSON object with this structure:
{
  "analysis": "Detailed analysis of the user's profile, interests, and potential career paths",
  "careers": [
    {
      "title": "Career Title",
      "industry": "Industry Sector",
      "description": "Detailed description of the career",
      "skills": ["Required skill 1", "Required skill 2"],
      "qualifications": ["Required qualification 1", "Required qualification 2"],
      "salaryRange": {
        "entry": "Entry level salary range",
        "mid": "Mid-career salary range",
        "senior": "Senior level salary range"
      },
      "growth": "Career growth opportunities and progression paths",
      "matchReason": "Why this career matches their profile",
      "nextSteps": ["Step 1", "Step 2", "Step 3"],
      "challenges": "Potential challenges and solutions",
      "relatedCareers": ["Related career 1", "Related career 2"]
    }
  ],
  "recommendations": {
    "skills": ["Skill 1 to develop", "Skill 2 to develop"],
    "certifications": ["Certification 1", "Certification 2"],
    "networking": "Networking opportunities and strategies",
    "organizations": ["Organization 1", "Organization 2"],
    "resources": ["Resource 1", "Resource 2"]
  }
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
        model: 'mistralai/mistral-7b-instruct',
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
    console.log('API Response:', data);
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid API Response:', data);
      throw new Error('Invalid response format from AI API');
    }

    let recommendations;
    try {
      const content = data.choices[0].message.content;
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