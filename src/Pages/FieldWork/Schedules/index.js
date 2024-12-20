import React, { Component } from 'react';
import {
  Container,
  Linha,
  DivDetalhe,
  Labels,
  RowFilter,
  ContentItem,
  ContentBodyCollapsible,
  ContainerModal,
} from './style';
import SaibRadioGroup from '../../../Components/Globals/SaibRadioGroup';
import DirectTituloJanela from '../../../Components/Globals/DirectTituloJanela';
import WaitScreen from '../../../Components/Globals/WaitScreen';
import Header from '../../../Components/System/Header';

import { Icon, Collapsible, CollapsibleItem, Chip, Checkbox, Modal, Button } from 'react-materialize';
import moment from 'moment';
import * as XLSX from 'xlsx';

import M from 'materialize-css';
import { getFromStorage } from '../../../services/auth';
import { alerta, dateFormat } from '../../../services/funcoes';
import api from '../../../services/api';
import LeftBar from '../../../Components/FieldWork/Schedules/LeftBar';
import SaibCalendar from '../../../Components/Globals/SaibCalendar';
import SchedulesContext, { SchedulesProvider } from '../../../providers/schedules';
import { withRouter } from 'react-router';
import { Dialog } from '../../../Components/Globals/Dialog';
import SelectQuery from '../../../Components/Globals/SelectQuery';
import { ContentDate, Line } from '../Schedule/style';
import DatePicker from 'react-datepicker';
import ptBR from 'date-fns/locale/pt-BR';
import { forwardRef } from 'react';
import * as Yup from 'yup';
import TabelaAgendamentos from './ScheduleTable';
import { setLocalObject } from '../../../services/databaseLocal';

class SchedulesComponent extends Component {
  static contextType = SchedulesContext;

  state = {
    loading: true,
    startDate: null,
    endDate: null,
    promotoresSelecionados: [],
    supervisoresSelecionados: [],
    filterTypeSchedule: '2',
    dateSelected: new Date(),
    idsEmployeesSelected: [],
    dataOnlyManager: false,
    dataOnlySupervision: false,
    typeCalendar: '0',
    updateSchedule: false,
    errorImportCalendar: null,
    dialogError: false,
    scheduleType: 0,
    fluxoPromotoresSelecionados: '',
    fluxoSupervisoresSelecionados: '',
    lastUpdate: 0,
    supervisoresSelecionadosDel: '',
    promotoresSelecionadosDel: '',
    errors: {},
    startDateDel: null,
    endDateDel: null,
    customSelectedInitial: 0,
    customSelectedEnd: 0,
    filteredScheduleDel: [],
    selectedRows: [],
    selectAll: false,
    renderConfirmExcludeModal: false,
    renderModels: false,
    promotores: [],
    supervisores: [],
  };

  refSelectQueryProfessional = React.createRef(null);

  refSelectQueryFluxo = React.createRef(null);

  deleteAppointments = async () => {
    try {
      for (const gaaId of this.state.selectedRows) {
        await api.delete(`/v1/schedule/${this.state.empresaAtiva}/${this.state.usuarioAtivo}/${gaaId}`); // Endpoint para exclusão
      }
      this.getFilteredSchedule();

      this.setState({ filteredScheduleDel: [] });
      this.loadSchedules();
      this.setState({ renderConfirmExcludeModal: false });
    } catch (error) {
      alerta(error.message);
    }
  };

  handleRowSelect = (id) => {
    const { selectedRows } = this.state;
    const index = selectedRows.indexOf(id);

    if (index === -1) {
      this.setState({
        selectedRows: [...selectedRows, id],
      });
    } else {
      this.setState({
        selectedRows: [...selectedRows.slice(0, index), ...selectedRows.slice(index + 1)],
      });
    }
  };

  handleAllRowsSelect = (data) => {
    const { selectAll } = this.state;

    if (!selectAll) {
      let ids = data.map((item) => item.GAA_ID);
      this.setState({
        selectedRows: ids,
        selectAll: true,
      });
    } else {
      this.setState({
        selectedRows: [],
        selectAll: false,
      });
    }
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

  cleanOptionsSelectedSelectQuery = () => {
    this.refSelectQueryProfessional.current.deleteOptionsSelected(false);
    this.refSelectQueryFluxo.current.deleteOptionsSelected(false);
  };

  handleChangeUpdateScreen = () => {
    let { lastUpdate } = this.state;
    lastUpdate += 1;
    this.setState({ lastUpdate });
  };

  onChangeTipoAgendamento = (e) => {
    this.setState({
      scheduleType: parseInt(e),
      fluxoPromotoresSelecionados: '',
      fluxoSupervisoresSelecionados: '',
    });
    this.handleChangeUpdateScreen();

    //this.cleanOptionsSelectedSelectQuery();
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

  handleManipulaSupervisoresDel = (supervisoresSelecionadosDel) => {
    if (supervisoresSelecionadosDel) {
      this.setState({ supervisoresSelecionadosDel });
    }
  };

  // handleManipulaSupervisoresDel = (promotoresSelecionadosDel) => {
  //   if (promotoresSelecionadosDel) {
  //     this.setState({ promotoresSelecionadosDel });
  //   }
  // };

  handleManipulaSupervisores = (supervisoresSelecionados) => {
    if (supervisoresSelecionados) {
      this.setState({ supervisoresSelecionados }, () => {
        this.handleValidationUnicField('supervisoresSelecionados', 'errors');
      });
      this.handleChangeUpdateScreen();
      this.setState({
        clientesSelecionados: [],
      });
    } else {
      this.setState({ supervisoresSelecionados: '' }, () => {
        this.handleValidationUnicField('supervisoresSelecionados', 'errors');
      });
      this.handleChangeUpdateScreen();
      this.setState({
        clientesSelecionados: [],
      });
    }
  };

  verifyDateIsLessThanDateInitial = (date) => {
    const { startDateDel } = this.state;

    let date_ = moment(dateFormat(date, 'DD/MM/yyyy'), 'DD.MM.YYYY');

    let dateInitial = moment(dateFormat(startDateDel, 'DD/MM/yyyy'), 'DD.MM.YYYY');

    return date_.isBefore(dateInitial);
  };

  handleLoadCustomDataEnd = async (customSelectedEnd) => {
    customSelectedEnd = moment(customSelectedEnd).set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    })._d;
    this.setState({ loading: true });
    const dateFinalIsLessThanDateInitial = this.verifyDateIsLessThanDateInitial(customSelectedEnd);
    if (!dateFinalIsLessThanDateInitial) {
      this.setState({
        endDateDel: customSelectedEnd,
      });
    } else {
      alerta('Data menor que a data inicial, verifique', 0);
    }
    this.setState({ loading: false, clientesSelecionadosDel: [] });
  };

  handleLoadCustomDataInitial = async (customSelectedInitial) => {
    const { today } = this.state;
    if (customSelectedInitial < today) {
      alerta('Data menor que a data atual, verifique');
    } else {
      customSelectedInitial = moment(customSelectedInitial).set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      })._d;
      this.setState({ loading: true });
      this.setState({
        startDateDel: customSelectedInitial,
      });
      this.setState({ loading: false, clientesSelecionadosDel: [] });
    }
  };

  setDatesSelected = () => {
    let { startDateDel, endDateDel } = this.state;

    let startDate_ = moment(startDateDel, 'DD/MM/YYYY')._d;
    let endDate_ = moment(endDateDel, 'DD/MM/YYYY')._d;

    if (startDate_ && endDate_) {
      let dateInterval = [];
      dateInterval.push(moment(startDate_, 'DD/MM/YYYY')._d);

      while (startDate_ < endDate_) {
        startDate_.setDate(startDate_.getDate() + 1);
        dateInterval.push(moment(startDate_, 'DD/MM/YYYY')._d);
      }

      let dates = [];
      dateInterval.forEach((dateInterval_) => {
        let date = {};
        date.idClientsSelecteds = [];
        date.label = dateFormat(dateInterval_);
        dates.push(date);
      });

      if (dates.length === 0) {
        alerta('Data(s) invalidas para agendamento, verifique');
      }
      this.setState({
        allDatesSelected: dates,
        datesSelected: dates,
        // clientesSelecionados: [],
      });
    }
  };

  initCustomDatesDel = () => {
    const endOfWeek = moment();
    const startOfWeek = moment();
    let startDateDel = startOfWeek.toDate();
    let endDateDel = endOfWeek.toDate();
    startDateDel = moment(startDateDel).set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    })._d;
    endDateDel = moment(endDateDel).set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    })._d;

    this.setState(
      {
        startDateDel,
        endDateDel,
      },
      () => this.setDatesSelected()
    );
  };

  getFilteredSchedule = async () => {
    if (this.state.promotoresSelecionadosDel === '' && this.state.supervisoresSelecionadosDel === '') {
      return alerta('Selecione um supervisor ou promotor para realizar a busca!');
    }
    const scheduleData = await api.post(`v1/schedule/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`, {
      usuarioAgenda: this.state.promotoresSelecionadosDel || this.state.supervisoresSelecionadosDel,
      status: '1',
      dataInicial: moment(this.state.startDateDel).format('DD/MM/YYYY'),
      dataFinal: moment(this.state.endDateDel).format('DD/MM/YYYY'),
    });
    this.setState({ filteredScheduleDel: scheduleData.data.data });
    if (scheduleData.data.data.length === 0) {
      alerta('Nenhum agendamento encontrado para o periodo');
    }
  };

  componentDidMount = async () => {
    const { typeCalendar, updateSchedule, setTypeCalendar, setDateSelected, setExpandedCollapsibleCalendarLeftBar } =
      this.context;
    await this.carregarVariaveisEstado();
    // this.setState({
    // loading: true,
    // updateSchedule,
    // });
    const typeCalendarProps = this.props.location.state?.typeCalendar;
    const dateSelectedProps = this.props.location.state?.dateSelected;
    const collpasibleCalendarLeftBarExpanded = this.props.location.state?.dateSelected;
    if (typeCalendarProps) {
      setExpandedCollapsibleCalendarLeftBar(collpasibleCalendarLeftBarExpanded);
      await setTypeCalendar(typeCalendarProps);
      await setDateSelected(dateSelectedProps);
      await this.handleManagers();
      await this.loadSupervisoresAndPromotores();

      if (typeCalendarProps === '0') {
        this.setState(
          {
            startDate: dateSelectedProps,
            endDate: dateSelectedProps,
          },
          async () => await this.loadSchedules()
        );
      }
    } else {
      await this.setDates();
      await this.loadSchedules();
      await this.loadSupervisoresAndPromotores();
      await this.initCustomDatesDel();
      await this.handleManagers();
      this.setState({
        typeCalendar,
        updateSchedule,
      });
    }
  };

  async componentDidUpdate() {
    const { typeCalendar, updateSchedule } = this.context;
    if (this.state.typeCalendar !== typeCalendar) {
      this.setState(
        {
          loading: true,
          typeCalendar,
        },
        async () => {
          await this.setDates();
        }
      );
    }

    if (updateSchedule !== this.state.updateSchedule) {
      this.setState({
        updateSchedule,
      });

      await this.loadSchedules();
    }
  }

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();

    const url = `v1/users/${sessao.empresaId}`;
    try {
      const res = await api.get(url);
      const { data, sucess } = res.data;
      if (sucess) {
        const promoters = data.filter((user) => user.USR_GMOVEL_PROMOTOR === 'V');
        const supervisors = data.filter((user) => user.USR_GMOVEL_SUPERVISOR === 'V');
        this.setState({
          promotores: promoters,
          supervisores: supervisors,
        });
      } else {
        alerta('Erro ao carregar supervisores e promotores');
      }
    } catch (errors) {
      alerta('Erro ao carregar supervisores e promotores');
    }
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      empresaCnpj: sessao.empresaCnpj,
      gupFlagAgenda: sessao.gupFlagAgenda,
    });
  };

  setDates = async () => {
    const { typeCalendar, dateSelected } = this.context;
    const lastDay = moment(dateSelected).daysInMonth();
    const firstDay = lastDay / lastDay;
    if (typeCalendar === '0') {
      this.setState(
        {
          data: [],
          startDate: dateSelected,
          endDate: dateSelected,
        },
        async () => {
          await this.loadSchedules();
          this.handleSchedulesPerDate();
        }
      );
    } else {
      this.setState(
        {
          data: [],
          startDate: moment(dateSelected).date(firstDay)._d,
          endDate: moment(dateSelected).date(lastDay)._d,
        },
        async () => await this.loadSchedules()
      );
    }
  };

  onChangeCalendarLeftBar = async (date) => {
    const { setDayOfMonthSelectedData, typeCalendar } = this.context;
    this.setState({
      loading: true,
    });
    if (typeCalendar === '0') {
      await this.loadSchedules();
      this.setState({
        startDate: date,
        endDate: date,
      });
    }

    let res;

    await this.loadSchedules();

    Object.keys(this.state.allData).forEach((key) => {
      if (parseInt(this.state.allData[key].day) === moment(date).date()) {
        res = this.state.allData[key].data;
      }
    });
    res ? await setDayOfMonthSelectedData(res) : await setDayOfMonthSelectedData([]);
  };

  handleChangePeriod = async (year, month, day) => {
    const { startDate, endDate } = this.state;
    const { typeCalendar } = this.context;
    if (typeCalendar === '0') {
      startDate &&
        endDate &&
        this.setState(
          {
            startDate: moment(startDate).month(month).year(year).date(day)._d,
            endDate: moment(endDate).month(month).year(year).date(day)._d,
          },
          async () => await this.loadSchedules()
        );
    } else
      startDate &&
        endDate &&
        this.setState(
          {
            startDate: moment(startDate).month(month).year(year)._d,
            endDate: moment(endDate).month(month).year(year)._d,
          },
          async () => await this.loadSchedules()
        );
  };

  loadSupervisoresAndPromotores = async () => {
    const { usuarioAtivo, gupFlagAgenda } = this.state;
    const url = `v1/users/${this.state.empresaAtiva}`;
    try {
      const res = await api.get(url);
      const { data, sucess } = res.data;
      if (sucess) {
        let promoters = data.filter((user) => user.USR_GMOVEL_PROMOTOR === 'V');
        promoters = gupFlagAgenda === 1 ? promoters.filter((prom) => prom.USR_ID === usuarioAtivo) : promoters;
        const supervisors = data.filter((user) => user.USR_GMOVEL_SUPERVISOR === 'V');

        let promotoresChips = {};
        let supervisoresChips = {};
        for (let supervisor in supervisors) {
          let item = `${supervisors[supervisor].USR_ID} - ${supervisors[supervisor].USR_NOME}`;
          supervisoresChips[item] = null;
        }
        for (let promotor in promoters) {
          let item = `${promoters[promotor].USR_ID} - ${promoters[promotor].USR_NOME}`;
          promotoresChips[item] = null;
        }
        for (let promotor of promoters) {
          promotor.value = promotor.USR_ID;
          promotor.description = `${promotor.USR_ID - promotor.USR_NOME}`;
        }

        let allEmployees = supervisors.map((supervisor) => {
          supervisor.value = supervisor.USR_ID;
          supervisor.description = supervisor.USR_NOME;
          return supervisor;
        });

        allEmployees = allEmployees.concat(promoters);

        this.setState({
          promotores: promoters,
          supervisores: supervisors,
          promotoresChips,
          supervisoresChips,
          allEmployees,
        });
      } else {
        alerta('Erro ao carregar supervisores e promotores');
      }
    } catch (errors) {
      alerta('Erro ao carregar supervisores e promotores');
    }
  };

  loadSchedules = async () => {
    const { empresaAtiva, usuarioAtivo, startDate, endDate } = this.state;
    const { promotoresSelecionados, supervisoresSelecionados } = this.state;
    this.setState({
      loading: true,
    });
    try {
      this.setState({ loading: true });
      let url;
      url = '/v1/schedule/' + empresaAtiva + '/' + usuarioAtivo;
      let data = { dataInicial: dateFormat(startDate, 'DD/MM/yyyy'), dataFinal: dateFormat(endDate, 'DD/MM/yyyy') };

      await api.post(url, data).then((retorno) => {
        if (retorno.data && retorno.data.sucess) {
          // setTimeout(() => {
          let schedules = retorno.data.data;
          let allSchedules = retorno.data.data;
          this.setState({ schedules, allSchedules, loading: false }, async () => {
            await this.prepareLists();
            this.handleSchedulesPerDate();
          });
          // }, 500);
        }
      });
    } catch (err) {
      alerta('Erro ao carregar os agendamentos =>' + err, 2);
      this.setState({ loading: false });
    } finally {
      if (promotoresSelecionados.length > 0 || supervisoresSelecionados.length > 0)
        this.handleSchedulesPerSupervisorOrPromoter();
      this.setState({
        loading: false,
      });
    }
  };

  prepareLists = async () => {
    this.setState({ loading: true });
    let agendado = [];
    let pausado = [];
    let executado = [];
    let cancelado = [];
    let finalizado = [];
    // Status agendamento (-2 Cancelado | 0 Novo/Não agendado | 1 Agendado | 2- Executado)
    for (const schedule of this.state.schedules) {
      if (schedule.GAA_FLG_STATUS === -2) {
        cancelado.push(schedule);
      }
      if (schedule.GAA_FLG_STATUS === 1) {
        agendado.push(schedule);
      }
      if (schedule.GAA_FLG_STATUS === -1) {
        pausado.push(schedule);
      }
      if (schedule.GAA_FLG_STATUS === 2) {
        executado.push(schedule);
      }
      if (schedule.GAA_FLG_STATUS === 3) {
        finalizado.push(schedule);
      }
    }

    let groupings = this.state.schedules.reduce((r, a) => {
      r[a.GAA_DTA_AGENDA] = [...(r[a.GAA_DTA_AGENDA] || []), a];

      return r;
    }, {});

    Object.keys(groupings).forEach((key) => {
      const auxData = [...groupings[key]];
      let justificado = 0;
      let finalizados = 0;
      let atendendo = 0;
      let totAgendamentos = 0;
      let aguardando = 0;

      auxData.forEach((data) => {
        totAgendamentos += data.CLIENTES.length;
        data.CLIENTES.forEach((cliente) => {
          if (cliente.ATENDIDO) {
            finalizados += 1;
          } else if (cliente.EM_ATENDIMENTO) {
            atendendo += 1;
          } else if (cliente.JUSTIFICADO) {
            justificado += 1;
          }
        });
      });

      aguardando = totAgendamentos - justificado - finalizados - atendendo;

      auxData.analytics = [
        { label: 'Finalizados', value: finalizados },
        { label: 'Atendendo', value: atendendo },
        { label: 'Justificados', value: justificado },
        { label: 'Aguardando', value: aguardando },
        { label: 'Tot. agendados', value: totAgendamentos },
      ];

      groupings[key] = {
        data: auxData,
        day: parseInt(key.substr(0, 2)),
        month: parseInt(key.substr(3, 5)) - 1,
      };
    });

    this.setState({
      data: groupings,
      allData: groupings,
    });

    this.setState(
      {
        cancelado,
        pausado,
        agendado,
        executado,
        finalizado,
        loading: false,
      }
      // () => {
      //   if (typeCalendar === '0') {
      //     this.handleSchedulesPerDate();
      //   }
      // }
    );
  };

  setSchedulesPerFilter = async (useSchedules = false) => {
    const { optionFilterSituation, filterTypeSchedule, allSchedules, schedules } = this.state;
    this.setState({
      loading: true,
    });

    let status;
    let type;
    let response = useSchedules ? schedules.map((schedule) => schedule) : allSchedules.map((schedule) => schedule);

    switch (optionFilterSituation) {
      case '1':
        status = 1;
        break;
      case '2':
        status = 2;
        break;
      case '-1':
        status = -1;
        break;
      case '-2':
        status = -2;
        break;

      default:
        break;
    }
    switch (filterTypeSchedule) {
      case '1':
        type = 1;
        break;
      case '0':
        type = 0;
        break;
      default:
        break;
    }

    if (status !== undefined) {
      response = useSchedules
        ? schedules.filter((schedule) => schedule.GAA_FLG_STATUS === status && schedule)
        : allSchedules.filter((schedule) => schedule.GAA_FLG_STATUS === status && schedule);
    }
    if (type !== undefined) {
      response = response.filter((schedule) => schedule.TIPO === type && schedule);
    }

    this.setState(
      {
        schedules: response,
        loading: false,
      },
      () => {
        this.prepareLists();
      }
    );
  };

  handleSchedulesPerDate = () => {
    const { typeCalendar, dateSelected } = this.context;
    const { startDate, endDate, allSchedules, idsEmployeesSelected } = this.state;

    this.setState({
      loading: true,
    });
    let startDate_ = moment(dateFormat(startDate, 'DD/MM/yyyy'), 'DD.MM.YYYY');
    let endDate_ = moment(dateFormat(endDate, 'DD/MM/yyyy'), 'DD.MM.YYYY');

    if (typeCalendar === '0') {
      startDate_ = moment(dateFormat(dateSelected, 'DD/MM/yyyy'), 'DD.MM.YYYY');
      endDate_ = moment(dateFormat(dateSelected, 'DD/MM/yyyy'), 'DD.MM.YYYY');
    }
    const newSchedules = [];
    if (allSchedules) {
      allSchedules.forEach((schedule) => {
        let dateSchedule = moment(schedule.GAA_DTA_AGENDA, 'DD.MM.YYYY');

        if (typeCalendar === '0') {
          if (dateSchedule.isSame(startDate_)) {
            if (idsEmployeesSelected.length > 0) {
              for (let id of idsEmployeesSelected) {
                if (parseInt(id) === schedule.GAA_USR_ID_AGENDA) {
                  newSchedules.push(schedule);
                }
              }
            } else {
              newSchedules.push(schedule);
            }
          }
        } else if (dateSchedule.isSameOrAfter(startDate_) && dateSchedule.isSameOrBefore(endDate_)) {
          if (idsEmployeesSelected.length > 0) {
            for (let id of idsEmployeesSelected) {
              if (parseInt(id) === schedule.GAA_USR_ID_AGENDA) {
                newSchedules.push(schedule);
              }
            }
          } else {
            newSchedules.push(schedule);
          }
        }
      });
    }

    this.setState(
      {
        schedules: newSchedules,
        loading: false,
      },
      () => {
        this.prepareLists(true);
      }
    );
  };

  handleSchedulesPerSupervisorOrPromoter = () => {
    const { allSchedules, idUser } = this.state;
    let newSchedules = [];
    allSchedules.forEach((schedule) => {
      if (schedule.GAA_USR_ID_AGENDA === parseInt(idUser)) {
        newSchedules.push(schedule);
      }
    });
    this.setState(
      {
        schedules: parseInt(idUser) > 0 ? newSchedules : allSchedules,
      },
      () => this.prepareLists()
    );
  };

  handleManagers = async () => {
    try {
      const res = await api.post(`v1/tradeteam/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`);

      const { sucess, data } = res.data;
      if (sucess) {
        const managers = [];
        for (let item of data) {
          if (item.GET_COD_GERENTE && item.GET_COD_GERENTE !== '0') {
            managers.push(item);
          }
        }
        let managersChips = {};
        for (let manager in managers) {
          let item = managers[manager].GET_DESCR_GERENTE;
          managersChips[item] = null;
        }

        this.setState({
          managersChips,
          managers,
        });
      }
    } catch (error) {}
  };

  handleSchedulesPerSupervision = () => {
    const { idUser, managers, allSchedules, dataOnlySupervision, supervisoresSelecionados } = this.state;
    const { setDayOfMonthSelectedData } = this.context;
    setDayOfMonthSelectedData([]);
    if (!dataOnlySupervision) {
      const tradeOfSupervision = managers.find((item) => parseInt(item.GET_COD_SUPERVISOR) === parseInt(idUser));

      if (tradeOfSupervision) {
        const keys = ['GET_COD_GERENTE', 'GET_COD_PROMOTOR', 'GET_COD_SUPERVISOR'];
        const idsUsersOfTradeSelected = [];

        tradeOfSupervision &&
          Object.keys(tradeOfSupervision).forEach((key) => {
            if (keys.includes(key)) {
              idsUsersOfTradeSelected.push(parseInt(tradeOfSupervision[key]));
            }
          });

        const schedulesOfTrade = [];

        idsUsersOfTradeSelected.forEach((id) => {
          allSchedules.forEach((schedule) => {
            schedule.GAA_USR_ID_AGENDA === id && schedulesOfTrade.push(schedule);
          });
        });

        this.setState(
          {
            schedules: tradeOfSupervision ? schedulesOfTrade : allSchedules,
          },
          async () => await this.prepareLists()
        );
      } else {
        this.setState(
          {
            schedules: [],
          },
          async () => (supervisoresSelecionados.length > 0 ? await this.prepareLists() : await this.loadSchedules())
        );
      }
    } else {
      const schedulesOfManager = [];
      allSchedules.forEach((schedule) => {
        parseInt(schedule.GAA_USR_ID_AGENDA) === parseInt(idUser) && schedulesOfManager.push(schedule);
      });

      this.setState(
        {
          schedules: idUser ? schedulesOfManager : allSchedules,
        },
        () => this.prepareLists()
      );
    }
  };

  handleSchedulesPerTradeManager = () => {
    const { idUser, managers, allSchedules, dataOnlyManager } = this.state;
    const { setDayOfMonthSelectedData } = this.context;
    setDayOfMonthSelectedData([]);
    if (!dataOnlyManager) {
      const tradeOfManager = managers.find((item) => parseInt(item.GET_COD_GERENTE) === parseInt(idUser));
      const keys = ['GET_COD_GERENTE', 'GET_COD_PROMOTOR', 'GET_COD_SUPERVISOR'];
      const idsUsersOfTradeSelected = [];

      tradeOfManager &&
        Object.keys(tradeOfManager).forEach((key) => {
          if (keys.includes(key)) {
            idsUsersOfTradeSelected.push(parseInt(tradeOfManager[key]));
          }
        });

      const schedulesOfTrade = [];

      idsUsersOfTradeSelected.forEach((id) => {
        allSchedules.forEach((schedule) => {
          schedule.GAA_USR_ID_AGENDA === id && schedulesOfTrade.push(schedule);
        });
      });

      this.setState(
        {
          schedules: tradeOfManager ? schedulesOfTrade : allSchedules,
        },
        async () => this.handleSchedulesPerDate()
      );
    } else {
      const schedulesOfManager = [];
      allSchedules.forEach((schedule) => {
        parseInt(schedule.GAA_USR_ID_AGENDA) === parseInt(idUser) && schedulesOfManager.push(schedule);
      });

      this.setState(
        {
          schedules: idUser ? schedulesOfManager : allSchedules,
        },
        () => this.handleSchedulesPerDate()
      );
    }
  };

  handleManipulaSupervisores = () => {
    if (document.getElementById('supervisoresChips') !== undefined) {
      let dados = M.Chips.getInstance(document.getElementById('supervisoresChips'));
      let supervisoresSelecionados;
      if (dados !== undefined) {
        supervisoresSelecionados = dados.chipsData;
        if (supervisoresSelecionados.length > 0) {
          let idUser = supervisoresSelecionados[0].tag.split('-')[0];
          this.setState({
            idUser,
          });
        } else {
          this.setState({
            idUser: '',
            dataOnlySupervision: false,
          });
          supervisoresSelecionados = [];
        }
      }

      this.setState({ supervisoresSelecionados, dateSelected: '' }, () => this.handleSchedulesPerSupervision());
      // this.handleChangeUpdateScreen();
    }
  };

  handleManipulaPromotores = () => {
    if (document.getElementById('promotoresChips') !== undefined) {
      let dados = M.Chips.getInstance(document.getElementById('promotoresChips'));
      let promotoresSelecionados;
      if (dados !== undefined) {
        promotoresSelecionados = dados.chipsData;
        if (promotoresSelecionados.length > 0) {
          let idUser = promotoresSelecionados[0].tag.split('-')[0];
          this.setState({
            idUser,
          });
        } else {
          this.setState({
            idUser: '',
          });
          promotoresSelecionados = [];
        }
      }

      this.setState({ promotoresSelecionados, dateSelected: '' }, () => this.handleSchedulesPerSupervisorOrPromoter());
      // this.handleChangeUpdateScreen();
    }
  };

  handleManipulaTradeManager = () => {
    if (document.getElementById('managerChips') !== undefined) {
      let dados = M.Chips.getInstance(document.getElementById('managerChips'));
      let tradeManagerSelected;
      if (dados !== undefined) {
        tradeManagerSelected = dados.chipsData;
        if (tradeManagerSelected.length > 0) {
          let idUser = tradeManagerSelected[0].tag.split('-')[0];
          this.setState({
            tradeManagerSelected,
            idUser,
          });
        } else {
          this.setState({
            idUser: '',
            dataOnlyManager: false,
          });
        }
      } else {
        tradeManagerSelected = [];
      }

      this.setState({ tradeManagerSelected, dateSelected: '' }, () => this.handleSchedulesPerTradeManager());
      // this.handleChangeUpdateScreen();
    }
  };

  initCustomDates = () => {
    this.setState({
      startDate: new Date(),
      endDate: new Date(),
    });
  };

  cleanFilter = () => {
    this.setState({
      promotoresSelecionados: [],
      tradeManagerSelected: [],
      supervisoresSelecionados: [],
      dataOnlyManager: false,
      dataOnlySupervision: false,
    });
  };

  gerarAgendamentos = (array) => {
    const diasSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
    const hoje = new Date();
    const diaAtualIndex = hoje.getDay();

    function calcularProximaData(diaSemanaIndex, diaAtualIndex, dataBase) {
      let deltaDias = diaSemanaIndex - diaAtualIndex;
      if (deltaDias <= 0) {
        deltaDias += 7;
      }
      const proximaData = new Date(dataBase);
      proximaData.setDate(proximaData.getDate() + deltaDias);
      return proximaData;
    }

    function formatarData(data) {
      const dia = data.getDate();
      const mes = data.getMonth() + 1;
      const ano = data.getFullYear() % 100;
      return `${mes}/${dia}/${ano}`;
    }

    const resultado = [];
    array.forEach((obj) => {
      diasSemana.forEach((dia, index) => {
        if (obj[dia] === 'X' || obj[dia] === 'x') {
          const proximaData = calcularProximaData(index, diaAtualIndex, hoje);
          const novoObjeto = {
            ...obj,
            data: formatarData(proximaData),
          };
          diasSemana.forEach((d) => delete novoObjeto[d]);
          resultado.push(novoObjeto);
        }
      });
    });
    return resultado;
  };

  agruparAgendamentos = (agendamentos) => {
    const agrupado = agendamentos.reduce((acc, item) => {
      const chave = `${item.id}-${item.DATA}`;

      if (!acc[chave]) {
        acc[chave] = { ...item, CLI: item.CLI };
      } else {
        acc[chave][`CLI${Object.keys(acc[chave]).length}`] = item.CLI;
      }

      return acc;
    }, {});

    const resultado = Object.values(agrupado);

    return resultado;
  };

  validateArrayFormatModel1 = (arr) => {
    const expectedKeys = ['FLUXO', 'DATA', 'CLI', 'CLI2', 'CLI3', 'CLI4'];
    const expectedTypes = {
      FLUXO: 'string',
      DATA: 'string',
    };

    function isNumericString(value) {
      return typeof value === 'string' && /^\d+$/.test(value);
    }
    function validateObjectFormat(obj) {
      const objKeys = Object.keys(obj);
      if (Object.keys(obj).filter((header) => isNumericString(header)).length !== 1) {
        return false;
      }

      for (let key of expectedKeys) {
        if (typeof key !== 'number' && !key.includes('CLI')) {
          if (!objKeys.includes(key)) {
            return false;
          }

          if (typeof obj[key] !== expectedTypes[key]) {
            return false;
          }
        }
      }

      for (let key of objKeys) {
        if (/^CLI\d*$/.test(key)) {
          if (!isNumericString(obj[key])) {
            return false;
          }
        }
      }

      return true;
    }

    for (let item of arr) {
      if (!validateObjectFormat(item)) {
        return false;
      }
    }
    return true;
  };

  validateArrayFormatModel2 = (arr) => {
    const expectedKeys = ['id', 'FLUXO', 'DATA'];
    const expectedTypes = {
      id: 'string',
      FLUXO: 'string',
      DATA: 'string',
    };

    function isNumericString(value) {
      return typeof value === 'string' && /^\d+$/.test(value);
    }

    function validateObjectFormat(obj) {
      const objKeys = Object.keys(obj);

      for (let key of expectedKeys) {
        if (!objKeys.includes(key)) {
          return false;
        }

        if (key === 'id' && !isNumericString(obj[key].replace(/\s+/g, ''))) {
          return false;
        }

        if (key !== 'id' && typeof obj[key] !== expectedTypes[key]) {
          return false;
        }
      }

      for (let key of objKeys) {
        if (/^CLI\d*$/.test(key)) {
          if (!isNumericString(obj[key].replace(/\s+/g, ''))) {
            return false;
          }
        }
      }

      return true;
    }

    for (let item of arr) {
      if (!validateObjectFormat(item)) {
        return false;
      }
    }

    return true;
  };

  handleUpdloadFile = (e) => {
    const { promotores } = this.state;
    this.setState({
      loading: true,
    });
    setTimeout(async () => {
      try {
        const file = e.target.files[0];
        let resultJson = null;
        const reader = new FileReader();
        const rABS = !!reader.readAsBinaryString;

        reader.onload = (e) => {
          /* Parse data */
          const bstr = e.target.result;
          const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array', bookVBA: true });
          /* Get first worksheet */
          const wsname = wb.SheetNames[0];

          resultJson = XLSX.utils.sheet_to_json(wb.Sheets[wsname], {
            raw: false,
            dateNF: 'DD/MM/YYYY',
          });
        };

        if (file) {
          if (rABS) {
            reader.readAsBinaryString(file);
          } else {
            reader.readAsArrayBuffer(file);
          }
          setTimeout(async () => {
            if (resultJson) {
              const expectedHeadersModel1 = ['FLUXO', 'DATA', 'CLI'];
              const expectedHeadersModel2 = ['codigo', 'fantasia', 'bairro', 'cidade', 'promotor', 'nome', 'vendedor'];

              const actualHeaders = Object.keys(resultJson[0]);

              const isValid = Object.keys(resultJson[0]).includes('cidade')
                ? expectedHeadersModel2.every((header) => actualHeaders.includes(header))
                : expectedHeadersModel1.every((header) => actualHeaders.includes(header));


              if (!isValid) {
                this.setState({ loading: false });
                return alerta('Formato inválido: Os cabeçalhos do arquivo não correspondem aos esperados.');
              }

              if (Object.keys(resultJson[0]).includes('cidade')) {
                const agendamentos = this.gerarAgendamentos(resultJson);
                const agendamentosFormatados = agendamentos.map((agd) => {
                  return {
                    id: agd.promotor,
                    FLUXO:
                      promotores.filter((prom) => prom.USR_ID === Number(agd.promotor)).length > 0
                        ? 'promotor'
                        : 'supervisor',
                    DATA: agd.data,
                    CLI: agd.codigo,
                  };
                });
                const agendamentosAgrupados = this.agruparAgendamentos(agendamentosFormatados);

                if (!this.validateArrayFormatModel2(agendamentosAgrupados)) {
                  this.setState({
                    loading: false,
                  });
                  return alerta('Formato inválido: Há colunas ou cabeçalhos com dados errados, confira os modelos!');
                }
                await setLocalObject('ManageSchedule', {
                  file: file.name,
                  data: agendamentosAgrupados,
                });
                return this.props.history.push({
                  pathname: '/ManageSchedule',
                  state: agendamentosAgrupados,
                });
              }
              if (!this.validateArrayFormatModel1(resultJson)) {
                this.setState({
                  loading: false,
                });
                return alerta('Formato inválido: Há colunas ou cabeçalhos com dados errados, confira os modelos!');
              }

              await setLocalObject('ManageSchedule', {
                file: file.name,
                data: resultJson,
              });
              this.props.history.push({
                pathname: '/ManageSchedule',
                state: resultJson,
              });
            }
          }, 1000);

          // const formData = new FormData();
          // formData.append('file', file);
          // const config = {
          //   headers: {
          //     'Content-Type': 'application/x-www-form-urlencoded',
          //   },
          // };
          // const res = await api.post('/v1/upload/local/excel', formData, config);

          // const { data } = res.data;
          // this.importSchedule(data);
          // document.getElementById('newFile').value = '';
        }
      } catch (error) {
        alerta(error.message, 2);
        this.setState({
          loading: false,
        });
      }
    }, 200);
  };

  make_cols = (refstr) => {
    let o = [],
      C = XLSX.utils.decode_range(refstr).e.c + 1;
    for (var i = 0; i < C; ++i) o[i] = { name: XLSX.utils.encode_col(i), key: i };
    return o;
  };

  importSchedule = async (filename) => {
    try {
      const response = await api.post(`v1/schedule/import/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`, {
        filename,
      });

      const { message } = response.data;
      alerta(message, 1);
      this.setState({
        errorImportCalendar: null,
      });
      window.location.reload(true);
    } catch (error) {
      this.setState({
        errorImportCalendar: error.response.data.error,
        dialogError: true,
      });
      alerta(error.response.data.message, 2);
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  readExcel = async (model) => {
    const file =
      model === 1
        ? [
            {
              FLUXO: 'PROMOTOR',
              'ID DO FLUXO (INSIRA O CÓDIGO AQUI)': 1895,
              DATA: '25/02/2023',
              CLI: 9999999,
              CLI2: 9999999,
            },
            {
              FLUXO: 'PROMOTOR',
              'ID DO FLUXO (INSIRA O CÓDIGO AQUI)': 1895,
              DATA: '25/02/2023',
              CLI: 5684004,
              CLI2: 5812525,
            },
            {
              FLUXO: 'PROMOTOR',
              'ID DO FLUXO (INSIRA O CÓDIGO AQUI)': 1895,
              DATA: '25/02/2023',
              CLI: 5812523,
              CLI2: 5812526,
            },
            {
              FLUXO: 'SUPERVISOR',
              'ID DO FLUXO (INSIRA O CÓDIGO AQUI)': 1895,
              DATA: '27/02/2023',
              CLI: 5812527,
              CLI2: 5812639,
            },
            {
              FLUXO: 'PROMOTOR',
              'ID DO FLUXO (INSIRA O CÓDIGO AQUI)': 1895,
              DATA: '27/02/2023',
              CLI: 5812635,
              CLI2: 5812640,
            },
            {
              FLUXO: 'PROMOTOR',
              'ID DO FLUXO (INSIRA O CÓDIGO AQUI)': 1895,
              DATA: '01/03/2023',
              CLI: 5812641,
              CLI2: 5705608,
            },
            {
              FLUXO: 'SUPERVISOR',
              'ID DO FLUXO (INSIRA O CÓDIGO AQUI)': 1895,
              DATA: '02/03/2023',
              CLI: 5705188,
              CLI2: 5705189,
            },
            {
              FLUXO: 'PROMOTOR',
              'ID DO FLUXO (INSIRA O CÓDIGO AQUI)': 1895,
              DATA: '02/03/2023',
              CLI: 5674933,
              CLI2: 5674935,
            },
          ]
        : [
            {
              codigo: '999999',
              fantasia: '99 - fantasia',
              endereço: 'RUA 99',
              bairro: 'BAIRRO 99',
              cidade: 'GOIANIA',
              seg: 'X',
              ter: 'X',
              qua: 'X',
              qui: 'X',
              sex: 'X',
              sab: 'X',
              promotor: 9999,
              nome: 'PROMOTOR',
              vendedor: 'VENDEDOR',
            },
            {
              codigo: '999999',
              fantasia: '99 - fantasia',
              endereço: 'RUA 99',
              bairro: 'BAIRRO 99',
              cidade: 'GOIANIA',
              seg: 'X',
              ter: 'X',
              qua: 'X',
              qui: 'X',
              sex: 'X',
              sab: 'X',
              promotor: 9999,
              nome: 'PROMOTOR',
              vendedor: 'VENDEDOR',
            },
            {
              codigo: '999999',
              fantasia: '99 - fantasia',
              endereço: 'RUA 99',
              bairro: 'BAIRRO 99',
              cidade: 'GOIANIA',
              seg: 'X',
              ter: 'X',
              qua: 'X',
              qui: 'X',
              sex: 'X',
              sab: 'X',
              promotor: 9999,
              nome: 'PROMOTOR',
              vendedor: 'VENDEDOR',
            },
            {
              codigo: '999999',
              fantasia: '99 - fantasia',
              endereço: 'RUA 99',
              bairro: 'BAIRRO 99',
              cidade: 'GOIANIA',
              seg: 'X',
              ter: 'X',
              qua: 'X',
              qui: 'X',
              sex: 'X',
              sab: 'X',
              promotor: 9999,
              nome: 'PROMOTOR',
              vendedor: 'VENDEDOR',
            },
          ];
    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.json_to_sheet(file);
    var wscols =
      model === 1
        ? [{ wch: 20 }, { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 }]
        : [
            { wch: 10 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 5 },
            { wch: 5 },
            { wch: 5 },
            { wch: 5 },
            { wch: 5 },
            { wch: 5 },
          ];

    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, `Modelo de agenda - ${model}`);

    XLSX.writeFile(wb, `Modelo de agenda - ${model}.xlsx`);
    this.setState({ renderModels: false });
  };

  schema = Yup.object().shape({
    startDateDel: Yup.date()
      .max(Yup.ref('endDate'), ({ min }) => 'Data inicial não pode ser maior que a data final')
      .required(),

    endDateDel: Yup.date().required('Campo obrigatório'),

    supervisoresSelecionadosDel: Yup.string().when('scheduleType', {
      is: (scheduleType) => scheduleType === 0,
      then: Yup.string().required('Campo obrigatório').min(1, 'Campo obrigatório'),
    }),
    fluxoSupervisoresSelecionadosDel: Yup.string().when('scheduleType', {
      is: (scheduleType) => scheduleType === 0,
      then: Yup.string().required('Campo obrigatório').min(1, 'Campo obrigatório'),
    }),
    promotoresSelecionadosDel: Yup.string().when('scheduleType', {
      is: (scheduleType) => scheduleType === 1,
      then: Yup.string().required('Campo obrigatório').min(1, 'Campo obrigatório'),
    }),
    fluxoPromotoresSelecionadosDel: Yup.string().when('scheduleType', {
      is: (scheduleType) => scheduleType === 1,
      then: Yup.string().required('Campo obrigatório').min(1, 'Campo obrigatório'),
    }),
  });

  render() {
    const {
      scheduleType,
      errorImportCalendar,
      dialogError,
      loading,
      filterTypeSchedule,
      dataOnlyManager,
      data,
      dataOnlySupervision,
      agendado,
      executado,
      finalizado,
      supervisoresSelecionadosDel,
      supervisores,
      promotores,
      errors,
      promotoresSelecionadosDel,
      startDateDel,
      endDateDel,
      customSelectedEnd,
      customSelectedInitial,
      filteredScheduleDel,
      selectedRows,
      selectAll,
      renderConfirmExcludeModal,
      renderModels,
    } = this.state;
    const { setOpenCard, setFilterSchedule } = this.context;

    return (
      <>
        <Header />
        <WaitScreen loading={loading} />
        <Container className="containerSearchs">
          <DirectTituloJanela
            urlVoltar={'/home'}
            urlNovo={'/schedule'}
            titulo={
              loading ? (
                'Aguarde...'
              ) : (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon>schedule</Icon>Agendas
                </span>
              )
            }
          />
          <Linha className="filter">
            <Collapsible
              accordion
              style={{
                width: '100%',
                borderStyle: 'none',
                boxShadow: 'none',
              }}
            >
              <CollapsibleItem expanded={false} header="Clique para filtrar" icon={<Icon>filter_list</Icon>} node="div">
                <ContentBodyCollapsible>
                  <RowFilter flex="4 !important">
                    <Linha className="rowOptions">
                      <ContentItem>
                        <SaibRadioGroup
                          valueItems={'"1","2", "3", "4" '}
                          classNameItems={'"new","running", "attended", "all"'}
                          textItems={'"Aguardando","Executando", "Atendido", "Todos"'}
                          idItems={'"new","running","attended", "all2"'}
                          classNameRadio="filterSituation"
                          flexDirectionRadio="row"
                          disabledRadio="false"
                          captionRadio="Situação agendamento"
                          defaultCheckedId={'all2'}
                          onChange={async (value) => {
                            await setOpenCard(false);
                            await setFilterSchedule(value);

                            this.setState(
                              {
                                optionFilterSituation: value,
                                dateSelected: '',
                              },
                              () => this.prepareLists()
                            );
                          }}
                        />
                      </ContentItem>
                      <ContentItem>
                        <SaibRadioGroup
                          valueItems={'"3", "0","1","2" '}
                          classNameItems={'"tradeOrManager", "supervisor","promoter","allTypes"'}
                          textItems={'"Equipe/gerente", "Supervisor","Promotor", "Todos"'}
                          idItems={'"tradeOrManager", "supervisor", "promoter", "all"'}
                          classNameRadio="filterTypeSchedule"
                          flexDirectionRadio="row"
                          disabledRadio="false"
                          captionRadio="Profissional agendamento"
                          defaultCheckedId={'all'}
                          onChange={async (value) => {
                            await setOpenCard(false);
                            this.setState(
                              {
                                loading: true,
                                dateSelected: '',
                                descriptionToFilter: '',
                                filterTypeSchedule: value,
                              },
                              () => {
                                this.prepareLists();
                                this.handleSchedulesPerTradeManager();
                                this.cleanFilter();
                              }
                            );
                          }}
                        />
                      </ContentItem>
                      <label htmlFor="newFile" className="saib-button is-primary input">
                        <Icon>attach_file</Icon>
                        Importar agenda
                      </label>

                      <input
                        style={{ display: 'none' }}
                        id="newFile"
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        onChange={(event) => this.handleUpdloadFile(event)}
                      />
                      <button
                        className="saib-button is-primary input"
                        onClick={(event) => this.setState({ renderModels: true })}
                      >
                        <Icon>file_download</Icon>Arquivo de modelo de agenda
                      </button>

                      {errorImportCalendar && (
                        <button
                          className="saib-button is-primary input"
                          onClick={() => this.setState({ dialogError: true })}
                        >
                          <Icon>search</Icon>
                          Mostrar erros da importação
                        </button>
                      )}
                    </Linha>
                  </RowFilter>
                </ContentBodyCollapsible>
                <DivDetalhe flex="1">
                  {filterTypeSchedule === '1' ? (
                    <>
                      <Labels>Promotor</Labels>
                      <Chip
                        id="promotoresChips"
                        className="promotoresChips"
                        close={false}
                        closeIcon={<Icon className="close">close</Icon>}
                        options={{
                          data: this.state.promotoresSelecionados ? this.state.promotoresSelecionados : [],
                          onChipAdd: this.handleManipulaPromotores,
                          onChipDelete: this.handleManipulaPromotores,
                          autocompleteOptions: {
                            data: this.state.promotoresChips,
                            limit: 1,
                            onAutocomplete: function noRefCheck() {},
                          },
                        }}
                      />
                    </>
                  ) : filterTypeSchedule === '0' ? (
                    <>
                      <Labels>Supervisor</Labels>
                      <Chip
                        id="supervisoresChips"
                        className="supervisoresChips"
                        close={false}
                        closeIcon={<Icon className="close">close</Icon>}
                        options={{
                          data: this.state.supervisoresSelecionados ? this.state.supervisoresSelecionados : [],
                          onChipAdd: this.handleManipulaSupervisores,
                          onChipDelete: this.handleManipulaSupervisores,
                          autocompleteOptions: {
                            data: this.state.supervisoresChips,
                            limit: 1,
                            onAutocomplete: function noRefCheck() {},
                          },
                        }}
                      />
                      <Checkbox
                        className="checkAll"
                        id={'Checkboxww'}
                        label="Dados somente deste profissional"
                        onChange={(ev) =>
                          this.setState(
                            {
                              dataOnlySupervision: dataOnlySupervision ? false : true,
                            },
                            () => this.handleSchedulesPerSupervision()
                          )
                        }
                        checked={dataOnlySupervision}
                        value=""
                      />
                    </>
                  ) : filterTypeSchedule === '3' ? (
                    <>
                      <Labels>Gerente</Labels>
                      <Chip
                        id="managerChips"
                        className="managerChips"
                        close={false}
                        closeIcon={<Icon className="close">close</Icon>}
                        options={{
                          data: this.state.tradeManagerSelected ? this.state.tradeManagerSelected : [],
                          onChipAdd: this.handleManipulaTradeManager,
                          onChipDelete: this.handleManipulaTradeManager,
                          autocompleteOptions: {
                            data: this.state.managersChips,
                            limit: 1,
                            onAutocomplete: function noRefCheck() {},
                          },
                        }}
                      />
                      <Checkbox
                        className="checkAll"
                        id={'Checkbox'}
                        label="Dados somente deste profissional"
                        onChange={(ev) =>
                          this.setState(
                            {
                              dataOnlyManager: dataOnlyManager ? false : true,
                            },
                            () => this.handleSchedulesPerTradeManager()
                          )
                        }
                        checked={dataOnlyManager}
                        value=""
                      />
                    </>
                  ) : (
                    ''
                  )}
                </DivDetalhe>
                {/* <DivDetalhe
                  style={{
                    width: '30%',
                  }}
                >
                  <SelectQuery
                    colorPrimary
                    query={promotores}
                    keys={['USR_ID', 'USR_NOME']}
                    label="USR_NOME"
                    onSelect={(value) => {
                      // console.log(value);
                    }}
                  />
                </DivDetalhe> */}
              </CollapsibleItem>
            </Collapsible>
          </Linha>

          <Linha className="filter">
            <Collapsible
              accordion
              style={{
                width: '100%',
                borderStyle: 'none',
                boxShadow: 'none',
              }}
            >
              <CollapsibleItem
                expanded={false}
                header="Clique para excluir agendamentos"
                icon={<Icon>delete_forever</Icon>}
                node="div"
              >
                <>
                  <Linha className="topLine">
                    <DivDetalhe flex={3} className="divTipoAtividade" style={{ minWidth: '350px', marginTop: '10px' }}>
                      <SaibRadioGroup
                        valueItems={'"0","1"'}
                        classNameItems={'"itemSupervisor","itemPromotor"'}
                        textItems={'"Supervisor","Promotor"'}
                        idItems={'"itemSupervisor","itemPromotor"'}
                        classNameRadio="TipoAgendamento"
                        flexDirectionRadio="row"
                        disabledRadio="false"
                        captionRadio={<>Agendar atividade para ?</>}
                        defaultCheckedId={scheduleType === 0 ? 'itemSupervisor' : 'itemPromotor'}
                        onChange={this.onChangeTipoAgendamento}
                      />
                    </DivDetalhe>
                    {scheduleType === 0 ? (
                      <DivDetalhe flex={3} style={{ minWidth: '350px' }}>
                        <Labels>Supervisor</Labels>
                        <SelectQuery
                          ref={this.refSelectQueryProfessional}
                          inputName="selectSupervisor"
                          itemSelected={supervisoresSelecionadosDel}
                          onChangeComponentIsExternal={false}
                          loading={false}
                          colorPrimary
                          query={supervisores}
                          keys={['USR_ID', 'USR_NOME']}
                          label="USR_NOME"
                          onChange={async () => {}}
                          onSelect={(item) => {
                            this.handleManipulaSupervisoresDel(item.USR_ID);
                          }}
                          onDelete={() => {
                            this.setState({ supervisoresSelecionadosDel: '' });
                          }}
                        />
                      </DivDetalhe>
                    ) : (
                      <DivDetalhe flex={3} style={{ minWidth: '350px' }}>
                        <Labels>Promotor</Labels>
                        <SelectQuery
                          ref={this.refSelectQueryProfessional}
                          inputName="selectPromoter"
                          onChangeComponentIsExternal={false}
                          loading={false}
                          colorPrimary
                          query={promotores}
                          itemSelected={promotoresSelecionadosDel}
                          keys={['USR_ID', 'USR_NOME']}
                          label="USR_NOME"
                          onChange={async () => {}}
                          onSelect={(item) => {
                            this.setState({ promotoresSelecionadosDel: item.USR_ID });
                          }}
                          onDelete={() => {
                            this.setState({ promotoresSelecionadosDel: '' });
                          }}
                        />

                        {errors && errors?.promotoresSelecionados && (
                          <span style={{ color: '#FF0000' }}>{errors.promotoresSelecionados}</span>
                        )}
                      </DivDetalhe>
                    )}
                    <ContentDate style={{ minWidth: '350px', marginTop: '10px' }}>
                      <Labels className="labelPeriodDate">Data/periodo para visita</Labels>
                      <div>
                        <Line>
                          <DatePicker
                            selected={startDateDel}
                            onChange={async (date) => {
                              await this.handleLoadCustomDataInitial(date);
                              this.setDatesSelected();
                              this.handleValidationUnicField('startDate', 'errors');
                            }}
                            locale={ptBR}
                            placeholderText="Data inicial"
                            dateFormat="dd/MM/yyyy"
                            selectsStart
                            // startDate={customSelectedInitial}
                            // endDate={customSelectedEnd}
                            customInput={<CustomCalendarInput />}
                          />
                          <DatePicker
                            selected={endDateDel}
                            // readOnly={disabledForm}
                            onChange={async (date) => {
                              await this.handleLoadCustomDataEnd(date);
                              this.setDatesSelected();
                              this.handleValidationUnicField('endDate', 'errors');
                              this.handleValidationUnicField('startDate', 'errors');
                            }}
                            selectsEnd
                            startDate={customSelectedEnd}
                            endDate={customSelectedEnd}
                            minDate={customSelectedInitial}
                            locale={ptBR}
                            placeholderText="Data final"
                            dateFormat="dd/MM/yyyy"
                            customInput={<CustomCalendarInput />}
                          />
                        </Line>
                        {errors && errors?.endDate && <span style={{ color: '#FF0000' }}>{errors.endDate}</span>}
                      </div>
                      <Icon tiny>autorenew</Icon>
                      {errors && errors?.startDate && (
                        <label style={{ color: '#FF0000', paddingLeft: '10px' }}>{errors.startDate}</label>
                      )}
                    </ContentDate>
                  </Linha>
                  <Linha
                    className="topLine"
                    style={{ margin: '10px', width: '100%', display: 'flex', justifyContent: 'flex-end' }}
                  >
                    <button
                      className="saib-button is-primary"
                      style={{ marginRight: '20px' }}
                      onClick={() => this.getFilteredSchedule()}
                    >
                      pesquisa
                    </button>
                    {selectedRows.length > 0 && (
                      <button
                        className="saib-button is-primary"
                        style={{ marginRight: '20px' }}
                        onClick={() => this.setState({ renderConfirmExcludeModal: true })}
                      >
                        Excluir Selecionados
                      </button>
                    )}
                  </Linha>
                  {filteredScheduleDel.length > 0 && (
                    <Linha className="rowOptions">
                      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <TabelaAgendamentos
                          data={filteredScheduleDel}
                          selectedRows={selectedRows}
                          selectAll={selectAll}
                          onRowSelect={this.handleRowSelect}
                          onAllRowsSelect={this.handleAllRowsSelect}
                        />
                      </div>
                    </Linha>
                  )}
                </>
              </CollapsibleItem>
            </Collapsible>
          </Linha>

          <Dialog title="Motivo do erro" open={dialogError} closeDialog={() => this.setState({ dialogError: false })}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {errorImportCalendar &&
              Object.keys(errorImportCalendar).length > 1 &&
              typeof errorImportCalendar !== 'string' ? (
                errorImportCalendar.map((item) => <Labels fontWeight={700}>{item}</Labels>)
              ) : (
                <Labels fontWeight={700}>{errorImportCalendar}</Labels>
              )}
            </div>
          </Dialog>

          <div className="contentCenter">
            <LeftBar onChangeCalendar={this.onChangeCalendarLeftBar} data={data} />

            <SaibCalendar
              data={data}
              agendado={agendado}
              executado={executado}
              finalizado={finalizado}
              handleChangePeriod={this.handleChangePeriod}
            />
          </div>
        </Container>

        <ContainerModal show={renderConfirmExcludeModal}>
          <div className="content">
            <div className="item-1">
              <h2>Confirmação de exclusão</h2>
            </div>
            <div className="children">
              <h5 style={{ margin: '40px' }}>Deseja realmente excluir estas agendas? esta ação é irreversivel!</h5>
            </div>
            <div className="button-dialog">
              <button
                className="saib-button is-primary"
                style={{ marginRight: '10px' }}
                onClick={async () => await this.deleteAppointments()}
              >
                Confirmar
              </button>
              <button
                className="saib-button is-primary"
                onClick={() => this.setState({ renderConfirmExcludeModal: false })}
              >
                Fechar
              </button>
            </div>
          </div>
        </ContainerModal>
        {renderModels && (
          <Modal
            className="modalQuestion"
            actions={[
              <>
                <Button
                  className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                  onClick={() => this.setState({ renderModels: false })}
                  color="primary"
                >
                  Voltar
                </Button>
              </>,
            ]}
            bottomSheet={false}
            fixedFooter={true}
            header={'Confirmação'}
            options={{
              dismissible: true,
              endingTop: '10%',
              inDuration: 0,
              onCloseEnd: null,
              onCloseStart: null,
              onOpenEnd: null,
              opacity: 0.5,
              outDuration: 0,
              preventScrolling: true,
              startingTop: '4%',
            }}
            open={renderModels}
          >
            <div
              style={{
                overflowY: 'unset',
                overflowX: 'hidden',
                display: 'flex',
                width: '100%',
                height: '90%',
                paddingTop: '20px',
                flexDirection: 'column',
              }}
            >
              <p> Selecione o modelo de agenda desejado. </p>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  width: '100%',
                  justifyContent: 'space-around',
                  marginTop: '20px',
                }}
              >
                <Button
                  className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                  onClick={async () => this.readExcel(1)}
                  color="primary"
                >
                  Modelo 1
                </Button>
                <Button
                  className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                  onClick={() => this.readExcel(2)}
                  color="primary"
                >
                  Modelo 2
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </>
    );
  }
}

class Schedules extends Component {
  render() {
    return (
      <SchedulesProvider>
        <SchedulesComponent {...this.props} />
      </SchedulesProvider>
    );
  }
}

const CustomCalendarInput = forwardRef(({ value, onClick }, ref) => (
  <div
    style={{
      cursor: 'pointer',
      marginLeft: '10px',
      display: 'flex',
      alignItems: 'center',
    }}
    onClick={onClick}
  >
    <button
      style={{
        backgroundColor: 'transparent',
        border: '0px',
        fontWeight: '700',
      }}
    >
      {value}
    </button>
    <div
      style={{
        cursor: 'pointer',
        display: 'inline-block',
        marginLeft: '8px',
        width: '0',
        height: '0',
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        borderLeft: '6px solid rgb(189, 32, 123)',
      }}
    ></div>
  </div>
));

export default withRouter(Schedules);
