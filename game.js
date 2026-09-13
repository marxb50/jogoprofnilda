/**
 * GAME NILDA - AS OBRAS DE PARNAMIRIM (EDIÇÃO 16-BIT)
 * Protagonista: Prefeita Professora Nilda
 * Gestão Municipal de Parnamirim / RN
 * 
 * Suporte Completo:
 * - PC (Teclado, Mouse, Tela Cheia)
 * - Celular em Pé (Retrato - Gamepad Portátil retrô estilo Game Boy)
 * - Celular Deitado (Paisagem - Overlay Touch ergonômico estilo Switch)
 * 
 * Correções Críticas:
 * - Fim de qualquer área de aprisionamento: chão livre sob as plataformas, sem paredes fechadas
 * - Plataformas em alturas variadas (rotas altas em sacadas/andaimes e rotas baixas na avenida)
 * - Sistema de diálogos 100% acessível (botão Falar, proximidade e teclas E/Z/Enter)
 * - Blocos interativos com identidade própria de obras públicas (moedas e estrelas)
 */

(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const V_WIDTH = 1280;
  const V_HEIGHT = 720;
  // O mundo fica um pouco mais próximo para dar presença aos personagens,
  // mantendo a interface em resolução nativa e sem perder a leitura do cenário.
  const WORLD_ZOOM = 1.10;
  const WORLD_VIEW_WIDTH = V_WIDTH / WORLD_ZOOM;
  const WORLD_VIEW_HEIGHT = V_HEIGHT / WORLD_ZOOM;
  // A câmera começa presa ao piso e sobe apenas quando a personagem alcança
  // plataformas altas. O limite negativo mantém a área de jogo abaixo do HUD.
  const CAMERA_MIN_Y = -320;
  const CAMERA_FOLLOW_Y = Math.round(WORLD_VIEW_HEIGHT * 0.367);
  const LEVEL_LENGTH = 9600;
  const GROUND_Y = 580;

  // Física de plataforma 16-bit: salto legível mesmo com o novo porte dos sprites.
  const GRAVITY = 1600;
  const MOVE_SPEED = 285;
  const ACCEL = 1750;
  const FRICTION = 0.82;
  const JUMP_FORCE = -770;
  const JUMP_CUT_MULT = 0.45;
  const MAX_FALL_SPEED = 850;

  // Lista Completa de Assets
  const assetPaths = {
    // Sprites SNES novos, derivados das fotos de referência da Prefeita Nilda.
    nilda_idle: "assets/player/nilda_snes_idle.png",
    // Ciclo v4: apoio, passagem e troca clara entre perna direita e esquerda.
    nilda_walk_0: "assets/movimento_nilda_v4/nilda_andando_01.png?v=2.7",
    nilda_walk_1: "assets/movimento_nilda_v4/nilda_andando_02.png?v=2.7",
    nilda_walk_2: "assets/movimento_nilda_v4/nilda_andando_03.png?v=2.7",
    nilda_walk_3: "assets/movimento_nilda_v4/nilda_andando_04.png?v=2.7",
    nilda_walk_4: "assets/movimento_nilda_v4/nilda_andando_05.png?v=2.7",
    nilda_walk_5: "assets/movimento_nilda_v4/nilda_andando_06.png?v=2.7",
    nilda_jump: "assets/player/nilda_snes_jump.png",
    nilda_jump_0: "assets/movimento_nilda_v2/nilda_saltando_01_v2.png",
    nilda_jump_1: "assets/movimento_nilda_v2/nilda_saltando_02_v2.png",
    nilda_jump_2: "assets/movimento_nilda_v2/nilda_saltando_03_v2.png",
    nilda_jump_3: "assets/movimento_nilda_v2/nilda_saltando_04_v2.png",
    nilda_jump_4: "assets/movimento_nilda_v2/nilda_saltando_05_v2.png",
    nilda_win: "assets/player/nilda_snes_win.png",
    
    bg_panorama: "assets/scenery/parnamirim_centro_obras.png",
    // Logo exclusiva da tela inicial, sem o mascote de caju.
    ui_logo: "assets/ui/game_nilda_logo_sem_caju.png?v=2.8",
    ui_muni: "assets/ui/parnamirim_logo.png",

    block_brick: "assets/scenery/block_brick.png",
    block_question: "assets/scenery/block_question.png",
    block_recycle: "assets/scenery/block_recycle.png",
    block_empty: "assets/scenery/block_empty.png",

    portrait_nilda: "assets/portraits/portrait_nilda.png",
    portrait_pai_aluno: "assets/portraits/portrait_pai_aluno.png",
    portrait_gari: "assets/portraits/portrait_gari.png",
    portrait_moradora: "assets/portraits/portrait_moradora.png",
    portrait_professora: "assets/portraits/portrait_professora.png",
    portrait_medico: "assets/portraits/portrait_medico.png",
    portrait_guarda: "assets/portraits/portrait_guarda.png",
    portrait_aluna: "assets/portraits/portrait_aluna.png",
    portrait_comerciante: "assets/portraits/portrait_comerciante.png",
    portrait_engenheiro: "assets/portraits/portrait_engenheiro.png",
    portrait_mae_cmei: "assets/portraits/portrait_mae_cmei.png",
    portrait_cajulim: "assets/portraits/portrait_cajulim.png",

    item_cartao_educa: "assets/items/item_cartao_educa.png",
    item_tubo_drenagem: "assets/items/item_tubo_drenagem.png",
    item_colete_gari: "assets/items/item_colete_gari.png",
    item_livro_magisterio: "assets/items/item_livro_magisterio.png",
    item_maleta_saude: "assets/items/item_maleta_saude.png",
    item_fardamento_kit: "assets/items/item_fardamento_kit.png",
    item_ar_condicionado: "assets/items/item_ar_condicionado.png",
    item_lampada_led: "assets/items/item_lampada_led.png",
    item_rolo_asfalto: "assets/items/item_rolo_asfalto.png",
    item_chave_cidade: "assets/items/chave_cidade.png",

    stage_pai_aluno: "assets/stage_npcs/stage_pai_aluno.png",
    stage_gari: "assets/stage_npcs/stage_gari.png",
    stage_professora: "assets/stage_npcs/stage_professora.png",
    stage_medico: "assets/stage_npcs/stage_medico.png",
    stage_engenheiro: "assets/stage_npcs/stage_engenheiro.png",
    stage_guarda: "assets/stage_npcs/stage_guarda.png",
    stage_moradora_snes: "assets/stage_npcs/stage_moradora_snes.png",
    stage_aluna_snes: "assets/stage_npcs/stage_aluna_snes.png",
    stage_mae_cmei_snes: "assets/stage_npcs/stage_mae_cmei_snes.png",
    stage_comerciante_snes: "assets/stage_npcs/stage_comerciante_snes.png",
    stage_cajulim: "assets/items/cajulim_npc.png"
  };

  const images = {};
  let assetsLoaded = 0;
  // O retrato grande do Cajulim só aparece no diálogo final. Deixá-lo fora
  // do primeiro lote reduz a espera percebida em celulares mais lentos.
  const deferredAssetKeys = new Set(["portrait_cajulim"]);
  const totalAssets = Object.keys(assetPaths).filter((key) => !deferredAssetKeys.has(key)).length;

  function loadImageAsset(key, src, onDone) {
    const img = new Image();
    img.onload = () => onDone && onDone(true);
    img.onerror = () => {
      console.warn("Aviso ao carregar:", src);
      onDone && onDone(false);
    };
    img.src = src;
    images[key] = img;
    return img;
  }

  function loadAssets(onComplete) {
    for (const [key, src] of Object.entries(assetPaths)) {
      if (deferredAssetKeys.has(key)) continue;
      loadImageAsset(key, src, () => {
        assetsLoaded++;
        if (assetsLoaded === totalAssets) onComplete();
      });
    }
  }

  function ensureAsset(key) {
    if (!images[key] && assetPaths[key]) loadImageAsset(key, assetPaths[key]);
    return images[key];
  }

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  function drawFittedText(context, text, x, y, maxW, baseSize = 12, fontFace = "'Segoe UI', monospace") {
    let size = baseSize;
    context.font = `900 ${size}px ${fontFace}`;
    while (context.measureText(text).width > maxW && size > 7) {
      size -= 0.5;
      context.font = `900 ${size}px ${fontFace}`;
    }
    context.fillText(text, x, y);
  }

  class GameNilda {
    constructor() {
      this.state = "TITLE"; // TITLE, PLAYING, DIALOGUE, LEVEL_CLEAR
      this.keys = { left: false, right: false, jump: false, jumpHeld: false, down: false, interact: false };
      this.lastTime = performance.now();

      // Câmera
      this.camera = { x: 0, y: 0 };

      // A arte preserva a proporção 2:3 dos sprites SNES (88 x 132).
      // A colisão usa uma caixa menor e centralizada nos pés.
      this.player = {
        x: 120,
        y: GROUND_Y - 132,
        vx: 0,
        vy: 0,
        w: 88,
        h: 132,
        hitW: 50,
        hitH: 96,
        grounded: true,
        facing: 1,
        animTimer: 0,
        walkFrame: 0,
        jumpFrame: 0,
        coyoteTimer: 0,
        jumpBufferTimer: 0,
        isJumping: false
      };

      // Estatísticas
      this.score = 0;
      this.coins = 0;
      this.itemsCollected = 0;
      this.totalItems = 12;
      this.drenagensAtivas = 0;
      this.totalDrenagens = 2;
      this.timeRemaining = 480;

      // Elementos do Mundo
      this.platforms = [];
      this.blocks = [];
      this.items = [];
      this.poppedItems = [];
      this.brickDebris = [];
      this.drainValves = [];
      this.mudPuddles = [];
      this.npcs = [];
      this.particles = [];
      this.floatingTexts = [];
      this.confetti = [];

      // Interação ativa com NPC
      this.activePromptNpc = null;

      // Sistema de Diálogos
      this.dialogue = {
        active: false,
        speaker: "",
        portraitKey: "portrait_nilda",
        lines: [],
        currentLine: 0,
        charIndex: 0,
        charTimer: 0,
        onComplete: null
      };

      this.initLevel();
      this.initInput();

      // Parâmetros URL (?play=1, ?x=1800, ?npc=gari)
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get("play") === "1" || params.get("autostart") === "1") {
          this.startGame();
        }
        if (params.get("x")) {
          this.startGame();
          this.player.x = parseFloat(params.get("x"));
          this.camera.x = Math.max(0, this.player.x - WORLD_VIEW_WIDTH * 0.38);
        }
        if (params.get("dialogue") === "1" || params.get("npc") === "pai") {
          this.startGame();
          this.player.x = 560;
          const npc = this.npcs[0];
          this.startDialogue(npc.name, npc.portraitKey, npc.dialogue);
        } else if (params.get("npc") === "gari") {
          this.startGame();
          this.player.x = 1950;
          this.camera.x = Math.max(0, this.player.x - WORLD_VIEW_WIDTH * 0.38);
          const npc = this.npcs[2];
          this.startDialogue(npc.name, npc.portraitKey, npc.dialogue);
        }
      } catch (_) {}
    }

    initLevel() {
      // 1. Piso Contínuo e 100% Livre de Armadilhas (Asfalto Novo de Parnamirim)
      this.platforms = [
        { x: 0, y: GROUND_Y, w: LEVEL_LENGTH, h: 140, isGround: true }
      ];

      // 2. PLATAFORMAS EM ALTURAS VARIADAS (NÃO LINEAR)
      // Plataformas baixas (y=440-460), médias (y=360-390) e altas (y=210-260)
      const projectData = [
        {
          id: 1,
          x: 460, y: 390, w: 320, h: 36, // Altura Média
          title: "CARTÃO EDUCA PARNAMIRIM",
          itemKey: "item_cartao_educa",
          pts: 250,
          npc: {
            name: "Seu Francisco (Pai de Aluno)",
            badgeName: "Seu Francisco",
            portraitKey: "portrait_pai_aluno",
            stageSprite: "stage_pai_aluno",
            offsetRelX: 180,
            w: 66, h: 110,
            dialogue: [
              "Olá, Prefeita Professora Nilda! Que alegria encontrar a senhora aqui no colégio!",
              "O Cartão Educa Parnamirim foi uma bênção para a nossa família! Recebemos o auxílio de R$ 4,8 milhões distribuído para mais de 24 mil alunos.",
              "Compramos todo o material escolar novinho nas papelarias da cidade. Parnamirim valoriza a educação das nossas crianças!"
            ]
          }
        },
        {
          id: 2,
          x: 1180, y: 310, w: 360, h: 36, // Altura Alta (Viaduto Elevado)
          title: "MACRODRENAGEM MONTE CASTELO",
          itemKey: "item_tubo_drenagem",
          pts: 300,
          npc: {
            name: "Dona Socorro (Moradora de Monte Castelo)",
            badgeName: "Dona Socorro",
            portraitKey: "portrait_moradora",
            stageSprite: "stage_moradora_snes",
            offsetRelX: 190,
            w: 45, h: 110,
            dialogue: [
              "Prefeita Nilda, moro há mais de 30 anos em Monte Castelo e sempre sofremos com alagamentos que invadiam nossas casas nas chuvas.",
              "Ver essas manilhas gigantes de macrodrenagem e a nova pavimentação sendo instaladas traz uma tranquilidade que nunca tivemos!",
              "Muito obrigada por olhar com tanto carinho para o nosso bairro!"
            ]
          }
        },
        {
          id: 3,
          x: 1920, y: 440, w: 340, h: 36, // Altura Baixa (Terraço da Praça)
          title: "INSALUBRIDADE GARIS EM DOBRO",
          itemKey: "item_colete_gari",
          pts: 250,
          npc: {
            name: "Maria da Limpeza (Agente de Limpeza Urbana)",
            badgeName: "Maria Gari",
            portraitKey: "portrait_gari",
            stageSprite: "stage_gari",
            offsetRelX: 190,
            w: 45, h: 110,
            dialogue: [
              "Prefeita Nilda, toda a equipe dos garis agradece de coração!",
              "Dobrar nosso adicional de insalubridade para chegar ao percentual máximo foi uma conquista histórica que esperávamos há anos.",
              "Com o programa 'Parnamirim Cidade Limpa', estamos mantendo cada bairro limpo, podado e com muito orgulho!"
            ]
          }
        },
        {
          id: 4,
          x: 2650, y: 220, w: 360, h: 36, // Altura Alta (Sacada 2º Andar da Biblioteca)
          title: "REAJUSTE DE 5,4% AOS PROFESSORES",
          itemKey: "item_livro_magisterio",
          pts: 250,
          npc: {
            name: "Professora Cláudia (Rede Municipal)",
            badgeName: "Prof. Cláudia",
            portraitKey: "portrait_professora",
            stageSprite: "stage_professora",
            offsetRelX: 190,
            w: 58, h: 110,
            dialogue: [
              "Colega e Prefeita Professora Nilda, ter uma educadora na gestão transforma o nosso município!",
              "O reajuste de 5,4% sancionado para o magistério e a convocação dos novos professores mostram respeito real pela sala de aula.",
              "Nossas escolas estão revigoradas e as bibliotecas ganharam vida nova!"
            ]
          }
        },
        {
          id: 5,
          x: 3420, y: 380, w: 340, h: 36, // Altura Média (Marquise da UBS)
          title: "FILA ZERO & REMÉDIOS NAS UBSS",
          itemKey: "item_maleta_saude",
          pts: 250,
          npc: {
            name: "Dr. Marcelo (Médico da Rede Municipal)",
            badgeName: "Dr. Marcelo",
            portraitKey: "portrait_medico",
            stageSprite: "stage_medico",
            offsetRelX: 190,
            w: 49, h: 110,
            dialogue: [
              "Prefeita, o mutirão 'Fila Zero' para exames e cirurgias eletivas já reduziu o tempo de espera de milhares de famílias em Parnamirim.",
              "As Unidades Básicas de Saúde estão com abastecimento contínuo de medicamentos essenciais e médicos especialistas no plantão.",
              "Saúde humanizada e de qualidade para toda a nossa gente!"
            ]
          }
        },
        {
          id: 6,
          x: 4180, y: 460, w: 340, h: 36, // Altura Baixa (Distribuição Escolar)
          title: "FARDAMENTO & KITS ESCOLARES",
          itemKey: "item_fardamento_kit",
          pts: 250,
          npc: {
            name: "Sofia (Aluna da Escola Nestor Lima)",
            badgeName: "Aluna Sofia",
            portraitKey: "portrait_aluna",
            stageSprite: "stage_aluna_snes",
            offsetRelX: 190,
            w: 52, h: 105,
            dialogue: [
              "Tia Nilda! Minha mochila nova é linda e meu kit de fardamento veio completinho com tênis confortável!",
              "Agora todo mundo na minha turma tem cadernos novos, lápis de cor e uniforme padronizado.",
              "Dá muito orgulho ir para a escola municipal de Parnamirim!"
            ]
          }
        },
        {
          id: 7,
          x: 4980, y: 240, w: 380, h: 36, // Altura Alta (Andaime Estrutural)
          title: "DRENAGEM AV. OLAVO MONTENEGRO",
          itemKey: "item_tubo_drenagem",
          pts: 350,
          npc: {
            name: "Engenheiro Roberto (Fiscal de Obras)",
            badgeName: "Eng. Roberto",
            portraitKey: "portrait_engenheiro",
            stageSprite: "stage_engenheiro",
            offsetRelX: 200,
            w: 63, h: 110,
            dialogue: [
              "Prefeita Nilda, o projeto estrutural de drenagem da Olavo Montenegro está avançando em ritmo acelerado!",
              "Implantamos tubulação de grande diâmetro com tecnologia de escoamento rápido para acabar em definitivo com os alagamentos naquela avenida vital.",
              "A engenharia de Parnamirim está trabalhando com alto rigor técnico e agilidade!"
            ]
          }
        },
        {
          id: 8,
          x: 5780, y: 370, w: 340, h: 36, // Altura Média (Deck CMEI)
          title: "CLIMATIZAÇÃO CMEIS & ESCOLAS",
          itemKey: "item_ar_condicionado",
          pts: 250,
          npc: {
            name: "Dona Lúcia (Mãe de Aluno do CMEI)",
            badgeName: "Dona Lúcia",
            portraitKey: "portrait_mae_cmei",
            stageSprite: "stage_mae_cmei_snes",
            offsetRelX: 180,
            w: 62, h: 110,
            dialogue: [
              "Prefeita Nilda, meu filho estuda no CMEI e o calor antigamente incomodava muito os bebês na hora da soneca.",
              "Com as salas todas climatizadas com ar-condicionado novinho, as crianças aprendem felizes e bem cuidadas.",
              "Uma creche climatizada faz toda a diferença para as mães trabalhadoras!"
            ]
          }
        },
        {
          id: 9,
          x: 6580, y: 230, w: 350, h: 36, // Altura Alta (Mirante Iluminado)
          title: "PARNAMIRIM ILUMINADA 100% LED",
          itemKey: "item_lampada_led",
          pts: 250,
          npc: {
            name: "Inspetor Santos (Guarda Municipal)",
            badgeName: "Insp. Santos",
            portraitKey: "portrait_guarda",
            stageSprite: "stage_guarda",
            offsetRelX: 190,
            w: 59, h: 110,
            dialogue: [
              "Boa noite, Prefeita! A modernização para luminárias 100% LED de alta potência mudou o patrulhamento preventivo em Parnamirim.",
              "Ruas bem iluminadas reduzem a criminalidade e aumentam a sensação de segurança para quem volta do trabalho ou da faculdade à noite.",
              "A Guarda Municipal opera 24 horas ao lado da comunidade!"
            ]
          }
        },
        {
          id: 10,
          x: 7380, y: 450, w: 340, h: 36, // Altura Baixa (Calçada Pavimentada)
          title: "OPERAÇÃO ASFALTO NOVO",
          itemKey: "item_rolo_asfalto",
          pts: 250,
          npc: {
            name: "Seu Pedro (Comerciante do Centro)",
            badgeName: "Seu Pedro",
            portraitKey: "portrait_comerciante",
            stageSprite: "stage_comerciante_snes",
            offsetRelX: 180,
            w: 62, h: 110,
            dialogue: [
              "Prefeita Nilda, nossas ruas centrais e avenidas de acesso ganharam asfalto liso de alta durabilidade!",
              "O trânsito flui melhor, as calçadas estão acessíveis e o comércio local registrou aumento nas vendas.",
              "Parnamirim está com cara de cidade moderna e próspera!"
            ]
          }
        },
        {
          id: 11,
          x: 8180, y: 300, w: 350, h: 36, // Altura Alta (Deck Ecológico)
          title: "PARNAMIRIM CIDADE LIMPA",
          itemKey: "item_colete_gari",
          pts: 250,
          npc: {
            name: "Cajulim (Mascote Ecológico de Parnamirim)",
            badgeName: "Cajulim",
            portraitKey: "portrait_cajulim",
            stageSprite: "stage_cajulim",
            offsetRelX: 190,
            w: 64, h: 100,
            dialogue: [
              "Epa, Prefeita Nilda! É o Cajulim por aqui! Que alegria ver Parnamirim tão bem cuidada e limpa!",
              "Com coleta seletiva, descarte consciente e obras em todos os bairros, nossa cidade é referência para todo o Rio Grande do Norte!",
              "Vamos juntos continuar transformando a vida das famílias potiguares!"
            ]
          }
        },
        {
          id: 12,
          x: 9032, y: 360, w: 400, h: 50, // Palanque Inaugural
          title: "PALCO OFICIAL DE INAUGURAÇÃO",
          itemKey: "item_chave_cidade",
          pts: 1000,
          isFinal: true
        }
      ];

      // Instala plataformas principais e NPCs no topo
      for (const proj of projectData) {
        this.platforms.push({
          x: proj.x,
          y: proj.y,
          w: proj.w,
          h: proj.h,
          isGround: false,
          title: proj.title,
          isFinal: !!proj.isFinal
        });

        // Item flutuando sobre a metade esquerda da plataforma
        this.items.push({
          x: proj.x + 40,
          y: proj.y - 75,
          w: 64,
          h: 64,
          itemKey: proj.itemKey,
          title: proj.title,
          pts: proj.pts,
          isFinal: !!proj.isFinal,
          collected: false
        });

        // NPC no topo da plataforma. A altura cresce, mas a largura vem da
        // proporção real de cada arquivo para evitar personagens espremidos.
        if (proj.npc) {
          const npcH = Math.round(proj.npc.h * 1.20);
          const npcImg = images[proj.npc.stageSprite];
          const nativeRatio = npcImg && npcImg.naturalHeight > 0
            ? npcImg.naturalWidth / npcImg.naturalHeight
            : (proj.npc.w / proj.npc.h);
          const npcW = Math.max(42, Math.round(npcH * nativeRatio));
          this.npcs.push({
            x: proj.x + proj.npc.offsetRelX,
            y: proj.y - npcH,
            w: npcW,
            h: npcH,
            name: proj.npc.name,
            badgeName: proj.npc.badgeName,
            portraitKey: proj.npc.portraitKey,
            stageSprite: proj.npc.stageSprite,
            talked: false,
            dialogue: proj.npc.dialogue,
            hopY: 0
          });
        }
      }

      // 3. BLOCOS INTERATIVOS E ESCADARIAS ABERTAS (SEM PAREDES PRESAS)
      this.blocks = [];

      // Escadarias abertas que sobem e descem livremente no ar aberto (SEM TETO)
      const addOpenStairPyramid = (centerX, groundY, steps = 3) => {
        const stepW = 48;
        const stepH = 48;
        // Subida
        for (let s = 0; s < steps; s++) {
          const colX = centerX - (steps - s) * stepW;
          for (let h = 0; h <= s; h++) {
            this.blocks.push({
              x: colX,
              y: groundY - (h + 1) * stepH,
              w: stepW,
              h: stepH,
              type: 'brick',
              breakable: false
            });
          }
        }
        // Topo central
        for (let h = 0; h < steps; h++) {
          this.blocks.push({
            x: centerX,
            y: groundY - (h + 1) * stepH,
            w: stepW,
            h: stepH,
            type: 'brick',
            breakable: false
          });
        }
        // Descida
        for (let s = 0; s < steps; s++) {
          const colX = centerX + (s + 1) * stepW;
          for (let h = 0; h < (steps - s); h++) {
            this.blocks.push({
              x: colX,
              y: groundY - (h + 1) * stepH,
              w: stepW,
              h: stepH,
              type: 'brick',
              breakable: false
            });
          }
        }
      };

      // Cinco marcos de subida dão ritmo sem transformar a fase em um labirinto
      // de tijolos. As demais áreas ficam livres para o jogador ler o cenário.
      addOpenStairPyramid(360, GROUND_Y, 2);   // Entrada do Cartão Educa
      addOpenStairPyramid(940, GROUND_Y, 2);   // Entre Zona 1 e 2
      addOpenStairPyramid(2440, GROUND_Y, 2);  // Antes da Escola
      addOpenStairPyramid(4740, GROUND_Y, 2);  // Antes da Olavo Montenegro
      addOpenStairPyramid(7920, GROUND_Y, 2);  // Antes do Cajulim

      // Rotas de acesso contínuas para que cada plataforma alta seja alcançável.
      // O degrau de 48 px cabe no salto atual e evita que a jogadora fique presa
      // olhando para uma plataforma sem uma rota segura de subida.
      const addReachableRamp = (proj) => {
        if (proj.isFinal || proj.y >= GROUND_Y - 120) return;
        const stepW = 48;
        const stepH = 48;
        const steps = Math.ceil((GROUND_Y - proj.y) / stepH);
        const startX = proj.x - (steps - 1) * stepW;
        for (let s = 0; s < steps; s++) {
          this.blocks.push({
            x: startX + s * stepW,
            y: GROUND_Y - (s + 1) * stepH,
            w: stepW,
            h: stepH,
            type: 'brick',
            breakable: false,
            accessRamp: true
          });
        }
      };
      // Plataformas que ficam acima do piso recebem uma rota elevada. As mais
      // baixas continuam fáceis de alcançar e não ganham uma escada adicional.
      for (const proj of projectData) {
        if (proj.y <= 450) addReachableRamp(proj);
      }

      // GRANDE PIRÂMIDE DE VITÓRIA NO FINAL (x: 8840 a 9020)
      const finalSteps = 3;
      for (let s = 0; s < finalSteps; s++) {
        const colX = 8840 + s * 48;
        for (let h = 0; h <= s; h++) {
          this.blocks.push({
            x: colX,
            y: GROUND_Y - (h + 1) * 48,
            w: 48,
            h: 48,
            type: 'brick',
            breakable: false
          });
        }
      }

      // Fileiras de blocos aéreos com linguagem de obra pública.
      const challengeBlockRows = [
        { x: 560, y: 210, type: 'question', content: 'star' },
        { x: 608, y: 210, type: 'brick', breakable: true },
        { x: 656, y: 210, type: 'question', content: 'coin' },

        { x: 1300, y: 130, type: 'recycle', content: 'star' },
        { x: 1348, y: 130, type: 'question', content: 'coin' },

        { x: 2020, y: 260, type: 'question', content: 'coin' },
        { x: 2068, y: 260, type: 'recycle', content: 'coin' },
        { x: 2116, y: 260, type: 'question', content: 'star' },

        { x: 2800, y: 40, type: 'question', content: 'star' },
        { x: 2848, y: 40, type: 'brick', breakable: true },

        { x: 3600, y: 200, type: 'question', content: 'star' },
        { x: 3648, y: 200, type: 'brick', breakable: true },

        { x: 4360, y: 280, type: 'question', content: 'coin' },
        { x: 4408, y: 280, type: 'question', content: 'star' },

        { x: 5140, y: 60, type: 'recycle', content: 'star' },
        { x: 5188, y: 60, type: 'question', content: 'coin' },

        { x: 5960, y: 190, type: 'question', content: 'star' },

        { x: 6720, y: 50, type: 'question', content: 'star' },
        { x: 6768, y: 50, type: 'brick', breakable: true },

        { x: 7520, y: 270, type: 'question', content: 'coin' },
        { x: 7568, y: 270, type: 'brick', breakable: true },

        { x: 8300, y: 120, type: 'recycle', content: 'star' },
        { x: 8348, y: 120, type: 'question', content: 'coin' },

        // Blocos quebráveis no chão (1 tijolo de altura apenas, pulável e destrutível):
        { x: 860, y: GROUND_Y - 48, type: 'brick', breakable: true },
        { x: 1640, y: GROUND_Y - 48, type: 'brick', breakable: true },
        { x: 2360, y: GROUND_Y - 48, type: 'brick', breakable: true },
        { x: 3140, y: GROUND_Y - 48, type: 'brick', breakable: true },
        { x: 3920, y: GROUND_Y - 48, type: 'brick', breakable: true },
        { x: 4660, y: GROUND_Y - 48, type: 'brick', breakable: true },
        { x: 5460, y: GROUND_Y - 48, type: 'brick', breakable: true },
        { x: 6240, y: GROUND_Y - 48, type: 'brick', breakable: true },
        { x: 7040, y: GROUND_Y - 48, type: 'brick', breakable: true },
        { x: 7840, y: GROUND_Y - 48, type: 'brick', breakable: true }
      ];

      for (const b of challengeBlockRows) {
        this.blocks.push({
          x: b.x,
          y: b.y,
          w: 48,
          h: 48,
          type: b.type,
          breakable: !!b.breakable,
          content: b.content,
          hit: false,
          bumpY: 0,
          bumping: false
        });
      }

      // 5. Válvulas e Bombas de Drenagem
      this.drainValves = [
        { x: 1360, y: 530, w: 50, h: 50, active: false, label: "Bomba Monte Castelo" },
        { x: 5160, y: 530, w: 50, h: 50, active: false, label: "Drenagem Olavo Montenegro" }
      ];

      // Poças de Alagamento Crônico no chão (completamente passáveis e drenáveis)
      this.mudPuddles = [
        { x: 1220, y: 565, w: 280, h: 18, valveIndex: 0, drained: false, name: "Alagamento Monte Castelo" },
        { x: 5020, y: 565, w: 300, h: 18, valveIndex: 1, drained: false, name: "Ponto Crítico Olavo Montenegro" }
      ];
    }

    initInput() {
      // 1. Teclado PC
      window.addEventListener("keydown", (e) => {
        if (this.dialogue.active) {
          // Espaço é reservado ao pulo; Enter, E e Z avançam a conversa no teclado.
          if (e.code === "Enter" || e.code === "KeyZ" || e.code === "KeyE") {
            this.advanceDialogue();
          }
          return;
        }

        if (this.state === "TITLE") {
          if (e.code === "Space" || e.code === "Enter") this.startGame();
          return;
        }

        if (this.state === "LEVEL_CLEAR") {
          if (e.code === "Space" || e.code === "Enter") this.restartGame();
          return;
        }

        if (e.code === "ArrowLeft" || e.code === "KeyA") this.keys.left = true;
        if (e.code === "ArrowRight" || e.code === "KeyD") this.keys.right = true;
        if (e.code === "ArrowDown" || e.code === "KeyS") this.keys.down = true;

        if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
          if (!this.keys.jumpHeld) {
            this.keys.jump = true;
            this.player.jumpBufferTimer = 0.16;
          }
          this.keys.jumpHeld = true;
        }

        if (e.code === "KeyE" || e.code === "KeyZ") {
          this.checkInteractions();
        }

        if (e.code === "KeyM") {
          if (window.soundManager) window.soundManager.toggleMute();
        }

        if (e.code === "KeyF") {
          this.toggleFullscreen();
        }

        if (e.code === "KeyR") {
          this.restartGame();
        }
      });

      window.addEventListener("keyup", (e) => {
        if (e.code === "ArrowLeft" || e.code === "KeyA") this.keys.left = false;
        if (e.code === "ArrowRight" || e.code === "KeyD") this.keys.right = false;
        if (e.code === "ArrowDown" || e.code === "KeyS") this.keys.down = false;
        if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
          this.keys.jumpHeld = false;
        }
      });

      // 2. Clique ou Toque no Canvas para Interagir com NPCs
      canvas.addEventListener("pointerdown", (e) => {
        if (this.dialogue.active) {
          this.advanceDialogue();
          return;
        }

        if (this.state === "TITLE") {
          this.startGame();
          return;
        }

        if (this.state === "LEVEL_CLEAR") {
          this.restartGame();
          return;
        }

        // Calcula coordenadas do mundo a partir do toque
        const rect = canvas.getBoundingClientRect();
        const scaleX = V_WIDTH / rect.width;
        const scaleY = V_HEIGHT / rect.height;
        const clickX = (e.clientX - rect.left) * scaleX + this.camera.x;
        const clickY = (e.clientY - rect.top) * scaleY;

        // Clique no canvas ainda funciona como atalho no PC quando a jogadora
        // está próxima; no celular, o botão FALAR é a ação explícita.
        if (this.activePromptNpc) {
          this.checkInteractions();
        }
      });

      // 3. Controles Touch Mobile (Paisagem e Retrato)
      const bindTouchBtn = (elementId, onPress, onRelease) => {
        const btn = document.getElementById(elementId);
        if (!btn) return;

        const startAction = (ev) => {
          ev.preventDefault();
          btn.classList.add("active");
          if (onPress) onPress();
        };

        const stopAction = (ev) => {
          ev.preventDefault();
          btn.classList.remove("active");
          if (onRelease) onRelease();
        };

        btn.addEventListener("pointerdown", startAction, { passive: false });
        btn.addEventListener("pointerup", stopAction, { passive: false });
        btn.addEventListener("pointercancel", stopAction, { passive: false });
        btn.addEventListener("pointerleave", stopAction, { passive: false });
      };

      // Analógico móvel compartilhado pelos modos em pé e deitado.
      // O deslocamento do botão acompanha o dedo e permite diagonais sem
      // transformar o eixo vertical em pulo: o salto continua exclusivo do A.
      const joystickBase = document.getElementById("joystickBase");
      const joystickKnob = document.getElementById("joystickKnob");
      if (joystickBase && joystickKnob) {
        let activePointerId = null;
        const deadZone = 0.24;

        const resetJoystick = () => {
          this.keys.left = false;
          this.keys.right = false;
          this.keys.down = false;
          joystickKnob.style.transform = "translate(-50%, -50%)";
          joystickBase.classList.remove("active");
          activePointerId = null;
        };

        const moveJoystick = (clientX, clientY) => {
          const rect = joystickBase.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const knobRadius = joystickKnob.offsetWidth / 2;
          const maxTravel = Math.max(1, rect.width / 2 - knobRadius - 5);
          const rawX = clientX - centerX;
          const rawY = clientY - centerY;
          const distance = Math.hypot(rawX, rawY);
          const clamp = distance > maxTravel ? maxTravel / distance : 1;
          const visualX = rawX * clamp;
          const visualY = rawY * clamp;
          const axisX = visualX / maxTravel;
          const axisY = visualY / maxTravel;

          joystickKnob.style.transform = `translate(calc(-50% + ${visualX}px), calc(-50% + ${visualY}px))`;
          this.keys.left = axisX < -deadZone;
          this.keys.right = axisX > deadZone;
          this.keys.down = axisY > deadZone;
        };

        joystickBase.addEventListener("pointerdown", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          activePointerId = ev.pointerId;
          joystickBase.setPointerCapture(ev.pointerId);
          joystickBase.classList.add("active");
          moveJoystick(ev.clientX, ev.clientY);
          if (window.soundManager) window.soundManager.init();
          if (navigator.vibrate) navigator.vibrate(10);
        }, { passive: false });

        joystickBase.addEventListener("pointermove", (ev) => {
          if (ev.pointerId !== activePointerId) return;
          ev.preventDefault();
          moveJoystick(ev.clientX, ev.clientY);
        }, { passive: false });

        ["pointerup", "pointercancel", "lostpointercapture"].forEach((eventName) => {
          joystickBase.addEventListener(eventName, (ev) => {
            if (activePointerId !== null && ev.pointerId !== activePointerId) return;
            ev.preventDefault();
            resetJoystick();
          }, { passive: false });
        });
      }

      // Botões de ação do celular
      bindTouchBtn("btnLandJump", () => {
        if (this.dialogue.active) return;
        if (!this.keys.jumpHeld) { this.keys.jump = true; this.player.jumpBufferTimer = 0.16; }
        this.keys.jumpHeld = true;
      }, () => { this.keys.jumpHeld = false; });
      bindTouchBtn("btnLandTalk", () => { this.checkInteractions(); });

      // Controles Retrato (Em Pé / Gamepad Portátil)
      bindTouchBtn("btnPortLeft", () => { this.keys.left = true; }, () => { this.keys.left = false; });
      bindTouchBtn("btnPortRight", () => { this.keys.right = true; }, () => { this.keys.right = false; });
      // O salto fica somente no botão A; o direcional não dispara conversa nem salto.
      bindTouchBtn("btnPortUp", () => {}, () => {});
      bindTouchBtn("btnPortDown", () => { this.keys.down = true; }, () => { this.keys.down = false; });

      bindTouchBtn("btnPortJump", () => {
        if (this.dialogue.active) return;
        if (!this.keys.jumpHeld) { this.keys.jump = true; this.player.jumpBufferTimer = 0.16; }
        this.keys.jumpHeld = true;
      }, () => { this.keys.jumpHeld = false; });
      bindTouchBtn("btnPortTalk", () => { this.checkInteractions(); });

      bindTouchBtn("btnPortSound", () => {
        if (window.soundManager) window.soundManager.toggleMute();
      });
      bindTouchBtn("btnPortRestart", () => { this.restartGame(); });

      // Botões do Cabeçalho
      const btnSoundTop = document.getElementById("btnSoundTop");
      if (btnSoundTop) {
        btnSoundTop.onclick = () => {
          if (window.soundManager) window.soundManager.toggleMute();
        };
      }
      const btnFullscreenTop = document.getElementById("btnFullscreenTop");
      if (btnFullscreenTop) {
        btnFullscreenTop.onclick = () => this.toggleFullscreen();
      }
      const btnRestartTop = document.getElementById("btnRestartTop");
      if (btnRestartTop) {
        btnRestartTop.onclick = () => this.restartGame();
      }
    }

    toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }

    startGame() {
      this.state = "PLAYING";
      if (window.soundManager) {
        window.soundManager.init();
        window.soundManager.startBgm();
      }
    }

    restartGame() {
      if (window.soundManager) window.soundManager.stopDialogueVoice();
      this.player.x = 120;
      this.player.y = GROUND_Y - this.player.h;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.jumpFrame = 0;
      this.score = 0;
      this.coins = 0;
      this.itemsCollected = 0;
      this.drenagensAtivas = 0;
      this.timeRemaining = 480;
      this.camera.x = 0;
      this.camera.y = 0;
      this.activePromptNpc = null;
      this.initLevel();
      this.state = "PLAYING";
      if (window.soundManager) window.soundManager.startBgm();
    }

    triggerNpcDialogue(npc) {
      this.startDialogue(npc.name, npc.portraitKey, npc.dialogue, () => {
        if (!npc.talked) {
          npc.talked = true;
          this.score += 200;
          this.createFloatingText("+200 CIDADANIA", npc.x + npc.w / 2, npc.y - 30, "#38bdf8");
          if (window.soundManager) window.soundManager.playCollect();
        }
      });
    }

    startDialogue(speaker, portraitKey, lines, onComplete) {
      ensureAsset(portraitKey || "portrait_nilda");
      // Voz/blips ficam limpos quando a fala começa; a música volta ao
      // terminar a conversa para não competir com a leitura.
      if (window.soundManager) {
        window.soundManager.stopBgm();
        window.soundManager.stopDialogueVoice();
      }
      this.dialogue.active = true;
      this.dialogue.speaker = speaker;
      this.dialogue.portraitKey = portraitKey || "portrait_nilda";
      this.dialogue.lines = lines;
      this.dialogue.currentLine = 0;
      this.dialogue.charIndex = 0;
      this.dialogue.charTimer = 0;
      this.dialogue.onComplete = onComplete || null;
      this.state = "DIALOGUE";
      this.player.vx = 0;
      if (window.soundManager) {
        const voiced = window.soundManager.playDialogueLine(this.dialogue.portraitKey, 0);
        if (!voiced) window.soundManager.playBlip();
      }
    }

    advanceDialogue() {
      const currentText = this.dialogue.lines[this.dialogue.currentLine];
      if (this.dialogue.charIndex < currentText.length) {
        this.dialogue.charIndex = currentText.length;
        return;
      }

      this.dialogue.currentLine++;
      if (this.dialogue.currentLine >= this.dialogue.lines.length) {
        if (window.soundManager) window.soundManager.stopDialogueVoice();
        this.dialogue.active = false;
        this.state = "PLAYING";
        if (this.dialogue.onComplete) this.dialogue.onComplete();
        if (window.soundManager && this.state === "PLAYING") window.soundManager.startBgm();
      } else {
        this.dialogue.charIndex = 0;
        this.dialogue.charTimer = 0;
        if (window.soundManager) {
          const voiced = window.soundManager.playDialogueLine(
            this.dialogue.portraitKey,
            this.dialogue.currentLine
          );
          if (!voiced) window.soundManager.playBlip();
        }
      }
    }

    checkInteractions() {
      if (this.dialogue.active) {
        this.advanceDialogue();
        return;
      }

      // 1. Se estiver perto de um cidadão / NPC, fala!
      if (this.activePromptNpc) {
        this.triggerNpcDialogue(this.activePromptNpc);
        return;
      }

      // 2. Interação com Válvulas de Drenagem
      const p = this.player;
      const hit = this.playerHitbox(p);
      const interactBox = { x: hit.x - 40, y: hit.y - 30, w: hit.w + 80, h: hit.h + 50 };

      for (let i = 0; i < this.drainValves.length; i++) {
        const v = this.drainValves[i];
        if (this.checkAABB(interactBox, v)) {
          if (!v.active) {
            v.active = true;
            this.drenagensAtivas++;
            this.score += 500;
            if (this.mudPuddles[i]) this.mudPuddles[i].drained = true;
            if (window.soundManager) window.soundManager.playDrain();
            this.createFloatingText("✔ DRENAGEM ATIVADA! +500 PTS", v.x, v.y - 40, "#10b981");
            this.spawnSparkles(v.x + v.w / 2, v.y + v.h / 2, 24);
          }
          return;
        }
      }
    }

    checkAABB(r1, r2) {
      return (
        r1.x < r2.x + r2.w &&
        r1.x + r1.w > r2.x &&
        r1.y < r2.y + r2.h &&
        r1.y + r1.h > r2.y
      );
    }

    playerHitbox(p = this.player) {
      const hitW = p.hitW || p.w;
      const hitH = p.hitH || p.h;
      return {
        x: p.x + (p.w - hitW) / 2,
        y: p.y + p.h - hitH,
        w: hitW,
        h: hitH
      };
    }

    spawnSparkles(x, y, count = 12) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 60 + Math.random() * 160;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 60,
          color: Math.random() > 0.5 ? "#facc15" : "#38bdf8",
          size: 3 + Math.random() * 4,
          life: 0.7,
          maxLife: 0.7
        });
      }
    }

    spawnBrickDebris(x, y, w, h) {
      const hw = w / 2;
      const hh = h / 2;
      const pieces = [
        { x: x, y: y, vx: -120, vy: -380 },
        { x: x + hw, y: y, vx: 120, vy: -380 },
        { x: x, y: y + hh, vx: -160, vy: -240 },
        { x: x + hw, y: y + hh, vx: 160, vy: -240 }
      ];
      for (const p of pieces) {
        this.brickDebris.push({
          x: p.x,
          y: p.y,
          w: hw,
          h: hh,
          vx: p.vx + (Math.random() - 0.5) * 40,
          vy: p.vy,
          rot: 0,
          vRot: (Math.random() > 0.5 ? 1 : -1) * (8 + Math.random() * 8),
          life: 1.2
        });
      }
    }

    createFloatingText(text, x, y, color = "#facc15") {
      this.floatingTexts.push({
        text,
        x,
        y,
        color,
        life: 1.4,
        maxLife: 1.4
      });
    }

    hitBlock(b) {
      if (b.bumping) return;
      b.bumping = true;
      b.bumpY = -10;

      for (const npc of this.npcs) {
        if (npc.x + npc.w > b.x && npc.x < b.x + b.w && Math.abs((npc.y + npc.h) - b.y) < 14) {
          npc.hopY = -10;
        }
      }

      if (b.type === 'question' || b.type === 'recycle') {
        if (!b.hit) {
          b.hit = true;
          if (window.soundManager) window.soundManager.playCoin();
          
          this.poppedItems.push({
            x: b.x + (b.w - 32) / 2,
            y: b.y - 32,
            w: 32,
            h: 32,
            type: b.content || 'coin',
            popVy: -340,
            popping: true,
            rot: 0
          });

          this.spawnSparkles(b.x + b.w / 2, b.y, 16);
          if (b.content === 'star') {
            this.score += 300;
            this.createFloatingText("★ +300 PTS", b.x + b.w / 2, b.y - 20, "#facc15");
          } else {
            this.coins++;
            this.score += 100;
            this.createFloatingText("🪙 +100 PTS", b.x + b.w / 2, b.y - 20, "#fef08a");
          }
        } else {
          if (window.soundManager) window.soundManager.playBump();
        }
      } else if (b.type === 'brick') {
        if (b.breakable) {
          if (window.soundManager) window.soundManager.playBreak();
          this.spawnBrickDebris(b.x, b.y, b.w, b.h);
          this.spawnSparkles(b.x + b.w / 2, b.y + b.h / 2, 12);
          this.score += 50;
          this.createFloatingText("+50", b.x + b.w / 2, b.y - 15, "#fb923c");

          const idx = this.blocks.indexOf(b);
          if (idx !== -1) this.blocks.splice(idx, 1);
        } else {
          if (window.soundManager) window.soundManager.playBump();
        }
      }
    }

    update(dt) {
      if (this.state === "TITLE") return;

      if (this.state === "DIALOGUE") {
        this.updateDialogue(dt);
        this.updateBlocks(dt);
        this.updateParticles(dt);
        return;
      }

      this.timeRemaining = Math.max(0, this.timeRemaining - dt);

      const p = this.player;

      // 1. Controles Horizontais
      let moveDir = 0;
      if (this.keys.left) moveDir -= 1;
      if (this.keys.right) moveDir += 1;

      if (moveDir !== 0) {
        p.vx += moveDir * ACCEL * dt;
        p.vx = clamp(p.vx, -MOVE_SPEED, MOVE_SPEED);
        p.facing = moveDir;
        p.animTimer += dt * 9;
        p.walkFrame = Math.floor(p.animTimer) % 6;
      } else {
        p.vx *= Math.pow(FRICTION, dt * 60);
        if (Math.abs(p.vx) < 5) p.vx = 0;
        if (Math.abs(p.vx) <= 20) {
          p.animTimer = 0;
          p.walkFrame = 0;
        }
      }

      // 2. Coyote Time e Pulo
      if (p.grounded) {
        p.coyoteTimer = 0.12;
      } else {
        p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
      }
      p.jumpBufferTimer = Math.max(0, p.jumpBufferTimer - dt);

      if (p.jumpBufferTimer > 0 && p.coyoteTimer > 0 && !p.isJumping) {
        p.vy = JUMP_FORCE;
        p.grounded = false;
        p.coyoteTimer = 0;
        p.jumpBufferTimer = 0;
        p.isJumping = true;
        p.jumpFrame = 0;
        if (window.soundManager) window.soundManager.playJump();
      }

      if (!this.keys.jumpHeld && p.vy < 0 && p.isJumping) {
        p.vy += GRAVITY * (1 - JUMP_CUT_MULT) * dt * 2.5;
      }

      p.vy += GRAVITY * dt;
      p.vy = Math.min(p.vy, MAX_FALL_SPEED);

      // 3. Movimento Horizontal e Colisões
      p.x += p.vx * dt;
      this.resolveMapCollisionsX(p);
      p.x = clamp(p.x, 20, LEVEL_LENGTH - p.w - 40);

      // 4. Movimento Vertical e Colisões
      const previousY = p.y;
      p.y += p.vy * dt;
      p.grounded = false;
      this.resolveMapCollisionsY(p, dt, previousY);

      if (p.grounded) {
        p.isJumping = false;
      }

      // 5. Atualizações de Blocos e Efeitos
      this.updateBlocks(dt);
      this.updatePoppedItems(dt);
      this.updateBrickDebris(dt);
      this.updateItems(dt);

      for (const npc of this.npcs) {
        if (npc.hopY < 0) {
          npc.hopY += 30 * dt;
          if (npc.hopY > 0) npc.hopY = 0;
        }
      }

      // 6. Detecção de proximidade com tolerância horizontal confortável,
      // mas sem ativar um NPC que esteja em outro andar distante.
      let foundNearNpc = null;
      for (const npc of this.npcs) {
        const dx = Math.abs((p.x + p.w / 2) - (npc.x + npc.w / 2));
        // Permite falar tanto no mesmo nível quanto olhando de baixo da plataforma
        const dy = Math.abs((p.y + p.h) - (npc.y + npc.h));
        if (dx < 118 && dy < 150) {
          foundNearNpc = npc;
          break;
        }
      }
      this.activePromptNpc = foundNearNpc;

      // 7. Câmera SNES: acompanha a subida sem deixar a Nilda atrás do HUD.
      const targetCamX = p.x - WORLD_VIEW_WIDTH * 0.38;
      this.camera.x = lerp(this.camera.x, clamp(targetCamX, 0, LEVEL_LENGTH - WORLD_VIEW_WIDTH), 0.12);
      const targetCamY = p.y + p.h / 2 - CAMERA_FOLLOW_Y;
      this.camera.y = lerp(this.camera.y, clamp(targetCamY, CAMERA_MIN_Y, 0), 0.18);

      this.updateParticles(dt);
    }

    resolveMapCollisionsX(p) {
      for (const b of this.blocks) {
        const hit = this.playerHitbox(p);
        if (this.checkAABB(hit, b)) {
          const hitOffsetX = (p.w - hit.w) / 2;
          if (p.vx > 0) {
            p.x = b.x - hit.w - hitOffsetX;
            p.vx = 0;
          } else if (p.vx < 0) {
            p.x = b.x + b.w - hitOffsetX;
            p.vx = 0;
          }
        }
      }
    }

    resolveMapCollisionsY(p, dt = 0.016, previousY = p.y) {
      // 1. Colisão com Plataformas Suspensas e Chão
      for (const plat of this.platforms) {
        const hit = this.playerHitbox(p);
        if (hit.x + hit.w * 0.9 > plat.x && hit.x + hit.w * 0.1 < plat.x + plat.w) {
          if (plat.isGround) {
            if (hit.y + hit.h >= plat.y) {
              p.y = plat.y - p.h;
              p.vy = 0;
              p.grounded = true;
            }
          } else {
            // Plataforma semi-sólida (atravessa pulando por baixo)
            if (p.vy >= 0 && (hit.y + hit.h) >= plat.y && (hit.y + hit.h) <= plat.y + 26) {
              p.y = plat.y - p.h;
              p.vy = 0;
              p.grounded = true;
            }
          }
        }
      }

      // 2. Colisão com blocos de desafio
      for (const b of this.blocks) {
        const hit = this.playerHitbox(p);
        const overlapsX = hit.x < b.x + b.w && hit.x + hit.w > b.x;
        if (!overlapsX) continue;

        const previousFeet = previousY + p.h;
        const currentFeet = p.y + p.h;
        const blockBottom = b.y + b.h;
        const crossedBlockTop = p.vy >= 0 && previousFeet <= b.y + 8 && currentFeet >= b.y;
        const crossedBlockBottom = p.vy < 0 && previousY >= blockBottom - 6 && p.y <= blockBottom;

        if (crossedBlockTop) {
          p.y = b.y - p.h;
          p.vy = 0;
          p.grounded = true;
        } else if (crossedBlockBottom) {
          // Encosta o topo visual da Nilda na parte inferior do bloco. A
          // lógica anterior subtraía a altura inteira e teleportava o corpo
          // para dentro/acima do tijolo.
          p.y = blockBottom;
          p.vy = 30;
          this.hitBlock(b);
        }
      }
    }

    updateBlocks(dt) {
      for (const b of this.blocks) {
        if (b.bumping) {
          b.bumpY += 32 * dt * 2.8;
          if (b.bumpY >= 0) {
            b.bumpY = 0;
            b.bumping = false;
          }
        }
      }
    }

    updatePoppedItems(dt) {
      for (let i = this.poppedItems.length - 1; i >= 0; i--) {
        const item = this.poppedItems[i];
        if (item.popping) {
          item.y += item.popVy * dt;
          item.popVy += 900 * dt;
          item.rot += 12 * dt;
          if (item.popVy >= 0) {
            item.popping = false;
            this.spawnSparkles(item.x + item.w / 2, item.y, 8);
            this.poppedItems.splice(i, 1);
          }
        }
      }
    }

    updateBrickDebris(dt) {
      for (let i = this.brickDebris.length - 1; i >= 0; i--) {
        const d = this.brickDebris[i];
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.vy += GRAVITY * dt;
        d.rot += d.vRot * dt;
        d.life -= dt;
        if (d.life <= 0 || d.y > V_HEIGHT + 100) {
          this.brickDebris.splice(i, 1);
        }
      }
    }

    updateItems(dt) {
      const p = this.player;
      const hit = this.playerHitbox(p);
      for (const item of this.items) {
        if (!item.collected && this.checkAABB(hit, item)) {
          item.collected = true;
          this.itemsCollected++;
          this.score += item.pts;

          if (item.isFinal) {
            this.triggerLevelClear();
          } else {
            if (window.soundManager) window.soundManager.playCollect();
            this.spawnSparkles(item.x + item.w / 2, item.y + item.h / 2, 20);
            this.createFloatingText("+" + item.pts + " " + item.title.split(" ")[0], item.x, item.y - 20, "#facc15");
          }
        }
      }
    }

    updateDialogue(dt) {
      const lines = this.dialogue.lines;
      const currentText = lines[this.dialogue.currentLine] || "";

      if (this.dialogue.charIndex < currentText.length) {
        this.dialogue.charTimer += dt;
        if (this.dialogue.charTimer >= 0.025) {
          this.dialogue.charTimer = 0;
          this.dialogue.charIndex++;
          const hasVoice = window.soundManager && window.soundManager.hasDialogueVoice(
            this.dialogue.portraitKey,
            this.dialogue.currentLine
          );
          if (this.dialogue.charIndex % 3 === 0 && window.soundManager && !hasVoice) {
            window.soundManager.playBlip();
          }
        }
      }
    }

    updateParticles(dt) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const pt = this.particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.vy += 400 * dt;
        pt.life -= dt;
        if (pt.life <= 0) this.particles.splice(i, 1);
      }

      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.y -= 45 * dt;
        ft.life -= dt;
        if (ft.life <= 0) this.floatingTexts.splice(i, 1);
      }

      if (this.state === "LEVEL_CLEAR") {
        if (this.confetti.length < 80) {
          this.confetti.push({
            x: this.camera.x + Math.random() * V_WIDTH,
            y: -20,
            vx: -40 + Math.random() * 80,
            vy: 120 + Math.random() * 180,
            color: ["#facc15", "#38bdf8", "#ec4899", "#10b981", "#f97316"][Math.floor(Math.random() * 5)],
            w: 8 + Math.random() * 8,
            h: 6 + Math.random() * 6,
            rot: Math.random() * Math.PI,
            vRot: -5 + Math.random() * 10
          });
        }
        for (let i = this.confetti.length - 1; i >= 0; i--) {
          const c = this.confetti[i];
          c.x += c.vx * dt;
          c.y += c.vy * dt;
          c.rot += c.vRot * dt;
          if (c.y > V_HEIGHT + 30) this.confetti.splice(i, 1);
        }
      }
    }

    triggerLevelClear() {
      this.state = "LEVEL_CLEAR";
      if (window.soundManager) {
        window.soundManager.stopBgm();
        window.soundManager.playFanfare();
      }

      setTimeout(() => {
        this.startDialogue(
          "Prefeita Professora Nilda",
          "portrait_nilda",
          [
            "Povo querido de Parnamirim, realizamos hoje a maior entrega de obras e conquistas da nossa história!",
            "Da educação com o Cartão Educa e climatização, à macrodrenagem de Monte Castelo e valorização dos garis!",
            "Parnamirim é uma cidade de trabalho, respeito e futuro. Muito obrigada a cada cidadão que faz essa transformação acontecer!"
          ],
          () => {
            this.state = "LEVEL_CLEAR";
          }
        );
      }, 1000);
    }

    // --- RENDERIZAÇÃO GRÁFICA SNES ---
    render() {
      ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

      if (this.state === "TITLE") {
        this.renderTitleScreen();
        return;
      }

      const camX = this.camera.x;
      const camY = this.camera.y;

      // 1. Cenário de Fundo (Parallax 16-bit de Parnamirim)
      // O zoom gira em torno do piso para que os pés permaneçam estáveis.
      ctx.save();
      ctx.translate(0, GROUND_Y);
      ctx.scale(WORLD_ZOOM, WORLD_ZOOM);
      ctx.translate(0, -GROUND_Y);
      const bg = images.bg_panorama;
      if (bg && bg.complete && bg.naturalWidth > 0) {
        const bgParallaxX = -(camX * 0.3) % bg.naturalWidth;
        ctx.drawImage(bg, bgParallaxX, 0, bg.naturalWidth, V_HEIGHT);
        if (bgParallaxX + bg.naturalWidth < WORLD_VIEW_WIDTH) {
          ctx.drawImage(bg, bgParallaxX + bg.naturalWidth, 0, bg.naturalWidth, V_HEIGHT);
        }
      } else {
        const grad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT / WORLD_ZOOM);
        grad.addColorStop(0, "#38bdf8");
        grad.addColorStop(0.7, "#bae6fd");
        grad.addColorStop(1, "#f0fdf4");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, WORLD_VIEW_WIDTH, V_HEIGHT / WORLD_ZOOM);
      }
      ctx.restore();

      ctx.save();
      ctx.translate(0, GROUND_Y);
      ctx.scale(WORLD_ZOOM, WORLD_ZOOM);
      ctx.translate(-Math.round(camX), -GROUND_Y - Math.round(camY));

      // 2. Poças de Alagamento Crônico no Chão
      for (const puddle of this.mudPuddles) {
        if (!puddle.drained) {
          ctx.fillStyle = "rgba(14, 116, 144, 0.85)";
          ctx.fillRect(puddle.x, puddle.y, puddle.w, puddle.h);
          ctx.fillStyle = "#38bdf8";
          ctx.font = "bold 14px monospace";
          ctx.fillText("⚠ " + puddle.name.toUpperCase(), puddle.x + 10, puddle.y - 8);
        } else {
          ctx.fillStyle = "rgba(71, 85, 105, 0.45)";
          ctx.fillRect(puddle.x, puddle.y + 6, puddle.w, 8);
          ctx.fillStyle = "#10b981";
          ctx.font = "bold 13px monospace";
          ctx.fillText("✔ DRENADO PELA PREFEITURA DE PARNAMIRIM", puddle.x + 8, puddle.y - 6);
        }
      }

      // 3. PLATAFORMAS PADRONIZADAS (ALTURAS VARIADAS E DINÂMICAS)
      for (const plat of this.platforms) {
        if (plat.isGround) {
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

          ctx.fillStyle = "#94a3b8";
          ctx.fillRect(plat.x, plat.y, plat.w, 14);

          ctx.fillStyle = "#f59e0b";
          for (let fx = plat.x + 30; fx < plat.x + plat.w; fx += 90) {
            ctx.fillRect(fx, plat.y + 40, 45, 6);
          }
        } else {
          // Plataforma Oficial de Obra Pública
          const px = plat.x;
          const py = plat.y;
          const pw = plat.w;
          const ph = plat.h;

          ctx.fillStyle = "#1e293b";
          ctx.fillRect(px, py, pw, ph);

          ctx.fillStyle = "#0f172a";
          ctx.fillRect(px, py + ph - 6, pw, 6);

          ctx.fillStyle = "#f5b700";
          ctx.fillRect(px, py, pw, 5);

          ctx.fillStyle = "#cbd5e1";
          ctx.fillRect(px + 4, py + 8, 4, 4);
          ctx.fillRect(px + pw - 8, py + 8, 4, 4);
          ctx.fillRect(px + 4, py + ph - 10, 4, 4);
          ctx.fillRect(px + pw - 8, py + ph - 10, 4, 4);

          const labelW = pw - 24;
          const labelH = ph - 14;
          const labelX = px + 12;
          const labelY = py + 7;

          ctx.fillStyle = "#090d16";
          ctx.fillRect(labelX, labelY, labelW, labelH);
          ctx.strokeStyle = "#f5b700";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(labelX, labelY, labelW, labelH);

          ctx.fillStyle = "#fef08a";
          ctx.textAlign = "center";
          drawFittedText(ctx, "★ " + plat.title + " ★", px + pw / 2, labelY + labelH - 5, labelW - 10, 14);
          ctx.textAlign = "left";
        }
      }

      // 4. Blocos de desafio com identidade municipal
      const brickImg = images.block_brick;
      const questionImg = images.block_question;
      const recycleImg = images.block_recycle;
      const emptyImg = images.block_empty;

      for (const b of this.blocks) {
        if (b.x + b.w < camX - 50 || b.x > camX + WORLD_VIEW_WIDTH + 50) continue;

        const drawY = b.y + (b.bumpY || 0);
        let img = brickImg;

        if (b.hit) {
          img = emptyImg || brickImg;
        } else if (b.type === 'question') {
          img = questionImg;
        } else if (b.type === 'recycle') {
          img = recycleImg;
        }

        if (img && img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, b.x, drawY, b.w, b.h);
        } else {
          ctx.fillStyle = b.hit ? "#78350f" : (b.type === 'question' ? "#eab308" : (b.type === 'recycle' ? "#10b981" : "#b45309"));
          ctx.fillRect(b.x, drawY, b.w, b.h);
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.strokeRect(b.x + 1, drawY + 1, b.w - 2, b.h - 2);
        }
      }

      // 5. ESTILHAÇOS DE TIJOLOS
      for (const d of this.brickDebris) {
        ctx.save();
        ctx.translate(d.x + d.w / 2, d.y + d.h / 2);
        ctx.rotate(d.rot);
        if (brickImg && brickImg.complete) {
          ctx.drawImage(brickImg, 0, 0, 32, 32, -d.w / 2, -d.h / 2, d.w, d.h);
        } else {
          ctx.fillStyle = "#b45309";
          ctx.fillRect(-d.w / 2, -d.h / 2, d.w, d.h);
        }
        ctx.restore();
      }

      // 6. ITENS POPPED
      for (const item of this.poppedItems) {
        ctx.save();
        ctx.translate(item.x + item.w / 2, item.y + item.h / 2);
        ctx.rotate(item.rot);
        if (item.type === 'star') {
          ctx.fillStyle = "#facc15";
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = "#facc15";
          ctx.beginPath();
          ctx.arc(0, 0, 13, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#eab308";
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.fillStyle = "#78350f";
          ctx.font = "900 12px monospace";
          ctx.fillText("$", -4, 4);
        }
        ctx.restore();
      }

      // 7. Válvulas de Drenagem
      for (const valve of this.drainValves) {
        ctx.fillStyle = valve.active ? "#10b981" : "#ef4444";
        ctx.beginPath();
        ctx.arc(valve.x + valve.w / 2, valve.y + valve.h / 2, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "900 13px monospace";
        ctx.fillText(valve.active ? "ON" : "BOMBA", valve.x + 8, valve.y + 26);

        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 12px 'Segoe UI', sans-serif";
        ctx.fillText(valve.label, valve.x - 30, valve.y - 12);
      }

      // 8. Ícones de Projetos Flutuando
      for (const item of this.items) {
        if (!item.collected) {
          const bobY = Math.sin(performance.now() * 0.005 + item.x) * 6;
          const itemImg = images[item.itemKey];
          if (itemImg && itemImg.complete && itemImg.naturalWidth > 0) {
            ctx.drawImage(itemImg, item.x, item.y + bobY, item.w, item.h);
          } else {
            ctx.fillStyle = "#f5b700";
            ctx.fillRect(item.x, item.y + bobY, item.w, item.h);
          }

          ctx.fillStyle = "rgba(245, 183, 0, 0.25)";
          ctx.beginPath();
          ctx.ellipse(item.x + item.w / 2, item.y + item.h + 8 + bobY, 20, 5, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 9. CIDADÃOS E NPCS (COM BALÃO DE DIÁLOGO E BOTÃO DE TOQUE)
      for (const npc of this.npcs) {
        const stageImg = images[npc.stageSprite];
        const drawNpcY = npc.y + (npc.hopY || 0);

        if (stageImg && stageImg.complete && stageImg.naturalWidth > 0) {
          ctx.drawImage(stageImg, npc.x, drawNpcY, npc.w, npc.h);
        } else {
          ctx.fillStyle = "#3b82f6";
          ctx.fillRect(npc.x, drawNpcY + 20, npc.w, npc.h - 20);
        }

        // Crachá identificador superior
        const badgeW = Math.max(80, npc.w + 30);
        const badgeH = 22;
        const badgeX = npc.x + (npc.w - badgeW) / 2;
        const badgeY = drawNpcY - 26;

        ctx.fillStyle = "rgba(15, 23, 42, 0.90)";
        ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
        ctx.strokeStyle = "#f5b700";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);

        ctx.fillStyle = "#facc15";
        ctx.textAlign = "center";
        drawFittedText(ctx, "! " + npc.badgeName, npc.x + npc.w / 2, badgeY + 15, badgeW - 8, 13);
        ctx.textAlign = "left";

        // BALÃO BRILHANTE INDICANDO "FALAR" QUANDO PERTO
        if (this.activePromptNpc === npc) {
          const promptW = 120;
          const promptH = 26;
          const promptX = npc.x + (npc.w - promptW) / 2;
          const promptY = badgeY - 32;

          const pulse = Math.sin(performance.now() * 0.008) * 3;

          ctx.fillStyle = "#f5b700";
          ctx.fillRect(promptX, promptY + pulse, promptW, promptH);
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.strokeRect(promptX, promptY + pulse, promptW, promptH);

          ctx.fillStyle = "#000000";
          ctx.font = "900 13px monospace";
          ctx.textAlign = "center";
          ctx.fillText("💬 CONVERSAR (E)", promptX + promptW / 2, promptY + pulse + 17);
          ctx.textAlign = "left";
        }
      }

      // 10. Fita de Inauguração no Palanque
      ctx.strokeStyle = "#dc2626";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(9032, 370);
      ctx.lineTo(9432, 370);
      ctx.stroke();
      ctx.fillStyle = "#fef08a";
      ctx.font = "bold 13px 'Segoe UI', sans-serif";
      ctx.fillText("✂ FITA INAUGURAL DAS OBRAS DE PARNAMIRIM", 9060, 362);

      // 11. Prefeita Professora Nilda
      const p = this.player;
      let pImg = images.nilda_idle;
      if (this.state === "LEVEL_CLEAR") {
        pImg = images.nilda_win || images.nilda_idle;
      } else if (!p.grounded) {
        // Cinco poses dão preparação, subida, ápice, queda e aterrissagem.
        const jumpProgress = clamp((p.vy - JUMP_FORCE) / (MAX_FALL_SPEED - JUMP_FORCE), 0, 1);
        p.jumpFrame = Math.round(jumpProgress * 4);
        pImg = images["nilda_jump_" + p.jumpFrame] || images.nilda_jump || images.nilda_idle;
      } else if (Math.abs(p.vx) > 20) {
        const walkImgs = [images.nilda_walk_0, images.nilda_walk_1, images.nilda_walk_2, images.nilda_walk_3, images.nilda_walk_4, images.nilda_walk_5];
        pImg = walkImgs[p.walkFrame] || images.nilda_idle;
      }

      ctx.save();
      ctx.translate(Math.round(p.x + p.w / 2), Math.round(p.y + p.h / 2));
      ctx.scale(p.facing, 1);

      if (pImg && pImg.complete && pImg.naturalWidth > 0) {
        ctx.drawImage(pImg, -p.w / 2, -p.h / 2, p.w, p.h);
      } else {
        ctx.fillStyle = "#0284c7";
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();

      // 12. Partículas
      for (const pt of this.particles) {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.life / pt.maxLife;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // 13. Textos Flutuantes
      for (const ft of this.floatingTexts) {
        ctx.save();
        ctx.fillStyle = ft.color;
        ctx.font = "900 15px 'Segoe UI', monospace";
        ctx.globalAlpha = ft.life / ft.maxLife;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      ctx.restore();

      // 14. Confetes de Vitória
      if (this.state === "LEVEL_CLEAR") {
        for (const c of this.confetti) {
          ctx.save();
          ctx.translate((c.x - camX) * WORLD_ZOOM, GROUND_Y + (c.y - GROUND_Y - camY) * WORLD_ZOOM);
          ctx.rotate(c.rot);
          ctx.fillStyle = c.color;
          ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
          ctx.restore();
        }
      }

      // 15. HUD Superior
      this.renderHUD();

      // 16. Caixa de Diálogo SNES
      if (this.state === "DIALOGUE" || (this.state === "LEVEL_CLEAR" && this.dialogue.active)) {
        this.renderDialogueBox();
      }

      // 17. Tela de Vitória
      if (this.state === "LEVEL_CLEAR" && !this.dialogue.active) {
        this.renderVictoryOverlay();
      }
    }

    renderHUD() {
      const portraitMode = window.innerHeight > window.innerWidth;

      // No modo retrato a câmera mostra apenas o centro do canvas. Um HUD
      // compacto e centralizado mantém o objetivo legível sem perder a logo.
      if (portraitMode) {
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.fillRect(400, 0, 480, 68);
        ctx.fillStyle = "#f5b700";
        ctx.fillRect(400, 66, 480, 3);

        ctx.fillStyle = "#f8fafc";
        ctx.font = "900 18px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("MISSÃO PARNAMIRIM", V_WIDTH / 2, 24);

        ctx.fillStyle = "#6ee7b7";
        ctx.font = "900 16px monospace";
        ctx.fillText(`OBRAS ${this.itemsCollected}/${this.totalItems}   •   DRENAGENS ${this.drenagensAtivas}/${this.totalDrenagens}`, V_WIDTH / 2, 47);

        ctx.fillStyle = this.timeRemaining < 60 ? "#ef4444" : "#fef08a";
        ctx.font = "900 15px monospace";
        ctx.fillText(`TEMPO ${Math.floor(this.timeRemaining / 60)}:${String(Math.floor(this.timeRemaining % 60)).padStart(2, "0")}   •   PTS ${String(this.score).padStart(6, "0")}`, V_WIDTH / 2, 64);
        ctx.textAlign = "left";
        return;
      }

      const compactLandscape = window.innerWidth < 1000 && window.innerWidth > window.innerHeight;
      if (compactLandscape) {
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.fillRect(0, 0, V_WIDTH, 68);
        ctx.fillStyle = "#f5b700";
        ctx.fillRect(0, 66, V_WIDTH, 3);

        const logo = images.ui_muni;
        if (logo && logo.complete && logo.naturalWidth > 0) {
          ctx.drawImage(logo, 18, 7, 120, 42);
        }
        ctx.fillStyle = "#f8fafc";
        ctx.font = "900 19px 'Segoe UI', sans-serif";
        ctx.fillText("MISSÃO PARNAMIRIM", 158, 28);
        ctx.fillStyle = "#6ee7b7";
        ctx.font = "900 15px monospace";
        ctx.fillText(`OBRAS ${this.itemsCollected}/${this.totalItems}  •  DRENAGENS ${this.drenagensAtivas}/${this.totalDrenagens}`, 158, 51);

        ctx.fillStyle = this.timeRemaining < 60 ? "#ef4444" : "#fef08a";
        ctx.font = "900 19px monospace";
        ctx.textAlign = "right";
        ctx.fillText(`TEMPO ${Math.floor(this.timeRemaining / 60)}:${String(Math.floor(this.timeRemaining % 60)).padStart(2, "0")}`, 1250, 28);
        ctx.fillStyle = "#38bdf8";
        ctx.font = "900 15px monospace";
        ctx.fillText(`PTS ${String(this.score).padStart(6, "0")}`, 1250, 51);
        ctx.textAlign = "left";
        return;
      }

      ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
      ctx.fillRect(0, 0, V_WIDTH, 56);
      ctx.fillStyle = "#f5b700";
      ctx.fillRect(0, 56, V_WIDTH, 3);

      const logo = images.ui_muni;
      if (logo && logo.complete && logo.naturalWidth > 0) {
        ctx.drawImage(logo, 20, 6, 130, 44);
      }

      ctx.fillStyle = "#f8fafc";
      ctx.font = "900 18px 'Segoe UI', sans-serif";
      ctx.fillText("PREFEITA PROFESSORA NILDA", 170, 24);

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 13px monospace";
      ctx.fillText("PARNAMIRIM NO RUMO CERTO • SNES 16-BIT", 170, 42);

      ctx.fillStyle = "#f5b700";
      ctx.font = "900 16px 'Segoe UI', monospace";
      ctx.fillText(`OBRAS: ${this.itemsCollected}/${this.totalItems}`, 580, 25);

      ctx.fillStyle = "#10b981";
      ctx.fillText(`DRENAGENS: ${this.drenagensAtivas}/${this.totalDrenagens}`, 580, 43);

      ctx.fillStyle = "#facc15";
      ctx.font = "900 16px 'Segoe UI', monospace";
      ctx.fillText(`🪙 MOEDAS: ${this.coins}`, 800, 25);

      ctx.fillStyle = "#fef08a";
      ctx.fillText(`PTS: ${String(this.score).padStart(6, "0")}`, 800, 43);

      const mins = Math.floor(this.timeRemaining / 60);
      const secs = Math.floor(this.timeRemaining % 60);
      const timeStr = `${mins}:${String(secs).padStart(2, "0")}`;
      ctx.fillStyle = this.timeRemaining < 60 ? "#ef4444" : "#f8fafc";
      ctx.font = "900 16px 'Segoe UI', monospace";
      ctx.fillText(`TEMPO: ${timeStr}`, 1040, 25);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 13px monospace";
      ctx.fillText("ESPAÇO: Pular | E: Falar", 1040, 43);
    }

    renderDialogueBox() {
      const portraitMode = window.innerHeight > window.innerWidth;
      const boxW = portraitMode ? 410 : V_WIDTH - 280;
      const boxX = (V_WIDTH - boxW) / 2;
      const boxY = portraitMode ? V_HEIGHT - 302 : V_HEIGHT - 220;
      const boxH = portraitMode ? 282 : 200;

      ctx.fillStyle = "rgba(10, 15, 30, 0.96)";
      ctx.fillRect(boxX, boxY, boxW, boxH);

      ctx.strokeStyle = "#f5b700";
      ctx.lineWidth = 4;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX + 3, boxY + 3, boxW - 6, boxH - 6);

      const pSize = portraitMode ? 88 : 136;
      const pX = portraitMode ? boxX + (boxW - pSize) / 2 : boxX + 24;
      const pY = portraitMode ? boxY + 16 : boxY + 25;

      ctx.fillStyle = "#1e293b";
      ctx.fillRect(pX, pY, pSize, pSize);
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(pX, pY, pSize, pSize);

      const pImg = images[this.dialogue.portraitKey];
      if (pImg && pImg.complete && pImg.naturalWidth > 0) {
        const inner = pSize - 8;
        const ratio = pImg.naturalWidth / pImg.naturalHeight;
        const drawW = ratio >= 1 ? inner : inner * ratio;
        const drawH = ratio >= 1 ? inner / ratio : inner;
        ctx.drawImage(pImg, pX + 4 + (inner - drawW) / 2, pY + 4 + (inner - drawH) / 2, drawW, drawH);
      }

      ctx.fillStyle = "#facc15";
      ctx.font = portraitMode ? "900 16px 'Segoe UI', sans-serif" : "900 19px 'Segoe UI', sans-serif";
      ctx.textAlign = portraitMode ? "center" : "left";
      ctx.fillText(this.dialogue.speaker, portraitMode ? V_WIDTH / 2 : boxX + pSize + 48, portraitMode ? boxY + 124 : boxY + 38);

      const fullText = this.dialogue.lines[this.dialogue.currentLine] || "";
      const visibleText = fullText.substring(0, this.dialogue.charIndex);

      ctx.fillStyle = "#f8fafc";
      ctx.font = portraitMode ? "500 15px 'Segoe UI', sans-serif" : "500 18px 'Segoe UI', sans-serif";
      ctx.textAlign = "left";

      const textX = portraitMode ? boxX + 20 : boxX + pSize + 48;
      const maxTextW = portraitMode ? boxW - 40 : boxW - pSize - 80;
      const words = visibleText.split(" ");
      let currentLine = "";
      let lineY = portraitMode ? boxY + 150 : boxY + 74;

      for (const word of words) {
        const testLine = currentLine ? currentLine + " " + word : word;
        if (ctx.measureText(testLine).width > maxTextW) {
          ctx.fillText(currentLine, textX, lineY);
          currentLine = word;
          lineY += 27;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        ctx.fillText(currentLine, textX, lineY);
      }

      if (this.dialogue.charIndex >= fullText.length) {
        const blink = Math.floor(performance.now() * 0.005) % 2 === 0;
        if (blink) {
          ctx.fillStyle = "#f5b700";
          ctx.font = portraitMode ? "900 12px monospace" : "900 14px monospace";
          ctx.textAlign = portraitMode ? "center" : "left";
          ctx.fillText("▼ [TOQUE OU APERTE ESPAÇO/E]", portraitMode ? V_WIDTH / 2 : boxX + boxW - 250, boxY + boxH - 16);
        }
      }
      ctx.textAlign = "left";
    }

    renderVictoryOverlay() {
      ctx.fillStyle = "rgba(10, 15, 30, 0.88)";
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

      ctx.fillStyle = "#facc15";
      ctx.font = "900 42px 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("★ PARNAMIRIM TRANSFORMADA! ★", V_WIDTH / 2, 220);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px 'Segoe UI', sans-serif";
      ctx.fillText("Todas as Grandes Obras e Ações Entregues com Sucesso!", V_WIDTH / 2, 270);

      ctx.fillStyle = "#38bdf8";
      ctx.font = "900 24px monospace";
      ctx.fillText(`PONTUAÇÃO FINAL: ${this.score} PONTOS`, V_WIDTH / 2, 340);
      ctx.fillText(`MOEDAS COLETADAS: ${this.coins}`, V_WIDTH / 2, 380);

      ctx.fillStyle = "#10b981";
      ctx.font = "bold 18px monospace";
      ctx.fillText("✔ Cartão Educa • Drenagens • Insalubridade Garis • Climatização • 100% LED", V_WIDTH / 2, 430);

      const blink = Math.floor(performance.now() * 0.004) % 2 === 0;
      if (blink) {
        ctx.fillStyle = "#facc15";
        ctx.font = "900 22px 'Segoe UI', sans-serif";
        ctx.fillText("PRESSIONE ESPAÇO OU TOQUE PARA JOGAR NOVAMENTE", V_WIDTH / 2, 530);
      }
      ctx.textAlign = "left";
    }

    renderTitleScreen() {
      const portraitMode = window.innerHeight > window.innerWidth;
      const bg = images.bg_panorama;
      if (bg && bg.complete && bg.naturalWidth > 0) {
        ctx.drawImage(bg, 0, 0, V_WIDTH, V_HEIGHT);
      }

      ctx.fillStyle = "rgba(10, 15, 30, 0.78)";
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

      const logo = images.ui_logo;
      if (logo && logo.complete && logo.naturalWidth > 0) {
        const logoW = portraitMode ? 430 : 640;
        const logoH = portraitMode ? 135 : 200;
        const logoY = portraitMode ? 28 : 80;
        ctx.drawImage(logo, (V_WIDTH - logoW) / 2, logoY, logoW, logoH);
      } else {
        ctx.fillStyle = "#facc15";
        ctx.font = "900 52px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("GAME NILDA", V_WIDTH / 2, 170);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 24px monospace";
        ctx.fillText("AS OBRAS DE PARNAMIRIM • SNES 16-BIT", V_WIDTH / 2, 220);
        ctx.textAlign = "left";
      }

      const panelW = portraitMode ? 410 : 760;
      const panelH = portraitMode ? 304 : 250;
      const panelY = portraitMode ? 190 : 310;
      const pX = (V_WIDTH - panelW) / 2;
      ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
      ctx.fillRect(pX, panelY, panelW, panelH);
      ctx.strokeStyle = "#f5b700";
      ctx.lineWidth = 3;
      ctx.strokeRect(pX, panelY, panelW, panelH);

      ctx.fillStyle = "#facc15";
      ctx.font = portraitMode ? "900 18px 'Segoe UI', sans-serif" : "900 20px 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(portraitMode ? "MISSÃO PARNAMIRIM 16-BIT" : "AVENTURA 16-BIT: OBRAS, ROTAS E CIDADANIA", V_WIDTH / 2, panelY + 34);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = portraitMode ? "500 15px 'Segoe UI', sans-serif" : "500 16px 'Segoe UI', sans-serif";
      if (portraitMode) {
        ctx.fillText("• Explore as obras de Parnamirim", V_WIDTH / 2, panelY + 76);
        ctx.fillText("• Converse com os cidadãos", V_WIDTH / 2, panelY + 103);
        ctx.fillText("• Pule, colete e ative as drenagens", V_WIDTH / 2, panelY + 130);
      } else {
        ctx.fillText("• Explore plataformas baixas e altas em sacadas, pontes e mirantes", V_WIDTH / 2, 380);
        ctx.fillText("• Aproxime-se e aperte FALAR para conversar com os cidadãos", V_WIDTH / 2, 408);
        ctx.fillText("• Acerte os blocos para moedas e estrelas e quebre os tijolos", V_WIDTH / 2, 436);
        ctx.fillText("• Ative as bombas de macrodrenagem para escoar os alagamentos", V_WIDTH / 2, 464);
      }

      ctx.fillStyle = "#38bdf8";
      ctx.font = portraitMode ? "bold 14px monospace" : "bold 16px monospace";
      const controlText = portraitMode ? "TOQUE OU APERTE ESPAÇO PARA JOGAR" : "PC: Setas / A-D (Andar) | Espaço (Pulo) | E (Falar) • Celular: Controles Touch na Tela";
      drawFittedText(ctx, controlText, V_WIDTH / 2, portraitMode ? panelY + 176 : 510, panelW - 28, portraitMode ? 14 : 16, "monospace");

      const blink = Math.floor(performance.now() * 0.004) % 2 === 0;
      if (blink) {
        ctx.fillStyle = "#facc15";
        ctx.font = portraitMode ? "900 18px 'Segoe UI', sans-serif" : "900 24px 'Segoe UI', sans-serif";
        ctx.fillText(portraitMode ? "▶ INICIAR ◀" : "▶ TOQUE NA TELA OU APERTE ESPAÇO PARA JOGAR ◀", V_WIDTH / 2, portraitMode ? panelY + 242 : 615);
      }
      ctx.textAlign = "left";
    }

    loop(timestamp) {
      const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
      this.lastTime = timestamp;

      this.update(dt);
      this.render();

      requestAnimationFrame((t) => this.loop(t));
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    loadAssets(() => {
      const loading = document.getElementById("loadingScreen");
      if (loading) loading.style.display = "none";
      const game = new GameNilda();
      window.game = game;
      requestAnimationFrame((t) => game.loop(t));
    });
  });
})();
