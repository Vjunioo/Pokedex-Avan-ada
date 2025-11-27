# 📱 Pokédex Avançada (React Native + Expo)

Aplicativo mobile robusto desenvolvido com **React Native + Expo**, consumindo a **PokéAPI**.
O objetivo é demonstrar **Engenharia de Software aplicada ao mobile**, com foco em resiliência de rede, cache offline e UX avançada.

---

## ✨ Diferenciais Técnicos (Key Features)

Este projeto vai muito além de apenas consumir uma API. Foram implementadas práticas reais usadas em apps de produção:

### 🛡️ Robustez de Rede

* Retry com **Exponential Backoff**
* **Timeout manual** para evitar travamentos
* Tratamento refinado de erros e latência

### 📶 Offline First

* Cache local inteligente com **AsyncStorage**
* App continua funcionando mesmo sem internet

### ⚡ Concorrência Controlada

* Sistema de **batching** limitando requisições simultâneas
* Evita travamentos e sobrecarga na PokéAPI

### 🔍 Busca Otimizada

* Autocomplete instantâneo
* Filtro local baseado em lista mestra (1000+ Pokémons)

### 🎨 UI/UX Imersiva

* Animações fluidas
* Modal detalhado com gestures (drag-to-dismiss)
* Design responsivo para **Mobile / Tablet / Web**

---

## 🚀 Como Rodar o Projeto

### 1. Pré-requisitos

Instale:

* **Node.js** (LTS recomendado)
* **Git**
* **Expo Go** no celular (Android/iOS)
* (Opcional) Emulador Android ou Simulador iOS

---

### 2. Clonar o Repositório

```sh
# Clone este repositório
git clone https://github.com/SEU_USUARIO/Pokedex-Avancada.git

# Entre na pasta do projeto
cd Pokedex-Avancada
```

---

### 3. Instalar Dependências

```sh
npm install
# ou
npx expo install
```

---

### 4. Executar o Projeto

```sh
npx expo start
```

* **Rodar no celular físico:** Escaneie o QR Code com o app Expo Go
* **Android Emulator:** Pressione **a**
* **iOS Simulator (Mac):** Pressione **i**
* **Web:** Pressione **w**

---

## 📂 Estrutura do Projeto

```
src/
├── api/                 # Comunicação com a PokéAPI
│   └── pokeApi.ts       # Endpoints + controle de concorrência
├── components/          # Componentes de UI
│   └── PokemonModal.tsx # Modal animado com detalhes
├── hooks/               # Lógica de estado (Custom Hooks)
│   └── usePokedex.ts    # Paginação, busca, cache e lógica central
├── screens/             # Telas da aplicação
│   ├── WelcomeScreen.tsx
│   └── PokedexScreen.tsx
├── types/
│   └── pokemon.ts       # Tipagens TypeScript
└── utils/
    ├── cache.ts         # Cache offline (TTL + AsyncStorage)
    ├── http.ts          # HTTP client customizado (Retry/Timeout)
    └── colors.ts        # Paleta de cores por tipo
```

---

## 🛠️ Tecnologias Utilizadas

* **React Native (Expo SDK 52)**
* **TypeScript**
* **React Hooks**
* **Animated API & PanResponder**
* **AsyncStorage**
* **NetInfo**

---

## 📸 Assets Necessários

Certifique-se de possuir a pasta `assets/` com:

```
assets/background/wallpaper.jpg   # Fundo da tela inicial
assets/logos/titulo.png           # Logo da Pokédex
assets/logos/pokeball.png         # Ícone da Pokébola
assets/buttons/button.png         # Botão "Start" (opcional)
```

---

## 🧩 Sobre o Projeto

Desenvolvido como parte de um **desafio técnico de Mobile Avançado**, com foco em arquitetura, performance e experiência de usuário.

