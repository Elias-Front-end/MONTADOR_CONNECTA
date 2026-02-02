#!/bin/sh

# Caminho para o arquivo index.html
INDEX_FILE="/app/dist/index.html"

# Verificar se as variáveis existem
if [ -z "$VITE_SUPABASE_URL" ]; then
  # Se não houver variável definida, usar localhost como fallback
  export VITE_SUPABASE_URL="http://localhost:8000"
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
  export VITE_SUPABASE_ANON_KEY="placeholder"
fi

# Definir se usa proxy
if [ -n "$INTERNAL_SUPABASE_URL" ]; then
  export USE_PROXY="true"
else
  export USE_PROXY="false"
fi

echo "Injetando variáveis de ambiente no frontend..."
echo "URL: $VITE_SUPABASE_URL"
echo "Proxy Mode: $USE_PROXY"

# Substituir o placeholder no index.html
# Usamos um delimitador diferente no sed (|) para evitar conflito com as barras da URL
sed -i "s|VITE_SUPABASE_URL: \"http://localhost:8000\"|VITE_SUPABASE_URL: \"$VITE_SUPABASE_URL\"|g" $INDEX_FILE
sed -i "s|VITE_SUPABASE_ANON_KEY: \"placeholder\"|VITE_SUPABASE_ANON_KEY: \"$VITE_SUPABASE_ANON_KEY\"|g" $INDEX_FILE

# Injeção manual do USE_PROXY já que não estava no placeholder original de forma limpa
# Vamos adicionar uma nova propriedade ao objeto window.__ENV__
sed -i "s|VITE_SUPABASE_ANON_KEY: \"$VITE_SUPABASE_ANON_KEY\"|VITE_SUPABASE_ANON_KEY: \"$VITE_SUPABASE_ANON_KEY\", USE_PROXY: \"$USE_PROXY\"|g" $INDEX_FILE

echo "Injeção concluída!"

# Iniciar o servidor Node
exec node dist-server/api/server.js
