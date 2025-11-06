import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "../CodeBlock"; // Import the new component

function AnimatedBotMessage({ fullText, animate = true, onTyping }) {
  const [text, setText] = useState(animate ? "" : fullText);

  useEffect(() => {
    if (!animate) {
      setText(fullText);
      if (onTyping) onTyping();
      return;
    }

    let timeoutId;
    const typeCharacter = (currentIndex) => {
      if (currentIndex > fullText.length) {
        return;
      }
      setText(fullText.slice(0, currentIndex));
      if (onTyping) onTyping();
      timeoutId = setTimeout(() => {
        typeCharacter(currentIndex + 1);
      }, 25);
    };

    typeCharacter(0);

    return () => clearTimeout(timeoutId);
  }, [fullText, animate, onTyping]);

  return (
    <div className="message bot message-animated">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

export default AnimatedBotMessage;
