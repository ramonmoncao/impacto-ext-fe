import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: "#060606", fontSize: 24, fontWeight: "bold" }}>
        Hello, World!
      </Text>
    </SafeAreaView>
  );
}
