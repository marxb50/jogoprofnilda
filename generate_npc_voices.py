"""Gera as locuções neurais dos NPCs do Game Nilda.

Requer: pip install edge-tts
Executar: python generate_npc_voices.py

A Prefeita Professora Nilda foi deixada propositalmente fora desta lista.
"""

from __future__ import annotations

import asyncio
import json
from pathlib import Path

import edge_tts


OUTPUT_DIR = Path(__file__).parent / "assets" / "audio" / "npc_voices"


NPCS = [
    {
        "id": "seu_francisco",
        "portraitKey": "portrait_pai_aluno",
        "character": "Seu Francisco",
        "voice": "pt-BR-AntonioNeural",
        "rate": "-5%",
        "pitch": "-2Hz",
        "lines": [
            "Olá, Prefeita Professora Nilda! Que alegria encontrar a senhora aqui no colégio!",
            "O Cartão Educa Parnamirim foi uma bênção para a nossa família! Recebemos o auxílio de quatro vírgula oito milhões de reais, distribuído para mais de vinte e quatro mil alunos.",
            "Compramos todo o material escolar novinho nas papelarias da cidade. Parnamirim valoriza a educação das nossas crianças!",
        ],
    },
    {
        "id": "dona_socorro",
        "portraitKey": "portrait_moradora",
        "character": "Dona Socorro",
        "voice": "pt-BR-FranciscaNeural",
        "rate": "-12%",
        "pitch": "-8Hz",
        "lines": [
            "Prefeita Nilda, moro há mais de trinta anos em Monte Castelo e sempre sofremos com alagamentos que invadiam nossas casas nas chuvas.",
            "Ver essas manilhas gigantes de macrodrenagem e a nova pavimentação sendo instaladas traz uma tranquilidade que nunca tivemos!",
            "Muito obrigada por olhar com tanto carinho para o nosso bairro!",
        ],
    },
    {
        "id": "maria_gari",
        "portraitKey": "portrait_gari",
        "character": "Maria da Limpeza",
        "voice": "pt-BR-ThalitaMultilingualNeural",
        "rate": "+4%",
        "pitch": "+3Hz",
        "lines": [
            "Prefeita Nilda, toda a equipe dos garis agradece de coração!",
            "Dobrar nosso adicional de insalubridade para chegar ao percentual máximo foi uma conquista histórica que esperávamos há anos.",
            "Com o programa Parnamirim Cidade Limpa, estamos mantendo cada bairro limpo, podado e com muito orgulho!",
        ],
    },
    {
        "id": "professora_claudia",
        "portraitKey": "portrait_professora",
        "character": "Professora Cláudia",
        "voice": "en-US-EmmaMultilingualNeural",
        "rate": "-2%",
        "pitch": "+1Hz",
        "lines": [
            "Colega e Prefeita Professora Nilda, ter uma educadora na gestão transforma o nosso município!",
            "O reajuste de cinco vírgula quatro por cento, sancionado para o magistério, e a convocação dos novos professores mostram respeito real pela sala de aula.",
            "Nossas escolas estão revigoradas e as bibliotecas ganharam vida nova!",
        ],
    },
    {
        "id": "dr_marcelo",
        "portraitKey": "portrait_medico",
        "character": "Doutor Marcelo",
        "voice": "en-US-AndrewMultilingualNeural",
        "rate": "-4%",
        "pitch": "-3Hz",
        "lines": [
            "Prefeita, o mutirão Fila Zero para exames e cirurgias eletivas já reduziu o tempo de espera de milhares de famílias em Parnamirim.",
            "As Unidades Básicas de Saúde estão com abastecimento contínuo de medicamentos essenciais e médicos especialistas no plantão.",
            "Saúde humanizada e de qualidade para toda a nossa gente!",
        ],
    },
    {
        "id": "sofia",
        "portraitKey": "portrait_aluna",
        "character": "Sofia",
        "voice": "en-US-AvaMultilingualNeural",
        "rate": "+10%",
        "pitch": "+12Hz",
        "lines": [
            "Tia Nilda! Minha mochila nova é linda e meu kit de fardamento veio completinho com tênis confortável!",
            "Agora todo mundo na minha turma tem cadernos novos, lápis de cor e uniforme padronizado.",
            "Dá muito orgulho ir para a escola municipal de Parnamirim!",
        ],
    },
    {
        "id": "engenheiro_roberto",
        "portraitKey": "portrait_engenheiro",
        "character": "Engenheiro Roberto",
        "voice": "en-US-BrianMultilingualNeural",
        "rate": "-5%",
        "pitch": "-4Hz",
        "lines": [
            "Prefeita Nilda, o projeto estrutural de drenagem da Olavo Montenegro está avançando em ritmo acelerado!",
            "Implantamos tubulação de grande diâmetro com tecnologia de escoamento rápido para acabar em definitivo com os alagamentos naquela avenida vital.",
            "A engenharia de Parnamirim está trabalhando com alto rigor técnico e agilidade!",
        ],
    },
    {
        "id": "dona_lucia",
        "portraitKey": "portrait_mae_cmei",
        "character": "Dona Lúcia",
        "voice": "de-DE-SeraphinaMultilingualNeural",
        "rate": "-6%",
        "pitch": "-2Hz",
        "lines": [
            "Prefeita Nilda, meu filho estuda no C M E I e o calor antigamente incomodava muito os bebês na hora da soneca.",
            "Com as salas todas climatizadas com ar-condicionado novinho, as crianças aprendem felizes e bem cuidadas.",
            "Uma creche climatizada faz toda a diferença para as mães trabalhadoras!",
        ],
    },
    {
        "id": "inspetor_santos",
        "portraitKey": "portrait_guarda",
        "character": "Inspetor Santos",
        "voice": "en-AU-WilliamMultilingualNeural",
        "rate": "-3%",
        "pitch": "-5Hz",
        "lines": [
            "Boa noite, Prefeita! A modernização para luminárias cem por cento em LED, de alta potência, mudou o patrulhamento preventivo em Parnamirim.",
            "Ruas bem iluminadas reduzem a criminalidade e aumentam a sensação de segurança para quem volta do trabalho ou da faculdade à noite.",
            "A Guarda Municipal opera vinte e quatro horas ao lado da comunidade!",
        ],
    },
    {
        "id": "seu_pedro",
        "portraitKey": "portrait_comerciante",
        "character": "Seu Pedro",
        "voice": "de-DE-FlorianMultilingualNeural",
        "rate": "-8%",
        "pitch": "-6Hz",
        "lines": [
            "Prefeita Nilda, nossas ruas centrais e avenidas de acesso ganharam asfalto liso de alta durabilidade!",
            "O trânsito flui melhor, as calçadas estão acessíveis e o comércio local registrou aumento nas vendas.",
            "Parnamirim está com cara de cidade moderna e próspera!",
        ],
    },
    {
        "id": "cajulim",
        "portraitKey": "portrait_cajulim",
        "character": "Cajulim",
        "voice": "fr-FR-RemyMultilingualNeural",
        "rate": "+9%",
        "pitch": "+10Hz",
        "lines": [
            "Êpa, Prefeita Nilda! É o Cajulim por aqui! Que alegria ver Parnamirim tão bem cuidada e limpa!",
            "Com coleta seletiva, descarte consciente e obras em todos os bairros, nossa cidade é referência para todo o Rio Grande do Norte!",
            "Vamos juntos continuar transformando a vida das famílias potiguares!",
        ],
    },
]


async def generate_line(npc: dict, line_index: int, text: str, semaphore: asyncio.Semaphore) -> dict:
    filename = f"{npc['id']}_{line_index + 1:02d}.mp3"
    output_path = OUTPUT_DIR / filename
    async with semaphore:
        communicator = edge_tts.Communicate(
            text=text,
            voice=npc["voice"],
            rate=npc["rate"],
            pitch=npc["pitch"],
            volume="+0%",
        )
        await communicator.save(str(output_path))
    if output_path.stat().st_size < 1024:
        raise RuntimeError(f"Áudio inválido ou vazio: {output_path}")
    return {
        "file": filename,
        "bytes": output_path.stat().st_size,
        "text": text,
    }


async def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    semaphore = asyncio.Semaphore(4)
    tasks = []
    task_metadata = []

    for npc in NPCS:
        for line_index, line in enumerate(npc["lines"]):
            tasks.append(generate_line(npc, line_index, line, semaphore))
            task_metadata.append((npc, line_index))

    generated = await asyncio.gather(*tasks)
    manifest_characters: dict[str, dict] = {}
    total_bytes = 0

    for (npc, _line_index), generated_line in zip(task_metadata, generated):
        total_bytes += generated_line["bytes"]
        character = manifest_characters.setdefault(
            npc["portraitKey"],
            {
                "character": npc["character"],
                "voice": npc["voice"],
                "rate": npc["rate"],
                "pitch": npc["pitch"],
                "lines": [],
            },
        )
        character["lines"].append(generated_line)

    manifest = {
        "notice": "Vozes sintéticas geradas por IA. Prefeita Professora Nilda permanece sem locução.",
        "provider": "Microsoft Edge Neural TTS",
        "characters": manifest_characters,
        "totalFiles": len(generated),
        "totalBytes": total_bytes,
    }
    (OUTPUT_DIR / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Gerados {len(generated)} arquivos para {len(NPCS)} NPCs ({total_bytes / 1024 / 1024:.2f} MiB).")


if __name__ == "__main__":
    asyncio.run(main())
