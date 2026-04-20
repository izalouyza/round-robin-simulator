# Simulador Round-Robin

Repositório contendo o projeto desenvolvido para a disciplina de **Sistemas Operacionais**, com foco na simulação do algoritmo de escalonamento **Round-Robin**.

O sistema tem como objetivo demonstrar, de forma visual e interativa, o funcionamento do escalonamento de processos, incluindo **troca de contexto**, **quantum**, **filas de execução** e **operações de entrada/saída (I/O)**.

![Linguagem](https://img.shields.io/badge/Linguagem-JavaScript-yellow)
![Plataforma](https://img.shields.io/badge/Plataforma-Electron-blue)
![Último commit](https://img.shields.io/github/last-commit/izalouyza/round-robin-simulator)

---

## Sumário
- [Autores](#autores)
- [Propósito do Projeto](#propósito-do-projeto)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Como Executar o Projeto](#como-executar-o-projeto)
- [Geração do Executável](#geração-do-executável)

---

## Autores

<b>Discentes:</b><br>
<a href="https://github.com/izalouyza">Izadora Louyza Silva Figueiredo</a><br>
<a href="https://github.com/livianlucena">Lívian Maria Lucena Gomes Pinheiro</a><br>
<a href="https://github.com/tivitoriarocha">Maria Vitória Fernandes Rocha</a><br>
<a href="https://github.com/Victor350br">Victor Hugo de Oliveira</a><br>

---

## Propósito do Projeto

O projeto tem como finalidade simular o comportamento do algoritmo de escalonamento **Round-Robin**, permitindo:

- Compreender a divisão de tempo da CPU entre processos.
- Visualizar o impacto do **quantum** na execução.
- Simular operações de **I/O (Disco)** e seu impacto no escalonamento.
- Analisar métricas como tempo de espera e utilização de recursos.

O foco principal é fornecer uma ferramenta **didática, visual e interativa**, facilitando o aprendizado de conceitos fundamentais de **Sistemas Operacionais**.

---

## Funcionalidades Principais

| Funcionalidade | Descrição |
|---------------|----------|
| Configuração da Simulação | Permite definir processos, quantum, tempo total e velocidade. |
| Modelo de Aula | Carrega automaticamente dados padrão utilizados em exercícios acadêmicos. |
| Gestão de I/O | Suporte a múltiplos ciclos de CPU e Disco por processo. |
| Visualização em Tempo Real | Exibição dinâmica das filas e execução dos processos. |
| Gráfico de Gantt | Timeline animada da CPU e do Disco. |
| Controlo de Execução | Permite pausar, continuar ou executar passo a passo. |
| Estatísticas Finais | Cálculo de tempo médio de espera e utilização de hardware. |

---

## Tecnologias Utilizadas

- Node.js  
- Electron  
- Electron Forge  
- HTML5  
- CSS3  
- JavaScript  

---

## Arquitetura do Sistema

O sistema foi estruturado em camadas simples, separando responsabilidades entre lógica e interface:

- **Interface (index.html + style.css):**  
  Responsável pela visualização e interação com o usuário.

- **Lógica de Simulação (script.js):**  
  Implementa o algoritmo Round-Robin, controle de filas e execução dos processos.

- **Camada Desktop (main.js):**  
  Responsável por configurar e executar a aplicação via Electron.

---

## Estrutura de Pastas

```bash
round-robin-simulator/
├── src/
│   ├── script.js
│   └── style.css
├── index.html
├── main.js
├── package-lock.json
├── package.json
└── .gitignore
```

## Como Executar o Projeto
Existem duas formas de utilizar este projeto:

### 1. Pela Versão Executável (Recomendado para Usuários)
Se você quer apenas rodar o simulador sem precisar instalar ferramentas de programação:

1. Vá até a seção [Releases](https://github.com/izalouyza/round-robin-simulator/releases) deste repositório.
2. Baixe a pasta .zip `simulador-round-robin.zip`.
3. Extraia a pasta e execute o instalador no seu Windows. 
   * *Nota: Se aparecer um aviso do Windows, clique em "Mais informações" e "Executar assim mesmo".*
4. O simulador será instalado e um atalho será criado na sua Área de Trabalho.

### 2. Pelo Terminal (Para Desenvolvedores)
Pré-requisitos
- Node.js instalado.

### 1. Clonar o Repositório
```bash
git clone https://github.com/izalouyza/round-robin-simulator
```
### 2. Acessar a Pasta do Projeto
```bash
cd round-robin-simulator
```
### 3. Instalar Dependências
```bash
npm install
```
### 4. Executar o Simulador
```bash
npm start
```

## Geração do Executável
Para gerar o instalador da aplicação para Windows:
```bash
npm run make
```
O executável será criado em:
```bash
out/make/squirrel.windows/x64/
```
