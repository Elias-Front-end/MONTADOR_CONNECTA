# Guia de Estilo Visual - Montador Conecta

## 1. Cores

O sistema utiliza uma paleta de cores baseada em azul e cinza, transmitindo profissionalismo, confiança e sobriedade.

### Cores Principais

| Nome | Hex | Tailwind Class | Uso |
|------|-----|----------------|-----|
| **Brand Navy** | `#0F3F59` | `text-primary`, `bg-primary` | Cor principal da marca, cabeçalhos, botões primários. |
| **Brand Gray** | `#7A7A7A` | `text-secondary`, `bg-secondary` | Texto secundário, elementos de suporte, logo. |
| **Action Blue** | `#0066CC` | `text-accent`, `bg-accent` | Botões de ação, links, destaques. |

### Cores de Fundo

| Nome | Hex | Tailwind Class | Uso |
|------|-----|----------------|-----|
| **Background** | `#F8FAFC` | `bg-background` | Fundo principal da aplicação. |
| **Card/White** | `#FFFFFF` | `bg-white`, `bg-card` | Fundo de cartões, modais e áreas de conteúdo. |

---

## 2. Tipografia

A fonte padrão é a família sans-serif do sistema (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, etc.), garantindo legibilidade e performance nativa.

- **Títulos:** Bold (`font-bold`), Cor Primária (`text-primary` ou `text-blue-900`).
- **Texto Corpo:** Regular (`font-normal`), Cor Cinza Escuro (`text-gray-700`).
- **Texto Apoio:** Regular (`font-normal`), Cor Cinza Médio (`text-gray-500`).

---

## 3. Componentes

### Logo

O componente `<Logo />` deve ser utilizado para exibir a marca.

```tsx
import { Logo } from '@/components/Logo';

// Padrão (Vertical, Fundo Claro)
<Logo />

// Horizontal (Para Headers)
<Logo layout="horizontal" size="sm" />

// Fundo Escuro (Texto Branco)
<Logo theme="light" />
```

### Botões

```tsx
// Primário
<button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover">
  Confirmar
</button>

// Secundário / Outline
<button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50">
  Cancelar
</button>
```

---

## 4. Ícones

Utilizamos a biblioteca `lucide-react` para ícones. Os ícones devem seguir a cor do texto onde estão inseridos, ou usar `text-primary` para destaque.

---

## 5. Exemplo de Layout

A estrutura padrão de páginas deve seguir:
1. Header (com Logo Horizontal)
2. Conteúdo Principal (`max-w-7xl mx-auto`)
3. Footer (Escuro, com Logo Light)
