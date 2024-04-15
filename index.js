const express = require('express');
const { OpenAI } = require('openai');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
    apiKey: "/*Your API key here*/" // Need to replace with process.env.OPENAI_API_KEY in production
});


const port = 3080;

// Message queue to store the last 3 interactions
const messageQueue = [];

// Function to update the message queue
function updateMessageQueue(userMessage, responseMessage) {
    // Ensure messages are non-empty and are strings
    if (typeof userMessage === 'string' && userMessage.trim() !== '') {
        messageQueue.push({ role: 'user', content: userMessage.trim() });
    }
    if (typeof responseMessage === 'string' && responseMessage.trim() !== '') {
        messageQueue.push({ role: 'assistant', content: responseMessage.trim() });
    }

    // Keep only the last 6 messages (3 interactions)
    while (messageQueue.length > 6) {
        messageQueue.shift();
    }
}

// Function to determine the appropriate model based on keywords
const getModelBasedOnKeywords = (message) => {
    const keywords = ['code', 'math', 'software', 'app'];
    return keywords.some(keyword => message.toLowerCase().includes(keyword)) 
                  ? 'gpt-4-1106-preview'
                  : 'gpt-3.5-turbo';
};

app.post('/', async (req, res) => {
    const { message } = req.body;

    try {
        const modelToUse = getModelBasedOnKeywords(message);
        console.log(`Using model: ${modelToUse}`);

        // Log messages to be sent
        console.log("Messages to send:", JSON.stringify(messageQueue.concat([{ role: 'user', content: message }]), null, 2));

        const chatCompletion = await openai.chat.completions.create({
            model: modelToUse,
            messages: [
                {
                    "role": "system",
                    "content": "You are a software engineering assistant named Ebb whose goals are to give long answers containing well-written code for the user's question. Carefully analyze questions from the user, and ask the user follow up questions relating to the question at hand.",
                },
                ...messageQueue,
                { "role": "user", "content": message },
            ]
        });

        const responseMessage = chatCompletion.choices[0].message;

        updateMessageQueue(message, responseMessage);
        console.log("Current Message Queue:", messageQueue);

        res.json({ message: responseMessage });
    } catch (error) {
        console.error("Error with OpenAI API:", error);
        res.status(500).send("Error processing your request");
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});