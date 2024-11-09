import { SUPPORTED_MIME_TYPES } from '@/app/constants/constants';
import runMiddleware, { cors } from '@/lib/cors-middleware';
import prisma from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';
import { ImageBlockParam, TextBlockParam, ToolResultBlockParam, ToolUseBlockParam } from '@anthropic-ai/sdk/resources/messages.mjs';
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

    const isValid = SUPPORTED_MIME_TYPES.find(x => x === file?.type)
    
    if (!isValid) {
      return NextResponse.json({ message: 'Media type not supported!' }, { status: 400 })
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

async function generateQuizFromAI(studyMaterial: string, file: File | null, complexity = 'easy', questionCount = 2) {
  const prompt = `Generate a quiz based on the following study material: ${studyMaterial}
    Create ${questionCount} multiple-choice questions with complexity level ${complexity} and 4 options each. Format the output as a JSON array of objects, where each object represents a question with properties: question, options (array of 4 strings), and correctAnswer (index of the correct option). You MUST give the array only in the response.`;

  const content: Array<TextBlockParam | ImageBlockParam | ToolUseBlockParam | ToolResultBlockParam> = [
    { type: "text", text: prompt },
  ];
  
  if (file) { 
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = buffer.toString('base64');

    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: file.type as any,
        data: base64String
      } 
    });
  }
  

  const completion = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: content
      }
    ],
  }) as any;

  const quiz = JSON.parse(completion.content[0].text)

  return quiz;
}