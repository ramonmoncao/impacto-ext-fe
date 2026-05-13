import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MenuLayout from '../components/MenuLayout';

export default function NovoCliente() {
  const router = useRouter();
  const { usuario } = useLocalSearchParams();

  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');

  // Verifica se o usuário digitou qualquer coisa em qualquer campo
  const formPreenchido = nome.length > 0 || cnpj.length > 0 || telefone.length > 0 || endereco.length > 0;

  // Função para formatar o telefone dinamicamente
  const aplicarMascaraTelefone = (texto: string) => {
    let valor = texto.replace(/\D/g, ''); // Remove tudo que não é número
    valor = valor.substring(0, 11); // Limita a 11 números no máximo
    
    // Aplica o parênteses DDD: (19) 9...
    valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2'); 
    // Aplica o hífen: (19) 99999-9999 ou (19) 9999-9999
    valor = valor.replace(/(\d)(\d{4})$/, '$1-$2'); 
    
    setTelefone(valor);
  };

  // Função para interceptar o clique no botão de Voltar
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

  return (
    // Passamos a variável formPreenchido para o MenuLayout também bloquear o Menu Lateral
    <MenuLayout 
      activeRoute="/novo-cliente" 
      pageTitle="Novo Cliente" 
      hasUnsavedChanges={formPreenchido} 
    >
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
          onChangeText={aplicarMascaraTelefone} // Chamando a nossa função de máscara
          keyboardType="phone-pad"
          maxLength={15} // Tamanho máximo da máscara "(XX) XXXXX-XXXX"
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
            onPress={handleVoltar} // Agora usa a função com o Alerta
          >
            <Text className="text-white font-bold text-lg">Voltar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-1 bg-[#cc0000] py-4 rounded-full items-center shadow-md"
            onPress={() => alert("Integração com backend em breve!")}
          >
            <Text className="text-white font-bold text-lg">Salvar Dados</Text>
          </TouchableOpacity>
        </View>

      </View>
    </MenuLayout>
  );
}