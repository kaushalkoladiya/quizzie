import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { quizId, answers } = req.body;

  if (!quizId || !answers) {
    return res.status(400).json({ message: 'Quiz ID and answers are required' });
  }

  try {
    await client.connect();
    const database = client.db('quizapp');
    const quizzes = database.collection('quizzes');

    const quiz = await quizzes.findOne({ _id: quizId });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let score = 0;
    for (let i = 0; i < quiz.questions.length; i++) {
      if (answers[i] === quiz.questions[i].correctAnswer) {
        score++;
      }
    }

    const result = await quizzes.updateOne(
      { _id: quizId },
      { $push: { results: { answers, score, timestamp: new Date() } } }
    );

    res.status(200).json({ score, totalQuestions: quiz.questions.length });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Error submitting quiz' });
  } finally {
    await client.close();
  }
}