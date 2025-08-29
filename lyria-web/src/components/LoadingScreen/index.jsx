import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import Galaxy from '../../components/Galaxy/Galaxy'; // <--- REMOVIDO
import './Styles/styles.css';

function LoadingScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/chat');
    }, 2000); // Redireciona após 3 segundos

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="loading-container">
      {/* O <Galaxy /> foi removido daqui porque o GalaxyLayout já o fornece */}
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h1>PREPARANDO A IMERSÃO...</h1>
        <p>Carregando o universo LyrIA para você.</p>
      </div>
    </div>
  );
}

export default LoadingScreen;