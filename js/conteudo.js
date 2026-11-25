// conteudo.js — textos do painel: a análise de cada gráfico e as hipóteses.
//
// Só números agregados, conferidos com a saída dos scripts de scrapper/visualizar_*.py, de
// tcc/medicoes/ e com o texto do TCC (versão 6, 19/11/2026). Quando a base for regerada,
// confira e atualize os números daqui (a data fica em ATUALIZADO_EM). Os textos aceitam
// <strong> e <em>; o resto é texto simples.

export const ATUALIZADO_EM = '21/11/2026';

// Grupos da lista de gráficos, na ordem em que aparecem.
export const GRUPOS = [
  { id: 'caso', nome: 'Estudo de caso' },
  { id: 'trilha', nome: 'A esteira como trilha' },
  { id: 'programas', nome: 'Os programas' },
  { id: 'previsibilidade', nome: 'Previsibilidade' },
];

// status: 'revisado' (já segue a regra de 19/11: só a esteira) ou 'a-revisar'.
export const GRAFICOS = [
  {
    id: 'tecnova-iii',
    grupo: 'caso',
    titulo: 'Tecnova III: de onde vieram os projetos',
    pergunta: 'As empresas e os coordenadores dos 19 projetos do Tecnova III (edital 23/2024) tinham passado antes pela esteira?',
    status: 'revisado',
    versoes: [
      { id: 'esteira', rotulo: 'Só a esteira', arquivo: 'estudo_caso_tecnova_iii_esteira.png', arquivoNomes: 'estudo_caso_tecnova_iii_esteira_nomes.png' },
      { id: 'facepe', rotulo: 'Todos os editais da FACEPE', arquivo: 'estudo_caso_tecnova_iii_facepe.png', arquivoNomes: 'estudo_caso_tecnova_iii_facepe_nomes.png' },
    ],
    destaques: [
      { valor: '9 de 19', rotulo: 'projetos já tinham passado pela esteira' },
      { valor: '8 de 9', rotulo: 'desses projetos passaram pela Operação' },
      { valor: '9 de 11', rotulo: 'coordenadores com projeto anterior o fizeram pela mesma empresa' },
      { valor: '13 de 19', rotulo: 'contando programas de inovação fora da esteira' },
    ],
    analise: [
      'Metade dos projetos (<strong>9 de 19</strong>) chegou ao Tecnova III depois de passar pela esteira: em 7, a empresa e o coordenador; em 1, só a empresa; em 1, só o coordenador.',
      'A passagem foi quase sempre pela <strong>Operação</strong> (8 dos 9), sobretudo Pró-Startups Operação, Centelha e Desafios.Gov; o nono projeto vinha do próprio Tecnova (edital 24/2019). É o caminho Operação → Aceleração previsto no desenho da esteira: as marcas laranja à esquerda da coluna destacada.',
      'Empresa e coordenador costumam percorrer a trilha juntos: dos 11 coordenadores que já tinham coordenado outro projeto, 9 o fizeram pela mesma empresa do Tecnova III.',
      'A esteira não é o único caminho: <strong>10 projetos</strong> chegaram à Aceleração sem passagem registrada por ela, e 4 não têm nenhuma outra participação na FACEPE, antes ou depois.',
      'Na versão com todos os editais, os projetos 10 a 13 ganham passagens anteriores fora da esteira (COMPET AME, PAPPE, PEPE): com elas, são 13 de 19.',
      'Depois do Tecnova III, 6 projetos voltaram a ser apoiados, sobretudo no Global.PE (4).',
    ],
    comoLer: [
      'Cada linha é um projeto do Tecnova III; a numeração é a mesma nas duas versões.',
      'Cada coluna é um edital, em ordem cronológica; a coluna destacada é o próprio Tecnova III.',
      'Quadrado: a empresa executou um projeto no edital. Círculo cheio: o coordenador coordenou um projeto; vazado: recebeu uma bolsa.',
      'A cor é o estágio do programa; cinza, fora da esteira.',
    ],
    ressalvas: [
      'A empresa é identificada pela sigla da instituição executora no extrato (sem CNPJ) ou pela razão social publicada: uma empresa que mudou de nome fica sem ligação, e o resultado pela empresa é um limite inferior.',
      'O grafo só enxerga apoios da própria FACEPE.',
    ],
    fonte: { consultas: ['TrajetoriaTecnovaIII', 'PassagemAnteriorTecnovaIII'], script: 'visualizar_estudo_caso.py' },
    explorar: 'os projetos do Tecnova III passaram antes pela esteira?',
  },
  {
    id: 'movimentos',
    grupo: 'trilha',
    titulo: 'Movimentos entre os programas',
    pergunta: 'Depois de um programa da esteira, para qual programa as pessoas vão? Sobem de estágio, ficam no mesmo estágio ou voltam?',
    status: 'revisado',
    versoes: [
      { id: 'mapa', rotulo: 'Fluxos de 3 ou mais pessoas', arquivo: 'movimentos_esteira.png' },
      {
        id: 'matriz', rotulo: 'Todos os fluxos (matriz)', arquivo: 'movimentos_esteira_matriz.png',
        comoLer: [
          'Cada linha é o programa de onde a pessoa saiu; cada coluna, o programa seguinte em que ela foi apoiada. O número é quantas pessoas fizeram essa mudança.',
          'As linhas escuras separam os estágios. Nos blocos da diagonal, a pessoa ficou no mesmo estágio; acima deles, subiu; abaixo, voltou.',
          'Em negrito, os fluxos de 3 ou mais pessoas, os que aparecem no mapa. À direita, o total que saiu de cada programa; no alto, o que chegou.',
        ],
      },
    ],
    destaques: [
      { valor: '131', rotulo: 'mudanças de um programa para o seguinte (sem as idas e vindas das escolas)' },
      { valor: '44 · 63 · 24', rotulo: 'subiram de estágio · ficaram no mesmo estágio · voltaram' },
      { valor: '17 de 63', rotulo: 'pares de programas com 3 ou mais pessoas (os do mapa); os outros 46 só aparecem na matriz' },
      { valor: '8 de 18', rotulo: 'programas sem nenhum fluxo de 3 ou mais pessoas' },
    ],
    analise: [
      'Ordenando no tempo os programas da esteira em que cada pessoa coordenou projeto ou recebeu bolsa, houve <strong>131 mudanças</strong> de um programa para o seguinte: 44 subiram de estágio, <strong>63 ficaram no mesmo estágio</strong> e 24 voltaram. O movimento lateral é o mais comum.',
      'Os fluxos mais frequentes ficam dentro da Operação: do Pró-Startups Operação para o COMPET Soluções (7), entre o Centelha e o Pró-Startups Operação (7 e 6) e do COMPET Soluções para o Desafios.Gov (6). A subida mais frequente é do <strong>Desafios.Gov para o Global.PE e para o Inovação Aberta</strong> (6 cada).',
      'A matriz mostra também os 46 pares com 1 ou 2 pessoas (57 mudanças). Duas coisas aparecem só nela. O <strong>Pró-Startups Operação</strong> é o programa de onde mais gente sai (26 pessoas, para 10 programas diferentes), quase sempre para o lado ou de volta (só 4 sobem). O <strong>Desafios.Gov</strong> é a principal porta para a Aceleração: 16 das suas 17 saídas sobem de estágio, metade das 32 subidas da Operação para a Aceleração.',
      'As voltas mais frequentes têm um padrão: 4 pessoas que passaram pelo Tecnova depois coordenaram projeto no Desafios.Gov (desafios de órgãos públicos); 3 coordenadores do Pró-Startups Operação depois receberam bolsa da Jornada REPE (empreendedorismo inovador nas ICTs); e outros 3 depois participaram do COMPET Superior (extensão tecnológica de universitários). Parecem menos um retrocesso do que o uso de programas com outra finalidade, leitura a confirmar com a SECTI-PE/FACEPE.',
      'Oito programas não têm nenhum fluxo de 3 ou mais pessoas: na Ideação, as duas escolas, a Residência Tecnológica e o PIBITI-PE; três programas com um só edital, recente (Pró-Startups Mulheres que Inovam, Transforma PE e COMPET Mulheres); e o COMPET Tração, sem edital na base.',
    ],
    comoLer: [
      'Cada caixa é um programa, na coluna do seu estágio; os esmaecidos não têm fluxo de 3 ou mais pessoas.',
      'Cada seta liga um programa ao seguinte em que a mesma pessoa foi apoiada; a espessura e o número indicam quantas pessoas.',
      'Preto: subiu de estágio. Cinza: ficou no mesmo estágio. Roxo tracejado: voltou a um estágio anterior.',
    ],
    ressalvas: [
      'Mudança de programa: o programa seguinte da pessoa, na ordem do tempo (data de referência dos processos). Só pessoas, não empresas.',
      'As 61 idas e vindas de professores entre o COMPET Médio-Tec e o Espaço CRIA não contam: os dois atendem escolas.',
      'A leitura das voltas como uso de programas com outra finalidade ainda precisa ser confirmada com a SECTI-PE/FACEPE.',
      'Quando dois processos da mesma pessoa têm a mesma data em programas diferentes (11 pessoas), vem antes o edital mais antigo, cuja seleção foi feita primeiro.',
    ],
    fonte: { consultas: ['ParticipacoesNaEsteira'], script: 'figura_esteira.py' },
    explorar: 'quem passou da Operação para a Aceleração?',
  },
  {
    id: 'continuidade',
    grupo: 'trilha',
    titulo: 'Continuidade depois de cada programa',
    pergunta: 'Depois de entrar num programa, a pessoa ou a empresa voltou a ser apoiada em outro programa da esteira? Subiu de estágio?',
    status: 'revisado',
    versoes: [{ id: 'unica', rotulo: 'Só a esteira', arquivo: 'continuidade_esteira.png' }],
    destaques: [
      { valor: '11%', rotulo: 'das pessoas continuaram na esteira (51 de 448 entradas até 09/2024); 19 subiram de estágio' },
      { valor: '19%', rotulo: 'das empresas continuaram (26 de 140); 11 subiram de estágio' },
      { valor: '38%', rotulo: 'no Pró-Startups Operação, o maior: 18 de 48 pessoas e 11 de 29 empresas' },
      { valor: '8 de 18', rotulo: 'programas antigos o bastante para a medida; os outros só têm entradas depois de 09/2024' },
    ],
    analise: [
      'Contando só as entradas até setembro de 2024, para que todas tivessem ao menos dois anos para continuar, <strong>51 das 448 pessoas</strong> (11%) foram apoiadas depois em outro programa da esteira, e 19 delas num estágio mais alto. Entre as empresas, <strong>26 de 140</strong> (19%), 11 subindo de estágio.',
      'A continuidade se concentra na Operação. No <strong>Pró-Startups Operação</strong>, 38% das pessoas (18 de 48) e das empresas (11 de 29) seguiram na esteira, mas a maioria para o lado: só 4 pessoas e 5 empresas subiram. No Centelha, 14% das pessoas (15 de 104), metade subindo (7). No COMPET Soluções a parcela também é de 38%, mas com só 16 entradas; ali quase todos os que continuaram subiram (5 de 6).',
      'Nas escolas, quase ninguém segue para outro programa: 1 de 100 professores do COMPET Médio-Tec e 2 de 69 do Espaço CRIA, sem contar as idas e vindas entre os dois. No Tecnova, 4 de 47 pessoas (9%) e 2 de 34 empresas (6%) voltaram a ser apoiadas, nenhuma acima, porque o Tecnova já está no topo.',
      'Dez dos 18 programas ainda não podem ser medidos: nove só têm entradas depois de setembro de 2024 (entre eles Desafios.Gov, Global.PE, Inovação Aberta, COMPET Superior e Jornada REPE) e o COMPET Tração não tem edital na base. A medida diz respeito, portanto, à esteira antiga, anterior ao adensamento de 2024.',
    ],
    comoLer: [
      'Cada linha é um programa, na ordem do estágio (faixa colorida). À esquerda, pessoas; à direita, empresas, na mesma escala.',
      'A barra inteira é a parcela que continuou na esteira; o trecho escuro, a que subiu de estágio (como o preto da figura dos movimentos).',
      'Rótulo esmaecido: menos de 20 entradas, o que torna a parcela instável.',
    ],
    ressalvas: [
      'Não continuar não é desistir: só os aprovados aparecem na base, então não dá para saber quem tentou outro programa e não foi aprovado, nem quem nem tentou.',
      'Voltar ao mesmo programa não conta como continuar: em 108 das 448 entradas, a pessoa voltou depois ao mesmo programa (17 no Pró-Startups Operação; 63 nas escolas).',
      'As idas e vindas de professores entre o COMPET Médio-Tec e o Espaço CRIA não contam: os dois atendem escolas.',
      'A empresa só aparece nos projetos com empresa executora; na Ideação, nas bolsas e em programas como o Pernambucanas Inovadoras, a medida é só por pessoa.',
    ],
    fonte: { consultas: ['ParticipacoesNaEsteira'], script: 'medir_continuidade.py e visualizar_continuidade.py' },
  },
  {
    id: 'participacao-anterior',
    grupo: 'trilha',
    titulo: 'Quem chega à Operação e à Aceleração já tinha passado pela esteira?',
    pergunta: 'Dos coordenadores de projetos em programas de Operação e de Aceleração, quantos já tinham participado antes de algum programa da esteira?',
    status: 'revisado',
    versoes: [
      {
        id: 'esteira', rotulo: 'Só a esteira', arquivo: 'hipotese_participacao_anterior_esteira.png',
        destaques: [
          { valor: '19%', rotulo: 'dos coordenadores de Aceleração (28 de 144) já tinham passado pela esteira' },
          { valor: '6%', rotulo: 'dos coordenadores de Operação (18 de 326)' },
          { valor: '21% · 10%', rotulo: 'contando também a orientação (Aceleração · Operação)' },
        ],
      },
      {
        id: 'facepe', rotulo: 'Qualquer edital da FACEPE', arquivo: 'hipotese_participacao_anterior_facepe.png',
        destaques: [
          { valor: '31%', rotulo: 'dos coordenadores de Aceleração (44 de 144) já tinham participado da FACEPE' },
          { valor: '25%', rotulo: 'dos coordenadores de Operação (82 de 326)' },
          { valor: '33% · 36%', rotulo: 'contando também a orientação (Aceleração · Operação)' },
        ],
      },
    ],
    analise: [
      'Só com a esteira, <strong>28 dos 144</strong> coordenadores de Aceleração (19%) já tinham coordenado outro projeto ou recebido bolsa num programa da esteira, e todos eles tinham coordenado projeto em programa de Operação: o mesmo padrão do Tecnova III.',
      'Na Operação, a passagem anterior pela esteira é rara: <strong>18 de 326</strong> (6%), divididos entre coordenação de outro projeto (10) e bolsa de programa da esteira (9).',
      'Para quem entrou no estágio a partir de 2024, as parcelas são 25% na Aceleração (28 de 110) e 8% na Operação (17 de 201).',
      'Contando qualquer edital da FACEPE, as parcelas sobem para 31% e 25%. Na Aceleração, a diferença vem de programas de subvenção mais antigos, fora da esteira, como PAPPE e PEPE (20 coordenadores); na Operação, sobretudo de bolsas de pós-graduação (49 coordenadores), um vínculo da pessoa com a FACEPE, e não do projeto.',
    ],
    comoLer: [
      'Cor cheia: participação direta (coordenou projeto ou recebeu bolsa). Hachurado: orientação.',
      'Uma pessoa pode ter mais de um vínculo; as linhas em negrito são os totais.',
      'As duas versões têm a mesma escala: troque de versão para ver o quanto a parcela depende de programas fora da esteira.',
    ],
    ressalvas: [
      'A orientação é ligada à pessoa só pelo nome do orientador, e o significado de "orientador" nos projetos de subvenção ainda não foi confirmado com a FACEPE.',
      'Considera só a pessoa (não a empresa), a partir do seu primeiro projeto no estágio; por isso não é diretamente comparável ao estudo de caso.',
    ],
    fonte: { consultas: ['ParticipacaoAnterior'], script: 'visualizar_hipotese_participacao_anterior.py' },
    explorar: 'quem passou da Operação para a Aceleração?',
  },
  {
    id: 'pessoas-transversais',
    grupo: 'trilha',
    titulo: 'Pessoas em mais de um edital da esteira',
    pergunta: 'Quantas pessoas voltam à esteira, quantas vezes, e por quais estágios passam?',
    status: 'revisado',
    versoes: [{ id: 'unica', rotulo: 'Só a esteira', arquivo: 'coordenadores_transversais.png' }],
    destaques: [
      { valor: '227 de 1.703', rotulo: 'pessoas (13%) estiveram em mais de um edital da esteira' },
      { valor: '127', rotulo: 'passaram por mais de um programa' },
      { valor: '111', rotulo: 'são professores das escolas (Médio-Tec e CRIA)' },
      { valor: '51', rotulo: 'passaram por mais de um estágio' },
    ],
    analise: [
      'A maioria participa uma vez só: 1.476 das 1.703 pessoas (87%) aparecem em um único edital da esteira.',
      'Das 227 que voltam, quase metade (<strong>111</strong>) são professores que coordenaram projetos do COMPET Médio-Tec e do Espaço CRIA, dois programas voltados a escolas; ir e voltar entre eles não é progressão na esteira.',
      'Entre as demais, a progressão mais comum é <strong>Operação → Aceleração</strong> (32 pessoas); 16 passaram pela Ideação e pela Operação, e só 3 pelos três estágios.',
      'Dentro de um mesmo estágio há muito movimento entre programas: das 32 pessoas que ficaram só na Operação, 22 passaram por programas diferentes.',
    ],
    comoLer: [
      'À esquerda, em quantos editais da esteira a pessoa esteve; à direita, a combinação de estágios por que passou.',
      'Escuro: passou por programas diferentes. Claro: repetiu editais do mesmo programa.',
      'Os dois painéis têm a mesma escala.',
    ],
    ressalvas: [
      'Participação: coordenou um projeto ou recebeu uma bolsa. A pessoa é identificada pelo pseudônimo do CPF ou, quando só existe nos PDFs, pelo nome publicado (homônimos não são distinguidos).',
      'Os estudantes bolsistas das escolas não aparecem nos resultados publicados, só os professores.',
    ],
    fonte: { consultas: ['ParticipacoesComData'], script: 'visualizar_transversalidade.py' },
    explorar: 'quem coordenou projetos em mais de um edital?',
  },
  {
    id: 'mais-editais',
    grupo: 'trilha',
    titulo: 'Trajetórias de quem mais voltou à esteira',
    pergunta: 'Como são, edital a edital, as trajetórias das pessoas que mais participaram da esteira?',
    status: 'revisado',
    versoes: [
      { id: 'unica', rotulo: 'Só a esteira', arquivo: 'trajetorias_mais_editais.png', arquivoNomes: 'trajetorias_mais_editais_nomes.png' },
    ],
    destaques: [
      { valor: '12', rotulo: 'pessoas com 4 ou mais editais da esteira, fora das escolas' },
      { valor: '11 de 12', rotulo: 'passaram pela Operação e pela Aceleração' },
      { valor: '9 de 12', rotulo: 'começaram na Operação e chegaram depois à Aceleração' },
      { valor: '8 de 12', rotulo: 'passaram pelo Desafios.Gov (e 8 pelo COMPET Soluções)' },
    ],
    analise: [
      'Fora das escolas, só <strong>12 pessoas</strong> participaram de 4 ou mais editais da esteira (de 4 a 7), todas identificadas pelo CPF. Quase todas (11) passaram pela Operação e pela Aceleração, e <strong>9 começaram na Operação</strong> e chegaram depois à Aceleração: é o desenho da esteira.',
      'Antes de subir, essas pessoas circulam entre programas de Operação: o Desafios.Gov e o COMPET Soluções aparecem em 8 das 12 trajetórias, o Centelha em 4 e o Pró-Startups Operação em 3. Na Aceleração, os mais frequentes são o Global.PE (6), o Tecnova (5) e o Inovação Aberta (5).',
      'As trajetórias são recentes: começam entre 2022 e 2025, pela data de início do primeiro processo, e se concentram em editais de 2024 em diante.',
      'Há caminhos fora do desenho: uma pessoa entrou pela Aceleração (Tecnova III) e depois voltou à Operação; duas receberam bolsa da Jornada REPE (Ideação) quando já tinham passado pela Operação; e duas começaram coordenando projeto no Espaço CRIA e depois coordenaram projeto no COMPET Soluções.',
    ],
    comoLer: [
      'Cada linha é uma pessoa, com o número de editais ao lado; a ordem é a mesma nas duas versões.',
      'Cada coluna é um edital da esteira, em ordem cronológica. Círculo cheio: coordenou projeto; vazado: recebeu bolsa. A cor é o estágio.',
      'À direita, os estágios na ordem em que a pessoa entrou em cada um.',
    ],
    ressalvas: [
      'Ficaram de fora 12 professores com 4 ou mais editais só nas escolas (COMPET Médio-Tec e Espaço CRIA): ir e voltar entre os dois não é progressão. Eles aparecem agrupados em "Pessoas em mais de um edital da esteira".',
      'O corte em 4 editais é um critério, e não uma posição no ranking: não há empate a desfazer.',
    ],
    fonte: { consultas: ['ParticipacoesComData'], script: 'visualizar_top10_matriz.py' },
    explorar: 'quem passou da Operação para a Aceleração?',
  },
  {
    id: 'apoio-anterior-edital',
    grupo: 'trilha',
    titulo: 'Apoio anterior por edital e estágio',
    pergunta: 'Nos editais recentes da esteira, que parcela dos beneficiários já tinha passado antes pela esteira?',
    status: 'revisado',
    versoes: [
      {
        id: 'esteira', rotulo: 'Só a esteira', arquivo: 'participacao_anterior_por_estagio_esteira.png',
        destaques: [
          { valor: '39%', rotulo: 'dos 138 beneficiários de editais de Aceleração já tinham passado pela esteira' },
          { valor: '22%', rotulo: 'dos 315 de Operação' },
          { valor: '14%', rotulo: 'dos 1.363 de Ideação' },
        ],
      },
      {
        id: 'facepe', rotulo: 'Qualquer edital da FACEPE', arquivo: 'participacao_anterior_por_estagio_facepe.png',
        destaques: [
          { valor: '46%', rotulo: 'dos 138 beneficiários de editais de Aceleração já tinham sido apoiados pela FACEPE' },
          { valor: '34%', rotulo: 'dos 315 de Operação' },
          { valor: '18%', rotulo: 'dos 1.363 de Ideação' },
        ],
      },
    ],
    analise: [
      'Nos 33 editais da esteira com data a partir de 2024, quanto mais avançado o estágio, maior a parcela de beneficiários que já tinha passado pela esteira: <strong>39% na Aceleração</strong> (54 de 138), 22% na Operação (69 de 315) e 14% na Ideação (193 de 1.363).',
      'Na Aceleração, quase todos vinham de outro programa: só 3 dos 54 tinham passado apenas pelo próprio programa. O caso extremo é o Global.PE Espanha (22/2026), com 10 de 11.',
      'Na Ideação, mais da metade (108 dos 193) só tinha passado pelo próprio programa. Os editais das escolas (COMPET Médio-Tec e Espaço CRIA) de 2025 e 2026 concentram 157 dos 193 casos: são professores que voltam. Os primeiros editais desses dois programas, de 2024, têm 0%.',
      'Com qualquer edital da FACEPE, as parcelas sobem para 46%, 34% e 18%: a diferença vem de programas fora da esteira e de bolsas de pós-graduação.',
    ],
    comoLer: [
      'Cada barra é um edital da esteira com data a partir de 2024, agrupado pelo estágio do programa; a data é a do início do primeiro processo do edital.',
      'As duas versões têm os mesmos editais e a mesma escala; muda só o que conta como apoio anterior.',
    ],
    ressalvas: [
      'Só editais a partir de 2024: antes disso, a base tem pouco histórico para trás.',
      'Difere da análise agregada: conta todos os beneficiários (não só coordenadores), qualquer edital anterior, inclusive do mesmo programa, e não conta orientação.',
    ],
    fonte: { consultas: ['ParticipacoesComData'], script: 'visualizar_participacao_anterior.py' },
    explorar: 'quantos beneficiários do edital 26/2024 já tinham sido apoiados antes?',
  },
  {
    id: 'editais-por-programa',
    grupo: 'programas',
    titulo: 'Editais por programa da esteira',
    pergunta: 'Quantos editais cada programa da esteira teve, e quando?',
    status: 'revisado',
    versoes: [{ id: 'unica', rotulo: 'Só a esteira', arquivo: 'editais_por_programa.png' }],
    destaques: [
      { valor: '41', rotulo: 'editais da esteira na base' },
      { valor: '17 de 18', rotulo: 'programas com edital (falta o COMPET Tração)' },
      { valor: '32 de 41', rotulo: 'editais de 2024 em diante' },
    ],
    analise: [
      'A Operação tem mais editais (17, em 6 programas); a Ideação, 13 (6 programas); a Aceleração, 11 (5 de 6: o COMPET Tração não tem resultado publicado nem está no extrato).',
      'A esteira é recente: <strong>32 dos 41</strong> editais são de 2024 em diante.',
      'Os editais não seguem um calendário regular: o Tecnova teve editais em 2014, 2019 e 2024; o Centelha, em 2019, 2021 e 2025; o Pró-Startups Operação, em 2021, 2022 e 2025. É o ponto de partida da proposta de um calendário de abertura dos editais.',
    ],
    comoLer: ['Cada barra é um programa, agrupado pelo estágio; o número é a quantidade de editais distintos na base.'],
    ressalvas: ['A base reúne o extrato do AgilFAP, os resultados publicados no site e os publicados só em notícias; a página de resultados do site não traz todos os resultados.'],
    fonte: { consultas: ['EditaisPorPrograma'], script: 'visualizar_editais_por_programa.py' },
    explorar: 'quantos editais, projetos e bolsas tem cada programa?',
  },
  {
    id: 'regioes',
    grupo: 'programas',
    titulo: 'Projetos por Região de Desenvolvimento',
    pergunta: 'Em que regiões do estado estão as instituições que executam os projetos da esteira?',
    status: 'revisado',
    versoes: [
      {
        id: 'esteira', rotulo: 'Só a esteira', arquivo: 'projetos_por_regiao_esteira.png',
        destaques: [
          { valor: '78%', rotulo: 'dos projetos da esteira com região estão na Região Metropolitana (286 de 366)' },
          { valor: '31', rotulo: 'no Sertão do São Francisco (RD 02), a segunda região' },
          { valor: '0', rotulo: 'projetos no Sertão de Itaparica (RD 01)' },
        ],
      },
      {
        id: 'facepe', rotulo: 'Todos os projetos de inovação', arquivo: 'projetos_por_regiao_facepe.png',
        destaques: [
          { valor: '77%', rotulo: 'dos projetos com região estão na Região Metropolitana (370 de 483)' },
          { valor: '45', rotulo: 'no Sertão do São Francisco (RD 02), a segunda região' },
          { valor: '0', rotulo: 'projetos no Sertão de Itaparica (RD 01)' },
        ],
      },
    ],
    analise: [
      'Os projetos da esteira se concentram na <strong>Região Metropolitana do Recife</strong> (RD 12): 286 dos 366 com região informada (78%). A segunda região é o Sertão do São Francisco (31), seguida do Agreste Central (19); o Sertão de Itaparica (RD 01) não tem nenhum projeto.',
      'A concentração é maior na Aceleração: 58 dos 67 projetos de Aceleração com região estão na Região Metropolitana, contra 225 dos 295 da Operação.',
      'A Ideação quase não aparece: só 4 dos seus 681 projetos têm região, porque os demais (das escolas, do COMPET Superior e outros) só existem nos resultados publicados, que não informam a região.',
      'Com todos os projetos de inovação, o quadro é o mesmo: 370 dos 483 (77%) na Região Metropolitana.',
    ],
    comoLer: [
      'Cada barra é uma Região de Desenvolvimento (Lei Complementar estadual nº 388/2018), dividida pelo estágio do programa do projeto.',
      'As duas versões têm a mesma ordem das regiões e a mesma escala; na versão completa, o cinza é de programas fora da esteira.',
    ],
    ressalvas: [
      'A região é a da instituição executora, não necessariamente a de onde o projeto atua.',
      'Só os projetos do extrato do AgilFAP têm região: os que só existem nos resultados publicados ficam de fora.',
    ],
    fonte: { consultas: ['ProjetosPorRegiao'], script: 'visualizar_regioes.py' },
  },
  {
    id: 'desfecho',
    grupo: 'programas',
    titulo: 'Desfecho dos processos',
    pergunta: 'Os processos contratados foram concluídos, cancelados ou ainda estão em andamento?',
    status: 'revisado',
    versoes: [{ id: 'unica', rotulo: 'Só a esteira', arquivo: 'desfecho_processos_esteira.png' }],
    destaques: [
      { valor: '35 de 1.246', rotulo: 'processos cancelados (3%): 33 bolsas e só 2 projetos, ambos do Tecnova' },
      { valor: '84', rotulo: 'processos encerrados sem relatório final no extrato (62 bolsas e 22 projetos)' },
    ],
    analise: [
      'A desistência formal é rara: <strong>35 dos 1.246 processos</strong> (3%) foram cancelados, e quase todos são bolsas: 14 das 80 do Pernambucanas Inovadoras (18%), 12 das 551 do COMPET Superior, 4 das 38 do Centelha e 3 das 15 do Tecnova. Entre os projetos, <strong>só 2 de 370</strong>, ambos do Tecnova.',
      'Os projetos de startups terminam quase sempre com relatório final: 99% no Pró-Startups Operação (118 de 119) e no Centelha (74 de 75), e todos no COMPET Soluções e no Global.PE. O "encerrado sem relatório" pesa na Jornada REPE (47 das 192 bolsas) e nos projetos do Pernambucanas Inovadoras (13 de 52). No Tecnova, um terço dos projetos ainda estava em andamento (19 de 56): são os 19 do Tecnova III.',
    ],
    comoLer: [
      'Cada linha é um programa e um tipo de processo (projetos ou bolsas), na ordem do estágio (faixa colorida).',
      'Vermelho: cancelado. Hachurado: em andamento em 28/09/2026, a data do extrato.',
    ],
    ressalvas: [
      'Só os 9 programas da esteira com processos no extrato do AgilFAP têm vigência, cancelamento e relatório final; nos demais, o desfecho não é observado.',
      '"Encerrado sem relatório" pode ser relatório ainda não entregue ou não registrado no extrato; não quer dizer que o projeto falhou.',
      'Fora do gráfico, porque não está na ontologia: dos 306 aprovados nos resultados publicados de editais cobertos pelo extrato, 21 não têm processo correspondente (17 no Centelha). São registros descartados na integração das fontes, e o número é um limite superior: mistura desistência antes do contrato com nomes que não casaram (no Centelha, o cruzamento é pelo nome).',
    ],
    fonte: { consultas: ['DesfechoProcessos'], script: 'medir_continuidade.py e visualizar_continuidade.py' },
    explorar: 'quantos processos do Centelha foram cancelados?',
  },
  {
    id: 'calendario-editais',
    grupo: 'previsibilidade',
    titulo: 'Calendário dos editais',
    pergunta: 'Os editais da esteira abrem com regularidade? Os cronogramas são cumpridos?',
    status: 'revisado',
    versoes: [{ id: 'unica', rotulo: 'Só a esteira', arquivo: 'calendario_editais.png' }],
    destaques: [
      { valor: '12 meses', rotulo: 'intervalo mediano entre editais do mesmo programa (24 intervalos)' },
      { valor: '55 meses', rotulo: 'entre o Tecnova 2 (dez/2019) e o Tecnova III (jul/2024), sem nenhum outro edital de Aceleração' },
      { valor: '18 de 41', rotulo: 'editais com documento que alterou o cronograma' },
      { valor: '12 dias', rotulo: 'atraso mediano do resultado final em relação ao previsto (24 editais de seleção única)' },
    ],
    analise: [
      'Há dois ritmos na esteira. Pernambucanas Inovadoras, COMPET Soluções, COMPET Médio-Tec e Espaço CRIA abrem <strong>um edital por ano</strong> (intervalos de 10 a 12 meses). Tecnova (64 e 55 meses), Centelha (28 e 48) e Pró-Startups Operação (11 e 31) abrem de forma <strong>irregular</strong>.',
      'A Aceleração ficou <strong>sem nenhum edital entre o Tecnova 2 (dezembro de 2019) e o Tecnova III (julho de 2024)</strong>. A partir de 2024 a esteira se adensa: Global.PE, Inovação Aberta, Transforma PE e COMPET Mulheres abrem editais em 2025 e 2026.',
      'O cronograma muda com frequência: 18 dos 41 editais tiveram algum documento de alteração (prorrogação, retificação, novo cronograma), e o Centelha 3 mais de dez. Nos casos conferidos, as prorrogações da submissão foram de cerca de um mês.',
      'O resultado final, porém, sai perto do previsto: nos 24 editais de seleção única com as duas datas, o atraso mediano foi de 12 dias; só 4 passaram de 30 dias. A falta de previsibilidade está nos <strong>intervalos entre editais</strong>, e não no andamento de cada um.',
    ],
    comoLer: [
      'Cada linha é um programa, agrupado pelo estágio; cada barra, a primeira janela de submissão de um edital (do lançamento ao fim da submissão).',
      'As linhas finas marcam os trimestres (jan, abr, jul, out); as mais fortes, a virada do ano.',
      'A parte hachurada é a prorrogação da submissão; o losango, o resultado final publicado no site.',
      'Nos editais com fases ou rodadas (Centelha, Pró-Startups, Transforma PE), a barra é só a primeira janela.',
    ],
    ressalvas: [
      'Datas da página de editais do site e dos cronogramas publicados; os casos com fases, rodadas ou prorrogações foram conferidos à mão nos PDFs, e os demais lidos automaticamente (uma amostra de 4 conferiu).',
      'O edital Global.PE 29/2026 não tem lançamento nem cronograma publicados (a pedir à FACEPE). O Tecnova 12/2014 fica fora da escala do gráfico.',
    ],
    fonte: { consultas: ['CalendarioEditais'], script: 'visualizar_calendario.py' },
  },
  {
    id: 'espera-estagios',
    grupo: 'previsibilidade',
    titulo: 'Espera entre estágios',
    pergunta: 'Quando um processo termina, quanto tempo falta para abrir um edital do estágio seguinte?',
    status: 'revisado',
    versoes: [{ id: 'unica', rotulo: 'Só a esteira', arquivo: 'espera_entre_estagios.png' }],
    destaques: [
      { valor: '100%', rotulo: 'dos projetos de Operação encerrados em 2021–2022 esperaram mais de 12 meses por um edital de Aceleração (84)' },
      { valor: '91%', rotulo: 'dos encerrados em 2025 encontraram uma janela de Aceleração aberta (69 de 76)' },
      { valor: '76%', rotulo: 'dos processos de Ideação (2025–2026) encontraram uma janela de Operação aberta' },
    ],
    analise: [
      'A passagem da Operação para a Aceleração dependia, até 2024, de esperar muito: os 84 projetos de Operação encerrados em 2021 e 2022 esperaram <strong>mais de um ano</strong> por um edital de Aceleração, e os encerrados em 2023, de 6 a 12 meses na maioria.',
      'Desde 2024 a situação mudou: dos projetos encerrados em 2025, 91% encontraram uma janela de Aceleração já aberta, e os demais esperaram menos de 3 meses; em 2026, 83% e 17%.',
      'Na Ideação, cujos processos terminaram em 2025 e 2026, 76% encontraram uma janela de Operação aberta e o restante esperou menos de 3 meses.',
      'É uma explicação possível para parte da passagem anterior baixa medida nos programas mais antigos: quem terminou a Operação antes de 2024 não tinha para onde ir na esteira. A continuidade dos anos recentes ainda não pode ser medida (a janela de 2 anos não se completou).',
    ],
    comoLer: [
      'Cada linha é um grupo de processos encerrados: os da Ideação juntos e os da Operação por ano de término.',
      'A cor indica a espera até a próxima janela de submissão de qualquer programa do estágio seguinte; o mais claro é "janela aberta".',
    ],
    ressalvas: [
      'Só os processos do extrato do AgilFAP têm data de término; na Operação, só projetos (empresas e startups, o público da Aceleração).',
      'Uma janela aberta não quer dizer que a pessoa ou a empresa se inscreveu, nem que o programa era adequado a ela: é a oportunidade de entrada, não o uso.',
    ],
    fonte: { consultas: ['CalendarioEditais', 'DesfechoProcessos'], script: 'visualizar_calendario.py' },
  },
  {
    id: 'calendario-sugerido',
    grupo: 'previsibilidade',
    titulo: 'Calendário sugerido',
    pergunta: 'Em que meses abrir os editais de cada estágio para que quem termina um estágio encontre logo o edital do seguinte?',
    status: 'revisado',
    versoes: [{ id: 'unica', rotulo: 'Só a esteira', arquivo: 'calendario_sugerido.png' }],
    destaques: [
      { valor: '96%', rotulo: 'dos projetos de Operação encontrariam um edital de Aceleração em até 3 meses com duas janelas fixas por ano (houve: 54%)' },
      { valor: 'jul–set e dez–fev', rotulo: 'as duas janelas de Aceleração que mais cobrem os términos da Operação' },
      { valor: '0 de 111', rotulo: 'projetos de Operação encerrados em 2021–2023 encontraram um edital de Aceleração em até 3 meses' },
    ],
    analise: [
      'Os projetos de Operação terminam ao longo do ano todo, com picos em abril (63) e novembro (60). Por isso, uma janela de Aceleração por ano, mesmo regular, alcançaria só cerca de metade deles (53%) em até três meses. <strong>Duas janelas fixas por ano, de julho a setembro e de dezembro a fevereiro, alcançariam 96%.</strong>',
      'No calendário que houve, a cobertura foi de 54%: <strong>nenhum</strong> dos 111 projetos encerrados de 2021 a 2023 encontrou edital de Aceleração em até três meses, e em 2025 e 2026, com três a quatro editais de Aceleração por ano, todos encontraram. As duas janelas fixas teriam dado quase o mesmo resultado de 2025–2026 (94% a 100%) também nos anos sem edital. A proposta, portanto, não é abrir mais editais, e sim <strong>tornar regular</strong> o que passou a funcionar em 2025.',
      'Na passagem da Ideação para a Operação, o calendário de 2025–2026 já funcionou: todos os que terminaram encontraram um edital de Operação em até três meses. Como 81% dos processos de Ideação terminam em agosto e setembro (o ano letivo), a sugestão é manter sempre uma janela de Operação aberta em setembro e outubro, e outra em abril e maio.',
    ],
    comoLer: [
      'Barras: quantos processos terminaram em cada mês, somando todos os anos. Faixa colorida: a janela sugerida para o estágio seguinte, que se repetiria todo ano.',
      'Linha de cima: em quantos dos anos de 2019 a 2025 houve alguma janela do estágio seguinte aberta naquele mês; mostra a irregularidade do calendário que houve.',
      'Encontrar janela: o edital do estágio seguinte estava aberto quando o processo terminou ou abriu em até três meses.',
    ],
    ressalvas: [
      'É uma proposta para discutir com a SECTI-PE/FACEPE: o cálculo não conhece o orçamento, os prazos internos nem a capacidade de avaliação.',
      'Uma janela aberta é a oportunidade de entrada, não a garantia de que a empresa se inscreve ou de que o programa serve a ela.',
      'Só os processos do extrato do AgilFAP têm data de término (na Operação, só projetos, o público da Aceleração), encerrados até três meses antes da data do extrato. As janelas simuladas duram o mesmo que a mediana das janelas do estágio (60 dias na Operação, 71 na Aceleração).',
    ],
    fonte: { consultas: ['CalendarioEditais', 'DesfechoProcessos'], script: 'visualizar_calendario_sugerido.py' },
  },
  {
    id: 'global-pe-espanha',
    grupo: 'caso',
    titulo: 'Contraste: Global.PE Espanha',
    pergunta: 'Os coordenadores de um edital de internacionalização, também de Aceleração, tinham passado antes pela esteira? Por qual estágio?',
    status: 'revisado',
    versoes: [
      { id: 'esteira', rotulo: 'Só a esteira', arquivo: 'estudo_caso_global_pe_espanha_esteira.png', arquivoNomes: 'estudo_caso_global_pe_espanha_esteira_nomes.png' },
      { id: 'facepe', rotulo: 'Todos os editais da FACEPE', arquivo: 'estudo_caso_global_pe_espanha_facepe.png', arquivoNomes: 'estudo_caso_global_pe_espanha_facepe_nomes.png' },
    ],
    destaques: [
      { valor: '10 de 11', rotulo: 'coordenadores já tinham passado pela esteira' },
      { valor: '9 de 11', rotulo: 'tinham passado pela Operação' },
      { valor: '7 de 11', rotulo: 'já tinham passado por outro edital de Aceleração (3 pelo Tecnova III)' },
    ],
    analise: [
      'O Global.PE Espanha (edital 22/2026) só existe nos resultados publicados, que não trazem as empresas: só os 11 coordenadores podem ser seguidos (10 identificados pelo CPF, 1 só pelo nome).',
      'Quase todos já tinham passado pela esteira (<strong>10 de 11</strong>), 9 deles pela Operação.',
      'Mas <strong>7 já tinham estado em outro edital de Aceleração</strong>: 3 no próprio Tecnova III e os demais no Global.PE 05/2025, no Inovação Aberta 33/2025 e no Transforma PE 23/2025. O edital mostra sobretudo a continuidade dentro da Aceleração (a internacionalização de quem já foi acelerado), e não a passagem da Operação para a Aceleração.',
      'Com todos os editais da FACEPE, aparecem também programas fora da esteira (COMPET AME, Transforma Mulher, SEBRAE Startups NE) e bolsas de pós-graduação, mas nenhum coordenador ganha participação anterior: o décimo primeiro continua sem nenhuma.',
      'Em contraste com o Tecnova III, em que metade dos projetos tinha passado antes pela esteira, quase sempre pela Operação, aqui quase todos os coordenadores tinham passado, e a maioria já pela Aceleração.',
    ],
    comoLer: [
      'Cada linha é um coordenador; a numeração é a mesma nas duas versões.',
      'Cada coluna é um edital, em ordem cronológica; a coluna destacada é o próprio Global.PE Espanha.',
      'Círculo cheio: coordenou projeto; vazado: recebeu bolsa. A cor é o estágio do programa; cinza, fora da esteira.',
    ],
    ressalvas: [
      'Sem a empresa, não dá para saber se as passagens anteriores são do mesmo empreendimento.',
      'Um dos 11 coordenadores só existe nos resultados publicados e é identificado pelo nome.',
    ],
    fonte: { consultas: ['ParticipacoesComData'], script: 'visualizar_estudo_caso.py' },
    explorar: 'trajetória do edital 22/2026',
  },
];

// ── Capítulos (21/11/2026): a narrativa do painel ─────────────────────────────────
// Cada aba-capítulo responde a uma pergunta que nasce da anterior, até a proposta: a esteira
// funciona como trilha só em parte; ela se interrompe sobretudo no tempo entre um edital e o
// próximo (e no território); um calendário regular pode fazer a trilha funcionar.
// Os números são os mesmos das páginas dos gráficos acima (conferidos lá). Campos de um bloco:
// titulo, numero/rotulo/proporcao (o destaque; proporcao de 0 a 1 desenha a barrinha), textos,
// grafico (id da página em GRAFICOS; a imagem é a primeira versão, salvo imagem: false), sugere,
// pergunta (para a FACEPE), link ({ href, texto }). tipo: 'calendario' põe ali a linha do tempo
// interativa; tipo: 'proposta' põe a proposta de calendário (PROPOSTA, abaixo).
// tom do selo: 'parcial' | 'fraca' | 'inicial' | 'exploracao'.
export const CAPITULOS = [
  {
    id: 'trilha',
    aba: 'A trilha existe?',
    titulo: 'Quem chega aos estágios avançados passou pela trilha?',
    hipotese: 'As empresas e as pessoas que chegam aos programas de Aceleração passaram antes por programas da esteira.',
    selo: 'Confirmada em parte', tom: 'parcial',
    resposta: 'Em parte. Metade dos projetos do Tecnova III veio da esteira, quase todos pela Operação. Mas, olhando todos os coordenadores, quem passou antes pela esteira é minoria: a trilha existe, mas não é o único caminho.',
    blocos: [
      {
        titulo: 'O caso do Tecnova III',
        numero: '9 de 19', rotulo: 'projetos já tinham passado por programas da esteira', proporcao: 9 / 19,
        textos: [
          'Em 7 deles, tanto a empresa quanto o coordenador; em 1, só a empresa; em 1, só o coordenador. Oito passaram pela Operação. Os outros 10 chegaram à Aceleração sem passagem registrada pela esteira.',
          'No Global.PE Espanha, outro edital de Aceleração, 10 dos 11 coordenadores já tinham passado pela esteira, mas 7 deles por outro edital de Aceleração: ali, a esteira aparece sobretudo como continuidade dentro da própria Aceleração.',
        ],
        grafico: 'tecnova-iii',
        sugere: 'A esteira alimenta a Aceleração, mas não é o único caminho até ela.',
        pergunta: 'De onde vieram os outros 10 projetos do Tecnova III? De outros apoios (SEBRAE, FINEP, incubadoras, investidores)?',
      },
      {
        titulo: 'Todos os coordenadores de Operação e de Aceleração',
        numero: '19%', rotulo: 'dos coordenadores de Aceleração já tinham passado pela esteira (6% na Operação)', proporcao: 28 / 144,
        textos: [
          'São 28 dos 144 coordenadores de Aceleração, todos com projeto anterior em programa de Operação, como a esteira prevê. Na Operação, são 18 de 326.',
          'Para quem entrou a partir de 2024, as parcelas sobem para 25% na Aceleração (28 de 110) e 8% na Operação (17 de 201).',
        ],
        grafico: 'participacao-anterior',
        sugere: 'Na Aceleração, a passagem anterior segue o desenho da esteira, mas para uma minoria; na Operação, quase ninguém tinha passado antes pela esteira.',
      },
      {
        titulo: 'O primeiro degrau: da Ideação para a Operação',
        numero: '12 pessoas', rotulo: 'receberam bolsa de Ideação e depois foram beneficiárias de programa de Operação',
        textos: [
          'É uma evidência inicial: 12 dos 13 editais de Ideação são de 2024 em diante, pouco tempo para a passagem aparecer.',
        ],
      },
    ],
    ponte: 'Se a trilha explica só metade das chegadas à Aceleração, como as pessoas circulam entre os programas?',
  },
  {
    id: 'circulacao',
    aba: 'Como se circula',
    titulo: 'Para onde vão as pessoas depois de um programa?',
    hipotese: 'Quem termina um programa da esteira segue para um programa do estágio seguinte.',
    selo: 'Pouco frequente', tom: 'fraca',
    resposta: 'Raramente. A maior parte das mudanças de programa é para o lado, dentro do mesmo estágio; a principal porta para a Aceleração é o Desafios.Gov; e poucos voltam a ser apoiados pela esteira, mas não por abandono.',
    blocos: [
      {
        titulo: 'Mais para o lado do que para a frente',
        numero: '131', rotulo: 'mudanças de um programa para o seguinte: 44 subiram de estágio, 63 ficaram no mesmo e 24 voltaram',
        textos: [
          'Ordenando no tempo os programas em que cada pessoa coordenou projeto ou recebeu bolsa, o movimento mais comum é dentro da Operação: entre o Centelha e o Pró-Startups Operação, e do Pró-Startups Operação para o COMPET Soluções.',
          'As voltas mais frequentes têm um padrão: pessoas que passaram pelo Tecnova e depois coordenaram projeto no Desafios.Gov, ou coordenadores do Pró-Startups Operação que depois receberam bolsa da Jornada REPE ou do COMPET Superior. Parecem menos um retrocesso do que o uso de programas com outra finalidade.',
        ],
        grafico: 'movimentos',
        pergunta: 'Quem faz esse caminho inverso está usando o programa com outra finalidade, ou é um retrocesso na trilha?',
      },
      {
        titulo: 'O Desafios.Gov é a principal porta para a Aceleração',
        numero: '16 de 17', rotulo: 'das mudanças a partir do Desafios.Gov foram para um programa de Aceleração', proporcao: 16 / 17,
        textos: [
          'Sozinho, ele responde por metade das 32 subidas da Operação para a Aceleração, sobretudo para o Global.PE e o Inovação Aberta. Os outros programas de Operação trocam pessoas mais entre si do que as levam para a Aceleração.',
        ],
        grafico: 'movimentos', imagem: false,
        sugere: 'Vale entender o que o Desafios.Gov faz de diferente (desafios propostos por órgãos públicos) e se isso pode ser levado aos outros programas de Operação.',
        pergunta: 'Esse papel do Desafios.Gov é intencional no desenho do programa?',
      },
      {
        titulo: 'Poucos voltam a ser apoiados, e não por abandono',
        numero: '11%', rotulo: 'das pessoas foram apoiadas depois por outro programa da esteira (19% das empresas)', proporcao: 0.11,
        textos: [
          'Contando quem entrou até setembro de 2024, para todos terem tido dois anos para continuar. A continuidade vai de 1% a 3% nas escolas a 38% no Pró-Startups Operação.',
          'O cancelamento é raro: 35 dos 1.246 processos do extrato (3%), quase todos bolsas; entre os projetos, só 2 de 370.',
        ],
        grafico: 'continuidade',
        sugere: 'O problema não é desistir no meio do programa, e sim a passagem de um programa para o seguinte, que hoje depende da iniciativa de cada um.',
        pergunta: 'Existe hoje alguma ação para encaminhar quem termina um programa ao programa seguinte?',
      },
    ],
    ponte: 'Se quase ninguém desiste no meio do programa, onde a trilha se interrompe?',
  },
  {
    id: 'interrupcao',
    aba: 'Onde se interrompe',
    titulo: 'Onde a trilha se interrompe?',
    hipotese: 'Há períodos em que quem termina um estágio não encontra o edital do estágio seguinte.',
    selo: 'Confirmada', tom: 'parcial',
    resposta: 'No tempo e no território. A Aceleração ficou 55 meses sem edital, e quem terminou a Operação nesse período não encontrou o degrau seguinte. E, quanto mais avançado o estágio, mais os projetos se concentram na Região Metropolitana.',
    blocos: [
      {
        titulo: 'No tempo: anos sem edital de Aceleração',
        numero: '55 meses', rotulo: 'sem edital de Aceleração, de dezembro de 2019 a julho de 2024',
        textos: [
          'A linha do tempo abaixo mostra quando cada edital da esteira esteve aberto. A Aceleração ficou sem nenhum edital entre o Tecnova 2 e o Tecnova III; a partir de 2025, a esteira se adensa, com três a quatro editais de Aceleração por ano.',
        ],
      },
      { tipo: 'calendario' },
      {
        titulo: 'Quem terminou a Operação nesse período ficou esperando',
        numero: '0 de 111', rotulo: 'projetos de Operação encerrados em 2021–2023 encontraram um edital de Aceleração em até três meses',
        textos: [
          'Os 84 projetos de Operação encerrados em 2021 e 2022 esperaram mais de um ano por um edital de Aceleração. A partir de 2025 a situação mudou: 91% dos que terminaram em 2025 encontraram uma janela aberta.',
        ],
        grafico: 'espera-estagios',
        sugere: 'A passagem da Operação para a Aceleração depende do calendário: quando não há edital, a trilha se interrompe.',
      },
      {
        titulo: 'No território: o interior chega menos aos estágios avançados',
        numero: '87%', rotulo: 'dos projetos de Aceleração com região estão na Região Metropolitana do Recife (76% na Operação)', proporcao: 58 / 67,
        textos: [
          'São 58 dos 67 projetos de Aceleração e 225 dos 295 da Operação com região informada. A segunda região é o Sertão do São Francisco.',
        ],
        grafico: 'regioes',
        sugere: 'Se a interiorização for um objetivo, a passagem das empresas do interior entre os estágios é um ponto a acompanhar.',
      },
    ],
    ponte: 'Se a trilha se interrompe sobretudo no tempo entre um edital e o próximo, o que fazer?',
  },
  {
    id: 'proposta',
    aba: 'O que propomos',
    titulo: 'Como fazer a trilha funcionar?',
    resposta: 'Abrir os editais com regularidade, nos meses em que os projetos do estágio anterior terminam, e passar a acompanhar a trilha, e não só cada programa.',
    blocos: [
      { tipo: 'proposta' },
      {
        titulo: 'Acompanhar a trilha, e não só cada programa',
        textos: [
          'As consultas deste painel podem ser refeitas a cada novo extrato do AgilFAP. A cada ano, a SECTI-PE/FACEPE veria quem passou de um estágio para o seguinte, quanto tempo levou e onde a trilha parou, inclusive para as empresas do interior.',
          'O mesmo modelo de dados responde a perguntas novas sem mudar a base.',
        ],
        link: { href: '#pilha', texto: 'Ver como funciona →' },
      },
    ],
    ponte: 'Em resumo: a esteira funciona como trilha?',
  },
];

// A proposta do calendário, na aba "Calendário", depois da linha do tempo.
export const PROPOSTA = {
  titulo: 'Proposta: um calendário anual para a esteira',
  texto: 'Abrir os editais nos meses em que os projetos do estágio anterior terminam. Com as datas reais de término dos projetos e as janelas que houve, uma simulação mostra que não é preciso abrir mais editais, e sim abri-los com regularidade.',
  itens: [
    '<strong>Aceleração: duas janelas fixas por ano</strong>, de julho a setembro e de dezembro a fevereiro. Elas teriam alcançado 96% dos projetos de Operação em até três meses do término; no calendário que houve, foram 54%.',
    '<strong>Operação: uma janela em setembro e outubro</strong>, quando termina 81% da Ideação (o ano letivo), e outra em abril e maio. Em 2025 e 2026 o calendário já cumpriu esse papel; a proposta é manter essas janelas como regra.',
    'Os meses podem ser cumpridos por programas diferentes do estágio: o que importa para quem termina é encontrar algum edital do estágio seguinte aberto.',
  ],
  ressalva: 'É uma proposta para discutir: o cálculo não conhece o orçamento, os prazos internos nem a capacidade de avaliação da SECTI-PE/FACEPE.',
  pergunta: 'Há restrições (orçamento, conselho, prazos legais) que impeçam janelas fixas nesses meses?',
  grafico: 'calendario-sugerido',
};

// Perguntas que só a FACEPE pode responder.
export const PERGUNTAS_GESTORES = [
  'Algumas pessoas fazem o caminho inverso, por exemplo do Tecnova para o Desafios.Gov ou do Pró-Startups para a Jornada REPE. Isso é uso do programa com outra finalidade, ou é um retrocesso na trilha?',
  'Nos projetos de subvenção (SIN), o que significa a pessoa registrada como "orientador"?',
  'Os programas fora das três colunas do pôster (Redes de Inovação, Pró-Startups Incubadoras, SEBRAE Startups NE, COMPET AME, Lócus de Inovação, entre outros) fazem parte da esteira? Em que estágio?',
  'Alguns editais da esteira não vieram no extrato recebido (por exemplo, COMPET Médio-Tec 04/2024, Espaço CRIA 11/2024 e Inovação Aberta 33/2025). Seria possível um extrato atualizado?',
  'Seria possível receber, pseudonimizados, os estudantes bolsistas das escolas e as propostas não aprovadas? Com eles dá para separar quem desistiu de quem tentou e não foi aprovado.',
];
