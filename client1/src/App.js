import './normal.css';
import './App.css';
import Header from './components/Header';
import { Helmet } from 'react-helmet';
import { useState } from 'react';

function App() {
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([]);

  function clearChat() {
    setChatLog([]);
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
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
      setInput(""); // Clearing our input field
    }
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

const ChatMessage = ({ message }) => {
  return (
    <div className={`chat-message glass ${message.user === "gpt" ? "chatgpt" : ""}`}>
      <div className="chat-message-center glass">
        <div className={`avatar ${message.user === "gpt" ? "chatgpt" : ""}`}></div>
        <div className="message">
          {message.content}
        </div>
      </div>
    </div>
  );
}

export default App;