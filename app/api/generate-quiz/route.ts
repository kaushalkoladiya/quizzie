import runMiddleware, { cors } from '@/lib/cors-middleware';
import prisma from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const studyMaterial = formData.get('studyMaterial') as string
    const file = formData.get('file') as File | null
    const complexity = formData.get('complexity') as string
    const questionCount = parseInt(formData.get('questionCount') as string)

    if (!studyMaterial) {
      return NextResponse.json({ message: 'Study material is required' }, { status: 400 })
    }

    const generatedQuiz = await generateQuizFromAI(studyMaterial, file, complexity, questionCount)

    const quiz = await prisma.quiz.create({
      data: {
        questions: JSON.stringify(generatedQuiz),
        complexity,
        questionCount,
      },
    })

    return NextResponse.json({ 
      quiz: generatedQuiz,
      quizId: quiz.id,
    })
  } catch (error) {
    console.error('Error generating quiz:', error)
    return NextResponse.json({ message: 'Error generating quiz' }, { status: 500 })
  }
}

async function generateQuizFromAI(studyMaterial: string, file: File | null, complexity: string, questionCount: number) {
  // TODO: change it later
  return [
    {
      question: 'What is the main purpose of a connection pooler?',
      options: [
        'To manage database connections for the app',
        'To generate new database connections on demand',
        'To cache frequently used data',
        'To optimize network traffic'
      ],
      correctAnswer: 0
    },
    {
      question: 'How does a connection pooler improve the efficiency of an application?',
      options: [
        'By creating new connections for each request',
        'By managing a pool of reusable connections',
        'By caching frequently used data in memory',
        'By reducing network traffic between the app and database'
      ],
      correctAnswer: 1
    }
  ];

  const completion = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: `Generate a quiz based on the following study material: ${studyMaterial}
        Create 2 multiple-choice questions with 4 options each. Format the output as a JSON array of objects, where each object represents a question with properties: question, options (array of 4 strings), and correctAnswer (index of the correct option). You MUST give the array only in the response.`
      }
    ],
  }) as any;

  const quiz = JSON.parse(completion.content[0].text)

  return quiz;
}