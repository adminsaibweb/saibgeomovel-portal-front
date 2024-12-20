import React, { Component } from 'react';
import {
  Container,
  Linha,
  DivDetalhe,
  LinhaKanban,
  Labels,
  ActionsModal,
  ContainerModal,
  DivBaseKanban,
  LinhaContentHeaderKanBan,
  ContentInputFilter,
  LinhaBtnsModal,
} from './style';
import DirectTituloJanela from '../../../Components/Globals/DirectTituloJanela';
import WaitScreen from '../../../Components/Globals/WaitScreen';
import Header from '../../../Components/System/Header';
import SelectQuery from '../../../Components/Globals/SelectQuery';
import { Icon, Collapsible, CollapsibleItem, Modal } from 'react-materialize';
import { getFromStorage } from '../../../services/auth';
import { alerta, tratarErros } from '../../../services/funcoes';
import api from '../../../services/api';
import { Link } from 'react-router-dom';
import './forced.css';

export default class TradesMktTeam extends Component {
  state = {
    loading: false,

    optionCodTeam: '',
    optionCodSupervisor: '',
    optionCodManager: '',
    optionCodPromoter: '',

    selectTeam: undefined,
    selectSupervisor: undefined,
    selectManager: undefined,
    selectPromoter: undefined,

    openModal: false,
  };

  componentDidMount = async () => {
    await this.carregarVariaveisEstado();
    await this.refreshScreen();
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      gupFlagAgenda: sessao.gupFlagAgenda,
    });
  };

  setTeamsPerFilter = () => {
    const { allTradesMkt } = this.state;
    let { selectTeam, selectSupervisor, selectManager, selectPromoter, gupFlagAgenda, usuarioAtivo } = this.state;
    this.setState({
      loading: true,
    });
    let status;
    let response = allTradesMkt?.map((trade) => trade);

    let team = [];
    let supervisor = [];
    let manager = [];
    let promoter = [];

    if (allTradesMkt) {
      allTradesMkt.forEach((element) => {
        if (!team.find((item) => item.team === element.GET_ID.toString())) {
          let itemTeam = {};
          itemTeam.team = element.GET_ID.toString();

          itemTeam.label = `EQUIPE ${element.GET_ID} ${element.GET_NOME ? ' - ' + element.GET_NOME.toUpperCase() : ' / SEM NOME'}`;
          team.push(itemTeam);
        }

        if (!supervisor.find((item) => item.supervisor === element.GET_COD_SUPERVISOR)) {
          let itemSupervisor = {};
          itemSupervisor.supervisor = element.GET_COD_SUPERVISOR;
          itemSupervisor.label = element.GET_DESCR_SUPERVISOR;
          supervisor.push(itemSupervisor);
        }

        if (!manager.find((item) => item.manager === element.GET_COD_GERENTE)) {
          let itemManager = {};
          itemManager.manager = element.GET_COD_GERENTE;
          itemManager.label = element.GET_DESCR_GERENTE;
          manager.push(itemManager);
        }

        element.PROMOTORES.forEach((element) => {
          if (!promoter.find((item) => item.manager === element.GEP_COD_PROMOTOR)) {
            let itemPromoter = {};
            itemPromoter.promoter = element.GEP_COD_PROMOTOR;
            itemPromoter.label = element.GEP_DESCR_PROMOTOR;
          }
        });
      });
    }

    selectTeam = team;
    selectSupervisor = supervisor;
    selectManager = manager;
    selectPromoter = promoter;

    if (status !== undefined) {
      response = allTradesMkt.filter((team) => team.GET_FLG_SITUACAO === status && team);
    }

    this.setState({
      tradesMkt: response,
      loading: false,
      selectTeam,
      selectSupervisor,
      selectManager,
      selectPromoter:
        gupFlagAgenda === 1 ? selectPromoter.filter((prom) => Number(prom.promoter) === usuarioAtivo) : selectPromoter,
    });
  };

  onChangeRadioSituationTeams = () => {
    this.setTeamsPerFilter();
  };

  loadTradesMkt = async () => {
    let { empresaAtiva, selectTeam, selectSupervisor, selectManager } = this.state;
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
          selectTeam,
          selectSupervisor,
          selectManager,
        });
      }
    } catch (err) {
      alerta('Erro ao carregar as equipes', 2);
    } finally {
      this.onChangeRadioSituationTeams();
      this.setState({
        loading: false,
      });
    }
  };

  handleFilterTeam = async (value) => {
    let { optionCodTeam } = this.state;
    optionCodTeam = value ? value.team : '';

    this.setState({
      optionCodTeam,
    });
  };

  handleFilterSupervisor = async (value) => {
    let { optionCodSupervisor } = this.state;
    optionCodSupervisor = value ? value.supervisor : '';

    this.setState({
      optionCodSupervisor,
    });
  };

  handleFilterManager = async (value) => {
    let { optionCodManager } = this.state;
    optionCodManager = value ? value.manager : '';

    this.setState({
      optionCodManager,
    });
  };

  handleFilterPromoter = async (value) => {
    let { optionCodPromoter } = this.state;
    optionCodPromoter = value ? value.promoter : '';

    this.setState({
      optionCodPromoter,
    });
  };

  refreshScreen = async () => {
    this.setState({ loading: true });
    await this.loadTradesMkt();
    this.setState({ loading: false });
  };

  handleRunFilters = async () => {
    try {
      this.setState({ loading: true });
      let { optionCodTeam, optionCodSupervisor, optionCodManager, optionCodPromoter } = this.state;

      const data_ = {
        GET_ID: optionCodTeam ? optionCodTeam : '',
        GET_COD_GERENTE: optionCodManager ? optionCodManager : '',
        GET_DESCR_GERENTE: '',
        GET_COD_SUPERVISOR: optionCodSupervisor ? optionCodSupervisor : '',
        GET_DESCR_SUPERVISOR: '',
        GEP_COD_PROMOTOR: optionCodPromoter ? optionCodPromoter : '',
        GET_DESCR_PROMOTOR: '',
      };

      const res = await api.post(`v1/tradeteam/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`, data_);
      const { sucess, data } = res.data;
      const tradesMkt = [];

      data.forEach((trade) => {
        tradesMkt.push(trade);
      });

      if (sucess) {
        this.setState({
          tradesMkt,
        });
      } else {
        tratarErros(res.data);
      }
      this.setState({ loading: false });
    } catch (error) {
      alerta('Erro ao filtrar', 2);
      this.setState({ loading: false });
    }
  };

  handleDeleteTeam = async (idTeam) => {
    try {
      const { empresaAtiva, usuarioAtivo } = this.state;
      const res = await api.delete(`v1/tradeteam/${empresaAtiva}/${usuarioAtivo}/${idTeam}`);

      if (res.data.sucess) {
        alerta(res.data.message, 1);
        this.setState({ openModal: false });
        this.refreshScreen();
      }
    } catch (err) {
      alerta(err.response?.data?.error, 2);
    }
  };

  render() {
    const {
      loading,
      tradesMkt,
      selectTeam,
      selectSupervisor,
      selectManager,
      optionCodManager,
      optionCodSupervisor,
      optionCodTeam,
      optionCodPromoter,
      selectPromoter,
      openModal,
      deleteTeam,
    } = this.state;

    return (
      <>
        <Header />
        <WaitScreen loading={loading} />
        <Container className="containerSearchs">
          <DirectTituloJanela
            urlVoltar={'/home'}
            urlNovo={'/TradeMktTeam'}
            titulo={
              loading ? (
                'Aguarde...'
              ) : (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon>poll</Icon>Equipes
                </span>
              )
            }
          />
          <Linha>
            <Collapsible
              accordion={false}
              style={{
                width: '100%',
                padding: '0.4rem',
              }}
            >
              <CollapsibleItem expanded={false} header="Clique para filtrar" icon={<Icon>filter_list</Icon>} node="div">
                <ContentInputFilter>
                  <div className="filter">
                    <Labels fontWeight="700" fontSize="1rem">
                      <span>Equipe</span>
                    </Labels>
                    <SelectQuery
                      inputName="selectTeam"
                      loading={false}
                      itemSelected={optionCodTeam}
                      colorPrimary
                      query={selectTeam}
                      keys={['team']}
                      label="label"
                      onSelect={(item) => {
                        this.handleFilterTeam(item);
                      }}
                      onDelete={() => {
                        this.handleFilterTeam(null);
                      }}
                    />
                  </div>
                  <div className="filter">
                    <Labels fontWeight="700" fontSize="1rem">
                      <span>Gerente</span>
                    </Labels>
                    <SelectQuery
                      inputName="selectManager"
                      loading={false}
                      itemSelected={optionCodManager}
                      colorPrimary
                      query={selectManager}
                      keys={['manager']}
                      label="label"
                      onSelect={(item) => {
                        this.handleFilterManager(item);
                      }}
                      onDelete={() => {
                        this.handleFilterManager(null);
                      }}
                    />
                  </div>
                  <div className="filter">
                    <Labels fontWeight="700" fontSize="1rem">
                      <span>Supervisor</span>
                    </Labels>
                    <SelectQuery
                      inputName="selectSupervisor"
                      loading={false}
                      itemSelected={optionCodSupervisor}
                      colorPrimary
                      query={selectSupervisor}
                      keys={['supervisor']}
                      label="label"
                      onSelect={(item) => {
                        this.handleFilterSupervisor(item);
                      }}
                      onDelete={() => {
                        this.handleFilterSupervisor(null);
                      }}
                    />
                  </div>

                  <div className="filter">
                    <Labels fontWeight="700" fontSize="1rem">
                      <span>Promotor</span>
                    </Labels>
                    <SelectQuery
                      inputName="selectPromoter"
                      loading={false}
                      itemSelected={optionCodPromoter}
                      colorPrimary
                      query={selectPromoter}
                      keys={['promoter']}
                      label="label"
                      onSelect={(item) => {
                        this.handleFilterPromoter(item);
                      }}
                      onDelete={() => {
                        this.handleFilterPromoter(null);
                      }}
                    />
                  </div>
                  <div className="btn-filter">
                    <button className="saib-button is-primary" onClick={this.handleRunFilters}>
                      <Icon tiny>filter_alt</Icon>
                      Filtrar
                    </button>
                  </div>
                </ContentInputFilter>
              </CollapsibleItem>
            </Collapsible>
          </Linha>

          <LinhaKanban>
            {tradesMkt !== undefined &&
              tradesMkt.map((item) => {
                return (
                  <DivBaseKanban key={item.GET_ID}>
                    <LinhaContentHeaderKanBan style={{ paddingTop: '10px' }}>
                      <DivDetalhe flex={3} description={true}>
                        <Labels color="#000" textAlign="center" textDecoration="underline">
                          {`EQUIPE - ${item.GET_ID} ${item.GET_NOME ? ' / ' + item.GET_NOME.toUpperCase() : ' / Sem nome'}`}
                        </Labels>
                        {item.GET_DESCR_GERENTE ? (
                          <>
                            <Labels color="#8e44ad" style={{ marginTop: '0.3rem' }}>
                              GERENTE
                            </Labels>
                            <Labels>{item.GET_DESCR_GERENTE}</Labels>
                          </>
                        ) : (
                          <>
                            <Labels color="#8e44ad" style={{ marginTop: '0.4rem' }}>
                              GERENTE
                            </Labels>
                            <Labels>-</Labels>
                          </>
                        )}

                        <Labels color="#8e44ad" style={{ marginTop: '0.4rem' }}>
                          SUPERVISOR
                        </Labels>
                        {item.GET_DESCR_SUPERVISOR ? <Labels>{item.GET_DESCR_SUPERVISOR}</Labels> : <Labels>-</Labels>}
                        <Labels color="#8e44ad" style={{ marginTop: '0.4rem' }}>
                          PROMOTORES
                        </Labels>
                        {item.PROMOTORES.length > 0 ? (
                          item.PROMOTORES.map((promoter) => (
                            <Labels key={promoter.GEP_COD_PROMOTOR}>{promoter.GEP_DESCR_PROMOTOR}</Labels>
                          ))
                        ) : (
                          <Labels>-</Labels>
                        )}
                      </DivDetalhe>
                    </LinhaContentHeaderKanBan>
                    <LinhaBtnsModal>
                      <Link
                        className="saib-button is-primary"
                        to={{
                          pathname: '/TradeMktTeam',
                          state: {
                            trade: item,
                            action: 'editar',
                          },
                        }}
                      >
                        <Icon tiny>search</Icon>
                        Ver/editar
                      </Link>
                      <button
                        className="saib-button is-primary"
                        onClick={() => this.setState({ openModal: true, deleteTeam: item.GET_ID })}
                      >
                        <Icon tiny>clear</Icon>Apagar
                      </button>
                    </LinhaBtnsModal>
                  </DivBaseKanban>
                );
              })}

            <Modal
              className="modal-confirm-delete"
              actions={[
                <ActionsModal>
                  <button className="saib-button is-primary" onClick={() => this.setState({ openModal: false })}>
                    <Icon tiny>clear</Icon>Não
                  </button>
                  <button className="saib-button is-primary" onClick={() => this.handleDeleteTeam(deleteTeam)}>
                    <Icon tiny>done</Icon>Sim
                  </button>
                </ActionsModal>,
              ]}
              bottomSheet={false}
              fixedFooter={false}
              id="modalConfirmDelete"
              open={openModal}
              options={{
                dismissible: false,
                endingTop: '10%',
                inDuration: 250,
                onCloseEnd: null,
                onCloseStart: null,
                onOpenEnd: null,
                onOpenStart: null,
                opacity: 0.5,
                outDuration: 250,
                preventScrolling: true,
                startingTop: '0',
              }}
              root={document.body}
            >
              <ContainerModal>
                <h1>Tem certeza que deseja apagar a equipe?</h1>
              </ContainerModal>
            </Modal>
          </LinhaKanban>
        </Container>
      </>
    );
  }
}
