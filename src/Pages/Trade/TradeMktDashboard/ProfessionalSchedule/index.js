import React, { Component } from 'react';
import Header from '../../../../Components/System/Header';
import { withRouter, Link } from 'react-router-dom';
import { getFromStorage } from '../../../../services/auth';
import './forced.css';

import { diffInMinutes, alerta, currencyFormat, capitalize, parseDate } from '../../../../services/funcoes';
import { Icon, Button, Table } from 'react-materialize';
import api from '../../../../services/api';
import { Container, Linha, DivDetalhe, Th, Tr, Td, Labels } from './styled';
import Skeleton from 'react-loading-skeleton';
import DirectTituloJanela from '../../../../Components/Globals/DirectTituloJanela';
// import TradeLocation from '../../Home/TradeLocation';
import { syncLocationData } from '../../Home/tradeGlobalFunctions';
import PanelMonitoringContext from '../../../../providers/monitoringPanel';
import WaitScreen from '../../../../Components/Globals/WaitScreen';
import TradeLocation from '../../../../Components/FieldWork/TradeLocation';
import { setGps } from '../../../../services/databaseLocal';
import Question from '../../../../Components/Globals/Question';
import ProfessionalScheduleMobile from '../../../../Components/FieldWork/TradeMktDashboard/ProfessionalScheduleMobile';

class ProfessionalSchedule extends Component {
  static contextType = PanelMonitoringContext;

  state = {
    lastUpdate: 0,
    gatId: undefined,
    loading: false
  };

  componentDidMount = async () => {
    ProfessionalSchedule.contextType = PanelMonitoringContext;
    await this.carregarVariaveisEstado();

    // let { item } = this.state;

    let item = this.props.location.state[0];
    let { urlPrevius, userName, lineClicked } = this.props.location.state[1];
    this.setState({ lineClicked });
    this.setLineClicked();

    try {
      if (urlPrevius) {
        const { setStateProfessionalData } = this.context;
        await setStateProfessionalData({
          GAA_ID: item.GAA_ID,
          urlPrevius: urlPrevius,
          userName: userName,
        });
        setTimeout(async () => await this.loadScheduleList(), 50);

        await this.getActualPosition();
      } else {
        setTimeout(async () => await this.loadScheduleList(), 50);

        await this.getActualPosition();
      }
    } catch (error) {
    } finally {
      this.setState({
        loading: false,
      });
    }

    // this.setState({ item });

    // this.loadScheduleList();
  };

  setLineClicked = async () => {
    const { setStatePanelMonitoring, statePanelMonitoring } = this.context;
    let { lineClicked } = this.state;
    await setStatePanelMonitoring({
      ...statePanelMonitoring,
      lineClicked: lineClicked,
      filtering: false,
    });
  };

  carregarVariaveisEstado = async () => {
    const sessao = getFromStorage();
    // console.log(sessao);
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
    });
  };

  verifyIfHavePhotoPerScheduleData = async (idActivity) => {
    try {
      const dataToSend = {
        gatId: idActivity,
      };
      const res = await api.post(
        `/v1/tradedashboard/photolist/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
        dataToSend
      );

      const { sucess, data } = res.data;
      if (sucess) {
        return data.length > 0 ? true : false;
      } else {
        alerta('Erro ao carregar listagem de fotos');
        return false;
      }
    } catch (error) {
      alerta('Erro ao carregar listagem de fotos');
      return false;
    }
  };

  loadStatusClient = async (data) => {
    data.PERCENTUAL_RESPONDIDO =
      data.TOTAL_PERGUNTAS > 0 ? (data.TOTAL_PERGUNTAS_RESPONDIDAS / data.TOTAL_PERGUNTAS) * 100 : 0;
    if (data.PERCENTUAL_RESPONDIDO <= 30) {
      data.TEMPERATURE = '#e91e63';
    }
    if (data.PERCENTUAL_RESPONDIDO > 30 && data.PERCENTUAL_RESPONDIDO <= 60) {
      data.TEMPERATURE = '#ffeb3b';
    }
    if (data.PERCENTUAL_RESPONDIDO > 60 && data.PERCENTUAL_RESPONDIDO <= 90) {
      data.TEMPERATURE = '#2196f3';
    }
    if (data.PERCENTUAL_RESPONDIDO > 90) {
      data.TEMPERATURE = '#4caf50';
    }

    if (data.ATENDIDO === 'Sim') {
      data.status = 'Atendido';
    } else if (data.EM_ATENDIMENTO === 'Sim') {
      data.status = 'Atendendo';
    } else if (data.JUSTIFICADO === 'Sim') {
      data.status = 'Justificado';
    } else {
      data.status = 'Não atendido';
    }

    if (data.CHECKIN && data.CHECKOUT) {
      const dateCheckin = parseDate(data.CHECKIN);
      const dateChekout = parseDate(data.CHECKOUT);
      const diff = diffInMinutes(dateChekout, dateCheckin);
      data.WORK_TIME = `${diff}min`;
    }

    if (data.CHECKIN) {
      const date = parseDate(data.CHECKIN);
      let minutes = date.getMinutes();
      String(minutes).length < 2 && (minutes = '0' + minutes);
      let seconds = date.getSeconds();
      String(seconds).length < 2 && (seconds = '0' + seconds);
      let hour = date.getHours();
      String(hour).length < 2 && (hour = '0' + hour);
      data.CHECKIN = `${hour}:${minutes}:${seconds}`;
    }
    if (data.CHECKOUT) {
      const date = parseDate(data.CHECKOUT);
      const hour = date.getHours();
      let minutes = date.getMinutes();
      String(minutes).length < 2 && (minutes = '0' + minutes);
      let seconds = date.getSeconds();
      String(seconds).length < 2 && (seconds = '0' + seconds);
      data.CHECKOUT = `${hour}:${minutes}:${seconds}`;
    }

    if (data.HORA_JUSTIFICADO) {
      const date = parseDate(data.HORA_JUSTIFICADO);
      let minutes = date.getMinutes();
      String(minutes).length < 2 && (minutes = '0' + minutes);
      let seconds = date.getSeconds();
      String(seconds).length < 2 && (seconds = '0' + seconds);
      let hour = date.getHours();
      String(hour).length < 2 && (hour = '0' + hour);
      data.CHECKIN = `${hour}:${minutes}:${seconds}`;
      data.CHECKOUT = `${hour}:${minutes}:${seconds}`;
    }

    data.havePhoto = await this.verifyIfHavePhotoPerScheduleData(data.GAT_ID);
  };

  loadScheduleList = async () => {
    this.setState({ loading: true });
    const { stateProfessionalScheduleData } = this.context;
    try {
      const { empresaAtiva, usuarioAtivo } = this.state;
      const url =
        '/v1/tradedashboard/schedulelist/' +
        empresaAtiva +
        '/' +
        usuarioAtivo +
        '/' +
        stateProfessionalScheduleData.GAA_ID;
      const retorno = await api.get(url);

      if (!retorno) {
        return [];
      } else {
        if (retorno.data && retorno.data.sucess) {
          let scheduleList = retorno.data.data;
          for (let item of scheduleList) {
            await this.loadStatusClient(item);
          }
          this.setState({
            scheduleList,
          });
        } else {
          return [];
        }
      }
    } catch (err) {
      // console.log(err);
      alerta(`Erro ao carregar a lista de agendamento => ` + err);
    } finally {
      this.setState({ loading: false });
    }
  };

  getActualPosition = async () => {
    let { lastUpdate } = this.state;
    this.setState({ lastUpdate: lastUpdate + 1 });
  };

  makeWindowRoute = (cliLatitude, cliLongitude) => {
    let { latitude, longitude } = this.state;

    if (latitude && longitude) {
      let origin = {
        latitude,
        longitude,
      };
      let destination = {
        latitude: cliLatitude,
        longitude: cliLongitude,
      };
      this.makeRoute(origin, destination);
    }
  };

  onUpdateCoord = (gpsAvailable, gpsEnabled, coords) => {
    let { empresaAtiva, usuarioAtivo } = this.state;
    syncLocationData(empresaAtiva, usuarioAtivo, coords.latitude, coords.longitude);
    this.setState({ latitude: coords.latitude, longitude: coords.longitude });
    setGps(coords.latitude, coords.longitude);
  };

  makeRoute = (origin, destination) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}`,
      'Rota Cliente'
    );
  };

  render() {
    const { scheduleList, lastUpdate, loading, lineClicked } = this.state;
    const { forceBack } = this.props;
    const { stateProfessionalScheduleData, isMobile } = this.context;

    return (
      <>
        <Header />
        <TradeLocation onUpdateCoord={this.onUpdateCoord} lastUpdate={lastUpdate} />
        <WaitScreen loading={loading} />

        <Container className="professionalScheduleContainer" isMobile={isMobile}>
          <>
            <DirectTituloJanela
              classNameTitulo="professionalScheduleTitle"
              style={{ paddingLeft: '64px' }}
              urlVoltar={undefined}
              // state={item}
              stateUrl={stateProfessionalScheduleData?.urlPrevius}
              forceBack={forceBack}
              titulo={
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon>calendar_today</Icon>Lista de atendimentos
                </span>
              }
            />
            {stateProfessionalScheduleData?.userName && (
              <h5 className="title">{capitalize(stateProfessionalScheduleData?.userName, true)}</h5>
            )}
            {scheduleList !== undefined && !isMobile ? (
              <>
                <Linha>
                  <DivDetalhe>
                    <Table className="table-scroll small-first-col">
                      <thead>
                        <tr>
                          <Th data-field="id">Seq.</Th>
                          <Th data-field="price" flex="2">
                            Status
                          </Th>
                          <Th data-field="name" withMinWidth>
                            Inicio
                          </Th>
                          <Th data-field="price" withMinWidth>
                            Fim
                          </Th>
                          <Th data-field="price" withMinWidth>
                            Nome
                          </Th>
                          <Th data-field="price" withMinWidth>
                            Tempo
                          </Th>
                          <Th data-field="price" withMinWidth>
                            Pesquisas
                          </Th>
                          <Th data-field="price" withMinWidth>
                            Perguntas
                          </Th>
                          <Th data-field="price" withMinWidth>
                            Respostas
                          </Th>
                          <Th data-field="price" buttonsIndicator></Th>
                        </tr>
                      </thead>

                      <tbody className="body-half-screen">
                        {scheduleList.map(
                          (
                            {
                              CHECKIN,
                              CHECKOUT,
                              WORK_TIME,
                              CLI_RAZAO_SOCIAL,
                              CLI_NOME_FANTASIA,
                              TOTAL_PESQUISAS,
                              TOTAL_PERGUNTAS,
                              TEMPERATURE,
                              PERCENTUAL_RESPONDIDO,
                              TOTAL_PERGUNTAS_RESPONDIDAS,
                              havePhoto,
                              CLI_LATITUDE,
                              CLI_LONGITUDE,
                              status,
                              STR_HORA_JUSTIFICADO,
                              JUSTIFICATIVA,
                            },
                            i
                          ) => (
                            <Tr
                              key={i}
                              onClick={() => {
                                this.setState({
                                  clicked: true,
                                  lineClicked: i,
                                });
                              }}
                            >
                              <Td>{i + 1}</Td>
                              <Td>
                                <span
                                  style={{
                                    fontSize: '1rem',
                                    display: 'flex',
                                    color:
                                      status === 'Atendendo'
                                        ? '#8E44AD'
                                        : status === 'Atendido'
                                          ? '#27ae60'
                                          : status === 'Justificado'
                                            ? '#16a085'
                                            : '#2c3e50',
                                  }}
                                >
                                  {status === 'Atendendo' && <Icon>pending</Icon>}
                                  {status === 'Atendido' && <Icon>check_circle</Icon>}
                                  {status === 'Justificado' && <Icon>check_circle_outline</Icon>}
                                  {status === 'Não atendido' && <Icon>hourglass_full</Icon>}
                                  {status}
                                </span>
                              </Td>
                              <Td>{CHECKIN ? CHECKIN : '##:##'} </Td>
                              <Td>{CHECKOUT ? CHECKOUT : '##:##'}</Td>
                              <Td flex="2">
                                {CLI_NOME_FANTASIA}
                                <br />
                                <span> ({CLI_RAZAO_SOCIAL})</span>
                              </Td>
                              <Td>{WORK_TIME ? WORK_TIME : '##:##'}</Td>
                              <Td textAlign="end">{TOTAL_PESQUISAS}</Td>
                              <Td textAlign="end">{TOTAL_PERGUNTAS}</Td>
                              <Td textAlign="end" temperature={TEMPERATURE}>
                                {TOTAL_PERGUNTAS_RESPONDIDAS} [{currencyFormat(PERCENTUAL_RESPONDIDO, '', 2) + '%'}]
                              </Td>
                              <Td buttonsIndicator displayNoneMaps={!CLI_LATITUDE && !CLI_LONGITUDE}>
                                {havePhoto && (
                                  <Link
                                    to={{
                                      pathname: '/SchedulePhotos',
                                      state: [
                                        scheduleList[i],
                                        {
                                          statePrevius: this.props.location.state,
                                          urlPrevius: 'ProfessionalSchedule',
                                          lineClicked,
                                        },
                                      ],
                                      urlPrevius: 'ProfessionalSchedule',
                                      forceBack: true,
                                    }}
                                  >
                                    <Button className="saib-button is-primary photoButton">
                                      <Icon tiny>image</Icon>&nbsp; <span>Fotos</span>
                                    </Button>
                                  </Link>
                                )}
                                {TOTAL_PERGUNTAS_RESPONDIDAS > 0 && (
                                  <Link
                                    to={{
                                      pathname: '/ScheduleSearchs',
                                      state: [
                                        scheduleList[i],
                                        {
                                          statePrevius: this.props.location.state,
                                          urlPrevius: 'ProfessionalSchedule',
                                          lineClicked,
                                        },
                                      ],
                                      forceBack: true,
                                      statePrevius: this.props.location.state,
                                      urlPrevius: 'ProfessionalSchedule',
                                    }}
                                  >
                                    <Button className="saib-button is-primary usesActionButton scheduleButton">
                                      <Icon tiny>question_answer</Icon>&nbsp; <span>Perguntas</span>
                                    </Button>
                                  </Link>
                                )}
                                {CLI_LATITUDE && CLI_LONGITUDE && (
                                  <Button
                                    className="saib-button is-primary mapButton"
                                    onClick={() => this.makeWindowRoute(CLI_LATITUDE, CLI_LONGITUDE)}
                                  >
                                    <Icon tiny>map</Icon>&nbsp; <span>Mapa</span>
                                  </Button>
                                )}

                                {status === 'Justificado' && (
                                  <div style={{ marginLeft: '5px' }}>
                                    <Question
                                      iconeBotaoPadrao={<Icon tiny>help_center</Icon>}
                                      classeBotaoPadrao="waves-effect waves-light saib-button is-primary scheduleButton"
                                      textoBotaoPadrao="Justificativa"
                                      titulo="Atendimento justificado"
                                      tituloBotaoSim="Fechar"
                                      classeBotaoSim="waves-effect waves-light saib-button is-primary modal-action modal-close"
                                      tituloBotaoNao=""
                                      classeBotaoNao="waves-effect waves-light saib-button is-primary modal-action modal-close hidden"
                                      message={
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                          <Labels fontWeight={600}>
                                            Justificativa: <strong>{JUSTIFICATIVA}</strong>
                                          </Labels>
                                          <Labels fontWeight={600}>
                                            Data/Hora: <strong>{STR_HORA_JUSTIFICADO}</strong>
                                          </Labels>
                                        </div>
                                      }
                                      onNo={() => { }}
                                      onYes={() => { }}
                                    />
                                  </div>
                                )}
                              </Td>
                            </Tr>
                          )
                        )}
                      </tbody>
                    </Table>
                  </DivDetalhe>
                </Linha>
              </>
            ) : isMobile ? (
              <ProfessionalScheduleMobile
                data={scheduleList}
                lineClicked={lineClicked}
                statePrevius={this.props.location.state}
                makeWindowRoute={this.makeWindowRoute}
              />
            ) : (
              <>
                <Skeleton count={5} />
              </>
            )}
          </>
        </Container>
      </>
    );
  }
}

export default withRouter(ProfessionalSchedule);
