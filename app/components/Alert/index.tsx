import React from 'react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react';


type AlertProps = {
  text: string;
}

const ErrorMessage = ({ text }: AlertProps) => {
  return (
    <div className='mb-2'>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {text}
        </AlertDescription>
      </Alert>
    </div>

  )
}

export default ErrorMessage