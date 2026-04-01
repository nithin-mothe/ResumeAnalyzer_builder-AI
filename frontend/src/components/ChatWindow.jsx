function renderMessageContent(content) {
  return String(content || "")
    .split("\n")
    .filter(Boolean)
    .map((line, index) => {
      const isBullet = /^[-*]\s+/.test(line.trim()) || /^\d+\.\s+/.test(line.trim());
      return (
        <p key={`${line}-${index}`} className={isBullet ? "chat-line chat-line--bullet" : "chat-line"}>
          {line}
        </p>
      );
    });
}

function ChatWindow({
  messages,
  pending,
  onSubmit,
  inputValue,
  onInputChange,
  starterPrompts = [],
  onStarterSelect,
}) {
  return (
    <section className="chat-window">
      {starterPrompts.length ? (
        <div className="starter-row">
          {starterPrompts.map((prompt) => (
            <button key={prompt} type="button" className="starter-chip" onClick={() => onStarterSelect(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
      ) : null}
      <div className="chat-messages">
        {messages.map((message, index) => (
          <article
            key={`${message.role}-${index}`}
            className={`chat-bubble ${message.role === "assistant" ? "assistant" : "user"}`}
          >
            <span className="chat-role">{message.role === "assistant" ? "Resume AI" : "You"}</span>
            <div className="chat-content">{renderMessageContent(message.content)}</div>
          </article>
        ))}
        {pending ? <p className="muted">AI is thinking...</p> : null}
      </div>
      <form className="chat-form" onSubmit={onSubmit}>
        <textarea
          name="message"
          rows="3"
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="Ask about your resume, targeting, interview preparation, or ask the assistant to generate a draft."
        />
        <button type="submit" className="primary-button">
          Send
        </button>
      </form>
    </section>
  );
}

export default ChatWindow;
