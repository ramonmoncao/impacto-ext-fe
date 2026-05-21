import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StatusBar, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import api from '../services/api'; // Importando a conexão com o back-end

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    // 1. Validação simples para não enviar dados vazios
    if (!email || !password) {
      Alert.alert("Atenção", "Por favor, preencha o usuário e a senha.");
      return;
    }

    try {
      // 2. Faz a requisição POST para o Spring Boot
      // O endpoint final será http://192.168.0.243:8080/api/auth/login
      const response = await api.post('/auth/login', {
        email: email,
        senha: password // Mapeando 'password' do front para 'senha' do back
      });

      // 3. Se o login for bem-sucedido (Status 200 OK)
      if (response.status === 200) {
        // Pega o token gerado pelo AuthResponse do back-end
        const token = response.data.token; 
        
        // Navega para a próxima tela
        router.push({
          pathname: '/orcamento',
          params: { usuario: email } 
        }); 
      }
    } catch (error) {
      // 4. Se o back-end retornar erro (ex: 403 Forbidden ou 401 Unauthorized)
      console.error("Erro de login:", error);
      Alert.alert(
        "Erro de Autenticação", 
        "Usuário ou senha inválidos. Verifique os dados e tente novamente."
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          
          <View className="items-center mt-4 mb-4">
            <Image 
              source={require('../assets/images/impacto_logo.png')} 
              className="w-80 h-48" 
              resizeMode="contain" 
            />
          </View>

          <View className="bg-[#dcdcdc] mx-6 rounded-[30px] p-8 pb-12 shadow-lg mb-4">
            <Text className="text-[#cc0000] text-3xl font-extrabold text-center mb-10">
              Acesse sua conta
            </Text>

            <Text className="text-[#1a1a1a] text-2xl font-extrabold mb-2 ml-1">Usuário</Text>
            <TextInput 
              className="bg-[#b5b5b5] rounded-2xl p-4 text-black text-lg font-medium mb-8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />

            <Text className="text-[#1a1a1a] text-2xl font-extrabold mb-2 ml-1">Senha</Text>
            <TextInput 
              className="bg-[#b5b5b5] rounded-2xl p-4 text-black text-lg font-medium mb-12"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity 
              className="bg-[#cc0000] rounded-2xl p-4 items-center shadow-md"
              onPress={handleLogin}
            >
              <Text className="text-white text-2xl font-bold">Entrar</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}