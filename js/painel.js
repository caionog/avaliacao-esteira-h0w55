// painel.js — interface do painel local: introdução, gráficos com análise, hipóteses,
// perguntas e conclusão, em abas com endereço na URL (#inicio, #graficos/<id>, #hipoteses,
// #perguntar, #conclusao).
import { CONSULTA_CATALOGO, CONSULTA_MODELO_CLASSES, CONSULTA_MODELO_PROPRIEDADES, CONSULTA_MODELO_RELACOES, CONSULTA_NUMEROS,
  EXEMPLOS_SPARQL, PERGUNTAS, consultaCalendario, definirCatalogo, reconhecer } from './perguntas.js?v=6b059ef4';
import { ESTAGIOS, antes, depois, estagioDe, matriz, montarTrajetoria, resumir } from './analise.js?v=6b059ef4';
import { ATUALIZADO_EM, CAPITULOS, GRAFICOS, GRUPOS, PERGUNTAS_GESTORES, PROPOSTA } from './conteudo.js?v=6b059ef4';
import { dataBr, descricao, desenhar, lacunasLongas, mesAno, prepararEditais } from './calendario.js?v=6b059ef4';
import { SITE } from './config.js?v=6b059ef4';

const $ = id => document.getElementById(id);
// Na versão online, cada arquivo buscado leva a versão da exportação (?v=...), para o navegador não
// misturar arquivos de exportações diferentes guardados no cache (o GitHub Pages deixa guardar por 10 min).
const versionado = url => (SITE && SITE.versao ? `${url}?v=${SITE.versao}` : url);
// Variáveis que trazem nome de pessoa ou empresa (ou título) na consulta editada à mão.
const VARIAVEIS_SENSIVEIS = /^(nome|nm_|titulo|nomeEmpresa|nomeCoordenador|nomePessoa)/i;
// Rótulos de exibição: o que não é da esteira aparece como "fora da esteira" (regra de
// 19/11/2026); a categoria da ontologia continua se chamando "A classificar".
const NOME_ESTAGIO = { 1: 'Ideação', 2: 'Operação', 3: 'Aceleração', outro: 'Fora da esteira' };
const rotuloEstagio = nome => (nome === 'A classificar' ? 'Fora da esteira' : nome);
// Nomes curtos só para o cabeçalho da matriz (os mesmos do gráfico do estudo de caso).
const ABREVIACAO = {
  'COMPET (Competitividade Territorial)': 'COMPET Territorial', 'Pró-Startups Operação': 'Pró-Startups Op.',
  'Pró-Startups Incubadoras': 'Pró-Startups Incub.', 'Pró-Startups Mulheres que Inovam': 'Pró-Startups Mulheres',
  'Transforma Mulher-PE': 'Transforma Mulher',
};
// Os capítulos (a narrativa, na ordem) e, depois, as abas para explorar.
const ABAS = ['inicio', ...CAPITULOS.map(c => c.id), 'conclusao', 'graficos', 'perguntar', 'pilha'];
// Endereços de abas que saíram em 21/11/2026, para links antigos continuarem funcionando.
const ABAS_ANTIGAS = { achados: 'trilha', hipoteses: 'trilha', calendario: 'interrupcao', resumo: 'inicio' };
// Na versão online, as consultas sem resposta pronta rodam no navegador, no Oxigraph (mesma versão
// do pyoxigraph do pipeline), sobre dados/grafo-publico.ttl: vocabulário, programas e editais.
const OXIGRAPH = 'https://cdn.jsdelivr.net/npm/oxigraph@0.5.13/web.js';
const NOME_ABA = { inicio: 'Início', ...Object.fromEntries(CAPITULOS.map(c => [c.id, c.aba])), conclusao: 'Conclusão',
  graficos: 'Gráficos', perguntar: 'Perguntar', pilha: 'Como funciona' };

const estado = { catalogo: [], disponiveis: new Set(), ultimo: null, grafico: graficosPrincipais()[0], versao: {}, calendario: null,
  meta: null, pilha: false };
// Desde 23/11/2026 os nomes aparecem por padrão nas duas versões (o painel vai para os gestores da
// FACEPE); "Ocultar nomes" mostra as versões anonimizadas. CPF nunca aparece.
const ocultar = () => $('ocultar-nomes').checked;
/** A imagem de uma versão de gráfico: com nomes, salvo se "Ocultar nomes" estiver marcado. */
const arquivoDe = v => (!ocultar() && v.arquivoNomes ? v.arquivoNomes : v.arquivo);

function esc(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function numero(valor) {
  return Number(valor).toLocaleString('pt-BR');
}

function linhasDe(json) {
  return json.results.bindings.map(b => Object.fromEntries(Object.entries(b).map(([k, v]) => [k, v.value])));
}

// Na versão online, as respostas das consultas fixas (catálogo, números, calendário, modelo)
// vêm de dados/consultas.json, gerado por painel/exportar_site.py com o texto exato de cada
// consulta; as outras rodam no navegador, sobre a parte pública do grafo.
let respostasProntas = null;
let grafoPublico = null;

/** Carrega o Oxigraph (WebAssembly) e a parte pública do grafo, uma vez só. */
function carregarGrafoPublico() {
  grafoPublico ??= (async () => {
    let oxigraph;
    try {
      oxigraph = await import(OXIGRAPH);
      await oxigraph.default();
    } catch (erro) {
      grafoPublico = null;
      throw new Error(`não foi possível carregar o Oxigraph do CDN (${erro.message})`);
    }
    const resposta = await fetch(versionado('dados/grafo-publico.ttl'));
    if (!resposta.ok) { grafoPublico = null; throw new Error(`grafo público indisponível (HTTP ${resposta.status})`); }
    const store = new oxigraph.Store();
    store.load(await resposta.text(), { format: 'text/turtle' });
    return store;
  })();
  return grafoPublico;
}

/** Executa uma consulta no servidor local e devolve as linhas como objetos simples. */
async function sparql(consulta) {
  if (SITE) {
    respostasProntas ??= fetch(versionado('dados/consultas.json')).then(r => r.json());
    const pronta = (await respostasProntas)[consulta];
    if (pronta) return { variaveis: pronta.head.vars, linhas: linhasDe(pronta), ms: 0 };
    const store = await carregarGrafoPublico();
    const inicio = performance.now();
    let json;
    try {
      json = JSON.parse(store.query(consulta, { results_format: 'application/sparql-results+json' }));
    } catch (erro) {
      throw new Error(String(erro.message || erro));
    }
    if (!json.results) throw new Error('use uma consulta SELECT');
    return { variaveis: json.head.vars, linhas: linhasDe(json), ms: Math.round(performance.now() - inicio) };
  }
  const resposta = await fetch('/sparql', {
    method: 'POST', headers: { 'Content-Type': 'application/sparql-query' }, body: consulta,
  });
  if (!resposta.ok) throw new Error(await resposta.text());
  const json = await resposta.json();
  return { variaveis: json.head.vars, linhas: linhasDe(json), ms: Number(resposta.headers.get('X-Tempo-Ms') || 0) };
}

// ── Versão online (avaliação) ────────────────────────────────────────────────────

/** Esconde o que é só da versão local e mostra os avisos e o botão de comentário. */
function aplicarModoSite() {
  document.querySelectorAll('[data-so-local]').forEach(e => { e.hidden = true; });
  document.querySelectorAll('[data-so-site]').forEach(e => { e.hidden = false; });
  document.querySelectorAll('[data-site-ate]').forEach(e => { e.textContent = dataBr(SITE.ate); });
  if (!SITE.formulario) document.querySelectorAll('#comentar, [data-com-formulario]').forEach(e => { e.hidden = true; });
}

/** Nome da página aberta, para o formulário de comentário já chegar preenchido. */
function paginaAtual() {
  const [aba] = location.hash.replace(/^#/, '').split('/');
  const atual = ABAS.includes(aba) ? aba : 'inicio';
  if (atual !== 'graficos') return NOME_ABA[atual];
  const g = GRAFICOS.find(x => x.id === estado.grafico) || GRAFICOS[0];
  const versoes = versoesVisiveis(g);
  const versao = versoes.find(v => v.id === estado.versao[g.id]) || versoes[0];
  return `Gráficos › ${g.titulo}${versoes.length > 1 ? ` (${versao.rotulo})` : ''}`;
}

/** Link do formulário: se terminar em "=" (link pré-preenchido do Google Forms), recebe a página. */
function linkComentario() {
  return SITE.formulario.endsWith('=') ? SITE.formulario + encodeURIComponent(paginaAtual()) : SITE.formulario;
}

/** Link "Responder" de uma pergunta para a FACEPE: só na versão online com formulário. O texto
 *  da pergunta vai no campo pré-preenchido do formulário (o mesmo do nome da página). */
function botaoResponder(pergunta) {
  if (!SITE || !SITE.formulario) return '';
  return ` <a class="responder" href="#" target="_blank" rel="noopener" data-responder="${esc(pergunta)}">Responder →</a>`;
}

function linkPergunta(pergunta) {
  const texto = `Pergunta: ${pergunta}`;
  return SITE.formulario.endsWith('=') ? SITE.formulario + encodeURIComponent(texto) : SITE.formulario;
}

/** Versões de um gráfico que podem ser mostradas: online, nunca as com nomes. */
function versoesVisiveis(g) {
  return g.versoes;
}

function mensagem(texto, erro = false) {
  $('estado').textContent = texto;
  $('estado').className = 'estado' + (erro ? ' erro' : '');
}

// ── Abas e rotas ─────────────────────────────────────────────────────────────────

/** Mostra a aba da rota atual (#aba ou #graficos/<id>). */
let abaAberta = null;

function rotear() {
  const [aba, detalhe] = location.hash.replace(/^#/, '').split('/');
  if (ABAS_ANTIGAS[aba]) {
    location.replace(`#${ABAS_ANTIGAS[aba]}`);
    return;
  }
  const atual = ABAS.includes(aba) ? aba : 'inicio';
  for (const nome of ABAS) $(`aba-${nome}`).hidden = nome !== atual;
  document.querySelectorAll('.abas a').forEach(a => {
    if (a.dataset.aba === atual) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  // Ao trocar de aba (por exemplo, no botão "Próximo"), a leitura recomeça do topo.
  if (abaAberta && abaAberta !== atual) window.scrollTo({ top: 0 });
  abaAberta = atual;
  if (atual === 'graficos') {
    if (detalhe && GRAFICOS.some(g => g.id === detalhe)) estado.grafico = detalhe;
    renderListaGraficos();
    renderGrafico();
  }
  if (atual === 'interrupcao') abrirCalendario();
  if (atual === 'pilha') renderPilha();
}

// ── Calendário ───────────────────────────────────────────────────────────────────

async function abrirCalendario() {
  if (!estado.calendario) {
    try {
      estado.calendario = prepararEditais((await sparql(consultaCalendario())).linhas);
      $('consulta-calendario').innerHTML = blocoConsulta({ rotulo: 'a consulta que lê o calendário dos editais',
        texto: consultaCalendario() });
    } catch (erro) {
      $('cal-grafico').innerHTML = `<p class="estado erro">Não foi possível consultar o grafo: ${esc(erro.message)}</p>`;
      return;
    }
  }
  renderCalendario();
}

function renderCalendario() {
  if (!estado.calendario) return;
  const estagios = [...document.querySelectorAll('.cal-estagio-filtro:checked')].map(c => Number(c.value));
  const desde = Number($('cal-desde').value);
  $('cal-grafico').innerHTML = desenhar(estado.calendario, { estagios, desde, previsto: $('cal-previsto').checked });
  const visiveis = estado.calendario.filter(e => estagios.includes(e.ordem) && e.fim >= `${desde}-01-01`);

  // Resumo: as lacunas de 12 meses ou mais de cada estágio no período exibido e as alterações de cronograma.
  const cartoes = estagios.map(ordem => {
    const lacunas = lacunasLongas(estado.calendario.filter(e => e.ordem === ordem), desde);
    const nome = NOME_ESTAGIO[ordem];
    if (!lacunas.length) {
      return `<div class="destaque"><div class="valor">—</div><div class="rotulo">nenhum intervalo de 12 meses ou mais
        sem janela de ${nome} desde ${desde}</div></div>`;
    }
    const juntar = l => (l.length > 1 ? `${l.slice(0, -1).join(', ')} e ${l[l.length - 1]}` : l[0]);
    return `<div class="destaque"><div class="valor">${juntar(lacunas.map(l => l.m))} meses</div><div class="rotulo">sem
      nenhuma janela de ${nome} aberta: ${juntar(lacunas.map(l => `${mesAno(l.a)} a ${mesAno(l.b)}`))}</div></div>`;
  });
  const prorrogados = visiveis.filter(e => e.fimSubmissaoOriginal).length;
  const alterados = visiveis.filter(e => e.alteracoes > 0).length;
  cartoes.push(`<div class="destaque"><div class="valor">${alterados} de ${visiveis.length}</div><div class="rotulo">editais
    exibidos com algum documento que alterou o cronograma (${prorrogados} com a submissão prorrogada, entre os conferidos)</div></div>`);
  $('cal-resumo').innerHTML = cartoes.join('');

  $('cal-tabela').innerHTML = tabelaSimples(
    ['Estágio', 'Programa', 'Edital', 'Lançamento', 'Fim da submissão', 'Prazo original', 'Resultado previsto',
      'Resultado publicado', 'Seleção', 'Alterações'],
    [...visiveis].sort((a, b) => a.lancamento.localeCompare(b.lancamento)).map(e => [
      NOME_ESTAGIO[e.ordem], e.programa, e.edital, dataBr(e.lancamento), dataBr(e.fimSubmissao),
      e.fimSubmissaoOriginal ? dataBr(e.fimSubmissaoOriginal) : '', dataBr(e.resultadoPrevisto),
      dataBr(e.resultadoPublicado), e.estrutura || 'única', e.alteracoes,
    ]));
}

function detalheCalendario(edital) {
  const e = (estado.calendario || []).find(x => x.edital === edital);
  if (!e) return;
  $('cal-detalhe').hidden = false;
  $('cal-detalhe').innerHTML = `<h3>${esc(e.programa)} ${esc(e.edital)}</h3>`
    + `<ul>${descricao(e).split('\n').slice(1).map(l => `<li>${esc(l)}</li>`).join('')}</ul>`
    + (SITE ? '' : '<div class="chips">'
    + `<button type="button" class="chip" data-pergunta="trajetória do edital ${esc(e.edital)}">Os projetos deste edital passaram antes pela esteira?</button>`
    + `<button type="button" class="chip" data-pergunta="calendário do ${esc(e.programa)}">Calendário do ${esc(e.programa)}</button>`
    + `<button type="button" class="chip" data-pergunta="desfecho dos processos do ${esc(e.programa)}">Desfecho dos processos do ${esc(e.programa)}</button>`
    + '</div>');
}

function irPara(hash) {
  if (location.hash !== hash) location.hash = hash;
  else rotear();
  window.scrollTo({ top: 0 });
}

// ── Abertura ─────────────────────────────────────────────────────────────────────

async function abrir() {
  if (SITE) aplicarModoSite();
  renderCapitulos();
  $('atualizado-em').textContent = ATUALIZADO_EM;
  $('atualizado-site').textContent = ATUALIZADO_EM;
  rotear();
  try {
    const meta = await fetch(versionado('dados/meta.json')).then(r => r.json());
    estado.meta = meta;
    estado.disponiveis = new Set(meta.graficos.map(g => g.arquivo.split('/').pop()));
    $('meta-grafo').textContent = `Grafo gerado em ${new Date(meta.gerado_em).toLocaleString('pt-BR')} · `
      + `${numero(meta.triplas)} triplas. Os números acima contam a base inteira, inclusive programas fora da esteira.`;
    rotear();

    const catalogo = (await sparql(CONSULTA_CATALOGO)).linhas;
    estado.catalogo = catalogo;
    const programas = [...new Map(catalogo.map(l => [l.programa, l])).values()];
    definirCatalogo(programas, catalogo.filter(l => l.edital));

    const n = (await sparql(CONSULTA_NUMEROS)).linhas[0];
    const cartoes = [['programas', 'Programas'], ['editais', 'Editais'], ['projetos', 'Projetos'], ['bolsas', 'Bolsas'],
      ['empresas', 'Empresas'], ['pessoas', 'Pessoas distintas']];
    $('numeros').innerHTML = cartoes.map(([k, rotulo]) =>
      `<div class="numero"><div class="valor">${numero(n[k])}</div><div class="rotulo">${rotulo}</div></div>`).join('');
    $('consulta-numeros').innerHTML = blocoConsulta({ rotulo: 'a consulta que conta a base', texto: CONSULTA_NUMEROS });

    // Na versão online, só as perguntas que funcionam com a parte pública do grafo.
    $('sugestoes').innerHTML = PERGUNTAS.filter(p => !SITE || p.publica).flatMap(p => p.exemplos.slice(0, 1).map(ex =>
      `<button type="button" class="chip" data-pergunta="${esc(ex)}" title="${esc(p.titulo)}">${esc(ex)}</button>`)).join('');
    $('exemplos-sparql').innerHTML = EXEMPLOS_SPARQL.map((e, i) =>
      `<button type="button" class="chip" data-exemplo="${i}">${esc(e.titulo)}</button>`).join('');
    if (SITE) $('pergunta').placeholder = 'Ex.: quais editais estavam abertos em março de 2025?';
    $('pergunta').disabled = false;
    $('botao-perguntar').disabled = false;
    mensagem('Pronto. Escreva uma pergunta ou clique numa sugestão.');
    // ?q=... abre o painel já com a pergunta respondida (links para perguntas frequentes).
    const inicial = new URLSearchParams(location.search).get('q');
    if (inicial) {
      irPara('#perguntar');
      perguntar(inicial);
    }
  } catch (erro) {
    const texto = `Não foi possível carregar o painel: ${erro.message}.`
      + (SITE ? '' : ' O servidor (painel/servir.py) está rodando?');
    mensagem(texto, true);
    $('meta-grafo').textContent = texto;
  }
}

// ── Gráficos ─────────────────────────────────────────────────────────────────────

function seloStatus(g) {
  if (SITE) return ''; // o selo é do nosso fluxo de revisão; não diz nada a quem avalia
  return g.status === 'revisado'
    ? '<span class="selo tom-revisado" title="Segue o recorte da esteira">✓ Revisado</span>'
    : '<span class="selo tom-revisar" title="Ainda não segue o recorte da esteira">A revisar</span>';
}

/** Os gráficos dos achados e da proposta de calendário, na ordem da aba Achados: aparecem
 *  primeiro na lista, no grupo "Comece por aqui"; os outros ficam nos grupos temáticos. */
function graficosPrincipais() {
  const ids = CAPITULOS.flatMap(c => c.blocos.map(b => (b.tipo === 'proposta' ? PROPOSTA.grafico : b.grafico)));
  return [...new Set(ids.filter(Boolean))].filter(id => GRAFICOS.some(g => g.id === id));
}

function renderListaGraficos() {
  const principais = graficosPrincipais();
  const item = g => `<a href="#graficos/${g.id}" class="item${g.id === estado.grafico ? ' ativo' : ''}"`
    + `${g.id === estado.grafico ? ' aria-current="page"' : ''}>`
    + `<span class="ponto ${g.status === 'revisado' ? 'ok' : 'revisar'}" aria-hidden="true"></span>`
    + `<span>${esc(g.titulo)}</span></a>`;
  const comece = `<div class="grupo comece"><div class="grupo-nome">Comece por aqui</div>${principais.map(id =>
    item(GRAFICOS.find(g => g.id === id))).join('')}</div>`;
  $('lista-graficos').innerHTML = comece + GRUPOS.map(grupo => {
    const itens = GRAFICOS.filter(g => g.grupo === grupo.id && !principais.includes(g.id));
    return itens.length ? `<div class="grupo"><div class="grupo-nome">${esc(grupo.nome)}</div>${itens.map(item).join('')}</div>` : '';
  }).join('');
}

function renderGrafico() {
  const g = GRAFICOS.find(x => x.id === estado.grafico) || GRAFICOS[0];
  const versoes = versoesVisiveis(g);
  const versao = versoes.find(v => v.id === estado.versao[g.id]) || versoes[0];
  const destaques = versao.destaques || g.destaques || [];
  const grupo = GRUPOS.find(x => x.id === g.grupo);

  let imagem;
  if ((versao.comNomes ?? g.comNomes) && ocultar()) {
    imagem = '<div class="oculto-por-nomes">Este gráfico traz nomes de pessoas. Desmarque "Ocultar nomes", no topo, '
      + 'para vê-lo.</div>';
  } else if (estado.disponiveis.size && !estado.disponiveis.has(arquivoDe(versao))) {
    imagem = `<div class="oculto-por-nomes">A imagem <code>${esc(arquivoDe(versao))}</code> ainda não foi copiada para o `
      + 'painel: rode a etapa <code>graficos</code> e depois a <code>painel</code> do pipeline.</div>';
  } else {
    imagem = `<button type="button" class="imagem-botao" data-ampliar aria-label="Ampliar o gráfico">`
      + `<img src="${versionado(`dados/graficos/${esc(arquivoDe(versao))}`)}" alt="${esc(g.titulo)}"></button>`;
  }

  const lista = (titulo, itens) => itens && itens.length
    ? `<section class="bloco"><h4>${titulo}</h4><ul>${itens.map(t => `<li>${t}</li>`).join('')}</ul></section>` : '';
  // Como o gráfico foi feito: a consulta SPARQL à ontologia (texto completo, aberto sob pedido)
  // e o script que desenha o gráfico a partir do resultado.
  const consultas = g.fonte ? g.fonte.consultas : [];
  const scripts = g.fonte ? g.fonte.script.split(' e ') : [];
  const origem = g.fonte ? `<section class="bloco origem-grafico"><h4>Como este gráfico foi feito</h4>
      <p>${consultas.length > 1 ? `${consultas.length} consultas SPARQL à ontologia` : 'Uma consulta SPARQL à ontologia'}
        ${consultas.length > 1 ? 'buscam' : 'busca'} os dados no grafo de conhecimento;
        ${scripts.length > 1 ? 'os scripts' : 'o script'} ${scripts.map(s => `<code>${esc(s)}</code>`).join(' e ')}
        ${scripts.length > 1 ? 'desenham' : 'desenha'} o gráfico a partir do resultado, sem nenhum dado digitado à mão.</p>
      ${consultas.map(nome => blocoConsulta({ nome })).join('')}
    </section>` : '';

  $('grafico-detalhe').innerHTML = `
    <div class="detalhe-topo">
      <span class="grupo-nome">${esc(grupo ? grupo.nome : '')}</span>${seloStatus(g)}
    </div>
    <h2>${esc(g.titulo)}</h2>
    <p class="pergunta-grafico">${esc(g.pergunta)}</p>
    ${g.revisao ? `<div class="aviso"><strong>A revisar:</strong> ${esc(g.revisao)}</div>` : ''}
    ${versoes.length > 1 ? `<div class="segmentado" role="group" aria-label="Versão do gráfico">${versoes.map(v =>
      `<button type="button" data-versao="${v.id}" aria-pressed="${v.id === versao.id}">${esc(v.rotulo)}</button>`).join('')}</div>` : ''}
    <figure class="figura">${imagem}<figcaption>Clique na imagem para ampliar.</figcaption></figure>
    ${destaques.length ? `<div class="destaques">${destaques.map(d =>
      `<div class="destaque"><div class="valor">${esc(d.valor)}</div><div class="rotulo">${esc(d.rotulo)}</div></div>`).join('')}</div>` : ''}
    <div class="texto-grafico">
      <section class="bloco principal"><h4>Análise</h4>${(g.analise || []).map(p => `<p>${p}</p>`).join('')}
        ${g.explorar && !SITE ? `<button type="button" class="link-acao" data-pergunta="${esc(g.explorar)}">Explorar na aba Perguntar →</button>` : ''}
      </section>
      <aside class="lateral">${lista('Como ler', versao.comoLer || g.comoLer)}${lista('Ressalvas', g.ressalvas)}</aside>
    </div>
    ${origem}`;
}

// ── Capítulos (a narrativa) ──────────────────────────────────────────────────────

/** A proposta de calendário (capítulo 5), com o gráfico da simulação. */
function htmlProposta() {
  const p = PROPOSTA;
  return `<section class="proposta" id="proposta-calendario">
      <h3>${esc(p.titulo)}</h3>
      <p>${esc(p.texto)}</p>
      <div class="proposta-corpo">
        <ul>${p.itens.map(t => `<li>${t}</li>`).join('')}</ul>
        <button type="button" class="imagem-botao" data-ampliar aria-label="Ampliar o gráfico do calendário sugerido">
          <img src="${versionado('dados/graficos/calendario_sugerido.png')}" alt="Calendário sugerido: términos dos projetos por mês e as janelas sugeridas para o estágio seguinte"></button>
      </div>
      <p class="nota">${esc(p.ressalva)}</p>
      <p class="pergunta-gestor"><strong>Pergunta para a FACEPE:</strong> ${esc(p.pergunta)}${botaoResponder(p.pergunta)}</p>
      <a class="link-detalhe" href="#graficos/${esc(p.grafico)}">Ver o cálculo e as ressalvas →</a>
    </section>`;
}

/** Um bloco de evidência: destaque com número, textos, o gráfico na página, o que sugere e a
 *  pergunta para a FACEPE. */
function htmlBloco(b) {
  if (b.tipo === 'calendario') return '<div class="slot" data-slot="calendario"></div>';
  if (b.tipo === 'proposta') return htmlProposta();
  const g = b.grafico ? GRAFICOS.find(x => x.id === b.grafico) : null;
  const versaoImagem = g && b.imagem !== false ? g.versoes[0] : null;
  const imagem = versaoImagem ? arquivoDe(versaoImagem) : null;
  return `<article class="bloco-evidencia${b.numero ? '' : ' sem-numero'}">
      ${b.numero ? `<div class="achado-numero">
        <div class="valor">${esc(b.numero)}</div>
        ${b.proporcao != null ? `<div class="medidor" aria-hidden="true"><span style="width:${(b.proporcao * 100).toFixed(1)}%"></span></div>` : ''}
        <div class="rotulo">${esc(b.rotulo)}</div>
      </div>` : ''}
      <div class="achado-texto">
        <h3>${esc(b.titulo)}</h3>
        ${(b.textos || []).map(t => `<p>${esc(t)}</p>`).join('')}
        ${b.sugere ? `<p class="sugere"><strong>O que isso sugere:</strong> ${esc(b.sugere)}</p>` : ''}
        ${b.pergunta ? `<p class="pergunta-gestor"><strong>Pergunta para a FACEPE:</strong> ${esc(b.pergunta)}${botaoResponder(b.pergunta)}</p>` : ''}
        ${b.link ? `<a class="link-detalhe" href="${esc(b.link.href)}">${esc(b.link.texto)}</a>` : ''}
        ${g && !b.link ? `<a class="link-detalhe" href="#graficos/${esc(g.id)}">Ver a página do gráfico: análise, ressalvas e consulta →</a>` : ''}
      </div>
      ${imagem ? `<button type="button" class="imagem-botao bloco-imagem" data-ampliar aria-label="Ampliar: ${esc(g.titulo)}">
        <img src="${versionado(`dados/graficos/${esc(imagem)}`)}" alt="${esc(g.titulo)}" loading="lazy"
          data-arquivo="${esc(versaoImagem.arquivo)}" data-arquivo-nomes="${esc(versaoImagem.arquivoNomes || '')}"></button>` : ''}
    </article>`;
}

/** Os capítulos 2 a 5, o roteiro do Início e as perguntas da Conclusão (textos de conteudo.js). */
function renderCapitulos() {
  CAPITULOS.forEach((c, i) => {
    const numero = i + 2; // o Início é o capítulo 1
    const proximo = CAPITULOS[i + 1] || { id: 'conclusao', aba: 'Conclusão' };
    $(`cap-${c.id}`).innerHTML = `<header class="capitulo-cabeca">
        <div class="capitulo-numero">Capítulo ${numero} de 6</div>
        <h2 id="t-${c.id}">${esc(c.titulo)}</h2>
        ${c.hipotese ? `<p class="capitulo-hipotese"><span class="rotulo-hipotese">Hipótese testada</span> ${esc(c.hipotese)}
          <span class="selo tom-${c.tom}">${esc(c.selo)}</span></p>` : ''}
        <p class="lead">${esc(c.resposta)}</p>
      </header>
      <div class="capitulo-blocos">${c.blocos.map(htmlBloco).join('')}</div>
      <nav class="ponte" aria-label="Próximo capítulo">
        <p>${esc(c.ponte)}</p>
        <a class="botao-proximo" href="#${proximo.id}">Próximo: ${esc(proximo.aba)} →</a>
      </nav>`;
  });
  // A linha do tempo interativa (marcação fixa no index.html) vai para o lugar do bloco "calendario".
  const slot = document.querySelector('[data-slot="calendario"]');
  if (slot) slot.replaceWith($('bloco-calendario'));
  $('roteiro').innerHTML = [...CAPITULOS.map((c, i) => `<li><a href="#${c.id}"><strong>${i + 2}. ${esc(c.aba)}</strong></a>: ${esc(c.titulo)}</li>`),
    '<li><a href="#conclusao"><strong>6. Conclusão</strong></a>: a resposta, os limites, as perguntas para a FACEPE e os próximos passos.</li>'].join('');
  $('perguntas-gestores').innerHTML = PERGUNTAS_GESTORES.map(t => `<li>${esc(t)}${botaoResponder(t)}</li>`).join('');
}

// ── Consultas SPARQL e a aba "Como funciona" ──────────────────────────────────────

/** Descrição de uma consulta guardada (dos comentários do arquivo .sparql, via meta.json). */
function descricaoConsulta(nome) {
  const c = (estado.meta?.consultas || []).find(x => x.nome === nome);
  return c ? c.descricao : '';
}

/**
 * Quadro "Ver a consulta SPARQL". Com `nome`, é uma consulta guardada em ontologia/src/sparql
 * (o texto é buscado em dados/consultas/ ao abrir o quadro); com `texto`, uma consulta do
 * próprio painel.
 */
function blocoConsulta({ nome = '', rotulo = '', texto = '' }) {
  const descricao = nome ? descricaoConsulta(nome) : '';
  return `<details class="consulta"${nome ? ` data-consulta="${esc(nome)}"` : ''}>
    <summary>Ver ${nome ? `a consulta SPARQL <code>${esc(nome)}</code>` : esc(rotulo)}</summary>
    ${descricao ? `<p class="consulta-descricao">${esc(descricao)}</p>` : ''}
    <pre class="codigo"><code>${texto ? esc(texto) : 'Carregando…'}</code></pre>
  </details>`;
}

/** Carrega o texto de uma consulta guardada quando o quadro é aberto. */
async function carregarConsulta(detalhes) {
  if (!detalhes.open || detalhes.dataset.carregada) return;
  detalhes.dataset.carregada = '1';
  const codigo = detalhes.querySelector('code');
  try {
    const resposta = await fetch(versionado(`dados/consultas/${encodeURIComponent(detalhes.dataset.consulta)}.sparql`));
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    codigo.textContent = await resposta.text();
  } catch (erro) {
    codigo.textContent = `Não foi possível carregar a consulta (${erro.message}). Rode a etapa 'painel' do pipeline.`;
  }
}

/** Monta a aba "Como funciona": o caminho da fonte ao gráfico, o modelo e as consultas. */
async function renderPilha() {
  if (estado.pilha || !estado.meta) return;
  estado.pilha = true;
  try {
    const [classes, relacoes, propriedades] = await Promise.all(
      [CONSULTA_MODELO_CLASSES, CONSULTA_MODELO_RELACOES, CONSULTA_MODELO_PROPRIEDADES].map(c => sparql(c)));
    const props = new Map();
    for (const l of propriedades.linhas) props.set(l.classe, [...(props.get(l.classe) || []), l]);
    const nProps = propriedades.linhas.length;
    const nSemValor = propriedades.linhas.filter(l => Number(l.valores) === 0).length;
    const consultas = estado.meta.consultas || [];

    const etapas = [
      ['Fontes', 'Extrato do AgilFAP (a base de gestão da FACEPE) e resultados publicados em PDF no site. Scripts em Python '
        + 'limpam, cruzam as duas fontes e trocam por pseudônimo o que não foi publicado.'],
      ['Ontologia', `O vocabulário do domínio, escrito em OML na ferramenta Rosetta: <strong>${classes.linhas.length} classes</strong>, `
        + `<strong>${relacoes.linhas.length} relações</strong> e <strong>${nProps} propriedades</strong> `
        + `(${nProps - nSemValor} delas com valores na base).`],
      ['Grafo de conhecimento', `Os dados viram indivíduos da ontologia, em RDF/OWL: <strong>${numero(estado.meta.triplas)} triplas</strong>. `
        + 'Um <em>reasoner</em> confere a consistência e infere os papéis (coordenador, bolsista, orientador).'],
      ['Consultas SPARQL', `<strong>${consultas.length} consultas</strong> guardadas com a ontologia rodam no Apache Jena Fuseki `
        + 'a cada geração da base. ' + (SITE
        ? 'Nesta versão para avaliação, os gráficos já vêm calculados, e a aba Perguntar consulta ao vivo, no seu navegador, a parte pública do grafo.'
        : 'O painel consulta o mesmo grafo ao vivo, com o Oxigraph.')],
      ['Gráficos e painel', `Scripts desenham os gráficos a partir do resultado das consultas: <strong>${GRAFICOS.length} páginas `
        + 'de gráficos</strong>, com análise, ressalvas e a consulta de cada um.'],
    ];
    $('fluxo-pilha').innerHTML = etapas.map(([titulo, texto], i) =>
      `<li class="etapa"><span class="etapa-numero">${i + 1}</span><h4>${titulo}</h4><p>${texto}</p></li>`).join('');

    // Classes agrupadas pela classe-mãe (as de topo viram cartões; as filhas ficam dentro).
    const filhas = new Map();
    for (const l of classes.linhas) if (l.superclasse) filhas.set(l.superclasse, [...(filhas.get(l.superclasse) || []), l]);
    const propsHtml = nome => (props.get(nome) || []).map(p => Number(p.valores)
      ? `<code title="${numero(p.valores)} valores na base">${esc(p.propriedade)}</code>`
      : `<code class="sem-valor" title="Nenhum valor na base">${esc(p.propriedade)}</code>`).join(' ');
    const linhaClasse = l => `<div class="classe-linha"><span class="classe-nome">${esc(l.classe)}</span>`
      + `<span class="classe-n">${numero(l.individuos)} indivíduos</span></div>`
      + (props.has(l.classe) ? `<div class="classe-props">${propsHtml(l.classe)}</div>` : '');
    $('modelo-classes').innerHTML = classes.linhas.filter(l => !l.superclasse).map(l =>
      `<article class="classe-cartao">${linhaClasse(l)}${(filhas.get(l.classe) || []).map(f =>
        `<div class="classe-filha">${linhaClasse(f)}</div>`).join('')}</article>`).join('');
    $('modelo-relacoes').innerHTML = '<thead><tr><th>De</th><th>Relação</th><th>Para</th></tr></thead><tbody>'
      + relacoes.linhas.map(l => `<tr><td>${esc(l.origem)}</td><td><code>${esc(l.relacao)}</code> →</td>`
        + `<td>${esc(l.destino)}</td></tr>`).join('') + '</tbody>';
    $('consultas-modelo').innerHTML = [
      blocoConsulta({ rotulo: 'a consulta das classes', texto: CONSULTA_MODELO_CLASSES }),
      blocoConsulta({ rotulo: 'a consulta das relações', texto: CONSULTA_MODELO_RELACOES }),
      blocoConsulta({ rotulo: 'a consulta das propriedades', texto: CONSULTA_MODELO_PROPRIEDADES }),
    ].join('');

    // As consultas guardadas, com os gráficos que cada uma alimenta.
    $('lista-consultas').innerHTML = consultas.map(c => {
      const usos = GRAFICOS.filter(g => g.fonte && g.fonte.consultas.includes(c.nome));
      return `<article class="consulta-item"><h4><code>${esc(c.nome)}</code></h4>`
        + `<p>${esc(c.descricao || 'Sem descrição.')}</p>`
        + `<p class="consulta-usos">${usos.length ? `Usada em: ${usos.map(g => `<a href="#graficos/${g.id}">${esc(g.titulo)}</a>`)
          .join(' · ')}` : 'Não alimenta nenhum gráfico do painel (consulta de apoio ou de exemplo).'}</p>`
        + blocoConsulta({ nome: c.nome }).replace(/<p class="consulta-descricao">[\s\S]*?<\/p>/, '')
        + '</article>';
    }).join('');
  } catch (erro) {
    estado.pilha = false;
    $('modelo-classes').innerHTML = `<p class="estado erro">Não foi possível consultar a ontologia: ${esc(erro.message)}</p>`;
  }
}

// ── Hipóteses ────────────────────────────────────────────────────────────────────


// ── Perguntas ────────────────────────────────────────────────────────────────────

async function perguntar(texto) {
  $('pergunta').value = texto;
  const r = reconhecer(texto);
  if (!r) {
    mensagem('Não reconheci a pergunta. Tente uma das sugestões, ou cite um edital (ex.: 23/2024), um programa ou um estágio.', true);
    $('resultado').innerHTML = '';
    $('painel-sparql').hidden = true;
    return;
  }
  if (SITE && !r.pergunta.publica) {
    mensagem(`"${r.pergunta.titulo}" usa dados de pessoas, empresas ou processos, que ficam só na versão local. `
      + 'Aqui dá para perguntar sobre programas, editais e o calendário, ou escrever uma consulta SPARQL nos exemplos abaixo.', true);
    $('resultado').innerHTML = '';
    $('painel-sparql').hidden = true;
    return;
  }
  if (r.campos.escolherEdital) {
    mensagem(`${r.pergunta.titulo}: escolha o edital.`);
    $('resultado').innerHTML = `<div class="chips">${r.campos.escolherEdital.map(e =>
      `<button type="button" class="chip" data-pergunta="${esc(r.campos.modelo + e.edital)}">`
      + `${esc(e.programa)} ${esc(e.edital)}</button>`).join('')}</div>`;
    $('painel-sparql').hidden = true;
    return;
  }
  const consultas = r.pergunta.consultas(r.campos);
  $('sparql').value = consultas.join('\n\n# ---\n\n');
  $('painel-sparql').hidden = false;
  mensagem(`${r.pergunta.titulo}… executando.`);
  try {
    const resultados = await Promise.all(consultas.map(sparql));
    const ms = resultados.reduce((s, x) => s + x.ms, 0);
    estado.ultimo = { tipo: 'pergunta', r, resultados };
    const presumida = r.campos.origemPresumida ? ` (origem presumida: ${r.campos.origem.nome})` : '';
    mensagem(`${r.pergunta.titulo}${presumida} · consulta respondida em ${ms} ms.`);
    renderResultado();
  } catch (erro) {
    mensagem(`Erro na consulta: ${erro.message}`, true);
  }
}

async function executarEditada() {
  const consulta = $('sparql').value;
  try {
    const resultado = await sparql(consulta);
    estado.ultimo = { tipo: 'livre', resultado };
    mensagem(`Consulta editada · ${numero(resultado.linhas.length)} linha(s) em ${resultado.ms} ms.`);
    renderResultado();
  } catch (erro) {
    mensagem(`Erro na consulta: ${erro.message}`, true);
  }
}

function renderResultado() {
  const u = estado.ultimo;
  if (!u) return;
  if (u.tipo === 'livre') {
    const colunas = u.resultado.variaveis.map(v => ({ v, rotulo: v, sensivel: VARIAVEIS_SENSIVEIS.test(v) }));
    $('resultado').innerHTML = tabela(u.resultado.linhas, colunas);
    return;
  }
  if (u.r.pergunta.apresentacao === 'trajetoria') {
    $('resultado').innerHTML = trajetoria(u.r.campos.edital, u.resultados[0].linhas, u.resultados[1].linhas);
    return;
  }
  const rotulos = u.r.pergunta.rotulos ? u.r.pergunta.rotulos(u.r.campos) : [];
  $('resultado').innerHTML = u.resultados.map((res, i) =>
    (rotulos[i] ? `<h3>${esc(rotulos[i])}</h3>` : '') + tabela(res.linhas, u.r.pergunta.colunas)).join('');
}

function tabela(linhas, colunas) {
  const visiveis = colunas.filter(c => !(ocultar() && c.sensivel === true));
  if (!linhas.length) return '<p class="contagem">Nenhum resultado.</p>';
  const numericas = new Set(visiveis.filter(c => linhas.every(l => l[c.v] === undefined || /^-?\d+(\.\d+)?$/.test(l[c.v])))
    .map(c => c.v));
  const MAX = 300;
  const corpo = linhas.slice(0, MAX).map(l => `<tr>${visiveis.map(c => {
    const oculto = ocultar() && typeof c.sensivel === 'function' && c.sensivel(l);
    const valor = oculto ? '(oculto)' : l[c.v] ?? '';
    return numericas.has(c.v) ? `<td class="num">${esc(valor === '' ? '' : numero(valor))}</td>` : `<td>${esc(valor)}</td>`;
  }).join('')}</tr>`).join('');
  return `<p class="contagem">${numero(linhas.length)} linha(s)${linhas.length > MAX ? ` (mostrando ${MAX})` : ''}</p>`
    + `<div class="tabela-rolagem"><table><thead><tr>${visiveis.map(c => `<th>${esc(c.rotulo)}</th>`).join('')}</tr></thead>`
    + `<tbody>${corpo}</tbody></table></div>`;
}

// ── Trajetória de um edital ──────────────────────────────────────────────────────

function marca(celula) {
  if (!celula) return '';
  const est = celula.estagio ? `est-${celula.estagio}` : 'est-sem';
  return (celula.empresa ? `<span class="marca empresa ${est}"></span>` : '')
    + (celula.coordenador ? `<span class="marca ${celula.coordenador} ${est}"></span>` : '');
}

function descricaoCelula(rotulo, coluna, celula) {
  const partes = [];
  if (celula.empresa) partes.push('a empresa executou projeto');
  if (celula.coordenador === 'coordenou') partes.push('o coordenador coordenou projeto');
  if (celula.coordenador === 'bolsa') partes.push('o coordenador recebeu bolsa');
  const estagio = NOME_ESTAGIO[celula.estagio] || 'pós-graduação';
  const quando = celula.referencia ? 'edital consultado' : celula.antes ? 'antes do edital' : 'depois do edital';
  return `${rotulo} · ${coluna.programa} ${coluna.edital} (${estagio}, ${quando}): ${partes.join('; ')}`;
}

function trajetoria(edital, projetosLinhas, linhas) {
  const info = estado.catalogo.find(l => l.edital === edital) || {};
  const programa = info.programa || '';
  const estagioEdital = info.ordem ? Number(info.ordem) : info.estagio ? 'outro' : null;
  const projetos = montarTrajetoria(edital, projetosLinhas, linhas);
  if (!projetos.length) return '<p class="contagem">O edital não tem projetos no grafo (só bolsas).</p>';
  const r = resumir(projetos);
  const m = matriz(edital, programa, estagioEdital, projetos);
  const rotuloProjeto = p => ocultar() ? `Projeto ${String(m.linhas.indexOf(p) + 1).padStart(2, '0')}` : p.codigo;
  const passaram = r.esteira.ambos + r.esteira.soEmpresa + r.esteira.soCoordenador;

  let html = `<h3>${esc(programa)} ${esc(edital)} (${esc(NOME_ESTAGIO[estagioEdital] || 'sem estágio')})</h3>`;
  if (!r.comEmpresa) {
    html += '<div class="aviso">Nenhum projeto deste edital tem empresa identificada (por exemplo, edital que só existe '
      + 'nos PDFs, que não publicam a empresa): só a trajetória do coordenador aparece.</div>';
  }
  html += `<div class="destaques">
    <div class="destaque"><div class="valor">${passaram} de ${r.projetos}</div><div class="rotulo">projetos já tinham passado
      pela esteira (Ideação, Operação ou Aceleração)</div></div>
    <div class="destaque"><div class="valor">${r.comAClassificar.ambos + r.comAClassificar.soEmpresa + r.comAClassificar.soCoordenador}
      de ${r.projetos}</div><div class="rotulo">contando também programas de inovação fora da esteira</div></div>
    <div class="destaque"><div class="valor">${r.pelaMesmaEmpresa} de ${r.coordenadorComProjetoAntes}</div><div class="rotulo">coordenadores
      com projeto anterior o fizeram pela mesma empresa (${r.soPorOutraEmpresa} só por outra)</div></div>
    <div class="destaque"><div class="valor">${r.semNenhumaOutraParticipacao}</div><div class="rotulo">projetos sem nenhuma outra
      participação, antes ou depois · ${r.apoiadosDepois} apoiados depois</div></div>
  </div>`;
  html += tabelaSimples(['Passagem anterior', 'Pela esteira', 'Incluindo fora da esteira'], [
    ['Pela empresa e pelo coordenador', r.esteira.ambos, r.comAClassificar.ambos],
    ['Só pela empresa', r.esteira.soEmpresa, r.comAClassificar.soEmpresa],
    ['Só pelo coordenador', r.esteira.soCoordenador, r.comAClassificar.soCoordenador],
    ['Nenhuma', r.esteira.nenhum, r.comAClassificar.nenhum],
  ]);
  html += tabelaSimples(['Estágio do programa anterior', 'Pela empresa', 'Pelo coordenador', 'Por um ou outro'],
    r.porEstagio.map(e => [rotuloEstagio(e.nome), e.empresa, e.coordenador, e.algum]));

  html += '<h3>Trajetória, projeto a projeto</h3><div class="legenda">'
    + ESTAGIOS.map(e => `<span><span class="marca empresa est-${e.chave}"></span>${esc(rotuloEstagio(e.nome))}</span>`).join('')
    + '<span><span class="marca empresa est-sem"></span>Pós-graduação (fora da esteira)</span>'
    + '<span><span class="marca empresa est-2"></span>empresa executou projeto</span>'
    + '<span><span class="marca coordenou est-2"></span>coordenador coordenou projeto</span>'
    + '<span><span class="marca bolsa est-2"></span>coordenador recebeu bolsa</span></div>';
  html += '<div class="tabela-rolagem"><table class="matriz"><thead><tr><th></th>'
    + m.colunas.map(c => `<th class="coluna${c.referencia ? ' referencia' : ''}" title="${esc(`${c.programa} ${c.edital}`)}">`
      + `${esc(ABREVIACAO[c.programa] || c.programa)} ${esc(c.edital)}</th>`).join('') + '</tr></thead><tbody>'
    + m.linhas.map((p, i) => `<tr><th class="linha">${esc(rotuloProjeto(p))}</th>`
      + m.celulas[i].map((cel, j) => `<td class="${m.colunas[j].referencia ? 'referencia' : ''}"`
        + (cel ? ` title="${esc(descricaoCelula(rotuloProjeto(p), m.colunas[j], cel))}"` : '') + `>${marca(cel)}</td>`).join('')
      + '</tr>').join('') + '</tbody></table></div>';

  const estagiosAntes = (p, via) => [...new Set(antes(p).filter(x => x.via === via)
    .map(x => NOME_ESTAGIO[estagioDe(x)] || 'pós-graduação'))].join(', ') || '—';
  html += tabelaSimples(['Projeto', 'Empresa', 'Coordenador', 'Empresa passou antes por', 'Coordenador passou antes por',
    'Coordenou antes pela mesma empresa', 'Apoiado depois'], m.linhas.map(p => [
    rotuloProjeto(p),
    p.empresa ? (ocultar() ? p.empresa : p.nomeEmpresa) : '—',
    p.coordenador ? (ocultar() ? p.coordenador : p.nomeCoordenador) : '—',
    estagiosAntes(p, 'empresa'), estagiosAntes(p, 'coordenador'),
    antes(p).some(x => x.via === 'coordenador' && x.papel === 'coordenou projeto' && x.mesmaEmpresa) ? 'sim' : 'não',
    depois(p).length ? 'sim' : 'não',
  ]));
  return html;
}

function tabelaSimples(cabecalho, linhas) {
  return `<div class="tabela-rolagem"><table><thead><tr>${cabecalho.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>`
    + linhas.map(l => `<tr>${l.map(v => typeof v === 'number' ? `<td class="num">${numero(v)}</td>` : `<td>${esc(v)}</td>`)
      .join('')}</tr>`).join('') + '</tbody></table></div>';
}

// ── Eventos ──────────────────────────────────────────────────────────────────────

$('form-pergunta').addEventListener('submit', e => {
  e.preventDefault();
  const texto = $('pergunta').value.trim();
  if (texto) perguntar(texto);
});
document.addEventListener('click', e => {
  const chip = e.target.closest('[data-pergunta]');
  if (chip) {
    if ($('aba-perguntar').hidden) irPara('#perguntar');
    perguntar(chip.dataset.pergunta);
    return;
  }
  const editalCal = e.target.closest('[data-edital-cal]');
  if (editalCal) {
    detalheCalendario(editalCal.dataset.editalCal);
    return;
  }
  const exemplo = e.target.closest('[data-exemplo]');
  if (exemplo) {
    const { titulo, consulta } = EXEMPLOS_SPARQL[Number(exemplo.dataset.exemplo)];
    $('sparql').value = consulta;
    $('painel-sparql').hidden = false;
    $('painel-sparql').open = true;
    mensagem(`${titulo}… executando.`);
    executarEditada();
    return;
  }
  const versao = e.target.closest('[data-versao]');
  if (versao) {
    estado.versao[estado.grafico] = versao.dataset.versao;
    renderGrafico();
    return;
  }
  const ampliar = e.target.closest('[data-ampliar]');
  if (ampliar) {
    const img = ampliar.querySelector('img');
    $('ampliar').querySelector('img').src = img.src;
    $('ampliar').querySelector('img').alt = img.alt;
    $('ampliar').showModal();
  }
});
$('ampliar').addEventListener('click', () => $('ampliar').close());
// O evento toggle não sobe pela árvore: escuta na fase de captura.
document.addEventListener('toggle', e => {
  if (e.target.matches && e.target.matches('details[data-consulta]')) carregarConsulta(e.target);
}, true);
// "Responder": o link é montado no clique, com a pergunta.
document.addEventListener('click', e => {
  const responder = e.target.closest && e.target.closest('[data-responder]');
  if (responder && SITE && SITE.formulario) responder.href = linkPergunta(responder.dataset.responder);
}, true);
// O link do formulário é montado no clique, com a página que está aberta naquele momento.
$('comentar').addEventListener('click', e => { if (SITE && SITE.formulario) e.currentTarget.href = linkComentario(); });
$('executar-sparql').addEventListener('click', executarEditada);
$('ocultar-nomes').addEventListener('change', () => {
  if (!$('aba-graficos').hidden) renderGrafico();
  renderResultado();
  // Nos capítulos, troca só as imagens que têm versão com nomes.
  document.querySelectorAll('img[data-arquivo-nomes]:not([data-arquivo-nomes=""])').forEach(img => {
    img.src = versionado(`dados/graficos/${ocultar() ? img.dataset.arquivo : img.dataset.arquivoNomes}`);
  });
});
window.addEventListener('hashchange', rotear);
document.querySelectorAll('.cal-estagio-filtro, #cal-desde, #cal-previsto')
  .forEach(c => c.addEventListener('change', renderCalendario));
// Teclado: Enter ou espaço numa barra do calendário abre os detalhes.
document.addEventListener('keydown', e => {
  const editalCal = e.target.closest && e.target.closest('[data-edital-cal]');
  if (editalCal && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    detalheCalendario(editalCal.dataset.editalCal);
  }
});

abrir();
