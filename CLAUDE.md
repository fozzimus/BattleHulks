# Battle Hulks PT-BR — instruções para o Claude Code

Responda sempre em português do Brasil. O dono do projeto é o Felipe (GitHub: fozzimus).
Seja honesto sobre limitações técnicas: avise quando algo não puder ser feito, sugira
alternativas e deixe o Felipe escolher o caminho.

## O que é este projeto

App web (PWA) para consultar as fichas de unidades do jogo Battle Hulks em português
e montar listas de combate com soma de pontos. Publicado no GitHub Pages:
https://fozzimus.github.io/BattleHulks/

Este repositório é a **fonte oficial** do app. O trabalho de tradução (planilha de
unidades e manual de regras) é feito fora daqui, num projeto do claude.ai.

## Arquivos

- `index.html` — o app inteiro (HTML, CSS e JavaScript num único arquivo).
- `sw.js` — service worker: faz o app funcionar offline. Contém a versão do cache.
- `manifest.json` — permite instalar o app no celular.
- `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` — ícones de engrenagem.
- `README.md` e `LICENSE` — avisos de uso, créditos e licença.
- `privado/` — pasta local, ignorada pelo git, para planilha, manual e JSON de dados. **Nunca** commitar.

## Dados das unidades e lembretes de regras

Ficam embutidos no `index.html`, nas constantes `UNITS`, `WEAPONS`, `RULES` e `CAMPOS`.
Tudo vem pronto de um JSON (`privado/battlehulks-dados-v3.json`, o nome pode mudar a cada
versão) gerado no chat do projeto no claude.ai a partir da planilha. A pasta `privado/`
não vai para o git.

- `UNITS`: `{n, tipo, classe, pts, def:[v,a,r], atk:[v,a,r], mov:[v,a,r], fuel, heat, arm, str, special, ficha}`.
  Os trios `[v,a,r]` seguem o estado da Estrutura: Verde / Amarelo / Vermelho.
  Na ficha, `atk` aparece como "Corpo a Corpo" (Ataque Corpo a Corpo).
- `WEAPONS`: `{u, cat, n, en, tipo, range, dmg, obs, lembretes}`, onde `u` é exatamente o `n` da unidade.
  `dmg` é mostrado como "Dados de Ataque" (categoria "Melhoria" mostra "Valor").
  `lembretes` é a lista de IDs de `RULES` que viram chips tocáveis abaixo da arma.
- `RULES`: `{id, bloco, termo, aliases, texto, ref, formato}`. `bloco` agrupa a aba Regras
  (A a D, na ordem do JSON). `aliases` são sinônimos separados por `;`, usados na busca.
  `formato`: `texto` (parágrafo), `etapas` (uma linha por item, separada por `\n`; "Rótulo:" no
  começo da linha vira negrito) ou `tabela` (linhas "valor · efeito"). `ref` numérica aparece como
  "Manual §X"; não numérica aparece como está; "—" não aparece.
- `CAMPOS`: liga o campo da ficha ao ID do lembrete (`pts, classe, def, atk, mov, fuel, heat, arm, str`,
  mais `cores` para a legenda Verde/Amarelo/Vermelho e `hovering` para a habilidade especial).

Para atualizar: substitua `UNITS`, `WEAPONS`, `RULES` e `CAMPOS` pelo conteúdo de `unidades`, `armas`,
`regras` e `campos_da_ficha` do JSON novo. Não altere nomes, valores nem textos sem perguntar ao Felipe.
Confira que `u` de cada arma bate com o nome de uma unidade, que a ordem das fichas se mantém
(Hulk #01, #02... e depois Tank #01, #02...) e que todo ID usado em `lembretes` e `CAMPOS` existe em `RULES`.
A lista de combate salva no aparelho usa o nome da unidade, então renomear uma unidade apaga essa linha da lista.

## REGRA OBRIGATÓRIA: versão a cada alteração do app

Toda alteração em `index.html`, `manifest.json` ou nos ícones exige, no mesmo commit:

1. Aumentar a versão do cache em `sw.js` (`battlehulks-v3` → `battlehulks-v4` → ...).
2. Atualizar o rodapé do app no `index.html` com o mesmo número e a data:
   `vN · DD/MM/AAAA`. O número do rodapé e o do `sw.js` devem ser sempre iguais.
3. Se um arquivo novo precisar funcionar offline, incluí-lo na lista `FILES` do `sw.js`.

Alterações só no `README.md`, `LICENSE` ou `CLAUDE.md` NÃO mudam a versão.

## Permissão e licença

- O código é MIT. O conteúdo do jogo (nomes, estatísticas, armas, regras e traduções)
  NÃO é: pertence à Fat Dragon Games e é usado com permissão do criador, Tom Tullis,
  para uso pessoal e sem fins comerciais.
- A permissão cobre as fichas das unidades e referências rápidas de regras.
  Não adicione o manual completo nem outros materiais do jogo sem o Felipe confirmar.
- Mantenha os créditos do README e o escopo do LICENSE.

## Fluxo de trabalho

1. Antes de editar, rode `git pull` para pegar a versão mais recente.
2. Para testar, sirva a pasta localmente (`python -m http.server 8000`) e abra
   http://localhost:8000. Não é possível testar no Android a partir daqui.
3. Mostre um resumo do que mudou e peça confirmação ao Felipe antes do `git push`.
4. Use mensagens de commit curtas em português, por exemplo: `v2: rodapé com versão`.

## Ao terminar cada entrega, SEMPRE mostre este checklist ao Felipe

O Felipe pediu explicitamente para ser lembrado destes passos, porque vai esquecer.

- Versão publicada: `vN` (informar o número).
- Aguardar 1 ou 2 minutos para o GitHub Pages atualizar.
- Abrir o app no celular **com internet** e conferir se o rodapé mostra `vN`.
  Se não mostrar, fechar o app e abrir de novo.
- Testar offline: ativar o modo avião e abrir o app.
- Se a mudança veio de dados atualizados (planilha ou manual), conferir se a planilha
  no Google Drive foi atualizada com "Gerenciar versões" (para manter o mesmo link).
