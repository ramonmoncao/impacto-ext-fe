import React from 'react';
import { View, Text } from 'react-native';
import MenuLayout from '../components/MenuLayout';

export default function TabelaVencimento() {
  return (
    <MenuLayout activeRoute="/tabela-vencimento" pageTitle="Tabela de Vencimento">
      <View className="flex-1 justify-center items-center py-20">
        <Text className="text-gray-500 text-lg text-center font-medium">
          Os vencimentos serão listados aqui.
        </Text>
      </View>
    </MenuLayout>
  );
}