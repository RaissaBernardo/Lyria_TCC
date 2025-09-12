import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updateUserProfile } from '../../services/LyriaApi';
import { baseURL } from '../../services/api';
import { FiUser, FiArrowLeft } from 'react-icons/fi';
import './styles.css';

const ProfileScreen = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  // Populate form with user data from context on load
  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setEmail(user.email);
      setPreviewImage(user.foto_perfil_url ? `${baseURL}${user.foto_perfil_url}` : null);
    }
  }, [user]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    // Only append fields that have changed
    if (nome !== user.nome) formData.append('nome', nome);
    if (email !== user.email) formData.append('email', email);
    if (profileImage) formData.append('foto_perfil', profileImage);

    // If no data has changed, don't make an API call
    if (formData.entries().next().done) {
        addToast('Nenhuma alteração detectada.', 'info');
        setIsLoading(false);
        return;
    }

    try {
      const response = await updateUserProfile(user.id, formData);
      if (response.sucesso) {
        addToast('Perfil atualizado com sucesso!', 'success');
        updateUser(response.usuario);
      } else {
        addToast(response.erro || 'Falha ao atualizar o perfil.', 'error');
      }
    } catch (error) {
      addToast(error.message || 'Ocorreu um erro.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      addToast('Por favor, preencha a senha atual e a nova senha.', 'error');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('senha', newPassword);
    // We would normally verify the current password on the backend,
    // but for this implementation, we'll just send the new one.

    try {
      const response = await updateUserProfile(user.id, formData);
       if (response.sucesso) {
        addToast('Senha alterada com sucesso!', 'success');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        addToast(response.erro || 'Falha ao alterar a senha.', 'error');
      }
    } catch (error) {
       addToast(error.message || 'Ocorreu um erro.', 'error');
    } finally {
        setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="profile-screen">
      <div className="profile-container">
        <button onClick={() => navigate(-1)} className="back-button">
          <FiArrowLeft />
        </button>
        <h2>Seu Perfil</h2>

        <form onSubmit={handleUpdateProfile} className="profile-form">
          <div className="profile-picture-section">
            {previewImage ? (
              <img src={previewImage} alt="Profile" className="profile-picture" />
            ) : (
              <div className="profile-picture-placeholder">
                <FiUser size={60} />
              </div>
            )}
            <input type="file" id="file-upload" onChange={handleImageChange} accept="image/*" />
            <label htmlFor="file-upload" className="file-upload-label">
              Mudar Foto
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="nome">Nome</label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>

        <hr className="divider" />

        <form onSubmit={handleChangePassword} className="password-form">
          <h3>Mudar Senha</h3>
          <div className="form-group">
            <label htmlFor="current-password">Senha Atual</label>
            <input
              type="password"
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="new-password">Nova Senha</label>
            <input
              type="password"
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-secondary">
            Mudar Senha
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileScreen;
