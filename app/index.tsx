import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  Platform 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <Text style={{ color: '#060606', fontSize: 24, fontWeight: 'bold' }}>
      Hello, World!
    </Text>
  );
}
