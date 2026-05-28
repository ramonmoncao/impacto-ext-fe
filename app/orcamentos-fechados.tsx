import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api'; 
import MenuLayout from '../components/MenuLayout';
import { Ionicons } from '@expo/vector-icons'; 

interface ItemOrcamento {
  id: number;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

interface Orcamento {
  id: string; 
  nomeCliente: string; 
  dataEmissao: string; 
  valorTotal: number;
  status?: string; 
  itens: ItemOrcamento[];
  concluido: boolean; 
}

export default function OrcamentosFechados() {
  const router = useRouter();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros e Paginação
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'pendentes' | 'concluidos'>('pendentes');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 20;

  // Estados dos Modais de Ação e Confirmação
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);
  const [showActionModal, setShowActionModal] = useState<boolean>(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState<boolean>(false);

  const fetchOrcamentos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<Orcamento[]>('/api/orcamentos'); 
      setOrcamentos(response.data);
      setCurrentPage(1); 
    } catch (err: any) {
      console.error('Erro ao buscar orçamentos:', err);
      setError('Não foi possível carregar os orçamentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrcamentos();
  }, []);

  const toggleConcluido = async (id: string, currentStatus: boolean) => {
    try {
      setOrcamentos(prev => prev.map(o => o.id === id ? { ...o, concluido: !currentStatus } : o));
      await api.patch(`/api/orcamentos/${id}/status-conclusao`, { concluido: !currentStatus });
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      Alert.alert('Erro', 'Não foi possível atualizar o status no servidor.');
      fetchOrcamentos(); 
    }
  };

  // Abre as opções ao segurar o clique no card
  const handleCardLongPress = (orcamento: Orcamento) => {
    setSelectedOrcamento(orcamento);
    setShowActionModal(true);
  };

  // Redireciona para a tela de criação enviando os dados para edição
  const handleEdit = () => {
    setShowActionModal(false);
    if (selectedOrcamento) {
      // Navega para a tela de orçamento passando o ID e dados necessários por parâmetro
      router.push({
        pathname: '/orcamento',
        params: { editId: selectedOrcamento.id }
      });
    }
  };

  // Executa a exclusão definitiva no banco de dados
  const handleDeleteOrcamento = async () => {
    if (!selectedOrcamento) return;

    try {
      setShowConfirmDeleteModal(false);
      setLoading(true);
      
      // Chamada DELETE para o back-end
      await api.delete(`/api/orcamentos/${selectedOrcamento.id}`);
      
      // Remove do estado local para sumir da tela instantaneamente
      setOrcamentos(prev => prev.filter(o => o.id !== selectedOrcamento.id));
      setSelectedOrcamento(null);
      Alert.alert('Sucesso', 'Orçamento excluído com sucesso.');
    } catch (err) {
      console.error('Erro ao excluir orçamento:', err);
      Alert.alert('Erro', 'Não foi possível excluir o orçamento do servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Filtros combinados e regra de 30 dias
  const getProcessedAndFilteredOrcamentos = () => {
    const hoje = new Date().getTime();
    const UM_MES_EM_MS = 30 * 24 * 60 * 60 * 1000;

    const ativos = orcamentos.filter(item => {
      if (item.concluido && item.dataEmissao) {
        const dataEmissaoMs = new Date(item.dataEmissao).getTime();
        if (hoje - dataEmissaoMs > UM_MES_EM_MS) return false; 
      }
      return true;
    });

    return ativos.sort((a, b) => {
      if (statusFilter === 'pendentes') {
        if (a.concluido !== b.concluido) return a.concluido ? 1 : -1;
      } else {
        if (a.concluido !== b.concluido) return a.concluido ? -1 : 1;
      }
      const dateA = a.dataEmissao ? new Date(a.dataEmissao).getTime() : 0;
      const dateB = b.dataEmissao ? new Date(b.dataEmissao).getTime() : 0;
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  };

  const processedOrcamentos = getProcessedAndFilteredOrcamentos();
  const totalPages = Math.ceil(processedOrcamentos.length / ITEMS_PER_PAGE) || 1;
  const paginatedOrcamentos = processedOrcamentos.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const renderItem = ({ item }: { item: Orcamento }) => (
    // Transformado em TouchableOpacity com onLongPress para detectar o clique longo seguro
    <TouchableOpacity 
      activeOpacity={0.7}
      onLongPress={() => handleCardLongPress(item)}
      className={`p-4 mb-3 rounded-lg border shadow-sm mx-4 bg-white ${item.concluido ? 'border-green-200 bg-green-50/20' : 'border-gray-200'}`}
    >
      <View className="flex-row justify-between items-start mb-1">
        <Text className="text-gray-500 text-xs font-bold uppercase">
          Orçamento #{item.id ? item.id.substring(0, 8) : '---'}
        </Text>
        
        <TouchableOpacity 
          onPress={() => toggleConcluido(item.id, item.concluido)}
          className={`flex-row items-center px-2 py-1 rounded-md border ${item.concluido ? 'bg-green-100 border-green-400' : 'bg-gray-50 border-gray-300'}`}
        >
          <Ionicons name={item.concluido ? "checkbox" : "square-outline"} size={16} color={item.concluido ? "#15803d" : "#4b5563"} />
          <Text className={`text-xs font-semibold ml-1 ${item.concluido ? 'text-green-800' : 'text-gray-600'}`}>{item.concluido ? 'Concluído' : 'Pendente'}</Text>
        </TouchableOpacity>
      </View>
      
      <Text className="text-gray-800 text-base font-semibold mb-2">Cliente: {item.nomeCliente || 'Não informado'}</Text>
      
      <View className="flex-row justify-between items-center border-t border-gray-100 pt-2 mt-1">
        <Text className="text-gray-400 text-xs">{item.dataEmissao ? new Date(item.dataEmissao).toLocaleDateString('pt-BR') : 'Sem data'}</Text>
        <Text className="text-green-700 font-bold text-lg">R$ {item.valorTotal ? item.valorTotal.toFixed(2) : '0.00'}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderPaginationFooter = () => {
    if (processedOrcamentos.length <= ITEMS_PER_PAGE) return null;
    return (
      <View className="flex-row justify-center items-center py-4 bg-white border-t border-gray-200">
        <TouchableOpacity disabled={currentPage === 1} onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className={`p-2 rounded-md mx-2 ${currentPage === 1 ? 'opacity-30' : 'bg-gray-100'}`}><Ionicons name="chevron-back" size={20} color="#374151" /></TouchableOpacity>
        <Text className="text-gray-600 text-sm font-medium mx-4">Página {currentPage} de {totalPages}</Text>
        <TouchableOpacity disabled={currentPage === totalPages} onPress={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className={`p-2 rounded-md mx-2 ${currentPage === totalPages ? 'opacity-30' : 'bg-gray-100'}`}><Ionicons name="chevron-forward" size={20} color="#374151" /></TouchableOpacity>
      </View>
    );
  };

  return (
    <MenuLayout activeRoute="/orcamentos-fechados" pageTitle="Orçamentos Fechados">
      <SafeAreaView className="flex-1 bg-gray-50 pt-2">
        
        {/* Filtros */}
        {!loading && !error && orcamentos.length > 0 && (
          <View className="flex-row justify-between items-center px-4 mb-3">
            <TouchableOpacity onPress={() => { setStatusFilter(p => p === 'pendentes' ? 'concluidos' : 'pendentes'); setCurrentPage(1); }} className="bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-xs"><Text className="text-gray-600 text-xs font-medium">{statusFilter === 'pendentes' ? 'Pendentes primeiro' : 'Concluídos primeiro'}</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { setSortOrder(p => p === 'desc' ? 'asc' : 'desc'); setCurrentPage(1); }} className="flex-row items-center bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-xs"><Text className="text-gray-600 text-xs font-medium mr-1.5">{sortOrder === 'desc' ? 'Mais novos' : 'Mais velhos'}</Text><Ionicons name={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'} size={12} color="#4B5563" /></TouchableOpacity>
          </View>
        )}

        {loading && <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#DC2626" /></View>}

        {!loading && !error && (
          <View className="flex-1">
            <FlatList data={paginatedOrcamentos} keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 20 }} ListEmptyComponent={<View className="flex-1 justify-center items-center pt-20"><Text className="text-gray-400 text-base">Nenhum orçamento encontrado.</Text></View>} />
            {renderPaginationFooter()}
          </View>
        )}

        {/* ================= MODAL DE OPÇÕES (EDITAR / EXCLUIR) ================= */}
        <Modal visible={showActionModal} transparent animationType="fade" onRequestClose={() => setShowActionModal(false)}>
          <View className="flex-1 justify-center items-center bg-black/50 px-6">
            <View className="bg-white w-full rounded-2xl p-5 shadow-xl relative max-w-sm">
              
              {/* Botão X no topo */}
              <TouchableOpacity onPress={() => setShowActionModal(false)} className="absolute right-4 top-1 p-1 z-10">
                <Ionicons name="close" size={22} color="#9CA3AF" />
              </TouchableOpacity>

              <Text className="text-gray-800 text-lg font-bold text-center mt-2 mb-6">
                Você deseja editar esse orçamento?
              </Text>

              <View className="space-y-3">
                {/* Botão Editar Verde */}
                <TouchableOpacity onPress={handleEdit} className="w-full bg-green-600 py-3 rounded-xl flex-row justify-center items-center shadow-sm mb-3">
                  <Ionicons name="create-outline" size={18} color="#fff" className="mr-2" />
                  <Text className="text-white font-bold text-base ml-2">Editar Orçamento</Text>
                </TouchableOpacity>

                {/* Botão Excluir */}
                <TouchableOpacity onPress={() => { setShowActionModal(false); setShowConfirmDeleteModal(true); }} className="w-full bg-red-50 border border-red-200 py-3 rounded-xl flex-row justify-center items-center">
                  <Ionicons name="trash-outline" size={18} color="#DC2626" className="mr-2" />
                  <Text className="text-red-600 font-bold text-base ml-2">Excluir Orçamento</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ================= MODAL DE CONFIRMAÇÃO DE EXCLUSÃO ================= */}
        <Modal visible={showConfirmDeleteModal} transparent animationType="fade" onRequestClose={() => setShowConfirmDeleteModal(false)}>
          <View className="flex-1 justify-center items-center bg-black/50 px-6">
            <View className="bg-white w-full rounded-2xl p-6 shadow-xl max-w-sm text-center">
              
              <View className="items-center mb-3">
                <View className="bg-red-100 p-3 rounded-full">
                  <Ionicons name="warning-outline" size={28} color="#DC2626" />
                </View>
              </View>

              <Text className="text-gray-800 text-lg font-bold text-center mb-2">
                Deseja realmente excluir esse orçamento?
              </Text>
              <Text className="text-gray-500 text-sm text-center mb-6">
                Essa ação é permanente e removerá o registro do banco de dados.
              </Text>

              <View className="flex-row space-x-3 justify-between">
                <TouchableOpacity onPress={() => setShowConfirmDeleteModal(false)} className="flex-1 bg-gray-100 py-3 rounded-xl mr-2">
                  <Text className="text-gray-700 font-bold text-center text-base">Não, voltar</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleDeleteOrcamento} className="flex-1 bg-red-600 py-3 rounded-xl ml-2">
                  <Text className="text-white font-bold text-center text-base">Sim, excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </MenuLayout>
  );
}