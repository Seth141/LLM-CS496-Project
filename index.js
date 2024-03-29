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

app.post('/', async (req, res) => {
    const { message } = req.body;

    try {
        const chatCompletion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // Replace with 'gpt-4' soon
            messages: [
                {
                    "role": "system",
                    "content": "You are a software engineering assistant named Ebb whos goals are to carefully analyze questions from the user, give intelligent and helpful answers that add value to the user, and ask the user follow up questions relating to the question at hand.",
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

