import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#1F2937",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
          tabBarStyle: { height: 62, paddingBottom: 7, paddingTop: 5 },
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Início", tabBarIcon: () => "🏠" }} />
        <Tabs.Screen name="usuarios" options={{ title: "Usuários", tabBarIcon: () => "👥" }} />
        <Tabs.Screen name="ferramentas" options={{ title: "Ferramentas", tabBarIcon: () => "🔧" }} />
        <Tabs.Screen name="emprestimos" options={{ title: "Empréstimos", tabBarIcon: () => "📋" }} />
      </Tabs>
    </>
  );
}
