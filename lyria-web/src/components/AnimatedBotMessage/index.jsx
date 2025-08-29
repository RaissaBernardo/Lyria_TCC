import { useState, useEffect } from "react";

function AnimatedBotMessage({ fullText }) {
  const [text, setText] = useState("");

  useEffect(() => {
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
  }, [fullText]);

  return <div className="message bot message-animated">{text}</div>;
}

export default AnimatedBotMessage;
