import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MenuLayout from '../components/MenuLayout';
// 1. Importando o nosso "carteiro" Axios
import api from '../services/api'; 

export default function NovoCliente() {
  const router = useRouter();
  const { usuario } = useLocalSearchParams();

  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');

  const formPreenchido = nome.length > 0 || cnpj.length > 0 || telefone.length > 0 || endereco.length > 0;

  const aplicarMascaraTelefone = (texto: string) => {
    let valor = texto.replace(/\D/g, ''); 
    valor = valor.substring(0, 11); 
    valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2'); 
    valor = valor.replace(/(\d)(\d{4})$/, '$1-$2'); 
    setTelefone(valor);
  };

  const handleVoltar = () => {
    if (formPreenchido) {
      Alert.alert(
        "Atenção",
        "Você inseriu informações sobre um novo cliente mas elas não foram salvas, deseja realmente voltar?",
        [
          { text: "Não", style: "cancel" },
          { text: "Sim", style: "destructive", onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  // 2. FUNÇÃO DE SALVAR NO BANCO DE DADOS
  const handleSalvarCliente = async () => {
    if (!nome || !cnpj) {
      Alert.alert("Campos Obrigatórios", "Por favor, preencha pelo menos o Nome e o CNPJ/CPF.");
      return;
    }

    try {
      // O Payload é o JSON que o Ramon vai receber no @RequestBody do Spring Boot
      const payload = {
        nome: nome,
        cnpj: cnpj.replace(/\D/g, ''), // Envia só os números para evitar erro no banco
        telefone: telefone,
        endereco: endereco
      };

      // Faz um POST para a rota de clientes do backend
      await api.post('/clientes', payload);
      
      Alert.alert("Sucesso", "Cliente cadastrado com sucesso no banco de dados!");
      router.back(); // Volta para a tela de orçamento automaticamente
      
    } catch (error) {
      console.error(error);
      Alert.alert("Erro de Conexão", "Não foi possível comunicar com o servidor do Ramon. Verifique se o Backend está rodando.");
    }
  };

  return (
    <MenuLayout activeRoute="/novo-cliente" pageTitle="Novo Cliente" hasUnsavedChanges={formPreenchido}>
      <View className="mb-6 mt-4">
        <Text className="text-2xl font-bold text-gray-800 mb-6">Cadastro de Cliente</Text>

        <Text className="text-lg font-bold text-gray-800 mb-2 ml-2">Nome / Razão Social</Text>
        <TextInput 
          className="bg-white rounded-xl p-4 border border-gray-300 text-black text-base mb-4"
          placeholder="Ex: Impacto Extintores"
          value={nome}
          onChangeText={setNome}
        />

        <Text className="text-lg font-bold text-gray-800 mb-2 ml-2">CNPJ / CPF</Text>
        <TextInput 
          className="bg-white rounded-xl p-4 border border-gray-300 text-black text-base mb-4"
          placeholder="00.000.000/0000-00"
          value={cnpj}
          onChangeText={setCnpj}
          keyboardType="numeric"
        />

        <Text className="text-lg font-bold text-gray-800 mb-2 ml-2">Telefone</Text>
        <TextInput 
          className="bg-white rounded-xl p-4 border border-gray-300 text-black text-base mb-4"
          placeholder="(19) 99999-9999"
          value={telefone}
          onChangeText={aplicarMascaraTelefone} 
          keyboardType="phone-pad"
          maxLength={15} 
        />

        <Text className="text-lg font-bold text-gray-800 mb-2 ml-2">Endereço Completo</Text>
        <TextInput 
          className="bg-white rounded-xl p-4 border border-gray-300 text-black text-base mb-8"
          placeholder="Rua, Número, Bairro, Cidade"
          value={endereco}
          onChangeText={setEndereco}
        />

        <View className="flex-row gap-x-4 mt-4 mb-10">
          <TouchableOpacity 
            className="flex-1 bg-gray-400 py-4 rounded-full items-center shadow-sm"
            onPress={handleVoltar} 
          >
            <Text className="text-white font-bold text-lg">Voltar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-1 bg-[#cc0000] py-4 rounded-full items-center shadow-md"
            onPress={handleSalvarCliente} // Chamando a função de API
          >
            <Text className="text-white font-bold text-lg">Salvar Dados</Text>
          </TouchableOpacity>
        </View>

      </View>
    </MenuLayout>
  );
}