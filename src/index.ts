import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { perplexity } from '@ai-sdk/perplexity'
import { anthropic } from '@ai-sdk/anthropic'
import { generateText, tool, Output } from 'ai'
import 'dotenv/config'
import { z } from 'zod'
 
// const main = async () => {
//   const result = await generateText({
//     model: openai('gpt-4o-mini'),
//     prompt: 'When is the AI Engineer summit?',
//   })
//   console.log(result.text) // Open API has a context cut-off from 2024
//   console.log(result.sources); 
// }

// const main = async () => {
//   const result = await generateText({
//     model: perplexity('sonar-pro'),
//     prompt: 'Hello, world!',
//   })
//   console.log(result.text);
//   console.
  
//   log(result.sources); // For Perplexity, this will include sources has web-search built in
// }
 
// const main = async () => {
//   const result = await generateText({
//     model: google('gemini-2.0-flash-001', { useSearchGrounding: true }),
//     prompt: 'When is the AI Engineer summit?',
//   })
//   console.log(result.text)
// }


// Tools
// With tools, you can allow the model to execute any arbitrary code, such as fetching data from an API or interacting with a database.
// const main = async () => {
//   const result = await generateText({
//     model: openai("gpt-4o"),
//     prompt: "What's 10 + 5?",
//     tools: {
//       addNumbers: tool({
//         description: "Add two numbers together",
//         parameters: z.object({
//           num1: z.number(),
//           num2: z.number(),
//         }),
//         execute: async ({ num1, num2 }) => {
//           return num1 + num2;
//         },
//       }),
//     },
//   });
//   console.log(result.toolResults);
// };

 
// const main = async () => {
//   const result = await generateText({
//     model: openai("gpt-4o"),
//     prompt: "What's 10 + 5?",
//     maxSteps: 2,
//     tools: {
//       addNumbers: tool({
//         description: "Add two numbers together",
//         parameters: z.object({
//           num1: z.number(),
//           num2: z.number(),
//         }),
//         execute: async ({ num1, num2 }) => {
//           return num1 + num2;
//         },
//       }),
//     },
//   });
//   console.log(result.steps.length);
//   console.log(result.text);
// };


/**
 * AI Execution Steps Summary
Step 1: Initial Tool Calls
Type: Initial step Action: Called weather tools for both cities

Tool Calls:

getWeather for Auckland, NZ

Latitude: -36.8485
Longitude: 174.7633
City: "Auckland"
getWeather for La Union, Philippines

Latitude: 16.6158
Longitude: 120.3123
City: "La Union"
Results:

Auckland Weather: 15.2°C, Weather Code: 61, Humidity: 77%
La Union Weather: 28.4°C, Weather Code: 3, Humidity: 82%
Token Usage: 171 tokens (96 prompt + 75 completion) Finish Reason: tool-calls

Step 2: Addition Tool Call
Type: Tool result processing Action: Added the two temperatures together

Tool Call:

addNumbers(15.2, 28.4)
Result:

Sum: 43.599999999999994
Token Usage: 263 tokens (239 prompt + 24 completion) Finish Reason: tool-calls

Step 3: Final Response
Type: Tool result processing Action: Generated final human-readable response

Final Answer: "The sum of the temperatures in Auckland, NZ (15.2°C) and La Union, Philippines (28.4°C) is approximately 43.6°C."

Token Usage: 313 tokens (278 prompt + 35 completion) Finish Reason: stop


 */
const main = async () => {
  const result = await generateText({
    // model: anthropic("claude-3-7-sonnet-20250219"),
    model: openai("gpt-4o"),
    prompt: `Get the weather in SF and NY, then add their temperatures together.`,
    maxSteps: 3,
    tools: {
      addNumbers: tool({
        description: 'Add two numbers together',
        parameters: z.object({
          num1: z.number(),
          num2: z.number(),
        }),
        execute: async ({ num1, num2 }) => {
          return num1 + num2
        },
      }),
      getWeather: tool({
        description: 'Get the current weather at a location',
        parameters: z.object({
          latitude: z.number(),
          longitude: z.number(),
          city: z.string(),
        }),
        execute: async ({ latitude, longitude, city }) => {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,relativehumidity_2m&timezone=auto`
          )
 
          const weatherData = await response.json()
          return {
            temperature: weatherData.current.temperature_2m,
            weatherCode: weatherData.current.weathercode,
            humidity: weatherData.current.relativehumidity_2m,
            city,
          }
        },
      }),
    },
    experimental_output: Output.object({
      schema: z.object({ sum: z.string() }),
    }),
  });
    

  console.log('🪵 Raw last step text:', result.steps[result.steps.length - 1]);
  console.log('Result experimental_output: ', result.experimental_output);
  
};


 
main();