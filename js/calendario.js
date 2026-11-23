// calendario.js — a aba Calendário: linha do tempo das janelas de submissão dos editais da
// esteira, desenhada em SVG a partir da consulta ao grafo (consultaCalendario em perguntas.js).
// Em cada estágio, uma faixa mostra quando havia alguma janela aberta e marca os intervalos
// longos sem nenhuma (as lacunas da esteira).

const NOME = { 1: 'Ideação', 2: 'Operação', 3: 'Aceleração' };
const COR = { 1: 'var(--ideacao)', 2: 'var(--operacao)', 3: 'var(--aceleracao)' };
const LARGURA = 1000;
const ROTULOS = 200;
const LINHA = 24;
const MESES_LACUNA = 12; // lacunas a partir de um ano ganham rótulo

const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const dia = iso => (iso ? new Date(`${iso}T12:00:00`) : null);
export const dataBr = iso => (iso ? iso.split('-').reverse().join('/') : '—');
const meses = (a, b) => Math.round((b - a) / (30.44 * 24 * 3600 * 1000));

/** Uma linha por edital da esteira com lançamento (as linhas vêm da consulta ao grafo). */
export function prepararEditais(linhas) {
  return linhas.filter(l => l.lancamento && [1, 2, 3].includes(Number(l.ordem))).map(l => ({
    ...l, ordem: Number(l.ordem), alteracoes: Number(l.alteracoes || 0),
    fim: l.fimSubmissao || l.lancamento,
  }));
}

/** Junta as janelas de um estágio e devolve os períodos cobertos e as lacunas entre eles. */
export function cobertura(editais) {
  const janelas = editais.map(e => [e.lancamento, e.fim]).sort();
  const juntas = [];
  for (const [a, b] of janelas) {
    const ultima = juntas[juntas.length - 1];
    if (ultima && a <= ultima[1]) ultima[1] = b > ultima[1] ? b : ultima[1];
    else juntas.push([a, b]);
  }
  const lacunas = juntas.slice(1).map((j, i) => [juntas[i][1], j[0]]);
  return { juntas, lacunas };
}

const MES_CURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export const mesAno = iso => (iso ? `${MES_CURTO[Number(iso.slice(5, 7)) - 1]}/${iso.slice(0, 4)}` : '—');

/** As lacunas de 12 meses ou mais de um estágio que terminam a partir de `desde` (as visíveis). */
export function lacunasLongas(editais, desde) {
  return cobertura(editais).lacunas
    .map(([a, b]) => ({ a, b, m: meses(dia(a), dia(b)) }))
    .filter(l => l.m >= MESES_LACUNA && l.b >= `${desde}-01-01`);
}

export function descricao(e) {
  const partes = [`${e.programa} ${e.edital} (${NOME[e.ordem]})`, `Lançamento: ${dataBr(e.lancamento)}`,
    `Fim da submissão: ${dataBr(e.fimSubmissao)}${e.fimSubmissaoOriginal ? ` (prorrogado de ${dataBr(e.fimSubmissaoOriginal)})` : ''}`];
  if (e.resultadoPrevisto) partes.push(`Resultado previsto: ${dataBr(e.resultadoPrevisto)}`);
  if (e.resultadoPublicado) partes.push(`Resultado publicado: ${dataBr(e.resultadoPublicado)}`);
  partes.push(`Seleção: ${e.estrutura || 'única'}${e.alteracoes ? ` · ${e.alteracoes} documento(s) de alteração` : ''}`);
  return partes.join('\n');
}

/** Desenha a linha do tempo; devolve o SVG (texto). */
export function desenhar(editais, { estagios = [1, 2, 3], desde = 2019, previsto = true, hoje = new Date() } = {}) {
  const x0 = new Date(desde, 0, 1);
  const x1 = new Date(2027, 0, 1);
  const x = d => ROTULOS + ((Math.min(Math.max(d, x0), x1) - x0) / (x1 - x0)) * (LARGURA - ROTULOS - 12);
  const visivel = e => dia(e.fim) >= x0 && dia(e.lancamento) <= x1;
  const linhas = [];
  for (const ordem of estagios) {
    const doEstagio = editais.filter(e => e.ordem === ordem);
    const programas = [...new Set(doEstagio.filter(visivel).map(e => e.programa))]
      .sort((a, b) => doEstagio.find(e => e.programa === a).lancamento.localeCompare(doEstagio.find(e => e.programa === b).lancamento));
    linhas.push({ tipo: 'estagio', ordem, editais: doEstagio });
    for (const p of programas) linhas.push({ tipo: 'programa', ordem, programa: p, editais: doEstagio.filter(e => e.programa === p) });
  }
  const topo = 46;
  const altura = topo + linhas.length * LINHA + 10;
  const partes = [];
  // Hachura de prorrogação, uma por estágio.
  partes.push('<defs>' + [1, 2, 3].map(o => `<pattern id="cal-hachura-${o}" width="5" height="5" patternUnits="userSpaceOnUse" `
    + `patternTransform="rotate(45)"><rect width="5" height="5" fill="${COR[o]}" opacity=".25"/>`
    + `<line x1="0" y1="0" x2="0" y2="5" stroke="${COR[o]}" stroke-width="2.2"/></pattern>`).join('') + '</defs>');
  // Escala de tempo (20/11/2026: só os anos era espaçado demais para ver onde um edital começa e
  // termina). O ano no alto, com uma linha forte na virada; embaixo dele, os meses, com linhas
  // finas. A densidade acompanha o espaço de um ano no período escolhido: rótulos por trimestre
  // (desde 2019) ou por semestre (desde 2014); a partir de 2023, uma linha fina por mês.
  const pxAno = x(new Date(desde + 1, 0, 1)) - x(x0);
  const passoLinha = pxAno >= 180 ? 1 : 3;
  const passoRotulo = pxAno >= 85 ? 3 : 6;
  for (let ano = desde; ano <= 2027; ano += 1) {
    const xa = x(new Date(ano, 0, 1));
    partes.push(`<line x1="${xa}" y1="4" x2="${xa}" y2="${altura - 8}" class="cal-grade"/>`);
    if (ano === 2027) break;
    partes.push(`<text x="${(xa + x(new Date(ano + 1, 0, 1))) / 2}" y="16" class="cal-ano">${ano}</text>`);
    for (let m = passoLinha; m < 12; m += passoLinha) {
      const xm = x(new Date(ano, m, 1));
      partes.push(`<line x1="${xm}" y1="${topo - (m % passoRotulo ? 6 : 20)}" x2="${xm}" y2="${altura - 8}" class="cal-grade-mes"/>`);
    }
    for (let m = 0; m < 12; m += passoRotulo) {
      partes.push(`<text x="${x(new Date(ano, m, 1)) + 3}" y="${topo - 9}" class="cal-mes">${MES_CURTO[m]}</text>`);
    }
  }
  linhas.forEach((l, i) => {
    const y = topo + i * LINHA;
    if (l.tipo === 'estagio') {
      partes.push(`<rect x="0" y="${y}" width="${LARGURA}" height="${LINHA}" class="cal-faixa-estagio"/>`);
      partes.push(`<text x="4" y="${y + 16}" class="cal-estagio" fill="${COR[l.ordem]}">${NOME[l.ordem]}: alguma janela aberta</text>`);
      const { juntas, lacunas } = cobertura(l.editais);
      for (const [a, b] of juntas) {
        if (dia(b) < x0) continue;
        partes.push(`<rect x="${x(dia(a))}" y="${y + 7}" width="${Math.max(x(dia(b)) - x(dia(a)), 2)}" height="10" rx="2" `
          + `fill="${COR[l.ordem]}" opacity=".45"/>`);
      }
      for (const [a, b] of lacunas) {
        const n = meses(dia(a), dia(b));
        if (n < MESES_LACUNA || dia(b) < x0) continue;
        const xa = x(dia(a)), xb = x(dia(b));
        partes.push(`<line x1="${xa}" y1="${y + 12}" x2="${xb}" y2="${y + 12}" class="cal-lacuna"/>`);
        // Rótulo curto quando o trecho visível da lacuna é curto (ela pode começar antes do período exibido).
        const texto = xb - xa > 125 ? `${n} meses sem janela` : `${n} meses`;
        const meia = texto.length * 3.1;
        const centro = Math.max((xa + xb) / 2, ROTULOS + meia + 4);
        if (xb - xa > 2 * meia + 4) partes.push(`<text x="${centro}" y="${y + 10}" class="cal-lacuna-texto">${texto}</text>`);
      }
      return;
    }
    partes.push(`<text x="16" y="${y + 16}" class="cal-programa">${esc(l.programa)}</text>`);
    partes.push(`<line x1="${ROTULOS}" y1="${y + LINHA - 0.5}" x2="${LARGURA - 12}" y2="${y + LINHA - 0.5}" class="cal-divisa"/>`);
    for (const e of l.editais.filter(visivel)) {
      const a = dia(e.lancamento), fim = dia(e.fim);
      const original = e.fimSubmissaoOriginal && e.fimSubmissaoOriginal < e.fim ? dia(e.fimSubmissaoOriginal) : fim;
      let g = `<g class="cal-edital" tabindex="0" role="button" data-edital-cal="${esc(e.edital)}"><title>${esc(descricao(e))}</title>`;
      g += `<rect x="${x(a)}" y="${y + 5}" width="${Math.max(x(original) - x(a), 3)}" height="${LINHA - 10}" rx="2" fill="${COR[e.ordem]}"/>`;
      if (original < fim) {
        g += `<rect x="${x(original)}" y="${y + 5}" width="${Math.max(x(fim) - x(original), 2)}" height="${LINHA - 10}" `
          + `fill="url(#cal-hachura-${e.ordem})"/>`;
      }
      if (previsto && e.resultadoPrevisto && dia(e.resultadoPrevisto) >= x0) {
        g += `<circle cx="${x(dia(e.resultadoPrevisto))}" cy="${y + LINHA / 2}" r="3.6" class="cal-previsto"/>`;
      }
      if (e.resultadoPublicado && dia(e.resultadoPublicado) >= x0) {
        const cx = x(dia(e.resultadoPublicado)), cy = y + LINHA / 2;
        g += `<path d="M ${cx} ${cy - 5} L ${cx + 5} ${cy} L ${cx} ${cy + 5} L ${cx - 5} ${cy} Z" class="cal-publicado"/>`;
      }
      // Área de clique maior que a marca.
      g += `<rect x="${x(a) - 3}" y="${y}" width="${Math.max(x(fim) - x(a), 3) + 6}" height="${LINHA}" fill="transparent"/>`;
      partes.push(g + '</g>');
    }
  });
  if (hoje >= x0 && hoje <= x1) {
    const xh = x(hoje);
    partes.push(`<line x1="${xh}" y1="${topo - 6}" x2="${xh}" y2="${altura - 8}" class="cal-hoje"/>`);
    partes.push(`<text x="${xh + 3}" y="${altura - 2}" class="cal-hoje-texto">hoje</text>`);
  }
  return `<svg viewBox="0 0 ${LARGURA} ${altura}" class="cal-svg" role="img" `
    + `aria-label="Linha do tempo das janelas de submissão dos editais da esteira">${partes.join('')}</svg>`;
}
