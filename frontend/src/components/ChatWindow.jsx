import { SendHorizontal, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { AiProcessingPanel, itemVariants, listVariants, motionTokens } from "./MotionSystem";

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
    <motion.section
      className="chat-window"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={motionTokens.spring}
    >
      {starterPrompts.length ? (
        <motion.div className="starter-row" variants={listVariants} initial="hidden" animate="visible">
          {starterPrompts.map((prompt) => (
            <motion.button
              key={prompt}
              type="button"
              className="starter-chip"
              onClick={() => onStarterSelect(prompt)}
              variants={itemVariants}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={motionTokens.spring}
            >
              <Sparkles size={15} aria-hidden="true" />
              {prompt}
            </motion.button>
          ))}
        </motion.div>
      ) : null}
      <motion.div className="chat-messages" variants={listVariants} initial="hidden" animate="visible">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.article
              key={`${message.role}-${index}`}
              className={`chat-bubble ${message.role === "assistant" ? "assistant" : "user"}`}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -8 }}
              layout
            >
              <span className="chat-role">{message.role === "assistant" ? "Resume AI" : "You"}</span>
              <div className="chat-content">{renderMessageContent(message.content)}</div>
            </motion.article>
          ))}
          {pending ? (
            <AiProcessingPanel
              key="chat-thinking"
              title="Resume AI is thinking"
              stages={["Reading context...", "Finding leverage points...", "Drafting response...", "Checking clarity..."]}
              tone="brain"
              compact
            />
          ) : null}
        </AnimatePresence>
      </motion.div>
      <form className="chat-form" onSubmit={onSubmit}>
        <textarea
          name="message"
          rows="3"
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="Ask about your resume, targeting, interview preparation, or ask the assistant to generate a draft."
        />
        <motion.button type="submit" className="primary-button" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
          <SendHorizontal size={18} aria-hidden="true" />
          Send
        </motion.button>
      </form>
    </motion.section>
  );
}

export default ChatWindow;
