import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface MenuLayoutProps {
  children: React.ReactNode;
  activeRoute: string;
  pageTitle: string;
  hasUnsavedChanges?: boolean; // Propriedade nova para travar o menu
}

export default function MenuLayout({
  children,
  activeRoute,
  pageTitle,
  hasUnsavedChanges = false,
}: MenuLayoutProps) {
  const [menuAberto, setMenuAberto] = useState(false);
  const router = useRouter();
  const { usuario } = useLocalSearchParams();

  const handleNavegacao = (rota: string) => {
    // 1. Primeiro fechamos o menu
    setMenuAberto(false);

    // 2. Criamos a função de navegação com um pequeno delay para evitar conflito com o Modal
    const executarNavegacao = () => {
      setTimeout(() => {
        if (activeRoute !== rota) {
          router.push({
            pathname: rota as any,
            params: { usuario },
          });
        }
      }, 100); // 100ms é o suficiente para o Modal fechar sem o usuário notar
    };

    // 3. Lógica do Alerta
    if (hasUnsavedChanges) {
      Alert.alert(
        'Atenção',
        'Você inseriu informações sobre um novo cliente mas elas não foram salvas, deseja realmente voltar?',
        [
          {
            text: 'Não',
            style: 'cancel',
          },
          {
            text: 'Sim',
            style: 'destructive',
            onPress: () => executarNavegacao(), // Força a execução da nossa função
          },
        ],
        { cancelable: true },
      );
    } else {
      executarNavegacao();
    }
  };

  const getMenuClass = (rota: string) => (activeRoute === rota ? 'bg-gray-300' : '');
  const getTextClass = (rota: string) => (activeRoute === rota ? 'text-[#cc0000]' : 'text-black');

  return (
    <SafeAreaView className='flex-1 bg-[#ffffff]'>
      <StatusBar barStyle='light-content' backgroundColor='black' />

      {/* CABEÇALHO PRETO FIXO NO TOPO */}
      <View className='bg-black flex-row items-center justify-between px-4 py-3'>
        <TouchableOpacity onPress={() => setMenuAberto(true)}>
          <Feather name='menu' size={32} color='gray' />
        </TouchableOpacity>

        {/* Adicione o style={{ width: 128, height: 48 }} na imagem */}
        <Image
          source={require('../assets/images/impacto_logo2.png')}
          style={{ width: 128, height: 48 }}
          resizeMode='contain'
        />

        <View className='w-8' />
      </View>

      {/* ÁREA ROLÁVEL COM CONTEÚDO */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'
      >
        <ScrollView className='flex-1 px-4 py-2 mt-2'>
          <View className='flex-row justify-between mb-6 px-2'>
            <Text className='text-[#cc0000] text-xl font-bold border-b-2 border-[#cc0000]'>
              {pageTitle}
            </Text>
            <Text className='text-[#cc0000] text-xl font-bold'>{usuario || 'Usuário'}</Text>
          </View>

          {children}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MENU LATERAL (MODAL) */}
      <Modal
        animationType='fade'
        transparent={true}
        visible={menuAberto}
        onRequestClose={() => setMenuAberto(false)}
      >
        <View className='flex-1 flex-row'>
          <View className='w-3/4 bg-[#dcdcdc] h-full p-6 pt-12 shadow-2xl'>
            <View className='flex-row justify-between items-center mb-10'>
              <Text className='text-2xl font-extrabold text-black'>Menu</Text>
              <TouchableOpacity onPress={() => setMenuAberto(false)}>
                <Feather name='x' size={32} color='black' />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className={`p-4 rounded-lg mb-4 ${getMenuClass('/orcamento')}`}
              onPress={() => handleNavegacao('/orcamento')}
            >
              <Text className={`text-lg font-bold text-center ${getTextClass('/orcamento')}`}>
                Novo Orçamento
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`p-4 rounded-lg mb-4 ${getMenuClass('/orcamentos-fechados')}`}
              onPress={() => handleNavegacao('/orcamentos-fechados')}
            >
              <Text
                className={`text-lg font-bold text-center ${getTextClass('/orcamentos-fechados')}`}
              >
                Orçamentos Fechados
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`p-4 rounded-lg mb-4 ${getMenuClass('/tabela-vencimento')}`}
              onPress={() => handleNavegacao('/tabela-vencimento')}
            >
              <Text
                className={`text-lg font-bold text-center ${getTextClass('/tabela-vencimento')}`}
              >
                Tabela de Vencimento
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`p-4 rounded-lg mb-4 ${getMenuClass('/produto')}`}
              onPress={() => handleNavegacao('/produto')}
            >
              <Text className={`text-lg font-bold text-center ${getTextClass('/produto')}`}>
                Produto
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className='mt-auto flex-row justify-center items-center p-4'
              onPress={() => {
                setMenuAberto(false);
                router.replace('/');
              }}
            >
              <Feather name='log-out' size={24} color='black' />
              <Text className='text-black text-lg font-bold ml-2'>Sair</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className='w-1/4 bg-black/50'
            onPress={() => setMenuAberto(false)}
            activeOpacity={1}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}
