import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const { quizId, answers } = await request.json()

  if (!quizId || !answers) {
    return NextResponse.json({ message: 'Quiz ID and answers are required' }, { status: 400 })
  }

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(quizId) },
    })

    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 })
    }

    const questions = JSON.parse(quiz.questions as string)
    let score = 0
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] === questions[i].correctAnswer) {
        score++
      }
    }

    const result = await prisma.result.create({
      data: {
        quizId: parseInt(quizId),
        answers: JSON.stringify(answers),
        score,
      },
    })

    return NextResponse.json({ score, totalQuestions: questions.length })
  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json({ message: 'Error submitting quiz' }, { status: 500 })
  }
}