import { useState, useEffect, useRef } from 'react';
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
import exampleImage0 from './example-0.png';
import exampleImage1 from './example-1.png';
import exampleImage2 from './example-2.png';

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const firstInputResponses = shuffleArray([
  "Try to be even more specific.",
  "Can you provide more details?",
  "Please elaborate further.",
  "Expand your query for a clearer response."
]);

const secondInputResponses = shuffleArray([
  "Last step, add more helpful details in your prompt.",
  "Almost there, just a bit more detail needed.",
  "You're close! Add some more specifics.",
  "Nearly there—enhance your query with additional information."
]);

function App() {
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [inputCount, setInputCount] = useState(0);
  const chatLogRef = useRef(null);
  const [showExamples, setShowExamples] = useState(false);

  useEffect(() => {
    if (chatLogRef.current) {
      const scroll = () => {
        chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
      };

      requestAnimationFrame(() => {
        // Painting the DOM before we scroll here: 
        requestAnimationFrame(scroll);
      });
    }
  }, [chatLog]);

  function clearChat() {
    setChatLog([]);
    setInputCount(0);
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
    setInputCount(nextInputCount);

    if (nextInputCount === 1) {
      setChatLog([...chatLog, { user: "me", content: input }, { user: "gpt", content: firstInputResponses[0] }]);
    } else if (nextInputCount === 2) {
      setChatLog([...chatLog, { user: "me", content: input }, { user: "gpt", content: secondInputResponses[0] }]);
    } else {
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
        setInput("");
      }
    }
    setInput("");
  }

  return (
    <div className="App">
      <Header />
      <Helmet>
        <title>Chat Application</title>
      </Helmet>

      <div className="chat-card glass">
        <div className="chat-log" ref={chatLogRef}>
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
            placeholder="Ask Ebb a question"
            rows="1"
          />
        </form>
      </div>

      <button className="new-button" onClick={clearChat}>New</button>

      {/* Examples Button */}
      <button className="examples-button" onClick={() => setShowExamples(true)}>Examples</button>

      {/* Examples Container */}

      {/*Need to replace the text on the cards with images of examples (white)*/}
      {showExamples && (
        <div className="examples-container">
          <div className="examples-content">
            <div className="examples-close" onClick={() => setShowExamples(false)}>×</div>
            <div className="example-card"><img src={exampleImage0} alt="Example 1" /></div>
            <div className="example-card"><img src={exampleImage1} alt="Example 2" /></div>
            <div className="example-card"><img src={exampleImage2} alt="Example 3" /></div>
          </div>
        </div>
      )}

    </div>
  );
}

function ChatMessage({ message }) {
  useEffect(() => {
    if (message.user === "gpt" && message.content.startsWith("```")) {
      Prism.highlightAll();
    }
  }, [message]);

  const messageIsCode = message.user === "gpt" && message.content.startsWith("```");
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

function formatCode(content) {
  const languageRegex = /```(\w+)\s([\s\S]*?)```/;
  const matches = content.match(languageRegex);
  if (matches && matches[1] && matches[2]) {
    const language = matches[1].toLowerCase();
    const code = matches[2];
    if (Prism.languages[language]) {
      return Prism.highlight(code, Prism.languages[language], language);
    }
  }
  return content;
}

export default App;
