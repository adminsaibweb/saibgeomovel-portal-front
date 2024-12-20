import React, { Component, forwardRef } from 'react';
import { Container, Linha, DivDetalhe, Labels, ContentDate, Line } from './style';
import DirectTituloJanela from '../../../Components/Globals/DirectTituloJanela';
import WaitScreen from '../../../Components/Globals/WaitScreen';
import Header from '../../../Components/System/Header';
import SaibRadioGroup from '../../../Components/Globals/SaibRadioGroup';
import { Icon, Tabs, Tab } from 'react-materialize';
import { getFromStorage } from '../../../services/auth';
import { alerta, dateFormat } from '../../../services/funcoes';
import api from '../../../services/api';
import NewSchedule from './NewSchedule';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ptBR from 'date-fns/locale/pt-BR';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import FooterAndButtonsNextAndBack from '../../../Components/FieldWork/Schedule/FooterAndButtonsNextAndBack';
import * as Yup from 'yup';
import SchedulesContext, { SchedulesProvider } from '../../../providers/schedules';
import FixedDays from '../../../Components/FieldWork/Schedule/FixedDays';
import SelectQuery from '../../../Components/Globals/SelectQuery';

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
class ScheduleComponent extends Component {
  static contextType = SchedulesContext;
  state = {
    loading: false,
    diaSelecionado: new Date(),
    scheduleType: 0,
    lastUpdate: 0,
    scheduleActive: 0,
    startDate: null,
    endDate: null,
    dates: [new Date()],
    datesSelected: [],
    fluxoPromotoresSelecionados: '',
    promotoresSelecionados: [],
    supervisoresSelecionados: '',
    fluxoSupervisoresSelecionados: '',
    pageActive: 0,
    titleButton: 'Próximo',
    iconBtn: 'arrow_forward',
    customSelectedInitial: 0,
    customSelectedEnd: 0,
    saveSchedule: false,
    errors: {},
    disabledForm: false,
    schedules: {},
    scheduleOnSundays: '0',
    scheduleOnSaturdays: '0',
    preScheduledInSunday: false,
    preScheduledInSaturday: false,
    typeDaySchedule: 0,
    daysFixed: [],
  };

  refSelectQueryProfessional = React.createRef(null);

  refSelectQueryFluxo = React.createRef(null);

  componentDidMount = async () => {
    const { typeCalendar } = this.props.location.state;
    const { dateSelected } = this.props.location.state;
    const { collpasibleCalendarLeftBarExpanded } = this.props.location.state;
    const { setDateSelected } = this.context;

    dateSelected && setDateSelected(dateSelected);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.setState({
      today,
      typeCalendar,
      dateSelected,
      collpasibleCalendarLeftBarExpanded,
    });
    await this.carregarVariaveisEstado();
    await this.loadFilters();
    await this.loadPromotersAndSupervisors();
    this.initCustomDates();
    this.handleValidationData();
  };

  async componentDidUpdate(prevProps, prevState) {
    const { preScheduledInSunday, preScheduledInSaturday, scheduleOnSundays, scheduleOnSaturdays } = this.state;

    if (prevState.preScheduledInSunday !== preScheduledInSunday || prevState.scheduleOnSundays !== scheduleOnSundays) {
      await this.setDatesExceptWeekends(scheduleOnSundays === '1', scheduleOnSaturdays === '1');
    }

    if (
      prevState.preScheduledInSaturday !== preScheduledInSaturday ||
      prevState.scheduleOnSaturdays !== scheduleOnSaturdays
    ) {
      await this.setDatesExceptWeekends(scheduleOnSundays === '1', scheduleOnSaturdays === '1');
    }
  }

  initCustomDates = () => {
    let schedules = this.props.location.state.schedules;
    let { action } = this.props.location.state;
    const endOfWeek = moment();
    const startOfWeek = moment();
    let startDate = startOfWeek.toDate();
    let endDate = endOfWeek.toDate();
    startDate = moment(startDate).set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    })._d;
    endDate = moment(endDate).set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    })._d;

    if (action === 'editar' || action === 'view') {
      this.setState(
        {
          schedules,
          endDate: moment(schedules.GAA_DTA_AGENDA, 'DD/MM/yyyy')._d,
          startDate: moment(schedules.GAA_DTA_AGENDA, 'DD/MM/yyyy')._d,
          disabledForm: !schedules.GAA_FLG_STATUS === 0,
        },
        () => this.setDatesSelected()
      );
    } else {
      this.setState(
        {
          startDate,
          endDate,
        },
        () => this.setDatesSelected()
      );
    }
  };

  carregarVariaveisEstado = async (e) => {
    let schedules = this.props.location.state.schedules;
    let { action, scheduleActive } = this.props.location.state;

    if (schedules === undefined) {
      schedules = [];
      scheduleActive = 1;
    } else {
      scheduleActive = schedules.GAA_FLG_STATUS;
    }
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      empresaCnpj: sessao.empresaCnpj,
      gupFlagAgenda: sessao.gupFlagAgenda,
      newSchedules: action === 'novo',
      schedules,
      scheduleActive,
    });

    // //console.log(this.state);
  };

  loadPromotersAndSupervisors = async () => {
    const { usuarioAtivo, gupFlagAgenda } = this.state
    const url = `v1/users/${this.state.empresaAtiva}`;
    try {
      const res = await api.get(url);
      const { data, sucess } = res.data;
      if (sucess) {
        let promoters = data.filter((user) => user.USR_GMOVEL_PROMOTOR === 'V');
        promoters = gupFlagAgenda === 1 ? promoters.filter((prom) => prom.USR_ID === usuarioAtivo) : promoters;
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
  };

  loadFilters = async () => {
    const { empresaAtiva, usuarioAtivo, newSchedules, schedules } = this.state;
    try {
      this.setState({ loading: true });
      let url;
      url = '/v1/schedule/allfilter/' + empresaAtiva + '/' + usuarioAtivo;
      const retorno = await api.get(url);
      if (retorno.data && retorno.data.sucess) {
        let data = retorno.data.data;

        let cidades = data.cidades;
        let vendedores = data.vendedores;
        let ramosAtividades = data.ramosAtividades;

        let fluxosSupervisores = [];
        let fluxosPromotores = [];

        let cidadesChips = {};
        for (const cidade of cidades) {
          cidadesChips[cidade.CIDADE] = null;
          cidade.filtro = cidade.CIDADE;
        }

        let vendedoresChips = {};
        for (const vendedor of vendedores) {
          let item =
            vendedor.VENDEDOR.indexOf(vendedor.VENDEDOR_ID) === -1
              ? vendedor.VENDEDOR_ID + ' - ' + vendedor.VENDEDOR
              : vendedor.VENDEDOR;
          vendedoresChips[item] = null;
          vendedor.filtro = item;
        }

        let ramosAtividadesChips = {};
        for (const ramo of ramosAtividades) {
          let item = ramo.RAMO.indexOf(ramo.RAMO_ID) === -1 ? ramo.RAMO_ID + ' - ' + ramo.RAMO : ramo.RAMO;
          ramosAtividadesChips[item] = null;
          ramo.filtro = item;
        }
        let fluxos = data.fluxos;

        let supervisoresSelecionados = '';
        let promotoresSelecionados = '';

        let supervisores = data.supervisores;

        let scheduleType = 0;
        let promotor = {};
        let fluxo = {};
        let clientesSelecionados = [];
        let fluxoSupervisoresSelecionados = '';
        let fluxoPromotoresSelecionados = '';
        let diaSelecionado = schedules.GAA_DTA_AGENDA;
        let scheduleId = undefined;

        for (const fluxo of fluxos) {
          let item =
            fluxo.GAF_DESCRICAO.indexOf(fluxo.GAF_ID) === -1
              ? fluxo.GAF_ID + ' - ' + fluxo.GAF_DESCRICAO
              : fluxo.GAF_DESCRICAO;
          if (fluxo.GAF_FLG_TIPO_USUARIO === 0) {
            fluxosSupervisores.push(fluxo);
            fluxo.filtro = item;
          } else {
            fluxo.filtro = item;
            fluxosPromotores.push(fluxo);
          }
        }

        if (!newSchedules) {
          scheduleType = parseInt(schedules.TIPO);
          // fluxo = { GAF_ID: schedules.GAA_GAF_ID, GAF_DESCRICAO: schedules.GAF_DESCRICAO };
          fluxo = schedules.GAA_GAF_ID;
          if (scheduleType === 0) {
            supervisores.push(schedules);
            // supervisor.tag = schedules.GAA_USR_ID_AGENDA + ' - ' + schedules.USR_NOME;
            supervisoresSelecionados = schedules.GAA_USR_ID_AGENDA;
            fluxoSupervisoresSelecionados = fluxo;
            fluxosSupervisores.push(fluxo);
          } else {
            promotor.tag = schedules.GAA_USR_ID_AGENDA + ' - ' + schedules.USR_NOME;
            // promotoresSelecionados.push(promotor);
            promotoresSelecionados = schedules.GAA_USR_ID_AGENDA;
            fluxoPromotoresSelecionados = fluxo;
          }
          clientesSelecionados = schedules.CLIENTES;
          document.getElementById('div_itemSupervisor').getElementsByClassName('itemSupervisor')[0].checked =
            scheduleType === 0;
          document.getElementById('div_itemPromotor').getElementsByClassName('itemPromotor')[0].checked =
            scheduleType === 1;
          scheduleId = schedules.GAA_ID;
          // //console.log('scheduleType');
          // //console.log(scheduleType);
          // //console.log('schedules.TIPO');
          // //console.log(schedules.TIPO);
        }
        this.setState({
          scheduleId,
          supervisoresSelecionados,
          clientesSelecionados,
          promotoresSelecionados,
          ramosAtividades,
          ramosAtividadesChips,
          vendedores,
          vendedoresChips,
          cidades,
          cidadesChips,
          // promotores,
          // promotoresChips,
          // supervisores,
          // supervisoresChips,
          scheduleType,
          fluxoSupervisoresSelecionados,
          fluxoPromotoresSelecionados,
          fluxosSupervisores,
          fluxosPromotores,
          diaSelecionado,
          // datesSelected: [schedules.GAA_DTA_AGENDA],
        });
      }
      this.setState({ loading: false });
    } catch (err) {
      alerta('Erro ao carregar os filtros da tela =>' + err, 2);
      this.setState({ loading: false });
    }
  };

  onChangeTipoAgendamento = (e) => {
    this.setState({
      scheduleType: parseInt(e),
      fluxoPromotoresSelecionados: '',
      fluxoSupervisoresSelecionados: '',
    });
    this.handleChangeUpdateScreen();

    this.cleanOptionsSelectedSelectQuery();
  };

  onChangeTipoDayAgendamento = (e) => {
    this.setState({
      typeDaySchedule: parseInt(e),
      // fluxoPromotoresSelecionados: [],
      // fluxoSupervisoresSelecionados: [],
    });
    this.handleChangeUpdateScreen();
  };

  verifyDateLessThanDateActual = (date) => {
    // let date_ = moment(date, 'DD/MM/YYYY')._d;
    // date_.setDate(date_.getDate() - 1);
    // let dateNow = new Date();
    // dateNow = moment(dateNow, 'DD/MM/YYYY')._d;
    let date_ = moment(dateFormat(date, 'DD/MM/yyyy'), 'DD.MM.YYYY');

    let dateNow = new Date();
    dateNow = moment(dateFormat(dateNow, 'DD/MM/yyyy'), 'DD.MM.YYYY');
    return date_.isSameOrAfter(dateNow);

    // return date <= dateNow;
  };

  onChangeDiaSemanaAgendamento = (e) => {
    const dateIsLessThanDateActual = this.verifyDateLessThanDateActual(e);

    if (dateIsLessThanDateActual) {
      alerta('Data é menor que a data atual, verifique', 0);
    } else {
      this.setState({ diaSelecionado: e });
      this.handleChangeUpdateScreen();
    }
  };

  handleChangeUpdateScreen = () => {
    let { lastUpdate } = this.state;
    lastUpdate += 1;
    this.setState({ lastUpdate });
  };

  handleManipulaPromotores = (promotoresSelecionados) => {
    if (promotoresSelecionados) {
      this.setState({ promotoresSelecionados }, () => {
        this.handleValidationUnicField('promotoresSelecionados', 'errors');
      });
      this.handleChangeUpdateScreen();
      this.setState({
        clientesSelecionados: [],
      });
    } else {
      this.setState({ promotoresSelecionados: '' }, () => {
        this.handleValidationUnicField('promotoresSelecionados', 'errors');
      });
      this.handleChangeUpdateScreen();
      this.setState({
        clientesSelecionados: [],
      });
    }
  };

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

  handleManipulaFluxoPromotores = (fluxoPromotoresSelecionados) => {
    if (fluxoPromotoresSelecionados) {
      this.setState({ fluxoPromotoresSelecionados }, () => {
        this.handleValidationUnicField('fluxoPromotoresSelecionados', 'errors');
      });
      this.handleChangeUpdateScreen();
      // this.validateButtonNextPageIsEnabled();
      this.setState({
        clientesSelecionados: [],
      });
    } else {
      this.setState({ fluxoPromotoresSelecionados: '' }, () => {
        this.handleValidationUnicField('fluxoPromotoresSelecionados', 'errors');
      });
    }
  };

  handleManipulaFluxoSupervisores = (fluxoSupervisoresSelecionados) => {
    if (fluxoSupervisoresSelecionados) {
      this.setState({ fluxoSupervisoresSelecionados }, () => {
        this.handleValidationUnicField('fluxoSupervisoresSelecionados', 'errors');
      });
      this.handleChangeUpdateScreen();
      // this.validateButtonNextPageIsEnabled();
      this.setState({
        clientesSelecionados: [],
      });
    } else {
      this.setState({ fluxoSupervisoresSelecionados: '' }, () => {
        this.handleValidationUnicField('fluxoSupervisoresSelecionados', 'errors');
      });
    }
  };

  cleanOptionsSelectedSelectQuery = () => {
    this.refSelectQueryProfessional.current.deleteOptionsSelected(false);
    this.refSelectQueryFluxo.current.deleteOptionsSelected(false);
  };

  setDateInDatesSelecteds = (date) => {
    const { datesSelected } = this.state;
    const dateFormated = {};
    dateFormated.label = dateFormat(date);
    const isNotAdded = datesSelected.every((date_) => (date_.label === String(dateFormated.label) ? false : true));
    if (isNotAdded) {
      this.setState({
        datesSelected: [...this.state.datesSelected, dateFormated],
      });
    } else {
      const newDates = datesSelected.filter((date_) => date_.label !== String(dateFormated.label) && date);
      this.setState({
        datesSelected: newDates,
      });
    }
  };

  verifyIfHaveDatesSunday = () => {
    return this.state.datesSelected.every((date) => {
      if (moment(moment(date.label, 'DD/MM/yyyy')._d).format('dddd') === 'Sunday') {
        return false;
      } else return true;
    });
  };

  verifyIfHaveDatesSaturday = () => {
    return this.state.datesSelected.every((date) => {
      if (moment(moment(date.label, 'DD/MM/yyyy')._d).format('dddd') === 'Saturday') {
        return false;
      } else return true;
    });
  };

  setDatesExceptWeekends = async (withSunday, withSaturday) => {
    let { allDatesSelected } = this.state;
    let newDates = [];
    newDates = allDatesSelected?.filter((date) => date);
    return this.setState({
      datesSelected: newDates,
    });
    // if (withSunday && withSaturday) {
    // } else if (!withSunday && !withSaturday) {
    //   newDates = allDatesSelected.filter((date) => {
    //     const date_ = moment(moment(date.label, 'DD/MM/yyyy')._d).format('dddd');
    //     return date_ !== 'Sunday' && date_ !== 'Saturday' && date;
    //   });
    // } else if (!withSunday && withSaturday) {
    //   newDates = allDatesSelected.filter((date) => {
    //     const date_ = moment(moment(date.label, 'DD/MM/yyyy')._d).format('dddd');
    //     return date_ !== 'Sunday' && date;
    //   });
    // } else if (withSunday && !withSaturday) {
    //   newDates = allDatesSelected.filter((date) => {
    //     const date_ = moment(moment(date.label, 'DD/MM/yyyy')._d).format('dddd');
    //     return date_ !== 'Saturday' && date;
    //   });
    // }
    // this.setState({
    //   datesSelected: newDates,
    //   // clientesSelecionados: [],
    // });
  };

  setDatesSelected = () => {
    let { startDate, endDate } = this.state;

    let startDate_ = moment(startDate, 'DD/MM/YYYY')._d;
    let endDate_ = moment(endDate, 'DD/MM/YYYY')._d;

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
      this.setState(
        {
          allDatesSelected: dates,
          datesSelected: dates,
          // clientesSelecionados: [],
        },
        () => {
          const preScheduledInSunday = !this.verifyIfHaveDatesSunday();
          const preScheduledInSaturday = !this.verifyIfHaveDatesSaturday();
          this.setState({
            preScheduledInSunday,
            preScheduledInSaturday,
          });
        }
      );
    }

    // setTimeout(() => {
    //   //console.log(this.state.datesSelected);
    // }, 1000);

    // //console.log(endDate_);
  };

  handleDateChange = async (date) => {
    const { startDate, endDate } = this.state;
    const dateIsLessThanDateActual = this.verifyDateLessThanDateActual(date);

    if (!startDate && !endDate) {
      if (dateIsLessThanDateActual) {
        alerta('Data é menor que a data atual, verifique', 0);
      } else {
        this.setState({
          startDate: date,
        });
      }
    } else if (startDate && !endDate) {
      if (dateIsLessThanDateActual) {
        alerta('Data é menor que a data atual, verifique', 0);
      } else {
        this.setState({
          endDate: date,
        });
      }
    }

    if (startDate && endDate) {
      if (dateIsLessThanDateActual) {
        alerta('Data é menor que a data atual, verifique', 0);
      } else {
        this.setState({
          startDate: date,
          endDate: null,
        });
      }
    }
  };

  handleNextPage = () => {
    let { pageActive, iconBtn, titleButton } = this.state;
    pageActive = pageActive + 1

    if (pageActive + 1 === this.titlesPages.length) {
      titleButton = 'Salvar'
      iconBtn = 'save'
    }

    if (pageActive === this.titlesPages.length) {
      titleButton = 'Salvar'
      iconBtn = 'save'
      pageActive = 0

      this.setState({
        saveSchedule: true,
      });
    }

    this.setState({
      pageActive,
      titleButton,
      iconBtn,
    })
  };

  handlePreviousPage = () => {
    let { pageActive, iconBtn, titleButton } = this.state;

    const ulElement = document.getElementsByClassName('tabs-content');
    const liElement = ulElement[0].getElementsByTagName('li');
    ulElement[0].scrollLeft -= liElement[pageActive].clientWidth;

    pageActive = pageActive - 1
    iconBtn = 'arrow_forward'

    if (pageActive !== this.titlesPages.length) {
      titleButton = 'Próximo'
    }

    this.setState({
      pageActive,
      iconBtn,
      titleButton
    });
  };

  handlePagePerTabs = (ev) => {
    const linkOfPageElement = ev.target;
    const numberPage = linkOfPageElement.href.substr(linkOfPageElement.href.length - 1, linkOfPageElement.href.length);

    if (parseInt(numberPage) === this.titlesPages.length - 1) {
      // if (isEnabledButtonNext) {
      this.setState({
        titleButton: 'Salvar',
        iconBtn: 'save',
        pageActive: parseInt(numberPage),
      });
      // } else {
      // this.setState({
      //   pageActive: parseInt(numberPage) - 1,
      // });
      // }
    } else {
      this.setState({
        titleButton: 'Próximo',
        iconBtn: 'arrow_forward',
        pageActive: parseInt(numberPage),
      });
    }
  };

  verifyDateIsLessThanDateInitial = (date) => {
    const { startDate } = this.state;

    let date_ = moment(dateFormat(date, 'DD/MM/yyyy'), 'DD.MM.YYYY');

    let dateInitial = moment(dateFormat(startDate, 'DD/MM/yyyy'), 'DD.MM.YYYY');

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
        endDate: customSelectedEnd,
      });
    } else {
      alerta('Data menor que a data inicial, verifique', 0);
    }
    this.setState({ loading: false, clientesSelecionados: [] });
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
        startDate: customSelectedInitial,
      });
      this.setState({ loading: false, clientesSelecionados: [] });
    }
  };

  handleClientsSelecteds = (clients) => {
    this.setState({
      clientesSelecionados: clients,
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

  onChangeDaysFixed = async (days) => {
    this.setState(
      {
        daysFixed: days,
        scheduleOnSaturdays: days.some(e => e === 6) ? "1" : "0",
        scheduleOnSundays: days.some(e => e === 0) ? "1" : "0",
      },
      () => this.handleValidationUnicField('daysFixed', 'errors')
    );
  };

  schema = Yup.object().shape({
    startDate: Yup.date()
      .max(Yup.ref('endDate'), ({ min }) => 'Data inicial não pode ser maior que a data final')
      .required(),

    endDate: Yup.date().required('Campo obrigatório'),
    scheduleType: Yup.number().required('Campo obrigatório'),

    supervisoresSelecionados: Yup.string().when('scheduleType', {
      is: (scheduleType) => scheduleType === 0,
      then: Yup.string().required('Campo obrigatório').min(1, 'Campo obrigatório'),
    }),
    fluxoSupervisoresSelecionados: Yup.string().when('scheduleType', {
      is: (scheduleType) => scheduleType === 0,
      then: Yup.string().required('Campo obrigatório').min(1, 'Campo obrigatório'),
    }),
    promotoresSelecionados: Yup.string().when('scheduleType', {
      is: (scheduleType) => scheduleType === 1,
      then: Yup.string().required('Campo obrigatório').min(1, 'Campo obrigatório'),
    }),
    fluxoPromotoresSelecionados: Yup.string().when('scheduleType', {
      is: (scheduleType) => scheduleType === 1,
      then: Yup.string().required('Campo obrigatório').min(1, 'Campo obrigatório'),
    }),
    daysFixed: Yup.array().when('typeDaySchedule', {
      is: (typeDaySchedule) => typeDaySchedule === 1,
      then: Yup.array().required('Campo obrigatório').min(1, 'Campo obrigatório'),
    }),
  });

  titlesPages = ['Configurações', 'Clientes'];

  render() {
    let { action } = this.props.location.state;
    const {
      scheduleType,
      loading,
      promotoresSelecionados,
      supervisoresSelecionados,
      ramosAtividades,
      ramosAtividadesChips,
      vendedores,
      vendedoresChips,
      cidades,
      cidadesChips,
      promotores,
      supervisores,
      diaSelecionado,
      usuarioAtivo,
      empresaAtiva,
      lastUpdate,
      clientesSelecionados,
      scheduleId,
      fluxoPromotoresSelecionados,
      fluxoSupervisoresSelecionados,
      fluxosSupervisores,
      fluxosPromotores,
      schedules,
      datesSelected,
      startDate,
      endDate,
      scheduleActive,
      iconBtn,
      titleButton,
      customSelectedInitial,
      customSelectedEnd,
      disabledForm,
      saveSchedule,
      errors,
      scheduleOnSaturdays,
      scheduleOnSundays,
      typeDaySchedule,
      daysFixed,
      pageActive
    } = this.state;
    return (
      <>
        <Header />
        <WaitScreen loading={loading} />
        <Container tabs={pageActive} className="containerSchedule">
          <DirectTituloJanela
            urlVoltar={undefined}
            stateUrl="/schedules"
            state={{
              typeCalendar: this.state.typeCalendar,
              dateSelected: this.state.dateSelected,
              collpasibleCalendarLeftBarExpanded: this.state.collpasibleCalendarLeftBarExpanded,
            }}
            // urlNovo={'/search'}
            titulo={
              loading ? (
                'Aguarde...'
              ) : (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon>schedule</Icon>Agenda
                </span>
              )
            }
          />

          <Tabs
            scope="tabs"
            className="tabs-content"
            onChange={(ev) => {
              this.handlePagePerTabs(ev);
            }}
          >
            <Tab
              tabWidth={200}
              className="element"
              disabled={!!Object.values(errors).length}
              active={pageActive === 0}
              options={{
                duration: 300,
                onShow: null,
                responsiveThreshold: Infinity,
                swipeable: true,
              }}
              title={"Configurações"}
            >
              <>
                <Linha className="topLine">
                  <DivDetalhe flex={3} className="divTipoAtividade">
                    <SaibRadioGroup
                      readOnly={disabledForm}
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
                  <DivDetalhe>
                    <SaibRadioGroup
                      // readOnly={disabledForm}
                      valueItems={'"0","1"'}
                      classNameItems={'"interval","dayFixed"'}
                      textItems={'"Intervalo","Dia fixo"'}
                      idItems={'"interval","dayFixed"'}
                      classNameRadio="TipoAgendamento"
                      flexDirectionRadio="row"
                      disabledRadio="false"
                      captionRadio={<>Agendamento por</>}
                      defaultCheckedId={typeDaySchedule === 0 ? 'interval' : 'dayFixed'}
                      onChange={this.onChangeTipoDayAgendamento}
                    />
                  </DivDetalhe>
                  {typeDaySchedule === 1 ? (
                    <Line>
                      <ContentDate disabled={schedules && schedules.GAA_ID} justify="flex-start">
                        <FixedDays onChange={this.onChangeDaysFixed} className="fixedDays" />
                        {errors && errors?.daysFixed && (
                          <span style={{ color: '#FF0000', marginLeft: '10px' }}>{errors.daysFixed}</span>
                        )}

                        <Labels className="labelPeriodDate">Periodo de repetição</Labels>
                        <div>
                          <Line>
                            <DatePicker
                              disabled={schedules && schedules.GAA_ID}
                              selected={startDate}
                              onChange={async (date) => {
                                await this.handleLoadCustomDataInitial(date);
                                this.setDatesSelected();
                                await this.setDatesExceptWeekends(
                                  scheduleOnSundays === '1',
                                  scheduleOnSaturdays === '1'
                                );
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
                              selected={endDate}
                              disabled={schedules && schedules.GAA_ID}
                              // readOnly={disabledForm}
                              onChange={async (date) => {
                                await this.handleLoadCustomDataEnd(date);
                                this.setDatesSelected();
                                await this.setDatesExceptWeekends(
                                  scheduleOnSundays === '1',
                                  scheduleOnSaturdays === '1'
                                );
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
                    </Line>
                  ) : (
                    <ContentDate disabled={schedules && schedules.GAA_ID}>
                      <Labels className="labelPeriodDate">Data/periodo para visita</Labels>
                      <div>
                        <Line>
                          <DatePicker
                            disabled={schedules && schedules.GAA_ID}
                            selected={startDate}
                            onChange={async (date) => {
                              await this.handleLoadCustomDataInitial(date);
                              this.setDatesSelected();
                              await this.setDatesExceptWeekends(
                                scheduleOnSundays === '1',
                                scheduleOnSaturdays === '1'
                              );
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
                            selected={endDate}
                            disabled={schedules && schedules.GAA_ID}
                            // readOnly={disabledForm}
                            onChange={async (date) => {
                              await this.handleLoadCustomDataEnd(date);
                              this.setDatesSelected();
                              await this.setDatesExceptWeekends(
                                scheduleOnSundays === '1',
                                scheduleOnSaturdays === '1'
                              );
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
                  )}
                </Linha>
                <Linha
                  className="topLine"
                  displayNoneInputChipPromoter={promotoresSelecionados.length > 0}
                  displayNoneInputChipFlowPromoter={
                    String(fluxoPromotoresSelecionados).length > 0 ||
                    String(fluxoSupervisoresSelecionados).length > 0
                  }
                  displayNoneInputChipSupervisores={String(supervisoresSelecionados).length > 0}
                >
                  {scheduleType === 1 ? (
                    <>
                      <DivDetalhe flex={3}>
                        <Labels>Fluxo atividade</Labels>
                        <SelectQuery
                          ref={this.refSelectQueryFluxo}
                          inputName="activityFlow"
                          onChangeComponentIsExternal={false}
                          loading={false}
                          colorPrimary
                          query={fluxosPromotores}
                          itemSelected={fluxoPromotoresSelecionados}
                          keys={['GAF_ID', 'GAF_DESCRICAO']}
                          label="GAF_DESCRICAO"
                          onChange={async () => { }}
                          onSelect={(item) => {
                            this.handleManipulaFluxoPromotores(item.GAF_ID);
                          }}
                          onDelete={() => {
                            this.handleManipulaFluxoPromotores(null);
                          }}
                        />

                        {errors && errors?.fluxoPromotoresSelecionados && (
                          <span style={{ color: '#FF0000' }}>{errors.fluxoPromotoresSelecionados}</span>
                        )}
                      </DivDetalhe>
                      <DivDetalhe flex={3}>
                        <Labels>Promotor</Labels>
                        <SelectQuery
                          ref={this.refSelectQueryProfessional}
                          inputName="selectPromoter"
                          onChangeComponentIsExternal={false}
                          loading={false}
                          colorPrimary
                          query={promotores}
                          itemSelected={promotoresSelecionados}
                          keys={['USR_ID', 'USR_NOME']}
                          label="USR_NOME"
                          onChange={async () => { }}
                          onSelect={(item) => {
                            this.handleManipulaPromotores(item.USR_ID);
                          }}
                          onDelete={() => {
                            this.handleManipulaPromotores(null);
                          }}
                        />

                        {errors && errors?.promotoresSelecionados && (
                          <span style={{ color: '#FF0000' }}>{errors.promotoresSelecionados}</span>
                        )}
                      </DivDetalhe>
                    </>
                  ) : (
                    <>
                      <DivDetalhe flex={3}>
                        <Labels>Fluxo atividade</Labels>
                        <SelectQuery
                          ref={this.refSelectQueryFluxo}
                          inputName="activityFlowPromoter"
                          onChangeComponentIsExternal={false}
                          loading={false}
                          colorPrimary
                          query={fluxosSupervisores}
                          itemSelected={fluxoSupervisoresSelecionados}
                          keys={['GAF_ID', 'GAF_DESCRICAO']}
                          label="GAF_DESCRICAO"
                          onChange={async () => { }}
                          onSelect={(item) => {
                            this.handleManipulaFluxoSupervisores(item.GAF_ID);
                          }}
                          onDelete={() => {
                            this.handleManipulaFluxoSupervisores(null);
                          }}
                        />

                        {errors && errors?.fluxoSupervisoresSelecionados && (
                          <span style={{ color: '#FF0000' }}>{errors.fluxoSupervisoresSelecionados}</span>
                        )}
                      </DivDetalhe>
                      <DivDetalhe flex={3}>
                        <Labels>Supervisor</Labels>
                        <SelectQuery
                          ref={this.refSelectQueryProfessional}
                          inputName="selectSupervisor"
                          itemSelected={supervisoresSelecionados}
                          onChangeComponentIsExternal={false}
                          loading={false}
                          colorPrimary
                          query={supervisores}
                          keys={['USR_ID', 'USR_NOME']}
                          label="USR_NOME"
                          onChange={async () => { }}
                          onSelect={(item) => {
                            this.handleManipulaSupervisores(item.USR_ID);
                          }}
                          onDelete={() => {
                            this.handleManipulaSupervisores(null);
                          }}
                        />

                        {errors && errors?.supervisoresSelecionados && (
                          <span style={{ color: '#FF0000' }}>{errors.supervisoresSelecionados}</span>
                        )}
                      </DivDetalhe>
                    </>
                  )}
                </Linha>
                <FooterAndButtonsNextAndBack
                  clickButtonNext={async () => {
                    !(await this.handleValidationData())
                      ? alerta('Configurações do agendamento inválidas, verifique', 0)
                      : this.handleNextPage();
                  }}
                  // disabled={prospectsSelecionados.length < 1}
                  icon={iconBtn}
                  titleButton={titleButton}
                  titleButtonBack={this.props.titleButtonBack}
                  disabledBtnBack={true}
                />
              </>
            </Tab>
            <Tab
              tabWidth={200}
              className="tabClient"
              disabled={!!Object.values(errors).length}
              active={pageActive === 1}
              options={{
                duration: 300,
                onShow: null,
                responsiveThreshold: Infinity,
                swipeable: true,
              }}
              title={"Clientes"}
            >
              {cidades !== undefined && vendedores !== undefined && ramosAtividades !== undefined && (
                <>
                  <NewSchedule
                    cidades={cidades}
                    cidadesChips={cidadesChips}
                    vendedores={vendedores}
                    vendedoresChips={vendedoresChips}
                    ramosAtividadesChips={ramosAtividadesChips}
                    ramosAtividades={ramosAtividades}
                    diaSelecionado={diaSelecionado}
                    diasSelecionados={datesSelected}
                    startDate={startDate}
                    endDate={endDate}
                    empresaAtiva={empresaAtiva}
                    usuarioAtivo={usuarioAtivo}
                    scheduleType={scheduleType}
                    promotoresSelecionados={promotoresSelecionados}
                    supervisoresSelecionados={supervisoresSelecionados}
                    promotores={promotores}
                    supervisores={supervisores}
                    lastUpdate={lastUpdate}
                    action={action}
                    clientesSelecionados={clientesSelecionados}
                    scheduleId={scheduleId}
                    fluxoSupervisoresSelecionados={fluxoSupervisoresSelecionados}
                    fluxoPromotoresSelecionados={fluxoPromotoresSelecionados}
                    handleClientsSelecteds={this.handleClientsSelecteds}
                    fluxosSupervisores={fluxosSupervisores}
                    fluxosPromotores={fluxosPromotores}
                    // statusSchedule={statusSchedule}
                    scheduleActive={scheduleActive}
                    saveSchedule={saveSchedule}
                    disabledForm={disabledForm}
                    scheduleOnSaturdays={scheduleOnSaturdays}
                    scheduleOnSundays={scheduleOnSundays}
                    typeDaySchedule={typeDaySchedule}
                    daysFixed={daysFixed}
                  />
                  <FooterAndButtonsNextAndBack
                    clickButtonNext={this.handleNextPage}
                    action={action}
                    disabled={clientesSelecionados.length < 1 || disabledForm}
                    clickButtonBack={this.handlePreviousPage}
                    icon={iconBtn}
                    titleButton={titleButton}
                    // iconBack="arrow_forward"
                    disabledBtnBack={false}
                  />
                </>
              )}

            </Tab>
          </Tabs>
        </Container>
      </>
    );
  }
}

class Schedule extends Component {
  render() {
    return (
      <SchedulesProvider>
        <ScheduleComponent {...this.props} />
      </SchedulesProvider>
    );
  }
}

export default withRouter(Schedule);
