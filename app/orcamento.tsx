import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, StatusBar, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function Orcamento() {
  // 1. Hook para capturar o parâmetro enviado pela tela de Login
  const { usuario } = useLocalSearchParams(); 
  const router = useRouter();

  // 2. Estado para controlar a abertura e fechamento do Menu Lateral
  const [menuAberto, setMenuAberto] = useState(false);

  const [itens, setItens] = useState([
    { id: '1', descricao: 'Recarga', qtd: 2, unit: 30.00, total: 60.00 }
  ]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      {/* Cabeçalho Superior Preto */}
      <View className="bg-black flex-row items-center justify-between px-4 py-3">
        {/* 3. Ação para abrir o Menu Lateral */}
        <TouchableOpacity onPress={() => setMenuAberto(true)}>
          <Feather name="menu" size={32} color="gray" />
        </TouchableOpacity>
        <Image 
          source={require('../assets/images/impacto_logo2.png')} 
          className="w-32 h-12" 
          resizeMode="contain" 
        />
        <View className="w-8" /> 
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4 py-2">
          
          {/* Abas */}
          <View className="flex-row justify-between mb-4 px-2">
            <Text className="text-[#cc0000] text-xl font-bold border-b-2 border-[#cc0000]">Novo Orçamento</Text>
            {/* 4. Exibindo o nome do usuário logado (ou fallback para "Usuário") */}
            <Text className="text-[#cc0000] text-xl font-bold">{usuario || 'Usuário'}</Text>
          </View>

          {/* Seção: Dados do Cliente */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-800 mb-2">Dados do Cliente</Text>
            <View className="flex-row items-center gap-x-2">
              <View className="flex-1 bg-[#e0e0e0] flex-row items-center px-4 rounded-full border border-gray-300">
                <TextInput className="flex-1 h-10 text-base" placeholder="Buscar Cliente" />
                <Feather name="search" size={20} color="gray" />
              </View>
              <Text className="font-bold">OU</Text>
              <TouchableOpacity className="bg-[#cc0000] px-4 py-2 rounded-lg">
                <Text className="text-white font-bold">Novo</Text>
              </TouchableOpacity>
            </View>
            <View className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <Text className="text-gray-700 font-medium text-base">Cliente: Agropecuaria A</Text>
              <Text className="text-gray-600">Endereço: Rua XYZ - 177 Monte Mor</Text>
              <Text className="text-gray-600">Telefone: 19 99999-9999</Text>
            </View>
          </View>

          {/* Seção: Adicionar Itens */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-800 mb-2">Adicionar Itens</Text>
            <View className="flex-row items-center mb-2">
              <Text className="text-lg font-bold">Produto/Serviço: </Text>
              <View className="flex-1 bg-[#e0e0e0] rounded-md px-2 ml-2 border border-gray-300">
                <Text className="py-1">Recarga ▾</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Text className="text-lg font-bold">Qtd: </Text>
                <View className="bg-[#e0e0e0] rounded-md px-4 py-1 ml-1 border border-gray-300">
                  <Text>2 ▾</Text>
                </View>
              </View>
              <Text className="text-lg font-bold">Valor Unit: <Text className="font-normal text-gray-600">R$: 30</Text></Text>
            </View>
            <TouchableOpacity className="bg-[#cc0000] w-full py-3 rounded-xl items-center shadow-sm">
              <Text className="text-white text-xl font-bold">Adicionar</Text>
            </TouchableOpacity>
          </View>

          {/* Seção: Carrinho */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-800 mb-2">Carrinho</Text>
            <View className="flex-row border-b border-gray-300 pb-1">
              <Text className="flex-[2] font-bold text-gray-600">Descrição</Text>
              <Text className="flex-1 font-bold text-gray-600 text-center">Qtd</Text>
              <Text className="flex-1 font-bold text-gray-600 text-center">Unit.</Text>
              <Text className="flex-1 font-bold text-gray-600 text-center">Total</Text>
              <View className="w-8" />
            </View>
            {itens.map((item) => (
              <View key={item.id} className="flex-row items-center py-3 border-b border-gray-100">
                <Text className="flex-[2] text-base">{item.descricao}</Text>
                <Text className="flex-1 text-center text-base">{item.qtd}</Text>
                <Text className="flex-1 text-center text-base">R$ {item.unit}</Text>
                <Text className="flex-1 text-center text-base font-bold">R$ {item.total}</Text>
                <TouchableOpacity className="w-8 items-end">
                   <View className="bg-[#cc0000] rounded-full p-1">
                      <Feather name="x" size={14} color="white" />
                   </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Resumo e Rodapé */}
          <View className="bg-gray-100 p-4 rounded-2xl mb-10">
             <Text className="text-2xl font-bold mb-2">Resumo</Text>
             <Text className="text-base mb-1"><Text className="font-bold">Observações:</Text> Pagamento por PIX</Text>
             <Text className="text-lg font-bold">Total do Orçamento: <Text className="text-[#cc0000]">R$: 60,00</Text></Text>
             
             <View className="flex-row gap-x-4 mt-6">
                <TouchableOpacity className="flex-1 bg-[#cc0000] py-3 rounded-xl items-center">
                   <Text className="text-white font-bold text-lg">Salvar</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-[#cc0000] py-3 rounded-xl items-center">
                   <Text className="text-white font-bold text-lg">Gerar PDF</Text>
                </TouchableOpacity>
             </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 5. MENU LATERAL (MODAL) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={menuAberto}
        onRequestClose={() => setMenuAberto(false)}
      >
        <View className="flex-1 flex-row">
          {/* Parte visível do Menu */}
          <View className="w-3/4 bg-[#dcdcdc] h-full p-6 pt-12 shadow-2xl">
            <View className="flex-row justify-between items-center mb-10">
              <Text className="text-2xl font-extrabold text-black">Menu</Text>
              <TouchableOpacity onPress={() => setMenuAberto(false)}>
                <Feather name="x" size={32} color="black" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity className="bg-gray-300 p-4 rounded-lg mb-4">
              <Text className="text-[#cc0000] text-lg font-bold text-center">Novo Orçamento</Text>
            </TouchableOpacity>

            <TouchableOpacity className="p-4 mb-4">
              <Text className="text-black text-lg font-bold text-center">Orçamentos Fechados</Text>
            </TouchableOpacity>

            <TouchableOpacity className="p-4 mb-4">
              <Text className="text-black text-lg font-bold text-center">Tabela de Vencimento</Text>
            </TouchableOpacity>

            {/* Botão de Sair com redirecionamento para o index */}
            <TouchableOpacity 
              className="mt-auto flex-row justify-center items-center p-4" 
              onPress={() => {
                setMenuAberto(false);
                router.replace('/');
              }}
            >
              <Feather name="log-out" size={24} color="black" />
              <Text className="text-black text-lg font-bold ml-2">Sair</Text>
            </TouchableOpacity>
          </View>

          {/* Área transparente para fechar ao clicar fora do menu */}
          <TouchableOpacity 
            className="w-1/4 bg-black/50" 
            onPress={() => setMenuAberto(false)} 
            activeOpacity={1}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}