import { useState, useCallback } from 'react';

/**
 * Hook customizado para gerenciar estado de modais com animação
 * @param {string} modalName - Nome do modal para debug
 * @param {number} closeDelay - Tempo de delay para fechar (ms)
 * @returns {Object} Estado e funções do modal
 */
export function useModal(modalName = 'Modal', closeDelay = 500) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  console.log(`[useModal:${modalName}] Hook inicializado`);

  /**
   * Abre o modal
   */
  const open = useCallback(() => {
    console.log(`[useModal:${modalName}] Abrindo modal`);
    setIsVisible(true);
    setIsClosing(false);
  }, [modalName]);

  /**
   * Fecha o modal com animação
   */
  const close = useCallback(() => {
    console.log(`[useModal:${modalName}] Iniciando fechamento do modal`);
    setIsClosing(true);
    
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      console.log(`[useModal:${modalName}] Modal fechado completamente`);
    }, closeDelay);
  }, [modalName, closeDelay]);

  /**
   * Toggle do modal (abre se fechado, fecha se aberto)
   */
  const toggle = useCallback(() => {
    console.log(`[useModal:${modalName}] Toggle chamado. Estado atual: ${isVisible ? 'aberto' : 'fechado'}`);
    
    if (isVisible) {
      close();
    } else {
      open();
    }
  }, [isVisible, open, close, modalName]);

  return {
    isVisible,
    isClosing,
    open,
    close,
    toggle
  };
}

export default useModal;