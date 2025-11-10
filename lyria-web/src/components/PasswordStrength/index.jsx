import React from 'react';
import './styles.css';

const PasswordStrength = ({ password }) => {
  const checks = [
    { label: 'Pelo menos 8 caracteres', pattern: /.{8,}/ },
    { label: 'Pelo menos uma letra maiúscula', pattern: /[A-Z]/ },
    { label: 'Pelo menos uma letra minúscula', pattern: /[a-z]/ },
    { label: 'Pelo menos um número', pattern: /\d/ },
    { label: 'Pelo menos um caractere especial', pattern: /[^A-Za-z0-9]/ },
  ];

  return (
    <div className="password-strength-tooltip">
      <p>A senha deve conter:</p>
      <ul>
        {checks.map((check, index) => (
          <li key={index} className={check.pattern.test(password) ? 'valid' : ''}>
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrength;
