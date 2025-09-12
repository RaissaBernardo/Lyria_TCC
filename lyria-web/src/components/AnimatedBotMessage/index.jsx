import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "../CodeBlock"; // Import the new component

function AnimatedBotMessage({ fullText, animate = true }) {
  const [text, setText] = useState(animate ? "" : fullText);

  useEffect(() => {
    if (!animate) {
      setText(fullText);
      return;
    }

    let timeoutId;
    const typeCharacter = (currentIndex) => {
      if (currentIndex > fullText.length) {
        return;
      }
      setText(fullText.slice(0, currentIndex));
      timeoutId = setTimeout(() => {
        typeCharacter(currentIndex + 1);
      }, 25);
    };

    typeCharacter(0);

    return () => clearTimeout(timeoutId);
  }, [fullText, animate]);

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
