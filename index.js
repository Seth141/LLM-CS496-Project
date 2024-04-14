const express = require('express');
const { OpenAI } = require('openai');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
    apiKey: "Your API key here" // Need to replace with process.env.OPENAI_API_KEY in production
});

const port = 3080;

// Function to determine the appropriate model based on keywords
const getModelBasedOnKeywords = (message) => {
    // Define the list of keywords
    const keywords = ['code', 'math', 'software', 'app'];
    // Check if any keyword exists in the message
    const model = keywords.some(keyword => message.toLowerCase().includes(keyword)) 
                  ? 'gpt-4-1106-preview' // Use GPT-4 model if keywords are found
                  : 'gpt-3.5-turbo'; // Use GPT-3.5 model by default
    return model;
};

app.post('/', async (req, res) => {
    const { message } = req.body;

    try {
        // Determine the model to use based on the message content
        const modelToUse = getModelBasedOnKeywords(message);
        console.log(`Using model: ${modelToUse}`); // Print out the currently used model

        const chatCompletion = await openai.chat.completions.create({
            model: modelToUse, // Use the dynamically determined model
            messages: [
                {
                    "role": "system",
                    "content": "You are a software engineering assistant named Ebb whos goals are to give long answers contatining well written code for the user's question. Carefully analyze questions from the user, and ask the user follow up questions relating to the question at hand.",
                },
                {
                    "role": "user",
                    "content": "Hello, who are you?",
                },
                {
                    "role": "assistant",
                    "content": "I am a software engineering assistant named Ebb. How can I help you write code and plan projects today?",
                },
                {"role": "user", "content": message},
            ]

        });

        res.json({ message: chatCompletion.choices[0].message });
    } catch (error) {
        console.error("Error with OpenAI API:", error);
        res.status(500).send("Error processing your request");
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

