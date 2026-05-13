import React from 'react';
import { View, Text } from 'react-native';
import MenuLayout from '../components/MenuLayout';

export default function OrcamentosFechados() {
  return (
    <MenuLayout activeRoute="/orcamentos-fechados" pageTitle="Orçamentos Fechados">
      <View className="flex-1 justify-center items-center py-20">
        <Text className="text-gray-500 text-lg text-center font-medium">
          A lista de orçamentos fechados aparecerá aqui em breve.
        </Text>
      </View>
    </MenuLayout>
  );
}