import { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import './styles.css';

const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const codeText = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return !inline && match ? (
    <div className="code-block-container">
      <div className="code-block-header">
        <span>{match[1]}</span>
        <button onClick={handleCopy} className="copy-code-btn">
          {isCopied ? <FiCheck /> : <FiCopy />}
          {isCopied ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
      <pre {...props} className="code-block-pre">
        <code>{children}</code>
      </pre>
    </div>
  ) : (
    <code {...props} className={className}>
      {children}
    </code>
  );
};

export default CodeBlock;
