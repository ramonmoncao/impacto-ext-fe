import React, { useState } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import api from '../services/api';

// 1. Importe o botão
import Button from '../components/Button';

export default function Orcamento() {
  const [itens, setItens] = useState([
    { descricaoProduto: 'Recarga PQS 4kg', quantidade: 2, valorUnitario: 45.00 },
  ]);

  const handleFinalizar = async () => {
    try {
      const orcamentoData = {
        nomeCliente: "Cliente Exemplo",
        cnpj: "00.000.000/0001-00",
        itens: itens,
        observacoes: "Gerado via App Mobile"
      };

      await api.post('/orcamentos', orcamentoData);
      Alert.alert("Sucesso", "Orçamento salvo no MongoDB!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o orçamento.");
    }
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-xl font-bold mb-4">Novo Orçamento</Text>
      
      <FlatList 
        data={itens}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View className="flex-row justify-between p-4 border-b border-slate-100">
            <Text className="font-medium">{item.descricaoProduto}</Text>
            <Text className="text-slate-500">x{item.quantidade}</Text>
            <Text className="font-bold text-red-600">R$ {item.valorUnitario * item.quantidade}</Text>
          </View>
        )}
      />

      <View className="mt-4">
        {/* 2. Usando a variante verde (success) */}
        <Button 
          title="Enviar para o Backend" 
          onPress={handleFinalizar} 
          variant="success" 
        />
      </View>
    </View>
  );
}