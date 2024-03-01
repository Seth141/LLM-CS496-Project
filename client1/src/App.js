import { useState, useEffect } from 'react';
import './normal.css';
import './App.css';
import Header from './components/Header';
import { Helmet } from 'react-helmet';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-python';
import './prism.css';

function App() {
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [inputCount, setInputCount] = useState(0); // Track the number of inputs

  function clearChat() {
    setChatLog([]);
    setInputCount(0); // Reset input count for a new chat session
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextInputCount = inputCount + 1;
    setInputCount(nextInputCount); // Increment input count before processing

    if (nextInputCount === 1) {
      // First static message
      setChatLog([...chatLog, { user: "me", content: input }, { user: "gpt", content: "Try to be even more specific." }]);
    } else if (nextInputCount === 2) {
      // Second static message
      setChatLog([...chatLog, { user: "me", content: input }, { user: "gpt", content: "Last step, add more helpful details in your prompt." }]);
    } else {
      // Process the input normally from the third message onwards
      const chatLogNew = [...chatLog, { user: "me", content: input }];

      try {
        const response = await fetch("http://localhost:3080/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ message: input })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setChatLog([...chatLogNew, { user: "gpt", content: data.message.content }]);
      } catch (error) {
        console.error("Fetch error: " + error.message);
      } finally {
        setInput(""); // Clearing the input field
      }
    }
    setInput(""); // Ensure input is cleared after each submission
  }

  return (
    <div className="App">
      <Header />
      <Helmet>
        <title>Chat Application</title>
      </Helmet>
      
      {/* Chat card */}
      <div className="chat-card glass">
        {/* Chat log */}
        <div className="chat-log">
          {chatLog.map((chatMessage, index) => (
            <ChatMessage key={index} message={chatMessage} />
          ))}
        </div>
      </div>

      <div className="chat-input-holder">
        <form onSubmit={handleSubmit}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="chat-input-textarea glass"
            placeholder="Type your message here"
            rows="1"
          />
        </form>
      </div>

      <div className="new-chat-button" onClick={clearChat}>
        <button>+ New</button>
      </div>
    </div>
  );
}

function ChatMessage({ message }) {
  const messageIsCode = message.user === "gpt" && message.content.startsWith("```");

  // This effect will run when the component mounts and whenever the message changes.
  useEffect(() => {
    // Immediately apply syntax highlighting to the code blocks.
    if (messageIsCode) {
      Prism.highlightAll();
    }
  }, [message]); // Dependency array with message ensures the effect runs when message updates.

  // Detect and format the code content.
  const formattedContent = messageIsCode ? formatCode(message.content) : message.content;

  return (
    <div className={`chat-message glass ${message.user === "gpt" ? "chatgpt" : ""}`}>
      <div className="chat-message-center glass">
        <div className={`avatar ${message.user === "gpt" ? "chatgpt" : ""}`}></div>
        <div className="message">
          {messageIsCode ? (
            <pre className="language-"><code dangerouslySetInnerHTML={{ __html: formattedContent }} /></pre>
          ) : (
            <div>{message.content}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to strip the backticks and format the code.
function formatCode(content) {
  const languageRegex = /```(\w+)\s([\s\S]*?)```/; // Regex to extract language and code.
  const matches = content.match(languageRegex);
  if (matches && matches[1] && matches[2]) {
    const language = matches[1].toLowerCase();
    const code = matches[2];
    if (Prism.languages[language]) {
      return Prism.highlight(code, Prism.languages[language], language);
    }
  }
  return content; // Return unformatted if no match or language not supported.
}

export default App;