// perguntas.js — perguntas em português -> consultas SPARQL, por modelos (sem IA).
//
// Cada pergunta prevista ("intent") reconhece palavras-chave e preenche campos (edital,
// programa, estágio, ano, N, empresa/pessoa); a consulta SPARQL é montada a partir de um
// modelo com esses campos. As perguntas vêm do mapa de perguntas do painel (painel/README.md):
// a pergunta e a hipótese do TCC, o que a revisão do orientador pede sobre empresas e as
// consultas que já alimentam os gráficos. A ordem da lista importa: vale a primeira que casar.

export const PREFIXO = 'PREFIX facepe: <http://gic.ufrpe.br/facepe-inovacao/vocabulary/facepe#>';

const ESTAGIOS = [
  { ordem: 1, nome: 'Ideação', chave: 'ideacao' },
  { ordem: 2, nome: 'Operação', chave: 'operacao' },
  { ordem: 3, nome: 'Aceleração', chave: 'aceleracao' },
];

// Edições conhecidas pelo nome (os editais não trazem o nome da edição como dado).
const EDICOES = [
  ['tecnova iii', '23/2024'], ['tecnova 3', '23/2024'], ['tecnova ii', '24/2019'], ['tecnova 2', '24/2019'],
  ['global pe espanha', '22/2026'], ['global pe portugal', '26/2026'], ['global pe argentina', '29/2026'],
];

// Palavras que, sozinhas, não identificam um programa ("Inovação Aberta" começa por "inovação").
const PRIMEIRAS_PALAVRAS_GENERICAS = new Set(['inovacao', 'programa']);

let catalogo = { programas: [], editais: [] };

/** Programas e editais do grafo, carregados pelo painel ao abrir (consulta CONSULTA_CATALOGO). */
export function definirCatalogo(programas, editais) {
  catalogo = { programas, editais };
}

export const CONSULTA_CATALOGO = `${PREFIXO}
SELECT ?programa ?estagio ?ordem ?edital ?titulo ?publicacao
WHERE {
  ?prog facepe:nm_programa_cti ?programa .
  OPTIONAL { ?prog facepe:pertence_ao_estagio ?e . ?e facepe:nm_estagio ?estagio .
             OPTIONAL { ?e facepe:nr_ordem_estagio ?ordem } }
  OPTIONAL { ?ed facepe:vinculado_a_programa ?prog ; facepe:id_edital ?edital .
             OPTIONAL { ?ed facepe:nm_edital ?titulo } OPTIONAL { ?ed facepe:dt_publicacao ?publicacao } }
}`;

export const CONSULTA_NUMEROS = `${PREFIXO}
SELECT (COUNT(DISTINCT ?prog) AS ?programas) (COUNT(DISTINCT ?ed) AS ?editais)
       (COUNT(DISTINCT ?proj) AS ?projetos) (COUNT(DISTINCT ?bolsa) AS ?bolsas)
       (COUNT(DISTINCT ?emp) AS ?empresas) (COUNT(DISTINCT ?id) AS ?pessoas)
WHERE {
  { ?prog a facepe:Programa_CTI } UNION { ?ed a facepe:Edital } UNION { ?proj a facepe:Projeto }
  UNION { ?bolsa a facepe:Bolsa } UNION { ?emp a facepe:Empresa } UNION { ?x facepe:id_pessoa ?id }
}`;

// O modelo da ontologia (aba "Como funciona"), lido do próprio grafo: o vocabulário (TBox) vira
// classes e propriedades OWL junto com os dados, e também pode ser consultado em SPARQL.
const PREFIXO_OWL = `${PREFIXO}
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>`;

/** Classes da ontologia, a classe-mãe e quantos indivíduos há de cada uma (com as inferências). */
export const CONSULTA_MODELO_CLASSES = `${PREFIXO_OWL}
SELECT ?classe ?superclasse (COUNT(DISTINCT ?individuo) AS ?individuos)
WHERE {
  ?c a owl:Class .
  FILTER(STRSTARTS(STR(?c), STR(facepe:)))
  OPTIONAL { ?c rdfs:subClassOf ?s . FILTER(?s != ?c && STRSTARTS(STR(?s), STR(facepe:))) }
  OPTIONAL { ?individuo a ?c }
  BIND(STRAFTER(STR(?c), "#") AS ?classe)
  BIND(STRAFTER(STR(?s), "#") AS ?superclasse)
}
GROUP BY ?classe ?superclasse
ORDER BY ?classe`;

/** Relações entre as classes: origem (domínio), relação e destino (imagem). */
export const CONSULTA_MODELO_RELACOES = `${PREFIXO_OWL}
SELECT ?origem ?relacao ?destino
WHERE {
  ?p a owl:ObjectProperty ; rdfs:domain ?d ; rdfs:range ?r .
  FILTER(STRSTARTS(STR(?p), STR(facepe:)))
  BIND(STRAFTER(STR(?d), "#") AS ?origem)
  BIND(STRAFTER(STR(?p), "#") AS ?relacao)
  BIND(STRAFTER(STR(?r), "#") AS ?destino)
}
ORDER BY ?origem ?relacao`;

/** Propriedades de valor (nome, data, valor, código...) de cada classe e quantos valores cada
 *  uma tem na base: as que têm zero estão no vocabulário, mas nenhum dado as preenche. */
export const CONSULTA_MODELO_PROPRIEDADES = `${PREFIXO_OWL}
SELECT ?classe ?propriedade (COUNT(?valor) AS ?valores)
WHERE {
  ?p a owl:DatatypeProperty ; rdfs:domain ?d .
  FILTER(STRSTARTS(STR(?p), STR(facepe:)))
  OPTIONAL { ?individuo ?p ?valor }
  BIND(STRAFTER(STR(?d), "#") AS ?classe)
  BIND(STRAFTER(STR(?p), "#") AS ?propriedade)
}
GROUP BY ?classe ?propriedade
ORDER BY ?classe ?propriedade`;

/**
 * Exemplos de consulta SPARQL para o editor da aba Perguntar: perguntas que nenhum gráfico
 * responde, escritas direto sobre a ontologia. Usam só programas, editais e o calendário, então
 * funcionam também na versão online (sobre a parte pública do grafo).
 */
export const EXEMPLOS_SPARQL = [
  {
    titulo: 'Editais lançados por ano em cada estágio',
    consulta: `${PREFIXO}
# Quantos editais de cada estágio da esteira foram lançados em cada ano
SELECT ?estagio ?ano (COUNT(?edital) AS ?editais)
WHERE {
  ?edital facepe:dt_lancamento ?lancamento ;
          facepe:vinculado_a_programa/facepe:pertence_ao_estagio ?e .
  ?e facepe:nm_estagio ?estagio ;
     facepe:nr_ordem_estagio ?ordem .
  BIND (SUBSTR(STR(?lancamento), 1, 4) AS ?ano)
}
GROUP BY ?ordem ?estagio ?ano
ORDER BY ?ordem ?ano`,
  },
  {
    titulo: 'Editais lançados em 2025, em ordem',
    consulta: `${PREFIXO}
# Os editais da esteira lançados em 2025, com o programa e o fim da submissão
SELECT ?lancamento ?programa ?edital ?fimSubmissao
WHERE {
  ?ed facepe:id_edital ?edital ;
      facepe:dt_lancamento ?lancamento ;
      facepe:vinculado_a_programa/facepe:nm_programa_cti ?programa .
  OPTIONAL { ?ed facepe:dt_fim_submissao ?fimSubmissao }
  FILTER (STRSTARTS(STR(?lancamento), "2025"))
}
ORDER BY ?lancamento`,
  },
  {
    titulo: 'Tudo o que a base registra sobre um edital',
    consulta: `${PREFIXO}
# Todas as propriedades do edital 23/2024 (Tecnova III): troque o número para ver outro
SELECT ?propriedade ?valor
WHERE {
  ?ed facepe:id_edital "23/2024" ;
      ?p ?valor .
  FILTER (STRSTARTS(STR(?p), STR(facepe:)))
  BIND (STRAFTER(STR(?p), "#") AS ?propriedade)
}
ORDER BY ?propriedade`,
  },
  {
    titulo: 'Programas fora da esteira',
    consulta: `${PREFIXO}
# Programas da base que não estão nas três colunas do pôster (sem ordem de estágio)
SELECT ?programa (COUNT(?ed) AS ?editais)
WHERE {
  ?prog facepe:nm_programa_cti ?programa .
  FILTER NOT EXISTS { ?prog facepe:pertence_ao_estagio/facepe:nr_ordem_estagio ?ordem }
  OPTIONAL { ?ed facepe:vinculado_a_programa ?prog }
}
GROUP BY ?programa
ORDER BY DESC(?editais) ?programa`,
  },
  {
    titulo: 'As relações do modelo',
    consulta: CONSULTA_MODELO_RELACOES,
  },
];

/** As consultas que o painel faz ao abrir; a versão online leva as respostas prontas. */
export function consultasFixas() {
  return [CONSULTA_CATALOGO, CONSULTA_NUMEROS, consultaCalendario(), CONSULTA_MODELO_CLASSES,
    CONSULTA_MODELO_RELACOES, CONSULTA_MODELO_PROPRIEDADES];
}

/** Minúsculas, sem acento e só letras, números e barra (para comparar textos). */
export function normalizar(texto) {
  return ` ${String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9/]+/g, ' ').trim()} `;
}

function contem(qn, termo) {
  return qn.includes(` ${termo.trim()} `);
}

function algum(qn, termos) {
  return termos.some(t => qn.includes(t));
}

/** Texto literal SPARQL seguro. */
function literal(texto) {
  return `"${String(texto).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/** Expressão regular que ignora acentos e pontuação ("pro startups" casa com "Pró-Startups"). */
export function regexSemAcento(termo) {
  const classes = { a: '[aáàâã]', e: '[eéê]', i: '[ií]', o: '[oóôõ]', u: '[uúü]', c: '[cç]' };
  return normalizar(termo).trim().split(' ')
    .map(p => [...p].map(ch => classes[ch] || (/[a-z0-9]/.test(ch) ? ch : '.')).join(''))
    .join('.{0,2}');
}

// ── Campos ───────────────────────────────────────────────────────────────────────

export function acharEdital(q) {
  const qn = normalizar(q);
  for (const [nome, id] of EDICOES) {
    if (contem(qn, nome)) return id;
  }
  const m = q.match(/\b(\d{1,2})\s*\/\s*(\d{4})\b/);
  if (!m) return null;
  const id = `${m[1].padStart(2, '0')}/${m[2]}`;
  return catalogo.editais.some(e => e.edital === id) ? id : null;
}

/** Programas citados: o nome inteiro; sem ele, a primeira palavra (pode trazer vários). */
export function acharProgramas(q) {
  const qn = normalizar(q);
  const nomes = catalogo.programas.map(p => p.programa);
  const inteiros = nomes.filter(n => contem(qn, normalizar(n)));
  if (inteiros.length) {
    // "Tecnova" e "Pró-Startups Operação" citados: fica o nome mais longo que contém os outros.
    return inteiros.filter(n => !inteiros.some(o => o !== n && normalizar(o).includes(normalizar(n).trim())));
  }
  const prefixo = n => {
    const palavras = normalizar(n).trim().split(' ');
    if (palavras.length === 1) return palavras[0];
    return PRIMEIRAS_PALAVRAS_GENERICAS.has(palavras[0]) || palavras[0].length < 5
      ? palavras.slice(0, 2).join(' ') : palavras[0];
  };
  return nomes.filter(n => contem(qn, prefixo(n)));
}

/** Estágios na ordem em que aparecem na pergunta, sem contar os nomes de programa. */
export function acharEstagios(q, programas = []) {
  let qn = normalizar(q);
  for (const p of programas) qn = qn.replace(normalizar(p).trim(), ' ');
  return ESTAGIOS
    .map(e => ({ ...e, posicao: qn.indexOf(e.chave) }))
    .filter(e => e.posicao >= 0)
    .sort((a, b) => a.posicao - b.posicao);
}

function acharAno(q) {
  const m = q.replace(/\d{1,2}\s*\/\s*\d{4}/g, ' ').match(/\b(20\d{2}|19\d{2})\b/);
  return m ? m[1] : null;
}

function acharEntidades(qn) {
  const empresa = algum(qn, [' empresa']);
  // "quem" vale para empresa e pessoa; só "pessoa", "coordenador" etc. restringem.
  const pessoa = algum(qn, [' pessoa', ' coordenador', ' bolsista', ' beneficiari']);
  if (empresa && !pessoa) return ['empresa'];
  if (pessoa && !empresa) return ['pessoa'];
  return ['empresa', 'pessoa'];
}

/** Edital pela pergunta: número, edição conhecida ou programa + ano (se o ano tiver um só edital). */
function editalDaPergunta(q, programas) {
  const id = acharEdital(q);
  if (id) return id;
  const ano = acharAno(q);
  if (ano && programas.length) {
    const doAno = catalogo.editais.filter(e => programas.includes(e.programa) && e.edital.endsWith(`/${ano}`));
    if (doAno.length === 1) return doAno[0].edital;
  }
  return null;
}

const MESES = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro',
  'novembro', 'dezembro'];

/** Período citado na pergunta: um mês ("março de 2025", "03/2025", "2025-03") ou um ano. */
export function acharPeriodo(q) {
  const qn = normalizar(q);
  const ultimoDia = (ano, mes) => new Date(Number(ano), Number(mes), 0).getDate();
  const mes = (ano, m) => ({
    inicio: `${ano}-${String(m).padStart(2, '0')}-01`,
    fim: `${ano}-${String(m).padStart(2, '0')}-${ultimoDia(ano, m)}`,
    rotulo: `${MESES[m - 1].replace('marco', 'março')} de ${ano}`,
  });
  let m = qn.match(new RegExp(` (${MESES.join('|')})( de)? (\\d{4}) `));
  if (m) return mes(m[3], MESES.indexOf(m[1]) + 1);
  m = q.match(/\b(\d{4})-(\d{1,2})\b/);
  if (m && Number(m[2]) <= 12) return mes(m[1], Number(m[2]));
  m = q.match(/\b(\d{1,2})\s*\/\s*(\d{4})\b/);
  if (m && Number(m[1]) >= 1 && Number(m[1]) <= 12) return mes(m[2], Number(m[1]));
  m = q.match(/\b(20\d{2})\b/);
  return m ? { inicio: `${m[1]}-01-01`, fim: `${m[1]}-12-31`, rotulo: m[1] } : null;
}

/** Filtro das perguntas de calendário e desfecho: um edital, programas, um estágio ou toda a esteira. */
function filtroEsteira(q) {
  const edital = acharEdital(q);
  if (edital) return { edital };
  const programas = acharProgramas(q);
  if (programas.length) return { programas };
  const estagios = acharEstagios(q);
  if (estagios.length === 1) return { ordem: estagios[0].ordem, estagio: estagios[0].nome };
  return {};
}

function clausulaFiltro(c) {
  if (c.edital) return `FILTER (?edital = ${literal(c.edital)})`;
  if (c.programas) return `FILTER (?programa IN (${c.programas.map(literal).join(', ')}))`;
  if (c.ordem) return `FILTER (?ordem = ${Number(c.ordem)})`;
  return '';
}

/** Calendário dos editais da esteira (a aba Calendário e as perguntas de calendário). */
export function consultaCalendario(filtro = {}) {
  return `${PREFIXO}
# Calendário dos editais da esteira: a primeira janela de entrada de cada edital
SELECT ?programa ?estagio ?ordem ?edital ?lancamento ?fimSubmissao ?fimSubmissaoOriginal
       ?resultadoPrevisto ?resultadoPublicado ?estrutura ?alteracoes
WHERE {
  ?ed facepe:id_edital ?edital ;
      facepe:vinculado_a_programa ?prog .
  ?prog facepe:nm_programa_cti ?programa ;
        facepe:pertence_ao_estagio ?e .
  ?e facepe:nm_estagio ?estagio ; facepe:nr_ordem_estagio ?ordem .
  OPTIONAL { ?ed facepe:dt_lancamento ?lancamento }
  OPTIONAL { ?ed facepe:dt_fim_submissao ?fimSubmissao }
  OPTIONAL { ?ed facepe:dt_fim_submissao_original ?fimSubmissaoOriginal }
  OPTIONAL { ?ed facepe:dt_resultado_previsto ?resultadoPrevisto }
  OPTIONAL { ?ed facepe:dt_resultado_publicado ?resultadoPublicado }
  OPTIONAL { ?ed facepe:ds_estrutura_selecao ?estrutura }
  OPTIONAL { ?ed facepe:nr_alteracoes_cronograma ?alteracoes }
  ${clausulaFiltro(filtro)}
}
ORDER BY ?ordem ?programa ?lancamento`;
}

/** Editais dos programas citados, para o painel oferecer a escolha. */
function editaisDosProgramas(programas) {
  return catalogo.editais.filter(e => programas.includes(e.programa))
    .sort((a, b) => a.edital.slice(-4).localeCompare(b.edital.slice(-4)) || a.edital.localeCompare(b.edital));
}

// ── Consultas-modelo ────────────────────────────────────────────────────────────

const C = {
  abertosEm: (inicio, fim) => `${PREFIXO}
# Editais da esteira com a primeira janela de submissão aberta no período
# (lançamento até o fim do período e fim da submissão depois do início)
SELECT ?programa ?estagio ?edital ?lancamento ?fimSubmissao ?fimSubmissaoOriginal ?estrutura
WHERE {
  ?ed facepe:id_edital ?edital ;
      facepe:dt_lancamento ?lancamento ;
      facepe:dt_fim_submissao ?fimSubmissao ;
      facepe:vinculado_a_programa ?prog .
  ?prog facepe:nm_programa_cti ?programa ;
        facepe:pertence_ao_estagio ?e .
  ?e facepe:nm_estagio ?estagio ; facepe:nr_ordem_estagio ?ordem .
  OPTIONAL { ?ed facepe:dt_fim_submissao_original ?fimSubmissaoOriginal }
  OPTIONAL { ?ed facepe:ds_estrutura_selecao ?estrutura }
  FILTER (?lancamento <= ${literal(fim)} && ?fimSubmissao >= ${literal(inicio)})
}
ORDER BY ?ordem ?lancamento`,

  alteracoes: () => `${PREFIXO}
# Editais da esteira com o cronograma alterado: prazo de submissão prorrogado ou algum
# documento de alteração (retificação, prorrogação, novo cronograma)
SELECT ?programa ?edital ?fimSubmissaoOriginal ?fimSubmissao ?alteracoes ?resultadoPrevisto ?resultadoPublicado
WHERE {
  ?ed facepe:id_edital ?edital ;
      facepe:vinculado_a_programa ?prog .
  ?prog facepe:nm_programa_cti ?programa ;
        facepe:pertence_ao_estagio/facepe:nr_ordem_estagio ?ordem .
  OPTIONAL { ?ed facepe:dt_fim_submissao_original ?fimSubmissaoOriginal }
  OPTIONAL { ?ed facepe:dt_fim_submissao ?fimSubmissao }
  OPTIONAL { ?ed facepe:nr_alteracoes_cronograma ?alteracoes }
  OPTIONAL { ?ed facepe:dt_resultado_previsto ?resultadoPrevisto }
  OPTIONAL { ?ed facepe:dt_resultado_publicado ?resultadoPublicado }
  FILTER (BOUND(?fimSubmissaoOriginal) || (BOUND(?alteracoes) && ?alteracoes > 0))
}
ORDER BY DESC(?alteracoes) ?programa ?edital`,

  desfecho: filtro => `${PREFIXO}
# Desfecho dos processos da esteira, por programa e tipo. Só os processos do extrato do
# AgilFAP têm vigência, cancelamento e relatório final; os demais ficam como "não observado".
# Data do extrato: 28/09/2026.
SELECT ?programa ?tipo (COUNT(?p) AS ?processos)
       (SUM(IF(!BOUND(?canc) && BOUND(?fim) && ?fim <= "2026-09-28" && BOUND(?rel), 1, 0)) AS ?concluidos)
       (SUM(IF(!BOUND(?canc) && BOUND(?fim) && ?fim <= "2026-09-28" && !BOUND(?rel), 1, 0)) AS ?semRelatorio)
       (SUM(IF(BOUND(?canc), 1, 0)) AS ?cancelados)
       (SUM(IF(!BOUND(?canc) && BOUND(?fim) && ?fim > "2026-09-28", 1, 0)) AS ?emAndamento)
       (SUM(IF(!BOUND(?canc) && !BOUND(?fim), 1, 0)) AS ?naoObservado)
WHERE {
  { ?p a facepe:Projeto ; facepe:submetido_a ?ed . BIND ("Projeto" AS ?tipo) }
  UNION { ?p a facepe:Bolsa ; facepe:concedida_em ?ed . BIND ("Bolsa" AS ?tipo) }
  ?ed facepe:id_edital ?edital ;
      facepe:vinculado_a_programa ?prog .
  ?prog facepe:nm_programa_cti ?programa ;
        facepe:pertence_ao_estagio/facepe:nr_ordem_estagio ?ordem .
  OPTIONAL { ?p facepe:dt_fim ?fim }
  OPTIONAL { ?p facepe:dt_cancelamento ?canc }
  OPTIONAL { ?p facepe:dt_relatorio_final ?rel }
  ${clausulaFiltro(filtro)}
}
GROUP BY ?programa ?tipo
ORDER BY ?programa ?tipo`,

  projetosDoEdital: edital => `${PREFIXO}
# Projetos do edital, com a empresa executora e o coordenador
SELECT ?projetoInd ?projeto ?inicio ?empresa ?nomeEmpresa ?coordenador ?nomeCoordenador ?titulo
WHERE {
  ?ed facepe:id_edital ${literal(edital)} .
  ?projetoInd facepe:submetido_a ?ed ;
      facepe:id_projeto ?projeto .
  OPTIONAL { ?projetoInd facepe:dt_referencia ?inicio }
  OPTIONAL { ?projetoInd facepe:nm_titulo_projeto ?titulo }
  OPTIONAL { ?projetoInd facepe:executado_por ?e .
             ?e facepe:id_organizacao ?empresa ; facepe:nm_organizacao ?nomeEmpresa }
  OPTIONAL { ?c facepe:coordena ?projetoInd ;
                facepe:id_pessoa ?coordenador ; facepe:nm_pessoa ?nomeCoordenador }
}`,

  trajetoriaDoEdital: edital => `${PREFIXO}
# Cada outro processo da empresa executora e do coordenador de cada projeto do edital,
# com programa, estágio, edital e data (antes e depois do edital)
SELECT DISTINCT ?projetoInd ?via ?papel ?mesmaEmpresa ?comEmpresa
       ?programa ?estagio ?ordem ?edital ?data
WHERE {
  ?ed facepe:id_edital ${literal(edital)} .
  ?projetoInd facepe:submetido_a ?ed .
  {
    ?projetoInd facepe:executado_por ?empresa .
    ?processo facepe:executado_por ?empresa ;
        facepe:submetido_a ?editalInd .
    BIND ("empresa" AS ?via) BIND ("executou projeto" AS ?papel)
    BIND (true AS ?mesmaEmpresa) BIND (true AS ?comEmpresa)
  } UNION {
    ?coord facepe:coordena ?projetoInd ; facepe:id_pessoa ?id .
    ?pessoa facepe:id_pessoa ?id .
    { ?pessoa facepe:coordena ?processo . ?processo facepe:submetido_a ?editalInd .
      BIND ("coordenou projeto" AS ?papel) }
    UNION
    { ?pessoa facepe:recebe ?processo . ?processo facepe:concedida_em ?editalInd .
      BIND ("recebeu bolsa" AS ?papel) }
    OPTIONAL { ?projetoInd facepe:executado_por ?e1 }
    OPTIONAL { ?processo facepe:executado_por ?e2 }
    BIND ("coordenador" AS ?via)
    BIND (BOUND(?e1) && BOUND(?e2) && ?e1 = ?e2 AS ?mesmaEmpresa)
    BIND (BOUND(?e2) AS ?comEmpresa)
  }
  FILTER (?processo != ?projetoInd)
  ?editalInd facepe:id_edital ?edital ;
      facepe:vinculado_a_programa ?programaInd .
  ?programaInd facepe:nm_programa_cti ?programa .
  OPTIONAL { ?programaInd facepe:pertence_ao_estagio ?est . ?est facepe:nm_estagio ?estagio .
             OPTIONAL { ?est facepe:nr_ordem_estagio ?ordem } }
  OPTIONAL { ?processo facepe:dt_referencia ?data }
}`,

  transicao: (entidade, origem, destino) => entidade === 'empresa' ? `${PREFIXO}
# Empresas que executaram projeto num programa do estágio ${origem} e, depois, do estágio ${destino}
SELECT ?id (SAMPLE(?nomeEmpresa) AS ?nome)
       (MIN(?dx) AS ?primeiraOrigem) (MIN(?dy) AS ?primeiraDestino)
       (GROUP_CONCAT(DISTINCT ?px; separator=", ") AS ?programasOrigem)
       (GROUP_CONCAT(DISTINCT ?py; separator=", ") AS ?programasDestino)
WHERE {
  ?x facepe:executado_por ?empresa ; facepe:submetido_a ?ex ; facepe:dt_referencia ?dx .
  ?ex facepe:vinculado_a_programa ?prx .
  ?prx facepe:nm_programa_cti ?px ; facepe:pertence_ao_estagio/facepe:nr_ordem_estagio ${origem} .
  ?y facepe:executado_por ?empresa ; facepe:submetido_a ?ey ; facepe:dt_referencia ?dy .
  ?ey facepe:vinculado_a_programa ?pry .
  ?pry facepe:nm_programa_cti ?py ; facepe:pertence_ao_estagio/facepe:nr_ordem_estagio ${destino} .
  ?empresa facepe:id_organizacao ?id ; facepe:nm_organizacao ?nomeEmpresa .
  FILTER (?dx < ?dy)
}
GROUP BY ?id
ORDER BY ?primeiraDestino ?id` : `${PREFIXO}
# Pessoas que coordenaram projeto ou receberam bolsa num programa do estágio ${origem}
# e, depois, do estágio ${destino}
SELECT ?id (SAMPLE(?nomePessoa) AS ?nome)
       (MIN(?dx) AS ?primeiraOrigem) (MIN(?dy) AS ?primeiraDestino)
       (GROUP_CONCAT(DISTINCT ?px; separator=", ") AS ?programasOrigem)
       (GROUP_CONCAT(DISTINCT ?py; separator=", ") AS ?programasDestino)
WHERE {
  ?a facepe:id_pessoa ?id ; facepe:nm_pessoa ?nomePessoa ;
     facepe:coordena|facepe:recebe ?x .
  ?x facepe:submetido_a|facepe:concedida_em ?ex ; facepe:dt_referencia ?dx .
  ?ex facepe:vinculado_a_programa ?prx .
  ?prx facepe:nm_programa_cti ?px ; facepe:pertence_ao_estagio/facepe:nr_ordem_estagio ${origem} .
  ?b facepe:id_pessoa ?id ;
     facepe:coordena|facepe:recebe ?y .
  ?y facepe:submetido_a|facepe:concedida_em ?ey ; facepe:dt_referencia ?dy .
  ?ey facepe:vinculado_a_programa ?pry .
  ?pry facepe:nm_programa_cti ?py ; facepe:pertence_ao_estagio/facepe:nr_ordem_estagio ${destino} .
  FILTER (?dx < ?dy)
}
GROUP BY ?id
ORDER BY ?primeiraDestino ?id`,

  apoioAnterior: edital => `${PREFIXO}
# Beneficiários do edital (coordenadores e bolsistas) que já tinham sido beneficiários
# de outro edital antes
SELECT ?papel (COUNT(DISTINCT ?id) AS ?beneficiarios)
       (COUNT(DISTINCT ?idAntes) AS ?comApoioAnterior)
WHERE {
  ?ed facepe:id_edital ${literal(edital)} .
  { ?pe facepe:coordena ?proc . ?proc facepe:submetido_a ?ed . BIND ("coordenador" AS ?papel) }
  UNION
  { ?pe facepe:recebe ?proc . ?proc facepe:concedida_em ?ed . BIND ("bolsista" AS ?papel) }
  ?pe facepe:id_pessoa ?id . ?proc facepe:dt_referencia ?d .
  OPTIONAL {
    ?pe2 facepe:id_pessoa ?id ; facepe:coordena|facepe:recebe ?outro .
    ?outro facepe:submetido_a|facepe:concedida_em ?ed2 ; facepe:dt_referencia ?d2 .
    FILTER (?ed2 != ?ed && ?d2 < ?d)
    BIND (?id AS ?idAntes)
  }
}
GROUP BY ?papel
ORDER BY ?papel`,

  empresasMultiplos: () => `${PREFIXO}
# Empresas que executaram projetos em mais de um edital
SELECT ?id (SAMPLE(?nomeEmpresa) AS ?nome) (COUNT(DISTINCT ?ed) AS ?editais)
       (GROUP_CONCAT(DISTINCT CONCAT(?programa, " ", ?edital); separator=" | ") AS ?participacoes)
WHERE {
  ?p facepe:executado_por ?e ; facepe:submetido_a ?ed .
  ?e facepe:id_organizacao ?id ; facepe:nm_organizacao ?nomeEmpresa .
  ?ed facepe:id_edital ?edital ; facepe:vinculado_a_programa/facepe:nm_programa_cti ?programa .
}
GROUP BY ?id
HAVING (COUNT(DISTINCT ?ed) > 1)
ORDER BY DESC(?editais) ?id`,

  coordenadoresMultiplos: () => `${PREFIXO}
# Pessoas que coordenaram projetos em mais de um edital (CoordenadoresEmMultiplosEditais.sparql)
SELECT ?id (SAMPLE(?nomePessoa) AS ?nome) (COUNT(DISTINCT ?editalInd) AS ?editais)
       (GROUP_CONCAT(DISTINCT CONCAT(?programa, " ", ?edital); separator=" | ") AS ?participacoes)
WHERE {
  ?coordenador a facepe:Coordenador ;
      facepe:id_pessoa ?id ;
      facepe:nm_pessoa ?nomePessoa ;
      facepe:coordena ?projeto .
  ?projeto facepe:submetido_a ?editalInd .
  ?editalInd facepe:id_edital ?edital ;
      facepe:vinculado_a_programa/facepe:nm_programa_cti ?programa .
}
GROUP BY ?id
HAVING (COUNT(DISTINCT ?editalInd) > 1)
ORDER BY DESC(?editais) ?id`,

  programasDoEstagio: ordem => `${PREFIXO}
# Programas do estágio e número de editais de cada um
SELECT ?programa (COUNT(DISTINCT ?ed) AS ?editais)
WHERE {
  ?prog facepe:nm_programa_cti ?programa ; facepe:pertence_ao_estagio ?est .
  ${ordem ? `?est facepe:nr_ordem_estagio ${ordem} .`
    : 'FILTER NOT EXISTS { ?est facepe:nr_ordem_estagio ?o }'}
  OPTIONAL { ?ed facepe:vinculado_a_programa ?prog }
}
GROUP BY ?programa
ORDER BY DESC(?editais) ?programa`,

  editaisDoPrograma: programas => `${PREFIXO}
# Editais dos programas, com projetos e bolsas
SELECT ?programa ?edital ?titulo ?publicacao
       (COUNT(DISTINCT ?p) AS ?projetos) (COUNT(DISTINCT ?b) AS ?bolsas)
WHERE {
  VALUES ?programa { ${programas.map(literal).join(' ')} }
  ?prog facepe:nm_programa_cti ?programa .
  ?ed facepe:vinculado_a_programa ?prog ; facepe:id_edital ?edital .
  OPTIONAL { ?ed facepe:nm_edital ?titulo }
  OPTIONAL { ?ed facepe:dt_publicacao ?publicacao }
  OPTIONAL { ?p facepe:submetido_a ?ed }
  OPTIONAL { ?b facepe:concedida_em ?ed }
}
GROUP BY ?programa ?edital ?titulo ?publicacao
ORDER BY ?programa ?edital`,

  numerosPorPrograma: () => `${PREFIXO}
# Editais, projetos, bolsas e empresas de cada programa
SELECT ?estagio ?programa (COUNT(DISTINCT ?ed) AS ?editais) (COUNT(DISTINCT ?p) AS ?projetos)
       (COUNT(DISTINCT ?b) AS ?bolsas) (COUNT(DISTINCT ?emp) AS ?empresas)
WHERE {
  ?prog facepe:nm_programa_cti ?programa .
  OPTIONAL { ?prog facepe:pertence_ao_estagio ?est . ?est facepe:nm_estagio ?estagio .
             OPTIONAL { ?est facepe:nr_ordem_estagio ?ordem } }
  OPTIONAL {
    ?ed facepe:vinculado_a_programa ?prog .
    OPTIONAL { ?p facepe:submetido_a ?ed . OPTIONAL { ?p facepe:executado_por ?emp } }
    OPTIONAL { ?b facepe:concedida_em ?ed }
  }
}
GROUP BY ?ordem ?estagio ?programa
ORDER BY ?ordem ?estagio DESC(?projetos) ?programa`,

  resumoDoEdital: edital => `${PREFIXO}
# Resumo do edital: programa, estágio e quantos projetos, empresas, coordenadores e bolsas
SELECT ?edital ?programa ?estagio ?titulo ?publicacao
       (COUNT(DISTINCT ?p) AS ?projetos) (COUNT(DISTINCT ?emp) AS ?empresas)
       (COUNT(DISTINCT ?coord) AS ?coordenadores) (COUNT(DISTINCT ?b) AS ?bolsas)
WHERE {
  ?ed facepe:id_edital ${literal(edital)} ; facepe:id_edital ?edital ;
      facepe:vinculado_a_programa ?prog .
  ?prog facepe:nm_programa_cti ?programa .
  OPTIONAL { ?prog facepe:pertence_ao_estagio/facepe:nm_estagio ?estagio }
  OPTIONAL { ?ed facepe:nm_edital ?titulo }
  OPTIONAL { ?ed facepe:dt_publicacao ?publicacao }
  OPTIONAL { ?p facepe:submetido_a ?ed .
             OPTIONAL { ?p facepe:executado_por ?emp }
             OPTIONAL { ?c facepe:coordena ?p ; facepe:id_pessoa ?coord } }
  OPTIONAL { ?b facepe:concedida_em ?ed }
}
GROUP BY ?edital ?programa ?estagio ?titulo ?publicacao`,

  busca: termo => `${PREFIXO}
# Programas, editais e empresas cujo nome contém o termo (sem diferenciar acentos)
SELECT ?tipo ?id ?nome
WHERE {
  { ?x facepe:nm_programa_cti ?nome . BIND ("programa" AS ?tipo)
    OPTIONAL { ?x facepe:pertence_ao_estagio/facepe:nm_estagio ?id } }
  UNION
  { ?x facepe:nm_edital ?nome ; facepe:id_edital ?id . BIND ("edital" AS ?tipo) }
  UNION
  { ?x facepe:nm_organizacao ?nome ; facepe:id_organizacao ?id . BIND ("empresa" AS ?tipo) }
  FILTER (REGEX(?nome, ${literal(regexSemAcento(termo))}, "i"))
}
ORDER BY ?tipo ?nome
LIMIT 100`,
};

// ── Colunas (rótulos; "sensivel" some quando os nomes estão ocultos) ─────────────

const COLUNAS_TRANSICAO = [
  { v: 'id', rotulo: 'Identificador' }, { v: 'nome', rotulo: 'Nome', sensivel: true },
  { v: 'primeiraOrigem', rotulo: 'Primeira vez no estágio de origem' },
  { v: 'primeiraDestino', rotulo: 'Primeira vez no estágio de destino' },
  { v: 'programasOrigem', rotulo: 'Programas de origem' }, { v: 'programasDestino', rotulo: 'Programas de destino' },
];
const COLUNAS_MULTIPLOS = [
  { v: 'id', rotulo: 'Identificador' }, { v: 'nome', rotulo: 'Nome', sensivel: true },
  { v: 'editais', rotulo: 'Editais' }, { v: 'participacoes', rotulo: 'Programa e edital' },
];

// ── Perguntas ───────────────────────────────────────────────────────────────────

const PALAVRAS_TRAJETORIA = ['esteira', 'trajetoria', 'trilha', 'passaram', 'passou', 'percurso', 'caminho',
  'antes', 'depois', 'historico'];
const PALAVRAS_MULTIPLOS = ['mais de um', 'mais de uma', 'varios', 'multiplos', 'recorrent', 'repetid',
  'mais vezes'];

export const PERGUNTAS = [
  {
    id: 'resumo-edital',
    titulo: 'Resumo de um edital',
    exemplos: ['resumo do edital 23/2024'],
    reconhecer(q, qn) {
      if (!algum(qn, ['resumo', 'sobre o edital', 'dados do edital', 'o que tem', 'numeros do edital'])) return null;
      const edital = editalDaPergunta(q, acharProgramas(q));
      return edital ? { edital } : null;
    },
    consultas: c => [C.resumoDoEdital(c.edital)],
    colunas: [
      { v: 'edital', rotulo: 'Edital' }, { v: 'programa', rotulo: 'Programa' }, { v: 'estagio', rotulo: 'Estágio' },
      { v: 'titulo', rotulo: 'Título' }, { v: 'publicacao', rotulo: 'Publicação' },
      { v: 'projetos', rotulo: 'Projetos' }, { v: 'empresas', rotulo: 'Empresas' },
      { v: 'coordenadores', rotulo: 'Coordenadores' }, { v: 'bolsas', rotulo: 'Bolsas' },
    ],
  },
  {
    id: 'apoio-anterior-edital',
    titulo: 'Beneficiários de um edital com apoio anterior',
    exemplos: ['quantos beneficiários do edital 26/2024 já tinham sido apoiados antes?'],
    reconhecer(q, qn) {
      if (!algum(qn, ['apoiad', 'apoio anterior', 'beneficiari'])) return null;
      const edital = editalDaPergunta(q, acharProgramas(q));
      return edital ? { edital } : null;
    },
    consultas: c => [C.apoioAnterior(c.edital)],
    colunas: [
      { v: 'papel', rotulo: 'Papel no edital' }, { v: 'beneficiarios', rotulo: 'Beneficiários' },
      { v: 'comApoioAnterior', rotulo: 'Com apoio anterior' },
    ],
  },
  // Calendário e desfecho (19/11/2026): antes da trajetória, que casa com qualquer texto que
  // cite um edital; estas exigem palavras próprias.
  {
    id: 'editais-abertos-em',
    publica: true, // só programas, editais e calendário: funciona na versão online
    titulo: 'Editais com inscrição aberta num período',
    exemplos: ['quais editais estavam abertos em março de 2025?'],
    reconhecer(q, qn) {
      if (!algum(qn, [' aberto', ' aberta', ' inscricao aberta', ' inscricoes abertas'])) return null;
      const periodo = acharPeriodo(q);
      return periodo ? { periodo } : null;
    },
    consultas: c => [C.abertosEm(c.periodo.inicio, c.periodo.fim)],
    rotulos: c => [`Janelas de submissão abertas em ${c.periodo.rotulo}`],
    colunas: [
      { v: 'programa', rotulo: 'Programa' }, { v: 'estagio', rotulo: 'Estágio' }, { v: 'edital', rotulo: 'Edital' },
      { v: 'lancamento', rotulo: 'Lançamento' }, { v: 'fimSubmissao', rotulo: 'Fim da submissão' },
      { v: 'fimSubmissaoOriginal', rotulo: 'Prazo original' }, { v: 'estrutura', rotulo: 'Estrutura' },
    ],
  },
  {
    id: 'editais-prorrogados',
    publica: true, // só programas, editais e calendário: funciona na versão online
    titulo: 'Editais com o cronograma alterado',
    exemplos: ['quais editais foram prorrogados?'],
    reconhecer(q, qn) {
      return algum(qn, ['prorroga', 'adiad', 'cronograma alterado', 'cronogramas alterados', 'mudaram o cronograma',
        'alteracoes do cronograma', 'alteracao do cronograma', 'retifica']) ? {} : null;
    },
    consultas: () => [C.alteracoes()],
    colunas: [
      { v: 'programa', rotulo: 'Programa' }, { v: 'edital', rotulo: 'Edital' },
      { v: 'fimSubmissaoOriginal', rotulo: 'Prazo original' }, { v: 'fimSubmissao', rotulo: 'Prazo final' },
      { v: 'alteracoes', rotulo: 'Documentos de alteração' }, { v: 'resultadoPrevisto', rotulo: 'Resultado previsto' },
      { v: 'resultadoPublicado', rotulo: 'Resultado publicado' },
    ],
  },
  {
    id: 'calendario',
    publica: true, // só programas, editais e calendário: funciona na versão online
    titulo: 'Calendário dos editais',
    exemplos: ['calendário do Centelha', 'quando abriram os editais de Aceleração?'],
    reconhecer(q, qn) {
      if (!algum(qn, ['calendario', 'cronograma', 'quando abr', 'quando abriu', 'quando foi lancad', 'lancamento d',
        'janela', 'prazo de submissao', 'prazos de submissao', 'datas d'])) return null;
      return filtroEsteira(q);
    },
    consultas: c => [consultaCalendario(c)],
    colunas: [
      { v: 'programa', rotulo: 'Programa' }, { v: 'edital', rotulo: 'Edital' }, { v: 'lancamento', rotulo: 'Lançamento' },
      { v: 'fimSubmissao', rotulo: 'Fim da submissão' }, { v: 'fimSubmissaoOriginal', rotulo: 'Prazo original' },
      { v: 'resultadoPrevisto', rotulo: 'Resultado previsto' }, { v: 'resultadoPublicado', rotulo: 'Resultado publicado' },
      { v: 'estrutura', rotulo: 'Estrutura' }, { v: 'alteracoes', rotulo: 'Alterações' },
    ],
  },
  {
    id: 'desfecho',
    titulo: 'Desfecho dos processos (concluídos, cancelados, em andamento)',
    exemplos: ['quantos processos do Centelha foram cancelados?', 'desfecho dos processos de Operação'],
    reconhecer(q, qn) {
      if (!algum(qn, ['desfecho', 'cancelad', 'cancelament', 'concluid', 'concluir', 'relatorio final', 'desist',
        'em andamento'])) return null;
      return filtroEsteira(q);
    },
    consultas: c => [C.desfecho(c)],
    colunas: [
      { v: 'programa', rotulo: 'Programa' }, { v: 'tipo', rotulo: 'Tipo' }, { v: 'processos', rotulo: 'Processos' },
      { v: 'concluidos', rotulo: 'Concluídos (com relatório final)' }, { v: 'semRelatorio', rotulo: 'Encerrados sem relatório' },
      { v: 'cancelados', rotulo: 'Cancelados' }, { v: 'emAndamento', rotulo: 'Em andamento' },
      { v: 'naoObservado', rotulo: 'Sem data de fim (quase todos só nos PDFs)' },
    ],
  },
  {
    id: 'trajetoria-edital',
    titulo: 'Os projetos de um edital passaram antes pela esteira?',
    exemplos: ['os projetos do Tecnova III passaram antes pela esteira?', 'trajetória do edital 28/2021'],
    reconhecer(q, qn) {
      const programas = acharProgramas(q);
      const edital = editalDaPergunta(q, programas);
      if (edital) return { edital };
      // Programa sem edital: o painel oferece os editais para escolher.
      if (programas.length && algum(qn, PALAVRAS_TRAJETORIA)) {
        return { escolherEdital: editaisDosProgramas(programas), modelo: 'trajetória do edital ' };
      }
      return null;
    },
    consultas: c => [C.projetosDoEdital(c.edital), C.trajetoriaDoEdital(c.edital)],
    apresentacao: 'trajetoria',
  },
  {
    id: 'transicao-estagios',
    titulo: 'Quem passou de um estágio para o seguinte',
    exemplos: ['quem passou da Operação para a Aceleração?', 'pessoas que passaram da Ideação para a Operação'],
    reconhecer(q, qn) {
      const estagios = acharEstagios(q, acharProgramas(q));
      const verbo = algum(qn, ['passou', 'passaram', 'chegou', 'chegaram', 'vieram', 'veio', 'transic', ' para a ',
        ' para o ', ' ate ']);
      if (estagios.length >= 2 && verbo) {
        return { origem: estagios[0], destino: estagios[1], entidades: acharEntidades(qn) };
      }
      if (estagios.length === 1 && estagios[0].ordem > 1 && algum(qn, ['passou', 'passaram', 'chegou', 'chegaram', 'vieram'])) {
        const destino = estagios[0];
        return { origem: ESTAGIOS[destino.ordem - 2], destino, entidades: acharEntidades(qn), origemPresumida: true };
      }
      return null;
    },
    consultas: c => c.entidades.map(e => C.transicao(e, c.origem.ordem, c.destino.ordem)),
    rotulos: c => c.entidades.map(e => `${e === 'empresa' ? 'Empresas' : 'Pessoas'}: ${c.origem.nome} → ${c.destino.nome}`),
    colunas: COLUNAS_TRANSICAO,
  },
  {
    id: 'programas-do-estagio',
    publica: true, // só programas, editais e calendário: funciona na versão online
    titulo: 'Programas de um estágio',
    exemplos: ['quais programas são de Operação?'],
    reconhecer(q, qn) {
      if (!algum(qn, ['programa'])) return null;
      if (contem(qn, 'a classificar')) return { ordem: null, estagio: 'A classificar' };
      const estagios = acharEstagios(q, acharProgramas(q));
      return estagios.length === 1 ? { ordem: estagios[0].ordem, estagio: estagios[0].nome } : null;
    },
    consultas: c => [C.programasDoEstagio(c.ordem)],
    colunas: [{ v: 'programa', rotulo: 'Programa' }, { v: 'editais', rotulo: 'Editais no grafo' }],
  },
  {
    id: 'editais-do-programa',
    titulo: 'Editais de um programa',
    exemplos: ['editais do Centelha', 'quais editais teve o Pró-Startups?'],
    reconhecer(q, qn) {
      if (!algum(qn, ['edita'])) return null;
      const programas = acharProgramas(q);
      return programas.length ? { programas } : null;
    },
    consultas: c => [C.editaisDoPrograma(c.programas)],
    colunas: [
      { v: 'programa', rotulo: 'Programa' }, { v: 'edital', rotulo: 'Edital' }, { v: 'titulo', rotulo: 'Título' },
      { v: 'publicacao', rotulo: 'Publicação' }, { v: 'projetos', rotulo: 'Projetos' }, { v: 'bolsas', rotulo: 'Bolsas' },
    ],
  },
  {
    id: 'empresas-multiplos-editais',
    titulo: 'Empresas apoiadas em mais de um edital',
    exemplos: ['empresas apoiadas em mais de um edital'],
    reconhecer(q, qn) {
      return algum(qn, [' empresa']) && algum(qn, PALAVRAS_MULTIPLOS) ? {} : null;
    },
    consultas: () => [C.empresasMultiplos()],
    colunas: COLUNAS_MULTIPLOS,
  },
  {
    id: 'coordenadores-multiplos-editais',
    titulo: 'Quem coordenou projetos em mais de um edital',
    exemplos: ['quem coordenou projetos em mais de um edital?'],
    reconhecer(q, qn) {
      return algum(qn, ['coordena', ' quem ', ' pessoa']) && algum(qn, PALAVRAS_MULTIPLOS) ? {} : null;
    },
    consultas: () => [C.coordenadoresMultiplos()],
    colunas: COLUNAS_MULTIPLOS,
  },
  {
    id: 'numeros-por-programa',
    titulo: 'Números de cada programa',
    exemplos: ['quantos editais, projetos e bolsas tem cada programa?'],
    reconhecer(q, qn) {
      return algum(qn, ['cada programa', 'por programa', 'todos os programas', 'tamanho dos programas',
        'numeros dos programas']) ? {} : null;
    },
    consultas: () => [C.numerosPorPrograma()],
    colunas: [
      { v: 'estagio', rotulo: 'Estágio' }, { v: 'programa', rotulo: 'Programa' }, { v: 'editais', rotulo: 'Editais' },
      { v: 'projetos', rotulo: 'Projetos' }, { v: 'bolsas', rotulo: 'Bolsas' }, { v: 'empresas', rotulo: 'Empresas' },
    ],
  },
  // Reserva: um texto curto que não casou com nada vira busca por nome de programa, edital
  // ou empresa (pessoas ficam de fora da busca por nome).
  {
    id: 'busca',
    titulo: 'Busca por nome de programa, edital ou empresa',
    exemplos: ['Pernambucanas'],
    reconhecer(q, qn) {
      const termo = qn.replace(/ (buscar|procurar|encontrar|achar|empresa|programa|edital|o|a|de|da|do) /g, ' ').trim();
      return termo.length >= 3 && termo.split(' ').length <= 5 ? { termo } : null;
    },
    consultas: c => [C.busca(c.termo)],
    // Nome de programa e de edital é público; o de empresa some com "ocultar nomes".
    colunas: [{ v: 'tipo', rotulo: 'Tipo' }, { v: 'id', rotulo: 'Identificador ou estágio' },
      { v: 'nome', rotulo: 'Nome', sensivel: linha => linha.tipo === 'empresa' }],
  },
];

/** A primeira pergunta prevista que casa com o texto, com os campos preenchidos. */
export function reconhecer(q) {
  const qn = normalizar(q);
  for (const pergunta of PERGUNTAS) {
    const campos = pergunta.reconhecer(q, qn);
    if (campos) return { pergunta, campos };
  }
  return null;
}
