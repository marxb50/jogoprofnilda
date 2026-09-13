/**
 * GAME NILDA - SISTEMA DE ÁUDIO CHIPTUNE SNES 16-BIT
 * Sintetizador nativo via Web Audio API
 */

class SoundManager {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.bgmPlaying = false;
        this.bgmTimer = null;
        this.dialogueAudio = null;
        this.dialogueAudioToken = 0;
        this.dialogueVoicePaths = {
            portrait_pai_aluno: [
                "assets/audio/npc_voices/seu_francisco_01.mp3",
                "assets/audio/npc_voices/seu_francisco_02.mp3",
                "assets/audio/npc_voices/seu_francisco_03.mp3"
            ],
            portrait_moradora: [
                "assets/audio/npc_voices/dona_socorro_01.mp3",
                "assets/audio/npc_voices/dona_socorro_02.mp3",
                "assets/audio/npc_voices/dona_socorro_03.mp3"
            ],
            portrait_gari: [
                "assets/audio/npc_voices/maria_gari_01.mp3",
                "assets/audio/npc_voices/maria_gari_02.mp3",
                "assets/audio/npc_voices/maria_gari_03.mp3"
            ],
            portrait_professora: [
                "assets/audio/npc_voices/professora_claudia_01.mp3",
                "assets/audio/npc_voices/professora_claudia_02.mp3",
                "assets/audio/npc_voices/professora_claudia_03.mp3"
            ],
            portrait_medico: [
                "assets/audio/npc_voices/dr_marcelo_01.mp3",
                "assets/audio/npc_voices/dr_marcelo_02.mp3",
                "assets/audio/npc_voices/dr_marcelo_03.mp3"
            ],
            portrait_aluna: [
                "assets/audio/npc_voices/sofia_01.mp3",
                "assets/audio/npc_voices/sofia_02.mp3",
                "assets/audio/npc_voices/sofia_03.mp3"
            ],
            portrait_engenheiro: [
                "assets/audio/npc_voices/engenheiro_roberto_01.mp3",
                "assets/audio/npc_voices/engenheiro_roberto_02.mp3",
                "assets/audio/npc_voices/engenheiro_roberto_03.mp3"
            ],
            portrait_mae_cmei: [
                "assets/audio/npc_voices/dona_lucia_01.mp3",
                "assets/audio/npc_voices/dona_lucia_02.mp3",
                "assets/audio/npc_voices/dona_lucia_03.mp3"
            ],
            portrait_guarda: [
                "assets/audio/npc_voices/inspetor_santos_01.mp3",
                "assets/audio/npc_voices/inspetor_santos_02.mp3",
                "assets/audio/npc_voices/inspetor_santos_03.mp3"
            ],
            portrait_comerciante: [
                "assets/audio/npc_voices/seu_pedro_01.mp3",
                "assets/audio/npc_voices/seu_pedro_02.mp3",
                "assets/audio/npc_voices/seu_pedro_03.mp3"
            ],
            portrait_cajulim: [
                "assets/audio/npc_voices/cajulim_01.mp3",
                "assets/audio/npc_voices/cajulim_02.mp3",
                "assets/audio/npc_voices/cajulim_03.mp3"
            ]
        };
        this.stepTimer = 0;
        this.tempo = 126; // BPM estilo SNES Platformer
        this.notes = [
            261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, // C4-C5
            587.33, 659.25, 698.46, 783.99, 880.00                           // D5-A5
        ];
        
        // Recupera preferência salva
        try {
            this.muted = localStorage.getItem('game_nilda_muted') === 'true';
        } catch (_) {}
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        try {
            localStorage.setItem('game_nilda_muted', this.muted);
        } catch (_) {}
        
        const btn = document.getElementById('btnSound');
        if (btn) {
            btn.innerHTML = this.muted ? '🔇 Som: OFF (M)' : '🔊 Som: ON (M)';
        }
        if (this.muted) {
            this.stopDialogueVoice();
            this.stopBgm();
        } else if (window.game && window.game.dialogue && window.game.dialogue.active) {
            const dialogue = window.game.dialogue;
            this.playDialogueLine(dialogue.portraitKey, dialogue.currentLine);
        } else {
            this.startBgm();
        }
        return this.muted;
    }

    hasDialogueVoice(portraitKey, lineIndex) {
        const lines = this.dialogueVoicePaths[portraitKey];
        return Boolean(lines && lines[lineIndex]);
    }

    playDialogueLine(portraitKey, lineIndex) {
        this.stopDialogueVoice();
        if (this.muted || !this.hasDialogueVoice(portraitKey, lineIndex)) return false;

        const token = ++this.dialogueAudioToken;
        const audio = new Audio(this.dialogueVoicePaths[portraitKey][lineIndex]);
        audio.preload = "auto";
        audio.volume = 0.95;
        this.dialogueAudio = audio;

        const release = () => {
            if (this.dialogueAudioToken === token) this.dialogueAudio = null;
        };
        audio.addEventListener("ended", release, { once: true });
        audio.addEventListener("error", release, { once: true });
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(release);
        }
        return true;
    }

    stopDialogueVoice() {
        this.dialogueAudioToken++;
        if (!this.dialogueAudio) return;
        try {
            this.dialogueAudio.pause();
            this.dialogueAudio.currentTime = 0;
        } catch (_) {}
        this.dialogueAudio = null;
    }

    // Pulo clássico SNES (Sweep ascendente de onda quadrada)
    playJump() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(150, t);
            osc.frequency.exponentialRampToValueAtTime(520, t + 0.16);

            gain.gain.setValueAtTime(0.06, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.17);
        } catch (_) {}
    }

    // Coleta de itens (Arpeggio brilhante de triângulo/seno)
    playCollect() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const chord = [523.25, 659.25, 783.99, 1046.50]; // C E G C
            chord.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const noteTime = t + i * 0.05;

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, noteTime);

                gain.gain.setValueAtTime(0.07, noteTime);
                gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.12);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(noteTime);
                osc.stop(noteTime + 0.13);
            });
        } catch (_) {}
    }

    // Ordem de Serviço assinada (Jingle de aprovação SNES)
    playBlueprint() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const notes = [440, 554.37, 659.25, 880]; // A C# E A
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const startTime = t + idx * 0.07;

                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, startTime);

                gain.gain.setValueAtTime(0.08, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 0.2);
            });
        } catch (_) {}
    }

    // Drenagem ativada (Som de água escoando pelas galerias de Monte Castelo)
    playDrain() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            // Ruído filtrado simulando fluxo d'água
            const bufferSize = this.ctx.sampleRate * 0.5;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(800, t);
            filter.frequency.exponentialRampToValueAtTime(320, t + 0.45);
            filter.Q.value = 3.0;

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.09, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noise.start(t);
            noise.stop(t + 0.5);
        } catch (_) {}
    }

    // Texto de Diálogo (Blip sutil estilo Animal Crossing / SNES RPG)
    playBlip() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(460 + Math.random() * 80, t);

            gain.gain.setValueAtTime(0.04, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.05);
        } catch (_) {}
    }

    // Fanfarra de Inauguração e Vitória (Super Nintendo Brass Fanfare)
    playFanfare() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const seq = [
                { f: 523.25, d: 0.15, offset: 0.0 },   // C5
                { f: 523.25, d: 0.15, offset: 0.16 },  // C5
                { f: 523.25, d: 0.15, offset: 0.32 },  // C5
                { f: 659.25, d: 0.35, offset: 0.48 },  // E5
                { f: 587.33, d: 0.18, offset: 0.85 },  // D5
                { f: 659.25, d: 0.18, offset: 1.05 },  // E5
                { f: 783.99, d: 0.70, offset: 1.25 }   // G5
            ];

            seq.forEach(note => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const noteTime = t + note.offset;

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(note.f, noteTime);

                gain.gain.setValueAtTime(0.12, noteTime);
                gain.gain.exponentialRampToValueAtTime(0.001, noteTime + note.d);

                // filtro passa-baixa para dar calor de SNES
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(2200, noteTime);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(noteTime);
                osc.stop(noteTime + note.d + 0.02);
            });
        } catch (_) {}
    }

    // Batida de cabeça em bloco (Bump retrô SNES)
    playBump() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(260, t);
            osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);

            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.13);
        } catch (_) {}
    }

    // Quebra de bloco de tijolo (Quebra com 4 estilhaços estilo Mario)
    playBreak() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            // Ruído branco crocante
            const bufferSize = this.ctx.sampleRate * 0.18;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1400, t);
            filter.frequency.exponentialRampToValueAtTime(280, t + 0.16);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.14, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.17);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noise.start(t);
            noise.stop(t + 0.18);
        } catch (_) {}
    }

    // Moeda / Item saindo do bloco (? block)
    playCoin() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(987.77, t); // B5
            osc.frequency.setValueAtTime(1318.51, t + 0.08); // E6

            gain.gain.setValueAtTime(0.10, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.36);
        } catch (_) {}
    }

    // Trilha sonora BGM Chiptune SNES em Loop contínuo
    startBgm() {
        if (this.muted || this.bgmPlaying) return;
        this.init();
        if (!this.ctx) return;

        this.bgmPlaying = true;
        let step = 0;

        // Progressão melódica alegre potiguar (C - Am - F - G)
        const bassLine = [
            130.81, 130.81, 196.00, 130.81, // C
            110.00, 110.00, 164.81, 110.00, // A
            87.31,  87.31,  130.81, 87.31,  // F
            98.00,  98.00,  146.83, 98.00   // G
        ];

        const melodyLine = [
            523.25, 0, 659.25, 783.99, 1046.50, 783.99, 659.25, 0,
            440.00, 0, 523.25, 659.25, 880.00,  659.25, 523.25, 0,
            349.23, 0, 440.00, 523.25, 698.46,  523.25, 440.00, 0,
            392.00, 440.00, 493.88, 587.33, 783.99, 587.33, 493.88, 392.00
        ];

        const intervalMs = (60 / this.tempo / 2) * 1000;

        const playStep = () => {
            if (!this.bgmPlaying || this.muted) return;

            try {
                const t = this.ctx.currentTime;
                
                // Bass Note (Onda Triângulo profunda)
                const bassFreq = bassLine[step % bassLine.length];
                if (bassFreq > 0) {
                    const bOsc = this.ctx.createOscillator();
                    const bGain = this.ctx.createGain();
                    bOsc.type = 'triangle';
                    bOsc.frequency.setValueAtTime(bassFreq, t);
                    bGain.gain.setValueAtTime(0.08, t);
                    bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
                    bOsc.connect(bGain);
                    bGain.connect(this.ctx.destination);
                    bOsc.start(t);
                    bOsc.stop(t + 0.2);
                }

                // Melodia (Onda Quadrada com timbre 16-bit)
                const melFreq = melodyLine[step % melodyLine.length];
                if (melFreq > 0) {
                    const mOsc = this.ctx.createOscillator();
                    const mGain = this.ctx.createGain();
                    mOsc.type = 'square';
                    mOsc.frequency.setValueAtTime(melFreq, t);
                    mGain.gain.setValueAtTime(0.035, t);
                    mGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
                    mOsc.connect(mGain);
                    mGain.connect(this.ctx.destination);
                    mOsc.start(t);
                    mOsc.stop(t + 0.18);
                }

                step = (step + 1) % 32;
            } catch (_) {}

            this.bgmTimer = setTimeout(playStep, intervalMs);
        };

        playStep();
    }

    stopBgm() {
        this.bgmPlaying = false;
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }
}

window.soundManager = new SoundManager();
