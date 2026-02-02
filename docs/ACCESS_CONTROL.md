# Controle de Acesso e Qualificações (Fase 4)

Este documento detalha o sistema de controle de acesso implementado para garantir que apenas montadores qualificados possam visualizar e aceitar serviços.

## Regras de Negócio

1.  **Visibilidade de Serviços**:
    *   Um montador só pode ver um serviço (`status = 'open'`) se:
        *   Tiver vínculo ativo (`partnerships.status = 'active'`) com a marcenaria dona do serviço.
        *   Possuir **TODAS** as qualificações (`skills`) exigidas pelo serviço (`required_skills`).
    *   Serviços sem requisitos de skills são visíveis para qualquer montador vinculado.

2.  **Aceite de Serviços**:
    *   A mesma regra de visibilidade se aplica ao aceite.
    *   Se o montador perder uma qualificação ou o serviço mudar os requisitos enquanto ele visualiza a tela, a tentativa de aceite falhará (bloqueio via RLS no banco).

3.  **Visibilidade de Perfis**:
    *   Montadores **NÃO** podem ver a lista de outros montadores (Regra de Privacidade).
    *   Marcenarias (Partners) podem ver perfis de montadores para enviar convites.

## Estrutura de Dados

### Tabela `profiles` (Colunas Relevantes)
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `skills` | `TEXT[]` | Array de strings com as competências do montador (ex: `['Móveis Planejados', 'Elétrica']`) |

### Tabela `services` (Colunas Relevantes)
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `required_skills` | `TEXT[]` | Array de skills obrigatórias para aceitar o serviço. |

## Endpoints e Payloads (Supabase)

### 1. Atualizar Skills do Montador
*   **Método**: `UPDATE` (via Client SDK)
*   **Tabela**: `profiles`
*   **Payload**:
    ```json
    {
      "skills": ["Móveis Planejados", "Instalação de TV"]
    }
    ```

### 2. Criar Serviço com Requisitos
*   **Método**: `INSERT`
*   **Tabela**: `services`
*   **Payload**:
    ```json
    {
      "title": "Montagem Complexa",
      "required_skills": ["Móveis Planejados"],
      ...
    }
    ```

### 3. Listar Oportunidades (Montador)
*   **Query**:
    ```typescript
    supabase
      .from('services')
      .select('*')
      .eq('status', 'open')
    ```
*   **Nota**: Não é necessário filtrar por skills no frontend. A política RLS (Row Level Security) do Postgres filtra automaticamente.

## Testes de Segurança

O sistema conta com testes automatizados (`src/tests/access_control.test.ts`) que verificam:
*   Bloqueio de visualização sem skills.
*   Bloqueio de visualização sem vínculo.
*   Sucesso quando requisitos são atendidos.
