import { Source } from '@/types'

// Define categories in a structured way
export const DEFAULT_CATEGORY_STRUCTURE = [
  {
    name: 'Moradia',
    subcategories: ['Aluguel', 'Condomínio', 'IPTU', 'Energia', 'Água', 'Gás', 'Internet/TV', 'Manutenção', 'Móveis e decoração']
  },
  {
    name: 'Transporte',
    subcategories: ['Combustível', 'Manutenção do veículo', 'Estacionamento', 'Transporte público', 'Pedágios', 'IPVA', 'Seguro do veículo', 'Aplicativo de transporte']
  },
  {
    name: 'Alimentação',
    subcategories: ['Supermercado', 'Restaurantes', 'Delivery', 'Lanche', 'Feira']
  },
  {
    name: 'Saúde',
    subcategories: ['Plano de saúde', 'Medicamentos', 'Consultas médicas', 'Dentista', 'Exames laboratoriais', 'Academia', 'Equipamentos', 'Farmácia']
  },
  {
    name: 'Educação',
    subcategories: ['Mensalidade escolar', 'Cursos', 'Livros e materiais', 'Idiomas', 'Material escolar']
  },
  {
    name: 'Lazer',
    subcategories: ['Streaming', 'Cinema/Shows', 'Viagens', 'Hobbies', 'Festas', 'Jogos', 'Esportes']
  },
  {
    name: 'Vestuário',
    subcategories: ['Roupas', 'Calçados', 'Acessórios', 'Roupas infantis']
  },
  {
    name: 'Despesas Pessoais',
    subcategories: ['Cabeleireiro/Barbeiro', 'Produtos de higiene', 'Cosméticos', 'Supérfluos', 'Celular', 'Pet']
  },
  {
    name: 'Outros',
    subcategories: ['Presentes', 'Doações', 'Imprevistos', 'Taxas bancárias', 'Seguros diversos']
  }
]

export const DEFAULT_SOURCES: Omit<Source, 'id'>[] = [
  { name: 'Salário' },
  { name: 'Freelance' },
  { name: 'Investimentos' },
  { name: 'Outros' },
]
