# 🦷 Sorriso Perfeito — Landing Page

Landing page responsiva e instalável como app (PWA) para o consultório
odontológico fictício **Sorriso Perfeito**.

---

## 📁 Estrutura do Projeto
```
projetoSorrisoPerfeito/
├── index.html              # Página principal
├── manifest.json           # Configuração do PWA
├── sw.js                   # Service Worker (cache + offline)
├── styles/
│   └── style.css           # Estilos completos
├── scripts/
│   └── script.js           # JavaScript completo
└── assets/
    └── icons/              # Ícones do PWA
        ├── icon-72.png
        ├── icon-96.png
        ├── icon-128.png
        ├── icon-192.png
        └── icon-512.png
```

---

## 🎨 Paleta de Cores

| Cor | Hex | Uso |
|---|---|---|
| Azul claro | `#A9D6E5` | Destaques, bordas, ícones |
| Azul escuro | `#3a86a8` | Botões, links ativos |
| Verde suave | `#90BE6D` | Acentos, badges, progresso |
| Branco | `#FFFFFF` | Fundo light, cards |
| Cinza claro | `#F3F4F6` | Fundo alternado light |
| Azul noite | `#0d1b26` | Fundo dark mode |

---

## ✨ Funcionalidades

### APIs Integradas
- **ViaCEP** — preenchimento automático de endereço ao digitar o CEP
- **OpenWeatherMap** — widget de clima em tempo real com ícone dinâmico

### Dark / Light Mode
- Toggle no header com ícone sol/lua
- Tema salvo no `localStorage`
- Detecta automaticamente a preferência do sistema operacional

### Animações CSS (Keyframes)
- Cards entram de direções diferentes (esquerda, direita, cima, baixo)
- Efeito shimmer no hover dos stat cards
- Pulse nos ícones de estatísticas
- Linha colorida animada no hover dos serviços
- Badge pop no hero com spring physics

### Contador de Estatísticas
- Conta de 0 até o valor alvo com easing `easeOutExpo`
- Barra de progresso que cresce junto
- Disparado ao entrar na viewport via `IntersectionObserver`

### Formulário Inteligente
- Máscara automática de telefone (fixo e celular)
- Busca de CEP com estados: carregando / sucesso / erro
- Validação em tempo real ao sair de cada campo
- Feedback visual de sucesso no envio

### Navegação
- Menu hambúrguer animado no mobile
- Smooth scroll com offset do header fixo
- Botão voltar ao topo com anel de progresso circular
- Botão WhatsApp flutuante com pulso animado e tooltip

### PWA (Progressive Web App)
- Instalável no celular e desktop
- Funciona offline com página de fallback
- Cache inteligente: Cache First para assets, Network First para APIs
- Banner de instalação personalizado
- Shortcuts diretos para Agendar e Serviços
- Theme color adapta ao dark/light mode

---

## 🚀 Como Executar
```bash
# Opção 1 — VS Code com Live Server (recomendado)
# Instale a extensão Live Server e clique em "Go Live"

# Opção 2 — Python
python -m http.server 8000
# Acesse: http://localhost:8000

# Opção 3 — Node.js
npx serve .
```

> **PWA requer HTTPS ou localhost.** O Live Server já serve em localhost,
> então o Service Worker funciona normalmente em desenvolvimento.

---

## 🔑 Configuração da API de Clima

1. Crie conta gratuita em [openweathermap.org](https://openweathermap.org)
2. Acesse **My API Keys** e copie sua chave
3. No `scripts/script.js` linha 8, substitua:
```javascript
const OPENWEATHER_KEY = 'SUA_CHAVE_AQUI';
```

> A chave leva até **2 horas** para ativar após o cadastro.

---

## 🎨 Gerando os Ícones PWA

1. Acesse [realfavicongenerator.net](https://realfavicongenerator.net)
2. Faça upload de uma imagem quadrada (logo ou dente)
3. Baixe o pacote e coloque os arquivos em `assets/icons/`

---

## 📱 Responsividade

| Breakpoint | Layout |
|---|---|
| ≥ 1025px | Desktop — 3 colunas, hero split |
| 769–1024px | Tablet — 2 colunas |
| ≤ 768px | Mobile — 1 coluna, menu hambúrguer |
| ≤ 480px | Small — coluna única total |

---

## 🔮 Próximos Passos (PHP)

- Formulário enviando e-mail via `send_mail.php`
- Agendamentos salvos em MySQL
- Painel administrativo com login
- Validação server-side

---

## 🛠️ Tecnologias

- HTML5 semântico
- CSS3 puro (Grid, Flexbox, Custom Properties, Keyframes)
- JavaScript ES6+ vanilla (Fetch API, IntersectionObserver, Service Worker)
- Google Fonts: Playfair Display + Lato
- API ViaCEP (gratuita, sem chave)
- API OpenWeatherMap (gratuita com cadastro)

---

*Projeto acadêmico — Consultório fictício para fins educacionais.*
```

---

## ✅ Checklist final do projeto
```
```
✅ HTML semântico e acessível
✅ CSS modular com variáveis
✅ Dark / Light Mode + localStorage
✅ Cursor personalizado dente (branco e verde)
✅ Animações keyframe por direção
✅ Contador animado com easing + barra de progresso
✅ Shimmer + pulse nos stat cards
✅ Linha colorida no hover dos serviços
✅ API ViaCEP — CEP automático
✅ API OpenWeatherMap — clima em tempo real
✅ Máscara de telefone (fixo e celular)
✅ Validação de formulário em tempo real
✅ Botão WhatsApp flutuante + pulso + tooltip
✅ Botão voltar ao topo + anel de progresso
✅ PWA completo (manifest + service worker)
✅ Offline fallback personalizado
✅ Banner de instalação do app
✅ Responsivo em 4 breakpoints
✅ README completo e atualizado
```
