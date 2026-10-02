# C3 Hulks (Battle Hulks PT-BR) — instruções para o Claude Code

Responda sempre em português do Brasil. O dono do projeto é o Felipe (GitHub: fozzimus).
Seja honesto sobre limitações técnicas: avise quando algo não puder ser feito, sugira
alternativas e deixe o Felipe escolher o caminho.

## O que é este projeto

O projeto se chama **C3 Hulks**; "Battle Hulks · PT-BR" aparece como subtítulo para deixar claro
de que jogo se trata. App web (PWA) para consultar as fichas de unidades do jogo Battle Hulks em
português, montar listas de combate com soma de pontos, acompanhar o dano numa partida, compartilhar
a lista e imprimir as fichas. Repositório `fozzimus/c3-hulks`, publicado no GitHub Pages:
https://fozzimus.github.io/c3-hulks/

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
Tudo vem pronto de um JSON (`privado/battlehulks-dados-v4.json`, o nome pode mudar a cada
versão) gerado no chat do projeto no claude.ai a partir da planilha. A pasta `privado/`
não vai para o git.

- `UNITS`: `{n, tipo, classe, pts, def:[v,a,r], atk:[v,a,r], mov:[v,a,r], fuel, heat, arm, str, special, ficha,
  str_amarelo, str_verde}`. Os trios `[v,a,r]` seguem o estado da Estrutura: Verde / Amarelo / Vermelho.
  Na ficha, `atk` aparece como "Corpo a Corpo" (Ataque Corpo a Corpo).
  - Cor da Estrutura com `s` pontos restantes: Verde se `s >= str_verde`; Amarelo se `s >= str_amarelo`;
    senão Vermelho (função `strColor`). Os limites variam por unidade (Thunder Crusader e Storm Guardian
    têm Estrutura 10, mas trocam de cor em pontos diferentes). **Nunca calcule a cor por proporção.**
  - Os limites vêm da planilha (aba Unidades, colunas "Estrutura: Amarelo a partir de" e
    "Estrutura: Verde a partir de") e **precisam ser preenchidos a cada unidade nova**.
- `WEAPONS`: `{u, cat, n, en, tipo, range, dmg, obs, lembretes, usos, pontos}`, onde `u` é exatamente o `n` da unidade.
  `dmg` é mostrado como "Dados de Ataque" (categoria "Melhoria" mostra "Valor").
  `lembretes` é a lista de IDs de `RULES` que viram chips tocáveis abaixo da arma.
  `usos` (número ou `null`): Foguetes = total de foguetes; Mísseis e AHM = total de ataques na partida.
  `pontos` só existe nas Melhorias (blindagens que já vêm na carta, valor 2); não é usado na aba Batalha.
- `RULES`: `{id, bloco, termo, aliases, texto, ref, formato}`. `bloco` agrupa a aba Regras
  (A a D, na ordem do JSON). `aliases` são sinônimos separados por `;`, usados na busca.
  `formato`: `texto` (parágrafo), `etapas` (uma linha por item, separada por `\n`; "Rótulo:" no
  começo da linha vira negrito) ou `tabela` (linhas "valor · efeito"). `ref` numérica aparece como
  "Manual §X"; não numérica aparece como está; "—" não aparece.
- `CAMPOS`: liga o campo da ficha ao ID do lembrete (`pts, classe, def, atk, mov, fuel, heat, arm, str`,
  mais `cores` para a legenda Verde/Amarelo/Vermelho e `hovering` para a habilidade especial).

Para atualizar: substitua `UNITS`, `WEAPONS`, `RULES` e `CAMPOS` pelo conteúdo de `unidades`, `armas`,
`regras` e `campos_da_ficha` do JSON novo (um objeto por linha, como já está no arquivo). Não altere nomes, valores nem textos sem perguntar ao Felipe.
Confira que `u` de cada arma bate com o nome de uma unidade, que a ordem das fichas se mantém
(Hulk #01, #02... e depois Tank #01, #02...) e que todo ID usado em `lembretes` e `CAMPOS` existe em `RULES`.
A lista de combate salva no aparelho usa o nome da unidade, então renomear uma unidade apaga essa linha da lista
(e o dano dela na aba Batalha).

## Abas do app

Ordem: Fichas · Lista · Batalha · Regras.

### Batalha (rastreador de partida)

- **Instâncias:** uma por cópia da Lista de Combate atual. "2x Chimera Mk.I" vira "Chimera Mk.I #1" e "#2";
  quantidade 1 não leva número. A chave interna é `Nome#n` (sempre com número).
  Quando a lista muda (`syncBattle`), as instâncias que continuam mantêm o estado, as novas começam
  zeradas e as removidas são descartadas.
- **Estado salvo** no `localStorage`, chave `battlehulks_batalha_v1`, com try/catch:
  `{ "Nome#n": { arm, str, usos: { índiceDaArma: restante } } }`. O índice é a posição da arma em
  `weaponsFor(nome)`; a contagem é por arma, não por tipo (o Void Knight tem dois lançadores de foguetes).
- **Tela de lista:** um card por instância com Blindagem, Estrutura e a cor atual. Estrutura 0 = card
  acinzentado com "Destruída", ainda tocável. "Nova Batalha" pede confirmação e zera dano e usos de
  todas as instâncias, sem mexer na Lista.
- **Tela de detalhe:** abre com `history.pushState`, para o Voltar do Android voltar à lista (`popstate`).
  Defesa, Corpo a Corpo, Movimento e os Dados de Ataque das armas mostram os três valores com o da cor
  atual em destaque. Se `dmg` não tiver três partes separadas por " / " (AHM, Melhorias), aparece como está.
- **Trilhas** de 0 até o máximo, imitando a carta. **O número tocado é o valor que sobrou:** as células acima
  ficam riscadas (X) e a do valor atual fica destacada; tocar num número mais alto desfaz.
  Botões −1/+1 ao lado. Até 7 células numa linha; trilhas maiores quebram em duas linhas (alvo ≥ 40px).
  O app não passa dano de uma trilha para a outra: cada trilha é marcada à mão.
- **Blindagens especiais (Ablativa, Reativa) NÃO são rastreadas**, nem as que vêm na carta nem as compradas:
  ficam com tokens físicos na mesa, visíveis para o oponente. No detalhe, aparecem só como informação
  (nome e valor, tocável para o lembrete). Decisão do Felipe; não acrescentar trilha sem perguntar.
- **Usos por partida:** contador "Usos: x/máx" com − e + em cada arma que tem `usos`.

### Compartilhar e imprimir

- **Compartilhar** (aba Lista): `navigator.share({title, text})` com o mesmo texto de "Exportar como texto";
  sem `navigator.share`, copia para a área de transferência e mostra "Lista copiada". Só a lista, sem dano.
- **Imprimir / Salvar como PDF:** `window.print()` com `@media print`, sem bibliotecas. "Imprimir ficha"
  em cada ficha e "Imprimir fichas da lista" (uma ficha por instância) na aba Lista. O conteúdo vai para
  `#printArea` e a classe `printing` no `body` esconde o resto só na impressão; ela sai no próximo toque.
  O impresso é sempre claro e traz cabeçalho "C3 Hulks · Battle Hulks PT-BR", trilhas em branco com as
  cores da Estrutura, quadradinhos de usos e a linha de créditos.

### Chaves do localStorage

`battlehulks_forcelist_v1` (lista), `battlehulks_limit_v1` (limite de pontos) e `battlehulks_batalha_v1`
(batalha). **Não renomeie**: isso apagaria as listas e o dano salvos nos aparelhos.

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
