import React, { Component, Fragment } from 'react';
import { Checkbox, Chip, Icon, CollapsibleItem, Collapsible } from 'react-materialize';
import DirectTituloJanela from '../../../../Components/Globals/DirectTituloJanela';
import SaibRadioGroup from '../../../../Components/Globals/SaibRadioGroup';
import WaitScreen from '../../../../Components/Globals/WaitScreen';
import Header from '../../../../Components/System/Header';
import Calendar from '../../../../Components/Globals/Calendar';
import M from 'materialize-css';
import {
  Container,
  Linha,
  DivDetalhe,
  ContentBodyCollapsible,
  DataFilter,
  RowFilter,
  ContentItem,
  Labels,
} from './styled';
import { alerta, dateFormat, capitalize, formatDateTimeToBr, formatFloatBr } from '../../../../services/funcoes';
import api from '../../../../services/api';
import { getFromStorage } from '../../../../services/auth';
import SearchReportContext from '../../../../providers/reportSearch';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// import pdfFonts from '../../../../services/vfs_custom_fonts';
pdfMake.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  }
};
pdfMake.vfs = pdfFonts.pdfMake.vfs;
export default class SearchsReport extends Component {
  state = {
    dateInitial: null,
    dateFinal: null,
    loading: false,
    openDocument: false,
    searchs: [],
    searchsSelected: [],
    promotores: [],
    supervisores: [],
    professionalsSelected: [],
    filterTypeProfessional: '2',
    filterTypeReport: '0',
    dataReport: [],
    reportData: undefined
  };

  buttonRef = React.createRef(null);

  async componentDidMount() {
    SearchsReport.contextType = SearchReportContext;
    this.setState({
      loading: true,
    });
    await this.carregarVariaveisEstado();
    await this.handleSearchs();
    await this.handlePromotersAndSupervisors();
    this.setDataOfBackPerContext();
  }

  handlePrepareData = async (data, filterTypeReport) => {
    if (filterTypeReport === '0') {
      for (const item of data.PESQUISAS) {
        if (item.AGRUPAMENTOS) {
          for (let agrupamento of item.AGRUPAMENTOS) {
            for (let item of agrupamento.ITEMS) {
              for (let pergunta of item.PERGUNTAS) {
                if (pergunta.PERGUNTA_TIPO_CAMPO === 7) {
                  // //console.log(pergunta.PERGUNTA_RESPOSTA);
                  // fetch(pergunta.PERGUNTA_RESPOSTA).then((ss) => //console.log(ss));
                  // this.toDataURL(pergunta.PERGUNTA_RESPOSTA);
                }
                this.handlePrepareFildsTypeNumber(pergunta);
              }
            }
          }
        } else {
          this.handlePrepareFildsTypeNumber(item);
        }
      }
    } else {
      this.handlePrepareFildsTypeNumber(data);
    }
  };

  getBase64FromUrl = async (url) => {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        resolve(base64data);
      };
    });
  };

  handlePrepareFildsTypeNumber = (field) => {
    if (field.PERGUNTA_TIPO_CAMPO === 1 || field.PERGUNTA_TIPO_CAMPO === 2) {
      field.PERGUNTA_RESPOSTA = parseInt(field.PERGUNTA_RESPOSTA).toFixed(1);
    } else if (field.PERGUNTA_TIPO_CAMPO === 3) {
      field.PERGUNTA_RESPOSTA = parseInt(field.PERGUNTA_RESPOSTA).toFixed(2);
    } else if (field.PERGUNTA_TIPO_CAMPO === 9) {
      field.PERGUNTA_RESPOSTA = formatFloatBr(parseFloat(String(field.PERGUNTA_RESPOSTA).replace(',', '.')));
    }
  };

  verifyMoreNumberOfQuestionsInItems = (searchs) => {
    searchs &&
      searchs.forEach((search) => {
        const allQuestionsAnswered = [];
        search.AGRUPAMENTOS &&
          search.AGRUPAMENTOS.forEach((agrupamento) => {
            agrupamento.ITEMS.forEach((item) => {
              item.PERGUNTAS.forEach((pergunta) => {
                const questionAdded = this.verifyIsAddedQuestion(allQuestionsAnswered, pergunta);
                if (!questionAdded) allQuestionsAnswered.push(pergunta);
              });
            });
          });
        if (allQuestionsAnswered.length > 0) {
          allQuestionsAnswered.forEach((question, i) => {
            question.position = i;
          });
        }
        if (search.AGRUPAMENTOS) {
          this.setPositionQuestionsAnswered(search, allQuestionsAnswered);
          search.allQuestionsAnswered = allQuestionsAnswered;
        }
      });
  };

  verifyIsAddedQuestionReportSynthetic = (arrQuestions, question) => {
    if (arrQuestions.length > 0) {
      return !arrQuestions.every((question_) =>
        question_.DESCRICAO.split(' > ')[3] === question.DESCRICAO.split(' > ')[3] ? false : true
      );
    } else {
      return false;
    }
  };

  verifyIsAddedQuestion = (arrQuestions, question) => {
    if (arrQuestions.length > 0) {
      return !arrQuestions.every((question_) =>
        question_.PERGUNTA_DESCRICAO === question.PERGUNTA_DESCRICAO ? false : true
      );
    } else {
      return false;
    }
  };

  returnPositionQuestionInQuestionsAnswered = (question, allQuestionsAnswered) => {
    const { filterTypeReport } = this.state;
    if (filterTypeReport === '1') {
      const qst = allQuestionsAnswered.find(
        (question_) => question_.DESCRICAO.split(' > ')[3] === question.DESCRICAO.split(' > ')[3]
      );
      return qst.position;
    } else {
      const qst = allQuestionsAnswered.find(
        (question_) => question_.PERGUNTA_DESCRICAO === question.PERGUNTA_DESCRICAO
      );
      return qst.position;
    }
  };

  setPositionQuestionsReportSyntheticAnswered = (search, allQuestionsAnswered) => {
    Object.keys(search.AGRUPAMENTOS).forEach((key) => {
      const agupamento = search.AGRUPAMENTOS[key];
      Object.keys(agupamento).forEach((key_) => {
        const items = agupamento[key_];
        Object.keys(items).forEach((chave) => {
          items[chave].PERGUNTAS.forEach((pergunta) => {
            pergunta.position = this.returnPositionQuestionInQuestionsAnswered(pergunta, allQuestionsAnswered);
          });
          items[chave].PERGUNTAS.sort((a, b) => {
            return a.position - b.position;
          });
        });
      });
    });
  };

  setPositionQuestionsAnswered = (search, allQuestionsAnswered) => {
    search.AGRUPAMENTOS.forEach((agrupamento) => {
      agrupamento.ITEMS.forEach((item) => {
        item.PERGUNTAS.forEach((pergunta) => {
          //verificar posição dessa pergunta nas perguntas perguntas respondidas
          pergunta.position = this.returnPositionQuestionInQuestionsAnswered(pergunta, allQuestionsAnswered);
        });
        item.PERGUNTAS.sort((a, b) => {
          return a.position - b.position;
        });
        // while (item.PERGUNTAS.length < allQuestionsAnswered.length) {
        //   item.PERGUNTAS.push({
        //     active: false,
        //   });
        // }
      });
    });
  };

  handleAgroupedSeachSynthetic = (data) => {
    const searchAgruped = data.filter((data) => data.AGRUPADA);

    for (let search of searchAgruped) {
      let groupings = search.PERGUNTAS.reduce((r, a) => {
        r[`${a.DESCRICAO.split(' > ')[0]}`] = [...(r[a.DESCRICAO.split(' > ')[0]] || []), a];

        return r;
      }, {});

      search.AGRUPAMENTOS = groupings;

      Object.keys(search.AGRUPAMENTOS).forEach((key) => {
        let items = search.AGRUPAMENTOS[key].reduce((r, a) => {
          r[a.DESCRICAO.split(' > ')[1]] = [...(r[a.DESCRICAO.split(' > ')[1]] || []), a];

          return r;
        }, {});
        search.AGRUPAMENTOS[key].ITEMS = items;

        Object.keys(items).forEach((key_) => {
          const oldData = Object.assign(items[key_], {});
          this.handleAvaliateValues(oldData);
          items[key_] = [];
          items[key_].PERGUNTAS = oldData;
        });
      });

      Object.keys(groupings).forEach((key) => {
        Object.keys(groupings[key]).forEach((key_) => {
          if (key_ !== 'ITEMS') {
            delete groupings[key][key_];
          }
        });
      });
    }

    const newSearchs = data.filter((data) => !data.AGRUPADA).concat(searchAgruped);

    for (let search of newSearchs) {
      if (!search.AGRUPADA) {
        this.handleAvaliateValues(search.PERGUNTAS);
      }
      search.PERGUNTAS.forEach((pergunta) => {
        if (pergunta.ESTATISTICA.TIPO.includes('% RESPONDIDO')) {
          pergunta.ESTATISTICA.VALOR = pergunta.ESTATISTICA.VALOR + '%';
        } else if (pergunta.ESTATISTICA.TIPO.includes('SOMATÓRIO')) {
          pergunta.ESTATISTICA.VALOR = pergunta.ESTATISTICA.VALOR.toFixed(2);
        } else if (pergunta.ESTATISTICA.TIPO.includes('MÉDIA')) {
          pergunta.ESTATISTICA.VALOR = pergunta.ESTATISTICA.VALOR.toFixed(1);
        }
      });
    }
    this.setState(
      {
        dataReport_: newSearchs,
      }
      // () => this.handleAvaliateValues()
    );
  };

  handleAvaliateValues = (perguntas) => {
    perguntas.forEach((pergunta) => {
      if (pergunta.TIPO_CAMPO === 12) {
        const newValue = pergunta.ESTATISTICA.VALOR + '%';
        if (pergunta.ESTATISTICA.VALOR >= 75 && pergunta.ESTATISTICA.VALOR <= 100) {
          pergunta.note = 'NPS (Excelência)';
          pergunta.color = '#0D22FF';
          pergunta.icon = 0;
        } else if (pergunta.ESTATISTICA.VALOR >= 50 && pergunta.ESTATISTICA.VALOR <= 74) {
          pergunta.note = 'NPS (Qualidade)';
          pergunta.color = '#4AB312';
          pergunta.icon = 1;
        } else if (pergunta.ESTATISTICA.VALOR >= 0 && pergunta.ESTATISTICA.VALOR <= 49) {
          pergunta.note = 'NPS (Aperfeiçoamento)';
          pergunta.color = '#000';
          pergunta.icon = 2;
        } else if (pergunta.ESTATISTICA.VALOR >= -100 && pergunta.ESTATISTICA.VALOR <= -1) {
          pergunta.color = '#FF0000';
          pergunta.icon = 3;
          pergunta.note = 'NPS (Crítica)';
        }
        pergunta.ESTATISTICA.VALOR = newValue;
      } else if (pergunta.TIPO_CAMPO === 13) {
        const newValue = pergunta.ESTATISTICA.VALOR + '%';
        pergunta.ESTATISTICA.VALOR = newValue;
      }
    });
  };

  handlePrepareDataReportSynthetic = (dataReport, filterTypeReport) => {
    //console.log('handlePrepareDataReportSynthetic => this.props', this.props);

    try {
      if (filterTypeReport === '1') {
        this.setState(
          {
            reportData: dataReport,
          },
          () => {
            this.handleAgroupedSeachSynthetic(dataReport);
          }
        );
      } else {
        this.setState({
          reportData: dataReport,
        });
      }
    } catch (error) {
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  setDataOfBackPerContext = () => {
    const { dateInitial, dateFinal, typeReport, idSearchsSelected } = this.context;
    if (idSearchsSelected.length > 0) {
      let { pesquisas } = this.state;
      for (const pesquisa of pesquisas) {
        let finded = idSearchsSelected.filter((item) => item === pesquisa.GAP_ID);
        pesquisa.checked = finded.length > 0;
      }
      this.setState({
        pesquisas,
        idSearchsSelected,
      });
    }
    this.setState(
      {
        dateInitial: dateInitial,
        dateFinal: dateFinal,
        filterTypeReport: typeReport,
      },
      () =>
        this.setState({
          loading: false,
        })
    );
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      empresaCnpj: sessao.empresaCnpj,
      codigoEmpresa: sessao.codigoEmpresa,
      razaoSocial: sessao.empresaRazaoSocial,
      gupFlagAgenda: sessao.gupFlagAgenda,
    });
  };

  handleSearchs = async () => {
    try {
      const res = await api.post(`v1/searchs/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`);
      const { data, sucess } = res.data;
      let pesquisas = [];
      let idSearchsSelected = [];
      // //console.log('data', data);
      if (sucess) {
        let pesquisasChips = {};
        for (const pesquisa of data) {
          let item = pesquisa.GAP_ID + ' - ' + pesquisa.GAP_DESCRICAO;
          pesquisasChips[item] = null;
          if (pesquisa.GAP_FLG_STATUS === 1) {
            pesquisa.checked = true;
            pesquisas.push(pesquisa);
            idSearchsSelected.push(pesquisa.GAP_ID);
          }
        }
        // //console.log('pesquisas', pesquisas);
        pesquisas = pesquisas.sort((a, b) => {
          return a.GAP_DESCRICAO < b.GAP_DESCRICAO ? -1 : 0;
        });
        this.setState({
          searchs: data,
          pesquisasChips,
          pesquisas,
          idSearchsSelected,
        });
      } else {
        alerta('Erro ao carregar pesquisas');
      }
    } catch (error) {
      alerta('Erro ao carregar pesquisas');
    }
  };

  removeUnselectedSearches = (searchsSelected) => {
    const { dataReport } = this.state;

    for (let item of dataReport) {
      for (let pesquisa of item.PESQUISAS) {
        let existe = searchsSelected.find((item_) => item_.GAP_ID === pesquisa.PESQUISA_ID);
        pesquisa.active = existe !== undefined ? 1 : 0;
      }
    }

    this.setState({
      dataReport,
      loading: false,
    });
  };

  handleDataReport = async () => {
    this.setState({
      loading: true,
    });
    const {
      dateFinal,
      filterTypeProfessional,
      idsPromoters,
      idsSupervisors,
      filterTypeReport,
    } = this.state;
    const { dateInitial } = this.context;
    let researchers = '';

    if (filterTypeProfessional === '1' && idsPromoters) {
      let stringIds = '';
      idsPromoters &&
        idsPromoters.forEach((id, i) => {
          if (i > 0) {
            stringIds = stringIds + ', ' + id;
          } else {
            stringIds = stringIds + id;
          }
        });
      researchers = stringIds;
    } else if (filterTypeProfessional === '0' && idsSupervisors) {
      let stringIds = '';
      idsSupervisors.forEach((id, i) => {
        if (i > 0) {
          stringIds = stringIds + ', ' + id;
        } else {
          stringIds = stringIds + id;
        }
      });
      researchers = stringIds;
    }

    try {
      const dataToSend = {
        dataPesquisaInicial: dateFormat(dateInitial, 'DD/MM/yyyy'),
        dataPesquisaFinal: dateFormat(dateFinal, 'DD/MM/yyyy'),
        pesquisadores: researchers,
        somentePromotores:
          filterTypeProfessional === 2 ? false : filterTypeProfessional === '1' ? true : false,
        somenteSupervisores:
          filterTypeProfessional === 2 ? false : filterTypeProfessional === '0' ? true : false,
      };
      let res;
      if (filterTypeReport === '0') {
        //analitico
        res = await api.post(
          `v1/tradereport/searchs/analytics/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
          dataToSend
        );
      } else if (filterTypeReport === '1') {
        //sintetico
        res = await api.post(
          `v1/tradereport/searchs/synthetic/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
          dataToSend
        );
      }
      const { sucess, data } = res.data;

      if (sucess) {
        if (filterTypeReport === '0') {
          for (let item of data) {
            for (let pesquisa of item.PESQUISAS) {
              pesquisa.active = 1;
            }
          }
        } else {
          for (let item of data) {
            item.active = 1;
          }
        }
        this.setState(
          {
            dataReport: data,
            allDataReport: data,
          },
          async () => {
            await this.handleSearchsSelected();

            if (data.length < 1) {
              alerta('Sem dados para exibição do relatório');
            } else {
              this.handlePrepareDataReportSynthetic(data, filterTypeReport)
              data.forEach(async element => {
                await this.handlePrepareData(element, filterTypeReport);
                if (filterTypeReport === '0') {
                  this.verifyMoreNumberOfQuestionsInItems(element.PESQUISAS);
                }
              });
              if (filterTypeReport === '0') {
                this.handlePdfAnalytic(dataToSend)
              } else if (filterTypeReport === '1') {
                this.handlePdfSynthetic(dataToSend)
              }
            }
          }
        );
      } else {
        alerta('Erro ao carregar dados do relatório');
      }
    } catch (error) {
      alerta('Erro ao carregar dados do relatório');
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  handlePdfAnalytic = (infoRequest) => {
    const { codigoEmpresa, razaoSocial, dataReport } = this.state

    const pdf = {
      content: [
        {
          text: `Relatório Analítico de Pesquisas referente à ${infoRequest.dataPesquisaInicial} até ${infoRequest.dataPesquisaFinal}`,
          style: 'header',
          alignment: 'center'
        },
        {
          columns: [
            {
              text: `${codigoEmpresa} - ${razaoSocial}`,
              style: 'nameCompany',
              alignment: 'left',
            },
            {
              text: formatDateTimeToBr(new Date()),
              style: 'hourGenerate',
              alignment: 'right',
            },
          ],
        },

        dataReport.map(element => {
          return [
            {
              text: `${element.CLI_ID} - ${element.CLI_NOME_FANTASIA}`,
              style: 'nameCompanySearch',
              alignment: 'left',
              font: 'Roboto'
            },
            element.PESQUISAS && element.PESQUISAS.filter(e => e.active).map(pesquisa => {
              return [
                {
                  text: pesquisa.PESQUISA_DESCRICAO,
                  style: 'titleRelatorio',
                  alignment: 'center',
                  font: 'Roboto'
                },
                pesquisa.AGRUPAMENTOS ? (pesquisa.AGRUPAMENTOS.map(agrup => {
                  return [
                    agrup.ITEMS && agrup.ITEMS.map(item => {
                      return [
                        {
                          text: `${agrup.AGRUPA_DESCRICAO} -> ${item.ITEM_DESCRICAO}`,
                          style: 'ul',
                          bold: true,
                          alignment: 'left',
                          font: 'Roboto'
                        },

                        item.PERGUNTAS && item.PERGUNTAS.map(question => {
                          return [
                            {
                              alignment: 'justify',
                              columns: [
                                {
                                  text: capitalize(question.PERGUNTA_DESCRICAO, true),
                                  style: 'liLeft',
                                  bold: false,
                                  alignment: 'left',
                                  font: 'Roboto'
                                },
                                {
                                  text: capitalize(question.PERGUNTA_RESPOSTA, true),
                                  style: 'li',
                                  bold: false,
                                  alignment: 'right',
                                }
                              ]
                            },
                            {
                              text: '_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________',
                              style: 'line',
                            }
                          ]
                        }),
                      ]
                    })
                  ]
                })
                ) : pesquisa.PERGUNTAS && pesquisa.PERGUNTAS.map(question => {
                  return [
                    {
                      alignment: 'justify',
                      columns: [
                        {
                          text: capitalize(question.PERGUNTA_DESCRICAO, true),
                          style: 'liLeft',
                          bold: false,
                          alignment: 'left',
                        },
                        {
                          text: capitalize(question.PERGUNTA_RESPOSTA, true),
                          style: 'li',
                          bold: false,
                          alignment: 'right',
                        }
                      ],
                    },
                    {
                      text: '_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________',
                      style: 'line',
                    }
                  ]
                }),
              ]
            }),
          ]
        }),
      ],
      styles: {
        header: {
          fontSize: 12,
          bold: true,
          alignment: 'justify',
          margin: [0, -30, 0, 14],
        },
        nameCompany: {
          fontSize: 12,
          alignment: 'justify',
          background: "#ededed",
          margin: [-30, 0, 0, 5],
        },
        hourGenerate: {
          fontSize: 10,
          alignment: 'justify',
          background: "#ededed",
          margin: [0, 0, -30, 5],
        },
        nameCompanySearch: {
          fontSize: 12,
          alignment: 'justify',
          background: "#ededed",
          margin: [-30, 20, 0, 0],
          bold: true,
          decoration: 'underline',
        },
        titleRelatorio: {
          fontSize: 12,
          alignment: 'justify',
          margin: [0, 10, 0, 5],
          bold: true,
          decoration: 'underline',
          decorationStyle: 'dotted'
        },
        ul: {
          fontSize: 10,
          alignment: 'justify',
          color: "#000",
          margin: [-30, 5, 0, 0],
        },
        liLeft: {
          fontSize: 10,
          alignment: 'justify',
          color: "#595959",
          margin: [-30, 4, 0, 0],
        },
        li: {
          fontSize: 10,
          alignment: 'justify',
          color: "#595959",
          margin: [0, 4, 35, 0],
        },
        line: {
          fontSize: 5,
          color: '#9e9e9e',
          alignment: 'justify',
          margin: [-30, 0, -30, 0]
        }
      }
    }
    const pdfGenerator = pdfMake.createPdf(pdf);
    pdfGenerator.getBlob((blob) => {
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
    });
  }

  handlePdfSynthetic = (infoRequest) => {
    const { codigoEmpresa, razaoSocial, dataReport } = this.state

    const pdf = {
      content: [
        {
          text: `Relatório Sintético de Pesquisas referente à ${infoRequest.dataPesquisaInicial} até ${infoRequest.dataPesquisaFinal}`,
          style: 'header',
          alignment: 'center',
          font: 'Roboto'
        },
        {
          columns: [
            {
              text: `${codigoEmpresa} - ${razaoSocial}`,
              style: 'nameCompany',
              alignment: 'left',
              font: 'Roboto'
            },
            {
              text: formatDateTimeToBr(new Date()),
              style: 'hourGenerate',
              alignment: 'right',
              font: 'Roboto'
            },
          ],
        },
        dataReport.map(element => {
          return [
            {
              text: element.DESCRICAO,
              style: 'titleRelatorio',
              alignment: 'center',
              font: 'Roboto'
            },
            element.AGRUPAMENTOS ? (Object.keys(element.AGRUPAMENTOS).map((key) => {
              const items = element.AGRUPAMENTOS[key].ITEMS;
              return (
                Object.keys(items).map((itemKey, i) => {
                  const questions = items[itemKey];
                  return [
                    {
                      text: `${key} -> ${itemKey}`,
                      style: 'nameSearch',
                      alignment: 'left',
                      font: 'Roboto'
                    },
                    questions.PERGUNTAS.map(question => {
                      return [
                        {
                          columns: [
                            {
                              text: capitalize(question.DESCRICAO.split(' > ')[2], true),
                              style: 'titleSearch',
                              alignment: 'left',
                              font: 'Roboto',
                              width: "65%"
                            },
                            {
                              width: "*",
                              columns: [
                                {
                                  text: question.TIPO_CAMPO === 12 ? question.note : question.ESTATISTICA.TIPO,
                                  style: 'typeSearch',
                                  alignment: 'right',
                                  font: 'Roboto',
                                  color: question.TIPO_CAMPO === 12 ? question.color : "#595959",
                                  width: "60%"
                                },
                                {
                                  text: question.TIPO_CAMPO === 9 ? `R$ ${parseInt(question.ESTATISTICA.VALOR).toFixed(2).toString().replaceAll(".", ",")}` : question.TIPO_CAMPO === 2 ? parseInt(question.ESTATISTICA.VALOR) : question.ESTATISTICA.VALOR,
                                  style: 'resultSearch',
                                  alignment: 'right',
                                  font: 'Roboto',
                                  color: question.TIPO_CAMPO === 12 ? question.color : "#595959",
                                  width: "*"
                                },
                              ]
                            },
                          ],
                        },
                        {
                          text: '_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________',
                          style: 'line',
                        }
                      ]

                    })
                  ]


                })
              )


            })) : (
              element.PERGUNTAS && element.PERGUNTAS.map(question => {
                return [
                  {
                    columns: [
                      {
                        text: capitalize(question.DESCRICAO, true),
                        style: 'titleSearch',
                        alignment: 'left',
                        font: 'Roboto',
                        width: "65%"
                      },
                      {
                        width: "*",
                        columns: [
                          {
                            text: question.TIPO_CAMPO === 12 ? question.note : question.ESTATISTICA.TIPO,
                            style: 'typeSearch',
                            alignment: 'right',
                            font: 'Roboto',
                            color: question.TIPO_CAMPO === 12 ? question.color : "#595959",
                            width: "60%"
                          },
                          {
                            text: question.TIPO_CAMPO === 9 ? `R$ ${question.ESTATISTICA.VALOR.replaceAll(".", ",").toFixed(2)}` : question.TIPO_CAMPO === 2 ? parseInt(question.ESTATISTICA.VALOR) : question.ESTATISTICA.VALOR,
                            style: 'resultSearch',
                            alignment: 'right',
                            font: 'Roboto',
                            color: question.TIPO_CAMPO === 12 ? question.color : "#595959",
                            width: "*"
                          },
                        ]
                      },
                    ],
                  },
                  {
                    text: '_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________',
                    style: 'line',
                  }
                ]
              })
            )
          ]
        })

      ],
      styles: {
        header: {
          fontSize: 12,
          bold: true,
          alignment: 'justify',
          margin: [0, -30, 0, 14],
        },
        nameCompany: {
          fontSize: 12,
          alignment: 'justify',
          background: "#ededed",
          margin: [-30, 0, 0, 0],
        },
        hourGenerate: {
          fontSize: 10,
          alignment: 'justify',
          background: "#ededed",
          margin: [0, 0, -30, 0],
        },
        titleRelatorio: {
          fontSize: 12,
          alignment: 'justify',
          margin: [0, 20, 0, 5],
          bold: true,
          decoration: 'underline',
          decorationStyle: 'dotted'
        },
        nameSearch: {
          fontSize: 10,
          alignment: 'justify',
          color: "#000",
          bold: true,
          margin: [-30, 10, 0, 0]
        },
        titleSearch: {
          fontSize: 10,
          alignment: 'justify',
          color: "#595959",
          margin: [-30, 4, 0, 0]
        },
        typeSearch: {
          fontSize: 10,
          alignment: 'justify',
          color: "#595959",
          margin: [0, 4, 0, 0]
        },
        resultSearch: {
          fontSize: 10,
          alignment: 'justify',
          color: "#595959",
          margin: [0, 4, -30, 0]
        },
        line: {
          fontSize: 5,
          color: '#9e9e9e',
          alignment: 'justify',
          margin: [-30, 0, -30, 0]
        }
      }
    }
    const pdfGenerator = pdfMake.createPdf(pdf);
    pdfGenerator.getBlob((blob) => {
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
    });
  }

  handlePromotersAndSupervisors = async () => {
    const { usuarioAtivo, gupFlagAgenda } = this.state
    const url = `v1/users/${this.state.empresaAtiva}`;
    try {
      const res = await api.get(url);
      const { data, sucess } = res.data;
      if (sucess) {
        let promoters = data.filter((user) => user.USR_GMOVEL_PROMOTOR === 'V');
        promoters = gupFlagAgenda === 1 ? promoters.filter((prom) => prom.USR_ID === usuarioAtivo) : promoters;
        const supervisors = data.filter((user) => user.USR_GMOVEL_SUPERVISOR === 'V');

        let promotoresChips = {};
        for (const promotor of promoters) {
          let item = promotor.USR_ID + ' - ' + promotor.USR_NOME;
          promotoresChips[item] = null;
          promotor.filtro = item;
        }
        let supervisoresChips = {};
        for (const supervisor of supervisors) {
          let item = supervisor.USR_ID + ' - ' + supervisor.USR_NOME;
          supervisoresChips[item] = null;
          supervisor.filtro = item;
        }
        this.setState({
          promotoresChips,
          supervisoresChips,
          promotores: promoters,
          supervisores: supervisors,
        });
      } else {
        alerta('Erro ao carregar supervisores e promotores');
      }
    } catch (errors) {
      alerta('Erro ao carregar supervisores e promotores');
    }
  };

  onChangeDateInitial = async (date) => {
    const { setStateDateInitial } = this.context;
    await setStateDateInitial(date);
    this.setState({
      dateInitial: date,
    });
  };

  onChangeDateFinal = async (date) => {
    const { setStateDateFinal } = this.context;
    await setStateDateFinal(date);
    this.setState({
      dateFinal: date,
    });
  };

  verifyItemIsAdded = (oldData, newItem) => {
    const { filterTypeReport } = this.state;
    if (filterTypeReport === '0') {
      return oldData.every((data) => {
        return data.CLI_ID === newItem.CLI_ID ? false : true;
      });
    } else {
      return oldData.every((data) => {
        return data.GAP_ID === newItem.ID ? false : true;
      });
    }
  };

  handleSearchsSelected = async () => {
    let { searchs, dataReport, idSearchsSelected, filterTypeReport, isSearchsChanged } = this.state;

    if (!isSearchsChanged) {
      idSearchsSelected = {};
    }
    const ids = idSearchsSelected;
    this.setState({
      loading: true,
    });
    let searchsSelected = [];
    if (ids && ids.length > 0) {
      for (let id of ids) {
        const searchSelected = searchs.find((search) => {
          if (parseInt(search.GAP_ID) === parseInt(id)) {
            search.newData = 1;
          }
          return parseInt(search.GAP_ID) === parseInt(id);
        });
        searchsSelected.push(searchSelected);
      }

      let newData = [];
      for (let item of dataReport) {
        if (filterTypeReport === '0') {
          for (let pesquisa of item.PESQUISAS) {
            let existe = searchsSelected.find((item) => item.GAP_ID === pesquisa.PESQUISA_ID);
            if (existe !== undefined) {
              pesquisa.active = 1;
              if (newData.length > 0) {
                if (this.verifyItemIsAdded(newData, item)) {
                  newData.push(item);
                }
              } else {
                newData.push(item);
              }
            } else {
              pesquisa.active = 0;
            }
          }
        } else {
          let existe = searchsSelected.find((item_) => item_.GAP_ID === item.ID);
          if (existe !== undefined) {
            item.active = 1;
            if (newData.length > 0) {
              if (this.verifyItemIsAdded(newData, item)) {
                item.active = 1;
                newData.push(item);
              }
            } else {
              item.active = 1;
              newData.push(item);
            }
          } else {
            item.active = 0;
          }
        }
      }
      this.setState(
        {
          searchsSelected,
          dataReport: newData,
        },
        () => {
          if (filterTypeReport === '0') {
            this.removeUnselectedSearches(searchsSelected)
          }
        }
      );
    }
  };

  onChangeSelectPromoter = () => {
    if (document.getElementById('promotoresChips') !== undefined) {
      let dados = M.Chips.getInstance(document.getElementById('promotoresChips'));
      let promotoresSelecionados;
      let idsPromoters = [];

      if (dados !== undefined) {
        promotoresSelecionados = dados.chipsData;
        if (promotoresSelecionados && promotoresSelecionados?.length > 0) {
          for (let promotor of promotoresSelecionados) {
            let idPromotor = promotor.tag.split('-')[0].replace(' ', '');
            idsPromoters.push(idPromotor);
          }
        }
        this.setState({
          professionalsSelected: promotoresSelecionados,
          promotoresSelecionados,
          idsPromoters,
        });
      }
    }
  };

  onChangeSelectSupervisor = () => {
    if (document.getElementById('supervisoresChips') !== undefined) {
      let dados = M.Chips.getInstance(document.getElementById('supervisoresChips'));
      let supervisoresSelecionados;
      let idsSupervisors = [];

      if (dados !== undefined) {
        supervisoresSelecionados = dados.chipsData;
        if (supervisoresSelecionados && supervisoresSelecionados?.length > 0) {
          for (let supervisor of supervisoresSelecionados) {
            let idSupervisor = supervisor.tag.split('-')[0].replace(' ', '');
            idsSupervisors.push(idSupervisor);
          }
        }
        this.setState({
          supervisoresSelecionados,
          professionalsSelected: supervisoresSelecionados,
          idsSupervisors,
        });
      }
    }
  };

  onChangeSelectSearch = () => {
    if (document.getElementById('pesquisasChips') !== undefined) {
      let dados = M.Chips.getInstance(document.getElementById('pesquisasChips'));
      let pesquisasSelecionadas;
      let idSearchs = [];

      if (dados !== undefined) {
        pesquisasSelecionadas = dados.chipsData;
        if (pesquisasSelecionadas.length > 0) {
          for (let pesquisa of pesquisasSelecionadas) {
            let idSearch = pesquisa.tag.split('-')[0];
            idSearchs.push(idSearch);
          }
        }
        this.setState(
          {
            pesquisasSelecionadas,
            idSearchsSelected: idSearchs,
          }
          // async () => {
          //   await this.handleDataReport();
          //   this.handleSearchsSelected();
          // }
        );
      }
    }
  };

  onChangeCheckBox = async (e, item) => {
    let { idSearchsSelected } = this.state;
    const { setStateSearchsSelected } = this.context;

    // //console.log(e.target.checked);
    // //console.log(e.target.id);
    // //console.log(item);
    // //console.log('idSearchsSelected = antes =>', idSearchsSelected);
    if (!e.target.checked) {
      idSearchsSelected = idSearchsSelected.filter((_item) => _item !== item.GAP_ID);
    } else {
      idSearchsSelected.push(item.GAP_ID);
    }
    // console.log('idSearchsSelected = depois =>', idSearchsSelected);
    await setStateSearchsSelected(idSearchsSelected);
    this.setState({ idSearchsSelected, isSearchsChanged: true });
  };

  render() {
    const {
      loading,
      dateInitial,
      dateFinal,
      promotoresChips,
      promotoresSelecionados,
      supervisoresSelecionados,
      supervisoresChips,
      filterTypeProfessional,
      filterTypeReport,
      pesquisas,
    } = this.state;

    const { setStateFilterTypeReport } = this.context;
    return (
      <div>
        <Header />
        <WaitScreen loading={loading} />
        <Container>
          <DirectTituloJanela
            urlVoltar={'/home'}
            // urlNovo={'/search'}
            titulo={
              loading ? (
                'Aguarde...'
              ) : (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon>print</Icon>Relatório pesquisa
                </span>
              )
            }
          />

          <>
            <Linha className="filter">
              <Collapsible
                accordion
                style={{
                  width: '100%',
                  borderStyle: 'none',
                  boxShadow: 'none',
                }}
              >
                <CollapsibleItem expanded header="Clique para filtrar" icon={<Icon>filter_list</Icon>} node="div">
                  <ContentBodyCollapsible>
                    <RowFilter flex="4 !important">
                      <Linha className="rowOptions">
                        <DataFilter>
                          <Calendar
                            date={dateInitial}
                            onChange={(date) => {
                              this.onChangeDateInitial(date);
                            }}
                          />

                          <Calendar
                            date={dateFinal}
                            onChange={(date) => {
                              this.onChangeDateFinal(date);
                            }}
                          />

                          <Icon tiny>autorenew</Icon>
                        </DataFilter>

                        <ContentItem>
                          <SaibRadioGroup
                            valueItems={'"0","1","2"'}
                            classNameItems={'"supervisor","promoter","allTypes"'}
                            textItems={'"Supervisor","Promotor","Todos"'}
                            idItems={'"supervisor","promoter","all"'}
                            classNameRadio="filterTypeProfessional"
                            flexDirectionRadio="row"
                            disabledRadio="false"
                            captionRadio="Tipo de profissional"
                            defaultCheckedId={'all'}
                            onChange={(value) => {
                              this.setState({
                                professionalsSelected: [],
                                filterTypeProfessional: value,
                                promotoresSelecionados: [],
                                supervisoresSelecionados: [],
                              });
                            }}
                          />
                        </ContentItem>

                        <ContentItem>
                          <SaibRadioGroup
                            valueItems={'"0", "1"'}
                            classNameItems={'"analytic","synthetic" '}
                            textItems={'"Analítico","Sintético" '}
                            idItems={'"analytic","synthetic" '}
                            classNameRadio="filterTypeSearch"
                            flexDirectionRadio="row"
                            disabledRadio="false"
                            captionRadio="Tipo de Relatório"
                            defaultCheckedId={filterTypeReport === '0' ? 'analytic' : 'synthetic'}
                            onChange={(value) => {
                              this.setState(
                                {
                                  filterTypeReport: value,
                                },
                                async () => await setStateFilterTypeReport(value)
                              );
                            }}
                          />
                        </ContentItem>
                      </Linha>
                      <Linha withPadding={false}>
                        <Linha>
                          <Labels>Pesquisas</Labels>
                        </Linha>
                        <Linha
                          style={{
                            border: '1px solid #ccc',
                            maxHeight: '150px',
                            overflowY: 'auto',
                            borderRadius: '10px',
                            padding: '10px',
                            width: '98%',
                          }}
                        >
                          {pesquisas !== undefined &&
                            pesquisas.map((item) => (
                              <Fragment key={item.GAP_ID}>
                                <Checkbox
                                  className="checkBoxPesquisa"
                                  id={'checkBox_' + item.GAP_ID}
                                  label={capitalize(item.GAP_DESCRICAO, true)}
                                  value={String(item.GAP_ID)}
                                  checked={item.checked}
                                  onChange={(e) => this.onChangeCheckBox(e, item)}
                                />
                              </Fragment>
                            ))}
                        </Linha>
                      </Linha>
                      <Linha withPadding={false}>
                        {filterTypeProfessional === '1' && (
                          <DivDetalhe flex={3} className="divDetailPromoter">
                            <Labels>Promotor</Labels>
                            <Chip
                              id="promotoresChips"
                              className="promotoresChips"
                              close={false}
                              closeIcon={<Icon className="close">close</Icon>}
                              options={{
                                data: promotoresSelecionados !== undefined ? promotoresSelecionados : [],
                                onChipAdd: this.onChangeSelectPromoter,
                                onChipDelete: this.onChangeSelectPromoter,
                                autocompleteOptions: {
                                  data: promotoresChips,
                                  limit: 1,
                                  onAutocomplete: function noRefCheck() { },
                                },
                              }}
                            />
                          </DivDetalhe>
                        )}

                        {filterTypeProfessional === '0' && (
                          <DivDetalhe flex={3} className="divDetailSupervisor">
                            <Labels>Supervisor</Labels>
                            <Chip
                              id="supervisoresChips"
                              className="supervisoresChips"
                              close={false}
                              closeIcon={<Icon className="close">close</Icon>}
                              options={{
                                data: supervisoresSelecionados !== undefined ? supervisoresSelecionados : [],
                                onChipAdd: this.onChangeSelectSupervisor,
                                onChipDelete: this.onChangeSelectSupervisor,
                                autocompleteOptions: {
                                  data: supervisoresChips,
                                  limit: 1,
                                  onAutocomplete: function noRefCheck() { },
                                },
                              }}
                            />
                          </DivDetalhe>
                        )}
                      </Linha>
                    </RowFilter>
                  </ContentBodyCollapsible>
                </CollapsibleItem>
              </Collapsible>
            </Linha>

            <DivDetalhe className="contentButtonsActions">
              <button
                className="saib-button is-primary print"
                onClick={async () => {
                  await this.handleDataReport();
                }}
              >
                <Icon>find_in_page</Icon>
                <span>Visualizar</span>
              </button>
            </DivDetalhe>
          </>

        </Container>
      </div>
    );
  }
}
