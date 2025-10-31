function HeroSection({ onStartClick, onLearnMoreClick }) {
  
  console.log('[HeroSection] Componente renderizado');

  const handleStart = () => {
    console.log('[HeroSection] Botão "Começar" clicado');
    onStartClick();
  };

  const handleLearnMore = () => {
    console.log('[HeroSection] Botão "Saiba Mais" clicado');
    onLearnMoreClick();
  };

  return (
    <div className="main-content">
      <div id="frase_efeito">
        <b>Conheça LyrIA</b>
      </div>
      
      <span id="espaço"></span>
      
      <div className="botoes-container">
        <button id="comecar" onClick={handleStart}>
          Começar
        </button>
        <button id="sobre" onClick={handleLearnMore}>
          Saiba Mais
        </button>
      </div>
    </div>
  );
}

export default HeroSection;