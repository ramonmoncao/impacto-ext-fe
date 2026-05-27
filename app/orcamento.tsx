import React, { useState, useRef, useEffect } from 'react';
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

const QUANTIDADES = Array.from({ length: 20 }, (_, i) => i + 1);

export default function Orcamento() {
  const { usuario } = useLocalSearchParams();
  const router = useRouter();

  // RECUPERADO: Nome do usuário real
  const [nomeUsuarioLogado, setNomeUsuarioLogado] = useState<any>(usuario);

  // Estados do Cliente & Busca Responsiva
  const [buscaClienteText, setBuscaClienteText] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState<any>(null);
  const [clientesResultados, setClientesResultados] = useState<any[]>([]);
  const ultimaBuscaRef = useRef(''); // Vigia Anti-Fantasma

  // RECUPERADO: Observações Digitáveis
  const [observacoes, setObservacoes] = useState('');

  // Estados do Carrinho
  const [itens, setItens] = useState<
    { id: string; descricao: string; qtd: number; unit: number; total: number }[]
  >([]);

  // Controles dos Dropdowns e Seleções
  const [produtoSelecionado, setProdutoSelecionado] = useState(PRODUTOS_MOCK[0]); 
  const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(1); 

  const [modalProdutoVisivel, setModalProdutoVisivel] = useState(false);
  const [modalQtdVisivel, setModalQtdVisivel] = useState(false);

  // RECUPERADO: Busca do nome do vendedor no Java caso receba só o email
  useEffect(() => {
    if (usuario && typeof usuario === 'string' && usuario.includes('@')) {
      api.get(`/users/buscarPorEmail`, { params: { email: usuario } })
        .then(response => {
          if (response.data && (response.data.nome || response.data.name)) {
            setNomeUsuarioLogado(response.data.nome || response.data.name);
          }
        })
        .catch(error => console.log("Usando email como fallback."));
    } else {
      setNomeUsuarioLogado(usuario);
    }
  }, [usuario]);

  // RECUPERADO: Busca ao digitar (Live Search) com trava de Segurança
  const handleBuscarClienteLive = async (text: string) => {
    setBuscaClienteText(text);
    
    if (!text || text.trim().length === 0) {
      setClientesResultados([]);
      setClienteSelecionado(null);
      ultimaBuscaRef.current = '';
      return;
    }

    ultimaBuscaRef.current = text;

    try {
      const response = await api.get('/clientes/buscar', { params: { termo: text } });
      
      if (ultimaBuscaRef.current !== text || ultimaBuscaRef.current === '') return;

      const clientesApi = Array.isArray(response.data) ? response.data : [response.data];
      const termoLower = text.toLowerCase().trim();
      
      const filtrados = clientesApi.filter((cliente: any) => {
        if (!cliente || !cliente.nome) return false;
        const nomeLower = cliente.nome.toLowerCase();
        if (nomeLower.startsWith(termoLower)) return true;
        const palavras = nomeLower.split(' ');
        return palavras.some((palavra: string) => palavra.startsWith(termoLower));
      });

      if (ultimaBuscaRef.current === text && text.trim().length > 0) {
        setClientesResultados(filtrados);
      }
    } catch (error) {
      console.error(error);
      if (ultimaBuscaRef.current !== text || ultimaBuscaRef.current === '') return;
      setClientesResultados([]);
    }
  };

  const selecionarCliente = (cliente: any) => {
    setClienteSelecionado(cliente);
    setBuscaClienteText(cliente.nome);
    setClientesResultados([]);
  };

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

  // RECUPERADO: Mapeamento exato para o MongoDB Atlas (Classes Java)
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
        nomeCliente: clienteSelecionado.nome,
        endereco: clienteSelecionado.endereco, 
        telefone: clienteSelecionado.telefone, 
        usuarioResponsavel: nomeUsuarioLogado, // Nome Real do Vendedor
        observacoes: observacoes,              // Texto Digitado
        valorTotal: totalDoOrcamento,
        
        // Formata o carrinho para a classe ItemOrcamento do Java
        itens: itens.map(item => ({
          descricaoProduto: item.descricao,
          quantidade: item.qtd,
          valorUnitario: item.unit
        }))
      };

      await api.post('/api/orcamentos', payloadOrcamento);
      
      Alert.alert('Sucesso!', 'Orçamento salvo com sucesso no banco de dados!');
      
      // Limpa os dados
      setItens([]);
      setClienteSelecionado(null);
      setBuscaClienteText('');
      setObservacoes('');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao salvar orçamento no banco de dados.');
    }
  };

  return (
    <MenuLayout activeRoute='/orcamento' pageTitle={`Novo Orçamento`}>
      {/* Seção: Dados do Cliente */}
      <View className='mb-6 z-50'>
        <Text className='text-2xl font-bold text-gray-800 mb-2'>Dados do Cliente</Text>
        <View className='flex-row items-center gap-x-2 relative'>
          <View className='flex-1 bg-[#e7e7e7] flex-row items-center px-4 rounded-full relative z-50'>
            <TextInput
              className='flex-1 h-15 text-black text-base'
              placeholder='Buscar Cliente'
              placeholderTextColor='#4a4a4a'
              value={buscaClienteText}
              onChangeText={handleBuscarClienteLive} // Busca Responsiva
            />
            <TouchableOpacity onPress={() => handleBuscarClienteLive(buscaClienteText)} className='p-2'>
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

        {/* LISTA SUSPENSA ANTI-FANTASMA (Mantive o CNPJ que o Erik adicionou) */}
        {buscaClienteText.trim().length > 0 && clientesResultados.length > 0 && !clienteSelecionado && (
          <View className='bg-white border border-gray-300 rounded-lg mt-1 max-h-48 shadow-lg z-50 overflow-hidden'>
            <ScrollView keyboardShouldPersistTaps='handled' nestedScrollEnabled={true}>
              {clientesResultados.map((cliente, index) => (
                <TouchableOpacity
                  key={cliente.id || index}
                  className='p-3 border-b border-gray-100'
                  onPress={() => selecionarCliente(cliente)}
                >
                  <Text className='text-gray-800 font-bold text-base'>{cliente.nome}</Text>
                  <Text className='text-sm text-gray-600 font-medium'>CNPJ/CPF: {cliente.cnpj}</Text>
                  {cliente.endereco && (
                    <Text className='text-sm text-gray-500' numberOfLines={1}>{cliente.endereco}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

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

      {/* Seção: Adicionar Itens */}
      <View className='mb-6 -z-10'>
        <Text className='text-2xl font-bold text-gray-800 mb-2'>Adicionar Itens</Text>

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
      <View className='mb-6 -z-10'>
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
      <View className='mb-10 -z-10'>
        <Text className='text-2xl font-bold mb-2'>Resumo</Text>
        
        {/* RECUPERADO: Campo de Observação Editável */}
        <Text className='font-bold text-base mb-1'>Observações:</Text>
        <TextInput 
          className='bg-white border border-gray-300 rounded-md px-3 py-2 text-base mb-4'
          value={observacoes}
          onChangeText={setObservacoes}
          placeholder='Ex: Pagamento por PIX, Vencimento em 30 dias...'
          multiline
        />

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

      {/* MODAL: SELECIONAR PRODUTO */}
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

      {/* MODAL: SELECIONAR QUANTIDADE */}
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