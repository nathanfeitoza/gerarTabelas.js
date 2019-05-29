$.fn.gerarTabela = function(opcoes){
	const padrao = {
		cabecalho: [],
		corpo: [],
		classesTabela: [],
		idTabela: '',
		rolesTabela: {},
		usarRemocaoLinha: true,
		usarSelecaoLinha: false,
		linhaRemovida: function(linha, posicaoLinha, ultimaLinha, tabela){
			return [linha, tabela];
		},
		linhaAdicionada: function(linha,tabela){
			return [linha, tabela];
		},
		clickRemocaoLinha: function(linha, posicaoLinha, ultimaLinha, tabela) {
			return [linha, posicaoLinha, ultimaLinha, tabela];
		},
		dadosCorpoAsync: function(dados) {
			return dados;
		},
		linhaSelecionada: function(linha, posicaoLinha) {
			return [linha, posicaoLinha];
		},
		linhaDeselecionada: function(linha, posicaoLinha) {
			return [linha, posicaoLinha];
		},
		todasLinhasSelecionadas: function(linhas) {
			return linhas;
		},
		todasLinhasDeselecionadas: function(linhas) {
			return linhas;
		},
		tabelaCarregada: function(tabela) {
			return tabela;
		},
		removerLinhaClicadaAuto: true,
		tempoRemocaoLinha: 400, // em ms (milisegundos)
		iconeRemocao: '<i class="fas fa-trash"></i>',
		classesAdicionaisBotaoRemover: [],
		alinharBotaoRemocao: 'esq', // ou dir,
		alinharBotaoSelecao: 'esq', // ou dir,
		usarTabelasMultiplas: false,
		usarJqueryDataTable: false,
		opcoesTabelasMultiplas: undefined,
		opcoesJqueryDataTable: undefined,
		linhasInput: [],
		larguraColunasTabela: [],
	};

	let configs = $.extend( {}, padrao, opcoes );
	var elementoPai = this;

    elementoPai.tabelaFinalizada = false;
	var iconeRemocao = configs.iconeRemocao;
	var alinharBotaoRemocao = configs.alinharBotaoRemocao.toLowerCase();
	var alinharBotaoSelecao = configs.alinharBotaoSelecao.toLowerCase();
	var classeRemoverLinha = 'btn-remover-linha';
	var classeSelecionar = "selecionar-linha";
	var checkSelect = '<input type="checkbox" class="'+classeSelecionar+'">';

	function removerLinhas(botao, removerDireto) {
		var quantidadeBotoesRemocao = botao.closest('table').find('.'+classeRemoverLinha).length;
		var linha = botao.closest('tr');
		var quantidadeProxLinhas = linha.nextAll().length;
		var posicaoLinha = quantidadeBotoesRemocao - quantidadeProxLinhas;
		var ultimo = quantidadeProxLinhas == 0;
		
		if(removerDireto != true) configs.clickRemocaoLinha(linha, posicaoLinha, ultimo, elementoPai.tabelaFinalizada);
		
		if(configs.removerLinhaClicadaAuto || removerDireto == true) {
			linha.fadeOut(configs.tempoRemocaoLinha, function() {
			    var idLinha = $(this).attr('id');

                $(this).remove();

                if (tabelaJqueryDataTable != undefined) tabelaJqueryDataTable.row(':eq(' + (posicaoLinha - 1) + ')').remove().draw();

                configs.linhaRemovida(linha, posicaoLinha, ultimo, elementoPai.tabelaFinalizada);

			});
		}		
	}

	function ativarTabelasMultiplas(tabelaFinalizada) {
		if(tabelaFinalizada.closest('.TabelasMultiplas_scroll').length == 0) {
			return tabelaFinalizada.TabelaMultipla(configs.opcoesTabelasMultiplas);
		}
	}
	
	var tabelaJqueryDataTable = undefined;
	
	function ativarJqueryDataTable(tabelaFinalizada) {

			if(tabelaFinalizada.closest('.dataTables_wrapper').length == 0) {
				var opcoesDataTable = configs.opcoesJqueryDataTable;
				opcoesDataTable = opcoesDataTable == undefined ? {} : opcoesDataTable;
				
				var colunaAlvo = alinharBotaoRemocao === "esq" ? 0 : (tabelaFinalizada.find('thead > tr > th').length) - 1;
				var orderDataTable = colunaAlvo == 0 ? 1 : 0;

				var columnDefs = {
		            orderable: false,
		            targets:   colunaAlvo
	        	};

				if(configs.usarSelecaoLinha && configs.usarRemocaoLinha) {
					var colunaAlvo1 = alinharBotaoSelecao === "esq" ? 0 : (tabelaFinalizada.find('thead > tr > th').length) - 1;
					var colunaAlvo2 = alinharBotaoRemocao === "esq" ? 1 : (tabelaFinalizada.find('thead > tr > th').length) - 2;
					var ladosOpostos = alinharBotaoRemocao == "esq" && alinharBotaoSelecao == "dir";

					orderDataTable = 2;
					
					if(ladosOpostos) {
						colunaAlvo2 = 0;
						orderDataTable = 1;
					}
					orderDataTable = alinharBotaoRemocao == "dir" && alinharBotaoSelecao == "dir" ? 0 : orderDataTable;
					orderDataTable = alinharBotaoRemocao == "dir" && alinharBotaoSelecao == "esq" ? 0 : orderDataTable;

					columnDefs.targets = [colunaAlvo1,colunaAlvo2];
				}

	        	if(typeof opcoesDataTable.columnDefs != "undefined") {
	        		opcoesDataTable.columnDefs.push(columnDefs);
	        	} else {
				    if(configs.usarSelecaoLinha || configs.usarRemocaoLinha) opcoesDataTable.columnDefs = [columnDefs];
	        	}

				var dataTable = tabelaFinalizada.DataTable(opcoesDataTable);
				dataTable.order([[ orderDataTable, 'asc' ]] ).draw( false );

                tabelaJqueryDataTable = dataTable;
				
				return dataTable;
			}
	}

	/*
	 * Para definir larguras personalizadas para as colunas. 
	 * Ex de uso: larguraColunasTabela: ['10px','20px'] ou larguraColunasTabela: {"0": '20px',"3": '10px'}
	 */
	function ajustarColunas(colunas) {
		for(var i in colunas) {
			var thChild = parseInt(i) + 1;
			var largura = colunas[i];
			var buscarThead = elementoPai.tabelaFinalizada.closest('.TabelasMultiplas_scroll').length != 0 ? elementoPai.tabelaFinalizada.closest('.TabelasMultiplas_scroll') : elementoPai.tabelaFinalizada;

			buscarThead.find('thead > tr > th:nth-child(' + thChild + ')').css({width: largura});
			elementoPai.tabelaFinalizada.find('tbody> tr > td:nth-child(' + thChild + ')').css({width: largura});

		}
		return elementoPai.tabelaFinalizada;
	}

	function iniciarMontagemCorpo(tbody, addInicio) {
        var recarregarDataTable = false;

        if(tabelaJqueryDataTable != undefined) {
        	tabelaJqueryDataTable.destroy();
            recarregarDataTable = true;
        }

		for(var i in configs.corpo) {
			var corpoMontar = configs.corpo[i];
			var idLinha = (new Date()).getTime() * Math.ceil( Math.random() * 10 );
            var isJquery = false;

			var tr = $('<tr id="' + idLinha + '">');

			if(corpoMontar instanceof jQuery) {
				tr = corpoMontar;
				isJquery = true;
			}

			if(addInicio === false) { 
				tbody.prepend(tr); 
				tr = tbody.children('tr').first();
			} else { 
				tbody.append(tr); 
				tr = tbody.children('tr').last();
			}
			
			if(!Array.isArray(corpoMontar) && typeof corpoMontar == 'object') {
				corpoMontar = Object.values(corpoMontar);
			} 
			
			if(corpoMontar.length != configs.cabecalho.length) {
				var adicionar = ' '; var adicionarSelect = ' ';

				if(configs.usarRemocaoLinha) {
					var classesAdicionaisBtnRemover = configs.classesAdicionaisBotaoRemover.join(' ');

					adicionar = '<button type="button" role-id="' +idLinha+ '" class="' + classeRemoverLinha + ' ' + classesAdicionaisBtnRemover + '">' + iconeRemocao + '</button>';
				}

				if(configs.usarSelecaoLinha) {
					adicionarSelect = checkSelect;
				}

				if(configs.usarRemocaoLinha && alinharBotaoRemocao == 'esq') {
				    if(typeof corpoMontar[0] == "object") {
				        $(corpoMontar[0]).prepend($(`<td>${adicionar}</td>`))
                    } else {
                        corpoMontar.splice(0, 0, adicionar);
                    }
				} else if(configs.usarRemocaoLinha && alinharBotaoRemocao == 'dir'){
                    if(typeof corpoMontar[0] == "object") {
                        $(corpoMontar[0]).append($(`<td>${adicionar}</td>`))
                    } else {
                        corpoMontar.push(adicionar);
                    }
				}

				if(configs.usarSelecaoLinha && alinharBotaoSelecao == 'esq') {
                    if(typeof corpoMontar[0] == "object") {
                        $(corpoMontar[0]).prepend($(`<td>${adicionarSelect}</td>`))
                    } else {
                        corpoMontar.splice(0, 0, adicionarSelect);
                    }
				} else if(configs.usarSelecaoLinha){
					if(configs.usarRemocaoLinha && alinharBotaoRemocao == 'dir') {
                        if(typeof corpoMontar[0] == "object") {
                            $(corpoMontar[0]).append($(`<td>${adicionarSelect}</td>`))
                        } else {
                            corpoMontar.splice((corpoMontar.length - 1),0,adicionarSelect);
                        }

					} else {
                        if(typeof corpoMontar[0] == "object") {
                            $(corpoMontar[0]).append($(`<td>${adicionarSelect}</td>`))
                        } else {
                            corpoMontar.push(adicionarSelect);
                        }
					}
				}
			}

			if(isJquery) {
				var linha = $(corpoMontar[0]);
                elementoPai.tabelaFinalizada = linha.closest('table');
			} else {
                for (var j in corpoMontar) {
                    var valorTd = corpoMontar[j];

                    if (!(valorTd instanceof jQuery)) {
                        var title = /<[a-z][\s\S]*>/i.test(valorTd) == false ? valorTd : '';
                        var linha = tr.append('<td title=" ' + title + ' ">' + valorTd + '</td>');
                        elementoPai.tabelaFinalizada = linha.closest('table');
                    }
                }
            }

            configs.linhaAdicionada(linha, elementoPai.tabelaFinalizada)
		}

        elementoPai.tabelaFinalizada = ajustarColunas(configs.larguraColunasTabela)

		/**
		 * Para ativar o evento de clique no botão de remoção
		 */
        elementoPai.tabelaFinalizada.find('.'+classeRemoverLinha).off('click').on('click',function(){
			removerLinhas($(this));
		})

		/**
		 * Para selecionar uma linha da tabela
		 */
        elementoPai.tabelaFinalizada.find('tbody .'+classeSelecionar).off('click').on('click', function(){
			var linha = $(this).closest('tr');
			var linhasTotais = linha.closest('tbody').find('tr').length;
			var linhasNext = linha.nextAll().length;
			var posicaoLinha = linhasTotais - linhasNext;
			var selecionar = $(this).is(':checked');
			linha.prop('checked', selecionar);

			if(selecionar) configs.linhaSelecionada(linha, posicaoLinha);
			else configs.linhaDeselecionada(linha, posicaoLinha);			
		});

        /*
		 * Para determinar se os plugins de tabelasMultiplas ou dataTables serão usados;
		 */
        if(configs.usarTabelasMultiplas) {
            ativarTabelasMultiplas(elementoPai.tabelaFinalizada);
        } else if(configs.usarJqueryDataTable || recarregarDataTable) {
            ativarJqueryDataTable(elementoPai.tabelaFinalizada);
        }
	}
	
	/**
	 * Para adicionar linhas avulsas
	 */
	this.adicionarLinha = function(adicionar, addInicio) {
		if(elementoPai.tabelaFinalizada == false) {
			console.error('É necessário iniciar uma tabela com dados antes de adicionar uma linha avulsa');
			return false;
		}

		var manter = configs.corpo;
		manter.push(adicionar);

		configs.corpo = adicionar;
		iniciarMontagemCorpo(elementoPai.tabelaFinalizada.find('tbody'), addInicio);

		configs.corpo = manter;
		return this;
	}

	/**
	 * Para remover linhas automaticamente em código
	 */
	this.removerLinha = function(idLinha) {
		idLinha = typeof idLinha == "string" ? $("#" + idLinha) : idLinha;
		var botao = idLinha.find('.' + classeRemoverLinha);
		removerLinhas(botao, true);
		return this;
	}

	this.ativarTabelasMultiplas = function() {
		return ativarTabelasMultiplas(elementoPai.tabelaFinalizada);
	}

	this.ativarJqueryDataTable = function() {
		return ativarJqueryDataTable(elementoPai.tabelaFinalizada);
	}

	this.ajustarColunas = function(colunas) {
		ajustarColunas(colunas);
		return this;
	}

	this.limparTabela = function() {
        if(tabelaJqueryDataTable != undefined) tabelaJqueryDataTable.clear().draw();
        elementoPai.tabelaFinalizada.find('tbody > tr').remove();
		return this;
	}

	this.countRegistros = function() {
		return elementoPai.tabelaFinalizada.find('tbody tr').length
	}

	this.objJqueryDataTable = function() {
		return tabelaJqueryDataTable;
	}

	return this.each(function(i, elementoLoop) {
		var classesTabelaUsar = configs.classesTabela.join(' ');
		var roles = '';
		
		for(var i in configs.rolesTabela) {
			roles += i + '=' + configs.rolesTabela[i];
		}

		var cabecalho = opcoes.cabecalho != undefined ? opcoes.cabecalho.slice() : configs.cabecalho.slice();

		var tabela = $('<table class="' + classesTabelaUsar + '" id="' + configs.idTabela + '" ' + roles + '>');
		var thead = $('<thead>');
		var tbody = $('<tbody>');

		tabela.append(thead);
		tabela.append(tbody);
		$(elementoLoop).append(tabela);
		
		thead = $(elementoLoop).find('thead');
		tbody = $(elementoLoop).find('tbody');

		thead.append($('<tr>'));
		
		/*
		 * Para definir se irá usar o botão de remover linha ou não.
		 */
		if(configs.usarRemocaoLinha) {
			if(alinharBotaoRemocao == 'esq') {
                cabecalho.splice(0,0,iconeRemocao)
			} else {
                cabecalho.push(iconeRemocao);
			}
		}		

		if(configs.usarSelecaoLinha) {
			if(alinharBotaoSelecao == 'esq') {
                cabecalho.splice(0,0,checkSelect)
			} else {
				if(configs.usarRemocaoLinha && alinharBotaoRemocao == 'dir') {
                    cabecalho.splice((cabecalho.length - 1),0,checkSelect);
				} else {
                    cabecalho.push(checkSelect);
				}
			}
		}

		/*
		 * Para criar o cabecalho da tabela.
		 * Ex de uso: cabecalho: ['Algo1', 'Algo2', 'Algo3']
		 */
		for(var i in cabecalho) {
			var th = cabecalho[i];
			thead.children('tr').append('<th>' + th + '</th>');
		}

		/**
 		 * Para selecionar ou deselecionas todas as linhas da tabela
		 */
		thead.find('.'+classeSelecionar).off('click').on('click', function(){
			var tabela = $(this).closest('table');
			var linhas = tabela.find('tbody .'+classeSelecionar);
			var selecionar = $(this).is(':checked');
			linhas.prop('checked', selecionar);

			if(selecionar) configs.todasLinhasSelecionadas(linhas);
			else configs.todasLinhasDeselecionadas(linhas);
		})

		/*
		 * Para preencher o copor da tabela.
		 * Ex de uso: corpo: [{nome: 'nome',id: 'adsa',teste: 'teste'},
						['corpoAlgo1','corpoAlgo2','corpoAlgo3'],
						['corpoAlgo1','corpoAlgo2','corpoAlgo3']]
						ou 
						
						corpo: [['corpoAlgo1','corpoAlgo2','corpoAlgo3'],
						['corpoAlgo1','corpoAlgo2','corpoAlgo3']]
						ou, para uso asincrono
						
						corpo: function(){
							var este = this;
							setTimeout(function(){
								var dados_corpo = [{nome: 'nome',id: 'adsa',teste: 'teste'},
								['corpoAlgo1','corpoAlgo2','corpoAlgo3'],
								['corpoAlgo1','corpoAlgo2','corpoAlgo3']];

								return este.dadosCorpoAsync(dados_corpo);
							}, 600)
						}
		 */
		
		configs.cabecalho = cabecalho;

		if(typeof configs.corpo == "function") {
			configs.corpo();
			configs.dadosCorpoAsync = function(dados) {
				configs.corpo = dados;
				iniciarMontagemCorpo(tbody);
			}
		
		} else {
			iniciarMontagemCorpo(tbody);
		}

		configs.tabelaCarregada(elementoPai.tabelaFinalizada);
	})
}