import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the latest recommendation for the user
    const recommendation = await prisma.recommendation.findFirst({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!recommendation) {
      return NextResponse.json(
        { error: 'No recommendations found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      recommendations: {
        analysis: recommendation.analysis,
        careers: recommendation.careers
      }
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 