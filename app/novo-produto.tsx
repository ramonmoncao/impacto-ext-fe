import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import MenuLayout from '../components/MenuLayout';
import api from '../services/api';

export default function NovoProduto() {
  const router = useRouter();
  const { usuario, editId } = useLocalSearchParams();

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(false);

  const isEdicao = !!editId;
  const formPreenchido = nome.length > 0 || descricao.length > 0 || preco.length > 0;

  // Busca os dados se for edição
  useEffect(() => {
    if (isEdicao) {
      const carregarProduto = async () => {
        setLoadingDados(true);
        try {
          const response = await api.get(`/products/${editId}`);
          const prod = response.data;
          
          setNome(prod.name || '');
          setDescricao(prod.description || '');
          setEstoque(prod.estoque ? prod.estoque.toString() : '0');
          
          if (prod.price) {
            let valorFormatado = (prod.price).toFixed(2).replace('.', ',');
            // Adiciona os pontos de milhar
            valorFormatado = valorFormatado.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
            setPreco(valorFormatado);
          }
        } catch (error) {
          Alert.alert('Erro', 'Não foi possível carregar os dados deste produto.');
          router.back();
        } finally {
          setLoadingDados(false);
        }
      };
      carregarProduto();
    }
  }, [editId]);

  const aplicarMascaraMoeda = (texto: string) => {
    let valor = texto.replace(/\D/g, '');
    valor = (Number(valor) / 100).toFixed(2) + '';
    valor = valor.replace('.', ',');
    valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    setPreco(valor);
  };

  const handleVoltar = () => {
    if (formPreenchido && !isEdicao) {
      Alert.alert(
        'Atenção',
        'Você inseriu informações que não foram salvas. Deseja realmente voltar?',
        [
          { text: 'Não', style: 'cancel' },
          { text: 'Sim', style: 'destructive', onPress: () => router.back() },
        ],
      );
    } else {
      router.back();
    }
  };

  const handleSalvarProduto = async () => {
    if (!nome.trim() || !preco.trim() || !descricao.trim()) {
      Alert.alert('Aviso', 'Preencha todos os campos obrigatórios (Nome, Descrição e Preço).');
      return;
    }

    setLoading(true);

    try {
      const precoNumerico = parseFloat(preco.replace(/\./g, '').replace(',', '.'));
      const estoqueNumerico = parseInt(estoque) || 0;

      const payload = {
        name: nome.trim(),
        description: descricao.trim(),
        price: precoNumerico,
        estoque: estoqueNumerico
      };

      if (isEdicao) {
        await api.put(`/products/${editId}`, payload);
        Alert.alert('Sucesso', 'Produto atualizado com sucesso!');
      } else {
        await api.post('/products', payload);
        Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
      }
      
      router.back();
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error);
      Alert.alert('Erro', `Não foi possível ${isEdicao ? 'atualizar' : 'cadastrar'} o produto/serviço.`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingDados) {
    return (
      <MenuLayout activeRoute='/produtos' pageTitle="Editando Produto">
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#cc0000" />
        </View>
      </MenuLayout>
    );
  }

  return (
    <MenuLayout
      activeRoute='/produtos'
      pageTitle={isEdicao ? 'Editar Produto' : 'Novo Produto'}
      hasUnsavedChanges={formPreenchido && !isEdicao}
    >
      <ScrollView className='flex-1 mb-6 mt-4' showsVerticalScrollIndicator={false}>
        
        {isEdicao && (
          <View className="bg-blue-100 border border-blue-300 rounded-xl p-3 mb-6 flex-row items-center">
            <Feather name="edit" size={16} color="#1e3a8a" />
            <Text className="text-blue-900 text-xs font-bold ml-2 uppercase">
              Modo de Edição Ativo
            </Text>
          </View>
        )}

        <Text className='text-lg font-bold text-gray-800 mb-2 ml-2'>Nome do Produto / Serviço *</Text>
        <TextInput
          className='bg-white rounded-xl p-4 border border-gray-300 text-black text-base mb-4'
          placeholder='Ex: Recarga PQS 4kg'
          value={nome}
          onChangeText={setNome}
          editable={!loading}
          maxLength={100}
        />

        <Text className='text-lg font-bold text-gray-800 mb-2 ml-2'>Descrição *</Text>
        <TextInput
          className='bg-white rounded-xl p-4 border border-gray-300 text-black text-base mb-4'
          placeholder='Ex: Recarga completa com troca de válvula'
          value={descricao}
          onChangeText={setDescricao}
          editable={!loading}
          multiline
          numberOfLines={3}
          maxLength={255}
          style={{ textAlignVertical: 'top' }}
        />

        <View className='flex-row gap-x-4 mb-4'>
          <View className='flex-[2]'>
            <Text className='text-lg font-bold text-gray-800 mb-2 ml-2'>Preço (R$) *</Text>
            <TextInput
              className='bg-white rounded-xl p-4 border border-gray-300 text-black text-base'
              placeholder='0,00'
              value={preco}
              onChangeText={aplicarMascaraMoeda}
              keyboardType='numeric'
              editable={!loading}
            />
          </View>

          <View className='flex-1'>
            <Text className='text-lg font-bold text-gray-800 mb-2 ml-2'>Estoque</Text>
            <TextInput
              className='bg-white rounded-xl p-4 border border-gray-300 text-black text-base'
              placeholder='Qtd'
              value={estoque}
              onChangeText={setEstoque}
              keyboardType='numeric'
              editable={!loading}
              maxLength={6}
            />
          </View>
        </View>

        <View className='flex-row gap-x-4 mt-6 mb-10'>
          <TouchableOpacity
            className='flex-1 bg-gray-400 py-4 rounded-full items-center shadow-sm'
            onPress={handleVoltar}
            disabled={loading}
          >
            <Text className='text-white font-bold text-lg'>Voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-4 rounded-full items-center shadow-md ${loading ? 'bg-red-400' : 'bg-[#cc0000]'}`}
            onPress={handleSalvarProduto}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size='small' color='white' />
            ) : (
              <Text className='text-white font-bold text-lg'>{isEdicao ? 'Atualizar' : 'Salvar'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </MenuLayout>
  );
}