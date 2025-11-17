import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Galaxy from '../Galaxy/Galaxy';
import './styles.css';

function GalaxyLayout() {
  useEffect(() => {
    // CRÍTICO: Previne problemas de viewport no mobile
    const preventViewportBugs = () => {
      // Define altura correta do viewport
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Executa na montagem
    preventViewportBugs();

    // Atualiza em resize (importante para mobile quando o teclado aparece)
    window.addEventListener('resize', preventViewportBugs);
    
    // Previne scroll do body
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('resize', preventViewportBugs);
    };
  }, []);

  return (
    <div className="galaxy-layout-container">
      <div className="galaxy-layout-background">
        <Galaxy
          mouseRepulsion={false}
          mouseInteraction={false}
          density={1}
          glowIntensity={0.7}
          saturation={1.0}
          hueShift={210}
        />
      </div>
      <div className="galaxy-layout-content">
        <Outlet />
      </div>
    </div>
  );
}

export default GalaxyLayout;