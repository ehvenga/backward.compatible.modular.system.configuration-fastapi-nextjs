'use client';

import { useEffect, useState } from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Home() {
  const [parameterList, setParameterList] = useState([]);
  const [initialParameter, setInitialParameter] = useState('');
  const [goalParameter, setGoalParameter] = useState('');
  const [parameterChain, setParameterChain] = useState([]);
  const [partsChain, setPartsChain] = useState([]);
  const [noSolution, setNoSolution] = useState(false);
  const [partsOptions, setPartsOptions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/parameters/');
      const jsonData = await response.json();
      setParameterList(jsonData);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  const submitSelection = () => {
    handleFindParameterChain();
    handleFindPartsChain();
  };

  const handleFindParameterChain = async () => {
    setParameterChain([]);
    setNoSolution(false);
    try {
      const response = await fetch(
        'http://localhost:8000/api/generate-parameters/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            initialParameter,
            goalParameter,
          }),
        }
      );

      if (!response.ok) {
        const errorResponse = await response.text(); // Get the response text
        throw new Error(errorResponse);
      }

      const jsonData = await response.json();
      console.log('Submission response: ', jsonData.parameterChain);
      setParameterChain(jsonData.parameterChain);
    } catch (error) {
      console.error('Error submitting selection: ', error);
      if (
        error.message.includes('No path found from initial to goal parameter.')
      ) {
        console.log(
          'Specific Error: No path found from initial to goal parameter.'
        );
        setNoSolution(true);
      }
    }
  };

  const handleFindPartsChain = async () => {
    setPartsChain([]);
    // setNoSolution(false);
    try {
      const response = await fetch(
        'http://localhost:8000/api/find-webservices/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            initialParameter,
            goalParameter,
          }),
        }
      );

      if (!response.ok) {
        const errorResponse = await response.text(); // Get the response text
        throw new Error(errorResponse);
      }

      const jsonData = await response.json();
      console.log('Submission response: ', jsonData.webServiceChain);
      setPartsChain(jsonData.webServiceChain);
    } catch (error) {
      console.error('Error submitting selection: ', error);
      // if (
      //   error.message.includes('No path found from initial to goal parameter.')
      // ) {
      //   console.log(
      //     'Specific Error: No path found from initial to goal parameter.'
      //   );
      //   setNoSolution(true);
      // }
    }
  };

  return (
    <main className='mt-6'>
      <div className='w-full'>
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Select Interfaces</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <Select onValueChange={setInitialParameter}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select Initial Parameter' />
              </SelectTrigger>
              <SelectContent>
                {parameterList.map((parameter, index) => (
                  <SelectItem key={index} value={parameter.parameterid}>
                    {parameter.parametername}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setGoalParameter}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select Goal Parameter' />
              </SelectTrigger>
              <SelectContent>
                {parameterList.map((parameter, index) => (
                  <SelectItem key={index} value={parameter.parameterid}>
                    {parameter.parametername}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className='w-full flex gap-6'>
              {/* <Button
                variant='outline'
                className='w-60 bg-gray-50'
                onClick={submitSelection}
              >
                + Add Intermediate Parameter
              </Button> */}
              <Button
                variant='outline'
                className='w-60 bg-green-50'
                onClick={submitSelection}
              >
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>

        {parameterChain?.length > 0 && (
          <Card className='mt-6'>
            <CardHeader>
              <CardTitle className='text-xl border-b pb-2'>Solution</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col'>
              <h2 className='font-medium text-xl w-full'>
                Parameters Solution
              </h2>
              <div className='flex gap-4 mt-4 items-center'>
                {parameterChain.map((parameter, index) => (
                  <>
                    {index > 0 && <>-&gt;</>}
                    <p className='p-3 w-20 border text-center rounded'>
                      {parameter}
                    </p>
                  </>
                ))}
              </div>
            </CardContent>
            {partsChain?.length > 0 && (
              <CardContent className='flex flex-col gap-4 w-full'>
                <h2 className='font-medium text-xl w-full'>Parts Solution</h2>
                <div className='flex items-center gap-4'>
                  {partsChain.map((part, index) => (
                    <>
                      {index > 0 && <>-&gt;</>}
                      <Select>
                        <SelectTrigger className='w-60 h-20 flex gap-x-2 justify-center items-center hover:border-2'>
                          <SelectValue placeholder={part} />
                        </SelectTrigger>
                        <SelectContent>
                          {partsOptions.map((options, index) => (
                            <SelectItem key={index} value={options}>
                              {part}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </div>

      {noSolution && (
        <>
          <Alert className=' mt-6 bg-red-50'>
            <AlertTitle className=''>Solution Not Found</AlertTitle>
            <AlertDescription>
              We are not able to find any solution for this input and goal
              parameter
            </AlertDescription>
          </Alert>
        </>
      )}
    </main>
  );
}
