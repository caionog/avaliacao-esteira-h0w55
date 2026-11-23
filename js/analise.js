// analise.js — passagem anterior pela esteira dos projetos de um edital, pela empresa e pelo
// coordenador. É a mesma conta de scrapper/visualizar_estudo_caso.py, generalizada para
// qualquer edital: "esteira" = programas com estágio de ordem 1 a 3 (Ideação, Operação,
// Aceleração); "a classificar" é contado à parte; bolsa de pós-graduação (sem estágio) não
// conta como passagem. Funções puras, testadas em painel/testes/.

export const ESTAGIOS = [
  { chave: 1, nome: 'Ideação' }, { chave: 2, nome: 'Operação' }, { chave: 3, nome: 'Aceleração' },
  { chave: 'outro', nome: 'A classificar' },
];

/** Estágio de uma participação: 1, 2 ou 3 (esteira), 'outro' (a classificar) ou null (sem estágio). */
export function estagioDe(participacao) {
  if (participacao.ordem) return participacao.ordem;
  return participacao.estagio ? 'outro' : null;
}

/** Junta os projetos do edital e as linhas da trajetória (resultados SPARQL já simplificados). */
export function montarTrajetoria(edital, projetos, linhas) {
  const porProjeto = new Map();
  for (const p of projetos) {
    if (porProjeto.has(p.projetoInd)) continue;
    porProjeto.set(p.projetoInd, {
      chave: p.projetoInd, codigo: p.projeto, inicio: p.inicio || '', titulo: p.titulo || '',
      empresa: p.empresa || '', nomeEmpresa: p.nomeEmpresa || '',
      coordenador: p.coordenador || '', nomeCoordenador: p.nomeCoordenador || '', participacoes: [],
    });
  }
  for (const l of linhas) {
    const projeto = porProjeto.get(l.projetoInd);
    if (!projeto || l.edital === edital) continue;  // o próprio edital não é passagem
    projeto.participacoes.push({
      via: l.via, papel: l.papel, mesmaEmpresa: l.mesmaEmpresa === 'true', comEmpresa: l.comEmpresa === 'true',
      programa: l.programa, estagio: l.estagio || '', ordem: l.ordem ? Number(l.ordem) : null,
      edital: l.edital, data: l.data || '',
    });
  }
  return [...porProjeto.values()];
}

export function antes(projeto) {
  return projeto.participacoes.filter(x => x.data && projeto.inicio && x.data < projeto.inicio);
}

export function depois(projeto) {
  return projeto.participacoes.filter(x => x.data && projeto.inicio && x.data > projeto.inicio);
}

function passou(projeto, via, estagios) {
  return antes(projeto).some(x => x.via === via && estagios.includes(estagioDe(x)));
}

/** Contagens do caso, como as do TCC (Tabela do estudo de caso). */
export function resumir(projetos) {
  const casos = estagios => {
    const c = { ambos: 0, soEmpresa: 0, soCoordenador: 0, nenhum: 0 };
    for (const p of projetos) {
      const e = passou(p, 'empresa', estagios);
      const k = passou(p, 'coordenador', estagios);
      c[e && k ? 'ambos' : e ? 'soEmpresa' : k ? 'soCoordenador' : 'nenhum'] += 1;
    }
    return c;
  };
  const porEstagio = ESTAGIOS.map(({ chave, nome }) => ({
    nome,
    empresa: projetos.filter(p => passou(p, 'empresa', [chave])).length,
    coordenador: projetos.filter(p => passou(p, 'coordenador', [chave])).length,
    algum: projetos.filter(p => passou(p, 'empresa', [chave]) || passou(p, 'coordenador', [chave])).length,
  }));
  const coordenouAntes = projetos.filter(p => antes(p).some(x => x.via === 'coordenador' && x.papel === 'coordenou projeto'));
  const mesma = coordenouAntes.filter(p => antes(p).some(x => x.via === 'coordenador' && x.papel === 'coordenou projeto' && x.mesmaEmpresa));
  const outra = coordenouAntes.filter(p => !mesma.includes(p)
    && antes(p).some(x => x.via === 'coordenador' && x.papel === 'coordenou projeto' && x.comEmpresa));
  return {
    projetos: projetos.length,
    comEmpresa: projetos.filter(p => p.empresa).length,
    esteira: casos([1, 2, 3]),
    comAClassificar: casos([1, 2, 3, 'outro']),
    porEstagio,
    coordenadorComProjetoAntes: coordenouAntes.length,
    pelaMesmaEmpresa: mesma.length,
    soPorOutraEmpresa: outra.length,
    semNenhumaOutraParticipacao: projetos.filter(p => !p.participacoes.length).length,
    apoiadosDepois: projetos.filter(p => depois(p).length).length,
  };
}

/** Matriz projetos × editais, em ordem cronológica; a coluna do próprio edital vem marcada. */
export function matriz(edital, programaDoEdital, estagioDoEdital, projetos) {
  const colunas = new Map();
  const referencia = `${programaDoEdital}|${edital}`;
  const inicioEdital = projetos.map(p => p.inicio).filter(Boolean).sort()[0] || '';
  colunas.set(referencia, { chave: referencia, programa: programaDoEdital, edital, data: inicioEdital, referencia: true,
    estagio: estagioDoEdital });
  for (const p of projetos) {
    for (const x of p.participacoes) {
      const chave = `${x.programa}|${x.edital}`;
      const atual = colunas.get(chave);
      if (!atual) colunas.set(chave, { chave, programa: x.programa, edital: x.edital, data: x.data, estagio: estagioDe(x) });
      else if (x.data && (!atual.data || x.data < atual.data)) atual.data = x.data;
    }
  }
  // Em empate de data, o edital de referência vem primeiro: nada com a mesma data aparece "antes" dele.
  const ordenadas = [...colunas.values()].sort((a, b) =>
    (a.data || '9999').localeCompare(b.data || '9999') || (b.referencia ? 1 : 0) - (a.referencia ? 1 : 0)
    || a.chave.localeCompare(b.chave));
  const primeiraAntes = p => antes(p).map(x => x.data).sort()[0];
  const linhas = [...projetos].sort((a, b) => {
    const da = primeiraAntes(a), db = primeiraAntes(b);
    if (da && db) return da.localeCompare(db) || a.codigo.localeCompare(b.codigo);
    if (da || db) return da ? -1 : 1;
    return a.codigo.localeCompare(b.codigo);
  });
  const celulas = linhas.map(p => ordenadas.map(col => {
    if (col.referencia) {
      return { empresa: Boolean(p.empresa), coordenador: p.coordenador ? 'coordenou' : '', estagio: estagioDoEdital,
        referencia: true };
    }
    const aqui = p.participacoes.filter(x => `${x.programa}|${x.edital}` === col.chave);
    if (!aqui.length) return null;
    const coord = aqui.filter(x => x.via === 'coordenador');
    return {
      empresa: aqui.some(x => x.via === 'empresa'),
      coordenador: coord.some(x => x.papel === 'coordenou projeto') ? 'coordenou' : coord.length ? 'bolsa' : '',
      estagio: estagioDe(aqui[0]),
      antes: aqui.some(x => x.data && x.data < p.inicio),
    };
  }));
  return { colunas: ordenadas, linhas, celulas };
}
