# Painel da Trilha de Programas de Empreendedorismo Inovador de Pernambuco — versão para avaliação

Site estático gerado por `painel/exportar_site.py` (repositório do TCC), para os gestores da
SECTI-PE/FACEPE avaliarem. Mostra números agregados e gráficos, alguns com nomes de pessoas e empresas
(publicados pela FACEPE ou, para empresas sem nome publicado, a sigla do AgilFAP); não contém o
grafo, dados de processo nem CPF. Não edite à mão: exporte de novo e envie.

## Publicar

1. Settings > Pages > Build and deployment > Source: **GitHub Actions**.
2. Settings > Secrets and variables > Actions > Variables: crie `PUBLICAR_ATE` (último dia no
   ar, `AAAA-MM-DD`) e, se quiser, `PUBLICAR_DE` (primeiro dia).
3. Envie (push) para a branch `main`. O endereço aparece em Settings > Pages.

## Prorrogar ou tirar do ar

- Prorrogar: mude `PUBLICAR_ATE` e rode Actions > Publicar > Run workflow.
- Tirar do ar antes da data: ponha em `PUBLICAR_ATE` a data de ontem e rode o mesmo fluxo; ou
  Settings > Pages > Unpublish site.
- Depois da data, o fluxo diário (00:10 de Recife) troca o site pela página "fora do ar".

Tirar do ar não apaga cópias que alguém tenha salvado: o link só deve ir para quem vai avaliar.
