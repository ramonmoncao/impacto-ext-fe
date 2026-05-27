import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import api from '../services/api';
import { authUtils } from '../services/authUtils'; 

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); 
  const senhaInputRef = useRef<TextInput>(null);
  const router = useRouter();

  const handleLogin = async () => {
    // 1. Validação
    if (!email || !password) {
      Alert.alert('Atenção', 'Por favor, preencha o usuário e a senha.');
      return;
    }

    setLoading(true); // Inicia o loading

    try {
      // 2. Faz a requisição POST para o Spring Boot
      const response = await api.post('/api/auth/login', {
        email: email,
        senha: password,
      });

      // 3. Se o login for bem-sucedido
      if (response.status === 200) {
        const token = response.data.token;

        await authUtils.saveToken(token);
        await authUtils.saveUserData({ email });

        console.log('Login bem-sucedido! Token:', token);

        // Navega para a próxima tela
        router.push({
          pathname: '/orcamento',
          params: { usuario: email },
        });
      }
    } catch (error: any) {
      console.error('Erro de login:', error);

      // Mensagem de erro mais detalhada
      let mensagem = 'Usuário ou senha inválidos.';
      if (error.response?.status === 401) {
        mensagem = 'Credenciais inválidas. Tente novamente.';
      } else if (error.response?.status === 500) {
        mensagem = 'Erro no servidor. Tente mais tarde.';
      } else if (!error.response) {
        mensagem = 'Erro de conexão. Verifique sua internet.';
      }

      Alert.alert('Erro de Autenticação', mensagem);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-black'>
      <StatusBar barStyle='light-content' backgroundColor='black' />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View className='items-center mt-4 mb-4'>
            <Image
              source={require('../assets/images/impacto_logo.png')}
              className='w-80 h-48'
              resizeMode='contain'
            />
          </View>

          <View className='bg-[#dcdcdc] mx-6 rounded-[30px] p-8 pb-12 shadow-lg mb-4'>
            <Text className='text-[#cc0000] text-3xl font-extrabold text-center mb-10'>
              Acesse sua conta
            </Text>

            <Text className='text-[#1a1a1a] text-2xl font-extrabold mb-2 ml-1'>Usuário</Text>
            <TextInput
              className='bg-[#b5b5b5] rounded-2xl p-4 text-black text-lg font-medium mb-8'
              value={email}
              onChangeText={setEmail}
              autoCapitalize='none'
              editable={!loading}
              returnKeyType="next"
              onSubmitEditing={() => senhaInputRef.current?.focus()}
              
            />

            <Text className='text-[#1a1a1a] text-2xl font-extrabold mb-2 ml-1'>Senha</Text>
            <TextInput
              className='bg-[#b5b5b5] rounded-2xl p-4 text-black text-lg font-medium mb-12'
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
              onSubmitEditing={handleLogin}
              ref={senhaInputRef}
            />

            <TouchableOpacity
              className={`rounded-2xl p-4 items-center shadow-md ${loading ? 'bg-[#999999]' : 'bg-[#cc0000]'}`}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size='large' color='white' />
              ) : (
                <Text className='text-white text-2xl font-bold'>Entrar</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
