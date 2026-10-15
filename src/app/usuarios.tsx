import { useCallback, useState } from "react";
import { Alert, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { apiGet, apiPost } from "../api";
import { colors, styles as common } from "../theme";
import type { Usuario } from "../types";

export default function UsuariosScreen() {
  const [lista, setLista] = useState<Usuario[]>([]);
  const [busca, setBusca] = useState("");
  const [modal, setModal] = useState(false);
  const [id, setId] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [loading, setLoading] = useState(false);

  const carregar = async () => {
    try { setLista(await apiGet<Usuario[]>("/usuarios")); }
    catch { Alert.alert("Erro", "Não foi possível carregar os usuários."); }
  };
  useFocusEffect(useCallback(() => { carregar(); }, []));

  const filtrados = lista.filter((u) =>
    `${u.id} ${u.nome} ${u.email} ${u.departamento}`.toLowerCase().includes(busca.toLowerCase())
  );

  const salvar = async () => {
    if (!id || !nome || !email || !departamento) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }
    if (lista.some((u) => u.id === Number(id))) {
      Alert.alert("Atenção", "Esse ID já existe.");
      return;
    }
    try {
      setLoading(true);
      await apiPost("/usuarios", { id: Number(id), nome, email, departamento });
      setModal(false);
      setId(""); setNome(""); setEmail(""); setDepartamento("");
      await carregar();
      Alert.alert("Sucesso", "Usuário cadastrado.");
    } catch (e) {
      Alert.alert("Erro", e instanceof Error ? e.message : "Não foi possível cadastrar.");
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content}
      refreshControl={<RefreshControl refreshing={false} onRefresh={carregar} />}>
      <Text style={common.title}>Usuários</Text>
      <Text style={common.subtitle}>{lista.length} usuário(s) cadastrado(s)</Text>

      <TouchableOpacity style={common.button} onPress={() => setModal(true)}>
        <Text style={common.buttonText}>+ Novo usuário</Text>
      </TouchableOpacity>

      <TextInput style={[common.input, { marginTop: 14 }]} placeholder="Pesquisar..." value={busca} onChangeText={setBusca} />

      {filtrados.map((u) => (
        <View style={common.card} key={u.id}>
          <View style={common.row}>
            <View style={s.avatar}><Text>👤</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{u.nome}</Text>
              <Text style={s.meta}>ID: {u.id} • {u.departamento}</Text>
              <Text style={s.meta}>{u.email}</Text>
            </View>
          </View>
        </View>
      ))}
      {filtrados.length === 0 && <Text style={s.empty}>Nenhum usuário encontrado.</Text>}

      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={s.overlay}><View style={s.modal}>
          <Text style={s.modalTitle}>Novo usuário</Text>
          <TextInput style={common.input} placeholder="ID" keyboardType="numeric" value={id} onChangeText={setId} />
          <TextInput style={common.input} placeholder="Nome" value={nome} onChangeText={setNome} />
          <TextInput style={common.input} placeholder="E-mail" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <TextInput style={common.input} placeholder="Departamento" value={departamento} onChangeText={setDepartamento} />
          <TouchableOpacity style={common.button} onPress={salvar} disabled={loading}>
            <Text style={common.buttonText}>{loading ? "Salvando..." : "Salvar"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.cancel} onPress={() => setModal(false)}>
            <Text style={s.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center", marginRight: 12 },
  name: { fontSize: 16, fontWeight: "800", color: colors.text },
  meta: { fontSize: 12, color: colors.muted, marginTop: 3 },
  empty: { textAlign: "center", color: colors.muted, marginTop: 25 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,.45)", justifyContent: "flex-end" },
  modal: { backgroundColor: "#FFF", padding: 20, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  modalTitle: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: 14 },
  cancel: { alignItems: "center", padding: 14 },
  cancelText: { color: colors.muted, fontWeight: "700" },
});
