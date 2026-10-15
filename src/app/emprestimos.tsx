import { useCallback, useState } from "react";
import { Alert, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { apiGet, apiPost, apiPut } from "../api";
import { colors, styles as common } from "../theme";
import type { Emprestimo, Usuario, Ferramenta } from "../types";

function hoje() {
  return new Date().toISOString().slice(0, 10);
}
function formatar(data: string | null) {
  if (!data) return "-";
  const [y, m, d] = data.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export default function EmprestimosScreen() {
  const [lista, setLista] = useState<Emprestimo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [ferramentas, setFerramentas] = useState<Ferramenta[]>([]);
  const [busca, setBusca] = useState("");
  const [modal, setModal] = useState(false);
  const [id, setId] = useState("");
  const [usuarioId, setUsuarioId] = useState("");
  const [ferramentaId, setFerramentaId] = useState("");
  const [dataEmprestimo, setDataEmprestimo] = useState(hoje());
  const [dataDevolucao, setDataDevolucao] = useState("");
  const [loading, setLoading] = useState(false);

  const carregar = async () => {
    try {
      const [e, u, f] = await Promise.all([
        apiGet<Emprestimo[]>("/emprestimos"),
        apiGet<Usuario[]>("/usuarios"),
        apiGet<Ferramenta[]>("/ferramentas"),
      ]);
      setLista(e); setUsuarios(u); setFerramentas(f);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os empréstimos.");
    }
  };
  useFocusEffect(useCallback(() => { carregar(); }, []));

  const filtrados = lista.filter((e) =>
    `${e.id} ${e.usuario_id} ${e.ferramentas_id} ${e.data_emprestimo} ${e.data_devolucao ?? ""}`
      .toLowerCase().includes(busca.toLowerCase())
  );

  const nomeUsuario = (id: number) => usuarios.find((u) => u.id === id)?.nome ?? `Usuário ${id}`;
  const nomeFerramenta = (id: number) => ferramentas.find((f) => f.id === id)?.nome ?? `Ferramenta ${id}`;

  const salvar = async () => {
    if (!id || !usuarioId || !ferramentaId || !dataEmprestimo) {
      Alert.alert("Atenção", "Preencha ID, usuário, ferramenta e data.");
      return;
    }
    if (lista.some((e) => e.id === Number(id))) {
      Alert.alert("Atenção", "Esse ID já existe.");
      return;
    }
    if (!usuarios.some((u) => u.id === Number(usuarioId))) {
      Alert.alert("Atenção", "O ID do usuário não existe.");
      return;
    }
    const ferramenta = ferramentas.find((f) => f.id === Number(ferramentaId));
    if (!ferramenta) {
      Alert.alert("Atenção", "O ID da ferramenta não existe.");
      return;
    }

    try {
      setLoading(true);
      await apiPost("/emprestimos", {
        id: Number(id),
        usuario_id: Number(usuarioId),
        ferramentas_id: Number(ferramentaId),
        data_emprestimo: dataEmprestimo,
        data_devolucao: dataDevolucao || null,
      });
      setModal(false);
      setId(""); setUsuarioId(""); setFerramentaId(""); setDataEmprestimo(hoje()); setDataDevolucao("");
      await carregar();
      Alert.alert("Sucesso", "Empréstimo cadastrado.");
    } catch (e) {
      Alert.alert("Erro", e instanceof Error ? e.message : "Não foi possível cadastrar.");
    } finally { setLoading(false); }
  };

  const devolver = async (emprestimo: Emprestimo) => {
    if (emprestimo.data_devolucao) return;
    Alert.alert("Devolver ferramenta", "Confirmar devolução desta ferramenta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Devolver",
        onPress: async () => {
          try {
            await apiPut(`/emprestimos/${emprestimo.id}/devolver`);
            await carregar();
          } catch (e) {
            Alert.alert("Erro", e instanceof Error ? e.message : "Não foi possível registrar a devolução.");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content}
      refreshControl={<RefreshControl refreshing={false} onRefresh={carregar} />}>
      <Text style={common.title}>Empréstimos</Text>
      <Text style={common.subtitle}>
        {lista.filter((e) => !e.data_devolucao).length} ativo(s) • {lista.filter((e) => e.data_devolucao).length} devolvido(s)
      </Text>

      <TouchableOpacity style={common.button} onPress={() => setModal(true)}>
        <Text style={common.buttonText}>+ Novo empréstimo</Text>
      </TouchableOpacity>

      <TextInput style={[common.input, { marginTop: 14 }]} placeholder="Pesquisar..." value={busca} onChangeText={setBusca} />

      {filtrados.map((e) => {
        const ativo = !e.data_devolucao;
        return (
          <View style={common.card} key={e.id}>
            <View style={common.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.title}>Empréstimo #{e.id}</Text>
                <Text style={s.meta}>👤 {nomeUsuario(e.usuario_id)}</Text>
                <Text style={s.meta}>🔧 {nomeFerramenta(e.ferramentas_id)}</Text>
                <Text style={s.meta}>Saída: {formatar(e.data_emprestimo)}</Text>
                <Text style={s.meta}>Devolução: {formatar(e.data_devolucao)}</Text>
              </View>
              <View style={[s.badge, { backgroundColor: ativo ? colors.successBg : colors.border }]}>
                <Text style={{ color: ativo ? colors.success : colors.muted, fontSize: 11, fontWeight: "800" }}>
                  {ativo ? "ATIVO" : "DEVOLVIDO"}
                </Text>
              </View>
            </View>

            {ativo && (
              <TouchableOpacity style={s.returnButton} onPress={() => devolver(e)}>
                <Text style={s.returnText}>Registrar devolução</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
      {filtrados.length === 0 && <Text style={s.empty}>Nenhum empréstimo encontrado.</Text>}

      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={s.overlay}><ScrollView style={s.modal}>
          <Text style={s.modalTitle}>Novo empréstimo</Text>
          <TextInput style={common.input} placeholder="ID do empréstimo" keyboardType="numeric" value={id} onChangeText={setId} />
          <TextInput style={common.input} placeholder="ID do usuário" keyboardType="numeric" value={usuarioId} onChangeText={setUsuarioId} />
          <TextInput style={common.input} placeholder="ID da ferramenta" keyboardType="numeric" value={ferramentaId} onChangeText={setFerramentaId} />
          <TextInput style={common.input} placeholder="Data do empréstimo (AAAA-MM-DD)" value={dataEmprestimo} onChangeText={setDataEmprestimo} />
          <TextInput style={common.input} placeholder="Data de devolução (opcional)" value={dataDevolucao} onChangeText={setDataDevolucao} />
          <TouchableOpacity style={common.button} onPress={salvar} disabled={loading}>
            <Text style={common.buttonText}>{loading ? "Salvando..." : "Salvar empréstimo"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.cancel} onPress={() => setModal(false)}>
            <Text style={s.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView></View>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 16, fontWeight: "800", color: colors.text, marginBottom: 6 },
  meta: { fontSize: 12, color: colors.muted, marginTop: 3 },
  badge: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 6, alignSelf: "flex-start" },
  returnButton: { marginTop: 14, borderWidth: 1, borderColor: colors.primary, borderRadius: 10, padding: 11, alignItems: "center" },
  returnText: { color: colors.primary, fontWeight: "800" },
  empty: { textAlign: "center", color: colors.muted, marginTop: 25 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,.45)", justifyContent: "flex-end" },
  modal: { maxHeight: "88%", backgroundColor: "#FFF", padding: 20, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  modalTitle: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: 14 },
  cancel: { alignItems: "center", padding: 14 },
  cancelText: { color: colors.muted, fontWeight: "700" },
});
