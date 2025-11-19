import { useEffect } from 'react';

/**
 * Hook para corrigir altura da viewport em mobile
 * Resolve problemas com teclado virtual e barras de navegação
 */
export function useViewportHeight() {
  useEffect(() => {
    // Função para atualizar a altura real da viewport
    const setViewportHeight = () => {
      // Usa visualViewport se disponível (melhor para mobile)
      const vh = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
    };

    // Executa imediatamente
    setViewportHeight();

    // Escuta mudanças no viewport (teclado virtual, orientação, etc)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', setViewportHeight);
      window.visualViewport.addEventListener('scroll', setViewportHeight);
    }

    // Fallback para eventos de window
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);

    // Cleanup
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', setViewportHeight);
        window.visualViewport.removeEventListener('scroll', setViewportHeight);
      }
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);
}

export default useViewportHeight;