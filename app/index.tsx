import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    // Bypass para testar a navegação - enviando o nome via parâmetro
    if (email === 'teste' && password === '123') {
      router.push({
        pathname: '/orcamento',
        params: { usuario: email } // Passa o nome para a próxima tela
      }); 
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