# 💰 Gasto Recorrente

Aplicação web para análise inteligente de gastos recorrentes a partir de extratos bancários. Utiliza IA para identificar assinaturas e cobranças recorrentes automaticamente.

## 🚀 Funcionalidades

- **Upload de Extratos**: Suporte para upload de arquivos PDF de extratos bancários
- **Análise com IA**: Processamento inteligente utilizando a API Gemini do Google
- **Detecção Automática**: Identificação de assinaturas e gastos recorrentes
- **Dashboard Interativo**: Visualização dos dados com gráficos (Recharts)
- **Autenticação**: Login via Google utilizando Firebase Authentication
- **Histórico**: Salva análises anteriores para consulta futura
- **Pagamentos**: Integração com sistema de pagamentos (PIX e Stripe)

## 🛠️ Tecnologias

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Estilização**: CSS
- **Gráficos**: Recharts
- **IA**: Google Gemini API (`@google/genai`)
- **Autenticação**: Firebase Authentication
- **Ícones**: Lucide React
- **PDF**: pdf.js (`pdfjs-dist`)

## 📁 Estrutura do Projeto

```
gasto-recorrente/
├── components/         # Componentes React
│   ├── Dashboard.tsx     # Dashboard principal com gráficos
│   ├── Hero.tsx          # Seção hero da landing page
│   ├── LoginModal.tsx    # Modal de login
│   ├── PaymentModal.tsx  # Modal de pagamento
│   ├── Preview.tsx       # Preview dos resultados
│   └── UploadSection.tsx # Seção de upload de arquivos
├── services/           # Serviços da aplicação
│   ├── authService.ts    # Serviço de autenticação
│   ├── firebaseConfig.ts # Configuração do Firebase
│   ├── geminiService.ts  # Integração com API Gemini
│   ├── historyService.ts # Gerenciamento de histórico
│   └── paymentService.ts # Serviço de pagamentos
├── App.tsx             # Componente principal
├── types.ts            # Definições de tipos TypeScript
├── index.html          # HTML principal
└── vite.config.ts      # Configuração do Vite
```

## ⚙️ Configuração

### Pré-requisitos

- Node.js (v18 ou superior recomendado)

### Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local` e configure:

```env
VITE_GEMINI_API_KEY=sua_chave_api_gemini
VITE_FIREBASE_API_KEY=sua_chave_firebase
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

### Instalação

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 📖 Como Usar

1. Acesse a aplicação e clique em **"Começar"**
2. Faça upload do seu extrato bancário (PDF)
3. Aguarde a análise da IA
4. Visualize o preview dos gastos recorrentes identificados
5. Faça login para salvar o relatório completo
6. Acesse o dashboard com gráficos e insights detalhados

## 📄 Licença

Este projeto é privado.
