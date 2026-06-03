import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import api from '../services/api'; 
import MenuLayout from '../components/MenuLayout';
import { Ionicons } from '@expo/vector-icons'; 

interface ItemOrcamento {
  id: number;
  descricaoProduto: string;
  quantidade: number;
  valorUnitario: number;
}

interface Orcamento {
  id: string; 
  nomeCliente: string; 
  cnpj?: string; 
  endereco?: string;
  telefone?: string;
  dataEmissao: string; 
  dataConclusao?: string; 
  valorTotal: number;
  usuarioResponsavel?: string;
  itens: ItemOrcamento[];
  concluido: boolean; 
}

type TipoFiltroStatus = 'todos' | 'vencidos' | 'breve' | 'regulares' | 'permanentes';

export default function TabelaVencimento() {
  const [orcamentosConcluidos, setOrcamentosConcluidos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [statusFilter, setStatusFilter] = useState<TipoFiltroStatus>('todos');

  const fetchOrcamentosConcluidos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/orcamentos?page=0&size=200'); 
      // CORREÇÃO: Sintaxe JS correta ( => ) em vez da flecha do Java ( -> )
      const apenasConcluidos = response.data.content ? response.data.content.filter((o: any) => o.concluido === true) : [];
      setOrcamentosConcluidos(apenasConcluidos);
    } catch (err: any) {
      console.error('Erro ao carregar vencimentos:', err);
      setError('Não foi possível carregar os dados de vencimento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrcamentosConcluidos();
  }, []);

  const obterStatusVencimento = (item: Orcamento) => {
    if (!item.dataConclusao) return { tipo: 'regular', texto: 'REGULAR', corClasse: 'bg-green-100 text-green-800 border-green-200', dataVencimento: null };

    const possuiRecargaOuExtintor = item.itens && item.itens.some(sub => {
      const desc = (sub.descricaoProduto || '').toLowerCase();
      return desc.includes('recarga') || desc.includes('extintor') || desc.includes('manutenção') || desc.includes('pqs') || desc.includes('co2');
    });

    if (!possuiRecargaOuExtintor) {
      return { tipo: 'permanente', texto: 'PERMANENTE (VENDA DE ITEM)', corClasse: 'bg-blue-100 text-blue-800 border-blue-200', dataVencimento: null };
    }

    const dataConclusao = new Date(item.dataConclusao);
    const dataVencimento = new Date(dataConclusao.getFullYear() + 1, dataConclusao.getMonth(), dataConclusao.getDate());
    const hoje = new Date();

    const diferencaTempo = dataVencimento.getTime() - hoje.getTime();
    const diferencaDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));

    if (diferencaDias < 0) {
      return { tipo: 'vencido', texto: 'RECARGA VENCIDA', corClasse: 'bg-red-100 text-red-800 border-red-200', dataVencimento };
    } else if (diferencaDias <= 30) {
      return { tipo: 'breve', texto: `VENCE EM ${diferencaDias} DIAS`, corClasse: 'bg-amber-100 text-amber-800 border-amber-200', dataVencimento };
    } else {
      return { tipo: 'regular', texto: 'REGULAR (NO PRAZO)', corClasse: 'bg-green-100 text-green-800 border-green-200', dataVencimento };
    }
  };

  const calcularAlertasAtivos = () => {
    return orcamentosConcluidos.filter(o => {
      const status = obterStatusVencimento(o);
      return status.tipo === 'vencido' || status.tipo === 'breve';
    }).length;
  };

  const getFilteredOrcamentos = () => {
    return orcamentosConcluidos.filter(o => {
      const status = obterStatusVencimento(o);
      if (statusFilter === 'vencidos') return status.tipo === 'vencido';
      if (statusFilter === 'breve') return status.tipo === 'breve';
      if (statusFilter === 'regulares') return status.tipo === 'regular';
      if (statusFilter === 'permanentes') return status.tipo === 'permanente';
      return true;
    });
  };

  const renderItem = ({ item }: { item: Orcamento }) => {
    const isExpanded = expandedId === item.id;
    const status = obterStatusVencimento(item);

    return (
      <View className="bg-white mb-3 rounded-xl border border-gray-200 shadow-xs mx-4 overflow-hidden">
        <TouchableOpacity activeOpacity={0.8} onPress={() => setExpandedId(isExpanded ? null : item.id)} className="p-4 flex-row justify-between items-center">
          <View className="flex-1 mr-2">
            <View className="flex-row items-center gap-x-2 mb-1 flex-wrap">
              <Text className="text-gray-500 text-xs font-bold uppercase">Cód: {item.id ? item.id.substring(0, 8) : '---'}</Text>
              <View className={`px-2 py-0.5 rounded-md border ${status.corClasse}`}><Text className="text-[10px] font-extrabold">{status.texto}</Text></View>
            </View>
            <Text className="text-gray-900 text-base font-bold" numberOfLines={1}>{item.nomeCliente || 'Cliente não identificado'}</Text>
            <Text className="text-gray-400 text-xs mt-1">Instalação/Conclusão: {item.dataConclusao ? new Date(item.dataConclusao).toLocaleDateString('pt-BR') : 'Não registrada'}</Text>
            {status.dataVencimento && <Text className="text-gray-600 text-xs font-semibold mt-0.5">Próxima Manutenção: {status.dataVencimento.toLocaleDateString('pt-BR')}</Text>}
          </View>
          <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {isExpanded && (
          <View className="bg-gray-50/70 p-4 border-t border-gray-100 space-y-3">
            <View className="bg-white p-3 rounded-lg border border-gray-200/60">
              <Text className="text-xs font-bold text-gray-400 uppercase mb-1">Metadados de Venda</Text>
              <Text className="text-gray-700 text-xs font-semibold"><Text className="font-bold text-gray-900">Vendedor: </Text>{item.usuarioResponsavel || 'Não cadastrado'}</Text>
              <Text className="text-gray-700 text-xs font-semibold mt-1"><Text className="font-bold text-gray-900">Endereço: </Text>{item.endereco || 'Não informado'}</Text>
            </View>

            <View className="bg-white rounded-lg border border-gray-200/60 overflow-hidden">
              <View className="bg-gray-200/50 px-3 py-1.5 flex-row border-b border-gray-200"><Text className="flex-[3] text-xs font-bold text-gray-500">Produtos</Text><Text className="flex-1 text-xs font-bold text-gray-500 text-center">Qtd</Text></View>
              {item.itens && item.itens.length > 0 ? (
                item.itens.map((subItem, index) => (
                  <View key={subItem.id || index} className="px-3 py-2 flex-row border-b border-gray-100 items-center">
                    <Text className="flex-[3] text-gray-800 text-xs font-medium" numberOfLines={2}>{subItem.descricaoProduto || 'Produto/Serviço'}</Text>
                    <Text className="flex-1 text-gray-600 text-xs text-center font-bold">{subItem.quantidade}</Text>
                  </View>
                ))
              ) : (
                <Text className="p-3 text-xs text-gray-400 italic">Nenhum item registrado.</Text>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <MenuLayout activeRoute="/tabela-vencimento" pageTitle="Tabela de Vencimento">
      <SafeAreaView className="flex-1 bg-gray-50 pt-3">
        {!loading && !error && orcamentosConcluidos.length > 0 && (
          <View className="mx-4 mb-3 bg-white p-3 rounded-xl border border-gray-200 flex-row justify-around items-center shadow-xs">
            <View className="items-center"><Text className="text-xs font-bold text-gray-400">Total Concluídos</Text><Text className="text-xl font-extrabold text-gray-800">{orcamentosConcluidos.length}</Text></View>
            <View className="w-px h-8 bg-gray-200" />
            <View className="items-center"><Text className="text-xs font-bold text-gray-400">Revisar Alertas</Text><Text className="text-xl font-extrabold text-red-600 flex-row items-center"><Ionicons name="alert-circle" size={18} color="#dc2626" /> {calcularAlertasAtivos()} Críticos</Text></View>
          </View>
        )}

        {!loading && !error && orcamentosConcluidos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, marginBottom: 8, gap: 8 }} className="max-h-10">
            {(['todos', 'vencidos', 'breve', 'regulares', 'permanentes'] as TipoFiltroStatus[]).map((tipo) => (
              <TouchableOpacity key={tipo} onPress={() => setStatusFilter(tipo)} className={`px-3 py-1.5 rounded-full border ${statusFilter === tipo ? 'bg-red-600 border-red-600' : 'bg-white border-gray-200'}`}>
                <Text className={`text-xs font-bold capitalize ${statusFilter === tipo ? 'text-white' : 'text-gray-600'}`}>{tipo === 'breve' ? 'Vence em Breve' : tipo === 'permanentes' ? 'Vendas Fixas' : tipo}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {loading && <View className="flex-1 justify-center items-center py-10"><ActivityIndicator size="large" color="#DC2626" /></View>}

        {!loading && !error && (
        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
          {getFilteredOrcamentos().length > 0 ? (
            getFilteredOrcamentos().map((item, index) => {
              const uniqueKey = item.id ? item.id.toString() : `venc-${index}`;
              return (
                <React.Fragment key={uniqueKey}>
                  {renderItem({ item })}
                </React.Fragment>
              );
            })
          ) : (
            <View className="flex-1 justify-center items-center pt-20 px-6">
              <Ionicons name="checkmark-circle-outline" size={44} color="#9CA3AF" />
              <Text className="text-gray-400 text-sm text-center mt-2">Nenhum registro encontrado nesta categoria.</Text>
            </View>
          )}
        </ScrollView>
      )}
      </SafeAreaView>
    </MenuLayout>
  );
}