import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import MenuLayout from '../components/MenuLayout';
import api from '../services/api';

export default function NovoUsuario() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const formPreenchido = nome.length > 0 || email.length > 0 || senha.length > 0;

  const handleVoltar = () => {
    if (formPreenchido) {
      Alert.alert(
        'Atenção',
        'Há dados preenchidos que não foram salvos. Deseja realmente voltar?',
        [
          { text: 'Não', style: 'cancel' },
          { text: 'Sim', style: 'destructive', onPress: () => router.back() },
        ],
      );
    } else {
      router.back();
    }
  };

  const handleCadastrarUsuario = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      Alert.alert('Aviso', 'Preencha todos os campos obrigatórios.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas informadas não coincidem.');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Aviso', 'A senha deve conter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: nome.trim(),
        email: email.trim().toLowerCase(),
        password: senha
      };

      const response = await api.post('/users/register', payload);

      if (response.status === 201 || response.status === 200) {
        Alert.alert('Sucesso', 'Novo usuário cadastrado com sucesso!');
        router.back();
      }
    } catch (error: any) {
      console.error('Erro ao cadastrar usuário:', error);
      let mensagem = 'Não foi possível realizar o cadastro.';
      
      if (error.response?.status === 400) {
        mensagem = 'E-mail já cadastrado ou dados inválidos.';
      }
      
      Alert.alert('Erro', mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MenuLayout
      activeRoute='/novo-usuario'
      pageTitle='Novo Usuário'
      hasUnsavedChanges={formPreenchido}
    >
      <ScrollView className='flex-1 mb-6 mt-4' showsVerticalScrollIndicator={false}>
        <Text className='text-2xl font-bold text-gray-800 mb-6'>Cadastro de Vendedor / Usuário</Text>

        {/* Nome Completo */}
        <Text className='text-lg font-bold text-gray-800 mb-2 ml-2'>Nome Completo *</Text>
        <TextInput
          className='bg-white rounded-xl p-4 border border-gray-300 text-black text-base mb-4'
          placeholder='Ex: João Silva'
          value={nome}
          onChangeText={setNome}
          editable={!loading}
        />

        {/* E-mail */}
        <Text className='text-lg font-bold text-gray-800 mb-2 ml-2'>E-mail corporativo *</Text>
        <TextInput
          className='bg-white rounded-xl p-4 border border-gray-300 text-black text-base mb-4'
          placeholder='Ex: joao@impacto.com'
          value={email}
          onChangeText={setEmail}
          keyboardType='email-address'
          autoCapitalize='none'
          editable={!loading}
        />

        {/* Senha */}
        <Text className='text-lg font-bold text-gray-800 mb-2 ml-2'>Senha *</Text>
        <TextInput
          className='bg-white rounded-xl p-4 border border-gray-300 text-black text-base mb-4'
          placeholder='Mínimo 6 caracteres'
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          editable={!loading}
        />

        {/* Confirmar Senha */}
        <Text className='text-lg font-bold text-gray-800 mb-2 ml-2'>Confirmar Senha *</Text>
        <TextInput
          className='bg-white rounded-xl p-4 border border-gray-300 text-black text-base mb-6'
          placeholder='Digite a senha novamente'
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry
          editable={!loading}
        />

        <Text className='text-sm text-gray-500 mb-6 ml-2'>* Campos obrigatórios</Text>

        {/* Botões */}
        <View className='flex-row gap-x-4 mt-4 mb-10'>
          <TouchableOpacity
            className='flex-1 bg-gray-400 py-4 rounded-full items-center shadow-sm'
            onPress={handleVoltar}
            disabled={loading}
          >
            <Text className='text-white font-bold text-lg'>Voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-4 rounded-full items-center shadow-md ${loading ? 'bg-red-400' : 'bg-[#cc0000]'}`}
            onPress={handleCadastrarUsuario}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size='large' color='white' />
            ) : (
              <Text className='text-white font-bold text-lg'>Cadastrar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </MenuLayout>
  );
}