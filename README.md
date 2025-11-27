📱 Pokédex Avançada (React Native + Expo)

Este projeto é uma aplicação mobile robusta desenvolvida com React Native e Expo, consumindo a PokéAPI. O foco principal é demonstrar Engenharia de Software aplicada ao mobile, com tratamento avançado de rede, cache offline e UX refinada.

✨ Diferenciais Técnicos (Key Features)

Este não é apenas um "consumidor de API". O projeto implementa padrões avançados de resiliência:

🛡️ Robustez de Rede: Implementação de Retry com Exponential Backoff (tenta novamente se a API falhar) e Timeout manual.

📶 Offline First: Cache local inteligente usando AsyncStorage. Se a internet cair, o app continua funcionando com os dados salvos.

⚡ Concorrência Controlada: O carregamento da lista limita as requisições paralelas (Batching) para não sobrecarregar o dispositivo ou a API.

🔍 Busca Otimizada: Autocomplete local instantâneo filtrando uma lista mestra de 1000+ Pokémons.

🎨 UI/UX Imersiva: Animações fluidas, modal de detalhes com gestos (drag-to-dismiss) e design responsivo (Mobile/Tablet/Web).

🚀 Como Rodar o Projeto

Siga os passos abaixo para executar o aplicativo no seu ambiente de desenvolvimento.

1. Pré-requisitos

Certifique-se de ter instalado:

Node.js (versão LTS recomendada)

Git

Aplicativo Expo Go no seu celular (Android ou iOS) ou um Emulador configurado.

2. Clonar o Repositório

Abra o terminal e execute:

# Clone este repositório
git clone [https://github.com/SEU_USUARIO/Pokedex-Avan-ada.git](https://github.com/SEU_USUARIO/Pokedex-Avan-ada.git)

# Entre na pasta do projeto
cd Pokedex-Avan-ada


3. Instalar Dependências

Instale as bibliotecas necessárias (o projeto usa Expo, então recomenda-se usar npx expo install para garantir compatibilidade):

npm install
# ou
npx expo install


4. Executar o Projeto

Inicie o servidor de desenvolvimento Metro Bundler:

npx expo start


Para rodar no Celular físico: Escaneie o QR Code exibido no terminal com o app Expo Go.

Para rodar no Emulador Android: Pressione a no terminal.

Para rodar no Simulador iOS (apenas Mac): Pressione i no terminal.

Para rodar na Web: Pressione w no terminal.

📂 Estrutura do Projeto

A arquitetura foi pensada para ser modular e escalável:

src/
├── api/           # Camada de comunicação com a PokéAPI
│   └── pokeApi.ts # Lógica de endpoints e controle de concorrência
├── components/    # Componentes reutilizáveis de UI
│   └── PokemonModal.tsx # Detalhes do Pokémon com animações
├── hooks/         # Lógica de estado e efeitos (Custom Hooks)
│   └── usePokedex.ts # Cérebro da aplicação (Paginação, Busca, Cache)
├── screens/       # Telas da aplicação
│   ├── WelcomeScreen.tsx # Tela de boas-vindas
│   └── PokedexScreen.tsx # Lista principal e filtros
├── types/         # Definições de tipos TypeScript
│   └── pokemon.ts
└── utils/         # Ferramentas auxiliares
    ├── cache.ts   # Gerenciador de AsyncStorage (TTL e Offline)
    ├── http.ts    # Cliente HTTP customizado (Fetch com Retry/Timeout)
    └── colors.ts  # Paleta de cores por tipo de Pokémon


🛠️ Tecnologias Utilizadas

React Native (Expo SDK 52)

TypeScript (Tipagem estática rigorosa)

React Hooks (useState, useEffect, useRef, useCallback)

Animated API & PanResponder (Para animações e gestos nativos)

AsyncStorage (Persistência de dados local)

NetInfo (Detecção de estado de conexão)

📸 Assets Necessários

Para o visual completo, certifique-se de que a pasta assets/ contenha:

assets/background/wallpaper.jpg (Fundo da tela inicial)

assets/logos/titulo.png (Logo da Pokedex)

assets/logos/pokeball.png (Ícone da Pokebola)

assets/buttons/button.png (Imagem do botão Start - opcional)

Desenvolvido como parte do desafio técnico de Mobile Avançado.
