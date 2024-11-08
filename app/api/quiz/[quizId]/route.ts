import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { quizId: string } }) {
  const quizId = parseInt(params.quizId)

  if (isNaN(quizId)) {
    return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 })
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
  })

  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
  }

  return NextResponse.json({ quiz: JSON.parse(quiz.questions || '[]') })
}