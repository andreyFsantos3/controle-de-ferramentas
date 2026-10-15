export type Usuario = {
  id: number;
  nome: string;
  email: string;
  departamento: string;
};

export type Ferramenta = {
  id: number;
  nome: string;
  categoria: string;
  status: string;
};

export type Emprestimo = {
  id: number;
  usuario_id: number;
  ferramentas_id: number;
  data_emprestimo: string;
  data_devolucao: string | null;
};
