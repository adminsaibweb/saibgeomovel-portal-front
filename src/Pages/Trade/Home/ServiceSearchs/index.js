import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Labels, Titulo, Container, Linha, StopWatch, TradeTitle, DivDetalhe, FooterPage } from '../style';
import { getFromStorage } from '../../../../services/auth';
import { Icon, Button, ProgressBar } from 'react-materialize';
import Question from '../../../../Components/Globals/Question';
import {
  capitalize,
  haveData,
  alerta,
  formatFloatBr,
  diffInSeconds,
  getScheduleData,
  updateScheduleData,
} from '../../../../services/funcoes';
import './forced.css';
import { delLocalObject, getLocalObject } from '../../../../services/databaseLocal';
import WaitScreen from '../../../../Components/Globals/WaitScreen';
import {
  handleGetEvents,
  isOnline,
  // synchronizing,
  syncLocalData,
  syncLocationData,
} from '../tradeGlobalFunctions';
import { EnviromentVars } from '../../../../config/env';
import TradeLocation from '../../../../Components/FieldWork/TradeLocation';
import { RiUserSettingsLine } from 'react-icons/ri';

class ServiceSearchs extends Component {
  state = {
    loaging: false,
    lastChange: -1,
    cliente: undefined,
    pesquisas: undefined,
    userHours: undefined,
    forceCommit: undefined,
    stopwatch: false,
    totalTimeInSeconds: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    lastUpdate: 0,
    events: [],
  };

  componentDidMount = async () => {
    await this.carregarVariaveisEstado();
    let { cliente, pesquisas, userHours } = this.state;

    cliente = this.props?.history?.location?.state?.cliente || {};
    pesquisas = (await getLocalObject('perguntas')) || this.props?.history?.location?.state?.pesquisas;
    userHours = this.props?.history?.location?.state?.userHours;

    let forceCommit = this.props?.history?.location?.state?.forceCommit;

    await this.handleInterruptsForced(userHours);
    const sessao = getFromStorage();

    const online = await isOnline();
    let events = await handleGetEvents(sessao.empresaId, sessao.codigoUsuario, cliente.CLI_CODIGO, cliente.CLI_ID);

    if (!online) {
      events = null;
    }
    setInterval(async () => {
      await this.handleInterruptsForced(userHours);
    }, 5 * 60000);

    this.setState({
      cliente,
      pesquisas,
      forceCommit,
      userHours,
      events,
      loading: false,
    });
    if (forceCommit) {
      this.handleSaveState();
    }
    let timerGps = setInterval(() => {
      this.getActualPosition();
    }, EnviromentVars.gpsRefresh);

    const scheduleData = await getScheduleData();
    this.setState({ scheduleData, timerGps });
    this.totalizarPerguntas();
  };

  handleInterruptsForced = async (data) => {
    let { totalTimeInSeconds, minutes, seconds, hours } = this.state;

    let resultInitial = null;
    let resultFinal = null;

    if (data && Object.keys(data).length !== 0 && data.INICIO_PARADA1 !== null) {
      const stop = new Date();
      const hoursStop = data.INICIO_PARADA1.split(':', 3);
      stop.setHours(hoursStop[0], hoursStop[1], hoursStop[2]);

      const stopFinal = new Date();
      const hoursFinal = data.FIM_PARADA1.split(':', 3);
      stopFinal.setHours(hoursFinal[0], hoursFinal[1], hoursFinal[2]);

      resultInitial = diffInSeconds(new Date(), stop);
      resultFinal = diffInSeconds(new Date(), stopFinal);
    }

    if (data && resultInitial / 60 >= -30 && resultInitial / 60 <= 0 && data.FORCAR_PARADA1 === 1) {
      totalTimeInSeconds = resultInitial * -1;
      hours = Math.floor(totalTimeInSeconds / 3600) % 24;
      minutes = Math.floor(totalTimeInSeconds / 60) % 60;
      seconds = totalTimeInSeconds % 60;
      this.setState({ stopwatch: 1, totalTimeInSeconds, hours, minutes, seconds });
      this.handleStopWatchRegressive();
    } else if (data && resultFinal / 60 <= 0 && data.FORCAR_PARADA1 === 1 && resultInitial / 60 >= 0) {
      totalTimeInSeconds = resultFinal * -1;
      hours = Math.floor(totalTimeInSeconds / 3600) % 24;
      minutes = Math.floor(totalTimeInSeconds / 60) % 60;
      seconds = totalTimeInSeconds % 60;
      this.setState({ stopwatch: 2, count: true, totalTimeInSeconds, hours, minutes, seconds });
      this.handleStopWatchRegressive();
    } else if (data && Object.keys(data).length !== 0 && data.INICIO_PARADA2 !== null) {
      if (data.FORCAR_PARADA2 === 1) {
        const stop = new Date();
        const hoursStop = data.INICIO_PARADA2.split(':', 3);
        stop.setHours(hoursStop[0], hoursStop[1], hoursStop[2]);

        const stopFinal = new Date();
        const hoursFinal = data.FIM_PARADA2.split(':', 3);
        stopFinal.setHours(hoursFinal[0], hoursFinal[1], hoursFinal[2]);

        resultInitial = diffInSeconds(new Date(), stop);
        resultFinal = diffInSeconds(new Date(), stopFinal);

        if (resultInitial / 60 >= -30 && resultInitial / 60 <= 0) {
          totalTimeInSeconds = resultInitial * -1;
          hours = Math.floor(totalTimeInSeconds / 3600) % 24;
          minutes = Math.floor(totalTimeInSeconds / 60) % 60;
          seconds = totalTimeInSeconds % 60;
          this.setState({ stopwatch: 1, count: true, totalTimeInSeconds, hours, minutes, seconds });
          this.handleStopWatchRegressive();
        } else if (resultFinal / 60 <= 0 && resultInitial / 60 >= 0) {
          totalTimeInSeconds = resultFinal * -1;
          hours = Math.floor(totalTimeInSeconds / 3600) % 24;
          minutes = Math.floor(totalTimeInSeconds / 60) % 60;
          seconds = totalTimeInSeconds % 60;
          this.setState({ stopwatch: 2, count: true, totalTimeInSeconds, hours, minutes, seconds });
          this.handleStopWatchRegressive();
        }
      }
    }
  };

  handleStopWatchRegressive = () => {
    let { totalTimeInSeconds, minutes, seconds, stopwatch, hours } = this.state;

    const interval = setInterval(async () => {
      if (totalTimeInSeconds > 0) {
        totalTimeInSeconds = totalTimeInSeconds - 1;
        hours = Math.floor(totalTimeInSeconds / 3600) % 24;
        minutes = Math.floor(totalTimeInSeconds / 60) % 60;
        seconds = totalTimeInSeconds % 60;
        this.setState({ totalTimeInSeconds, hours, minutes, seconds });
      } else if (stopwatch === 1) {
        clearInterval(interval);
        await this.handleInterruptsForced(this.props?.history?.location?.state?.userHours);
      } else {
        clearInterval(interval);
        this.setState({ stopwatch: -1 });
      }
    }, 1000);
  };

  totalizarPerguntas = async () => {
    let { pesquisas, stopwatch } = this.state;
    if (!haveData(pesquisas)) {
      this.props.history.push({
        pathname: '/StartWorkDay',
        state: {
          stopwatch,
          forceCommit: true,
        },
      });
      return;
    }

    let findProblem = false;
    let totalQuestions = 0;
    let totalQuestionsAnswered = 0;

    for (let pesquisa of pesquisas) {
      findProblem = false;
      totalQuestions = 0;
      totalQuestionsAnswered = 0;

      // sem agrupamento
      if (pesquisa.DETALHAMENTO[0] !== undefined && pesquisa.DETALHAMENTO[0].PERGUNTAS !== undefined) {
        const perguntasParser = pesquisa.DETALHAMENTO[0].PERGUNTAS.filter((e) => e.GPP_FLG_STATUS === 1);
        totalQuestions += perguntasParser.length;
        totalQuestionsAnswered += perguntasParser.filter((item) => {
          return haveData(item.RESPOSTA);
        })?.length;
        pesquisa.ALERTA_OBRIGATORIO = !pesquisa.DETALHAMENTO[0]?.GAP_FLG_OBRIGATORIA_NAO_APLICA
          ? perguntasParser.find((item) => {
              return item.GPP_FLG_ORIGATORIA === 1 && !haveData(item.RESPOSTA);
            }) !== undefined
          : false;
        pesquisa.QTDE_PERGUNTAS = totalQuestions;
        pesquisa.QTDE_PERGUNTAS_RESPONDIDAS = totalQuestionsAnswered;
        pesquisa.PERCENTUAL_CONCLUIDO = formatFloatBr((100 * totalQuestionsAnswered) / totalQuestions, '') + '%';
        pesquisa.CONCLUIDO = (100 * totalQuestionsAnswered) / totalQuestions;
        continue;
      }
      // com agrupamento
      if (pesquisa.DETALHAMENTO[0] !== undefined && pesquisa.DETALHAMENTO[0].AGRUPAMENTO !== undefined) {
        for (const agrupa of pesquisa.DETALHAMENTO[0].AGRUPAMENTO) {
          for (const item_ of agrupa.ITEMS) {
            const perguntasParser = item_.PERGUNTAS.filter((e) => e.GPP_FLG_STATUS === 1);
            totalQuestions += perguntasParser.length;
            let answeredQuestions = perguntasParser.filter((item) => {
              return haveData(item.RESPOSTA) && item.RESPOSTA.length !== 0;
            });
            let allObrigatory = perguntasParser.every((item) => {
              return item.GPP_FLG_ORIGATORIA === 0 && item_.GGI_FLG_ORIGATORIA_NAO_APLICA === 1;
            });
            totalQuestionsAnswered += allObrigatory
              ? perguntasParser.filter((item) => {
                  return haveData(item.RESPOSTA);
                }).length
              : answeredQuestions
              ? answeredQuestions.length
              : 0;

            if (!findProblem) {
              findProblem =
                perguntasParser.find((item) => {
                  return (
                    item.GPP_FLG_ORIGATORIA === 1 &&
                    !haveData(item.RESPOSTA) &&
                    item_.GGI_FLG_ORIGATORIA_NAO_APLICA === 0
                  );
                }) !== undefined;
            }
          }
          pesquisa.QTDE_PERGUNTAS = totalQuestions;
          pesquisa.QTDE_PERGUNTAS_RESPONDIDAS = totalQuestionsAnswered;
          pesquisa.PERCENTUAL_CONCLUIDO = formatFloatBr((100 * totalQuestionsAnswered) / totalQuestions, '') + '%';
          pesquisa.CONCLUIDO = (100 * totalQuestionsAnswered) / totalQuestions;
        }
        pesquisa.ALERTA_OBRIGATORIO = !pesquisa.DETALHAMENTO[0]?.GAP_FLG_OBRIGATORIA_NAO_APLICA ? findProblem : false;
      }
    }
    this.setState({ pesquisas });
  };

  componentWillUnmount = () => {
    let { timerGps } = this.state;
    clearInterval(timerGps);
  };

  getActualPosition = async () => {
    let { lastUpdate } = this.state;
    this.setState({ lastUpdate: lastUpdate + 1 });
  };

  handleStartSearchLink = async (pesquisaId) => {
    const { stopwatch } = this.state;
    // let sincronizando = await synchronizing();
    // if (!sincronizando) {
    await this.handleInterruptsForced(this.props?.location?.state?.userHours);
    if (stopwatch !== 2) {
      document.getElementsByClassName(`startSearchLink_${pesquisaId}`)[0].click();
    }
    // } else {
    //   alerta('Aguarde...', 1);
    // }
  };

  handleStartSearchLinkGrouped = async (pesquisaId) => {
    // let sincronizando = await synchronizing();
    // if (!sincronizando) {
    document.getElementsByClassName(`startSearchLinkGrouped_${pesquisaId}`)[0].click();
    // } else {
    //   alerta('Aguarde...', 1);
    // }
  };

  onUpdateCoord = (gpsAvailable, gpsEnabled, coords) => {
    let { empresaAtiva, usuarioAtivo } = this.state;
    syncLocationData(empresaAtiva, usuarioAtivo, coords.latitude, coords.longitude);
    this.setState({ latitude: coords.latitude, longitude: coords.longitude });
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();

    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCnpj: sessao.empresaCnpj,
      empresaCfId: sessao.empresaCfId,
      frotaId: sessao.frotaId,
      gmovel: sessao.gmovel,
      gmovelTrade: sessao.gmovelTrade,
      gmovelPromotor: sessao.gmovelPromotor,
      gmovelSupervisor: sessao.gmovelSupervisor,
      flagAdministrativo: sessao.flagAdministrativo,
    });
  };

  handleSaveState = async (checkout = false) => {
    let { cliente, pesquisas, latitude, longitude } = this.state;
    let scheduleData = await getScheduleData();

    for (const cli of scheduleData.CLIENTES) {
      if (cli.CLI_ID === cliente?.CLI_ID) {
        if (checkout) {
          for (const checkIn of cli.checkIn) {
            if (checkIn.status === 1) {
              checkIn.status = 0;
              checkIn.stop = new Date();
              checkIn.latitudeCheckOut = latitude;
              checkIn.longitudeCheckOut = longitude;
              break;
            }
          }
          cli.status = 2;
          cli.lastCheckout = new Date();
          // -1 - pausado
          // 0 - não foi feito atendimento
          // 1 - em atendimento
          // 2 - finalizado
          scheduleData.emAtendimento = false;
          scheduleData.cliAtendimento = cliente?.CLI_ID;
          // scheduleData.GAA_FLG_STATUS = 1;
        } else {
          // if (cli.pesquisas === undefined){
          cli.pesquisas = pesquisas;
          // }
        }
        break;
      }
    }
    await updateScheduleData(scheduleData);
    this.setState({ scheduleData });
  };

  forceSyncLocalData = async (forceClose) => {
    let { empresaAtiva, usuarioAtivo, empresaCnpj } = this.state;
    return await syncLocalData(forceClose, empresaAtiva, usuarioAtivo, empresaCnpj, false, this.onUpdateWaitScreen);
  };

  handleCheckout = async () => {
    const { pesquisas, stopwatch } = this.state;

    const pendingSearch = pesquisas.filter((search) => search.ALERTA_OBRIGATORIO === false);
    if (pendingSearch.length === pesquisas.length) {
      this.setState({ loading: true, percent: 0, message: undefined });
      let synced = await this.forceSyncLocalData(false);

      if (synced) {
        await this.handleSaveState(true);
        let scheduleData = await getScheduleData();
        scheduleData.cliAtendimento = undefined;
        await delLocalObject('perguntas');
        await updateScheduleData(scheduleData);
        this.setState({ loading: false, scheduleData });
        this.props.history.push({
          pathname: '/StartWorkDay',
          state: {
            stopwatch,
            forceCommit: true,
          },
        });
      } else {
        alerta('Não foi possível fazer o Check-out.\nVerifique sua conexão com a internet e se seu GPS está ativo.', 2);
        this.setState({ loading: false });
      }
    } else {
      alerta('Ainda existem pesquisas obrigatórias não respondidas', 2);
    }
  };

  handleNavigateAdmin = async () => {
    const { cliente, pesquisas } = this.state;
    const scheduleData = await getScheduleData();

    if (scheduleData && !scheduleData.CONFERENCE && !scheduleData.ORDERS) {
      scheduleData.CONFERENCE = {
        INVENTORY: [],
        PRODUCTS: [],
        lastAddPos: null,
        finishConference: null,
        orderAdmin: [],
        open: true,
      };
      scheduleData.ORDERS = {
        ADD: [],
        INPROGRESS: [],
        NEW: [],
      };
      scheduleData.ORDERS_DIRECT = {
        ADD: [],
        INPROGRESS: [],
        NEW: [],
      };
      await updateScheduleData(scheduleData);
    }

    this.props.history.push({
      pathname: '/AdminModule',
      state: {
        cliente: cliente,
        pesquisas: pesquisas,
      },
    });
  };

  onUpdateWaitScreen = (newPercent, newMessage, addPercent = false) => {
    if (!addPercent) {
      this.setState({ percent: newPercent, message: newMessage });
    } else {
      let { percent } = this.state;
      percent = percent === undefined ? 1 : percent + 1;
      this.setState({ percent, message: newMessage });
    }
  };

  render() {
    const {
      cliente,
      pesquisas,
      loading,
      lastUpdate,
      percent,
      message,
      stopwatch,
      hours,
      minutes,
      seconds,
      userHours,
      events,
      flagAdministrativo,
    } = this.state;
    return (
      <>
        <TradeLocation onUpdateCoord={this.onUpdateCoord} lastUpdate={lastUpdate} />
        <Titulo
          style={{
            justifyContent: 'flex-start',
            paddingLeft: '15px',
            top: '0px',
            zIndex: '2',
          }}
        >
          <Link
            className="backToStartWorkDay"
            to={{
              pathname: '/StartWorkDay',
              state: {
                stopwatch,
                forceCommit: true,
              },
            }}
          >
            <button
              style={{ cursor: 'pointer', color: 'white' }}
              className="waves-effect waves-light saib-button is-cancel"
            >
              <Icon className="modal-close">arrow_back</Icon>
            </button>
          </Link>
          <p style={{ position: 'unset', top: 'unset', width: '100%' }}>Em atendimento</p>
          {flagAdministrativo && (
            <button
              onClick={this.handleNavigateAdmin}
              className="saib-button is-primary"
              style={{
                display: 'flex',
                flexDirection: 'row',
                color: '#FFF',
                border: '1px solid #FFF',
                borderRadius: '4px',
                fontSize: '16px',
                marginRight: '5px',
              }}
            >
              {' '}
              <RiUserSettingsLine />
              Admin
            </button>
          )}
        </Titulo>
        <WaitScreen loading={loading} percent={percent} message={message} />
        {cliente !== undefined && (
          <>
            <Container className="attendanceSearchs" style={{ padding: '0px 10px' }}>
              <Linha style={{ textAlign: 'center', alignItems: 'center', gap: '1rem' }} className="tituloCliente">
                <Labels fontSize={'1.2rem'} fontWeight={'700'}>
                  <TradeTitle>{capitalize(`${cliente.CLI_NOME_FANTASIA?.toLowerCase()}`)}</TradeTitle>
                </Labels>
                {!events && (
                  <div style={{ padding: '0.2rem', background: '#dbdbdb', borderRadius: '0.3rem' }}>
                    <span style={{ color: '#000', fontWeight: '700' }}>
                      Para acessar os eventos deste cliente, conecte-se à internet
                    </span>
                  </div>
                )}
                {events && events.length > 0 && (
                  <Button
                    onClick={() => {
                      this.props.history.push({
                        pathname: '/ServiceEvents',
                        state: {
                          cliente: cliente,
                          pesquisas: pesquisas,
                          events,
                        },
                      });
                    }}
                    className="waves-effect waves-light saib-button is-primary"
                  >
                    Ver os eventos para esse cliente
                  </Button>
                )}
              </Linha>

              {stopwatch > 0 && (
                <StopWatch>
                  {stopwatch === 2 && <h5>Aplicativo bloqueado por parada obrigatória</h5>}

                  <div>
                    <strong>&nbsp;{hours.toString().padStart(2, '0')}</strong>
                    <strong>:</strong>
                    <strong>{minutes.toString().padStart(2, '0')}</strong>
                    <strong>:</strong>
                    <strong>{seconds.toString().padStart(2, '0')}</strong>
                    <span>&nbsp;{stopwatch === 1 ? 'para a parada obrigatória' : 'para retornar ao serviço'}</span>
                  </div>
                </StopWatch>
              )}
              <Linha className="containerPerguntas">
                {pesquisas.map((pesquisa) => (
                  <React.Fragment key={pesquisa.GFP_ID}>
                    <Linha className="linhaAtendimento">
                      <DivDetalhe className="botaoAction">
                        {pesquisa.ATENDIDO === 1 ? (
                          <>
                            <Labels
                              style={{
                                backgroundColor: '#ccc',
                                padding: '5px',
                                marginRight: '2px',
                                borderRadius: '50px',
                              }}
                            >
                              Atendido
                            </Labels>
                          </>
                        ) : (
                          <>
                            {pesquisa.DETALHAMENTO[0].PERGUNTAS !== undefined ? (
                              <>
                                <Button
                                  style={{
                                    marginRight: '10px',
                                    position: 'relative',
                                  }}
                                  disabled={stopwatch === 2 ? true : false}
                                  title="Iniciar pesquisa"
                                  className="waves-effect waves-light saib-button is-primary"
                                  onClick={() => this.handleStartSearchLink(pesquisa.GFP_ID)}
                                >
                                  <Icon>play_arrow</Icon>
                                </Button>

                                <Link
                                  className={`startSearchLink_${pesquisa.GFP_ID}`}
                                  to={{
                                    pathname: '/StartSearch',
                                    state: {
                                      cliente,
                                      userHours,
                                      perguntas: pesquisa.DETALHAMENTO,
                                      pesquisas: pesquisas,
                                      pesquisa,
                                    },
                                  }}
                                  disabled={stopwatch === 2 ? true : false}
                                  style={{ display: 'none' }}
                                >
                                  {'Iniciar Pesquisa =>' + pesquisa.GFP_ID}
                                </Link>
                              </>
                            ) : (
                              <>
                                <Link
                                  className={`startSearchLinkGrouped_${pesquisa.GFP_ID}`}
                                  to={{
                                    pathname: '/StartSearchGrouped',
                                    state: {
                                      cliente,
                                      userHours,
                                      perguntas: pesquisa.DETALHAMENTO,
                                      pesquisas,
                                      pesquisa,
                                    },
                                  }}
                                  style={{ display: 'none' }}
                                ></Link>
                                <Button
                                  onClick={() => this.handleStartSearchLinkGrouped(pesquisa.GFP_ID)}
                                  disabled={stopwatch === 2 ? true : false}
                                  style={{
                                    marginRight: '10px',
                                    position: 'relative',
                                  }}
                                  title="Iniciar pesquisa"
                                  className="waves-effect waves-light saib-button is-primary"
                                >
                                  <Icon>play_arrow</Icon>
                                </Button>
                              </>
                            )}
                          </>
                        )}
                      </DivDetalhe>
                      <DivDetalhe style={{ flex: '2' }}>
                        <Labels fontWeight={'700'} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                          {haveData(pesquisa.GAP_ICONE) ? (
                            <>
                              <img
                                src={pesquisa.GAP_ICONE}
                                alt={pesquisa.GAP_DESCRICAO}
                                width={'32px'}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                }}
                              />
                            </>
                          ) : (
                            <></>
                          )}

                          <span className="descricaoPesquisa">{capitalize(pesquisa.GAP_DESCRICAO, true)}</span>
                          <Labels
                            color={
                              pesquisa.ALERTA_OBRIGATORIO === false ||
                              pesquisa.DETALHAMENTO[0]?.GAP_FLG_OBRIGATORIA_NAO_APLICA
                                ? '#3f51b5'
                                : '#f44336'
                            }
                          >
                            {pesquisa.ALERTA_OBRIGATORIO === false ||
                            pesquisa.DETALHAMENTO[0]?.GAP_FLG_OBRIGATORIA_NAO_APLICA ? (
                              <Icon tiny>done_all</Icon>
                            ) : (
                              <Icon tiny>error</Icon>
                            )}
                          </Labels>
                        </Labels>
                        <Labels className="totalConcluido">
                          {pesquisa.CONCLUIDO ? pesquisa.PERCENTUAL_CONCLUIDO : 0 + '%'}
                          <ProgressBar
                            className="progressoPesquisas"
                            progress={pesquisa.CONCLUIDO ? pesquisa.CONCLUIDO : 0}
                            style={{ display: pesquisa.CONCLUIDO && pesquisa.CONCLUIDO === 0 ? 'inline' : 'unset' }}
                          />
                        </Labels>
                      </DivDetalhe>
                    </Linha>
                  </React.Fragment>
                ))}
              </Linha>
              {cliente !== undefined && stopwatch !== 2 && (
                <>
                  <FooterPage className="footerTrader">
                    <Question
                      iconeBotaoPadrao={
                        <span style={{ color: 'white', width: 'unset' }}>
                          {' '}
                          <Icon large>done_all</Icon>
                        </span>
                      }
                      classeBotaoPadrao="waves-effect waves-light saib-button is-primary"
                      textoBotaoPadrao="Check-out"
                      titulo={'Iniciando o Check-out'}
                      tituloBotaoSim="Sim"
                      classeBotaoSim="waves-effect waves-light saib-button is-primary modal-action modal-close"
                      tituloBotaoNao="Não"
                      classeBotaoNao="waves-effect waves-light saib-button is-primary modal-action modal-close"
                      message={
                        <div className="divModal">
                          <p className="spanModal">Gostaria de finalizar o atendimento de</p>
                          <p className="spanModal bold">{cliente?.CLI_RAZAO_SOCIAL}</p>
                        </div>
                      }
                      onNo={() => {}}
                      onYes={async () => {
                        await this.handleCheckout();
                      }}
                    />{' '}
                  </FooterPage>
                </>
              )}
            </Container>
          </>
        )}
      </>
    );
  }
}

export default withRouter(ServiceSearchs);
