# Instruções para Deploy no EasyPanel

## 1. Variáveis de Ambiente do APP (Frontend/Backend)

Ao criar o serviço do **Montador Conecta** (o App) no EasyPanel, vá na aba **Environment** e adicione:

```env
# A URL onde o seu Supabase está acessível (Ex: https://supabase.seu-dominio.com)
# IMPORTANTE: O Frontend roda no navegador do usuário, então esta URL deve ser pública (não use localhost ou nomes internos do docker)
VITE_SUPABASE_URL=https://<SEU_DOMINIO_SUPABASE>

# A Chave Anônima (Copiada do seu Supabase recém-criado)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE

# Porta interna do container (Obrigatório 3000)
PORT=3000
```

## 2. Configuração do Banco de Dados (Supabase)

Você precisará rodar o script SQL para criar as tabelas necessárias para o App funcionar.
Acesse o **SQL Editor** do seu Supabase (Studio) e execute o conteúdo do arquivo `supabase_schema.sql` que está na raiz deste projeto.

## 3. Build e Deploy

O projeto já contém um `Dockerfile` configurado para receber essas variáveis durante o build. Certifique-se de que o EasyPanel esteja injetando as variáveis `VITE_*` no momento do **Build** (Build Args) ou que o Dockerfile as pegue do ambiente se configurado para tal.

*Nota: No nosso Dockerfile atual, usamos `ARG` para injetar essas variáveis. Se o EasyPanel não passar `build_args` automaticamente das env vars, o frontend pode ficar sem a configuração correta. Certifique-se de definir essas variáveis na seção de "Build Args" do EasyPanel se houver, ou apenas nas Environment Variables se o EasyPanel tratar ambas.*
