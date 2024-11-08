// lib/cors-middleware.ts

import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';

// Initializing the cors middleware
const cors = Cors({
  methods: ['GET', 'HEAD', 'POST'], // Define the allowed methods
  origin: 'http://localhost:3000',  // Replace with your frontend origin
  credentials: true,                // If you need to send cookies or other credentials
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export { cors };
export default runMiddleware;
