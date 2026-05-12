// 1. Importando o React para tirar o erro do <Slot />
import React from 'react'; 

// 2. Usando um comentário especial para o TypeScript parar de chorar com o CSS
// @ts-ignore
import '../global.css'; 

import { Slot } from 'expo-router';

export default function Layout() {
  return <Slot />;
}