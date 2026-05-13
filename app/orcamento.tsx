import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router'; // Importado useRouter
import MenuLayout from '../components/MenuLayout';

export default function Orcamento() {
  const { usuario } = useLocalSearchParams(); 
  const router = useRouter(); // Para navegar até Novo Cliente

  const [itens, setItens] = useState([
    { id: '1', descricao: 'Recarga', qtd: 2, unit: 30.00, total: 60.00 }
  ]);

  // LÓGICA 1: Adicionar novo item
  const handleAdicionarItem = () => {
    const novoItem = {
      id: Date.now().toString(), // Gera um ID único baseado na hora
      descricao: 'Recarga',
      qtd: 2,
      unit: 30.00,
      total: 60.00
    };
    // Pega os itens que já existem e adiciona o novo no final
    setItens([...itens, novoItem]);
  };

  // LÓGICA 2: Remover item específico
  const handleRemoverItem = (idParaRemover: string) => {
    // Filtra a lista, mantendo apenas os itens com ID diferente do clicado
    setItens(itens.filter(item => item.id !== idParaRemover));
  };

  // LÓGICA 3: Calcular total automático dinâmico
  const totalDoOrcamento = itens.reduce((acumulador, item) => acumulador + item.total, 0);

  return (
    <MenuLayout activeRoute="/orcamento" pageTitle="Novo Orçamento">
      
      {/* Seção: Dados do Cliente */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-800 mb-2">Dados do Cliente</Text>
        <View className="flex-row items-center gap-x-2">
          <View className="flex-1 bg-[#e7e7e7] flex-row items-center px-4 rounded-full">
            <TextInput className="flex-1 h-15 text-black text-base" placeholder="Buscar Cliente" placeholderTextColor="#4a4a4a" />
            <Feather name="search" size={20} color="#4a4a4a" />
          </View>
          <Text className="font-bold">OU</Text>
          
          {/* LÓGICA 4: Navegação para a tela de Novo Cliente */}
          <TouchableOpacity 
            className="bg-[#cc0000] px-4 py-2 rounded-full"
            onPress={() => router.push({ pathname: '/novo-cliente', params: { usuario } })}
          >
            <Text className="text-white font-bold">Novo</Text>
          </TouchableOpacity>
        </View>
        <View className="mt-3 bg-transparent p-1">
          <Text className="text-gray-800 text-base">Cliente: Agropecuaria A</Text>
          <Text className="text-gray-800 text-base">Endereço: Rua XYZ - 177 Monte Mor</Text>
          <Text className="text-gray-800 text-base">Telefone: 19 99999-9999</Text>
        </View>
      </View>

      {/* Seção: Adicionar Itens */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-800 mb-2">Adicionar Itens</Text>
        <View className="flex-row items-center mb-4">
          <Text className="text-lg font-bold">Produto/Serviço: </Text>
          <View className="flex-1 bg-white rounded-md px-2 ml-2 border border-gray-300">
            <Text className="py-1">Recarga ▾</Text>
          </View>
        </View>
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Text className="text-lg font-bold">Qtd: </Text>
            <View className="bg-white rounded-md px-4 py-1 ml-2 border border-gray-300">
              <Text>2 ▾</Text>
            </View>
          </View>
          <Text className="text-lg font-bold">Valor Unit: <Text className="font-normal bg-white px-4 py-1 rounded border border-gray-300">R$: 30</Text></Text>
        </View>

        {/* Acionando a função de adicionar no botão */}
        <TouchableOpacity 
          className="bg-[#cc0000] w-1/2 self-center py-2 rounded-full items-center shadow-sm"
          onPress={handleAdicionarItem}
        >
          <Text className="text-white text-lg font-bold">Adicionar</Text>
        </TouchableOpacity>
      </View>

      {/* Seção: Carrinho */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-800 mb-2">Carrinho</Text>
        <View className="flex-row border-b border-gray-400 pb-1">
          <Text className="flex-[2] font-bold text-gray-800">Descrição</Text>
          <Text className="flex-1 font-bold text-gray-800 text-center">Qtd</Text>
          <Text className="flex-1 font-bold text-gray-800 text-center">Unit.</Text>
          <Text className="flex-1 font-bold text-gray-800 text-center">Total</Text>
          <View className="w-8" />
        </View>

        {/* LÓGICA 5: ScrollView com altura máxima para não esticar a tela */}
        <ScrollView className="max-h-48" nestedScrollEnabled={true}>
          {itens.map((item) => (
            <View key={item.id} className="flex-row items-center py-3 border-b border-gray-300">
              <Text className="flex-[2] text-base">{item.descricao}</Text>
              <Text className="flex-1 text-center text-base">{item.qtd}</Text>
              <Text className="flex-1 text-center text-base">R$ {item.unit.toFixed(2).replace('.', ',')}</Text>
              <Text className="flex-1 text-center text-base font-bold">R$ {item.total.toFixed(2).replace('.', ',')}</Text>
              
              {/* Acionando a função de remover passando o ID */}
              <TouchableOpacity 
                className="w-8 items-end"
                onPress={() => handleRemoverItem(item.id)}
              >
                 <View className="bg-[#cc0000] rounded-full p-1">
                    <Feather name="x" size={14} color="white" />
                 </View>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Resumo e Rodapé */}
      <View className="mb-10">
         <Text className="text-2xl font-bold mb-2">Resumo</Text>
         <Text className="text-base mb-1"><Text className="font-bold">Observações:</Text> Pagamento por PIX</Text>
         
         {/* LÓGICA 6: Exibindo o valor total dinâmico */}
         <Text className="text-lg font-bold mb-6">
           Total do Orçamento: <Text className="font-normal text-[#cc0000]">
             R$: {totalDoOrcamento.toFixed(2).replace('.', ',')}
           </Text>
         </Text>
         
         <View className="flex-row gap-x-4">
            <TouchableOpacity className="flex-1 bg-[#cc0000] py-3 rounded-full items-center shadow-md">
               <Text className="text-white font-bold text-lg">Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-[#cc0000] py-3 rounded-full items-center shadow-md">
               <Text className="text-white font-bold text-lg">Gerar PDF</Text>
            </TouchableOpacity>
         </View>
      </View>
    </MenuLayout>
  );
}