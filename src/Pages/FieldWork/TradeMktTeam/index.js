import React, { Component } from 'react';
import {
  Container,
  TitleTeam,
  DivDetalhe,
  Labels,
  Linha,
  SubTitulo,
  LinhaRodape,
  DivRodape,
  ContentPromoters,
  CreateForm,
  Form,
  Icons,
  SubTituloDestaque,
} from './style';
import DirectTituloJanela from '../../../Components/Globals/DirectTituloJanela';
import WaitScreen from '../../../Components/Globals/WaitScreen';
import Header from '../../../Components/System/Header';
import SelectQuery from '../../../Components/Globals/SelectQuery';
import { Collapsible, CollapsibleItem, Icon } from 'react-materialize';
import { getFromStorage } from '../../../services/auth';
import { alerta } from '../../../services/funcoes';
import api from '../../../services/api';
import * as Yup from 'yup';
import moment from 'moment';
import ReactInputMask from 'react-input-mask';
export default class TradeMktTeam extends Component {
  state = {
    loading: false,
    description: '',
    errors: {},
    displayForm: false,

    id: null,
    nameTeam: '',
    startJourneySupervision: '',
    endJourneySupervision: '',
    startPauseSupervision: '',
    endPauseSupervision: '',
    startSecondPauseSupervision: '',
    endSecondPauseSupervision: '',

    startJourneyPromoter: '',
    endJourneyPromoter: '',
    startPausePromoter: '',
    endPausePromoter: '',
    startSecondPausePromoter: '',
    endSecondPausePromoter: '',

    startJourneyManager: '',
    endJourneyManager: '',
    startPauseManager: '',
    endPauseManager: '',
    startSecondPauseManager: '',
    endSecondPauseManager: '',

    forceFirstStopPromoter: 0,
    forceSecondStopPromoter: 0,
    forceFirstStopSupervision: 0,
    forceSecondStopSupervision: 0,
    forceFirstStopManager: 0,
    forceSecondStopManager: 0,

    supervisorSelected: '',
    promotorSelected: '',
    managerSelected: '',
    descriptionManager: null,
    descriptionSupervisor: null,
    descriptionPromoter: null,

    promoters: [],
    selectSupervisor: null,
    selectManager: null,
    selectPromoter: null,
    sellersList: null,
    selectedSeller: '',

    GEP_RAIO_ABERTURA: 0,
    GET_RAIO_ABERTURA_GERENTE: 0,
    GET_RAIO_ABERTURA_SUPERVISOR: 0,
    GEP_ID: null,

    GEP_INICIO_JORNADA_PROMOTOR_SA: null,
    GEP_FIM_JORNADA_PROMOTOR_SA: null,
    GEP_INICIO_PARADA1_PROMOTOR_SA: null,
    GEP_FIM_PARADA1_PROMOTOR_SA: null,
    GEP_PARADA1_PROMOTOR_FORCAR_SA: 0,

    GET_INICIO_JORNADA_GERENTE_SA: null,
    GET_FIM_JORNADA_GERENTE_SA: null,
    GET_INICIO_PARADA1_GERENTE_SA: null,
    GET_FIM_PARADA1_GERENTE_SA: null,
    GET_PARADA1_GERENTE_FORCAR_SA: 0,
    GET_INICIO_JORNADA_SUP_SA: null,
    GET_FIM_JORNADA_SUP_SA: null,
    GET_INICIO_PARADA1_SUP_SA: null,
    GET_FIM_PARADA1_SUP_SA: null,
    GET_PARADA1_SUP_FORCAR_SA: 0,
    edit: false,
  };

  async componentDidMount() {
    this.setState({ loading: true });
    const { action, trade } = this.props.location.state;

    if (action === 'editar') {
      this.handleDataInInputs(trade);
    }
    await this.carregarVariaveisEstado();
    await this.carregarListaUsuarios();
    await this.loadFilters();
    this.loadTradesMkt();

    this.setState({
      action,
      trade,
      loading: false,
    });
  }

  componentDidUpdate() {
    const { action } = this.props.location.state;
    if (action !== this.state.action) {
      this.setState({
        action,
      });
    }
  }

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
    });
  };

  returnAllUsersExceptionPromoterAndSupervisores = (data) => {
    return data.filter((user) => user.USR_GMOVEL_SUPERVISOR !== 'V' && user.USR_GMOVEL_PROMOTOR !== 'V' && user);
  };

  carregarListaUsuarios = async () => {
    try {
      let { empresaAtiva, selectManager, managerSelected, descriptionManager } = this.state;
      let url = `/v1/users/${empresaAtiva}`;
      const retorno = await api.get(url);
      const { data } = retorno.data;
      if (!retorno) {
        this.setState({ listaUsuarios: [] });
      } else {
        if (retorno.data && retorno.data.sucess) {
          if (retorno.data.data.length === 0) {
            this.setState({ listaUsuarios: [] });
          } else {
            const users = data.filter(e => e.USR_GMOVEL_GERENTE === "V");

            selectManager = users.map((element) => {
              let item = {};
              item.manager = element.USR_ID;
              item.name = element.USR_NOME;
              item.label = `${element.USR_ID} - ${element.USR_NOME}`;
              return item;
            });

            if (!selectManager.find((item) => item.manager === parseInt(managerSelected))) {
              managerSelected = null;
              descriptionManager = null;
            }

            this.setState({
              listaUsuarios: data,
              selectManager,
              managerSelected,
              descriptionManager,
            });
          }
        } else {
          this.setState({ listaUsuarios: [] });
        }
      }
    } catch (err) {
      alerta('Erro ao carregar a lista de book básico =>' + err);
      this.setState({ loading: false });
    }
  };

  loadFilters = async () => {
    let {
      empresaAtiva,
      selectSupervisor,
      selectPromoter,
      supervisorSelected,
      promotorSelected,
      descriptionPromoter,
      descriptionSupervisor,
      usuarioAtivo,
    } = this.state;
    try {
      let url = `/v1/users/${empresaAtiva}`;
      const retorno = await api.get(url);
      const sellersList = await api.get(`v1/tradeteam/comercial/${empresaAtiva}/${usuarioAtivo}`);
      let sellers = [];
      if (retorno.data && retorno.data.sucess) {
        const { data } = retorno.data;

        let supervisor = [];
        let promoter = [];
        sellersList.data.data.forEach((seller) => {
          sellers.push({
            vendedor: seller.ESTR_ID,
            name: seller.ESTR_DESCR_ROTA,
            label: `${seller.ESTR_COD_ROTA} - ${seller.ESTR_DESCR_ROTA}`,
          });
        });
        data.forEach((element) => {
          if (element.USR_GMOVEL_SUPERVISOR === 'V') {
            supervisor.push({
              supervisor: element.USR_ID,
              name: element.USR_NOME,
              label: `${element.USR_ID} - ${element.USR_NOME}`,
            });
          }

          if (element.USR_GMOVEL_PROMOTOR === 'V') {
            promoter.push({
              promoter: element.USR_ID,
              name: element.USR_NOME,
              label: `${element.USR_ID} - ${element.USR_NOME}`,
            });
          }
        });

        if (!supervisor.find((item) => item.supervisor === parseInt(supervisorSelected))) {
          supervisorSelected = null;
          descriptionSupervisor = null;
        }

        if (!promoter.find((item) => item.promoter === parseInt(promotorSelected))) {
          promotorSelected = null;
          descriptionPromoter = null;
        }

        selectSupervisor = supervisor;
        selectPromoter = promoter;
      }

      this.setState({
        selectSupervisor,
        selectPromoter,
        supervisorSelected,
        promotorSelected,
        descriptionPromoter,
        descriptionSupervisor,
        sellersList: sellers,
      });
    } catch (err) {
      alerta('Erro ao carregar os filtros da tela =>' + err, 2);
      this.setState({ loading: false });
    }
  };

  loadTradesMkt = async () => {
    let { empresaAtiva } = this.state;
    this.setState({
      loading: true,
    });
    try {
      const { usuarioAtivo } = this.state;

      let url;
      url = '/v1/tradeteam/' + empresaAtiva + '/' + usuarioAtivo;
      const data = {
        GET_ID: '',
        GET_COD_GERENTE: '',
        GET_DESCR_GERENTE: '',
        GET_COD_SUPERVISOR: '',
        GET_DESCR_SUPERVISOR: '',
        GET_COD_PROMOTOR: '',
        GET_DESCR_PROMOTOR: '',
        GET_FLG_SITUACAO: '',
      };
      const retorno = await api.post(url, data);
      if (retorno.data && retorno.data.sucess) {
        let trades = retorno.data.data;

        this.setState({
          allTradesMkt: trades,
          tradesMkt: trades,
        });
      }
    } catch (err) {
      alerta('Erro ao carregar as pesquisas =>' + err, 2);
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  verifyIfHasThisTeam = (idPromoter, supervisorSelected, managerSelected) => {
    const { tradesMkt } = this.state;
    return !tradesMkt.every((trade) => {
      return trade.GET_COD_PROMOTOR === idPromoter &&
        trade.GET_COD_SUPERVISOR === supervisorSelected &&
        trade.GET_COD_GERENTE === managerSelected
        ? false
        : true;
    });
  };

  handleDataInInputs = (trade) => {
    this.setState({
      id: trade.GET_ID,
      nameTeam: trade.GET_NOME ? trade.GET_NOME : '',
      supervisorSelected: trade.GET_COD_SUPERVISOR ? trade.GET_COD_SUPERVISOR : '',
      descriptionSupervisor: trade.GET_DESCR_SUPERVISOR ? trade.GET_DESCR_SUPERVISOR : '',
      managerSelected: trade.GET_COD_GERENTE ? trade.GET_COD_GERENTE : '',
      descriptionManager: trade.GET_DESCR_GERENTE ? trade.GET_DESCR_GERENTE : '',
      startJourneyPromoter: trade.GET_INICIO_JORNADA_PROMOTOR ? trade.GET_INICIO_JORNADA_PROMOTOR : '',
      endJourneyPromoter: trade.GET_FIM_JORNADA_PROMOTOR ? trade.GET_FIM_JORNADA_PROMOTOR : '',
      startPausePromoter: trade.GET_INICIO_PARADA1_PROMOTOR ? trade.GET_INICIO_PARADA1_PROMOTOR : '',
      endPausePromoter: trade.GET_FIM_PARADA1_PROMOTOR ? trade.GET_FIM_PARADA1_PROMOTOR : '',
      forceFirstStopPromoter: trade.GET_PARADA1_PROMOTOR_FORCAR ? trade.GET_PARADA1_PROMOTOR_FORCAR : 0,
      startSecondPausePromoter: trade.GET_INICIO_PARADA2_PROMOTOR ? trade.GET_INICIO_PARADA2_PROMOTOR : '',
      endSecondPausePromoter: trade.GET_FIM_PARADA2_PROMOTOR ? trade.GET_FIM_PARADA2_PROMOTOR : '',
      forceSecondStopPromoter: trade.GET_PARADA2_PROMOTOR_FORCAR ? trade.GET_PARADA2_PROMOTOR_FORCAR : 0,
      startJourneySupervision: trade.GET_INICIO_JORNADA_SUPERVISOR ? trade.GET_INICIO_JORNADA_SUPERVISOR : '',
      endJourneySupervision: trade.GET_FIM_JORNADA_SUPERVISOR ? trade.GET_FIM_JORNADA_SUPERVISOR : '',
      startPauseSupervision: trade.GET_INICIO_PARADA1_SUPERVISOR ? trade.GET_INICIO_PARADA1_SUPERVISOR : '',
      endPauseSupervision: trade.GET_FIM_PARADA1_SUPERVISOR ? trade.GET_FIM_PARADA1_SUPERVISOR : '',
      forceFirstStopSupervision: trade.GET_PARADA1_SUPERVISOR_FORCAR ? trade.GET_PARADA1_SUPERVISOR_FORCAR : 0,
      startSecondPauseSupervision: trade.GET_INICIO_PARADA2_SUPERVISOR ? trade.GET_INICIO_PARADA2_SUPERVISOR : '',
      endSecondPauseSupervision: trade.GET_FIM_PARADA2_SUPERVISOR ? trade.GET_FIM_PARADA2_SUPERVISOR : '',
      forceSecondStopSupervision: trade.GET_PARADA2_SUPERVISOR_FORCAR ? trade.GET_PARADA2_SUPERVISOR_FORCAR : 0,
      startJourneyManager: trade.GET_INICIO_JORNADA_GERENTE ? trade.GET_INICIO_JORNADA_GERENTE : '',
      endJourneyManager: trade.GET_FIM_JORNADA_GERENTE ? trade.GET_FIM_JORNADA_GERENTE : '',
      startPauseManager: trade.GET_INICIO_PARADA1_GERENTE ? trade.GET_INICIO_PARADA1_GERENTE : '',
      endPauseManager: trade.GET_FIM_PARADA1_GERENTE ? trade.GET_FIM_PARADA1_GERENTE : '',
      forceFirstStopManager: trade.GET_PARADA1_GERENTE_FORCAR ? trade.GET_PARADA1_GERENTE_FORCAR : 0,
      startSecondPauseManager: trade.GET_INICIO_PARADA2_GERENTE ? trade.GET_INICIO_PARADA2_GERENTE : '',
      endSecondPauseManager: trade.GET_FIM_PARADA2_GERENTE ? trade.GET_FIM_PARADA2_GERENTE : '',
      forceSecondStopManager: trade.GET_PARADA2_GERENTE_FORCAR ? trade.GET_PARADA2_GERENTE_FORCAR : 0,
      GEP_RAIO_ABERTURA: trade.GEP_RAIO_ABERTURA ? trade.GEP_RAIO_ABERTURA : 0,
      GET_RAIO_ABERTURA_GERENTE: trade.GET_RAIO_ABERTURA_GERENTE ? trade.GET_RAIO_ABERTURA_GERENTE : 0,
      GET_RAIO_ABERTURA_SUPERVISOR: trade.GET_RAIO_ABERTURA_SUPERVISOR ? trade.GET_RAIO_ABERTURA_SUPERVISOR : 0,

      GET_INICIO_JORNADA_GERENTE_SA: trade.GET_INICIO_JORNADA_GERENTE_SA ? trade.GET_INICIO_JORNADA_GERENTE_SA : 'null',
      GET_FIM_JORNADA_GERENTE_SA: trade.GET_FIM_JORNADA_GERENTE_SA ? trade.GET_FIM_JORNADA_GERENTE_SA : 'null',
      GET_INICIO_PARADA1_GERENTE_SA: trade.GET_INICIO_PARADA1_GERENTE_SA ? trade.GET_INICIO_PARADA1_GERENTE_SA : 'null',
      GET_FIM_PARADA1_GERENTE_SA: trade.GET_FIM_PARADA1_GERENTE_SA ? trade.GET_FIM_PARADA1_GERENTE_SA : 'null',
      GET_PARADA1_GERENTE_FORCAR_SA: trade.GET_PARADA1_GERENTE_FORCAR_SA ? trade.GET_PARADA1_GERENTE_FORCAR_SA : 0,
      GET_INICIO_JORNADA_SUP_SA: trade.GET_INICIO_JORNADA_SUP_SA ? trade.GET_INICIO_JORNADA_SUP_SA : 'null',
      GET_FIM_JORNADA_SUP_SA: trade.GET_FIM_JORNADA_SUP_SA ? trade.GET_FIM_JORNADA_SUP_SA : 'null',
      GET_INICIO_PARADA1_SUP_SA: trade.GET_INICIO_PARADA1_SUP_SA ? trade.GET_INICIO_PARADA1_SUP_SA : 'null',
      GET_FIM_PARADA1_SUP_SA: trade.GET_FIM_PARADA1_SUP_SA ? trade.GET_FIM_PARADA1_SUP_SA : 'null',
      GET_PARADA1_SUP_FORCAR_SA: trade.GET_PARADA1_SUP_FORCAR_SA ? trade.GET_PARADA1_SUP_FORCAR_SA : 0,
      promoters: trade.PROMOTORES,
    });
  };

  handleSelectSupervisor = (value) => {
    let { supervisorSelected, descriptionSupervisor } = this.state;

    if (value) {
      supervisorSelected = value.supervisor;
      descriptionSupervisor = value.label;

      this.setState({
        supervisorSelected,
        descriptionSupervisor,
      });
    } else {
      this.setState({
        supervisorSelected: '',
        descriptionSupervisor: '',
      });
    }
  };

  handleSelectPromotor = (value) => {
    let { promotorSelected, descriptionPromoter, tradesMkt, promoters, trade, edit } = this.state;

    if (value) {
      promotorSelected = value.promoter;
      descriptionPromoter = value.label;

      let promoterExist = false;
      tradesMkt.forEach((element) => {
        let item = element.PROMOTORES.filter(
          (promoter) => parseInt(promoter.GEP_COD_PROMOTOR) === parseInt(promotorSelected)
        );

        let inserted = promoters.filter((item) => parseInt(item.GEP_COD_PROMOTOR) === parseInt(promotorSelected));

        if ((item.length > 0 || inserted.length > 0) && parseInt(edit) !== parseInt(promotorSelected)) {
          if (trade) {
            if (element.GET_ID !== trade.GET_ID) {
              promoterExist = true;
            }
          } else {
            promoterExist = true;
          }
        }
      });

      if (!promoterExist) {
        this.setState({
          promotorSelected,
          descriptionPromoter,
        });
      } else {
        alerta(`O promotor ${promotorSelected} já faz parte de uma equipe`, 2);
      }
    } else {
      this.setState({
        promotorSelected: '',
        descriptionPromoter: '',
      });
    }
  };

  handleSelectSeller = (value) => {
    let { selectedSeller } = this.state;
    if (value) {
      selectedSeller = value.vendedor;

      this.setState({
        selectedSeller,
      });
    } else {
      this.setState({
        selectedSeller: '',
      });
    }
  };

  handleSelectManager = (value) => {
    let { managerSelected, descriptionManager } = this.state;
    managerSelected = value ? value.manager : '';
    descriptionManager = value ? value.label : '';

    this.setState({
      managerSelected,
      descriptionManager,
    });
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

  handleSaveTeam = async () => {
    const {
      descriptionManager,
      descriptionSupervisor,
      managerSelected,
      supervisorSelected,
      promotorSelected,
      action,
      empresaAtiva,
      startJourneySupervision,
      endJourneySupervision,
      startPauseSupervision,
      endPauseSupervision,
      startSecondPauseSupervision,
      endSecondPauseSupervision,
      id,
      nameTeam,

      startJourneyManager,
      endJourneyManager,
      startPauseManager,
      endPauseManager,
      startSecondPauseManager,
      endSecondPauseManager,
      forceFirstStopSupervision,
      forceSecondStopSupervision,
      forceFirstStopManager,
      forceSecondStopManager,
      promoters,
      GET_RAIO_ABERTURA_GERENTE,
      GET_RAIO_ABERTURA_SUPERVISOR,
      usuarioAtivo,
      GET_INICIO_JORNADA_GERENTE_SA,
      GET_FIM_JORNADA_GERENTE_SA,
      GET_INICIO_PARADA1_GERENTE_SA,
      GET_FIM_PARADA1_GERENTE_SA,
      GET_PARADA1_GERENTE_FORCAR_SA,
      GET_INICIO_JORNADA_SUP_SA,
      GET_FIM_JORNADA_SUP_SA,
      GET_INICIO_PARADA1_SUP_SA,
      GET_FIM_PARADA1_SUP_SA,
      GET_PARADA1_SUP_FORCAR_SA,
    } = this.state;
    if (action === 'editar') {
      const dataToSend = {
        GET_ID: id,
        GET_NOME: nameTeam,
        GET_USR_ID: usuarioAtivo,
        GET_EMP_ID: empresaAtiva,
        GET_COD_GERENTE: managerSelected ? managerSelected.toString() : null,
        GET_DESCR_GERENTE: descriptionManager ? descriptionManager.toUpperCase() : null,
        GET_COD_SUPERVISOR: supervisorSelected.toString(),
        GET_DESCR_SUPERVISOR: descriptionSupervisor.toUpperCase(),
        GET_INICIO_JORNADA_SUPERVISOR: startJourneySupervision,
        GET_FIM_JORNADA_SUPERVISOR: endJourneySupervision,
        GET_INICIO_PARADA1_SUPERVISOR: startPauseSupervision,
        GET_FIM_PARADA1_SUPERVISOR: endPauseSupervision,
        GET_INICIO_PARADA2_SUPERVISOR: startSecondPauseSupervision,
        GET_FIM_PARADA2_SUPERVISOR: endSecondPauseSupervision,
        GET_PARADA1_SUPERVISOR_FORCAR: forceFirstStopSupervision,
        GET_PARADA2_SUPERVISOR_FORCAR: forceSecondStopSupervision,
        GET_INICIO_JORNADA_GERENTE: startJourneyManager,
        GET_FIM_JORNADA_GERENTE: endJourneyManager,
        GET_INICIO_PARADA1_GERENTE: startPauseManager,
        GET_FIM_PARADA1_GERENTE: endPauseManager,
        GET_INICIO_PARADA2_GERENTE: startSecondPauseManager,
        GET_FIM_PARADA2_GERENTE: endSecondPauseManager,
        GET_PARADA1_GERENTE_FORCAR: forceFirstStopManager,
        GET_PARADA2_GERENTE_FORCAR: forceSecondStopManager,
        GET_DTA_ALTERACAO: moment(new Date()).local().format(),
        GET_RAIO_ABERTURA_GERENTE,
        GET_RAIO_ABERTURA_SUPERVISOR,
        GET_INICIO_JORNADA_GERENTE_SA,
        GET_FIM_JORNADA_GERENTE_SA,
        GET_INICIO_PARADA1_GERENTE_SA,
        GET_FIM_PARADA1_GERENTE_SA,
        GET_PARADA1_GERENTE_FORCAR_SA,
        GET_INICIO_JORNADA_SUP_SA,
        GET_FIM_JORNADA_SUP_SA,
        GET_INICIO_PARADA1_SUP_SA,
        GET_FIM_PARADA1_SUP_SA,
        GET_PARADA1_SUP_FORCAR_SA,
        PROMOTORES: promoters,
      };

      try {
        const res = await api.put(`v1/tradeteam/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`, dataToSend);

        const { sucess } = res.data;
        if (sucess) {
          alerta('Equipe atualizada com sucesso!', 1);
          this.props.history.push('/TradesMktTeam');
        }
      } catch (err) {
        alerta('Erro ao atualizar a equipe', 2);
      }
    } else {
      const teamAlreadyCreated = this.verifyIfHasThisTeam(
        promotorSelected,
        supervisorSelected,
        managerSelected === '0' ? null : managerSelected
      );

      if (teamAlreadyCreated) {
        alerta('Já existe equipe com os mesmos integrantes, verifique');
        return;
      }

      const dataToSend = {
        GET_NOME: nameTeam,
        GET_USR_ID: usuarioAtivo,
        GET_COD_GERENTE: managerSelected ? managerSelected : null,
        GET_DESCR_GERENTE: descriptionManager ? descriptionManager.toUpperCase() : null,
        GET_COD_SUPERVISOR: supervisorSelected,
        GET_DESCR_SUPERVISOR: descriptionSupervisor.toUpperCase(),
        GET_INICIO_JORNADA_SUPERVISOR: startJourneySupervision,
        GET_FIM_JORNADA_SUPERVISOR: endJourneySupervision,
        GET_INICIO_PARADA1_SUPERVISOR: startPauseSupervision,
        GET_FIM_PARADA1_SUPERVISOR: endPauseSupervision,
        GET_INICIO_PARADA2_SUPERVISOR: startSecondPauseSupervision,
        GET_FIM_PARADA2_SUPERVISOR: endSecondPauseSupervision,
        GET_PARADA1_SUPERVISOR_FORCAR: forceFirstStopSupervision,
        GET_PARADA2_SUPERVISOR_FORCAR: forceSecondStopSupervision,
        GET_INICIO_JORNADA_GERENTE: startJourneyManager,
        GET_FIM_JORNADA_GERENTE: endJourneyManager,
        GET_INICIO_PARADA1_GERENTE: startPauseManager,
        GET_FIM_PARADA1_GERENTE: endPauseManager,
        GET_PARADA1_GERENTE_FORCAR: forceFirstStopManager,
        GET_INICIO_PARADA2_GERENTE: startSecondPauseManager,
        GET_FIM_PARADA2_GERENTE: endSecondPauseManager,
        GET_PARADA2_GERENTE_FORCAR: forceSecondStopManager,
        GET_DTA_ALTERACAO: moment(new Date()).format(),
        GET_RAIO_ABERTURA_GERENTE,
        GET_RAIO_ABERTURA_SUPERVISOR,
        GET_INICIO_JORNADA_GERENTE_SA,
        GET_FIM_JORNADA_GERENTE_SA,
        GET_INICIO_PARADA1_GERENTE_SA,
        GET_FIM_PARADA1_GERENTE_SA,
        GET_PARADA1_GERENTE_FORCAR_SA,
        GET_INICIO_JORNADA_SUP_SA,
        GET_FIM_JORNADA_SUP_SA,
        GET_INICIO_PARADA1_SUP_SA,
        GET_FIM_PARADA1_SUP_SA,
        GET_PARADA1_SUP_FORCAR_SA,
        PROMOTORES: promoters,
      };

      try {
        const res = await api.post(
          `v1/tradeteam/add/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
          dataToSend
        );

        const { sucess } = res.data;

        if (sucess) {
          alerta('Equipe salva com sucesso!', 1);
          this.props.history.push('/TradesMktTeam');
        }
      } catch (err) {
        alerta(err.response?.data?.error, 2);
      }
    }
  };

  handleSavePromoter = () => {
    let {
      promoters,
      promotorSelected,
      descriptionPromoter,
      startJourneyPromoter,
      endJourneyPromoter,
      startPausePromoter,
      endPausePromoter,
      startSecondPausePromoter,
      endSecondPausePromoter,
      forceFirstStopPromoter,
      forceSecondStopPromoter,
      GEP_RAIO_ABERTURA,
      GEP_ID,
      edit,
      GEP_INICIO_JORNADA_PROMOTOR_SA,
      GEP_FIM_JORNADA_PROMOTOR_SA,
      GEP_INICIO_PARADA1_PROMOTOR_SA,
      GEP_FIM_PARADA1_PROMOTOR_SA,
      GEP_PARADA1_PROMOTOR_FORCAR_SA,
      selectedSeller,
    } = this.state;

    if (GEP_ID) {
      const pos = promoters.findIndex((item) => item.GEP_ID === GEP_ID);
      promoters[pos] = {
        GEP_ESTR_ID: selectedSeller,
        GEP_COD_PROMOTOR: promotorSelected,
        GEP_DESCR_PROMOTOR: descriptionPromoter,
        GEP_INICIO_JORNADA_PROMOTOR: startJourneyPromoter ? startJourneyPromoter : null,
        GEP_FIM_JORNADA_PROMOTOR: endJourneyPromoter ? endJourneyPromoter : null,
        GEP_INICIO_PARADA1_PROMOTOR: startPausePromoter ? startPausePromoter : null,
        GEP_FIM_PARADA1_PROMOTOR: endPausePromoter ? endPausePromoter : null,
        GEP_INICIO_PARADA2_PROMOTOR: startSecondPausePromoter ? startSecondPausePromoter : null,
        GEP_FIM_PARADA2_PROMOTOR: endSecondPausePromoter ? endSecondPausePromoter : null,
        GEP_PARADA1_PROMOTOR_FORCAR: forceFirstStopPromoter,
        GEP_PARADA2_PROMOTOR_FORCAR: forceSecondStopPromoter,
        GEP_RAIO_ABERTURA,
        GEP_ID,
        GEP_INICIO_JORNADA_PROMOTOR_SA,
        GEP_FIM_JORNADA_PROMOTOR_SA,
        GEP_INICIO_PARADA1_PROMOTOR_SA,
        GEP_FIM_PARADA1_PROMOTOR_SA,
        GEP_PARADA1_PROMOTOR_FORCAR_SA,
      };
    } else if (edit === true) {
      const pos = promoters.findIndex((item) => item.GEP_COD_PROMOTOR === edit);
      promoters[pos] = {
        GEP_ESTR_ID: selectedSeller,
        GEP_COD_PROMOTOR: promotorSelected,
        GEP_DESCR_PROMOTOR: descriptionPromoter,
        GEP_INICIO_JORNADA_PROMOTOR: startJourneyPromoter ? startJourneyPromoter : null,
        GEP_FIM_JORNADA_PROMOTOR: endJourneyPromoter ? endJourneyPromoter : null,
        GEP_INICIO_PARADA1_PROMOTOR: startPausePromoter ? startPausePromoter : null,
        GEP_FIM_PARADA1_PROMOTOR: endPausePromoter ? endPausePromoter : null,
        GEP_INICIO_PARADA2_PROMOTOR: startSecondPausePromoter ? startSecondPausePromoter : null,
        GEP_FIM_PARADA2_PROMOTOR: endSecondPausePromoter ? endSecondPausePromoter : null,
        GEP_PARADA1_PROMOTOR_FORCAR: forceFirstStopPromoter,
        GEP_PARADA2_PROMOTOR_FORCAR: forceSecondStopPromoter,
        GEP_RAIO_ABERTURA,
        GEP_INICIO_JORNADA_PROMOTOR_SA,
        GEP_FIM_JORNADA_PROMOTOR_SA,
        GEP_INICIO_PARADA1_PROMOTOR_SA,
        GEP_FIM_PARADA1_PROMOTOR_SA,
        GEP_PARADA1_PROMOTOR_FORCAR_SA,
      };
    } else {
      promoters.push({
        GEP_ESTR_ID: selectedSeller,
        GEP_COD_PROMOTOR: promotorSelected,
        GEP_DESCR_PROMOTOR: descriptionPromoter,
        GEP_INICIO_JORNADA_PROMOTOR: startJourneyPromoter ? startJourneyPromoter : null,
        GEP_FIM_JORNADA_PROMOTOR: endJourneyPromoter ? endJourneyPromoter : null,
        GEP_INICIO_PARADA1_PROMOTOR: startPausePromoter ? startPausePromoter : null,
        GEP_FIM_PARADA1_PROMOTOR: endPausePromoter ? endPausePromoter : null,
        GEP_INICIO_PARADA2_PROMOTOR: startSecondPausePromoter ? startSecondPausePromoter : null,
        GEP_FIM_PARADA2_PROMOTOR: endSecondPausePromoter ? endSecondPausePromoter : null,
        GEP_PARADA1_PROMOTOR_FORCAR: forceFirstStopPromoter,
        GEP_PARADA2_PROMOTOR_FORCAR: forceSecondStopPromoter,
        GEP_RAIO_ABERTURA,
        GEP_INICIO_JORNADA_PROMOTOR_SA,
        GEP_FIM_JORNADA_PROMOTOR_SA,
        GEP_INICIO_PARADA1_PROMOTOR_SA,
        GEP_FIM_PARADA1_PROMOTOR_SA,
        GEP_PARADA1_PROMOTOR_FORCAR_SA,
      });
    }

    this.setState({
      promoters,
      displayForm: false,
      promotorSelected: null,
      startJourneyPromoter: null,
      endJourneyPromoter: null,
      startPausePromoter: null,
      endPausePromoter: null,
      startSecondPausePromoter: null,
      endSecondPausePromoter: null,
      forceFirstStopPromoter: 0,
      forceSecondStopPromoter: 0,
      GEP_RAIO_ABERTURA: 0,
      GEP_ID: null,
      GEP_INICIO_JORNADA_PROMOTOR_SA: null,
      GEP_FIM_JORNADA_PROMOTOR_SA: null,
      GEP_INICIO_PARADA1_PROMOTOR_SA: null,
      GEP_FIM_PARADA1_PROMOTOR_SA: null,
      GEP_PARADA1_PROMOTOR_FORCAR_SA: 0,
      edit: false,
    });
  };

  handleEditPromoter = (item) => {
    this.setState({
      promotorSelected: item.GEP_COD_PROMOTOR,
      descriptionPromoter: item.GEP_DESCR_PROMOTOR,
      startJourneyPromoter: item.GEP_INICIO_JORNADA_PROMOTOR,
      endJourneyPromoter: item.GEP_FIM_JORNADA_PROMOTOR,
      startPausePromoter: item.GEP_INICIO_PARADA1_PROMOTOR,
      endPausePromoter: item.GEP_FIM_PARADA1_PROMOTOR,
      startSecondPausePromoter: item.GEP_INICIO_PARADA2_PROMOTOR,
      endSecondPausePromoter: item.GEP_FIM_PARADA2_PROMOTOR,
      forceFirstStopPromoter: item.GEP_PARADA1_PROMOTOR_FORCAR,
      forceSecondStopPromoter: item.GEP_PARADA2_PROMOTOR_FORCAR,
      GEP_RAIO_ABERTURA: item.GEP_RAIO_ABERTURA,
      GEP_ID: item.GEP_ID,
      edit: item.GEP_COD_PROMOTOR,
      GEP_INICIO_JORNADA_PROMOTOR_SA: item.GEP_INICIO_JORNADA_PROMOTOR_SA,
      GEP_FIM_JORNADA_PROMOTOR_SA: item.GEP_FIM_JORNADA_PROMOTOR_SA,
      GEP_INICIO_PARADA1_PROMOTOR_SA: item.GEP_INICIO_PARADA1_PROMOTOR_SA,
      GEP_FIM_PARADA1_PROMOTOR_SA: item.GEP_FIM_PARADA1_PROMOTOR_SA,
      GEP_PARADA1_PROMOTOR_FORCAR_SA: item.GEP_PARADA1_PROMOTOR_FORCAR_SA,
      displayForm: true,
      selectedSeller: item.GEP_ESTR_ID,
    });
  };

  handleResetPromoter = () => {
    let { displayForm } = this.state;
    this.setState({
      promotorSelected: null,
      startJourneyPromoter: null,
      endJourneyPromoter: null,
      startPausePromoter: null,
      endPausePromoter: null,
      startSecondPausePromoter: null,
      endSecondPausePromoter: null,
      forceFirstStopPromoter: 0,
      forceSecondStopPromoter: 0,
      GEP_RAIO_ABERTURA: 0,
      GEP_ID: null,
      edit: false,
      GEP_INICIO_JORNADA_PROMOTOR_SA: null,
      GEP_FIM_JORNADA_PROMOTOR_SA: null,
      GEP_INICIO_PARADA1_PROMOTOR_SA: null,
      GEP_FIM_PARADA1_PROMOTOR_SA: null,
      GEP_PARADA1_PROMOTOR_FORCAR_SA: 0,
      displayForm: !displayForm,
    });
  };

  handleDeletePromoter = (element) => {
    let { promoters } = this.state;

    promoters = promoters.filter((item) => item.GEP_COD_PROMOTOR !== element.GEP_COD_PROMOTOR);

    this.setState({
      promoters,
    });
  };

  schema = Yup.object().shape({
    managerSelected: Yup.string().nullable(),
    supervisorSelected: Yup.string().nullable(),
    promotorSelected: Yup.string().nullable().required('Campo obrigatório'),
  });

  render() {
    const {
      loading,
      errors,
      id,
      nameTeam,
      promoters,

      startJourneySupervision,
      endJourneySupervision,
      startSecondPauseSupervision,
      endSecondPauseSupervision,
      startPauseSupervision,
      endPauseSupervision,

      startJourneyPromoter,
      endJourneyPromoter,
      startPausePromoter,
      endPausePromoter,
      startSecondPausePromoter,
      endSecondPausePromoter,

      startJourneyManager,
      endJourneyManager,
      startPauseManager,
      endPauseManager,
      startSecondPauseManager,
      endSecondPauseManager,

      forceFirstStopManager,
      forceSecondStopManager,
      forceFirstStopSupervision,
      forceSecondStopSupervision,
      forceFirstStopPromoter,
      forceSecondStopPromoter,
      supervisorSelected,
      promotorSelected,
      managerSelected,
      descriptionManager,
      descriptionSupervisor,
      selectSupervisor,
      selectManager,
      selectPromoter,
      displayForm,
      GEP_RAIO_ABERTURA,
      GET_RAIO_ABERTURA_GERENTE,
      GET_RAIO_ABERTURA_SUPERVISOR,
      edit,
      GEP_INICIO_JORNADA_PROMOTOR_SA,
      GEP_FIM_JORNADA_PROMOTOR_SA,
      GEP_INICIO_PARADA1_PROMOTOR_SA,
      GEP_FIM_PARADA1_PROMOTOR_SA,
      GEP_PARADA1_PROMOTOR_FORCAR_SA,

      GET_INICIO_JORNADA_GERENTE_SA,
      GET_FIM_JORNADA_GERENTE_SA,
      GET_INICIO_PARADA1_GERENTE_SA,
      GET_FIM_PARADA1_GERENTE_SA,
      GET_PARADA1_GERENTE_FORCAR_SA,
      GET_INICIO_JORNADA_SUP_SA,
      GET_FIM_JORNADA_SUP_SA,
      GET_INICIO_PARADA1_SUP_SA,
      GET_FIM_PARADA1_SUP_SA,
      GET_PARADA1_SUP_FORCAR_SA,
      sellersList,
      selectedSeller,
    } = this.state;

    return (
      <>
        <Header />
        <WaitScreen loading={loading} />
        <Container>
          <DirectTituloJanela
            urlVoltar={'/TradesMktTeam'}
            titulo={
              loading ? (
                'Aguarde...'
              ) : (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon>poll</Icon>Equipe {id && `${id} ${nameTeam ? ' / ' + nameTeam.toUpperCase() : ' / Sem nome'}`}
                </span>
              )
            }
          />
          {id && (
            <TitleTeam>
              <h1>
                Equipe - {id} {nameTeam ? ' / ' + nameTeam.toUpperCase() : ' / Sem nome'}
              </h1>
            </TitleTeam>
          )}
          <div style={{ marginTop: '0.8rem' }}>
            <Linha style={{ padding: '0 0 0 0.5rem' }}>
              <SubTitulo>
                <Icon className="groups">groups</Icon>Nome da equipe
              </SubTitulo>
              <input
                type="text"
                value={nameTeam ? nameTeam : ''}
                onChange={(event) => this.setState({ nameTeam: event.target.value })}
              />
            </Linha>
            <Linha wrap={'true'}>
              <Collapsible
                accordion={false}
                className="collapsible-top"
                style={{
                  width: '50%',
                  borderStyle: 'none',
                  boxShadow: 'none',
                }}
              >
                <SubTitulo>
                  <Icon>person</Icon>GERENTE
                </SubTitulo>
                <CollapsibleItem
                  className="collapsibleQuestionManagerItem"
                  expanded={false}
                  header={
                    managerSelected ? (
                      <span style={{ paddingLeft: '0.5rem' }}>GERENTE - {descriptionManager.toUpperCase()}</span>
                    ) : (
                      <span style={{ paddingLeft: '0.5rem' }}>GERENTE</span>
                    )
                  }
                  node="div"
                  icon={
                    <>
                      <p className="material-icons plus">add_circle_outline</p>

                      <p className="material-icons minus">remove_circle_outline</p>
                    </>
                  }
                >
                  <div>
                    <Linha style={{ marginTop: '0.4rem' }}>
                      <Labels>Selecione um gerente</Labels>
                      <SelectQuery
                        inputName="selectManager"
                        loading={false}
                        itemSelected={managerSelected}
                        colorPrimary
                        query={selectManager}
                        keys={['name', 'manager']}
                        label="label"
                        onSelect={(item) => {
                          this.handleSelectManager(item);
                        }}
                        onDelete={() => {
                          this.handleSelectManager(null);
                        }}
                      />
                      <div>
                        <Labels>Raio de abertura (metros)</Labels>
                        <input
                          type="number"
                          value={GET_RAIO_ABERTURA_GERENTE ? GET_RAIO_ABERTURA_GERENTE : ' '}
                          onChange={(event) => this.setState({ GET_RAIO_ABERTURA_GERENTE: event.target.value })}
                        />
                      </div>
                    </Linha>

                    <Linha>
                      <SubTituloDestaque>
                        <Icon>label</Icon>Jornada de trabalho (segunda à sexta)
                      </SubTituloDestaque>
                    </Linha>

                    <Linha>
                      <DivDetalhe flex="1">
                        <Labels>Inicio</Labels>
                        <ReactInputMask
                          className="timeMask"
                          mask="99:99"
                          value={startJourneyManager || ' '}
                          maskChar={null}
                          onChange={(ev) => {
                            const value = ev.target.value;
                            this.setState(
                              {
                                startJourneyManager: value ? value + ':00' : '',
                              },
                              () => this.handleValidationUnicField('startJourneyManager', 'errors')
                            );
                          }}
                        />
                        {errors && errors?.startJourneyManager && (
                          <span style={{ color: '#FF0000' }}>{errors.startJourneyManager}</span>
                        )}
                      </DivDetalhe>
                      <DivDetalhe flex="1">
                        <Labels>Fim</Labels>
                        <ReactInputMask
                          className="timeMask"
                          mask="99:99"
                          value={endJourneyManager || ' '}
                          maskChar={null}
                          onChange={(ev) => {
                            const value = ev.target.value;
                            this.setState(
                              {
                                endJourneyManager: value ? value + ':00' : '',
                              },
                              () => this.handleValidationUnicField('endJourneyManager', 'errors')
                            );
                          }}
                        />
                        {errors && errors?.endJourneyManager && (
                          <span style={{ color: '#FF0000' }}>{errors.endJourneyManager}</span>
                        )}
                      </DivDetalhe>
                    </Linha>

                    <Linha>
                      <SubTitulo>Interrupções I</SubTitulo>
                    </Linha>

                    <Linha>
                      <DivDetalhe flex="1">
                        <Labels>Inicio</Labels>
                        <ReactInputMask
                          className="timeMask"
                          mask="99:99"
                          value={startPauseManager || ' '}
                          maskChar={null}
                          onChange={(ev) => {
                            const value = ev.target.value;
                            this.setState(
                              {
                                startPauseManager: value ? value + ':00' : '',
                              },
                              () => this.handleValidationUnicField('startPauseManager', 'errors')
                            );
                          }}
                        />
                        {errors && errors?.startPauseManager && (
                          <span style={{ color: '#FF0000' }}>{errors.startPauseManager}</span>
                        )}
                      </DivDetalhe>
                      <DivDetalhe flex="1">
                        <Labels>Fim</Labels>
                        <ReactInputMask
                          className="timeMask"
                          mask="99:99"
                          value={endPauseManager || ' '}
                          maskChar={null}
                          onChange={(ev) => {
                            const value = ev.target.value;
                            this.setState(
                              {
                                endPauseManager: value ? value + ':00' : '',
                              },
                              () => this.handleValidationUnicField('endPauseManager', 'errors')
                            );
                          }}
                        />
                        {errors && errors?.endPauseManager && (
                          <span style={{ color: '#FF0000' }}>{errors.endPauseManager}</span>
                        )}
                      </DivDetalhe>

                      <DivDetalhe withOutMinWidth>
                        <Labels>Forçar parada</Labels>
                        <label>
                          <input
                            type="checkbox"
                            checked={forceFirstStopManager}
                            onChange={() =>
                              this.setState({
                                forceFirstStopManager: forceFirstStopManager === 0 ? 1 : 0,
                              })
                            }
                          />
                          <span>Forçar parada</span>
                        </label>
                      </DivDetalhe>
                    </Linha>

                    <Linha>
                      <SubTitulo>Interrupções II</SubTitulo>
                    </Linha>

                    <Linha>
                      <DivDetalhe flex="1">
                        <Labels>Inicio</Labels>
                        <ReactInputMask
                          className="timeMask"
                          mask="99:99"
                          value={startSecondPauseManager || ' '}
                          maskChar={null}
                          onChange={(ev) => {
                            const value = ev.target.value;
                            this.setState(
                              {
                                startSecondPauseManager: value ? value + ':00' : '',
                              },
                              () => this.handleValidationUnicField('startSecondPauseManager', 'errors')
                            );
                          }}
                        />
                        {errors && errors?.startSecondPauseManager && (
                          <span style={{ color: '#FF0000' }}>{errors.startSecondPauseManager}</span>
                        )}
                      </DivDetalhe>
                      <DivDetalhe flex="1">
                        <Labels>Fim</Labels>
                        <ReactInputMask
                          className="timeMask"
                          mask="99:99"
                          value={endSecondPauseManager || ' '}
                          maskChar={null}
                          onChange={(ev) => {
                            const value = ev.target.value;
                            this.setState(
                              {
                                endSecondPauseManager: value ? value + ':00' : '',
                              },
                              () => this.handleValidationUnicField('Second', 'errors')
                            );
                          }}
                        />
                        {errors && errors?.endSecondPauseManager && (
                          <span style={{ color: '#FF0000' }}>{errors.endSecondPauseManager}</span>
                        )}
                      </DivDetalhe>

                      <DivDetalhe withOutMinWidth>
                        <Labels>Forçar parada</Labels>
                        <label>
                          <input
                            type="checkbox"
                            checked={forceSecondStopManager}
                            onChange={() =>
                              this.setState({
                                forceSecondStopManager: forceSecondStopManager === 0 ? 1 : 0,
                              })
                            }
                          />
                          <span>Forçar parada</span>
                        </label>
                      </DivDetalhe>
                    </Linha>

                    <Linha>
                      <SubTituloDestaque>
                        <Icon>label</Icon>Jornada de trabalho (sábado)
                      </SubTituloDestaque>
                    </Linha>

                    <Linha>
                      <DivDetalhe flex="1">
                        <Labels>Inicio</Labels>
                        <ReactInputMask
                          className="timeMask"
                          mask="99:99"
                          value={GET_INICIO_JORNADA_GERENTE_SA || ' '}
                          maskChar={null}
                          onChange={(ev) => {
                            const value = ev.target.value;
                            this.setState(
                              {
                                GET_INICIO_JORNADA_GERENTE_SA: value ? value + ':00' : '',
                              },
                              () => this.handleValidationUnicField('GET_INICIO_JORNADA_GERENTE_SA', 'errors')
                            );
                          }}
                        />
                        {errors && errors?.GET_INICIO_JORNADA_GERENTE_SA && (
                          <span style={{ color: '#FF0000' }}>{errors.GET_INICIO_JORNADA_GERENTE_SA}</span>
                        )}
                      </DivDetalhe>
                      <DivDetalhe flex="1">
                        <Labels>Fim</Labels>
                        <ReactInputMask
                          className="timeMask"
                          mask="99:99"
                          value={GET_FIM_JORNADA_GERENTE_SA || ' '}
                          maskChar={null}
                          onChange={(ev) => {
                            const value = ev.target.value;
                            this.setState(
                              {
                                GET_FIM_JORNADA_GERENTE_SA: value ? value + ':00' : '',
                              },
                              () => this.handleValidationUnicField('GET_FIM_JORNADA_GERENTE_SA', 'errors')
                            );
                          }}
                        />
                        {errors && errors?.GET_FIM_JORNADA_GERENTE_SA && (
                          <span style={{ color: '#FF0000' }}>{errors.GET_FIM_JORNADA_GERENTE_SA}</span>
                        )}
                      </DivDetalhe>
                    </Linha>

                    <Linha>
                      <SubTitulo>Interrupção no sábado</SubTitulo>
                    </Linha>

                    <Linha>
                      <DivDetalhe flex="1">
                        <Labels>Inicio</Labels>
                        <ReactInputMask
                          className="timeMask"
                          mask="99:99"
                          value={GET_INICIO_PARADA1_GERENTE_SA || ' '}
                          maskChar={null}
                          onChange={(ev) => {
                            const value = ev.target.value;
                            this.setState(
                              {
                                GET_INICIO_PARADA1_GERENTE_SA: value ? value + ':00' : '',
                              },
                              () => this.handleValidationUnicField('GET_INICIO_PARADA1_GERENTE_SA', 'errors')
                            );
                          }}
                        />
                        {errors && errors?.GET_INICIO_PARADA1_GERENTE_SA && (
                          <span style={{ color: '#FF0000' }}>{errors.GET_INICIO_PARADA1_GERENTE_SA}</span>
                        )}
                      </DivDetalhe>
                      <DivDetalhe flex="1">
                        <Labels>Fim</Labels>
                        <ReactInputMask
                          className="timeMask"
                          mask="99:99"
                          value={GET_FIM_PARADA1_GERENTE_SA || ' '}
                          maskChar={null}
                          onChange={(ev) => {
                            const value = ev.target.value;
                            this.setState(
                              {
                                GET_FIM_PARADA1_GERENTE_SA: value ? value + ':00' : '',
                              },
                              () => this.handleValidationUnicField('GET_FIM_PARADA1_GERENTE_SA', 'errors')
                            );
                          }}
                        />
                        {errors && errors?.GET_FIM_PARADA1_GERENTE_SA && (
                          <span style={{ color: '#FF0000' }}>{errors.GET_FIM_PARADA1_GERENTE_SA}</span>
                        )}
                      </DivDetalhe>

                      <DivDetalhe withOutMinWidth>
                        <Labels>Forçar parada</Labels>
                        <label>
                          <input
                            type="checkbox"
                            checked={GET_PARADA1_GERENTE_FORCAR_SA}
                            onChange={() =>
                              this.setState({
                                GET_PARADA1_GERENTE_FORCAR_SA: GET_PARADA1_GERENTE_FORCAR_SA === 0 ? 1 : 0,
                              })
                            }
                          />
                          <span>Forçar parada</span>
                        </label>
                      </DivDetalhe>
                    </Linha>
                  </div>
                </CollapsibleItem>
              </Collapsible>

              <Collapsible
                accordion={false}
                className="collapsible-top"
                style={{
                  width: '50%',
                  borderStyle: 'none',
                  boxShadow: 'none',
                }}
              >
                <SubTitulo>
                  <Icon>person</Icon>SUPERVISOR
                </SubTitulo>
                <CollapsibleItem
                  className="collapsibleQuestionManagerItem"
                  expanded={false}
                  header={
                    supervisorSelected ? (
                      <span style={{ paddingLeft: '0.5rem' }}>SUPERVISOR - {descriptionSupervisor.toUpperCase()}</span>
                    ) : (
                      <span style={{ paddingLeft: '0.5rem' }}>SUPERVISOR</span>
                    )
                  }
                  node="div"
                  icon={
                    <>
                      <p className="material-icons plus">add_circle_outline</p>

                      <p className="material-icons minus">remove_circle_outline</p>
                    </>
                  }
                >
                  <div>
                    <Linha style={{ marginTop: '0.4rem' }}>
                      <Labels>Selecione um supervisor</Labels>
                      <SelectQuery
                        inputName="selectSupervisor"
                        itemSelected={supervisorSelected}
                        colorPrimary
                        query={selectSupervisor}
                        keys={['name', 'supervisor']}
                        label="label"
                        onSelect={this.handleSelectSupervisor}
                        onDelete={this.handleSelectSupervisor}
                      />
                      <div>
                        <Labels>Raio de abertura (metros)</Labels>
                        <input
                          type="number"
                          value={GET_RAIO_ABERTURA_SUPERVISOR ? GET_RAIO_ABERTURA_SUPERVISOR : ' '}
                          onChange={(event) => this.setState({ GET_RAIO_ABERTURA_SUPERVISOR: event.target.value })}
                        />
                      </div>
                    </Linha>
                    <Linha>
                      <SubTituloDestaque>
                        <Icon>label</Icon>Jornada de trabalho (segunda à sexta)
                      </SubTituloDestaque>
                    </Linha>

                    <Linha>
                      <DivDetalhe flex="1">
                        <Labels>Inicio</Labels>
                        <ReactInputMask
                          className="timeMask"
                          mask="99:99"
                          value={startJourneySupervision || ' '}
                          maskChar={null}
                          onChange={(ev) => {
                            const value = ev.target.value;
                            this.setState(
                              {
                                startJourneySupervision: value ? value + ':00' : '',
                              },
                              () => this.handleValidationUnicField('startJourneySupervision', 'errors')
                            );
                          }}
                        />
                        {errors && errors?.startJourneySupervision && (
                          <span style={{ color: '#FF0000' }}>{errors.startJourneySupervision}</span>
                        )}
                      </DivDetalhe>
                      <DivDetalhe flex="1">
                        <Labels>Fim</Labels>
                        <ReactInputMask
                          className="timeMask"
                          mask="99:99"
                          value={endJourneySupervision || ' '}
                          maskChar={null}
                          onChange={(ev) => {
                            const value = ev.target.value;
                            this.setState(
                              {
                                endJourneySupervision: value ? value + ':00' : '',
                              },
                              () => this.handleValidationUnicField('endJourneySupervision', 'errors')
                            );
                          }}
                        />
                        {errors && errors?.endJourneySupervision && (
                          <span style={{ color: '#FF0000' }}>{errors.endJourneySupervision}</span>
                        )}
                      </DivDetalhe>
                    </Linha>

                    <Linha>
                      <SubTitulo>Interrupções I</SubTitulo>
                    </Linha>

                    <Linha>
                      <DivDetalhe flex="1">
                        <Labels>Inicio</Labels>
                        <ReactInputMask
                          className="timeMask"
                          mask="99:99"
                          value={startPauseSupervision || ' '}
                          maskChar={null}
                          onChange={(ev) => {
                            const value = ev.target.value;
                            this.setState(
                              {
                                startPauseSupervision: value ? value + ':00' : '',
                              },
                              () => this.handleValidationUnicField('startPauseSupervision', 'errors')
                            );
                          }}
                        />
                        {errors && errors?.startPauseSupervision && (
                          <span style={{ color: '#FF0000' }}>{errors.startPauseSupervision}</span>
                        )}
                      </DivDetalhe>
                      <DivDetalhe flex="1">
                        <Labels>Fim</Labels>
                        <ReactInputMask
                          className="timeMask"
                          mask="99:99"
                          value={endPauseSupervision || ''}
                          maskChar={null}
                          onChange={(ev) => {
                            const value = ev.target.value;
                            this.setState(
                              {
                                endPauseSupervision: value ? value + ':00' : '',
                              },
                              () => this.handleValidationUnicField('endPauseSupervision', 'errors')
                            );
                          }}
                        />
                        {errors && errors?.endPauseSupervision && (
                          <span style={{ color: '#FF0000' }}>{errors.endPauseSupervision}</span>
                        )}
                      </DivDetalhe>

                      <DivDetalhe withOutMinWidth>
                        <Labels>Forçar parada</Labels>
                        <label>
                          <input
                            type="checkbox"
                            checked={forceFirstStopSupervision}
                            onChange={() =>
                              this.setState({
                                forceFirstStopSupervision: forceFirstStopSupervision === 0 ? 1 : 0,
                              })
                            }
                          />
                          <span>Forçar parada</span>
                        </label>
                      </DivDetalhe>
                    </Linha>

                    <Linha>
                      <SubTitulo>Interrupções II</SubTitulo>
                    </Linha>

                    <Linha>
                      <DivDetalhe flex="1">
                        <Labels>Inicio</Labels>
                        <ReactInputMask
                          className="timeMask"
                          mask="99:99"
                          value={startSecondPauseSupervision || ' '}
                          maskChar={null}
                          onChange={(ev) => {
                            const value = ev.target.value;
                            this.setState(
                              {
                                startSecondPauseSupervision: value ? value + ':00' : '',
                              },
                              () => this.handleValidationUnicField('startSecondPauseSupervision', 'errors')
                            );
                          }}
                        />
                        {errors && errors?.startSecondPauseSupervision && (
                          <span style={{ color: '#FF0000' }}>{errors.startSecondPauseSupervision}</span>
                        )}
                      </DivDetalhe>
                      <DivDetalhe flex="1">
                        <Labels>Fim</Labels>
                        <ReactInputMask
                          className="timeMask"
                          mask="99:99"
                          value={endSecondPauseSupervision || ' '}
                          maskChar={null}
                          onChange={(ev) => {
                            const value = ev.target.value;
                            this.setState(
                              {
                                endSecondPauseSupervision: value ? value + ':00' : '',
                              },
                              () => this.handleValidationUnicField('Second', 'errors')
                            );
                          }}
                        />
                        {errors && errors?.Second && <span style={{ color: '#FF0000' }}>{errors.Second}</span>}
                      </DivDetalhe>
                      <DivDetalhe withOutMinWidth>
                        <Labels>Forçar parada</Labels>
                        <label>
                          <input
                            type="checkbox"
                            checked={forceSecondStopSupervision}
                            onChange={() =>
                              this.setState({
                                forceSecondStopSupervision: forceSecondStopSupervision === 0 ? 1 : 0,
                              })
                            }
                          />
                          <span>Forçar parada</span>
                        </label>
                      </DivDetalhe>
                    </Linha>

                    <Linha>
                      <SubTituloDestaque>
                        <Icon>label</Icon>Jornada de trabalho no sábado
                      </SubTituloDestaque>
                    </Linha>

                    <Linha>
                      <DivDetalhe flex="1">
                        <Labels>Inicio</Labels>
                        <ReactInputMask
                          className="timeMask"
                          mask="99:99"
                          value={GET_INICIO_JORNADA_SUP_SA || ' '}
                          maskChar={null}
                          onChange={(ev) => {
                            const value = ev.target.value;
                            this.setState(
                              {
                                GET_INICIO_JORNADA_SUP_SA: value ? value + ':00' : '',
                              },
                              () => this.handleValidationUnicField('GET_INICIO_JORNADA_SUP_SA', 'errors')
                            );
                          }}
                        />
                        {errors && errors?.GET_INICIO_JORNADA_SUP_SA && (
                          <span style={{ color: '#FF0000' }}>{errors.GET_INICIO_JORNADA_SUP_SA}</span>
                        )}
                      </DivDetalhe>
                      <DivDetalhe flex="1">
                        <Labels>Fim</Labels>
                        <ReactInputMask
                          className="timeMask"
                          mask="99:99"
                          value={GET_FIM_JORNADA_SUP_SA || ' '}
                          maskChar={null}
                          onChange={(ev) => {
                            const value = ev.target.value;
                            this.setState(
                              {
                                GET_FIM_JORNADA_SUP_SA: value ? value + ':00' : '',
                              },
                              () => this.handleValidationUnicField('GET_FIM_JORNADA_SUP_SA', 'errors')
                            );
                          }}
                        />
                        {errors && errors?.GET_FIM_JORNADA_SUP_SA && (
                          <span style={{ color: '#FF0000' }}>{errors.GET_FIM_JORNADA_SUP_SA}</span>
                        )}
                      </DivDetalhe>
                    </Linha>

                    <Linha>
                      <SubTitulo>Interrupção no sábado</SubTitulo>
                    </Linha>

                    <Linha>
                      <DivDetalhe flex="1">
                        <Labels>Inicio</Labels>
                        <ReactInputMask
                          className="timeMask"
                          mask="99:99"
                          value={GET_INICIO_PARADA1_SUP_SA || ' '}
                          maskChar={null}
                          onChange={(ev) => {
                            const value = ev.target.value;
                            this.setState(
                              {
                                GET_INICIO_PARADA1_SUP_SA: value ? value + ':00' : '',
                              },
                              () => this.handleValidationUnicField('GET_INICIO_PARADA1_SUP_SA', 'errors')
                            );
                          }}
                        />
                        {errors && errors?.GET_INICIO_PARADA1_SUP_SA && (
                          <span style={{ color: '#FF0000' }}>{errors.GET_INICIO_PARADA1_SUP_SA}</span>
                        )}
                      </DivDetalhe>
                      <DivDetalhe flex="1">
                        <Labels>Fim</Labels>
                        <ReactInputMask
                          className="timeMask"
                          mask="99:99"
                          value={GET_FIM_PARADA1_SUP_SA || ''}
                          maskChar={null}
                          onChange={(ev) => {
                            const value = ev.target.value;
                            this.setState(
                              {
                                GET_FIM_PARADA1_SUP_SA: value ? value + ':00' : '',
                              },
                              () => this.handleValidationUnicField('GET_FIM_PARADA1_SUP_SA', 'errors')
                            );
                          }}
                        />
                        {errors && errors?.GET_FIM_PARADA1_SUP_SA && (
                          <span style={{ color: '#FF0000' }}>{errors.GET_FIM_PARADA1_SUP_SA}</span>
                        )}
                      </DivDetalhe>

                      <DivDetalhe withOutMinWidth>
                        <Labels>Forçar parada</Labels>
                        <label>
                          <input
                            type="checkbox"
                            checked={GET_PARADA1_SUP_FORCAR_SA}
                            onChange={() =>
                              this.setState({
                                GET_PARADA1_SUP_FORCAR_SA: GET_PARADA1_SUP_FORCAR_SA === 0 ? 1 : 0,
                              })
                            }
                          />
                          <span>Forçar parada</span>
                        </label>
                      </DivDetalhe>
                    </Linha>
                  </div>
                </CollapsibleItem>
              </Collapsible>
            </Linha>

            <ContentPromoters>
              <SubTitulo>
                <Icon>person</Icon>PROMOTORES
              </SubTitulo>
              <CreateForm style={{ margin: '0 0 0.5rem 0' }} ref={this.containerHeaderRef}>
                <button onClick={this.handleResetPromoter}>
                  <Icon small>{displayForm ? 'remove' : 'add'}</Icon>
                </button>
                <Form display={displayForm.toString()}>
                  <Linha style={{ marginTop: '0.4rem' }}>
                    <Labels>Promotor</Labels>
                    <SelectQuery
                      inputName="selectPromoter"
                      loading={false}
                      itemSelected={promotorSelected}
                      colorPrimary
                      query={selectPromoter}
                      keys={['name', 'promoter']}
                      label="label"
                      onSelect={this.handleSelectPromotor}
                      onDelete={this.handleSelectPromotor}
                    />
                  </Linha>
                  <Linha style={{ marginTop: '0.4rem' }}>
                    <Labels>Vendedor</Labels>
                    <SelectQuery
                      inputName="selectSeller"
                      loading={false}
                      itemSelected={selectedSeller}
                      colorPrimary
                      query={sellersList}
                      keys={['ESTR_COD_ROTA', 'vendedor']}
                      label="label"
                      onSelect={this.handleSelectSeller}
                      onDelete={this.handleSelectSeller}
                    />
                  </Linha>
                  <Linha>
                    <SubTitulo>
                      <Icon>label</Icon>Jornada de trabalho (segunda à sexta)
                    </SubTitulo>
                  </Linha>

                  <Linha>
                    <DivDetalhe flex="1">
                      <Labels>Inicio</Labels>
                      <ReactInputMask
                        className="timeMask"
                        mask="99:99"
                        value={startJourneyPromoter || ' '}
                        maskChar={null}
                        onChange={(ev) => {
                          const value = ev.target.value;
                          this.setState(
                            {
                              startJourneyPromoter: value ? value + ':00' : '',
                            },
                            () => this.handleValidationUnicField('startJourneyPromoter', 'errors')
                          );
                        }}
                      />
                      {errors && errors?.startJourneyPromoter && (
                        <span style={{ color: '#FF0000' }}>{errors.startJourneyPromoter}</span>
                      )}
                    </DivDetalhe>
                    <DivDetalhe flex="1">
                      <Labels>Fim</Labels>
                      <ReactInputMask
                        className="timeMask"
                        mask="99:99"
                        value={endJourneyPromoter || ' '}
                        maskChar={null}
                        onChange={(ev) => {
                          const value = ev.target.value;
                          this.setState(
                            {
                              endJourneyPromoter: value ? value + ':00' : '',
                            },
                            () => this.handleValidationUnicField('endJourneyPromoter', 'errors')
                          );
                        }}
                      />
                      {errors && errors?.endJourneyPromoter && (
                        <span style={{ color: '#FF0000' }}>{errors.endJourneyPromoter}</span>
                      )}
                    </DivDetalhe>
                    <div>
                      <Labels>Raio de abertura (metros)</Labels>
                      <input
                        type="number"
                        value={GEP_RAIO_ABERTURA ? GEP_RAIO_ABERTURA : ' '}
                        onChange={(event) => this.setState({ GEP_RAIO_ABERTURA: event.target.value })}
                      />
                    </div>
                  </Linha>

                  <Linha>
                    <SubTitulo>Interrupções I</SubTitulo>
                  </Linha>

                  <Linha>
                    <DivDetalhe flex="1">
                      <Labels>Inicio</Labels>
                      <ReactInputMask
                        className="timeMask"
                        mask="99:99"
                        value={startPausePromoter || ' '}
                        maskChar={null}
                        onChange={(ev) => {
                          const value = ev.target.value;
                          this.setState(
                            {
                              startPausePromoter: value ? value + ':00' : '',
                            },
                            () => this.handleValidationUnicField('startPausePromoter', 'errors')
                          );
                        }}
                      />
                      {errors && errors?.startPausePromoter && (
                        <span style={{ color: '#FF0000' }}>{errors.startPausePromoter}</span>
                      )}
                    </DivDetalhe>
                    <DivDetalhe flex="1">
                      <Labels>Fim</Labels>
                      <ReactInputMask
                        className="timeMask"
                        mask="99:99"
                        value={endPausePromoter || ' '}
                        maskChar={null}
                        onChange={(ev) => {
                          const value = ev.target.value;
                          this.setState(
                            {
                              endPausePromoter: value ? value + ':00' : '',
                            },
                            () => this.handleValidationUnicField('endPausePromoter', 'errors')
                          );
                        }}
                      />
                      {errors && errors?.endPausePromoter && (
                        <span style={{ color: '#FF0000' }}>{errors.endPausePromoter}</span>
                      )}
                    </DivDetalhe>
                    <DivDetalhe withOutMinWidth>
                      <Labels>Forçar parada</Labels>
                      <label>
                        <input
                          type="checkbox"
                          checked={forceFirstStopPromoter}
                          onChange={() =>
                            this.setState({
                              forceFirstStopPromoter: forceFirstStopPromoter === 0 ? 1 : 0,
                            })
                          }
                        />
                        <span>Forçar parada</span>
                      </label>
                    </DivDetalhe>
                  </Linha>

                  <Linha>
                    <SubTitulo>Interrupções II</SubTitulo>
                  </Linha>
                  <Linha>
                    <DivDetalhe flex="1">
                      <Labels>Inicio</Labels>
                      <ReactInputMask
                        className="timeMask"
                        mask="99:99"
                        value={startSecondPausePromoter || ' '}
                        maskChar={null}
                        onChange={(ev) => {
                          const value = ev.target.value;
                          this.setState(
                            {
                              startSecondPausePromoter: value ? value + ':00' : '',
                            },
                            () => this.handleValidationUnicField('startSecondPausePromoter', 'errors')
                          );
                        }}
                      />
                      {errors && errors?.startSecondPausePromoter && (
                        <span style={{ color: '#FF0000' }}>{errors.startSecondPausePromoter}</span>
                      )}
                    </DivDetalhe>
                    <DivDetalhe flex="1">
                      <Labels>Fim</Labels>
                      <ReactInputMask
                        className="timeMask"
                        mask="99:99"
                        value={endSecondPausePromoter || ' '}
                        maskChar={null}
                        onChange={(ev) => {
                          const value = ev.target.value;
                          this.setState(
                            {
                              endSecondPausePromoter: value ? value + ':00' : '',
                            },
                            () => this.handleValidationUnicField('endSecondPausePromoter', 'errors')
                          );
                        }}
                      />
                      {errors && errors?.Second && <span style={{ color: '#FF0000' }}>{errors.Second}</span>}
                    </DivDetalhe>
                    <DivDetalhe withOutMinWidth>
                      <Labels>Forçar parada</Labels>
                      <label>
                        <input
                          type="checkbox"
                          checked={forceSecondStopPromoter}
                          onChange={() =>
                            this.setState({
                              forceSecondStopPromoter: forceSecondStopPromoter === 0 ? 1 : 0,
                            })
                          }
                        />
                        <span>Forçar parada</span>
                      </label>
                    </DivDetalhe>
                  </Linha>

                  <Linha>
                    <SubTitulo>
                      <Icon>label</Icon>Jornada de trabalho no sábado
                    </SubTitulo>
                  </Linha>

                  <Linha>
                    <DivDetalhe flex="1">
                      <Labels>Inicio</Labels>
                      <ReactInputMask
                        className="timeMask"
                        mask="99:99"
                        value={GEP_INICIO_JORNADA_PROMOTOR_SA || ' '}
                        maskChar={null}
                        onChange={(ev) => {
                          const value = ev.target.value;
                          this.setState(
                            {
                              GEP_INICIO_JORNADA_PROMOTOR_SA: value ? value + ':00' : '',
                            },
                            () => this.handleValidationUnicField('GEP_INICIO_JORNADA_PROMOTOR_SA', 'errors')
                          );
                        }}
                      />
                      {errors && errors?.GEP_INICIO_JORNADA_PROMOTOR_SA && (
                        <span style={{ color: '#FF0000' }}>{errors.GEP_INICIO_JORNADA_PROMOTOR_SA}</span>
                      )}
                    </DivDetalhe>
                    <DivDetalhe flex="1">
                      <Labels>Fim</Labels>
                      <ReactInputMask
                        className="timeMask"
                        mask="99:99"
                        value={GEP_FIM_JORNADA_PROMOTOR_SA || ' '}
                        maskChar={null}
                        onChange={(ev) => {
                          const value = ev.target.value;
                          this.setState(
                            {
                              GEP_FIM_JORNADA_PROMOTOR_SA: value ? value + ':00' : '',
                            },
                            () => this.handleValidationUnicField('GEP_FIM_JORNADA_PROMOTOR_SA', 'errors')
                          );
                        }}
                      />
                      {errors && errors?.GEP_FIM_JORNADA_PROMOTOR_SA && (
                        <span style={{ color: '#FF0000' }}>{errors.GEP_FIM_JORNADA_PROMOTOR_SA}</span>
                      )}
                    </DivDetalhe>
                  </Linha>

                  <Linha>
                    <SubTitulo>Interrupção no sábado</SubTitulo>
                  </Linha>

                  <Linha>
                    <DivDetalhe flex="1">
                      <Labels>Inicio</Labels>
                      <ReactInputMask
                        className="timeMask"
                        mask="99:99"
                        value={GEP_INICIO_PARADA1_PROMOTOR_SA || ' '}
                        maskChar={null}
                        onChange={(ev) => {
                          const value = ev.target.value;
                          this.setState(
                            {
                              GEP_INICIO_PARADA1_PROMOTOR_SA: value ? value + ':00' : '',
                            },
                            () => this.handleValidationUnicField('GEP_INICIO_PARADA1_PROMOTOR_SA', 'errors')
                          );
                        }}
                      />
                      {errors && errors?.GEP_INICIO_PARADA1_PROMOTOR_SA && (
                        <span style={{ color: '#FF0000' }}>{errors.GEP_INICIO_PARADA1_PROMOTOR_SA}</span>
                      )}
                    </DivDetalhe>
                    <DivDetalhe flex="1">
                      <Labels>Fim</Labels>
                      <ReactInputMask
                        className="timeMask"
                        mask="99:99"
                        value={GEP_FIM_PARADA1_PROMOTOR_SA || ' '}
                        maskChar={null}
                        onChange={(ev) => {
                          const value = ev.target.value;
                          this.setState(
                            {
                              GEP_FIM_PARADA1_PROMOTOR_SA: value ? value + ':00' : '',
                            },
                            () => this.handleValidationUnicField('GEP_FIM_PARADA1_PROMOTOR_SA', 'errors')
                          );
                        }}
                      />
                      {errors && errors?.GEP_FIM_PARADA1_PROMOTOR_SA && (
                        <span style={{ color: '#FF0000' }}>{errors.GEP_FIM_PARADA1_PROMOTOR_SA}</span>
                      )}
                    </DivDetalhe>
                    <DivDetalhe withOutMinWidth>
                      <Labels>Forçar parada</Labels>
                      <label>
                        <input
                          type="checkbox"
                          checked={GEP_PARADA1_PROMOTOR_FORCAR_SA}
                          onChange={() =>
                            this.setState({
                              GEP_PARADA1_PROMOTOR_FORCAR_SA: GEP_PARADA1_PROMOTOR_FORCAR_SA === 0 ? 1 : 0,
                            })
                          }
                        />
                        <span>Forçar parada</span>
                      </label>
                    </DivDetalhe>
                  </Linha>

                  <LinhaRodape>
                    <DivRodape>
                      <button
                        className="waves-effect waves-light saib-button is-primary "
                        onClick={() => {
                          this.handleResetPromoter();
                        }}
                      >
                        <Icon>close</Icon> Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={!promotorSelected ? true : false}
                        className="waves-effect waves-light saib-button is-primary "
                        onClick={() => {
                          this.handleSavePromoter();
                        }}
                      >
                        <Icon>save</Icon> Salvar promotor
                      </button>
                    </DivRodape>
                  </LinhaRodape>
                </Form>
              </CreateForm>

              {promoters.map(
                (element) =>
                  edit !== element.GEP_COD_PROMOTOR && (
                    <Linha key={element.GEP_COD_PROMOTOR} style={{ padding: '0' }}>
                      <Collapsible
                        className="collapsible-promoters"
                        accordion={false}
                        style={{
                          width: '95%',
                          borderStyle: 'none',
                          boxShadow: 'none',
                        }}
                      >
                        <CollapsibleItem
                          className="collapsibleQuestionManagerItem"
                          expanded={false}
                          header={
                            <span
                              style={{ paddingLeft: '0.5rem' }}
                            >{`PROMOTOR - ${element.GEP_DESCR_PROMOTOR.toUpperCase()}`}</span>
                          }
                          node="div"
                          icon={
                            <>
                              <p className="material-icons plus">add_circle_outline</p>

                              <p className="material-icons minus">remove_circle_outline</p>
                            </>
                          }
                        >
                          <div>
                            <Linha>
                              <SubTituloDestaque>
                                <Icon>label</Icon>Jornada de trabalho (segunda à sexta)
                              </SubTituloDestaque>
                            </Linha>

                            <Linha>
                              <DivDetalhe flex="1">
                                <Labels>Inicio</Labels>
                                <ReactInputMask
                                  className="timeMask"
                                  mask="99:99"
                                  value={element.GEP_INICIO_JORNADA_PROMOTOR || ' '}
                                  maskChar={null}
                                  disabled
                                />
                                {errors && errors?.startJourneyPromoter && (
                                  <span style={{ color: '#FF0000' }}>{errors.startJourneyPromoter}</span>
                                )}
                              </DivDetalhe>
                              <DivDetalhe flex="1">
                                <Labels>Fim</Labels>
                                <ReactInputMask
                                  className="timeMask"
                                  mask="99:99"
                                  value={element.GEP_FIM_JORNADA_PROMOTOR || ' '}
                                  maskChar={null}
                                  disabled
                                />
                                {errors && errors?.endJourneyPromoter && (
                                  <span style={{ color: '#FF0000' }}>{errors.endJourneyPromoter}</span>
                                )}
                              </DivDetalhe>
                              <Linha>
                                <Labels>Vendedor</Labels>
                                <input
                                  type="text"
                                  value={`${element.ESTR_COD_ROTA} - ${element.ESTR_DESCR_ROTA}`}
                                  disabled
                                />
                              </Linha>
                              <div>
                                <Labels>Raio de abertura (metros)</Labels>
                                <input
                                  type="number"
                                  value={element.GEP_RAIO_ABERTURA ? element.GEP_RAIO_ABERTURA : ' '}
                                  disabled
                                />
                              </div>
                            </Linha>

                            <Linha>
                              <SubTitulo>Interrupções I</SubTitulo>
                            </Linha>

                            <Linha>
                              <DivDetalhe flex="1">
                                <Labels>Inicio</Labels>
                                <ReactInputMask
                                  className="timeMask"
                                  mask="99:99"
                                  value={element.GEP_INICIO_PARADA1_PROMOTOR || ' '}
                                  maskChar={null}
                                  disabled
                                />
                                {errors && errors?.startPausePromoter && (
                                  <span style={{ color: '#FF0000' }}>{errors.startPausePromoter}</span>
                                )}
                              </DivDetalhe>
                              <DivDetalhe flex="1">
                                <Labels>Fim</Labels>
                                <ReactInputMask
                                  className="timeMask"
                                  mask="99:99"
                                  value={element.GEP_FIM_PARADA1_PROMOTOR || ' '}
                                  maskChar={null}
                                  disabled
                                />
                                {errors && errors?.endPausePromoter && (
                                  <span style={{ color: '#FF0000' }}>{errors.endPausePromoter}</span>
                                )}
                              </DivDetalhe>
                              <DivDetalhe withOutMinWidth>
                                <Labels>Forçar parada</Labels>
                                {element.GEP_PARADA1_PROMOTOR_FORCAR ? <span>Sim</span> : <span>Não</span>}
                              </DivDetalhe>
                            </Linha>

                            <Linha>
                              <SubTitulo>Interrupções II</SubTitulo>
                            </Linha>

                            <Linha>
                              <DivDetalhe flex="1">
                                <Labels>Inicio</Labels>
                                <ReactInputMask
                                  className="timeMask"
                                  mask="99:99"
                                  value={element.GEP_INICIO_PARADA2_PROMOTOR || ' '}
                                  maskChar={null}
                                  disabled
                                />
                                {errors && errors?.startSecondPausePromoter && (
                                  <span style={{ color: '#FF0000' }}>{errors.startSecondPausePromoter}</span>
                                )}
                              </DivDetalhe>
                              <DivDetalhe flex="1">
                                <Labels>Fim</Labels>
                                <ReactInputMask
                                  className="timeMask"
                                  mask="99:99"
                                  value={element.GEP_FIM_PARADA2_PROMOTOR || ' '}
                                  maskChar={null}
                                  disabled
                                />
                                {errors && errors?.Second && <span style={{ color: '#FF0000' }}>{errors.Second}</span>}
                              </DivDetalhe>
                              <DivDetalhe withOutMinWidth>
                                <Labels>Forçar parada</Labels>
                                {element.GEP_PARADA2_PROMOTOR_FORCAR ? <span>Sim</span> : <span>Não</span>}
                              </DivDetalhe>
                            </Linha>

                            <Linha>
                              <SubTituloDestaque>
                                <Icon>label</Icon>Jornada de trabalho (sábado)
                              </SubTituloDestaque>
                            </Linha>

                            <Linha>
                              <DivDetalhe flex="1">
                                <Labels>Inicio</Labels>
                                <ReactInputMask
                                  className="timeMask"
                                  mask="99:99"
                                  value={element.GEP_INICIO_JORNADA_PROMOTOR_SA || ' '}
                                  maskChar={null}
                                  disabled
                                />
                                {errors && errors?.GEP_INICIO_JORNADA_PROMOTOR_SA && (
                                  <span style={{ color: '#FF0000' }}>{errors.GEP_INICIO_JORNADA_PROMOTOR_SA}</span>
                                )}
                              </DivDetalhe>
                              <DivDetalhe flex="1">
                                <Labels>Fim</Labels>
                                <ReactInputMask
                                  className="timeMask"
                                  mask="99:99"
                                  value={element.GEP_FIM_JORNADA_PROMOTOR_SA || ' '}
                                  maskChar={null}
                                  disabled
                                />
                                {errors && errors?.GEP_FIM_JORNADA_PROMOTOR_SA && (
                                  <span style={{ color: '#FF0000' }}>{errors.GEP_FIM_JORNADA_PROMOTOR_SA}</span>
                                )}
                              </DivDetalhe>
                            </Linha>

                            <Linha>
                              <SubTitulo>Interrupção</SubTitulo>
                            </Linha>

                            <Linha>
                              <DivDetalhe flex="1">
                                <Labels>Inicio</Labels>
                                <ReactInputMask
                                  className="timeMask"
                                  mask="99:99"
                                  value={element.GEP_INICIO_PARADA1_PROMOTOR_SA || ' '}
                                  maskChar={null}
                                  disabled
                                />
                                {errors && errors?.GEP_INICIO_PARADA1_PROMOTOR_SA && (
                                  <span style={{ color: '#FF0000' }}>{errors.GEP_INICIO_PARADA1_PROMOTOR_SA}</span>
                                )}
                              </DivDetalhe>
                              <DivDetalhe flex="1">
                                <Labels>Fim</Labels>
                                <ReactInputMask
                                  className="timeMask"
                                  mask="99:99"
                                  value={element.GEP_FIM_PARADA1_PROMOTOR_SA || ' '}
                                  maskChar={null}
                                  disabled
                                />
                                {errors && errors?.GEP_FIM_PARADA1_PROMOTOR_SA && (
                                  <span style={{ color: '#FF0000' }}>{errors.GEP_FIM_PARADA1_PROMOTOR_SA}</span>
                                )}
                              </DivDetalhe>
                              <DivDetalhe withOutMinWidth>
                                <Labels>Forçar parada</Labels>
                                {element.GEP_PARADA1_PROMOTOR_FORCAR_SA ? <span>Sim</span> : <span>Não</span>}
                              </DivDetalhe>
                            </Linha>
                          </div>
                        </CollapsibleItem>
                      </Collapsible>
                      <Icons>
                        <button onClick={() => this.handleEditPromoter(element)}>
                          <Icon>edit</Icon>
                        </button>

                        <button onClick={() => this.handleDeletePromoter(element)}>
                          <Icon>delete</Icon>
                        </button>
                      </Icons>
                    </Linha>
                  )
              )}
            </ContentPromoters>
          </div>
          <LinhaRodape>
            <DivRodape>
              <button
                type="submit"
                disabled={promoters.length === 0 || !supervisorSelected ? true : false}
                className="waves-effect waves-light saib-button is-primary "
                onClick={() => {
                  this.handleSaveTeam();
                }}
              >
                <Icon>save</Icon> Salvar
              </button>
            </DivRodape>
          </LinhaRodape>
        </Container>
      </>
    );
  }
}
