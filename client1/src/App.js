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
        // This ensures that the browser paints the DOM before we scroll
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
      setChatLog([...chatLog, { user: "me", content: input }, { user: "gpt", content: "Try to be even more specific." }]);
    } else if (nextInputCount === 2) {
      setChatLog([...chatLog, { user: "me", content: input }, { user: "gpt", content: "Last step, add more helpful details in your prompt." }]);
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
            placeholder="Type your message here"
            rows="1"
          />
        </form>
      </div>

      
      <button className="new-button" onClick={clearChat}>New</button>
      

      {/* Examples Button */}
      <button className="examples-button" onClick={() => setShowExamples(true)}>Examples</button>

      {/* Examples Container */}
      {showExamples && (
        <div className="examples-container">
          <div className="examples-content">
            {/* Close button should be the first element inside examples-content for clarity */}
            <div className="examples-close" onClick={() => setShowExamples(false)}>×</div>
            <div className="example-card">Card 1 Content</div>
            <div className="example-card">Card 2 Content</div>
            <div className="example-card">Card 3 Content</div>
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
