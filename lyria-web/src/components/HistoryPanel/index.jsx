import { useState } from "react"; 
import { FiX, FiTrash2 } from "react-icons/fi";
import ConfirmationModal from "../ConfirmationModal"; 

const HistoryPanel = ({
  isVisible,
  onClose,
  conversations,
  loadChat,
  deleteChat,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conversationToDeleteId, setConversationToDeleteId] = useState(null);

  const handleDeleteClick = (chatId) => {
    console.log(`Id para o handle delete click: ${chatId}`)
    setConversationToDeleteId(chatId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (conversationToDeleteId) {
      deleteChat(conversationToDeleteId);
    }
    setIsModalOpen(false);
    setConversationToDeleteId(null); 
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
    setConversationToDeleteId(null);
  };

  return (
    <>
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
                    handleDeleteClick(chat.id);
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

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Conversa"
        message="Tem certeza que deseja excluir esta conversa? Esta ação não poderá ser desfeita."
      />
    </>
  );
};

export default HistoryPanel;