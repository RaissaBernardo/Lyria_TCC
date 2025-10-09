import { RiRobot2Line } from "react-icons/ri";

const PromptSuggestions = ({ onSuggestionClick }) => (
  <div className="suggestions-container">
    <div className="lyria-icon-large">
      <RiRobot2Line />
    </div>
    <h2>Como posso ajudar hoje?</h2>
    <div className="suggestions-grid">
      <div
        className="suggestion-card"
        onClick={() => onSuggestionClick("Quem é você?")}
      >
        <p>
          <strong>Quem é você?</strong>
        </p>
        <span>Descubra a identidade da LyrIA</span>
      </div>
      <div
        className="suggestion-card"
        onClick={() => onSuggestionClick("Qual a melhor turma do SENAI?")}
      >
        <p>
          <strong>Qual a melhor turma?</strong>
        </p>
        <span>Uma pergunta capciosa...</span>
      </div>
      <div
        className="suggestion-card"
        onClick={() =>
          onSuggestionClick("Me dê uma ideia para um projeto React")
        }
      >
        <p>
          <strong>Ideia de projeto</strong>
        </p>
        <span>Para inspirar sua criatividade</span>
      </div>
      <div
        className="suggestion-card"
        onClick={() => onSuggestionClick("Como você funciona?")}
      >
        <p>
          <strong>Como você funciona?</strong>
        </p>
        <span>Explore os bastidores da IA</span>
      </div>
    </div>
  </div>
);

export default PromptSuggestions;
