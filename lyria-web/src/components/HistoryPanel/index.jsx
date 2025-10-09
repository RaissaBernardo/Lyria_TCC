import { FiX, FiTrash2 } from "react-icons/fi";

const HistoryPanel = ({
  isVisible,
  onClose,
  conversations,
  loadChat,
  deleteChat,
}) => {
  return (
    <aside className={`history-panel ${isVisible ? "visible" : ""}`}>
      <div className="history-header">
        <h2>Histórico de Conversas</h2>
        <button onClick={onClose} className="header-icon-btn">
          <FiX />
        </button>
      </div>
      <div className="history-list">
        {conversations.length > 0 ? (
          conversations.map((chat) => (
            <div key={chat.id} className="history-item-container">
              <div className="history-item" onClick={() => loadChat(chat.id)}>
                {chat.titulo || "Conversa sem título"}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.id);
                }}
                className="delete-history-btn"
              >
                <FiTrash2 />
              </button>
            </div>
          ))
        ) : (
          <p className="no-history-text">Nenhuma conversa ainda.</p>
        )}
      </div>
    </aside>
  );
};

export default HistoryPanel;
