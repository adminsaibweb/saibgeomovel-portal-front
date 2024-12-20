import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { getFromStorage } from '../../../../services/auth';
import {
  alerta,
  // currencyFormat,
  // haveData,
  // formatDateTimeToBr,
  parseDate,
  diffInMinutes,
  dateFormat,
  haveData,
} from '../../../../services/funcoes';
import TopBarInformation from '../../../../Components/FieldWork/TradeMktDashboard/TopBarInformation';
import TableMonitoring from '../../../../Components/FieldWork/TradeMktDashboard/TableMonitoring';
import BottomMonitoring from '../../../../Components/FieldWork/TradeMktDashboard/BottomMonitoring';

import api from '../../../../services/api';
import { Container, Labels } from '../style';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import PanelMonitoringContext from '../../../../providers/monitoringPanel';
import TableMonitoringMobile from '../../../../Components/FieldWork/TradeMktDashboard/TableMonitoringMobile';
class UsersUnGroupedIndicators extends Component {
  static contextType = PanelMonitoringContext;
  state = {
    daySelected: new Date(),
    monthSelected: new Date(),
    customSelectedInitial: 0,
    customSelectedEnd: 0,
    ungroupedIndicators: [],
    loading: true,
    promotoresSelecionados: [],
    ramoAtividadeSelecionados: [],
    selectedFilter: 'day',
    changedFilter: 0,
    dataSheduleSelected: {},
    dataSchedules: [],
    clientsScheduleds: [],
    alerts: [],
    typeFilter: '1',
    lineClicked: 0,
    size: [0, 0],
    isMobile: false,
    noPermission: false,
  };

  componentDidMount = async () => {
    UsersUnGroupedIndicators.contextType = PanelMonitoringContext;
    this.mounted = true;
    await this.carregarVariaveisEstado();
    this.initCustomDates();
    await this.loadDataOfBack();
  };

  UNSAFE_componentWillMount() {
    this.mounted = false;
  }

  componentWillUnmount = async () => {
    await this.handleStopTimer();
  };

  loadDataOfBack = async () => {
    const { statePanelMonitoring } = this.context;
    const { gmovelSupervisor, gmovelGerente, gmovelTrade, gmovelPromotor, empresaAtiva, usuarioAtivo } = this.state;

    if (statePanelMonitoring) {
      this.setState(
        {
          daySelected: moment(statePanelMonitoring.daySelected, 'DD/MM/yyyy')._d,
          typeFilter: statePanelMonitoring.typeFilter,
          lineClicked: statePanelMonitoring.lineClicked,
        },
        async () => {
          let flag = 0;
          let restPayload = {
            GET_COD_GERENTE: '',
            GET_COD_SUPERVISOR: '',
          };
          if (gmovelGerente) {
            flag = 1;
            restPayload = {
              GET_COD_GERENTE: usuarioAtivo,
              GET_COD_SUPERVISOR: '',
            };
          } else if (gmovelSupervisor) {
            flag = 1;
            restPayload = {
              GET_COD_GERENTE: '',
              GET_COD_SUPERVISOR: usuarioAtivo,
            };
          }
          const payload = {
            GET_ID: '',
            GET_DESCR_GERENTE: '',
            GET_DESCR_SUPERVISOR: '',
            GET_COD_PROMOTOR: '',
            GET_DESCR_PROMOTOR: '',
            GET_FLG_SITUACAO: '',
            ...restPayload,
          };
          if (flag === 1) {
            const res = await api.post(`/v1/tradeteam/${empresaAtiva}/${usuarioAtivo}`, payload);
            const { data } = res.data;

            if (haveData(data)) {
              let promotoresSelecionados = [];
              let supervisoresSelecionados = [];
              data.forEach((element) => {
                const promotores = element.PROMOTORES.map((item) => {
                  return item.GEP_COD_PROMOTOR;
                });
                promotoresSelecionados = [...promotoresSelecionados, ...promotores];
                supervisoresSelecionados.push(element.GET_COD_SUPERVISOR);
              });

              this.setState({ promotoresSelecionados, supervisoresSelecionados });
            }
          }
          if (gmovelPromotor) {
            this.setState({ promotoresSelecionados: [usuarioAtivo] });
          }
          if (gmovelTrade) {
            this.handleDataSchedule();
            await this.handleDataClientsScheduleds();
            await this.handleLoadDayData(moment(statePanelMonitoring.daySelected, 'DD/MM/yyyy'), true);
          } else {
            this.setState({ noPermission: true });
          }
        }
      );
    }
  };

  dataFiltered = async () => {
    const { statePanelMonitoring } = this.context;
    if (statePanelMonitoring) {
      return statePanelMonitoring.filtering;
    }
  };

  setIntervalUpdateData = () => {
    const timerInterval = setInterval(async () => {
      if (this.mounted) await this.handleDataSchedule();
    }, 60000);
    this.setState({
      timerInterval,
    });
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();

    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      gmovelSupervisor: sessao.gmovelSupervisor,
      gmovelGerente: sessao.gmovelGerente,
      gmovelTrade: sessao.gmovelTrade,
      gmovelPromotor: sessao.gmovelPromotor,
      isAdmin: sessao.isAdmin,
    });
  };

  initCustomDates = () => {
    const endOfWeek = moment();
    const startOfWeek = moment().subtract(14, 'days');
    let customSelectedInitial = startOfWeek.toDate();
    let customSelectedEnd = endOfWeek.toDate();
    this.setState({ customSelectedInitial, customSelectedEnd });
  };

  handleLoadDayData = async (daySelected, initialLoaging = false) => {
    this.setState({ loading: true, selectedFilter: 'day' });
    if (!initialLoaging) {
      this.onChangeFilter();
    }

    let ungroupedIndicators = await this.loadIndicatorsGeoOf(
      moment(daySelected).format('DD/MM/yyyy'),
      moment(daySelected).format('DD/MM/yyyy'),
      'day'
    );
    this.handleAlerts(ungroupedIndicators);

    this.setState({ loading: false });
    this.setState({
      ungroupedIndicators,
    });
  };

  getEstruturaAutorizada = () => {
    let inElements = '';
    let { estruturaAutorizada } = this.state;

    if (estruturaAutorizada !== undefined) {
      for (const element of estruturaAutorizada) {
        inElements += "'" + element['ESTR_ID'] + "',";
      }

      if (inElements !== '') {
        return inElements.substr(0, inElements.length - 1);
      }
    }
    return inElements;
  };

  loadFiltersList = async () => {
    try {
      const { empresaAtiva, usuarioAtivo } = this.state;
      const url = '/v1/tradedashboard/allfilter/' + empresaAtiva + '/' + usuarioAtivo;
      const retorno = await api.get(url);

      if (!retorno) {
        return [];
      } else {
        if (retorno.data && retorno.data.sucess) {
          let result = retorno.data.data;

          let ramosAtividades = result.ramosAtividades;
          let ramosAtividadesChips = {};
          let cidades = result.cidades;
          let cidadesChips = {};
          let promotores = result.promotores;
          let promotoresChips = {};
          let supervisores = result.supervisores;
          let supervisoresChips = {};

          for (const vendedor of promotores) {
            promotoresChips[vendedor.PROMOTOR] = null;
          }
          for (const supervisor of supervisores) {
            supervisoresChips[supervisor.SUPERVISOR] = null;
          }
          for (const cidade of cidades) {
            cidadesChips[cidade.CIDADE] = null;
          }
          for (const ramo of ramosAtividades) {
            ramosAtividadesChips[ramo.RAMO] = null;
          }

          this.setState({
            ramosAtividades,
            cidades,
            promotores,
            promotoresChips,
            cidadesChips,
            ramosAtividadesChips,
            supervisores,
            supervisoresChips,
          });
        } else {
          return [];
        }
      }
    } catch (err) {
      this.setState({ loading: false });
      alerta(`Erro ao carregar os filtros => ` + err);
    }
  };

  onChangeFilter = () => {
    let { changedFilter } = this.state;
    changedFilter += 1;
    this.setState({ changedFilter });
  };

  validateAlert = async (item) => {
    try {
      const { empresaAtiva, usuarioAtivo } = this.state;
      let alertar = '';
      let diaSelecionado = parseDate(item.GAA_DTA_AGENDA);
      let fimDia = parseDate(item.FIM_DIA);
      let inicioDiaOitoString = item.GAA_DTA_AGENDA.substr(0, 10) + 'T11:00:00.000Z';
      let fimDiaDezoitoString = item.GAA_DTA_AGENDA.substr(0, 10) + 'T20:00:00.000Z';
      let inicioDiaOito = parseDate(inicioDiaOitoString);
      let fimDiaDezoito = parseDate(fimDiaDezoitoString);
      let diaUtil = diaSelecionado.getDay() > 0;

      if (diaUtil) {
        //verificando se o dia não foi iniciado e já passaram das 08:00
        if (item.INICIO_DIA === null && diffInMinutes(new Date(), inicioDiaOito) > 20) {
          alertar += 'Não iniciou o dia.\n';
        }

        //verificando se o dia foi não foi encerrado depois de 20 minutos das 18
        if (item.FIM_DIA === null && diffInMinutes(fimDia, fimDiaDezoito) > 20) {
          alertar += 'Não finalizou o dia.\n';
        }
      }

      if (alertar === '') {
        const getAlerts = await api.post(`v1/tradedashboard/alerts/${empresaAtiva}/${usuarioAtivo}`, {
          gaaId: item.GAA_ID,
        });

        if (getAlerts.data.data.length > 0) {
          alertar = 'Sim';
        }
      }

      return alertar;
    } catch (error) {
      alerta('Erro ao carregar dados', 2);
    }
  };

  loadIndicatorsGeoOf = async (startDate, finalDate, tipo) => {
    try {
      // return;
      this.setState({
        ungroupedIndicators: undefined,
        diaSelecionado: startDate,
      });
      const { empresaAtiva, usuarioAtivo, promotoresSelecionados, supervisoresSelecionados } = this.state;
      let ramosAtividades, cidades;
      ramosAtividades = this.getSelectedRamosAtividades();
      cidades = this.getSelectedCidades();

      const url = '/v1/tradedashboard/basics/' + empresaAtiva + '/' + usuarioAtivo;
      let datas = {
        startDate,
        finalDate,
        cidades,
        ramosAtividades,
        promotores: promotoresSelecionados.map((item) => {
          return item;
        }),
        estruturaAutorizada: this.getEstruturaAutorizada(),
        supervisores: supervisoresSelecionados,
        tipo,
      };

      const retorno = await api.post(url, datas);

      if (!retorno) {
        return [];
      } else {
        if (retorno.data && retorno.data.sucess) {
          let result = retorno.data.data;
          let contador = 1;
          for (const item of result) {
            item.contador = contador;
            contador += 1;

            item.alerta = await this.validateAlert(item);
          }
          result = result.sort((a, b) => {
            return a.USR_NOME < b.USR_NOME ? -1 : 0;
          });
          return result;
        } else {
          return [];
        }
      }
    } catch (err) {
      this.setState({ loading: false });
      alerta(`Erro ao carregar os indicadores => ` + err);
    }
  };

  makeIn = (chipsElement, elements, searchText, searchKey) => {
    let inElements = '';
    if (chipsElement === undefined || elements === undefined) {
      return inElements;
    }
    for (const element of chipsElement) {
      const _element = elements.find((elemento) => elemento[searchText] === element.tag);
      if (_element !== undefined) {
        inElements += "'" + _element[searchKey] + "',";
      }
    }
    if (inElements !== '') {
      return inElements.substr(0, inElements.length - 1);
    }
    return inElements;
  };

  getSelectedPromotores = () => {
    let { promotoresSelecionados, promotores } = this.state;
    return this.makeIn(promotoresSelecionados, promotores, 'PROMOTOR', 'PROMOTOR_ID');
  };

  getSelectedRamosAtividades = () => {
    let { ramosAtividadesSelecionados, ramosAtividades } = this.state;
    return this.makeIn(ramosAtividadesSelecionados, ramosAtividades, 'RAMO', 'RAMO_ID');
  };

  getSelectedCidades = () => {
    let { cidadesSelecionadas, cidades } = this.state;
    return this.makeIn(cidadesSelecionadas, cidades, 'CIDADE', 'CIDADE');
  };

  getSelectedSupervisores = () => {
    let { supervisoresSelecionados, supervisores } = this.state;
    return this.makeIn(supervisoresSelecionados, supervisores, 'SUPERVISOR', 'SUPERVISOR_ID');
  };

  handleAllDataUpdate = () => {
    const { selectedFilter, daySelected, customSelectedInitial, monthSelected } = this.state;
    if (selectedFilter === 'day') {
      this.handleLoadDayData(daySelected);
    }
    if (selectedFilter === 'month') {
      this.handleLoadMonthData(monthSelected);
    }
    if (selectedFilter === 'custom') {
      this.handleLoadCustomDataInitial(customSelectedInitial);
    }
    // this.onChangeFilter();
  };

  handlePhotosSchedules = async (dataSheduleSelected, lineClicked) => {
    this.setState({
      dataSheduleSelected,
      lineClicked,
    });
    const { setStatePanelMonitoring, statePanelMonitoring } = this.context;
    await setStatePanelMonitoring({
      ...statePanelMonitoring,
      lineClicked: lineClicked,
    });
  };

  handleAlerts = (dataSchedules) => {
    let { alerts } = this.state;
    let alerts_ =
      dataSchedules &&
      dataSchedules.map((dataSchedule) => {
        return {
          gaaId: dataSchedule.GAA_ID,
          descricao: dataSchedule.alerta ? dataSchedule.alerta : '',
          typeColaborator: dataSchedule.FUNCAO === 'Promotor' ? '1' : '0',
          userName: dataSchedule.USR_NOME,
          status: 0,
        };
      });

    if (alerts.length > 0)
      alerts = alerts.sort((a, b) => {
        return a.gaaId - b.gaaId;
      });
    alerts_ =
      alerts_ &&
      alerts_.sort((a, b) => {
        return a.gaaId - b.gaaId;
      });

    if (JSON.stringify(alerts) !== JSON.stringify(alerts_)) {
      this.setState({
        alerts: alerts_,
      });
    }
  };

  handleStopTimer = async () => {
    let { timerInterval } = this.state;
    clearInterval(timerInterval);
    this.setState({ timerInterval });
  };

  handleDataSchedule = async (reload) => {
    if (await this.dataFiltered()) {
      return;
    }

    await this.handleStopTimer();

    try {
      const {
        empresaAtiva,
        usuarioAtivo,
        allDataSchedules,
        daySelected,
        typeFilter,
        promotoresSelecionados,
        supervisoresSelecionados,
      } = this.state;
      const { forceLoading } = this.context;

      const url = '/v1/tradedashboard/basics/' + empresaAtiva + '/' + usuarioAtivo;
      let datas = {
        startDate: dateFormat(daySelected, 'DD/MM/yyyy'),
        finalDate: dateFormat(daySelected, 'DD/MM/yyyy'),
        cidades: '',
        ramosAtividades: '',
        promotores: promotoresSelecionados.map((item) => {
          return item;
        }),
        estruturaAutorizada: '',
        supervisores: supervisoresSelecionados,
        tipo: '',
      };

      const retorno = await api.post(url, datas);

      const { sucess, data } = retorno.data;

      if (sucess) {
        if ((JSON.stringify(allDataSchedules) !== JSON.stringify(data) || reload) && !forceLoading) {
          this.setState({
            loading: true,
            dataSheduleSelected: '',
            forceLoading: false,
          });
          const data_ = JSON.parse(
            JSON.stringify(
              data
                .filter((data) => (typeFilter === '1' ? data.FUNCAO === 'Promotor' : data.FUNCAO === 'Supervisor'))
                .sort((a, b) => {
                  return a.GAA_ID - b.GAA_ID;
                })
            )
          );

          for (let item of data_) {
            item.alerta = await this.validateAlert(item);
          }
          this.setState(
            {
              dataSchedules: data_.filter((data) =>
                typeFilter === '1' ? data.FUNCAO === 'Promotor' : data.FUNCAO === 'Supervisor'
              ),
              allDataSchedules: data,
            },
            () => {
              this.handleAlerts(this.state.dataSchedules);
            }
          );
        }
      } else {
        alerta('Erro ao carregar dados dos agendamentos');
      }
    } catch (err) {
      this.setState({ loading: false });
      alerta(`Erro ao carregar os indicadores => ` + err);
    } finally {
      this.setIntervalUpdateData();
      this.setState({
        loading: false,
      });
    }
  };

  handleDataClientsScheduleds = async () => {
    const { empresaAtiva, usuarioAtivo, daySelected } = this.state;
    try {
      this.setState({ loading: true });
      let url;
      url = '/v1/schedule/' + empresaAtiva + '/' + usuarioAtivo;
      let data = {
        gaaId: '',
        usuarioAgenda: '',
        status: '',
        dataInicial: dateFormat(daySelected, 'DD/MM/yyyy'),
        dataFinal: dateFormat(daySelected, 'DD/MM/yyyy'),
      };

      let countClients = 0;
      const retorno = await api.post(url, data);
      if (retorno.data && retorno.data.sucess) {
        const { data } = retorno.data;
        // if (JSON.stringify(data) !== JSON.stringify(clientsScheduleds)) {
        this.setState({ clientsScheduleds: data });
        // }
      }
      this.setState({
        countClients,
      });
    } catch (err) {
      alerta('Erro ao carregar os agendamentos =>' + err, 2);
      this.setState({ loading: false });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleDataSchdulesPerFilter = async (ev) => {
    const { value } = ev.target;
    const { setStatePanelMonitoring, statePanelMonitoring } = this.context;
    await setStatePanelMonitoring({
      ...statePanelMonitoring,
      typeFilter: value,
    });
    this.setState(
      {
        typeFilter: value,
      },
      async () => await this.handleDataSchedule()
    );

    const { allDataSchedules } = this.state;
    if (value === '1') {
      //promotor
      const dataShedulesPromotor = allDataSchedules?.filter((data) => data.FUNCAO === 'Promotor');
      if (dataShedulesPromotor) {
        for (let item of dataShedulesPromotor) {
          item.alerta = await this.validateAlert(item);
        }

        if (dataShedulesPromotor.length < 1) {
          this.setState({
            dataSheduleSelected: '',
          });
        }
        this.setState(
          {
            dataSchedules: dataShedulesPromotor,
          },
          () => this.handleAlerts(this.state.dataSchedules)
        );
      }
    } else {
      //supervisor
      const dataShedulesSupervisor = allDataSchedules?.filter((data) => data.FUNCAO === 'Supervisor');
      if (dataShedulesSupervisor) {
        for (let item of dataShedulesSupervisor) {
          item.alerta = await this.validateAlert(item);
        }

        if (dataShedulesSupervisor.length < 1) {
          this.setState({
            dataSheduleSelected: '',
          });
        }
        this.setState(
          {
            dataSchedules: dataShedulesSupervisor,
          },
          () => this.handleAlerts(this.state.dataSchedules)
        );
      }
    }
  };

  onChangeDate = async (date) => {
    const { setStatePanelMonitoring, statePanelMonitoring } = this.context;
    setStatePanelMonitoring({
      ...statePanelMonitoring,
      daySelected: dateFormat(date, 'DD/MM/yyyy'),
    });

    this.setState(
      {
        daySelected: date,
      },
      async () => {
        await this.handleDataSchedule();
        this.handleDataClientsScheduleds();
      }
    );
  };

  render() {
    const {
      daySelected,
      dataSheduleSelected,
      dataSchedules,
      alerts,
      loading,
      clientsScheduleds,
      typeFilter,
      usuarioAtivo,
      empresaAtiva,
      lineClicked,
      noPermission,
    } = this.state;

    const { isMobile } = this.context;

    return (
      <>
        {noPermission &&
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", marginTop: "5rem" }}>
            <Labels style={{ color: "#000", fontSize: "1.2rem", fontWeight: "600" }}>O usuário não tem permissão para visualizar essa página</Labels>
          </div>
        }

        {!noPermission && (
          <>
            <Container className="kpiUserGroupedIndicator" style={{ minHeight: 'unset' }} isMobile={isMobile}>
              <TopBarInformation
                handleDataPerFilter={this.handleDataSchdulesPerFilter}
                alerts={alerts}
                data={dataSchedules}
                loading={loading}
                clientsData={clientsScheduleds}
                updateData={this.handleDataSchedule}
                date={daySelected}
                onChangeDate={this.onChangeDate}
                usuarioAtivo={usuarioAtivo}
                empresaAtiva={empresaAtiva}
                isMobile={isMobile}
              />

              {isMobile ? (
                <TableMonitoringMobile
                  forceLoading={loading}
                  onClickTable={this.handlePhotosSchedules}
                  data={dataSchedules}
                  lineClicked={lineClicked}
                  handleScheduleSearch={() => {
                    this.mounted = false;
                  }}
                />
              ) : (
                <TableMonitoring
                  forceLoading={loading}
                  onClickTable={this.handlePhotosSchedules}
                  data={dataSchedules}
                  lineClicked={lineClicked}
                  isMobile={isMobile}
                  handleScheduleSearch={() => {
                    this.mounted = false;
                  }}
                />
              )}

              {!isMobile && (
                <BottomMonitoring
                  dataSheduleSelected={dataSheduleSelected}
                  alerts={alerts}
                  loading={loading}
                  isMobile={isMobile}
                  typeFilter={typeFilter}
                />
              )}
            </Container>
          </>
        )}
      </>
    );
  }
}

export default withRouter(UsersUnGroupedIndicators);
