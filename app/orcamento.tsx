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
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MenuLayout from '../components/MenuLayout';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
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

interface ItemCarrinho {
  id: string;
  descricao: string;
  qtd: number;
  unit: number;
  total: number;
}

export default function Orcamento() {
  const { usuario, editId } = useLocalSearchParams();
  const router = useRouter();

  // Estados principais
  const [nomeUsuarioLogado, setNomeUsuarioLogado] = useState<any>(usuario);
  const [buscaClienteText, setBuscaClienteText] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState<any>(null);
  const [clientesResultados, setClientesResultados] = useState<any[]>([]);
  const [observacoes, setObservacoes] = useState('');
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [loadingEdicao, setLoadingEdicao] = useState<boolean>(false);
  const [produtosApi, setProdutosApi] = useState<any[]>([]);

  // Controles dos Dropdowns e Seleções
  const [produtoSelecionado, setProdutoSelecionado] = useState(PRODUTOS_MOCK[0]);
  const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(1);
  const [modalProdutoVisivel, setModalProdutoVisivel] = useState(false);
  const [modalQtdVisivel, setModalQtdVisivel] = useState(false);

  // Estados de Desconto e Preço Customizado
  const [desconto, setDesconto] = useState('');
  const [modalPrecoVisivel, setModalPrecoVisivel] = useState(false);
  const [produtoEditandoPreco, setProdutoEditandoPreco] = useState<any>(null);
  const [novoPrecoInput, setNovoPrecoInput] = useState('');

  const ultimaBuscaRef = useRef(''); // Vigia Anti-Fantasma

  // EFECT 1: Busca o nome do vendedor no Java caso receba só o email
  useEffect(() => {
    if (usuario && typeof usuario === 'string' && usuario.includes('@')) {
      api
        .get(`/users/buscarPorEmail`, { params: { email: usuario } })
        .then((response) => {
          if (response.data && (response.data.nome || response.data.name)) {
            setNomeUsuarioLogado(response.data.nome || response.data.name);
          }
        })
        .catch(() => console.log('Usando email como fallback.'));
    } else if (usuario) {
      setNomeUsuarioLogado(usuario);
    }
  }, [usuario]);

  useEffect(() => {
    const buscarProdutos = async () => {
      try {
        const response = await api.get('/products');

        const produtosFormatados = response.data.map((prod: any) => ({
          id: prod.id,
          descricao: prod.name,
          valor: prod.price,
        }));

        setProdutosApi(produtosFormatados);
        setProdutoSelecionado(produtosFormatados[0]);
      } catch (error) {
        console.error('Erro ao buscar produtos do banco', error);
        setProdutosApi(PRODUTOS_MOCK);
      }
    };

    buscarProdutos();
  }, []);

  // EFECT 2: Captura e Preenche os dados caso seja uma Edição
  useEffect(() => {
    if (editId) {
      const carregarOrcamentoParaEdicao = async () => {
        try {
          setLoadingEdicao(true);
          const response = await api.get(`/api/orcamentos/${editId}`);
          const orcamentoSalvo = response.data;

          if (orcamentoSalvo) {
            setClienteSelecionado({
              nome: orcamentoSalvo.nomeCliente,
              endereco: orcamentoSalvo.endereco,
              telefone: orcamentoSalvo.telefone,
            });
            setBuscaClienteText(orcamentoSalvo.nomeCliente || '');
            setObservacoes(orcamentoSalvo.observacoes || '');

            if (orcamentoSalvo.usuarioResponsavel) {
              setNomeUsuarioLogado(orcamentoSalvo.usuarioResponsavel);
            } else {
              setNomeUsuarioLogado(usuario);
            }

            if (orcamentoSalvo.itens && Array.isArray(orcamentoSalvo.itens)) {
              const itensMapeados: ItemCarrinho[] = orcamentoSalvo.itens.map(
                (item: any, idx: number) => ({
                  id: item.id ? item.id.toString() : `edit-${idx}-${Date.now()}`,
                  descricao: item.descricaoProduto || item.descricao || 'Produto não identificado',
                  qtd: item.quantidade || 1,
                  unit: item.valorUnitario || 0,
                  total: (item.quantidade || 1) * (item.valorUnitario || 0),
                }),
              );
              setItens(itensMapeados);
            }
          }
        } catch (error) {
          console.error('Erro ao carregar orçamento para edição:', error);
          Alert.alert('Erro', 'Não foi possível carregar os dados originais do orçamento.');
        } finally {
          setLoadingEdicao(false);
        }
      };

      carregarOrcamentoParaEdicao();
    }
  }, [editId]);

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

  // PREÇO CUSTOMIZADO (SIGILOSO)
  const handleLongPressProduto = (item: any) => {
    setProdutoEditandoPreco(item);
    setNovoPrecoInput(item.valor.toFixed(2).replace('.', ','));
    setModalPrecoVisivel(true);
  };

  const salvarPrecoCustomizado = () => {
    const precoFloat = parseFloat(novoPrecoInput.replace(',', '.'));
    if (isNaN(precoFloat) || precoFloat < 0) {
      Alert.alert('Erro', 'Por favor, insira um valor válido.');
      return;
    }

    const produtoCustomizado = {
      ...produtoEditandoPreco,
      descricao: produtoEditandoPreco.descricao, // Mantém o nome 100% original e sigiloso
      valor: precoFloat,
    };

    setProdutoSelecionado(produtoCustomizado);
    setModalPrecoVisivel(false);
    setModalProdutoVisivel(false);
  };

  // Cálculos do Orçamento
  const subtotal = itens.reduce((acumulador, item) => acumulador + item.total, 0);
  let valorDesconto = 0;
  const percentualDesconto = parseFloat(desconto.replace(/\D/g, ''));

  if (!isNaN(percentualDesconto) && percentualDesconto > 0 && percentualDesconto <= 100) {
    valorDesconto = subtotal * (percentualDesconto / 100);
  }
  const totalDoOrcamento = subtotal - valorDesconto;

  const handleSalvarOrcamento = async (mostrarAlerta = true): Promise<string | null> => {
    if (!clienteSelecionado) {
      Alert.alert('Atenção', 'Busque ou cadastre um cliente antes de salvar o orçamento.');
      return null;
    }
    if (itens.length === 0) {
      Alert.alert('Atenção', 'O carrinho está vazio.');
      return null;
    }

    let observacoesFinais = observacoes;
    if (valorDesconto > 0) {
      observacoesFinais += observacoesFinais ? `\n\n` : '';
      observacoesFinais += `* Desconto aplicado: ${percentualDesconto}% (- R$ ${valorDesconto.toFixed(2).replace('.', ',')})`;
    }

    try {
      const payloadOrcamento = {
        nomeCliente: clienteSelecionado.nome,
        endereco: clienteSelecionado.endereco,
        telefone: clienteSelecionado.telefone,
        numero: clienteSelecionado.numero,
        cnpj: clienteSelecionado.cnpj,
        rua: clienteSelecionado.rua,
        cidade: clienteSelecionado.cidade,
        bairro: clienteSelecionado.bairro,
        usuarioResponsavel: nomeUsuarioLogado,
        observacoes: observacoesFinais,
        valorTotal: totalDoOrcamento,
        itens: itens.map((item) => ({
          descricaoProduto: item.descricao,
          quantidade: item.qtd,
          valorUnitario: item.unit,
        })),
      };

      let response;

      if (editId) {
        response = await api.put(`/api/orcamentos/${editId}`, payloadOrcamento);
        if (mostrarAlerta) {
          Alert.alert('Sucesso!', 'Orçamento atualizado com sucesso no banco de dados!');
        }

        router.replace({
          pathname: '/orcamentos-fechados',
          params: { usuario },
        });
      } else {
        response = await api.post('/api/orcamentos', payloadOrcamento);
        if (mostrarAlerta) {
          Alert.alert('Sucesso!', 'Orçamento salvo com sucesso no banco de dados!');
        }
      }

      setItens([]);
      setClienteSelecionado(null);
      setBuscaClienteText('');
      setObservacoes('');
      setDesconto('');

      return editId ? (editId as string) : response.data.id;
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Erro',
        `Falha ao ${editId ? 'atualizar' : 'salvar'} orçamento no banco de dados.`,
      );
      return null;
    }
  };

  const handleGerarPdf = async () => {
    const orcamentoId = await handleSalvarOrcamento(false);
    if (!orcamentoId) return;

    try {
      Alert.alert('Processando', 'Gerando o seu documento PDF...');

      const nomeArquivo = `Orcamento_${Date.now()}.pdf`;
      const localUri = `${FileSystem.documentDirectory}${nomeArquivo}`;
      const urlBe = `${api.defaults.baseURL}/api/orcamentos/${orcamentoId}/pdf`;

      const downloadResult = await FileSystem.downloadAsync(urlBe, localUri);

      if (downloadResult.status === 200) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Visualizar Orçamento',
          UTI: 'com.adobe.pdf',
        });

        if (editId) {
          router.replace({
            pathname: '/orcamentos-fechados',
            params: { usuario },
          });
        }
      } else {
        Alert.alert('Erro', 'O servidor não conseguiu gerar o PDF.');
      }
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      Alert.alert('Erro', 'Falha ao baixar o arquivo PDF do servidor.');
    }
  };

  if (loadingEdicao) {
    return (
      <MenuLayout activeRoute='/orcamento' pageTitle='Editando Orçamento'>
        <View className='flex-1 justify-center items-center py-20'>
          <ActivityIndicator size='large' color='#cc0000' />
          <Text className='text-gray-500 mt-2 font-medium'>Buscando dados no servidor...</Text>
        </View>
      </MenuLayout>
    );
  }

  return (
    <MenuLayout activeRoute='/orcamento' pageTitle={editId ? `Editar Orçamento` : `Novo Orçamento`}>
      {editId && (
        <View className='bg-green-100 border border-green-300 rounded-xl p-3 mb-4 flex-row items-center'>
          <Feather name='edit' size={16} color='#15803d' />
          <Text className='text-green-800 text-xs font-bold ml-2 uppercase'>
            Modo de Edição Ativo (Orçamento #{editId.toString().substring(0, 8)})
          </Text>
        </View>
      )}

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
              onChangeText={handleBuscarClienteLive}
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
                    <Text className='text-sm text-gray-500' numberOfLines={1}>
                      {cliente.endereco}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View className='mt-3 bg-transparent p-1'>
          {clienteSelecionado ? (
            <>
              <Text className='text-gray-800 text-base font-bold'>Cliente: <Text className='font-normal'>{clienteSelecionado.nome}</Text></Text>
              <Text className='text-gray-800 text-base font-bold'>Endereço: <Text className='font-normal'>{clienteSelecionado.endereco || 'Não informado'}</Text></Text>
              <Text className='text-gray-800 text-base font-bold'>Telefone: <Text className='font-normal'>{clienteSelecionado.telefone || 'Não informado'}</Text></Text>
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
              R$: {produtoSelecionado ? produtoSelecionado.valor.toFixed(2).replace('.', ',') : '0,00'}
            </Text>
          </Text>
        </View>

        <TouchableOpacity className='bg-[#cc0000] w-1/2 self-center py-2 rounded-full items-center shadow-sm' onPress={handleAdicionarItem}>
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
              <Text className='flex-[2] text-sm' numberOfLines={2}>{item.descricao}</Text>
              <Text className='flex-1 text-center text-sm'>{item.qtd}</Text>
              <Text className='flex-1 text-center text-sm'>R$ {item.unit.toFixed(2).replace('.', ',')}</Text>
              <Text className='flex-1 text-center text-sm font-bold'>R$ {item.total.toFixed(2).replace('.', ',')}</Text>

              <TouchableOpacity className='w-8 items-end' onPress={() => handleRemoverItem(item.id)}>
                <View className='bg-[#cc0000] rounded-full p-1'>
                  <Feather name='x' size={14} color='white' />
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Seção: Resumo e Rodapé */}
      <View className='mb-10 -z-10'>
        <View className="flex-row justify-between items-center mb-2">
          <Text className='text-2xl font-bold'>Resumo</Text>
          <View className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full border border-gray-300">
            <Feather name="percent" size={14} color="#cc0000" />
            <Text className="font-bold text-sm ml-1 mr-2 text-gray-700">Desc:</Text>
            <TextInput 
              className="w-10 text-center font-bold text-base text-[#cc0000]"
              placeholder="0"
              keyboardType="numeric"
              maxLength={2}
              value={desconto}
              onChangeText={setDesconto}
            />
          </View>
        </View>

        <Text className='font-bold text-base mb-1'>Observações:</Text>
        <TextInput
          className='bg-white border border-gray-300 rounded-md px-3 py-2 text-base mb-4'
          value={observacoes}
          onChangeText={setObservacoes}
          placeholder='Ex: Pagamento por PIX, Vencimento em 30 dias...'
          multiline
        />

        <View className="mb-6">
          {valorDesconto > 0 && (
            <Text className="text-right text-gray-500 font-bold line-through">
              De R$ {subtotal.toFixed(2).replace('.', ',')}
            </Text>
          )}
          <Text className='text-xl text-right font-bold'>
            Total: <Text className='text-[#cc0000] text-3xl ml-2'>R$ {totalDoOrcamento.toFixed(2).replace('.', ',')}</Text>
          </Text>
        </View>

        <View className='flex-row gap-x-4'>
          <TouchableOpacity className='flex-1 bg-green-600 py-3 rounded-full items-center shadow-md' onPress={() => handleSalvarOrcamento()}>
            <Text className='text-white font-bold text-lg'>{editId ? 'Atualizar' : 'Salvar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity className='flex-1 bg-[#cc0000] py-3 rounded-full items-center shadow-md' onPress={handleGerarPdf}>
            <Text className='text-white font-bold text-lg'>{editId ? 'Atualizar PDF' : 'Gerar PDF'}</Text>
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

                <View className="bg-yellow-100 p-2 border-b border-yellow-300 flex-row items-center">
                  <Feather name="info" size={14} color="#b45309" className="mr-2"/>
                  <Text className="text-yellow-800 text-xs flex-1 ml-1">Pressione e segure um item da lista para definir um preço especial exclusivo para este orçamento.</Text>
                </View>

                <FlatList
                  data={produtosApi}
                  keyExtractor={(item) => item.id}
                  className='p-2'
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className='p-4 border-b border-gray-200 flex-row justify-between items-center'
                      onPress={() => {
                        setProdutoSelecionado(item);
                        setModalProdutoVisivel(false);
                      }}
                      onLongPress={() => handleLongPressProduto(item)}
                      delayLongPress={400}
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

      {/* MODAL: PREÇO CUSTOMIZADO (Long Press) */}
      <Modal visible={modalPrecoVisivel} transparent={true} animationType='fade'>
        <View className='flex-1 justify-center bg-black/70 px-6'>
          <View className='bg-white rounded-2xl p-6 shadow-xl'>
            <View className="flex-row items-center mb-2">
              <Feather name="tag" size={20} color="#cc0000" />
              <Text className='text-xl font-bold text-gray-800 ml-2'>Preço Sob Medida</Text>
            </View>
            <Text className='text-gray-600 mb-6 leading-5'>
              Defina um valor exclusivo para <Text className="font-bold">"{produtoEditandoPreco?.descricao}"</Text> apenas neste orçamento:
            </Text>
            
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2 border border-gray-300 mb-6">
              <Text className="text-xl font-bold text-gray-500 mr-2">R$</Text>
              <TextInput
                className='flex-1 text-2xl font-bold text-[#cc0000]'
                keyboardType='numeric'
                value={novoPrecoInput}
                onChangeText={setNovoPrecoInput}
                autoFocus
              />
            </View>

            <View className='flex-row gap-x-3'>
              <TouchableOpacity className='flex-1 bg-gray-400 py-3 rounded-xl items-center' onPress={() => setModalPrecoVisivel(false)}>
                <Text className='text-white font-bold text-base'>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity className='flex-1 bg-green-600 py-3 rounded-xl items-center' onPress={salvarPrecoCustomizado}>
                <Text className='text-white font-bold text-base'>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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