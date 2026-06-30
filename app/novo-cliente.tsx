import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MenuLayout from '../components/MenuLayout';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NovoCliente() {
  const router = useRouter();
  const { usuario, editId } = useLocalSearchParams(); // ✅ ALINHADO: Agora captura exatamente o 'editId'

  // Estados dos campos do formulário
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  
  // Estados de controle de carregamento
  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(false);

  const isEdicao = !!editId;
  const formPreenchido =
    nome.length > 0 || cnpj.length > 0 || telefone.length > 0 || email.length > 0 || endereco.length > 0;

  const aplicarMascaraCNPJ = (texto: string) => {
    let valor = texto.replace(/\D/g, '');

    if (valor.length <= 11) {
      valor = valor.replace(/^(\d{3})(\d)/g, '$1.$2');
      valor = valor.replace(/^(\d{3})\.(\d{3})(\d)/g, '$1.$2.$3');
      valor = valor.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/g, '$1.$2.$3-$4');
    } else {
      valor = valor.replace(/^(\d{2})(\d)/g, '$1.$2');
      valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/g, '$1.$2.$3');
      valor = valor.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/g, '$1.$2.$3/$4');
      valor = valor.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/g, '$1.$2.$3/$4-$5');
      valor = valor.substring(0, 18);
    }

    setCnpj(valor);
  };

  const aplicarMascaraTelefone = (texto: string) => {
    let valor = texto.replace(/\D/g, '');
    valor = valor.substring(0, 11);
    valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2');
    valor = valor.replace(/(\d)/g, '$1');
    valor = valor.replace(/(\d)(\d{4})$/, '$1-$2');
    setTelefone(valor);
  };

  const validarFormulario = (): boolean => {
    if (!nome.trim()) { Alert.alert('Erro de Validação', 'O nome é obrigatório.'); return false; }
    if (nome.trim().length < 3) { Alert.alert('Erro de Validação', 'O nome deve ter pelo menos 3 caracteres.'); return false; }
    
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    if (!cnpjLimpo) { Alert.alert('Erro de Validação', 'O CNPJ/CPF é obrigatório.'); return false; }
    if (cnpjLimpo.length !== 11 && cnpjLimpo.length !== 14) { Alert.alert('Erro de Validação', 'CNPJ deve ter 14 dígitos ou CPF deve ter 11 dígitos.'); return false; }
    if (/^(\d)\1{10,}$/.test(cnpjLimpo)) { Alert.alert('Erro de Validação', 'CNPJ/CPF inválido (dígitos repetidos).'); return false; }

    if (telefone.trim()) {
      const telefoneLimpo = telefone.replace(/\D/g, '');
      if (telefoneLimpo.length !== 11) { Alert.alert('Erro de Validação', 'Telefone deve ter 11 dígitos (com DDD).'); return false; }
    }
    if (email.trim() && !email.includes('@')) { Alert.alert('Erro de Validação', 'Por favor, insira um e-mail válido.'); return false; }

    return true;
  };

  const handleVoltar = () => {
    if (formPreenchido) {
      Alert.alert(
        'Atenção', 'Você inseriu informações sobre um cliente mas elas não foram salvas. Deseja realmente voltar?',
        [
          { text: 'Não', style: 'cancel' },
          { text: 'Sim', style: 'destructive', onPress: () => router.back() },
        ],
      );
    } else {
      router.back();
    }
  };

  const handleSalvarCliente = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      const clientePayload = {
        nome: nome.trim(),
        cnpj: cnpj.replace(/\D/g, ''),
        telefone: telefone.replace(/\D/g, ''),
        email: email.trim().toLowerCase(), // ✅ Enviado na tipagem padrão do seu back-end
        endereco: endereco.trim(),
        numero: numero.trim(),
        bairro: bairro.trim(),
        cidade: cidade.trim(), // ✅ CORRIGIDO DEFINITIVO: Sem strings avulsas e sem travar o layout
      };

      let response;
      if (isEdicao) {
        response = await api.put(`/clientes/${editId}`, clientePayload);
      } else {
        response = await api.post('/clientes', clientePayload);
      }

      if (response.status === 201 || response.status === 200) {
        Alert.alert('Sucesso', `Cliente ${isEdicao ? 'atualizado' : 'cadastrado'} com sucesso!`);
        setNome(''); setCnpj(''); setTelefone(''); setEmail(''); setEndereco(''); setNumero(''); setBairro(''); setCidade('');
        router.back();
      }
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados do cliente.');
    } finally {
      setLoading(false);
    }
  };

  // Carrega os dados se estiver no modo de edição
  useEffect(() => {
    if (isEdicao) {
      const carregarCliente = async () => {
        setLoadingDados(true);
        try {
          const response = await api.get(`/clientes/${editId}`);
          const cli = response.data;
          
          if (cli) {
            setNome(cli.nome || cli.razaoSocial || '');
            setCnpj(cli.cnpj || '');
            setTelefone(cli.telefone || '');
            setEmail(cli.email || ''); // ✅ O estado agora popula o e-mail recuperado do MongoDB
            setEndereco(cli.endereco || '');
            setNumero(cli.numero || '');
            setBairro(cli.bairro || '');
            setCidade(cli.cidade || '');
          }
        } catch (error) {
          Alert.alert('Erro', 'Não foi possível carregar os dados deste cliente.');
          router.back();
        } finally {
          setLoadingDados(false);
        }
      };
      carregarCliente();
    }
  }, [editId]);

  if (loadingDados) {
    return (
      <MenuLayout activeRoute='/novo-cliente' pageTitle="Buscando Dados">
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#cc0000" />
        </View>
      </MenuLayout>
    );
  }

  return (
    <MenuLayout activeRoute='/novo-cliente' pageTitle={isEdicao ? 'Editar Cliente' : 'Novo Cliente'} hasUnsavedChanges={formPreenchido}>
      <ScrollView className='mb-6 mt-4' showsVerticalScrollIndicator={false}>
        <KeyboardAvoidingView>
          <Text className='text-2xl font-bold text-gray-800 mb-6'>
            {isEdicao ? 'Editar Cadastro do Cliente' : 'Cadastro de Cliente'}
          </Text>

          {/* Nome */}
          <Text className='text-lg font-bold text-gray-800 mb-2 ml-2'>Nome / Razão Social *</Text>
          <TextInput className='bg-white rounded-xl p-4 border border-gray-300 text-black text-base mb-4' placeholder='Ex: Impacto Extintores' value={nome} onChangeText={setNome} editable={!loading} maxLength={100} />

          {/* CNPJ/CPF */}
          <Text className='text-lg font-bold text-gray-800 mb-2 ml-2'>CNPJ / CPF *</Text>
          <TextInput className='bg-white rounded-xl p-4 border border-gray-300 text-black text-base mb-4' placeholder='00.000.000/0000-00' value={cnpj} onChangeText={aplicarMascaraCNPJ} keyboardType='numeric' editable={!loading} maxLength={18} />

          {/* Telefone */}
          <Text className='text-lg font-bold text-gray-800 mb-2 ml-2'>Telefone *</Text>
          <TextInput className='bg-white rounded-xl p-4 border border-gray-300 text-black text-base mb-4' placeholder='(19) 99999-9999' value={telefone} onChangeText={aplicarMascaraTelefone} keyboardType='phone-pad' editable={!loading} maxLength={15} />

          {/* E-mail */}
          <Text className='text-lg font-bold text-gray-800 mb-2 ml-2'>E-mail Corporativo</Text>
          <TextInput className='bg-white rounded-xl p-4 border border-gray-300 text-black text-base mb-4' placeholder='exemplo@empresa.com' value={email} onChangeText={setEmail} keyboardType='email-address' autoCapitalize='none' editable={!loading} maxLength={100} />

          {/* Endereço */}
          <Text className='text-lg font-bold text-gray-800 mb-2 ml-2'>Endereço Completo *</Text>
          <TextInput className='bg-white rounded-xl p-4 border border-gray-300 text-black text-base mb-4' placeholder='Rua / Avenida' value={endereco} onChangeText={setEndereco} editable={!loading} maxLength={200} />
          <TextInput className='bg-white rounded-xl p-4 border border-gray-300 text-black text-base mb-4' placeholder='Bairro' value={bairro} onChangeText={setBairro} editable={!loading} />
          
          <View className='flex-row gap-x-2 mb-4'>
            <TextInput className='flex-1 bg-white rounded-xl p-4 border border-gray-300 text-black text-base' placeholder='Nº' value={numero} onChangeText={setNumero} keyboardType='numeric' editable={!loading} />
            <TextInput className='flex-1 bg-white rounded-xl p-4 border border-gray-300 text-black text-base' placeholder='Cidade' value={cidade} onChangeText={setCidade} editable={!loading} />
          </View>

          <Text className='text-sm text-gray-500 mb-6 ml-2'>* Campos obrigatórios</Text>

          {/* Botões */}
          <View className='flex-row gap-x-4 mt-4 mb-10'>
            <TouchableOpacity className='flex-1 bg-gray-400 py-4 rounded-full items-center shadow-sm' onPress={handleVoltar} disabled={loading}>
              <Text className='text-white font-bold text-lg'>Voltar</Text>
            </TouchableOpacity>

            <TouchableOpacity className={`flex-1 py-4 rounded-full items-center shadow-md ${loading ? 'bg-red-400' : 'bg-[#cc0000]'}`} onPress={handleSalvarCliente} disabled={loading}>
              {loading ? <ActivityIndicator size='large' color='white' /> : <Text className='text-white font-bold text-lg'>Salvar Dados</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </MenuLayout>
  );
}