# Game Nilda — As Obras de Parnamirim (Edição SNES 16-Bit)

Jogo de plataforma 2D em pixel art 16-bit estilo Super Nintendo (SNES), estrelado pela **Prefeita Professora Nilda**, ambientado nas ruas, praças e grandes obras da cidade de **Parnamirim / RN**.

---

## 🌟 Contexto e Obras Reais Retratadas no Jogo

1. **Macrodrenagem de Monte Castelo**:
   - Resolução de um problema histórico de alagamentos crônicos na cidade.
   - O jogador coleta Ordens de Serviço e aciona as bombas e manilhas de drenagem, fazendo as poças de lama escoarem!
2. **Drenagem Estruturante da Av. Olavo Montenegro**:
   - Investimento de R$ 52,6 milhões em tubulações, galerias pluviais e nova pavimentação.
3. **Programa "Parnamirim Cidade Limpa" & Valorização dos Garis**:
   - Encontro com o mascote **Cajulim Gari**!
   - Diálogo comemorando a ampliação do adicional de insalubridade para os agentes de limpeza e os mutirões de zeladoria por todos os bairros.
4. **Educação & Valorização Docente**:
   - Símbolo da carreira da Professora Nilda: coleta de Livros Dourados da Educação (reajuste de 5,4% aos professores e revitalização de bibliotecas).
5. **Saúde Reconstruída**:
   - Coleta de Selos da Saúde, representando a recuperação das Unidades Básicas de Saúde (UBSs).
6. **Grande Inauguração**:
   - Chegada triunfal ao Palanque Oficial, corte da fita inaugural com a Chave Dourada da Cidade, confetes e fanfarra SNES!

---

## 🎮 Controles

| Tecla | Ação |
| :--- | :--- |
| `←` / `→` ou `A` / `D` | Movimentação horizontal da Prefeita |
| `ESPAÇO` ou `W` | Pular (pulo dinâmico com altura variável) |
| `E` | Interagir com NPCs e acionar Bombas de Drenagem |
| `M` | Ativar / Desativar Trilha Sonora e Efeitos Chiptune |
| `F` | Alternar Modo Tela Cheia |
| `R` | Reiniciar Fase |

---

## 📐 Escala e leitura 16-bit

- A área de jogo continua em 1280 × 720, com aproximação de câmera de 1,10×.
- Nilda usa sprite visual de 88 × 132 e colisão de 50 × 96 centralizada nos pés.
- NPCs preservam a proporção de cada imagem e aparecem com cerca de 140–150 px de altura no PC.
- O celular em pé usa corte vertical estilo Game Boy; os controles ficam em um console inferior com botões de ação de 58 px.

## 🖼️ Assets em Pixel Art 16-Bit Criados

- **Prefeita Professora Nilda**:
  - `nilda_portrait.png`: Retrato 16-bit com óculos, cabelo ondulado, sorriso caloroso, blazer amarelo e mãos no peito (baseado na foto real).
  - `nilda_idle.png`: Sprite parado em pose carismática.
  - `assets/movimento_nilda_v2/nilda_andando_01_v2.png` a `nilda_andando_06_v2.png`: Ciclo de caminhada com alternância real das pernas.
  - `assets/movimento_nilda_v2/nilda_saltando_01_v2.png` a `nilda_saltando_05_v2.png`: Preparação, subida, ápice, queda e aterrissagem.
  - `nilda_jump.png`: Salto ágil para alcançar plataformas e andaimes.
  - `nilda_win.png`: Comemoração no palanque oficial.
- **Cenário de Parnamirim**:
  - `parnamirim_centro_obras.png`: Panorama com a **Igreja Matriz de Nossa Senhora de Fátima**, a **Torre do Relógio do Parque Aluízio Alves (Cohabinal)**, coqueiros potiguares, ipês amarelos e ruas com galerias pluviais.
- **Itens e Colecionáveis**:
  - `ordem_servico.png`: Prancheta com plantas de engenharia.
  - `livro_educacao.png`: Livro dourado da educação pública.
  - `selo_saude.png`: Distintivo verde das UBSs.
  - `capacete_obra.png`: Capacete amarelo de proteção.
  - `chave_cidade.png`: Chave de ouro entregue na vitória.
  - `cajulim_npc.png`: Aliado na limpeza urbana.

---

## 🚀 Como Testar Localmente

Basta dar dois cliques em:
```text
jogar_game_nilda.bat
```
*(disponível tanto na raiz do projeto quanto dentro da pasta `game nilda`)*

O inicializador subirá o servidor local em porta isolada (`http://127.0.0.1:8775/index.html`) e abrirá automaticamente no seu navegador.
