import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import MenuLayout from '../components/MenuLayout';
import api from '../services/api';

export default function Produtos() {
  const router = useRouter();
  const { usuario } = useLocalSearchParams();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const buscarProdutos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProdutos(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de produtos.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      buscarProdutos();
    }, [])
  );

  return (
    <MenuLayout activeRoute='/produtos' pageTitle='Catálogo'>
      <View className='flex-1 mb-6 mt-4'>
        <View className='flex-row justify-between items-center mb-6 px-1'>
          <Text className='text-2xl font-bold text-gray-800'>Produtos / Serviços</Text>
          <TouchableOpacity
            className='bg-[#cc0000] px-4 py-2 rounded-full flex-row items-center shadow-sm'
            onPress={() => router.push({ pathname: '/novo-produto', params: { usuario } })}
          >
            <Feather name="plus" size={18} color="white" />
            <Text className='text-white font-bold ml-1'>Novo</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#cc0000" style={{ marginTop: 50 }} />
        ) : (
          <View className="pb-10">
            {produtos.length === 0 ? (
              <Text className='text-center text-gray-500 mt-10'>Nenhum produto cadastrado.</Text>
            ) : (
              produtos.map((item) => (
                <TouchableOpacity
                  key={item.id.toString()}
                  className='bg-white p-4 rounded-xl mb-3 border border-gray-200 shadow-sm flex-row justify-between items-center'
                  onPress={() => router.push({ pathname: '/novo-produto', params: { editId: item.id, usuario } })}
                >
                  <View className='flex-1 mr-2'>
                    <Text className='text-lg font-bold text-gray-800'>{item.name}</Text>
                    <Text className='text-gray-500 text-sm' numberOfLines={1}>{item.description}</Text>
                    <Text className='text-sm text-gray-500 mt-1 font-medium'>Estoque: {item.estoque || 0}</Text>
                  </View>
                  <View className='items-end justify-center'>
                    <Text className='text-[#cc0000] font-bold text-lg'>
                      R$ {item.price ? item.price.toFixed(2).replace('.', ',') : '0,00'}
                    </Text>
                    <View className='flex-row items-center mt-2 bg-gray-100 px-2 py-1 rounded'>
                      <Feather name="edit-2" size={14} color="#4a4a4a" />
                      <Text className='text-gray-600 text-xs ml-1 font-bold'>Editar</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </View>
    </MenuLayout>
  );
}