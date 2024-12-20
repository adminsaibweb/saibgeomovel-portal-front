import React, { Component } from 'react';
import {
  Container,
  Linha,
  DivDetalhe,
  Labels,
  UploadFile,
  SubTitulo,
  ContentAgrupedData,
  ContenteCheckbox,
} from './style';
import DirectTituloJanela from '../../../Components/Globals/DirectTituloJanela';
import WaitScreen from '../../../Components/Globals/WaitScreen';
import Header from '../../../Components/System/Header';
import { Checkbox, Button, Icon } from 'react-materialize';
import M from 'materialize-css';
import { getFromStorage } from '../../../services/auth';
import { alerta, capitalize } from '../../../services/funcoes';
import api from '../../../services/api';
import noSearchImage from '../../../assets/images/noimagequadrada.jpg';
import NewQuestion from './NewQuestion';
import QuestionsManager from './QuestionsManager';
import './forced.css';
import SearchAgrupedData from './SearchAgrupedData';
import * as Yup from 'yup';
export default class Search extends Component {
  state = {
    id: 0,
    loading: false,
    isAgruped: 0,
    noMandatory: false,
    sellerAccess: false,
    statusSearch: 1,
    addressIconSearch: '',
    selectedSearchs: [],
    searchs: [],
    chipsSearchs: {},
    addingQuestion: false,
    questionRequired: 1,
    activeQuestion: 1,
    typeResult: '0',
    idQuestion: 0,
    positionQuestion: '',
    questionType: '',
    descriptionQuestion: '',
    questionsArrObjects: [],
    errors: {},
    idQuestionToEdit: 0,

    questionsDisponible: [],
    idQuestionSame: '',
  };

  containerRef = React.createRef(null);
  containerHeaderRef = React.createRef(null);

  componentDidMount = async () => {
    await this.carregarVariaveisEstado();
    const { search, action } = this.props.location.state;
    action === 'novo' && this.handleValidationUnicField('search.GAP_DESCRICAO', 'errors');

    this.handleQuestions(search, action);
    this.setState({
      action,
    });
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.props.location.state.action !== prevState.action) {
      // alert();
      // this.setState({
      //   action: this.props.location.state.action,
      // });
    }
  }

  setIdInFields = (search) => {
    search &&
      search.AGRUPAMENTO.forEach((agrupamento) => {
        agrupamento.ITEMS.forEach((item) => {
          item.PERGUNTAS.forEach((pergunta) => {
            pergunta.CAMPOS.forEach((campo) => {
              if (campo.GAC_ID) {
                campo.id = campo.GAC_ID;
              }
            });
          });
        });
      });

    return search;
  };

  handleQuestions = (search, action) => {
    if (search?.GAP_FLG_AGRUPA === 1) {
      search &&
        this.setState(
          {
            search: search,
            statusSearch: search.GAP_FLG_STATUS,
            itemsAgruped: search?.AGRUPAMENTO,
            isAgruped: search?.GAP_FLG_AGRUPA,
            noMandatory: search?.GAP_FLG_OBRIGATORIA_NAO_APLICA,
            sellerAccess: search?.GAP_FLG_VENDEDOR,
            addressIconSearch: search.GAP_ICONE ? search.GAP_ICONE : '',
            questionsDisponible: search?.AGRUPAMENTO[0].ITEMS[0].PERGUNTAS?.map((pergunta) => {
              if (pergunta.GPP_ID) {
                pergunta.id = pergunta.GPP_ID;
              }

              pergunta.CAMPOS &&
                pergunta.CAMPOS.length > 0 &&
                pergunta.CAMPOS.forEach((campo) => {
                  if (campo.GAC_ID) {
                    campo.id = campo.GAC_ID;
                  }
                  if (campo.GAC_GPP_ID_PROXIMA) {
                    // let idDad = pergunta.GPP_ID;
                    search.AGRUPAMENTO[0].ITEMS[0].PERGUNTAS.forEach((qst) => {
                      if (parseInt(qst.GPP_ID) === parseInt(campo.GAC_GPP_ID_PROXIMA)) {
                        qst.idChecked = true;

                        qst.idDad = campo.GAC_ID;
                      }
                    });
                  }
                });

              return pergunta;
            }),
          },
          () => {
            // //console.log(this.state.search);
          }
        );
      this.setIdInFields();
      return search;
    } else {
      search &&
        this.setState({
          search: search,
          statusSearch: search.GAP_FLG_STATUS,
          addressIconSearch: search.GAP_ICONE ? search.GAP_ICONE : '',
          noMandatory: search?.GAP_FLG_OBRIGATORIA_NAO_APLICA,
          sellerAccess: search?.GAP_FLG_VENDEDOR,
          questionsDisponible: search?.PERGUNTAS?.map((pergunta) => {
            if (pergunta.GPP_ID) {
              pergunta.id = pergunta.GPP_ID;
            }

            pergunta.CAMPOS &&
              pergunta.CAMPOS.length > 0 &&
              pergunta.CAMPOS.forEach((campo) => {
                if (campo.GAC_ID) {
                  campo.id = campo.GAC_ID;
                }
                if (campo.GAC_GPP_ID_PROXIMA) {
                  // let idDad = pergunta.GPP_ID;
                  search.PERGUNTAS.forEach((qst) => {
                    if (parseInt(qst.GPP_ID) === parseInt(campo.GAC_GPP_ID_PROXIMA)) {
                      qst.idChecked = true;

                      qst.idDad = campo.GAC_ID;
                    }
                  });
                }
              });

            return pergunta;
          }),
        });
    }

    // action === 'editar' && this.handleUpdateQuestions(search.GAP_ID);
  };

  handleSearch = async (id) => {
    const { search, isAgruped, action } = this.state;
    const dataToSend = {
      codigoPesquisa: String(id),
      descricaoPesquisa: '',
    };
    try {
      let url = `v1/searchs/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`;
      const res = await api.post(url, dataToSend);
      const { data, sucess } = res.data;
      if (sucess) {
        let questionsDisponible;
        if (isAgruped === 1) {
          search.PERGUNTAS = data[0].AGRUPAMENTO[0].ITEMS[0].PERGUNTAS;
          questionsDisponible = data[0].AGRUPAMENTO[0].ITEMS[0].PERGUNTAS;
        } else {
          search.PERGUNTAS = data[0].PERGUNTAS;
          questionsDisponible = data[0].PERGUNTAS;
        }
        const search_ = this.handleQuestions(data[0], action);
        // this.state.questionsDisponible.push(data.PERGUNTAS[0]);
        this.setState({
          search: isAgruped === 1 ? this.setIdInFields(search_) : search,
          questionsDisponible: questionsDisponible.map((pergunta) => {
            if (pergunta.GPP_ID) {
              pergunta.id = pergunta.GPP_ID;
            }

            pergunta.CAMPOS &&
              pergunta.CAMPOS.length > 0 &&
              pergunta.CAMPOS.forEach((campo) => {
                if (campo.GAC_ID) {
                  campo.id = campo.GAC_ID;
                }
                if (campo.GAC_GPP_ID_PROXIMA) {
                  // let idDad = pergunta.GPP_ID;
                  search.PERGUNTAS.forEach((qst) => {
                    if (parseInt(qst.GPP_ID) === parseInt(campo.GAC_GPP_ID_PROXIMA)) {
                      qst.idChecked = true;

                      qst.idDad = campo.GAC_ID;
                    }
                  });
                }
              });

            return pergunta;
          }),
          addingQuestion: false,
        });

        // setTimeout(() => {
        //   //console.log(this.state.questionsDisponible);
        // }, 3000);
      }
    } catch (err) {
      //console.log(err);
    } finally {
      // //console.log(this.state.search);
    }
  };

  carregarVariaveisEstado = async (e) => {
    let search = this.props.location.state.search;
    const { action } = this.props.location.state;
    if (search === undefined) {
      search = {};
    }
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      empresaCnpj: sessao.empresaCnpj,
      newSearch: action === 'novo',
      search,
    });
  };

  generateObjectCorrect = () => {
    const { search } = this.props.location.state;

    search.PERGUNTAS.forEach((qst) => {
      qst.idDad = search.PERGUNTAS.map((pergunta) => {
        return pergunta.CAMPOS[0].idDa;
      });
    });
  };

  getSearchsList = async (_searchs) => {
    const { searchs } = this.state;
    let result = '';
    for (const search of _searchs) {
      let _search = searchs.find((item) => item.GAP_ID + ' - ' + item.GAP_DESCRICAO === search.tag);
      if (_search !== undefined) {
        result += _search.GAP_ID + ',';
      }
    }

    if (result !== '') {
      result = result.substr(0, result.length - 1);
    }

    return result;
  };

  loadSearchs = async () => {
    const { empresaAtiva, salesStatus, moneyType } = this.state;
    try {
      const { usuarioAtivo } = this.state;
      let url;
      url = '/v1/searchs/' + empresaAtiva + '/' + usuarioAtivo;
      // //console.log(url);
      let routes = M.Chips.getInstance(document.getElementById('chipsSearchs')).chipsData;
      let routesIn = await this.getSearchsList(routes);

      let data = {
        // startDate: format(startDate, 'dd/MM/yyyy'),
        // endDate: format(endDate, 'dd/MM/yyyy'),
        salesStatus: salesStatus,
        routesIn: routesIn,
        moneyType: moneyType === 0 ? 1 : moneyType,
      };
      const retorno = await api.post(url, data);
      if (retorno.data && retorno.data.sucess) {
        let searchs = retorno.data.data;
        let searchsChips = {};

        for (const search of searchs) {
          searchsChips[search.GAP_ID + ' - ' + search.GAP_DESCRICAO] = null;
        }

        this.setState({
          searchs,
          searchsChips,
        });
      }
    } catch (err) {
      alerta('Erro ao carregar as pesquisas =>' + err, 2);
    }
  };

  refreshScreen = async () => {
    this.setState({ loading: true });
    await this.loadSearchs();
    this.setState({ loading: false });
  };

  handleChangeSearchImage = async (event) => {
    var imagem = event.target.files[0];
    this.setState({ searchImage: URL.createObjectURL(imagem) });
    await this.urlImagemUpada(imagem, 'banner');
    this.setState({ loading: false });
  };

  handleClearSearchImage = async (event) => {
    let { search } = this.state;
    search.GAP_ICON = '';
    this.setState({ searchImage: noSearchImage, search });
  };

  urlImagemUpada = async (file, tipoImagem) => {
    try {
      let { search, empresaCnpj } = this.state;
      const data = new FormData();
      data.append('image', file);
      const retorno = await api.post('/v1/upload/ftp/' + empresaCnpj, data);
      if (!retorno) {
        this.setState({ searchImage: noSearchImage });
      } else {
        if (retorno.data && retorno.data.sucess) {
          let searchImage = retorno.data.data;
          search.GAP_ICONE = searchImage;
          this.setState({
            search,
            searchImage,
            addressIconSearch: searchImage,
          });
        }
      }
    } catch (err) {
      //console.log(err);
      alerta('Erro => Verifique se o arquivo que você é uma imagem válida!');
      this.setState({ searchImage: noSearchImage });
    }
  };

  onChangeSearchActive = (e) => {
    // let { search } = this.state;
    // search.GAP_FLG_STATUS = e.target.checked;
    if (e.target.checked) {
      this.setState({
        statusSearch: 1,
      });
    } else
      this.setState({
        statusSearch: 0,
      });
    // this.setState({ search });
  };

  onChangeIsAgruped = (e) => {
    if (e.target.checked) {
      this.setState({
        isAgruped: 1,
      });
    } else
      this.setState({
        isAgruped: 0,
      });
  };

  handleChangeShortDescription = (e) => {
    let { search } = this.state;
    search.GAP_DESCRICAO = e.target.value;
    this.setState({ search });
  };

  handleChangeLongDescription = async (e) => {
    let { search } = this.state;
    search.GAP_DESCRICAO_LONGA = e.target.value;
    this.setState({ search });
  };

  handleAddNewQuestion = async () => {
    let { addingQuestion } = this.state;
    addingQuestion = true;
    this.setState({
      addingQuestion,
      actionQuestion: 'novo',
      errors: {
        ...this.state.errors,
        descriptionQuestion: 'Campo obrigatório',
      },
      activeQuestion: 1,
      questionRequired: 1,
      questionType: '0',
    });
  };

  handleNewQuestion = (ev) => {
    if (ev.target.checked) {
      this.setState((prevState) => ({
        ...prevState,
        questionRequired: '1',
      }));
    } else {
      this.setState((prevState) => ({
        ...prevState,
        questionRequired: '0',
      }));
    }
  };

  handleChangeQuestionRequired = (value) => {
    this.setState({ questionRequired: Number(value) });
  };

  handleNewQuestionActive = async (ev) => {
    if (ev.target.checked) {
      this.setState((prevState) => ({
        ...prevState,
        activeQuestion: '1',
      }));
    } else {
      this.setState((prevState) => ({
        ...prevState,
        activeQuestion: '0',
      }));
    }
  };

  handleDescriptionQuestion = (ev) => {
    this.setState(
      {
        descriptionQuestion: ev.target.value,
      },
      () => {
        this.handleValidationUnicField('descriptionQuestion', 'errors');
      }
    );
  };

  handleTypeResultQuestion = (ev) => {
    this.setState({
      typeResult: ev.target.value,
    });
  };

  handleChangeQuestionType = (ev) => {
    this.setState({
      questionType: ev.target.value,
    });
  };

  handleUpdateQuestions = async (id) => {
    const dataToGet = {
      codigoPesquisa: String(id),
      descricaoPesquisa: '',
    };
    try {
      const res = await api.post(`v1/searchs/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`, dataToGet);
      const { sucess, data } = res.data;
      const search = data[0];

      if (search.GAP_FLG_AGRUPA === 1) {
        search.AGRUPAMENTO[0].ITEMS[0].PERGUNTAS = search.AGRUPAMENTO[0].ITEMS[0].PERGUNTAS.map((pergunta) => {
          if (pergunta.GPP_ID) {
            pergunta.id = pergunta.GPP_ID;
          }

          pergunta.CAMPOS &&
            pergunta.CAMPOS.length > 0 &&
            pergunta.CAMPOS.forEach((campo) => {
              if (campo.GAC_ID) {
                campo.id = campo.GAC_ID;
              }
              if (campo.GAC_GPP_ID_PROXIMA) {
                // let idDad = pergunta.GPP_ID;
                search.AGRUPAMENTO[0].ITEMS[0].PERGUNTAS.forEach((qst) => {
                  if (parseInt(qst.GPP_ID) === parseInt(campo.GAC_GPP_ID_PROXIMA)) {
                    qst.idChecked = true;

                    qst.idDad = campo.GAC_ID;
                  }
                });
              }
            });

          return pergunta;
        });
        if (sucess) {
          this.setState(
            {
              questionsDisponible: search.AGRUPAMENTO[0].ITEMS[0].PERGUNTAS.map((pergunta) => {
                if (pergunta.GPP_ID) {
                  pergunta.id = pergunta.GPP_ID;
                }

                pergunta.CAMPOS &&
                  pergunta.CAMPOS.length > 0 &&
                  pergunta.CAMPOS.forEach((campo) => {
                    if (campo.GAC_ID) {
                      campo.id = campo.GAC_ID;
                    }
                    if (campo.GAC_GPP_ID_PROXIMA) {
                      // let idDad = pergunta.GPP_ID;
                      search.AGRUPAMENTO[0].ITEMS[0].PERGUNTAS.forEach((qst) => {
                        if (parseInt(qst.GPP_ID) === parseInt(campo.GAC_GPP_ID_PROXIMA)) {
                          qst.idChecked = true;

                          qst.idDad = campo.GAC_ID;
                        }
                      });
                    }
                  });

                return pergunta;
              }),
              search,
            },
            () => {
              // //console.log(this.state.questionsDisponible);
            }
          );
        }
      } else {
        search.PERGUNTAS = search.PERGUNTAS.map((pergunta) => {
          if (pergunta.GPP_ID) {
            pergunta.id = pergunta.GPP_ID;
          }

          pergunta.CAMPOS &&
            pergunta.CAMPOS.length > 0 &&
            pergunta.CAMPOS.forEach((campo) => {
              if (campo.GAC_ID) {
                campo.id = campo.GAC_ID;
              }
              if (campo.GAC_GPP_ID_PROXIMA) {
                // let idDad = pergunta.GPP_ID;
                search.PERGUNTAS.forEach((qst) => {
                  if (parseInt(qst.GPP_ID) === parseInt(campo.GAC_GPP_ID_PROXIMA)) {
                    qst.idChecked = true;

                    qst.idDad = campo.GAC_ID;
                  }
                });
              }
            });

          return pergunta;
        });

        if (sucess) {
          this.setState({
            questionsDisponible: search.PERGUNTAS.map((pergunta) => {
              if (pergunta.GPP_ID) {
                pergunta.id = pergunta.GPP_ID;
              }

              pergunta.CAMPOS &&
                pergunta.CAMPOS.length > 0 &&
                pergunta.CAMPOS.forEach((campo) => {
                  if (campo.GAC_ID) {
                    campo.id = campo.GAC_ID;
                  }
                  if (campo.GAC_GPP_ID_PROXIMA) {
                    // let idDad = pergunta.GPP_ID;
                    search.PERGUNTAS.forEach((qst) => {
                      if (parseInt(qst.GPP_ID) === parseInt(campo.GAC_GPP_ID_PROXIMA)) {
                        qst.idChecked = true;

                        qst.idDad = campo.GAC_ID;
                      }
                    });
                  }
                });

              return pergunta;
            }),
            search,
          });
        }
      }
    } catch (error) {}
  };

  returnHighestPosition = () => {
    const { questionsDisponible } = this.state;

    const res = questionsDisponible.sort((a, b) => {
      return parseInt(b.GPP_POSICAO) - parseInt(a.GPP_POSICAO);
    });

    return res[0] && parseInt(res[0].GPP_POSICAO);
  };

  returnPosition = (counter) => {
    if (parseInt(counter) > 9) {
      return `0${counter}`;
    } else {
      return `00${counter}`;
    }
  };

  returnObjectsFieldListFix = (fields) => {
    const { returnPosition } = this;
    const { actionQuestion, questionType } = this.state;
    const fields_ = [...fields];
    if (actionQuestion === 'editar') {
      return fields_.map((field_, i) => {
        if (field_.id) {
          return {
            id: parseInt(Math.random(i + 1)),
            GAC_ID: field_.id,
            GAC_POSICAO: returnPosition(i + 1),
            GAC_DESCRICAO: field_.GAC_DESCRICAO,
            GAC_DESCRICAO_LONGA: field_.GAC_DESCRICAO_LONGA,
            GAC_VALOR_PADRAO: field_.GAC_VALOR_PADRAO,
            GAC_FLG_STATUS: field_.GAC_FLG_STATUS,
            GAC_GPP_ID_PROXIMA: field_.GAC_GPP_ID_PROXIMA,
            GAC_GPP_EMP_ID_PROXIMA: field_.GAC_GPP_EMP_ID_PROXIMA,
            GAC_VALOR_MAXIMO: field_.GAC_VALOR_MAXIMO,
            GAC_VALOR_MINIMO: field_.GAC_VALOR_MINIMO,
          };
        } else {
          return {
            id: parseInt(Math.random(i + 1)),
            GAC_POSICAO: returnPosition(i + 1),
            GAC_DESCRICAO: field_.GAC_DESCRICAO,
            GAC_DESCRICAO_LONGA: field_.GAC_DESCRICAO_LONGA,
            GAC_VALOR_PADRAO: field_.GAC_VALOR_PADRAO,
            GAC_FLG_STATUS: field_.GAC_FLG_STATUS,
            GAC_GPP_ID_PROXIMA: field_.GAC_GPP_ID_PROXIMA,
            GAC_GPP_EMP_ID_PROXIMA: field_.GAC_GPP_EMP_ID_PROXIMA,
            GAC_VALOR_MAXIMO: field_.GAC_VALOR_MAXIMO,
            GAC_VALOR_MINIMO: field_.GAC_VALOR_MINIMO,
          };
        }
      });
    } else {
      return fields_.map((field, i) => {
        if (parseInt(questionType) === 13) {
          return {
            id: parseInt(Math.random(i + 1)),
            GAC_POSICAO: returnPosition(i + 1),
            GAC_DESCRICAO: field.shortDescriptionItem,
            GAC_DESCRICAO_LONGA: field.longDescriptionItem,
            GAC_VALOR_PADRAO: field.valueDefault,
            GAC_FLG_STATUS: 1,
            GAC_GPP_ID_PROXIMA: 0,
            GAC_GPP_EMP_ID_PROXIMA: 0,
            GAC_VALOR_MAXIMO: null,
            GAC_VALOR_MINIMO: null,
          };
        } else {
          return {
            id: parseInt(Math.random(i + 1)),
            GAC_POSICAO: returnPosition(i + 1),
            GAC_DESCRICAO: field.shortDescriptionItem,
            GAC_DESCRICAO_LONGA: field.longDescriptionItem,
            GAC_VALOR_PADRAO: '1',
            GAC_FLG_STATUS: 1,
            GAC_GPP_ID_PROXIMA: 0,
            GAC_GPP_EMP_ID_PROXIMA: 0,
            GAC_VALOR_MAXIMO: null,
            GAC_VALOR_MINIMO: null,
          };
        }
      });
    }
  };

  returnObjectsFieldYesOrNo = () => {
    return [
      {
        id: parseInt(Math.random()),
        GAC_POSICAO: '001',
        GAC_DESCRICAO: 'Sim',
        GAC_DESCRICAO_LONGA: 'Sim',
        GAC_VALOR_PADRAO: '1',
        GAC_FLG_STATUS: 1,
        GAC_GPP_ID_PROXIMA: 0,
        GAC_GPP_EMP_ID_PROXIMA: 0,
        GAC_VALOR_MINIMO: null,
        GAC_VALOR_MAXIMO: null,
      },
      {
        id: parseInt(Math.random()),
        GAC_POSICAO: '002',
        GAC_DESCRICAO: 'Não',
        GAC_DESCRICAO_LONGA: 'Não',
        GAC_VALOR_PADRAO: '0',
        GAC_FLG_STATUS: 1,
        GAC_GPP_ID_PROXIMA: 0,
        GAC_GPP_EMP_ID_PROXIMA: 0,
        GAC_VALOR_MINIMO: null,
        GAC_VALOR_MAXIMO: null,
      },
    ];
  };

  returnObjectsFieldImage = (values) => {
    const { actionQuestion } = this.state;

    if (actionQuestion === 'editar') {
      return [
        {
          id: parseInt(Math.random()),
          GAC_ID: values.GAC_ID,
          GAC_POSICAO: values.GAC_POSICAO,
          GAC_DESCRICAO: values.GAC_DESCRICAO,
          GAC_DESCRICAO_LONGA: values.GAC_DESCRICAO_LONGA,
          GAC_VALOR_PADRAO: values.GAC_VALOR_PADRAO,
          GAC_FLG_STATUS: values.GAC_FLG_STATUS,
          GAC_GPP_ID_PROXIMA: values.GAC_GPP_ID_PROXIMA,
          GAC_GPP_EMP_ID_PROXIMA: values.GAC_GPP_EMP_ID_PROXIMA,
          GAC_VALOR_MINIMO: null,
          GAC_VALOR_MAXIMO: null,
        },
      ];
    } else {
      return [
        {
          id: parseInt(Math.random()),
          GAC_POSICAO: '001',
          GAC_DESCRICAO: '',
          GAC_DESCRICAO_LONGA: '',
          GAC_VALOR_PADRAO: values.valueDefault,
          GAC_FLG_STATUS: 1,
          GAC_GPP_ID_PROXIMA: 0,
          GAC_GPP_EMP_ID_PROXIMA: 0,
          GAC_VALOR_MINIMO: null,
          GAC_VALOR_MAXIMO: null,
        },
      ];
    }
  };

  returnObjectsFieldMoney = (values) => {
    const { actionQuestion } = this.state;

    if (actionQuestion === 'editar') {
      return [
        {
          id: parseInt(Math.random()),
          GAC_ID: values.GAC_ID,
          GAC_POSICAO: values.GAC_POSICAO,
          GAC_DESCRICAO: values.GAC_DESCRICAO,
          GAC_DESCRICAO_LONGA: values.GAC_DESCRICAO_LONGA,
          GAC_VALOR_PADRAO: values.GAC_VALOR_PADRAO,
          GAC_FLG_STATUS: values.GAC_FLG_STATUS,
          GAC_GPP_ID_PROXIMA: values.GAC_GPP_ID_PROXIMA,
          GAC_GPP_EMP_ID_PROXIMA: values.GAC_GPP_EMP_ID_PROXIMA,
          GAC_VALOR_MINIMO: values.GAC_VALOR_MINIMO,
          GAC_VALOR_MAXIMO: values.GAC_VALOR_MAXIMO,
        },
      ];
    } else {
      return [
        {
          id: parseInt(Math.random()),
          GAC_POSICAO: '001',
          GAC_DESCRICAO: '',
          GAC_DESCRICAO_LONGA: '',
          GAC_VALOR_PADRAO: '0',
          GAC_FLG_STATUS: 1,
          GAC_GPP_ID_PROXIMA: 0,
          GAC_GPP_EMP_ID_PROXIMA: 0,
          GAC_VALOR_MINIMO: values.minimum,
          GAC_VALOR_MAXIMO: values.maximum,
        },
      ];
    }
  };

  verifyQuestionTypeMoney = () => {
    let { questionType } = this.state;

    questionType = parseInt(questionType);

    if ([2, 3, 9, 12].includes(questionType)) {
      return true;
    } else {
      return false;
    }
  };

  verifyQuestionTypeList = () => {
    let { questionType } = this.state;

    questionType = parseInt(questionType);

    if ([10, 11, 13].includes(questionType)) {
      return true;
    } else {
      return false;
    }
  };

  verifyIfQuestionSameDescription = async (isAgrouped, description) => {
    const { search } = this.state;
    let retorno = false;

    if (isAgrouped === 1) {
      if (search && search.AGRUPAMENTO) {
        search.AGRUPAMENTO.every((agroup) => {
          return agroup.ITEMS.every((item) => {
            const isAdded = !item.PERGUNTAS.every((question) => {
              if (
                question.GPP_PERGUNTA.toUpperCase()
                  .trim()
                  .replace(/\s/g, '')
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '') ===
                description
                  .trim()
                  .replace(/\s/g, '')
                  .toUpperCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
              ) {
                this.setState({
                  idQuestionSame: question.GPP_ID,
                });
                return false;
              } else {
                return true;
              }
            });

            retorno = isAdded;
            return isAdded ? false : true;
          });
        });
      }
    } else {
      if (search && search.PERGUNTAS?.length > 0) {
        retorno = !search.PERGUNTAS.every((question) => {
          if (
            question.GPP_PERGUNTA.toUpperCase()
              .trim()
              .replace(/\s/g, '')
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '') ===
            description
              .trim()
              .replace(/\s/g, '')
              .toUpperCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
          ) {
            this.setState({
              idQuestionSame: question.GPP_ID,
            });
            return false;
          } else {
            return true;
          }
        });
      }
    }
    return retorno;
  };

  updateNewPositionAllQuestionsAgruped = (positionOld, nextPosition) => {
    const { search } = this.state;
    search.GAP_FLG_AGRUPA === 1 &&
      search.AGRUPAMENTO.forEach((agrupamento) => {
        agrupamento.ITEMS.forEach((item) => {
          const questionNextPosition = item.PERGUNTAS.find((pergunta) => pergunta.GPP_POSICAO === positionOld);
          questionNextPosition.GPP_POSICAO = nextPosition;
          const questionPositionOld = item.PERGUNTAS.find((pergunta) => pergunta.GPP_POSICAO === nextPosition);
          questionPositionOld.GPP_POSICAO = positionOld;
        });
      });
  };

  updateQuestionsSame = (questionEdited) => {
    const { search } = this.state;
    const positionQuestionEdited = questionEdited.GPP_POSICAO;
    const questionTypeList = this.verifyQuestionTypeList();
    search.AGRUPAMENTO.forEach((agrupamento) => {
      agrupamento.ITEMS.forEach((item) => {
        item.PERGUNTAS.forEach((pergunta) => {
          if (pergunta.GPP_POSICAO === positionQuestionEdited && !questionTypeList) {
            pergunta.CAMPOS[0] = {
              ...questionEdited.CAMPOS[0],
              GAC_ID: pergunta.CAMPOS[0].GAC_ID,
            };
            pergunta.GPP_FLG_ORIGATORIA = questionEdited.GPP_FLG_ORIGATORIA;
            pergunta.GPP_FLG_STATUS = questionEdited.GPP_FLG_STATUS;
            pergunta.GPP_PERGUNTA = questionEdited.GPP_PERGUNTA;
            pergunta.GPP_POSICAO = questionEdited.GPP_POSICAO;
            pergunta.GPP_TIPO_CAMPO = questionEdited.GPP_TIPO_CAMPO;
            pergunta.GPP_TIPO_RESULTADO = questionEdited.GPP_TIPO_RESULTADO;
          }
        });
      });
    });
  };

  handleSaveQuestionSearchAgruped = async (fieldsListFix = null, valuesMinAndMax = {}, valueDefault = null) => {
    let {
      search,
      descriptionQuestion,
      actionQuestion,
      idQuestionToEdit,
      questionEdit,
      action,
      sellerAccess,
      noMandatory,
    } = this.state;
    this.setState({
      loading: true,
    });
    const questionTypeMoney = this.verifyQuestionTypeMoney();

    let countQuestions = 0;
    if (search.AGRUPAMENTO && search.AGRUPAMENTO[0].ITEMS[0].PERGUNTAS !== undefined) {
      search.AGRUPAMENTO[0].ITEMS[0].PERGUNTAS.forEach(() => {
        countQuestions++;
      });
    }

    if (actionQuestion === 'editar') {
      this.setIdInFields(search);

      search.AGRUPAMENTO.forEach((agrupamento) => {
        agrupamento.ITEMS.forEach((item) => {
          item.PERGUNTAS.forEach((qst) => {
            if (parseInt(qst.GPP_ID) === parseInt(idQuestionToEdit)) {
              qst.GPP_PERGUNTA = this.state.descriptionQuestion;
              qst.GPP_FLG_ORIGATORIA = parseInt(this.state.questionRequired) && parseInt(this.state.questionRequired);
              qst.GPP_FLG_STATUS = parseInt(this.state.activeQuestion) && parseInt(this.state.activeQuestion);
              qst.GPP_TIPO_RESULTADO = this.state.typeResult;
              qst.GPP_TIPO_CAMPO = parseInt(this.state.questionType);
            }

            if (parseInt(this.state.questionType) === 10) {
              qst.CAMPOS = this.returnObjectsFieldListFix(qst.CAMPOS);
            } else if (parseInt(this.state.questionType) === 11) {
              qst.CAMPOS = this.returnObjectsFieldListFix(qst.CAMPOS);
            } else if (parseInt(this.state.questionType) === 13) {
              qst.CAMPOS = this.returnObjectsFieldListFix(qst.CAMPOS);
            } else if (parseInt(this.state.questionType) === 7) {
              qst.CAMPOS = this.returnObjectsFieldImage(qst.CAMPOS[0]);
            } else if (questionTypeMoney) {
              qst.CAMPOS = this.returnObjectsFieldMoney(qst.CAMPOS[0]);
            }
          });
        });
      });

      this.updateQuestionsSame(questionEdit);

      this.saveAllQuestionsForSearchAgruped(search.AGRUPAMENTO[0].ITEMS[0].PERGUNTAS);

      this.setState({
        search,
        addingQuestion: false,
      });
    } else {
      // alert(countQuestions);
      const highestPosition = this.returnHighestPosition();
      let position;
      if (parseInt(highestPosition + 1) > 9) {
        position = `0${parseInt(highestPosition + 1)}`;
      } else if (highestPosition === undefined || highestPosition === 0) {
        position = '001';
      } else {
        position = `00${parseInt(highestPosition + 1)}`;
      }

      let CAMPOS;
      if (parseInt(this.state.questionType) === 8) {
        CAMPOS = this.returnObjectsFieldYesOrNo();
      } else if (parseInt(this.state.questionType) === 10) {
        CAMPOS = this.returnObjectsFieldListFix(fieldsListFix);
      } else if (parseInt(this.state.questionType) === 11) {
        CAMPOS = this.returnObjectsFieldListFix(fieldsListFix);
      } else if (parseInt(this.state.questionType) === 13) {
        CAMPOS = this.returnObjectsFieldListFix(fieldsListFix);
      } else if (questionTypeMoney) {
        CAMPOS = this.returnObjectsFieldMoney(valuesMinAndMax);
      } else {
        CAMPOS = [
          {
            id: parseInt(Math.random() + 1),

            GAC_POSICAO: '001',
            GAC_DESCRICAO: '',
            GAC_DESCRICAO_LONGA: '',
            GAC_VALOR_PADRAO: '1',
            GAC_FLG_STATUS: 1,
            GAC_GPP_ID_PROXIMA: 0,
            GAC_GPP_EMP_ID_PROXIMA: 0,
          },
        ];
      }

      if (action === 'editar') {
        this.state.itemsAgruped &&
          this.state.itemsAgruped.forEach((group) => {
            group.ITEMS.forEach((itemVal) => {
              if (!itemVal.GGI_ID) {
                itemVal.PERGUNTAS = itemVal.PERGUNTAS.map((question) => {
                  let cloneQuestion = Object.assign({}, question);
                  delete cloneQuestion.GPP_ID;

                  cloneQuestion.CAMPOS = question.CAMPOS.map((field) => {
                    let cloneField = Object.assign({}, field);
                    delete cloneField.GAC_ID;
                    return cloneField;
                  });
                  return cloneQuestion;
                });
              }
            });
          });

        this.state.itemsAgruped &&
          this.state.itemsAgruped.forEach((group) => {
            group.ITEMS.forEach((itemVal) => {
              itemVal.PERGUNTAS
                ? itemVal.PERGUNTAS.push({
                    id: parseInt(countQuestions),
                    GPP_POSICAO: position,
                    GPP_PERGUNTA: descriptionQuestion,
                    GPP_FLG_STATUS: this.state.activeQuestion ? 1 : 0,
                    GPP_TIPO_CAMPO: parseInt(this.state.questionType),
                    GPP_FLG_ORIGATORIA: this.state.questionRequired,
                    GPP_TIPO_RESULTADO: this.state.typeResult,
                    CAMPOS: CAMPOS,
                    idChecked: false,
                  })
                : (itemVal.PERGUNTAS = [
                    {
                      id: parseInt(countQuestions),
                      GPP_POSICAO: position,
                      GPP_PERGUNTA: descriptionQuestion,
                      GPP_FLG_STATUS: this.state.activeQuestion ? 1 : 0,
                      GPP_TIPO_CAMPO: parseInt(this.state.questionType),
                      GPP_FLG_ORIGATORIA: this.state.questionRequired,
                      GPP_TIPO_RESULTADO: this.state.typeResult,
                      CAMPOS: CAMPOS,
                      idChecked: false,
                    },
                  ]);
            });
          });
        const dataToSend = {
          GAP_ID: search.GAP_ID,
          GAP_EMP_ID: search.GAP_EMP_ID,
          GAP_DESCRICAO: search.GAP_DESCRICAO && search.GAP_DESCRICAO.toUpperCase(),
          GAP_DESCRICAO_LONGA: search.GAP_DESCRICAO_LONGA && search.GAP_DESCRICAO_LONGA.toUpperCase(),
          GAP_ICONE: search.GAP_ICONE && search.GAP_ICONE,
          GAP_FLG_STATUS: search.GAP_FLG_STATUS,
          GAP_FLG_AGRUPA: search.GAP_FLG_AGRUPA,
          GAP_FLG_VENDEDOR: sellerAccess ? 1 : 0,
          GAP_FLG_OBRIGATORIA_NAO_APLICA: noMandatory ? 1 : 0,
          AGRUPAMENTO: this.state?.itemsAgruped,
        };
        try {
          const res = await api.put(`v1/searchs/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`, dataToSend);
          const { sucess } = res.data;
          if (sucess) {
            alerta('Pergunta adicionada com sucesso!', 1);
            await this.handleSearch(dataToSend.GAP_ID);
            this.setState({
              action: 'editar',
            });
          } else {
            alerta('Erro ao salvar a pesquisa', 2);
          }
          // setTimeout(async () => {
          //   await this.handleUpdateQuestions(dataToSend.GAP_ID);
          // }, 1000);
          // handleSearchUpdated();
        } catch (err) {
          alerta('Erro ao salvar a pesquisa', 2);
        } finally {
          this.setState({
            loading: false,
          });
        }
      } else {
        search.PERGUNTAS = {
          id: parseInt(countQuestions),
          GPP_POSICAO: position,
          GPP_PERGUNTA: descriptionQuestion?.toUpperCase(),
          GPP_FLG_STATUS: this.state.activeQuestion ? 1 : 0,
          GPP_TIPO_CAMPO: parseInt(this.state.questionType),
          GPP_FLG_ORIGATORIA: this.state.questionRequired,
          GPP_TIPO_RESULTADO: this.state.typeResult,
          CAMPOS: CAMPOS,
          idChecked: false,
        };
        this.state.itemsAgruped &&
          this.state.itemsAgruped.forEach((group) => {
            group.ITEMS.forEach((itemVal) => {
              itemVal.PERGUNTAS = [
                {
                  id: parseInt(countQuestions),
                  GPP_POSICAO: position,
                  GPP_PERGUNTA: descriptionQuestion.toUpperCase(),
                  GPP_FLG_STATUS: this.state.activeQuestion ? 1 : 0,
                  GPP_TIPO_CAMPO: parseInt(this.state.questionType),
                  GPP_FLG_ORIGATORIA: this.state.questionRequired,
                  GPP_TIPO_RESULTADO: this.state.typeResult,
                  CAMPOS: CAMPOS,
                  idChecked: false,
                },
              ];
            });
          });
        const dataToAddSearch = {
          GAP_EMP_ID: this.state.empresaAtiva,
          GAP_DESCRICAO: search.GAP_DESCRICAO,
          GAP_DESCRICAO_LONGA: search?.GAP_DESCRICAO_LONGA ? search?.GAP_DESCRICAO_LONGA?.toUpperCase() : '',
          GAP_ICONE: this.state.addressIconSearch,
          GAP_FLG_STATUS: this.state.statusSearch,
          GAP_FLG_AGRUPA: 1,
          GAP_FLG_VENDEDOR: sellerAccess ? 1 : 0,
          GAP_FLG_OBRIGATORIA_NAO_APLICA: noMandatory ? 1 : 0,
          AGRUPAMENTO: this.state?.itemsAgruped,
        };

        try {
          const res = await api.post(
            `v1/searchs/add/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
            dataToAddSearch
          );
          const { sucess, data } = res.data;
          if (sucess) {
            alerta('Pesquisa salva com sucesso!', 1);
            this.props.history.push('/Searchs');
            this.setState(
              {
                search: data,
                action: 'editar',
              },
              async () => await this.handleSearch(data.GAP_ID)
            );
          } else {
            alerta('Erro ao salvar a pesquisa', 2);
          }
        } catch (err) {
          alerta('Erro ao salvar a pesquisa', 2);
        } finally {
          this.setState({
            loading: false,
          });
        }
      }
    }
  };

  handleSaveQuestion = async (fieldsListFix = null, valuesMinAndMax = {}, valueDefault = null) => {
    let {
      search,
      descriptionQuestion,
      actionQuestion,
      idQuestionToEdit,
      isAgruped,
      action,
      noMandatory,
      sellerAccess,
    } = this.state;
    this.setState({
      loading: true,
    });

    const questionTypeMoney = this.verifyQuestionTypeMoney();
    const isAdded = await this.verifyIfQuestionSameDescription(isAgruped, descriptionQuestion);

    if (isAdded) {
      if (actionQuestion === 'editar' && this.state.idQuestionSame !== idQuestionToEdit) {
        alerta('Pergunta já adicionada, verifique');
        this.setState({
          loading: false,
        });
        return;
      } else if (actionQuestion === 'novo') {
        alerta('Pergunta já adicionada, verifique');
        this.setState({
          loading: false,
        });
        return;
      }
    }

    if (isAgruped === 1) {
      this.handleSaveQuestionSearchAgruped(fieldsListFix, valuesMinAndMax, valueDefault);
    } else {
      let countQuestions = 0;
      if (search.PERGUNTAS !== undefined) {
        search.PERGUNTAS &&
          search.PERGUNTAS.length > 0 &&
          search.PERGUNTAS.forEach(() => {
            countQuestions++;
          });
      }

      if (actionQuestion === 'editar') {
        search.PERGUNTAS.forEach((qst) => {
          if (parseInt(qst.GPP_ID) === parseInt(idQuestionToEdit)) {
            qst.GPP_PERGUNTA = this.state.descriptionQuestion;
            qst.GPP_FLG_ORIGATORIA = parseInt(this.state.questionRequired) && parseInt(this.state.questionRequired);
            qst.GPP_FLG_STATUS = parseInt(this.state.activeQuestion) && parseInt(this.state.activeQuestion);
            qst.GPP_TIPO_RESULTADO = this.state.typeResult;
            qst.GPP_TIPO_CAMPO = parseInt(this.state.questionType);
            if (parseInt(this.state.questionType) === 10) {
              qst.CAMPOS = this.returnObjectsFieldListFix(qst.CAMPOS);
            } else if (parseInt(this.state.questionType) === 7) {
              qst.CAMPOS = this.returnObjectsFieldImage(qst.CAMPOS[0]);
            } else if (parseInt(this.state.questionType) === 11) {
              qst.CAMPOS = this.returnObjectsFieldListFix(qst.CAMPOS);
            } else if (parseInt(this.state.questionType) === 13) {
              qst.CAMPOS = this.returnObjectsFieldListFix(qst.CAMPOS);
            } else if (questionTypeMoney) {
              qst.CAMPOS = this.returnObjectsFieldMoney(qst.CAMPOS[0]);
            }

            this.saveAllQuestions(search.PERGUNTAS);
          }
        });

        this.setState({
          search,
          addingQuestion: false,
        });
      } else {
        // alert(countQuestions);
        const highestPosition = this.returnHighestPosition();
        let position;
        if (parseInt(highestPosition + 1) > 9) {
          position = `0${parseInt(highestPosition + 1)}`;
        } else if (highestPosition === undefined || highestPosition === 0) {
          position = '001';
        } else {
          position = `00${parseInt(highestPosition + 1)}`;
        }

        let CAMPOS;
        if (parseInt(this.state.questionType) === 8) {
          CAMPOS = [
            {
              id: parseInt(Math.random()),
              GAC_POSICAO: '001',
              GAC_DESCRICAO: 'Sim',
              GAC_DESCRICAO_LONGA: 'Sim',
              GAC_VALOR_PADRAO: '1',
              GAC_FLG_STATUS: 1,
              GAC_GPP_ID_PROXIMA: 0,
              GAC_GPP_EMP_ID_PROXIMA: 0,
            },
            {
              id: parseInt(Math.random()),
              GAC_POSICAO: '002',
              GAC_DESCRICAO: 'Não',
              GAC_DESCRICAO_LONGA: 'Não',
              GAC_VALOR_PADRAO: '0',
              GAC_FLG_STATUS: 1,
              GAC_GPP_ID_PROXIMA: 0,
              GAC_GPP_EMP_ID_PROXIMA: 0,
            },
          ];
        } else if (parseInt(this.state.questionType) === 10) {
          CAMPOS = this.returnObjectsFieldListFix(fieldsListFix);
        } else if (parseInt(this.state.questionType) === 11) {
          CAMPOS = this.returnObjectsFieldListFix(fieldsListFix);
        } else if (parseInt(this.state.questionType) === 13) {
          CAMPOS = this.returnObjectsFieldListFix(fieldsListFix);
        } else if (questionTypeMoney) {
          CAMPOS = this.returnObjectsFieldMoney(valuesMinAndMax);
        } else if (parseInt(this.state.questionType) === 7) {
          CAMPOS = this.returnObjectsFieldImage(valueDefault);
        } else {
          CAMPOS = [
            {
              id: parseInt(Math.random() + 1),

              GAC_POSICAO: '001',
              GAC_DESCRICAO: '',
              GAC_DESCRICAO_LONGA: '',
              GAC_VALOR_PADRAO: '1',
              GAC_FLG_STATUS: 1,
              GAC_GPP_ID_PROXIMA: 0,
              GAC_GPP_EMP_ID_PROXIMA: 0,
            },
          ];
        }

        if (action === 'editar') {
          search.PERGUNTAS.push({
            id: parseInt(countQuestions),
            GPP_POSICAO: position,
            GPP_PERGUNTA: descriptionQuestion,
            GPP_FLG_STATUS: this.state.activeQuestion ? 1 : 0,
            GPP_TIPO_CAMPO: parseInt(this.state.questionType),
            GPP_FLG_ORIGATORIA: this.state.questionRequired,
            GPP_TIPO_RESULTADO: this.state.typeResult,
            CAMPOS: CAMPOS,
            idChecked: false,
          });
          const dataToSend = {
            GAP_ID: search.GAP_ID,
            GAP_EMP_ID: search.GAP_EMP_ID,
            GAP_DESCRICAO: search.GAP_DESCRICAO && search.GAP_DESCRICAO.toUpperCase(),
            GAP_DESCRICAO_LONGA: search.GAP_DESCRICAO_LONGA && search.GAP_DESCRICAO_LONGA.toUpperCase(),
            GAP_ICONE: search.GAP_ICONE && search.GAP_ICONE,
            GAP_FLG_STATUS: search.GAP_FLG_STATUS,
            GAP_FLG_AGRUPA: isAgruped,
            GAP_FLG_VENDEDOR: sellerAccess ? 1 : 0,
          GAP_FLG_OBRIGATORIA_NAO_APLICA: noMandatory ? 1 : 0,
            PERGUNTAS: search.PERGUNTAS,
          };
          try {
            const res = await api.put(`v1/searchs/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`, dataToSend);

            const { sucess } = res.data;
            if (sucess) {
              alerta('Pergunta adicionada com sucesso!', 1);
              await this.handleSearch(dataToSend.GAP_ID);
            } else {
              alerta(res.data, 2);
            }

            // setTimeout(async () => {
            //   await this.handleUpdateQuestions(dataToSend.GAP_ID);
            // }, 1000);

            // handleSearchUpdated();
          } catch (err) {
            alerta('Erro ao salvar pergunta, verifique', 2);
            search.PERGUNTAS.pop();
          } finally {
            this.setState({
              loading: false,
            });
          }
        } else {
          search.PERGUNTAS = {
            id: parseInt(countQuestions),
            GPP_POSICAO: position,
            GPP_PERGUNTA: descriptionQuestion?.toUpperCase(),
            GPP_FLG_STATUS: this.state.activeQuestion ? 1 : 0,
            GPP_TIPO_CAMPO: parseInt(this.state.questionType),
            GPP_FLG_ORIGATORIA: this.state.questionRequired,
            GPP_TIPO_RESULTADO: this.state.typeResult,
            CAMPOS: CAMPOS,
            idChecked: false,
          };
          const dataToAddSearch = {
            GAP_EMP_ID: this.state.empresaAtiva,
            GAP_DESCRICAO: search.GAP_DESCRICAO,
            GAP_DESCRICAO_LONGA: search?.GAP_DESCRICAO_LONGA ? search?.GAP_DESCRICAO_LONGA?.toUpperCase() : '',
            GAP_ICONE: this.state.addressIconSearch,
            GAP_FLG_STATUS: this.state.statusSearch,
            GAP_FLG_AGRUPA: isAgruped,
            GAP_FLG_VENDEDOR: sellerAccess ? 1 : 0,
            GAP_FLG_OBRIGATORIA_NAO_APLICA: noMandatory ? 1 : 0,
            PERGUNTAS: [
              {
                id: parseInt(countQuestions),
                GPP_POSICAO: position,
                GPP_PERGUNTA: descriptionQuestion.toUpperCase(),
                GPP_FLG_STATUS: this.state.activeQuestion ? 1 : 0,
                GPP_TIPO_CAMPO: parseInt(this.state.questionType),
                GPP_FLG_ORIGATORIA: this.state.questionRequired,
                GPP_TIPO_RESULTADO: this.state.typeResult,
                CAMPOS: CAMPOS,
                idChecked: false,
              },
            ],
          };

          try {
            //co(dataToAddSearch);
            const res = await api.post(
              `v1/searchs/add/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
              dataToAddSearch
            );
            const { sucess, data } = res.data;
            if (sucess) {
              alerta('Pesquisa salva com sucesso!', 1);
              this.setState(
                {
                  action: 'editar',
                  search: data,
                },
                async () => await this.handleSearch(data.GAP_ID)
              );
              this.props.history.push('/Searchs');
            } else {
              alerta('Erro ao salvar pesquisa, verifique', 2);
            }
          } catch (err) {
            alerta('Erro ao salvar pesquisa, verifique', 2);
          } finally {
            this.setState({
              loading: false,
            });
          }
        }
      }
    }
  };

  handleDeleteQuestion = async () => {
    let { search, idQuestionToEdit } = this.state;
    this.setState({
      loading: true,
    });
    // return;
    try {
      const res = await api.delete(
        `v1/searchs/question/${this.state.empresaAtiva}/${this.state.usuarioAtivo}/${idQuestionToEdit}`
      );

      const { sucess } = res.data;
      if (sucess) {
        alerta('Pergunta apagada com sucesso!', 1);
        this.props.history.push('/Searchs');
      } else {
        alerta('Não foi possível apagar a pergunta, provavelmente ela já foi respondida.', 2);
      }
    } catch (err) {
      alerta('Erro ao apagar a pergunta, verifique', 2);
      search.PERGUNTAS.pop();
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  handleOrdenationQuestions = (index, nextPosition) => {
    const { search } = this.state;
    const questionBeMove = search.PERGUNTAS[index];
    if ((index === 0) & (nextPosition === index - 1) || nextPosition > search.PERGUNTAS.length) {
    } else {
      search.PERGUNTAS.splice(index, 1);
      search.PERGUNTAS.splice(nextPosition, 0, questionBeMove);
      this.setState({
        search: search,
      });
    }
  };

  handleDataToEditQuestion = (question) => {
    this.setState({
      actionQuestion: 'editar',
      idQuestionToEdit: question.GPP_ID,
      questionEdit: question,
      descriptionQuestion: question.GPP_PERGUNTA,
      questionType: parseInt(question.GPP_TIPO_CAMPO),
      typeResult: question.GPP_TIPO_RESULTADO,
      activeQuestion: question.GPP_FLG_STATUS,
      questionRequired: question.GPP_FLG_ORIGATORIA,
      addingQuestion: true,
      errors: {},
    });
  };

  handleCancellQuestion = () => {
    this.setState({
      actionQuestion: 'novo',
      idQuestionToEdit: 0,
      errors: {},
      descriptionQuestion: '',
      questionType: 0,
      typeResult: '0',
      activeQuestion: 0,
      questionRequired: 0,
      addingQuestion: false,
    });
  };

  handleItemsAgruped = (itemsAgruped) => {
    if (itemsAgruped.length > 0) {
      this.setState({
        itemsAgruped: itemsAgruped,
      });
    } else {
      this.setState({
        itemsAgruped: [itemsAgruped],
      });
    }
  };

  saveAllQuestionsForSearchAgruped = async (questions) => {
    this.setState({
      loading: true,
    });

    const cloneQsts = questions.map((qst) => Object.assign({}, qst));
    const { search, isAgruped, actionQuestion, action, sellerAccess, noMandatory } = this.state;

    questions.forEach((qst) => {
      qst.CAMPOS &&
        qst.CAMPOS.length > 0 &&
        qst.CAMPOS.forEach((campo) => {
          if (campo.GAC_GPP_ID_PROXIMA === 0) {
            campo.GAC_GPP_ID_PROXIMA = null;
          }
        });
    });

    this.state.itemsAgruped &&
      this.state.itemsAgruped.forEach((group) => {
        group.ITEMS.forEach((itemVal) => {
          if (!itemVal.PERGUNTAS) {
            itemVal.PERGUNTAS = questions;
          } else {
            itemVal.PERGUNTAS.forEach((pergunta, i) => {
              let clone = Object.assign(
                {},
                cloneQsts.find((question) => question.GPP_POSICAO === pergunta.GPP_POSICAO)
              );

              pergunta.GPP_PERGUNTA = clone.GPP_PERGUNTA;
              pergunta.GPP_POSICAO = clone.GPP_POSICAO;
              // itemVal.PERGUNTAS[i].GPP_PERGUNTA = qsts.GPP_PERGUNTA;
              // itemVal.PERGUNTAS[i].GPP_POSICAO = 'A';
              //     pergunta.GPP_POSICAO = questions[i].GPP_POSICAO;
              //     pergunta.GPP_PERGUNTA = questions[i].GPP_PERGUNTA;
            });
          }
        });
      });

    this.state.itemsAgruped &&
      this.state.itemsAgruped.forEach((group) => {
        group.ITEMS.forEach((itemVal) => {
          if (!itemVal.GGI_ID) {
            itemVal.PERGUNTAS = itemVal.PERGUNTAS.map((question) => {
              let cloneQuestion = Object.assign(
                {},
                itemVal.PERGUNTAS.find((pergunta) => pergunta.GPP_POSICAO === question.GPP_POSICAO)
              );
              delete cloneQuestion.GPP_ID;

              cloneQuestion.CAMPOS = question.CAMPOS.map((field) => {
                let cloneField = Object.assign({}, field);
                delete cloneField.GAC_ID;
                return cloneField;
              });
              return cloneQuestion;
            });
          }
        });
      });

    const data = {
      GAP_EMP_ID: this.state.empresaAtiva,
      GAP_DESCRICAO: search.GAP_DESCRICAO.toUpperCase(),
      GAP_DESCRICAO_LONGA: search.GAP_DESCRICAO_LONGA && search.GAP_DESCRICAO_LONGA.toUpperCase(),
      GAP_ICONE: search.GAP_ICONE ? search.GAP_ICONE : '',
      GAP_FLG_STATUS: this.state.statusSearch,
    };

    this.setState({
      questionsDisponible: questions,
      search: data,
    });

    if (action === 'editar') {
      const dataToSend = {
        GAP_ID: search.GAP_ID,
        GAP_EMP_ID: search.GAP_EMP_ID,
        GAP_DESCRICAO: search.GAP_DESCRICAO && search.GAP_DESCRICAO.toUpperCase(),
        GAP_DESCRICAO_LONGA: search.GAP_DESCRICAO_LONGA && search.GAP_DESCRICAO_LONGA.toUpperCase(),
        GAP_ICONE: search.GAP_ICONE && search.GAP_ICONE,
        GAP_FLG_STATUS: this.state.statusSearch,
        GAP_FLG_AGRUPA: isAgruped,
        GAP_FLG_VENDEDOR: sellerAccess ? 1 : 0,
        GAP_FLG_OBRIGATORIA_NAO_APLICA: noMandatory ? 1 : 0,
        AGRUPAMENTO: this.state?.itemsAgruped,
      };
      try {
        await api.put(`v1/searchs/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`, dataToSend);
        if (actionQuestion === 'editar') {
          alerta('Salvo com sucesso!', 1);
          this.setState({
            actionQuestion: 'novo',
          });
          setTimeout(async () => {
            await this.handleSearch(dataToSend.GAP_ID);
          }, 500);
        } else {
          alerta('Pesquisa salva com sucesso!', 1);
          this.props.history.push('/Searchs');
        }
      } catch (err) {
        alerta('Erro ao criar a pesquisa', 2);
      } finally {
        this.setState(
          {
            loading: false,
          }
          // setTimeout(async () => {
          //   await this.handleUpdateQuestions(dataToSend.GAP_ID);
          // }, 1500)
        );
      }
    }
  };

  saveAllQuestions = async (questions) => {
    const { search, isAgruped, action, actionQuestion, noMandatory, sellerAccess } = this.state;
    this.setState({
      loading: true,
    });

    if (isAgruped === 1) {
      this.saveAllQuestionsForSearchAgruped(questions);
    } else {
      questions.forEach((qst) => {
        qst.CAMPOS &&
          qst.CAMPOS.length > 0 &&
          qst.CAMPOS.forEach((campo) => {
            if (campo.GAC_GPP_ID_PROXIMA === 0) {
              campo.GAC_GPP_ID_PROXIMA = null;
            }
          });
      });

      const data = {
        GAP_EMP_ID: this.state.empresaAtiva,
        GAP_DESCRICAO: search.GAP_DESCRICAO.toUpperCase(),
        GAP_DESCRICAO_LONGA: search.GAP_DESCRICAO_LONGA && search.GAP_DESCRICAO_LONGA.toUpperCase(),
        GAP_ICONE: search.GAP_ICONE ? search.GAP_ICONE : '',
        GAP_FLG_STATUS: this.state.statusSearch,
        PERGUNTAS: questions,
      };

      this.setState({
        questionsDisponible: questions,
        search: data,
      });

      if (action === 'editar') {
        const dataToSend = {
          GAP_ID: search.GAP_ID,
          GAP_EMP_ID: search.GAP_EMP_ID,
          GAP_DESCRICAO: search.GAP_DESCRICAO && search.GAP_DESCRICAO.toUpperCase(),
          GAP_DESCRICAO_LONGA: search.GAP_DESCRICAO_LONGA && search.GAP_DESCRICAO_LONGA.toUpperCase(),
          GAP_ICONE: search.GAP_ICONE && search.GAP_ICONE,
          GAP_FLG_STATUS: this.state.statusSearch,
          GAP_FLG_AGRUPA: isAgruped,
          GAP_FLG_VENDEDOR: sellerAccess ? 1 : 0,
          GAP_FLG_OBRIGATORIA_NAO_APLICA: noMandatory ? 1 : 0,
          PERGUNTAS: questions,
        };
        try {
          const res = await api.put(`v1/searchs/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`, dataToSend);
          const { sucess } = res.data;
          if (sucess) {
            if (actionQuestion === 'editar') {
              alerta('Salvo com sucesso!', 1);
              this.setState({
                actionQuestion: 'novo',
              });
              setTimeout(async () => {
                await this.handleUpdateQuestions(dataToSend.GAP_ID);
              }, 500);
            } else {
              alerta('Pesquisa salva com sucesso!', 1);
              this.props.history.push('/Searchs');
            }
          } else {
            alerta('Erro ao criar a pesquisa', 2);
          }
        } catch (err) {
          alerta('Erro ao salvar a pesquisa', 2);
        } finally {
          this.setState({
            loading: false,
          });
        }
      } else {
        const dataToSend = {
          GAP_EMP_ID: this.state.empresaAtiva,
          GAP_DESCRICAO: search.GAP_DESCRICAO && search.GAP_DESCRICAO.toUpperCase(),
          GAP_DESCRICAO_LONGA: search.GAP_DESCRICAO_LONGA && search.GAP_DESCRICAO_LONGA.toUpperCase(),
          GAP_ICONE: this.state.addressIconSearch,
          GAP_FLG_STATUS: this.state.statusSearch,
          GAP_FLG_VENDEDOR: sellerAccess ? 1 : 0,
          GAP_FLG_OBRIGATORIA_NAO_APLICA: noMandatory ? 1 : 0,
          PERGUNTAS: questions.length === 0 && null,
        };
        try {
          const res = await api.post(
            `v1/searchs/add/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
            dataToSend
          );
          const { sucess } = res.data;
          if (sucess) {
            alerta('Pesquisa criada com sucesso!', 1);
            this.props.history.push('/Searchs');
          } else {
            alerta('Erro ao criar a pesquisa', 2);
          }
        } catch (err) {
          alerta('Erro ao salvar a pesquisa', 2);
        } finally {
          this.setState({
            loading: false,
          });
        }
      }
    }
  };

  handleValidationData = async () => {
    let retorno = await this.schema
      .validate(this.state, { abortEarly: false })
      .then((res, data) => {
        return true;
      })
      .catch((err) => {
        const errors = this.getValidationErrors(err);

        this.setState({
          errors,
        });
        return false;
      });
    return retorno;
  };

  getValidationErrors = (err) => {
    const validationErrors = {};

    err.inner?.length > 0 &&
      err.inner.forEach((error) => {
        if (error.path) {
          validationErrors[error.path] = error.message;
        }
      });

    return validationErrors;
  };

  handleValidationUnicField = (nameField, errorPage) => {
    this.schema
      .validate(this.state, { abortEarly: false })
      .then((res, data) =>
        this.setState({
          [errorPage]: {},
        })
      )
      .catch((err) => {
        const errors_ = this.getValidationErrors(err);
        for (var error in errors_) {
          if (error !== nameField) {
            delete errors_[error];
          }
          if (errors_[error] === undefined) {
            delete errors_[error];
          }
        }

        this.setState(
          (prevState) => ({
            [errorPage]: {
              ...prevState[errorPage],
              [nameField]: errors_[[nameField]], //[]é para acessar o nome da propriedade do valor, [[]] é para acessar a o valor da propriedade
            },
          }),
          () => {
            if (this.state[errorPage][nameField] === undefined) {
              const errorsAux = this.state[errorPage];
              delete errorsAux[nameField];
              this.setState({
                [errorPage]: errorsAux,
              });
            }
          }
        );
      });
  };

  schema = Yup.object().shape({
    descriptionQuestion: Yup.string().required('Campo obrigatório').max(100, 'Máximo 100 caracteres'),
    search: Yup.object({
      GAP_DESCRICAO: Yup.string().required('Campo obrigatório').max(30, 'Máximo 30 caracteres'),
      GAP_DESCRICAO_LONGA: Yup.string().max(100, 'Máximo 100 caracteres'),
    }).required(),
  });

  render() {
    const { addingQuestion, loading, search, statusSearch, isAgruped, errors, sellerAccess, noMandatory } = this.state;

    const { action } = this.props.location.state;
    return (
      <>
        <Header />
        <WaitScreen loading={loading} />
        <Container className="containerSearch" ref={this.containerRef}>
          <DirectTituloJanela
            urlVoltar={'/searchs'}
            titulo={
              loading ? (
                'Aguarde...'
              ) : (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon>poll</Icon>Pesquisa
                </span>
              )
            }
          />
          <div id="contentHeader" ref={this.containerHeaderRef}>
            <Linha>
              <DivDetalhe className="contentSubTitle">
                <SubTitulo>
                  <Icon>star</Icon>Dados básicos
                </SubTitulo>
              </DivDetalhe>
            </Linha>
            <Linha className="primeiraLinha">
              <DivDetalhe flex={2}>
                <Labels>Descrição curta</Labels>
                <input
                  type="text"
                  value={
                    search !== undefined && search.GAP_DESCRICAO !== undefined
                      ? capitalize(search.GAP_DESCRICAO, true)
                      : ''
                  }
                  onChange={(ev) => {
                    this.handleChangeShortDescription(ev);
                    this.handleValidationUnicField('search.GAP_DESCRICAO', 'errors');
                  }}
                />
                {errors['search.GAP_DESCRICAO'] && (
                  <span style={{ color: '#FF0000' }}>{errors['search.GAP_DESCRICAO']}</span>
                )}
              </DivDetalhe>
              <DivDetalhe flex={6}>
                <Labels>Descrição longa</Labels>
                <input
                  type="text"
                  value={
                    search?.GAP_DESCRICAO_LONGA !== undefined && search?.GAP_DESCRICAO_LONGA !== null
                      ? capitalize(search?.GAP_DESCRICAO_LONGA, true)
                      : ''
                  }
                  onChange={async (ev) => {
                    await this.handleChangeLongDescription(ev);
                    this.handleValidationUnicField('search.GAP_DESCRICAO_LONGA', 'errors');
                  }}
                />
                {errors['search.GAP_DESCRICAO_LONGA'] && (
                  <span style={{ color: '#FF0000' }}>{errors['search.GAP_DESCRICAO_LONGA']}</span>
                )}
              </DivDetalhe>
            </Linha>
            <Linha style={{ flexDirection: 'row', alignItems: 'center' }}>
              <DivDetalhe>
                <Labels>Ícone</Labels>
                <img
                  src={this.state.addressIconSearch === '' ? noSearchImage : this.state.addressIconSearch}
                  width="64"
                  alt="Ícone da pesquisa"
                  style={{ marginTop: '5px' }}
                />
              </DivDetalhe>
              <DivDetalhe>
                <UploadFile>
                  <label
                    htmlFor="input-file"
                    className="waves-effect waves-light saib-button is-secondary"
                    onClick={() => document.getElementById('searchImage').click()}
                  >
                    Carregar
                  </label>
                  <label
                    className="waves-effect waves-light saib-button is-secondary"
                    onClick={this.handleClearSearchImage}
                  >
                    Limpar
                  </label>
                  <input
                    id="searchImage"
                    type="file"
                    value=""
                    accept="image/x-png,image/jpeg"
                    onChange={(event) => this.handleChangeSearchImage(event)}
                  />
                  <span id="file-name"></span>
                </UploadFile>
              </DivDetalhe>
              <DivDetalhe>
                <Checkbox
                  id="Checkbox_3"
                  label="Ativa"
                  value={String(statusSearch)}
                  checked={statusSearch && statusSearch === 1 ? true : false}
                  onChange={this.onChangeSearchActive}
                />
                <ContenteCheckbox isDisabled={String(search?.GAP_ID).length > 0 ? true : false}>
                  <Checkbox
                    id="Checkbox_44"
                    className="checkAgruped"
                    disabled={search?.GAP_ID && String(search?.GAP_ID).length > 0 ? true : false}
                    label="Agrupada"
                    value={String(isAgruped)}
                    checked={isAgruped && isAgruped === 1 ? true : false}
                    onChange={this.onChangeIsAgruped}
                  />
                </ContenteCheckbox>
                <ContenteCheckbox isDisabled={String(search?.GAP_ID).length > 0 ? true : false}>
                  <Checkbox
                    id="Checkbox_Seller"
                    className="checkSeller"
                    label="Acesso vendedor"
                    value={String(sellerAccess)}
                    checked={sellerAccess}
                    onChange={(e) => {
                      if (e.target.checked) {
                        this.setState({
                          sellerAccess: true,
                        });
                      } else {
                        this.setState({
                          sellerAccess: false,
                        });
                      }
                    }}
                  />
                </ContenteCheckbox>
                <ContenteCheckbox isDisabled={String(search?.GAP_ID).length > 0 ? true : false}>
                  <Checkbox
                    id="Checkbox_notobligate"
                    className="checknotobligate"
                    label="Obrigatoriedade não se aplica"
                    value={String(noMandatory)}
                    checked={noMandatory && noMandatory === 1 ? true : false}
                    onChange={(e) => {
                      if (e.target.checked) {
                        this.setState({
                          noMandatory: true,
                        });
                      } else {
                        this.setState({
                          noMandatory: false,
                        });
                      }
                    }}
                  />
                </ContenteCheckbox>
              </DivDetalhe>
            </Linha>
          </div>

          {isAgruped === 1 && (
            <ContentAgrupedData>
              <SubTitulo>
                <Icon>label</Icon>Agrupamentos
              </SubTitulo>
              <SearchAgrupedData
                handleItemsInSearch={this.handleItemsAgruped}
                data={search.AGRUPAMENTO}
                action={action}
                deleteGrouping={(res) => {
                  const { search } = this.state;
                  const update = search.AGRUPAMENTO.filter((e) => e.GGR_ID !== res);
                  search.AGRUPAMENTO = update;
                  this.setState({ search, itemsAgruped: update });
                }}
              />
            </ContentAgrupedData>
          )}

          <Linha
            style={{
              marginTop: '40px',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <DivDetalhe className="contentSubTitle">
              <SubTitulo style={{ marginTop: '0' }}>
                <Icon>question_answer</Icon>Perguntas
              </SubTitulo>
            </DivDetalhe>
            <DivDetalhe>
              <Button
                disabled={
                  this.state?.actionQuestion === 'editar' ||
                  (isAgruped === 1 && !this.state?.itemsAgruped?.length) ||
                  !!Object.values(errors).length
                    ? true
                    : false
                }
                className="waves-effect waves-light saib-button is-primary"
                onClick={this.handleAddNewQuestion}
              >
                <Icon>add</Icon>
              </Button>
            </DivDetalhe>
          </Linha>
          {addingQuestion && (
            <>
              <NewQuestion
                data={{
                  active: this.state.activeQuestion,
                  questionRequired: this.state.questionRequired,
                  typeResult: this.state.typeResult,
                  handleChangeNewQuestionRequired: this.handleNewQuestion,
                  handleChangeNewQuestionActive: this.handleNewQuestionActive,
                  handleChangeQuestionRequired: this.handleChangeQuestionRequired,
                  handleDescriptionQuestion: this.handleDescriptionQuestion,
                  handleTypeResultQuestion: this.handleTypeResultQuestion,
                  handleSaveQuestion: this.handleSaveQuestion,
                  handleDeleteQuestion: this.handleDeleteQuestion,
                  questionType: this.state.questionType,
                  handleChangeQuestionType: this.handleChangeQuestionType,
                  handleCancellQuestion: this.handleCancellQuestion,
                }}
                search={search}
                action={this.state.actionQuestion}
                errors={this.state.errors}
                dataToEdit={{
                  descriptionQuestion: this.state.descriptionQuestion,
                  active: this.state.activeQuestion,
                  questionRequired: this.state.questionRequired,
                  questionType: this.state.questionType,
                  typeResult: this.state.typeResult,
                  question: this.state.questionEdit,
                  handleDeleteQuestion: this.handleDeleteQuestion,
                  handleChangeNewQuestionRequired: this.handleNewQuestion,
                  handleChangeNewQuestionActive: this.handleNewQuestionActive,
                  handleChangeQuestionRequired: this.handleChangeQuestionRequired,
                  handleDescriptionQuestion: this.handleDescriptionQuestion,
                  handleTypeResultQuestion: this.handleTypeResultQuestion,
                  handleSaveQuestion: this.handleSaveQuestion,
                  handleChangeQuestionType: this.handleChangeQuestionType,
                  handleCancellQuestion: this.handleCancellQuestion,
                }}
              />
            </>
          )}
          <Linha className="primeiraLinha">
            <QuestionsManager
              disabled={
                this.state?.questionsDisponible?.length < 1
                  ? true
                  : false ||
                    this.state?.actionQuestion === 'editar' ||
                    (isAgruped === 1 && !this.state?.itemsAgruped?.length) ||
                    !!Object.values(errors).length
                  ? true
                  : false
              }
              updatePositionQuestionSearchAgruped={this.updateNewPositionAllQuestionsAgruped}
              refs={[this.containerRef, this.containerHeaderRef]}
              isAgruped={isAgruped}
              saveQuestions={this.saveAllQuestions}
              handleDataToEditQuestion={this.handleDataToEditQuestion}
              perguntas={search && search.PERGUNTAS}
              // enableToDelete={search?.EXCLUIR}
              questionsDisponible={this.state.questionsDisponible}
            />
          </Linha>
        </Container>
      </>
    );
  }
}
