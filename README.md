# Minha Dieta

App pessoal (PWA) para dieta, rotina e lista de compras — instalável no celular
e no PC, sem App Store, de graça, com editor visual e integração por API para
Claude e Gemini editarem seus dados por comando.

- **Dieta**: a tela inicial mostra em destaque a refeição do dia da semana
  atual, com os 7 dias navegáveis e edição rápida (nome, horário, itens).
- **Rotina**: atividades diárias ou específicas de um dia da semana, com
  checklist de "feito hoje".
- **Compras**: lista com checklist, por categoria, gerada automaticamente a
  partir dos ingredientes da dieta da semana (ou editada manualmente).
- **Integração com IA**: endpoints HTTP autenticados por token, para você
  pedir no chat ("muda minha dieta de quarta", "marca leite na lista") e a
  IA editar direto no banco.

---

## 1. Stack e arquitetura

| Camada         | Tecnologia                                             |
| -------------- | ------------------------------------------------------- |
| Frontend/Backend | Next.js 16 (App Router), React 19, TypeScript, Tailwind v4 |
| Banco de dados | Supabase (Postgres gerenciado, plano free)              |
| PWA            | Manifest + Service Worker (instalável, sem loja)         |
| Hospedagem     | Vercel (plano free)                                      |
| Autenticação UI | PIN de acesso próprio (cookie assinado), sem conta/e-mail |
| Autenticação IA | Token Bearer dedicado (`AI_API_TOKEN`), separado do PIN  |

Por quê essa combinação: tudo roda nos planos gratuitos, sincroniza
automaticamente entre celular e PC (os dados ficam no Supabase, não no
aparelho), e o PWA se "instala" direto do navegador — sem precisar publicar
em loja nenhuma.

### Estrutura de pastas

```
src/
  app/
    page.tsx              # Home — dieta (Server Component, busca dados)
    rotina/page.tsx        # Rotina
    compras/page.tsx       # Lista de compras
    login/page.tsx         # Tela de PIN
    api/
      login, logout        # Autenticação da UI
      ai/
        state               # GET — snapshot completo (dieta+rotina+compras)
        diet                # GET/PUT — dieta da semana
        routine             # GET/PUT/PATCH — rotina
        shopping            # GET/POST — lista de compras
  components/
    diet/, routine/, shopping/   # Telas e formulários (Client Components)
    ui/                          # Sheet (modal), Field, Button
    BottomNav.tsx                 # Navegação inferior
  lib/
    api/                   # Funções que falam com o Supabase (server-only)
    actions/                # Server Actions usadas pela UI
    supabase/server.ts      # Cliente Supabase (service role, só no backend)
    auth.ts                 # PIN da UI + token da IA
    types.ts                 # Tipos compartilhados
  proxy.ts                  # Middleware — protege tudo com o PIN
supabase/schema.sql         # Schema completo do banco
public/
  manifest.webmanifest, sw.js, icons/   # PWA
```

---

## 2. Configurar o banco (Supabase — grátis)

1. Crie uma conta em [supabase.com](https://supabase.com) e um **novo
   projeto** (escolha uma senha de banco forte e guarde — raramente precisa
   dela diretamente).
2. No painel do projeto, vá em **SQL Editor** → **New query**, cole o
   conteúdo inteiro do arquivo `supabase/schema.sql` deste projeto, e rode.
   Isso cria todas as tabelas, índices e protege o acesso (RLS).
3. Vá em **Settings → API**. Você vai precisar de dois valores:
   - **Project URL** → vira a variável `SUPABASE_URL`
   - **service_role key** (não é a `anon` key!) → vira `SUPABASE_SERVICE_ROLE_KEY`

   A `service_role` key dá acesso total ao banco ignorando as regras de
   segurança — por isso ela só é usada no backend (nunca no navegador) e
   nunca deve ser compartilhada publicamente.

---

## 3. Rodar localmente (opcional, para testar antes de publicar)

```bash
npm install
cp .env.example .env.local
# edite .env.local com os valores do Supabase + escolha seu APP_PASSWORD,
# APP_SECRET e AI_API_TOKEN (gere strings aleatórias com: openssl rand -hex 32)
npm run dev
```

Abra `http://localhost:3000` — vai pedir o PIN que você definiu em
`APP_PASSWORD`.

---

## 4. Publicar de graça (Vercel)

1. Suba este projeto para um repositório no GitHub (pode ser privado).
2. Crie uma conta em [vercel.com](https://vercel.com) (dá para entrar com o
   GitHub) e clique em **Add New → Project**, escolhendo o repositório.
3. Antes de clicar em "Deploy", abra **Environment Variables** e adicione
   todas as variáveis do `.env.example` com os valores reais:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `APP_PASSWORD`
   - `APP_SECRET`
   - `AI_API_TOKEN`
4. Clique em **Deploy**. Em ~1 minuto você tem uma URL pública tipo
   `https://minha-dieta-xxxx.vercel.app` — é esse link que você vai instalar
   no celular e no PC (pode trocar por um domínio próprio depois, se quiser).

O app inteiro fica atrás do PIN (`APP_PASSWORD`), então mesmo sendo uma URL
pública, só quem souber o PIN consegue ver seus dados.

---

## 5. Instalar como app (sem loja)

**Celular (Android/Chrome ou iPhone/Safari):**
1. Abra a URL do app no navegador.
2. Faça login com o PIN.
3. Toque no menu do navegador → **"Adicionar à tela inicial"** (Android) ou
   **"Adicionar à Tela de Início"** no botão de compartilhar (iPhone).
4. Pronto — ícone próprio, abre em tela cheia, sem barra de navegador.

**PC (Chrome/Edge):**
1. Abra a URL do app.
2. Clique no ícone de instalar que aparece na barra de endereço (ou menu →
   "Instalar app").
3. Abre como um app de janela própria, com atalho no menu iniciar/dock.

---

## 6. Integração com IA (Claude e Gemini/Nini)

Todos os endpoints abaixo ficam em `/api/ai/*` e exigem o header:

```
Authorization: Bearer SEU_AI_API_TOKEN
```

(nunca confunda com o `APP_PASSWORD` — são coisas diferentes, de propósito:
o PIN é só pra você abrir o app, o token de IA é só pra automação.)

### Endpoints

| Rota | Método | O que faz |
|---|---|---|
| `/api/ai/state` | GET | Snapshot completo: dieta da semana + rotina + lista de compras |
| `/api/ai/diet` | GET | Dieta da semana inteira |
| `/api/ai/diet` | PUT | Substitui a dieta de 1 dia ou da semana toda |
| `/api/ai/routine` | GET | Todos os itens de rotina |
| `/api/ai/routine` | PUT | Substitui a rotina inteira |
| `/api/ai/routine` | PATCH | Adiciona/edita/remove 1 item de rotina |
| `/api/ai/shopping` | GET | Lista de compras atual |
| `/api/ai/shopping` | POST | add / update / delete / generate / clear_checked |

### Exemplos (`curl`)

```bash
export APP_URL="https://minha-dieta-xxxx.vercel.app"
export TOKEN="seu_ai_api_token"

# Ver tudo de uma vez
curl -s "$APP_URL/api/ai/state" -H "Authorization: Bearer $TOKEN"

# Definir a dieta de quarta-feira (weekday 3) inteira
curl -s -X PUT "$APP_URL/api/ai/diet" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "weekday": 3,
    "meals": [
      { "name": "Café da manhã", "time": "07:30",
        "items": [
          { "description": "Ovos mexidos", "quantity": "3 unidades" },
          { "description": "Pão integral", "quantity": "2 fatias" }
        ] },
      { "name": "Almoço", "time": "12:30",
        "items": [
          { "description": "Peito de frango grelhado", "quantity": "150g" },
          { "description": "Arroz integral", "quantity": "4 col. sopa" },
          { "description": "Brócolis no vapor", "quantity": "1 xícara" }
        ] }
    ]
  }'

# Marcar um item da lista de compras como comprado
curl -s -X POST "$APP_URL/api/ai/shopping" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{ "action": "update", "id": "ID_DO_ITEM", "patch": { "checked": true } }'

# Gerar a lista de compras a partir da dieta da semana
curl -s -X POST "$APP_URL/api/ai/shopping" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{ "action": "generate" }'

# Adicionar uma atividade de rotina (todo dia, 06:30)
curl -s -X PATCH "$APP_URL/api/ai/routine" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{ "action": "add", "item": { "is_daily": true, "time": "06:30",
        "title": "Treino", "description": "Academia - pernas" } }'
```

Todos os detalhes de formato (campos aceitos, `weekday` 0=domingo...6=sábado)
estão comentados no topo de cada arquivo em `src/app/api/ai/*/route.ts`.

### Usando com Claude (eu)

Em qualquer conversa futura comigo, me diga a URL do seu app e o
`AI_API_TOKEN` (ou configure como fica salvo no seu ambiente), e eu chamo
esses endpoints diretamente por `curl` para editar sua dieta, rotina ou
lista — por exemplo "muda meu almoço de quinta pra incluir batata doce" ou
"marca ovos e leite como comprados".

### Usando com Gemini (Nini)

O app expõe uma API REST comum, então qualquer agente capaz de fazer
requisições HTTP com um header de autorização consegue usá-la. Como a forma
de dar a um assistente de IA acesso a chamar APIs externas varia bastante
entre produtos e muda com frequência, vale conferir na hora:

- Se você usa a **API do Gemini** (não o app de consumidor) com *function
  calling*/*tools*, pode descrever esses mesmos endpoints como ferramentas —
  o próprio Gemini monta as chamadas.
- Se o app do Gemini que você usa tiver suporte a extensões/ações
  personalizadas (ex: "Gems" com ferramentas customizadas), configure os
  endpoints acima do mesmo jeito.
- Caminho que sempre funciona, sem depender de nenhum recurso específico:
  peça pra Nini montar o comando `curl` (ela sabe fazer isso bem) e você
  mesma roda no terminal do celular/PC, ou cola num app de terminal.

---

## 7. Segurança

- **PIN de acesso** (`APP_PASSWORD`): protege toda a interface via cookie
  `httpOnly` assinado (hash SHA-256 com `APP_SECRET`, nunca a senha em
  texto puro no cookie).
- **Token de IA** (`AI_API_TOKEN`): separado do PIN de propósito — se um dia
  você quiser revogar o acesso de IA sem trocar seu PIN pessoal (ou
  vice-versa), basta trocar uma variável.
- **Banco**: a `service_role key` do Supabase só existe no backend (Vercel),
  nunca é enviada ao navegador. As tabelas têm Row Level Security (RLS)
  ativado sem nenhuma política para acesso público — ou seja, mesmo que
  alguém descubra sua `anon key` (que nem é usada aqui), não consegue ler
  nem escrever nada.
- **Comparações de senha/token** usam comparação em tempo constante, para
  reduzir risco de ataques de timing.
- Por ser um app de uso pessoal único, não há sistema de múltiplos usuários,
  recuperação de senha por e-mail, etc. Se esquecer o PIN, basta trocar a
  variável `APP_PASSWORD` no Vercel e logar de novo.

---

## 8. Próximos passos sugeridos (opcionais)

- Adicionar campos de macros (proteína/carbo/gordura) nos itens da dieta.
- Gráfico de progresso da rotina ao longo da semana.
- Categorizar automaticamente itens da lista de compras por IA ao gerar.
- Modo escuro já está pronto (segue o tema do sistema automaticamente).
