import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';

// Definindo as propriedades que nosso botão vai aceitar
interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'success';
}

export default function Button({ title, variant = 'primary', ...rest }: ButtonProps) {
  // Define a cor baseada na variante escolhida
  const bgColor = variant === 'primary' ? 'bg-red-600 shadow-red-300' : 'bg-green-600 shadow-green-300';

  return (
    <TouchableOpacity 
      className={`${bgColor} p-4 rounded-2xl shadow-lg`}
      {...rest} // Repassa outras props (como onPress, disabled, etc)
    >
      <Text className="text-white text-center font-bold text-lg">{title}</Text>
    </TouchableOpacity>
  );
}