import { useCallback, useState } from "react";
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { apiGet, apiPost } from "../api";
import { colors, styles as common } from "../theme";
import type { Ferramenta } from "../types";

export default function FerramentasScreen() {
  const [lista, setLista] = useState<Ferramenta[]>([]);
  const [busca, setBusca] = useState("");
  const [modal, setModal] = useState(false);
  const [id, setId] = useState("");
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [status, setStatus] = useState("Disponível");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = async () => {
    try {
      const ferramentas = await apiGet<Ferramenta[]>("/ferramentas");
      setLista(ferramentas);
    } catch {
      Alert.alert(
        "Erro",
        "Não foi possível carregar as ferramentas. Verifique a conexão com a API."
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [])
  );

  const atualizar = async () => {
    setRefreshing(true);
    try {
      await carregar();
    } finally {
      setRefreshing(false);
    }
  };

  const filtradas = lista.filter((f) =>
    `${f.id} ${f.nome} ${f.categoria} ${f.status}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  const limparFormulario = () => {
    setId("");
    setNome("");
    setCategoria("");
    setStatus("Disponível");
  };

  const salvar = async () => {
    const idNumerico = Number(id);

    if (
      !id.trim() ||
      !nome.trim() ||
      !categoria.trim() ||
      !status.trim()
    ) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
      Alert.alert("Atenção", "Informe um ID numérico válido.");
      return;
    }

    if (lista.some((f) => Number(f.id) === idNumerico)) {
      Alert.alert("Atenção", "Esse ID já existe.");
      return;
    }

    try {
      setLoading(true);

      await apiPost("/ferramentas", {
        id: idNumerico,
        nome: nome.trim(),
        categoria: categoria.trim(),
        status: status.trim(),
      });

      setModal(false);
      limparFormulario();

      await carregar();

      Alert.alert("Sucesso", "Ferramenta cadastrada.");
    } catch (e) {
      Alert.alert(
        "Erro",
        e instanceof Error
          ? e.message
          : "Não foi possível cadastrar a ferramenta."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={common.screen}
      contentContainerStyle={common.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={atualizar}
        />
      }
    >
      <Text style={common.title}>Ferramentas</Text>

      <Text style={common.subtitle}>
        {lista.length} ferramenta(s) cadastrada(s)
      </Text>

      <TouchableOpacity
        style={common.button}
        onPress={() => setModal(true)}
      >
        <Text style={common.buttonText}>+ Nova ferramenta</Text>
      </TouchableOpacity>

      <TextInput
        style={[common.input, { marginTop: 14 }]}
        placeholder="Pesquisar ferramentas..."
        value={busca}
        onChangeText={setBusca}
      />

      {filtradas.map((f) => {
        const disponivel =
          f.status?.toLowerCase() === "disponível" ||
          f.status?.toLowerCase() === "disponivel";

        return (
          <View style={common.card} key={f.id}>
            <View style={common.row}>
              <Text style={s.icon}>🔧</Text>

              <View style={{ flex: 1 }}>
                <Text style={s.name}>{f.nome}</Text>

                <Text style={s.meta}>
                  ID: {f.id} • {f.categoria}
                </Text>
              </View>

              <View
                style={[
                  s.badge,
                  {
                    backgroundColor: disponivel
                      ? colors.successBg
                      : colors.warningBg,
                  },
                ]}
              >
                <Text
                  style={{
                    color: disponivel
                      ? colors.success
                      : colors.warning,
                    fontSize: 11,
                    fontWeight: "800",
                  }}
                >
                  {f.status}
                </Text>
              </View>
            </View>
          </View>
        );
      })}

      {filtradas.length === 0 && (
        <Text style={s.empty}>
          Nenhuma ferramenta encontrada.
        </Text>
      )}

      <Modal
        visible={modal}
        transparent
        animationType="slide"
        onRequestClose={() => setModal(false)}
      >
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Nova ferramenta</Text>

            <TextInput
              style={common.input}
              placeholder="ID"
              keyboardType="numeric"
              value={id}
              onChangeText={setId}
            />

            <TextInput
              style={common.input}
              placeholder="Nome"
              value={nome}
              onChangeText={setNome}
            />

            <TextInput
              style={common.input}
              placeholder="Categoria"
              value={categoria}
              onChangeText={setCategoria}
            />

            <TextInput
              style={common.input}
              placeholder="Status (ex.: Disponível)"
              value={status}
              onChangeText={setStatus}
            />

            <TouchableOpacity
              style={[
                common.button,
                loading && { opacity: 0.6 },
              ]}
              onPress={salvar}
              disabled={loading}
            >
              <Text style={common.buttonText}>
                {loading ? "Salvando..." : "Salvar"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.cancel}
              onPress={() => {
                if (!loading) {
                  setModal(false);
                }
              }}
              disabled={loading}
            >
              <Text style={s.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  icon: {
    fontSize: 28,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  meta: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 3,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  empty: {
    textAlign: "center",
    color: colors.muted,
    marginTop: 25,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#FFF",
    padding: 20,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 14,
  },
  cancel: {
    alignItems: "center",
    padding: 14,
  },
  cancelText: {
    color: colors.muted,
    fontWeight: "700",
  },
});