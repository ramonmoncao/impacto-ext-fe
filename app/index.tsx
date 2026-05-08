import React, { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';

// 1. Importe o botão que acabamos de criar
import Button from '../components/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await api.post('/auth/login', { 
        email: email, 
        senha: password 
      });
      
      console.log('Token recebido:', response.data.token);
      router.push('/orcamento'); 
    } catch (error) {
      Alert.alert("Erro de Autenticação", "Verifique suas credenciais.");
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-white">
      <View className="items-center mb-10">
        <Text className="text-4xl font-bold text-red-600">IMPACTO</Text>
        <Text className="text-lg text-slate-500 font-medium">Extintores</Text>
      </View>

      <Text className="text-slate-600 mb-2 font-semibold">E-mail</Text>
      <TextInput 
        className="bg-slate-100 p-4 rounded-xl mb-4 border border-slate-200"
        placeholder="tecnico@impacto.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <Text className="text-slate-600 mb-2 font-semibold">Senha</Text>
      <TextInput 
        className="bg-slate-100 p-4 rounded-xl mb-6 border border-slate-200"
        placeholder="********"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* 2. Usando o nosso Componente de Botão */}
      <Button 
        title="Acessar Sistema" 
        onPress={handleLogin} 
        variant="primary" 
      />
    </View>
  );
}