# 👁️ Master-Dashboard (Virtual Tabletop)

![Versão](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Tauri](https://img.shields.io/badge/Tauri-FFC131?style=flat&logo=tauri&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-black?style=flat&logo=three.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

**Master Dashboard** é um aplicativo desktop (Virtual Tabletop) desenvolvido especificamente para gerenciar campanhas do sistema de RPG **Ordem Paranormal**. O software atua como o "Escudo do Mestre", automatizando cálculos, gerenciando fichas de agentes e renderizando modelos 3D táticos em tempo real.

---

## ✨ Funcionalidades Principais

* **Fichas Inteligentes e Automatizadas:** Criação de agentes do zero com cálculos automáticos de PV, PE, Sanidade e bônus de perícias baseados no NEX e Atributos.
* **Palco 3D Interativo:** Renderização nativa de modelos 3D (`.glb`/`.gltf`) diretamente na ficha do jogador para imersão visual do esquadrão, utilizando a engine Three.js.
* **Rolador de Dados Integrado:** Console de lançamento de dados com histórico de rolagem persistente, cálculo automático de vantagens/desvantagens e identificação de acertos críticos.
* **Inventário e Ocultismo:** Gestão visual de espaços, peso de itens, poderes e rituais com seus respectivos custos e descrições.
* **Performance Nativa:** Empacotado com Tauri (Rust), garantindo uso mínimo de memória RAM e inicialização instantânea no Windows, superando VTTs baseados em browser.

---


## 🛠️ Tecnologias Utilizadas

Este projeto foi construído focando em performance de desktop e interfaces modernas (Glassmorphism / Cyberpunk):

* **Frontend:** React.js, Vite, Tailwind CSS.
* **Gráficos 3D:** Three.js, React Three Fiber, React Three Drei.
* **Backend / Desktop:** Tauri, Rust.
* **Armazenamento:** LocalStorage API para persistência de dados offline.

---

## 🚀 Instalação e Uso

### Para Jogadores / Mestres (Usuário Final)
Se você quer apenas usar o aplicativo para a sua campanha:
1. Vá até a aba [Releases](../../releases) deste repositório.
2. Baixe o arquivo `Setup.exe` da versão mais recente.
3. Instale no seu Windows e inicie.

### Para Desenvolvedores
Se você quer rodar o projeto localmente ou contribuir:

**Pré-requisitos:** Node.js (v16+), Rust e as ferramentas de build do Windows (C++).

1. Clone o repositório:
```bash
git clone [https://github.com/AngeloJR-web/ordo-alvarus.git](https://github.com/AngeloJR-web/ordo-alvarus.git)

2. Instale as dependências do Frontend:
cd ordo-alvarus
npm install

3. Inicie o servidor de desenvolvimento do Tauri:
npm run tauri dev

4. Para compilar o executável final:
npm run tauri build

👤 Autor Angelo De Oliveira Junior
Sinta-se à vontade para enviar PRs, abrir issues com sugestões de melhorias ou entrar em contato!

GitHub: @AngeloJR-web

LinkedIn: Angelo Junior



