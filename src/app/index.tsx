import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { apiGet } from "../api";
import { colors, styles as common } from "../theme";
import type { Usuario, Ferramenta, Emprestimo } from "../types";

export default function HomeScreen() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [ferramentas, setFerramentas] = useState<Ferramenta[]>([]);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = async () => {
    try {
      setRefreshing(true);
      const [u, f, e] = await Promise.all([
        apiGet<Usuario[]>("/usuarios"),
        apiGet<Ferramenta[]>("/ferramentas"),
        apiGet<Emprestimo[]>("/emprestimos"),
      ]);
      setUsuarios(u);
      setFerramentas(f);
      setEmprestimos(e);
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { carregar(); }, []));

  const ativos = emprestimos.filter((e) => !e.data_devolucao).length;
  const disponiveis = ferramentas.filter(
    (f) => f.status?.toLowerCase() === "disponível" || f.status?.toLowerCase() === "disponivel"
  ).length;

  return (
    <ScrollView
      style={common.screen}
      contentContainerStyle={common.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={carregar} />}
    >
      <Text style={common.title}>Controle de Ferramentas</Text>
      <Text style={common.subtitle}>Informações</Text>

      <View style={s.hero}>
        <Text style={s.heroIcon}>🔧</Text>
        <View>
          <Text style={s.heroTitle}>Gestão de ferramentas</Text>
          <Text style={s.heroText}>Acompanhe usuários, ferramentas e empréstimos.</Text>
        </View>
      </View>

      <View style={s.grid}>
        <Stat title="Usuários" value={usuarios.length} icon="👥" />
        <Stat title="Ferramentas" value={ferramentas.length} icon="🔧" />
        <Stat title="Disponíveis" value={disponiveis} icon="✅" />
        <Stat title="Empréstimos ativos" value={ativos} icon="📋" />
      </View>

      <View style={common.card}>
        <Text style={s.sectionTitle}>Status</Text>
        <Text style={s.info}>Toque nas abas abaixo para cadastrar e consultar os dados.</Text>
      </View>
    </ScrollView>
  );
}

function Stat({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <View style={s.stat}>
      <Text style={s.statIcon}>{icon}</Text>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statTitle}>{title}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  heroIcon: { fontSize: 38, marginRight: 14 },
  heroTitle: { color: "#FFF", fontSize: 18, fontWeight: "800" },
  heroText: { color: "#D1D5DB", fontSize: 12, marginTop: 4, maxWidth: 240 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 2 },
  stat: {
    width: "48%",
    minHeight: 128,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: { fontSize: 24 },
  statValue: { fontSize: 30, fontWeight: "800", color: colors.text, marginTop: 8 },
  statTitle: { fontSize: 12, color: colors.muted, marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: colors.text, marginBottom: 5 },
  info: { color: colors.muted, lineHeight: 20 },
});
