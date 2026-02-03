# Documentação da Estrutura do Banco de Dados (v2.0)

Este documento descreve a nova arquitetura do banco de dados do **Montador Conecta**, reconstruída do zero para garantir integridade, segurança (RLS) e performance.

## 1. Visão Geral
O banco utiliza **PostgreSQL** com **Supabase**. A autenticação é gerenciada pelo `auth.users` do Supabase, que se conecta 1:1 com a tabela pública `profiles`.

### Tipos de Usuário (Roles)
- **montador**: Profissional que executa os serviços.
- **partner**: Dono/Gestor de Marcenaria ou Loja de Móveis.
- **admin**: Administrador do sistema.

## 2. Tabelas Principais

### `public.profiles`
Tabela central de usuários.
- `id`: UUID (PK, FK -> auth.users)
- `role`: Enum (montador, partner, admin)
- `company_id`: UUID (FK -> companies) - Se o usuário pertence a uma empresa.
- `skills`: Array de Texto - Habilidades do montador.
- `cpf`, `phone`, `region`: Dados cadastrais.

### `public.companies`
Entidade jurídica (Marcenaria/Loja).
- `id`: UUID (PK)
- `owner_id`: UUID (FK -> profiles) - Quem criou a conta.
- `cnpj`, `trading_name`: Dados da empresa.
- `settings`: JSONB - Configurações de branding/notificação.

### `public.services`
O coração do sistema (Ordens de Serviço).
- `id`: UUID (PK)
- `company_id`: UUID (FK -> companies) - Empresa dona da OS.
- `montador_id`: UUID (FK -> profiles) - Montador alocado (pode ser NULL se estiver 'published').
- `status`: Enum (draft, published, scheduled, in_progress, completed, cancelled, disputed).
- `price`: Decimal - Valor do serviço.
- `scheduled_for`: Timestamp - Data da montagem.
- `client_info`: JSONB - Dados do cliente final (ocultos até o aceite, via RLS futuro se necessário).
- `address_full`: Texto - Local da montagem.

### `public.partnerships`
Vínculo de confiança entre Empresa e Montador.
- `company_id`: UUID
- `montador_id`: UUID
- `status`: Enum (pending, active, rejected).
> Regra: Montadores só veem serviços 'published' de empresas com quem têm parceria 'active'.

## 3. Segurança (Row Level Security - RLS)

Todas as tabelas possuem RLS habilitado. Para evitar o erro de **Infinite Recursion**, utilizamos uma View de segurança (`vw_profile_structure`).

### Políticas Chave:
1.  **Services INSERT**: Apenas usuários vinculados a uma `company_id` podem criar.
2.  **Services SELECT**:
    *   Dono da empresa vê tudo.
    *   Montador vê serviços atribuídos a ele (`montador_id`).
    *   Montador vê serviços 'published' **SE** tiver parceria ativa com a empresa (Pull Model).
3.  **Services UPDATE**:
    *   Empresa edita tudo.
    *   Montador pode "Aceitar" (UPDATE montador_id) se o serviço estiver 'published' e sem dono.

## 4. Como Resetar o Banco
Para aplicar esta estrutura limpa:

1.  Acesse o **SQL Editor** do Supabase.
2.  Vá em **Settings -> Database -> Reset** (Cuidado! Isso apaga tudo).
3.  Ou, manualmente, apague as tabelas `public`.
4.  Copie e cole o conteúdo de `database_setup.sql`.
5.  Execute.

## 5. Próximos Passos (Frontend)
O Frontend deve ser atualizado para:
1.  Garantir que ao criar usuário, o trigger `handle_new_user` funcione (já implementado).
2.  Ao criar serviço, enviar apenas os dados do formulário (o `company_id` é inferido ou deve ser enviado se o usuário tiver acesso a múltiplas empresas).
3.  Tratar os status `published` (Oportunidades) vs `scheduled` (Meus Serviços).
