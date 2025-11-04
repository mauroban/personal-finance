import { Category, Source } from '@/types'

// Define categories in a structured way
export const DEFAULT_CATEGORY_STRUCTURE = [
  {
    name: 'Moradia',
    subcategories: ['Aluguel', 'Condomínio', 'IPTU', 'Energia', 'Água', 'Gás', 'Internet/TV', 'Manutenção']
  },
  {
    name: 'Transporte',
    subcategories: ['Combustível', 'Manutenção do veículo', 'Estacionamento', 'Transporte público', 'Pedágios', 'IPVA/Seguro']
  },
  {
    name: 'Alimentação',
    subcategories: ['Supermercado', 'Restaurantes', 'Delivery', 'Lanche']
  },
  {
    name: 'Saúde',
    subcategories: ['Plano de saúde', 'Medicamentos', 'Consultas médicas', 'Academia']
  },
  {
    name: 'Educação',
    subcategories: ['Mensalidade escolar', 'Cursos', 'Livros e materiais', 'Idiomas']
  },
  {
    name: 'Lazer',
    subcategories: ['Streaming', 'Cinema/Shows', 'Viagens', 'Hobbies']
  },
  {
    name: 'Vestuário',
    subcategories: ['Roupas', 'Calçados', 'Acessórios']
  },
  {
    name: 'Despesas Pessoais',
    subcategories: ['Cabeleireiro/Barbeiro', 'Produtos de higiene', 'Cosméticos']
  },
  {
    name: 'Outros',
    subcategories: ['Presentes', 'Doações', 'Imprevistos']
  }
]

export const DEFAULT_SOURCES: Omit<Source, 'id'>[] = [
  { name: 'Salário' },
  { name: 'Freelance' },
  { name: 'Investimentos' },
  { name: 'Outros' },
]
