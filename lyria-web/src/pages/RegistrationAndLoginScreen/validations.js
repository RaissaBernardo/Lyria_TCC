export const validatePassword = (senha) => {
  const errors = [];
  if (senha.length < 8) {
    errors.push("A senha deve ter pelo menos 8 caracteres.");
  }
  if (!/[A-Z]/.test(senha)) {
    errors.push("A senha precisa de pelo menos uma letra maiúscula.");
  }
  if (!/[a-z]/.test(senha)) {
    errors.push("A senha deve conter pelo menos uma letra minúscula.");
  }
  if (!/\d/.test(senha)) {
    errors.push("A senha precisa de pelo menos um número.");
  }
  if (!/[^A-Za-z0-9]/.test(senha)) {
    errors.push("A senha precisa de pelo menos um caractere especial (!, @, #, etc.).");
  }
  return errors;
};

export const validateConfirmPassword = (senha, confirmarSenha) => {
  if (senha !== confirmarSenha) {
    return "As senhas não coincidem.";
  }
  return "";
};
