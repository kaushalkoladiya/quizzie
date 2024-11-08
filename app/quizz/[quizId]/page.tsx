'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QuizType } from '@/app/types/quiz'
import { Share2 } from 'lucide-react'

export default function QuizPage() {
  const { quizId } = useParams()
  const [quiz, setQuiz] = useState<QuizType[]>([])
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [score, setScore] = useState<number | null>(null)

  useEffect(() => {
    const fetchQuiz = async () => {
      const response = await fetch(`/api/quiz/${quizId}`)
      const data = await response.json()

      setQuiz(data.quiz)
      setUserAnswers(new Array(data.quiz.length).fill(-1))
    }
    fetchQuiz()
  }, [quizId])

  const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
    setUserAnswers(prev => {
      const newAnswers = [...prev]
      newAnswers[questionIndex] = optionIndex
      return newAnswers
    })
  }

  const handleSubmit = async () => {
    const response = await fetch('/api/submit-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId, answers: userAnswers }),
    })
    const data = await response.json()
    setScore(data.score)
  }

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      alert('Quiz link copied to clipboard!')
    })
  }

  if (!quiz.length) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quiz</h1>
        <Button onClick={handleShare} variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Generated Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          {quiz.map((question, index) => (
            <div key={index} className="mb-4">
              <p className="font-semibold">{question.question}</p>
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="ml-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={optionIndex}
                      checked={userAnswers[index] === optionIndex}
                      onChange={() => handleAnswerChange(index, optionIndex)}
                      className="mr-2"
                    />
                    {option}
                  </label>
                </div>
              ))}
              {score !== null && (
                <p className={`mt-2 ${userAnswers[index] === question.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                  {userAnswers[index] === question.correctAnswer ? 'Correct!' : `Incorrect. The correct answer is: ${question.options[question.correctAnswer]}`}
                </p>
              )}
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit}>Submit Quiz</Button>
          {score !== null && (
            <p className="ml-4">Your score: {score} out of {quiz.length}</p>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}