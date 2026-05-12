import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'success' | 'dark'; // Adicionei 'dark' para o novo tema
}

export default function Button({ title, variant = 'primary', ...rest }: ButtonProps) {
  // Configurações padrão para o tema Fatec/Impacto antigo
  const baseClassesOld = "p-4 rounded-2xl shadow-lg";
  const bgColorOld = variant === 'primary' ? 'bg-red-600 shadow-red-300' : 'bg-green-600 shadow-green-300';
  const textClassesOld = "text-center font-bold text-lg";

  // Configurações para o NOVO TEMA ESCURO profissional (Imagem 1)
  // Cantos ligeiramente arredondados (rounded-lg) e preenchimento maior (p-5)
  const darkClasses = "w-full bg-red-600 p-5 rounded-lg";
  const darkTextClasses = "text-center font-bold text-base text-white uppercase";

  // Retorna o botão com o estilo novo se a variante for 'dark'
  if (variant === 'dark') {
    return (
      <TouchableOpacity className={darkClasses} {...rest}>
        <Text className={darkTextClasses}>{title}</Text>
      </TouchableOpacity>
    );
  }

  // Mantém a compatibilidade com o tema antigo se preferir
  return (
    <TouchableOpacity 
      className={`${baseClassesOld} ${bgColorOld}`}
      {...rest}
    >
      <Text className={`text-white ${textClassesOld}`}>{title}</Text>
    </TouchableOpacity>
  );
}