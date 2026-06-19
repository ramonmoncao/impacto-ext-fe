import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import MenuLayout from '../components/MenuLayout';
import api from '../services/api';

export default function Clientes() {
  const router = useRouter();
  const { usuario } = useLocalSearchParams();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const buscarClientes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clientes');
      setClientes(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de clientes.');
    } finally {
      setLoading(false);
    }
  };

  // Atualiza a lista sempre que a tela ganhar foco
  useFocusEffect(
    React.useCallback(() => {
      buscarClientes();
    }, [])
  );

  return (
    <MenuLayout activeRoute='/clientes' pageTitle='Gestão de Clientes'>
      <View className='flex-1 mb-6 mt-4'>
        <View className='flex-row justify-between items-center mb-6 px-1'>
          <Text className='text-2xl font-bold text-gray-800'>Meus Clientes</Text>
          <TouchableOpacity
            className='bg-[#cc0000] px-4 py-2 rounded-full flex-row items-center shadow-sm'
            onPress={() => router.push({ pathname: '/novo-cliente', params: { usuario } })}
          >
            <Feather name="user-plus" size={18} color="white" />
            <Text className='text-white font-bold ml-1'>Novo</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#cc0000" style={{ marginTop: 50 }} />
        ) : (
          <View className="pb-10">
            {clientes.length === 0 ? (
              <Text className='text-center text-gray-500 mt-10'>Nenhum cliente cadastrado.</Text>
            ) : (
              clientes.map((item) => (
                <TouchableOpacity
                  key={item.id.toString()}
                  className='bg-white p-4 rounded-xl mb-3 border border-gray-200 shadow-sm flex-row justify-between items-center'
                  onPress={() => router.push({ pathname: '/novo-cliente', params: { editId: item.id, usuario } })}
                >
                  <View className='flex-1 mr-2'>
                    <Text className='text-lg font-bold text-gray-800' numberOfLines={1}>
                      {item.nome || item.razaoSocial || 'Cliente sem nome'}
                    </Text>
                    <Text className='text-gray-500 text-sm mt-1'>
                      <Feather name="mail" size={12} /> {item.email || 'Sem e-mail'}
                    </Text>
                    <Text className='text-gray-500 text-sm mt-1'>
                      <Feather name="phone" size={12} /> {item.telefone || 'Sem telefone'}
                    </Text>
                  </View>
                  <View className='items-end justify-center'>
                    <View className='bg-gray-100 px-3 py-2 rounded-lg flex-row items-center'>
                      <Feather name="edit-2" size={16} color="#4a4a4a" />
                      <Text className='text-gray-600 text-sm ml-2 font-bold'>Editar</Text>
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