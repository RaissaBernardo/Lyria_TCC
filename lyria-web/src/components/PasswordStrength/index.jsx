import React from 'react';
import './styles.css';

const PasswordStrength = ({ password }) => {
  const checks = [
    { label: 'A senha deve ter pelo menos 8 caracteres.', pattern: /.{8,}/ },
    { label: 'A senha precisa de pelo menos uma letra maiúscula.', pattern: /[A-Z]/ },
    { label: 'A senha precisa de pelo menos um número.', pattern: /\d/ },
    { label: 'A senha precisa de pelo menos um caractere especial (!, @, #, etc.).', pattern: /[^A-Za-z0-9]/ },
  ];

  return (
    <div className="password-strength-tooltip">
      <ul>
        {checks.map((check, index) => {
          const isValid = check.pattern.test(password);
          return (
            <li key={index} className={isValid ? 'valid' : 'invalid'}>
              {isValid ? '✅' : '❌'} {check.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PasswordStrength;
