# Especificação Técnica - Módulo Corporativo (SaaS)

## 1. Arquitetura de Dados (Supabase/PostgreSQL)

### 1.1. Novas Tabelas e Alterações

#### `corporate_profiles` (Extensão de `profiles` para Empresas)
- `id` (FK profiles.id)
- `cnpj`
- `trading_name` (Nome Fantasia)
- `address_full`
- `settings` (JSONB: preferências de notificação, branding)

#### `service_orders` (Ordens de Serviço)
- `id` (UUID)
- `company_id` (FK profiles.id)
- `accepted_by` (FK profiles.id - Montador) -> **Definido pelo aceite do montador**
- `status` (ENUM: 'draft', 'published', 'scheduled', 'in_progress', 'completed', 'cancelled', 'disputed')
- `client_info` (JSONB: { name, phone, address, coordinates })
- `service_details` (JSONB: { environments, items, complexity })
- `documents` (Array de URLs do Storage)
- `price` (Decimal)
- `scheduled_at` (Timestamp)
- `completed_at` (Timestamp)
- `is_urgent` (Boolean)

#### `service_team_allocation` (Equipe do Montador)
- `service_id` (FK service_orders.id)
- `member_name` (Text - ou FK se ajudantes tiverem conta)
- `role` (Helper, Lead, etc.)

#### `reviews`
- `service_id` (FK service_orders.id)
- `reviewer_id` (FK profiles.id)
- `target_id` (FK profiles.id)
- `rating` (1-5)
- `categories` (JSONB: { punctuality: 5, clean: 4, technical: 5 })
- `comment` (Text)

#### `availability_blocks`
- `montador_id` (FK profiles.id)
- `start_at`
- `end_at`
- `reason` (Text)

### 1.2. Row Level Security (RLS)

- **Services:**
  - `INSERT`: Apenas Empresas (role = 'company').
  - `SELECT`: 
    - Empresa dona.
    - Montadores Parceiros (se status = 'published').
    - Montador Aceitante (qualquer status).
  - `UPDATE (Aceite)`: 
    - Montador Parceiro pode fazer UPDATE em `accepted_by` e `status` SE `status` for 'published' e `accepted_by` for NULL.
  
## 2. Frontend Architecture (React/Vite)

### 2.1. Módulos
- **`src/pages/corporate/*`**: Rotas exclusivas para empresas.
- **`src/pages/montador/*`**: Rotas exclusivas para montadores.

### 2.2. Componentes Chave
- `<ServiceBoard />`: Kanban ou Lista de serviços (Abertos, Agendados, Concluídos).
- `<CalendarView />`: Wrapper do `react-big-calendar` ou similar customizado.
- `<ServiceForm />`: Wizard de criação de OS (Dados Cliente -> Dados Móveis -> Arquivos -> Revisão).
- `<TeamSelector />`: Componente para o montador listar quem vai na obra.

## 3. Integrações Externas
- **Google Maps API:**
  - `Places Autocomplete` no formulário de endereço.
  - `Distance Matrix` para calcular deslocamento (opcional).

## 4. Fluxo de Negócio: "O Montador Escolhe"

1. **Publicação:** Empresa posta OS. `status` = 'published'.
2. **Notificação:** Trigger do Supabase envia notificação (Email/Push/In-App) para montadores da tabela `partnerships`.
3. **Visualização:** Montador abre app, vê lista "Oportunidades".
4. **Ação:** Montador clica em "Aceitar Serviço".
5. **Transação:**
   - Verifica se `status` ainda é 'published'.
   - Atualiza `accepted_by` = `auth.uid()`.
   - Atualiza `status` = 'scheduled'.
   - Bloqueia concorrência (Optimistic Locking ou verificação SQL).
6. **Confirmação:** Empresa recebe notificação "Fulano aceitou seu serviço".

## 5. Migração de Banco de Dados
Scripts SQL serão criados para:
1. Criar tabelas novas.
2. Atualizar políticas RLS existentes.
3. Criar buckets de storage para documentos técnicos (`service-docs`).
