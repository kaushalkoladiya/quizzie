'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { SUPPORTED_MIME_TYPES } from './constants/constants';
import ErrorMessage from './components/Alert';

export default function Home() {
  const [studyMaterial, setStudyMaterial] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [complexity, setComplexity] = useState('medium');
  const [questionCount, setQuestionCount] = useState('10');
  const [quiz, setQuiz] = useState<Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }> | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState('')
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const _file = e.target?.files?.[0];
    if (_file) {
      _file.type

      const isValidFileType = SUPPORTED_MIME_TYPES.find(x => x === _file.type)

      if (!isValidFileType) {
        setFileError('Selected File type is not supported. Currently, it only supports image.')
        return;
      } else {
        setFileError('')
      }

      setFile(_file)
    }
  };

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('studyMaterial', studyMaterial);
      if (file) formData.append('file', file);
      formData.append('complexity', complexity);
      formData.append('questionCount', questionCount);

      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setQuiz(data.quiz);

      // Redirect to the newly created quiz page
      router.push(`/quiz/${data.quizId}`);
    } catch (error) {
      console.error('Error generating quiz:', error);
    }
    setLoading(false);
  };

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>AI Quiz Generator</h1>
      <Card>
        <CardHeader>
          <CardTitle>Enter Study Material</CardTitle>
          <CardDescription>
            Paste your study material or upload a file to generate a quiz.
          </CardDescription>
        </CardHeader>
        <CardContent>

          <Textarea
            value={studyMaterial}
            onChange={(e) => setStudyMaterial(e.target.value)}
            placeholder='Enter your study material here...'
            className='mb-4'
          />
          <div>
            <p className='leading-7'>Select File</p>
            <Input
              type='file'
              onChange={handleFileChange}
              className='mb-4'
            />
            {/* error message */}
            {fileError && <ErrorMessage text={fileError} />}
          </div>

          <div className='mb-4'>
            <p className='leading-7'>Select Complexity</p>
            <Select
              value={complexity}
              onValueChange={setComplexity}>
              <SelectTrigger>
                <SelectValue placeholder='Theme' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='easy'>Easy</SelectItem>
                <SelectItem value='medium'>Medium</SelectItem>
                <SelectItem value='hard'>Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='mb-4'>
            <p className='leading-7'>Select Question Count</p>
            <Select
              value={questionCount}
              onValueChange={setQuestionCount}>
              <SelectTrigger>
                <SelectValue placeholder='Select Question Count (Default: 10)' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='5'>5 questions</SelectItem>
                <SelectItem value='10'>10 questions</SelectItem>
                <SelectItem value='15'>15 questions</SelectItem>
                <SelectItem value='20'>20 questions</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={generateQuiz}
            disabled={loading}>
            {loading ? 'Generating...' : 'Generate Quiz'}
          </Button>

        </CardContent>
      </Card>
      {quiz && (
        <Card className='mt-8'>
          <CardHeader>
            <CardTitle>Generated Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            {quiz.map((question, index) => (
              <div
                key={index}
                className='mb-4'>
                <p className='font-semibold'>{question.question}</p>
                {question.options.map((option, optionIndex: number) => (
                  <div
                    key={optionIndex}
                    className='ml-4'>
                    <label>
                      <input
                        type='radio'
                        name={`question-${index}`}
                        value={optionIndex}
                        className='mr-2'
                      />
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button>Submit Quiz</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

