import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "../CodeBlock";

function AnimatedBotMessage({ fullText, animate = true, onTypingEnd }) {
  const [text, setText] = useState(animate ? "" : fullText);
  const messageRef = useRef(null);

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "auto", block: "nearest" });
    }
  }, [text]);

  useEffect(() => {
    if (!animate) {
      setText(fullText);
      if (onTypingEnd) {
        onTypingEnd();
      }
      return;
    }

    let timeoutId;
    const typeCharacter = (currentIndex) => {
      if (currentIndex > fullText.length) {
        if (onTypingEnd) {
          onTypingEnd();
        }
        return;
      }
      setText(fullText.slice(0, currentIndex));
      timeoutId = setTimeout(() => {
        typeCharacter(currentIndex + 1);
      }, 25);
    };

    typeCharacter(0);

    return () => clearTimeout(timeoutId);
  }, [fullText, animate, onTypingEnd]);

  return (
    <div className="message bot message-animated" ref={messageRef}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
        {text}
      </ReactMarkdown>
    </div>
  );
}

export default AnimatedBotMessage;
