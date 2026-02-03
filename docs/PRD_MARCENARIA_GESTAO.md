# Product Requirements Document (PRD) - Montador Conecta: Módulo Gestão Marcenaria

## 1. Visão Geral
Módulo SaaS focado em Marcenarias e Lojistas para gestão completa de ordens de serviço de montagem, permitindo a conexão eficiente com montadores parceiros. O sistema prioriza um modelo "Pull", onde a empresa disponibiliza as oportunidades e os montadores parceiros aceitam conforme disponibilidade.

## 2. Perfis de Usuário (Roles)
- **Empresa (Marcenaria/Lojista):** Cria ordens de serviço, gerencia parcerias, avalia montadores.
- **Montador (Parceiro):** Visualiza oportunidades disponíveis, aceita serviços, gerencia sua agenda e equipe.
- **Admin:** Gestão global da plataforma.

## 3. Funcionalidades Principais

### 3.1. Portal de Empresas (Dashboard)
- **Visão Geral:** KPIs (Serviços em aberto, Concluídos mês, Gasto total, Avaliação média dos parceiros).
- **Gestão de Parceiros:** Lista de montadores vinculados. Convite para novos montadores.

### 3.2. Cadastro e Gestão de Serviços
- **Criação de OS:** Formulário com:
  - Cliente (Nome, Endereço integrado Google Maps, Telefone).
  - Detalhes (Ambiente, Tipo de Móvel, Complexidade).
  - Documentação (Upload de plantas, fotos, manuais).
  - Valor ofertado (ou a combinar).
  - Prazo desejado.
- **Fluxo de Contratação (CORREÇÃO CRÍTICA):**
  1. Empresa publica o serviço para sua rede de parceiros (ou pública).
  2. Serviço fica com status `Disponível`.
  3. Montadores recebem notificação.
  4. **Montador analisa e ACEITA o serviço.** (A empresa não aloca arbitrariamente).
  5. Status muda para `Agendado`.

### 3.3. Calendário Interativo
- **Visão Empresa:** Vê todos os serviços agendados e seus status.
- **Visão Montador:** Vê sua própria agenda e "slots" livres.
- **Funcionalidades:** Drag & Drop (apenas para reagendamento com confirmação), Cores por status (Pendente, Confirmado, Em Andamento, Concluído).

### 3.4. Gestão de Equipes (Montador)
- O Montador "Líder" que aceita o serviço pode indicar quais ajudantes/membros da sua equipe irão participar.
- A Empresa visualiza "Quem vai": Líder + Equipe.

### 3.5. Sistema de Qualificação
- **Avaliação Bilateral:** Empresa avalia Montador (Pontualidade, Limpeza, Técnica).
- **Ranking:** Montadores com melhores notas aparecem em destaque para novas parcerias.
- **Justificativa:** Obrigatória para notas baixas (< 3 estrelas).

## 4. Regras de Negócio
1. **Indisponibilidade:** Montador pode bloquear datas (Férias/Folga). Nesses dias, ele não recebe ofertas urgentes.
2. **Priorização:** Serviços marcados como "Urgente" são destacados e podem ter valor diferenciado.
3. **Comissionamento:** Sistema calcula % devida à plataforma (se aplicável) ou bônus por meta de 5 estrelas.
4. **Geolocalização:** Integração com Google Maps para validar se o montador atende a região do serviço.

## 5. Requisitos Não Funcionais
- **Performance:** Carregamento de listas de serviços < 1s.
- **Responsividade:** Uso total em Mobile para Montadores (PWA).
- **Segurança:** Dados de clientes finais (endereço/telefone) visíveis apenas após o aceite do serviço.
