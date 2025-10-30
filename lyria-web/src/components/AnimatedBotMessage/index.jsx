import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "../CodeBlock";

function AnimatedBotMessage({
  fullText,
  animate = true,
  onTypingEnd,
  isLastMessage,
  isScrolling,
}) {
  const [text, setText] = useState(animate ? "" : fullText);
  const messageRef = useRef(null);

  useEffect(() => {
    if (isScrolling && messageRef.current) {
      const parent = messageRef.current.parentElement;
      if (parent) {
        parent.scrollTop = parent.scrollHeight;
      }
    }
  }, [text, isScrolling]);

  useEffect(() => {
    if (!animate) {
      setText(fullText);
      if (isLastMessage && onTypingEnd) {
        onTypingEnd();
      }
      return;
    }

    let timeoutId;
    const typeCharacter = (currentIndex) => {
      if (currentIndex > fullText.length) {
        if (isLastMessage && onTypingEnd) {
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
  }, [fullText, animate, isLastMessage, onTypingEnd]);

  return (
    <div className="message bot message-animated" ref={messageRef}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
        {text}
      </ReactMarkdown>
    </div>
  );
}

export default AnimatedBotMessage;
