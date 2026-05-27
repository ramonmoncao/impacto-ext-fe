import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MenuLayout from '../components/MenuLayout';
import api from '../services/api';

// MOCK: Lista de produtos para simular o banco de dados
const PRODUTOS_MOCK = [
  { id: 'p1', descricao: 'Recarga PQS 4kg', valor: 30.0 },
  { id: 'p2', descricao: 'Recarga CO2 6kg', valor: 90.0 },
  { id: 'p3', descricao: 'Extintor Novo Água 10L', valor: 150.0 },
  { id: 'p4', descricao: 'Manutenção Nível 2', valor: 45.0 },
  { id: 'p5', descricao: 'Suporte de Parede', valor: 15.0 },
];

// Gera um array com números de 1 a 20 para o dropdown de quantidade
const QUANTIDADES = Array.from({ length: 20 }, (_, i) => i + 1);

export default function Orcamento() {
  const { usuario } = useLocalSearchParams();
  const router = useRouter();

  // Estados do Cliente
  const [buscaClienteText, setBuscaClienteText] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState<any>(null);
  const [clientesEncontrados, setClientesEncontrados] = useState<any[]>([]);
  const [modalClienteVisivel, setModalClienteVisivel] = useState(false);

  // Estados do Carrinho
  const [itens, setItens] = useState<
    { id: string; descricao: string; qtd: number; unit: number; total: number }[]
  >([]);

  // NOVOS ESTADOS: Controles dos Dropdowns e Seleções
  const [produtoSelecionado, setProdutoSelecionado] = useState(PRODUTOS_MOCK[0]); // Seleciona o primeiro por padrão
  const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(1); // Padrão de 1 item

  const [modalProdutoVisivel, setModalProdutoVisivel] = useState(false);
  const [modalQtdVisivel, setModalQtdVisivel] = useState(false);

  // FUNÇÕES DE BUSCA E CARRINHO
  const handleBuscarCliente = async () => {
    if (!buscaClienteText) {
      Alert.alert('Aviso', 'Digite um nome ou CNPJ para buscar.');
      return;
    }

    try {
      const response = await api.get('/clientes/buscar', { params: { termo: buscaClienteText } });
      const resultados = response.data;

      if (resultados && resultados.length === 1) {
        // Se achou EXATAMENTE 1 cliente, já seleciona ele direto (mais rápido pro usuário)
        setClienteSelecionado(resultados[0]);
      } else if (resultados && resultados.length > 1) {
        // Se achou MAIS DE 1, guarda a lista e abre o Modal para o usuário escolher
        setClientesEncontrados(resultados);
        setModalClienteVisivel(true);
      } else {
        // Se não achou NENHUM
        Alert.alert('Não Encontrado', 'Nenhum cliente encontrado com este termo.');
        setClienteSelecionado(null);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      Alert.alert('Erro', 'Falha ao comunicar com o servidor.');
    }
  };

  // AGORA PEGA OS DADOS DINÂMICOS DO PRODUTO SELECIONADO
  const handleAdicionarItem = () => {
    if (!produtoSelecionado) {
      Alert.alert('Aviso', 'Selecione um produto/serviço primeiro.');
      return;
    }

    const novoItem = {
      id: Date.now().toString(),
      descricao: produtoSelecionado.descricao,
      qtd: quantidadeSelecionada,
      unit: produtoSelecionado.valor,
      total: produtoSelecionado.valor * quantidadeSelecionada,
    };

    setItens([...itens, novoItem]);
  };

  const handleRemoverItem = (idParaRemover: string) => {
    setItens(itens.filter((item) => item.id !== idParaRemover));
  };

  const totalDoOrcamento = itens.reduce((acumulador, item) => acumulador + item.total, 0);

  const handleSalvarOrcamento = async () => {
    if (!clienteSelecionado) {
      Alert.alert('Atenção', 'Busque ou cadastre um cliente antes de salvar o orçamento.');
      return;
    }
    if (itens.length === 0) {
      Alert.alert('Atenção', 'O carrinho está vazio.');
      return;
    }

    try {
      const payloadOrcamento = {
        clienteNome: clienteSelecionado.nome,
        usuarioResponsavel: usuario,
        itens: itens,
        valorTotal: totalDoOrcamento,
      };
      await api.post('/orcamentos', payloadOrcamento);
      Alert.alert('Sucesso!', 'Orçamento salvo e vinculado ao cliente!');
      setItens([]);
      setClienteSelecionado(null);
      setBuscaClienteText('');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar orçamento no banco de dados.');
    }
  };

  return (
    <MenuLayout activeRoute='/orcamento' pageTitle='Novo Orçamento'>
      {/* Seção: Dados do Cliente */}
      <View className='mb-6'>
        <Text className='text-2xl font-bold text-gray-800 mb-2'>Dados do Cliente</Text>
        <View className='flex-row items-center gap-x-2'>
          <View className='flex-1 bg-[#e7e7e7] flex-row items-center px-4 rounded-full'>
            <TextInput
              className='flex-1 h-15 text-black text-base'
              placeholder='Buscar Cliente'
              placeholderTextColor='#4a4a4a'
              value={buscaClienteText}
              onChangeText={setBuscaClienteText}
              returnKeyType='search'
              onSubmitEditing={handleBuscarCliente}
            />
            <TouchableOpacity onPress={handleBuscarCliente} className='p-2'>
              <Feather name='search' size={20} color='#4a4a4a' />
            </TouchableOpacity>
          </View>
          <Text className='font-bold'>OU</Text>
          <TouchableOpacity
            className='bg-[#cc0000] px-4 py-3 rounded-full'
            onPress={() => router.push({ pathname: '/novo-cliente', params: { usuario } })}
          >
            <Text className='text-white font-bold'>Novo</Text>
          </TouchableOpacity>
        </View>

        <View className='mt-3 bg-transparent p-1'>
          {clienteSelecionado ? (
            <>
              <Text className='text-gray-800 text-base font-bold'>
                Cliente: <Text className='font-normal'>{clienteSelecionado.nome}</Text>
              </Text>
              <Text className='text-gray-800 text-base font-bold'>
                Endereço:{' '}
                <Text className='font-normal'>
                  {clienteSelecionado.endereco || 'Não informado'}
                </Text>
              </Text>
              <Text className='text-gray-800 text-base font-bold'>
                Telefone:{' '}
                <Text className='font-normal'>
                  {clienteSelecionado.telefone || 'Não informado'}
                </Text>
              </Text>
            </>
          ) : (
            <Text className='text-gray-500 italic'>Nenhum cliente selecionado.</Text>
          )}
        </View>
      </View>

      {/* Seção: Adicionar Itens (AGORA FUNCIONAL) */}
      <View className='mb-6'>
        <Text className='text-2xl font-bold text-gray-800 mb-2'>Adicionar Itens</Text>

        {/* Dropdown de Produto */}
        <View className='flex-row items-center mb-4'>
          <Text className='text-lg font-bold'>Produto/Serviço: </Text>
          <TouchableOpacity
            className='flex-1 bg-white rounded-md px-3 py-2 ml-2 border border-gray-300 flex-row justify-between items-center'
            onPress={() => setModalProdutoVisivel(true)}
          >
            <Text className='text-base text-gray-700' numberOfLines={1}>
              {produtoSelecionado ? produtoSelecionado.descricao : 'Selecione...'}
            </Text>
            <Feather name='chevron-down' size={20} color='gray' />
          </TouchableOpacity>
        </View>

        <View className='flex-row items-center justify-between mb-4'>
          {/* Dropdown de Quantidade */}
          <View className='flex-row items-center'>
            <Text className='text-lg font-bold'>Qtd: </Text>
            <TouchableOpacity
              className='bg-white rounded-md px-4 py-2 ml-2 border border-gray-300 flex-row items-center gap-x-2'
              onPress={() => setModalQtdVisivel(true)}
            >
              <Text className='text-base text-gray-700'>{quantidadeSelecionada}</Text>
              <Feather name='chevron-down' size={16} color='gray' />
            </TouchableOpacity>
          </View>

          {/* Valor Unitário Dinâmico */}
          <Text className='text-lg font-bold'>
            Valor Unit:
            <Text className='font-normal bg-white px-4 py-1 rounded border border-gray-300 ml-2'>
              R$:{' '}
              {produtoSelecionado ? produtoSelecionado.valor.toFixed(2).replace('.', ',') : '0,00'}
            </Text>
          </Text>
        </View>

        <TouchableOpacity
          className='bg-[#cc0000] w-1/2 self-center py-2 rounded-full items-center shadow-sm'
          onPress={handleAdicionarItem}
        >
          <Text className='text-white text-lg font-bold'>Adicionar</Text>
        </TouchableOpacity>
      </View>

      {/* Seção: Carrinho */}
      <View className='mb-6'>
        <Text className='text-2xl font-bold text-gray-800 mb-2'>Carrinho</Text>
        <View className='flex-row border-b border-gray-400 pb-1'>
          <Text className='flex-[2] font-bold text-gray-800'>Descrição</Text>
          <Text className='flex-1 font-bold text-gray-800 text-center'>Qtd</Text>
          <Text className='flex-1 font-bold text-gray-800 text-center'>Unit.</Text>
          <Text className='flex-1 font-bold text-gray-800 text-center'>Total</Text>
          <View className='w-8' />
        </View>

        <ScrollView className='max-h-48' nestedScrollEnabled={true}>
          {itens.map((item) => (
            <View key={item.id} className='flex-row items-center py-3 border-b border-gray-300'>
              <Text className='flex-[2] text-sm' numberOfLines={2}>
                {item.descricao}
              </Text>
              <Text className='flex-1 text-center text-sm'>{item.qtd}</Text>
              <Text className='flex-1 text-center text-sm'>
                R$ {item.unit.toFixed(2).replace('.', ',')}
              </Text>
              <Text className='flex-1 text-center text-sm font-bold'>
                R$ {item.total.toFixed(2).replace('.', ',')}
              </Text>

              <TouchableOpacity
                className='w-8 items-end'
                onPress={() => handleRemoverItem(item.id)}
              >
                <View className='bg-[#cc0000] rounded-full p-1'>
                  <Feather name='x' size={14} color='white' />
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Resumo e Rodapé */}
      <View className='mb-10'>
        <Text className='text-2xl font-bold mb-2'>Resumo</Text>
        <Text className='text-base mb-1'>
          <Text className='font-bold'>Observações:</Text> Pagamento por PIX
        </Text>

        <Text className='text-lg font-bold mb-6'>
          Total do Orçamento:{' '}
          <Text className='font-normal text-[#cc0000]'>
            R$: {totalDoOrcamento.toFixed(2).replace('.', ',')}
          </Text>
        </Text>

        <View className='flex-row gap-x-4'>
          <TouchableOpacity
            className='flex-1 bg-[#cc0000] py-3 rounded-full items-center shadow-md'
            onPress={handleSalvarOrcamento}
          >
            <Text className='text-white font-bold text-lg'>Salvar</Text>
          </TouchableOpacity>
          <TouchableOpacity className='flex-1 bg-[#cc0000] py-3 rounded-full items-center shadow-md'>
            <Text className='text-white font-bold text-lg'>Gerar PDF</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ========================================== */}
      {/* MODAL: SELECIONAR CLIENTE (BUSCA)          */}
      {/* ========================================== */}
      <Modal visible={modalClienteVisivel} transparent={true} animationType='fade'>
        <TouchableWithoutFeedback onPress={() => setModalClienteVisivel(false)}>
          <View className='flex-1 justify-center bg-black/60 px-6'>
            <TouchableWithoutFeedback>
              <View className='bg-white rounded-2xl max-h-[70%] shadow-xl'>
                <View className='bg-[#cc0000] p-4 rounded-t-2xl flex-row justify-between items-center'>
                  <Text className='text-white font-bold text-xl'>Selecione o Cliente</Text>
                  <TouchableOpacity onPress={() => setModalClienteVisivel(false)}>
                    <Feather name='x' size={24} color='white' />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={clientesEncontrados}
                  keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
                  className='p-2'
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className='p-4 border-b border-gray-200'
                      onPress={() => {
                        // Quando o usuário clica, seleciona o cliente e fecha a telinha
                        setClienteSelecionado(item);
                        setModalClienteVisivel(false);
                      }}
                    >
                      <Text className='text-lg font-bold text-gray-800'>{item.nome}</Text>
                      <Text className='text-sm text-gray-600 font-medium'>
                        CNPJ/CPF: {item.cnpj}
                      </Text>
                      {item.endereco && (
                        <Text className='text-sm text-gray-500' numberOfLines={1}>
                          {item.endereco}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ========================================== */}
      {/* MODAL: SELECIONAR PRODUTO                  */}
      {/* ========================================== */}
      <Modal visible={modalProdutoVisivel} transparent={true} animationType='fade'>
        <TouchableWithoutFeedback onPress={() => setModalProdutoVisivel(false)}>
          <View className='flex-1 justify-center bg-black/60 px-6'>
            <TouchableWithoutFeedback>
              <View className='bg-white rounded-2xl max-h-[70%] shadow-xl'>
                <View className='bg-[#cc0000] p-4 rounded-t-2xl flex-row justify-between items-center'>
                  <Text className='text-white font-bold text-xl'>Selecione um Produto</Text>
                  <TouchableOpacity onPress={() => setModalProdutoVisivel(false)}>
                    <Feather name='x' size={24} color='white' />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={PRODUTOS_MOCK}
                  keyExtractor={(item) => item.id}
                  className='p-2'
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className='p-4 border-b border-gray-200 flex-row justify-between items-center'
                      onPress={() => {
                        setProdutoSelecionado(item);
                        setModalProdutoVisivel(false);
                      }}
                    >
                      <Text className='text-lg flex-1 font-medium'>{item.descricao}</Text>
                      <Text className='text-[#cc0000] font-bold'>
                        R$ {item.valor.toFixed(2).replace('.', ',')}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ========================================== */}
      {/* MODAL: SELECIONAR QUANTIDADE               */}
      {/* ========================================== */}
      <Modal visible={modalQtdVisivel} transparent={true} animationType='fade'>
        <TouchableWithoutFeedback onPress={() => setModalQtdVisivel(false)}>
          <View className='flex-1 justify-center bg-black/60 px-6'>
            <TouchableWithoutFeedback>
              <View className='bg-white rounded-2xl max-h-[50%] shadow-xl'>
                <View className='bg-[#cc0000] p-4 rounded-t-2xl flex-row justify-between items-center'>
                  <Text className='text-white font-bold text-xl'>Quantidade</Text>
                  <TouchableOpacity onPress={() => setModalQtdVisivel(false)}>
                    <Feather name='x' size={24} color='white' />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={QUANTIDADES}
                  keyExtractor={(item) => item.toString()}
                  className='p-2'
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className='p-4 border-b border-gray-200 items-center'
                      onPress={() => {
                        setQuantidadeSelecionada(item);
                        setModalQtdVisivel(false);
                      }}
                    >
                      <Text className='text-xl font-medium'>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </MenuLayout>
  );
}
