# gerarTabelas.js

Plugin jquery para gerar tabelas dinamicamente. Integra com jQuery DataTables e tabelaMultipla.js (meu).

## OBS: Em desenvolvimento

Exemplo de uso

```javascript

const tabela = $('.meu-seletor').gerarTabela({
    cabecalho: ['Algo 1','Algo 2'],
    corpo: [ ['Algo 1 Linha1','Algo 2 Linha1'],['Algo 1 Linha2','Algo 2 Linha2'] ],
    classesTabela: ['minha-tabela'],
    linhaRemovida: function(linha, posicaoLinha, ultimaLinha, tabela){
        console.log(linha, tabela);
    },
    linhaAdicionada: function(linha,tabela){
        console.log(linha, tabela);
    },
    usarRemocaoLinha: false
})

```