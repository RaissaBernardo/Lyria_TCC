import { Outlet } from 'react-router-dom';
import Galaxy from '../Galaxy/Galaxy';
import './styles.css';

function GalaxyLayout() {
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
      {/* Adicionamos um wrapper para o conteúdo */}
      <div className="galaxy-layout-content">
        <Outlet />
      </div>
    </div>
  );
}

export default GalaxyLayout;