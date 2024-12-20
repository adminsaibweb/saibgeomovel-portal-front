import React, { Component } from 'react';
import { Container, Linha, DivDetalhe, Labels, ContentItem, CardBox, CardStripe, CardContainer } from './style';
import SaibRadioGroup from '../../../Components/Globals/SaibRadioGroup';
import DirectTituloJanela from '../../../Components/Globals/DirectTituloJanela';
import WaitScreen from '../../../Components/Globals/WaitScreen';
import Header from '../../../Components/System/Header';

import { Icon, Button, Modal, Collapsible, CollapsibleItem, Tab, Tabs } from 'react-materialize';

import { getFromStorage } from '../../../services/auth';
import { alerta, dateFormat } from '../../../services/funcoes';
import api from '../../../services/api';
import SchedulesContext from '../../../providers/schedules';
import { withRouter } from 'react-router';
import SelectQuery from '../../../Components/Globals/SelectQuery';
import { MdEventNote } from 'react-icons/md';
import Calendar from '../../../Components/Globals/Calendar';
import WeekBar from '../../../Components/FieldWork/FlexibleSchedule/WeekBar';
import { add } from 'date-fns';
class FlexibleScheduleComponent extends Component {
  static contextType = SchedulesContext;

  state = {
    loading: true,
    daySelected: new Date(),
    promotoresSelecionados: [],
    promotorTab2: '',
    supervisorTab2: '',
    filterTypeSchedule: '',
    filterTypeScheduleTab2: 1,
    dateSelected: new Date(),
    idsEmployeesSelected: [],
    dataOnlySupervision: false,
    typeCalendar: '0',
    updateSchedule: false,
    errorImportCalendar: null,
    dialogError: false,
    removeSupervisor: false,
    removePromotor: false,
    scheduleType: 0,
    fluxoPromotoresSelecionados: '',
    fluxoclientesSelecionados: '',
    filteredScheduleDel: [],
    selectedRows: [],
    resultPromotorTable: [],
    clientsPromotorTable: [],
    selectAll: false,
    pageActive: 0,
    renderConfirmExcludeModal: false,
    renderConfirmReschedule: false,
    renderConfirmEditSchedule: false,
    statusSelecionado: '',
    statusOptions: [
      { id: 1, label: 'Atendendo' },
      { id: 2, label: 'Agendado' },
    ],
    clientes: [],
    schedulesList: [],
    changePromotorSchedule: {},
    clientesSelecionados: '',
    promotersSelecionadosDel: '',
    supervisorsSelecionadosDel: '',
    renderNewSchedule: false,
    employeSelected: '',
    flowsData: [],
    renderFlow: false,
    flowSelected: '',
    selectedClientsAppointment: [],
    renderConfirmDel: false,
    selectedToDel: 0,
  };

  refSelectQueryProfessional = React.createRef(null);
  refSelectQuerySupervisor = React.createRef(null);
  refSelectQueryPromoter = React.createRef(null);
  refSelectQueryClient = React.createRef(null);
  refSelectQueryStatus = React.createRef(null);
  refSelectQueryFluxo = React.createRef(null);
  refSelectQueryAllEmployes = React.createRef(null);

  handleKeyUp = (event) => {
    if (event.key === 'Escape') {
      this.setState({
        renderConfirmEditSchedule: false,
        renderConfirmReschedule: false,
        renderConfirmDel: false,
        renderNewSchedule: false,
      });
    }
  };

  deleteAppointmentsEdit = async (cliId) => {
    const { editPromotorSchedule } = this.state;
    this.setState({
      editPromotorSchedule: {
        ...editPromotorSchedule,
        CLIENTES: editPromotorSchedule.CLIENTES.filter((cli) => cli.CLI_ID !== cliId),
      },
    });
  };

  deleteAppointmentsNewAppointment = async (cliId) => {
    const { selectedClientsAppointment } = this.state;
    this.setState({
      selectedClientsAppointment: [...selectedClientsAppointment.filter((cli) => cli.CLI_ID !== cliId)],
    });
  };

  handleManipulaSupervisoresDel = (supervisorsSelecionadosDel) => {
    if (supervisorsSelecionadosDel) {
      this.setState({ supervisorsSelecionadosDel });
    }
  };

  handleManipulaPromotersDel = (promotersSelecionadosDel) => {
    if (promotersSelecionadosDel) {
      this.setState({ promotersSelecionadosDel });
    }
  };

  handleManipulaallEmployes = (employeSelectedId, role) => {
    const { flowsData } = this.state;

    if (employeSelectedId) {
      this.setState({ employeSelected: employeSelectedId });
    }

    if (role.includes('Supervisor') && flowsData.filter((flow) => flow.GAF_FLG_TIPO_USUARIO === 0).length === 1) {
      return this.setState({
        renderFlow: false,
        flowSelected: flowsData.find((flow) => flow.GAF_FLG_TIPO_USUARIO === 0).GAF_ID,
      });
    }
    if (role.includes('Promotor') && flowsData.filter((flow) => flow.GAF_FLG_TIPO_USUARIO === 1).length === 1) {
      return this.setState({
        renderFlow: false,
        flowSelected: flowsData.find((flow) => flow.GAF_FLG_TIPO_USUARIO === 1).GAF_ID,
      });
    }
    if (role.includes('Supervisor') && flowsData.filter((flow) => flow.GAF_FLG_TIPO_USUARIO === 0).length > 1) {
      return this.setState({
        renderFlow: true,
        flowsData: flowsData.filter((flow) => flow.GAF_FLG_TIPO_USUARIO === 0),
      });
    }
    if (role.includes('Promotor') && flowsData.filter((flow) => flow.GAF_FLG_TIPO_USUARIO === 1).length > 1) {
      return this.setState({
        renderFlow: true,
        flowsData: flowsData.filter((flow) => flow.GAF_FLG_TIPO_USUARIO === 1),
      });
    }
  };

  handleManipulaFlow = (flowSelected) => {
    if (flowSelected) {
      this.setState({ flowSelected });
    }
  };

  handleManipulaStatus = (statusSelecionado) => {
    if (statusSelecionado) {
      this.setState({ statusSelecionado });
    }
  };

  handleManipulaClientes = (clientesSelecionados) => {
    if (clientesSelecionados) {
      this.setState({ clientesSelecionados });
    }
  };

  componentDidMount = async () => {
    document.addEventListener('keyup', this.handleKeyUp);
    this.setState({ loading: true });
    await this.carregarVariaveisEstado();
    await this.loadSchedules();
    await this.loadSupervisoresAndPromotores();
    await this.loadFilter();
    this.setState({ loading: false });
  };

  loadFilter = async () => {
    const url = `v1/schedule/allfilter/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`;
    try {
      const { data } = await api.get(url);
      const flowsData = data.data.fluxos;
      if (data.sucess) {
        this.setState({ flowsData });
      }
    } catch (e) {
    } finally {
    }
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      empresaCnpj: sessao.empresaCnpj,
      gupFlagAgenda: sessao.gupFlagAgenda,
    });
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

        for (let promotor of promoters) {
          promotor.value = promotor.USR_ID;
          promotor.description = `${promotor.USR_ID - promotor.USR_NOME}`;
        }

        let allEmployees = [
          ...supervisors.map((supervisor) => {
            supervisor.value = supervisor.USR_ID;
            supervisor.description = `${supervisor.USR_ID} - Supervisor - ${supervisor.USR_NOME}`;
            return supervisor;
          }),
          ...promoters.map((promoter) => {
            promoter.value = promoter.USR_ID;
            promoter.description = `${promoter.USR_ID} - Promotor - ${promoter.USR_NOME}`;
            return promoter;
          }),
        ];

        this.setState({
          promotores: promoters,
          supervisores: supervisors,
          allEmployees: gupFlagAgenda === 1 ? allEmployees.filter((prom) => prom.value === usuarioAtivo) : allEmployees,
        });
      } else {
        alerta('Erro ao carregar supervisores e promotores', 2);
      }
    } catch (errors) {
      alerta('Erro ao carregar supervisores e promotores', 2);
    }
  };

  loadSchedules = async () => {
    const { empresaAtiva, usuarioAtivo } = this.state;
    const {
      promotersSelecionadosDel,
      clientesSelecionados,
      supervisorsSelecionadosDel,
      filterTypeSchedule,
      clientes,
      daySelected,
    } = this.state;
    this.setState({
      loading: true,
    });
    try {
      if (filterTypeSchedule === '0' && clientesSelecionados === '') {
        this.setState({ schedulesList: [] });
        return alerta('Selecione um cliente para filtrar!');
      }
      let url;
      url = '/v1/schedule/' + empresaAtiva + '/' + usuarioAtivo;

      let data = {
        dataInicial: dateFormat(daySelected, 'DD/MM/yyyy'),
        dataFinal: dateFormat(daySelected, 'DD/MM/yyyy'),
        usuarioAgenda:
          filterTypeSchedule === '4'
            ? ''
            : promotersSelecionadosDel
            ? promotersSelecionadosDel
            : supervisorsSelecionadosDel
            ? supervisorsSelecionadosDel
            : '',
        status: 1,
        clienteId:
          filterTypeSchedule === '0' && clientesSelecionados !== '' && clientesSelecionados.length > 0
            ? clientes.find((cli) => cli.CLI_CODIGO === clientesSelecionados).CLI_ID
            : undefined,
      };

      await api.post(url, data).then((retorno) => {
        if (retorno.data && retorno.data.sucess) {
          if (filterTypeSchedule === '2' && supervisorsSelecionadosDel === '') {
            return this.setState({
              schedulesList: [...retorno.data.data.filter((schedule) => schedule.TIPO === 0)],
            });
          }
          if (filterTypeSchedule === '3' && promotersSelecionadosDel === '') {
            return this.setState({
              schedulesList: [...retorno.data.data.filter((schedule) => schedule.TIPO === 1)],
            });
          }
          this.setState({ schedulesList: [...retorno.data.data] });
        }
      });
    } catch (err) {
      alerta('Erro ao carregar os agendamentos =>' + err, 2);
      this.setState({ loading: false });
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  cleanFilter = () => {
    this.setState({
      promotersSelecionadosDel: '',
      clientesSelecionados: '',
      supervisorsSelecionadosDel: '',
      renderConfirmEditSchedule: false,
      renderConfirmReschedule: false,
      renderNewSchedule: false,
      renderFlow: false,
      employeSelected: '',
      selectedClientsAppointment: [],
      flowSelected: '',
    });
  };

  getFormatedDate = (daySelected) => {
    var dataAtual = daySelected ? daySelected : new Date();
    var diasSemana = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
    ];
    var meses = [
      'janeiro',
      'fevereiro',
      'março',
      'abril',
      'maio',
      'junho',
      'julho',
      'agosto',
      'setembro',
      'outubro',
      'novembro',
      'dezembro',
    ];
    var textoData = diasSemana[dataAtual.getDay()] + ', ' + dataAtual.getDate() + ' de ' + meses[dataAtual.getMonth()];
    return textoData;
  };

  handleChangePromoterSchedule = async () => {
    const { empresaAtiva, usuarioAtivo, changePromotorSchedule, allEmployees, employeSelected } = this.state;
    try {
      this.setState({ loading: true });
      let url;
      url = '/v1/schedule/' + empresaAtiva + '/' + usuarioAtivo + '/' + changePromotorSchedule.GAA_ID;

      await api.delete(url).then(async (retorno) => {
        if (retorno.data && retorno.data.sucess) {
          let urlCreate = '/v1/schedule/add/' + empresaAtiva + '/' + usuarioAtivo;
          let dataCreate = {
            promotor: allEmployees.find((empl) => empl.USR_ID === employeSelected).USR_ID || undefined,
            supervisor: allEmployees.find((empl) => empl.USR_ID === employeSelected).USR_ID || undefined,
            fluxo: changePromotorSchedule.GAA_GAF_ID,
            diaSelecionado: changePromotorSchedule.GAA_DTA_AGENDA,
            scheduleType:
              allEmployees.find((empl) => empl.USR_ID === employeSelected).USR_GMOVEL_PROMOTOR === 'V' ? 0 : 1,
            scheduleActive: 1,
            clientes: changePromotorSchedule.CLIENTES.map((cli) => {
              return {
                CLI_CODIGO: cli.CLI_CODIGO,
                CLI_ID: cli.CLI_ID,
                CLI_NOME_FANTASIA: cli.CLI_NOME_FANTASIA,
                CLI_RAZAO_SOCIAL: cli.CLI_RAZAO_SOCIAL,
              };
            }),
          };
          await api.post(urlCreate, dataCreate).then(async (output) => {
            if (output.data.sucess) {
              alerta('Profissional alterado com sucesso!', 1);
              this.setState({ renderConfirmEditSchedule: false, promotersSelecionadosDel: '' });
            }
          });
        }
      });
    } catch (e) {
      alerta('Erro ao alterar a agenda', 2);
    } finally {
      this.setState({ promotersSelecionadosDel: '', supervisorsSelecionadosDel: '' });
      this.loadSchedules();
      this.cleanFilter();
      this.setState({
        loading: false,
        renderConfirmEditSchedule: false,
        renderConfirmReschedule: false,
      });
    }
  };

  handleManipulaClients = async (item) => {
    const { editPromotorSchedule, empresaAtiva, usuarioAtivo, daySelected } = this.state;
    if (item.CLI_ID) {
      let url;
      url = '/v1/schedule/' + empresaAtiva + '/' + usuarioAtivo;
      let data = {
        dataInicial: dateFormat(daySelected, 'DD/MM/yyyy'),
        dataFinal: dateFormat(daySelected, 'DD/MM/yyyy'),
        usuarioAgenda: '',
        status: 1,
        clienteId: item.CLI_ID,
      };
      const res = await api.post(url, data);

      if (res.data && res.data.sucess) {
        if (res.data.data.length > 0) {
          return alerta(`Já existe um agendamento para o cliente ${item.CLI_NOME_FANTASIA} no dia selecionado`);
        }
        const exist = editPromotorSchedule.CLIENTES.find((e) => e.CLI_ID === item.CLI_ID);

        if (!exist) {
          alerta('Cliente adicionado com sucesso', 1);
          this.setState({
            editPromotorSchedule: {
              ...editPromotorSchedule,
              CLIENTES: [...editPromotorSchedule.CLIENTES, item],
            },
          });
        } else {
          alerta('Esse cliente já foi selecionado', 2);
        }
      }

      this.setState({ clientesSelecionados: [], loading: false });
    }
  };

  handleManipulaClientsNewAppointment = async (item) => {
    const { empresaAtiva, usuarioAtivo, daySelected, selectedClientsAppointment } = this.state;
    if (item.CLI_ID) {
      let url;
      url = '/v1/schedule/' + empresaAtiva + '/' + usuarioAtivo;
      let data = {
        dataInicial: dateFormat(daySelected, 'DD/MM/yyyy'),
        dataFinal: dateFormat(daySelected, 'DD/MM/yyyy'),
        usuarioAgenda: '',
        status: 1,
        clienteId: item.CLI_ID,
      };
      const res = await api.post(url, data);

      if (res.data && res.data.sucess) {
        if (res.data.data.length > 0) {
          return alerta(`Já existe um agendamento para o cliente ${item.CLI_NOME_FANTASIA} no dia selecionado`);
        }
        const exist = selectedClientsAppointment.find((e) => e.CLI_ID === item.CLI_ID);
        if (!exist) {
          alerta('Cliente adicionado com sucesso', 1);
          this.setState({
            selectedClientsAppointment: [...selectedClientsAppointment, item],
          });
        } else {
          alerta('Esse cliente já foi selecionado', 2);
        }
      }

      this.setState({ clientesSelecionados: [], loading: false });
    }
  };

  handleDeleteSchedule = async (id) => {
    const { empresaAtiva, usuarioAtivo } = this.state;
    try {
      this.setState({ loading: true });
      let url = 'v1/schedule/' + empresaAtiva + '/' + usuarioAtivo + '/' + id;
      const payload = { gaaId: id };
      const { data } = await api.delete(url, payload);
      if (data.sucess) {
        alerta('Agendamento excluido com sucesso!', 1);
      }
    } catch (e) {
      alerta(e, 2);
    } finally {
      this.loadSchedules();
      this.setState({ loading: false, renderConfirmDel: false });
    }
  };

  handleSaveNewSchedule = async (edit) => {
    if (edit) {
      const { editPromotorSchedule } = this.state;
      this.setState({ loading: true });
      try {
        const clientsData = editPromotorSchedule.CLIENTES.map((cli) => {
          return {
            CLI_CODIGO: cli.CLI_CODIGO,
            CLI_ID: cli.CLI_ID,
            CLI_RAZAO_SOCIAL: cli.CLI_RAZAO_SOCIAL,
            CLI_NOME_FANTASIA: cli.CLI_NOME_FANTASIA.split('- ')[1]
              ? cli.CLI_NOME_FANTASIA.split('- ')[1].split(' (')[0]
              : cli.CLI_NOME_FANTASIA,
          };
        });
        const reqData = {
          gaaId: editPromotorSchedule.GAA_ID,
          diaSelecionado: editPromotorSchedule.GAA_DTA_AGENDA,
          fluxo: editPromotorSchedule.GAA_GAF_ID,
          promotor: editPromotorSchedule.TIPO === 0 ? '' : editPromotorSchedule.GAA_USR_ID_AGENDA,
          scheduleType: editPromotorSchedule.TIPO,
          supervisor: editPromotorSchedule.TIPO === 0 ? editPromotorSchedule.GAA_USR_ID_AGENDA : '',
          scheduleActive: 1,
          clientes: clientsData,
        };
        let res;
        if (clientsData.length === 0) {
          res = await api.delete(
            `/v1/schedule/${this.state.empresaAtiva}/${this.state.usuarioAtivo}/${editPromotorSchedule.GAA_ID}`
          );
        } else {
          res = await api.put(`/v1/schedule/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`, reqData);
        }

        if (res.data.sucess) {
          alerta('Agenda alterada com sucesso!', 1);
        }
      } catch (e) {
        alerta('Erro ao alterar agenda', 2);
      } finally {
        this.cleanFilter();
        this.loadSchedules();
        this.setState({
          loading: false,
          renderConfirmEditSchedule: false,
          renderConfirmReschedule: false,
          renderNewSchedule: false,
          clientesSelecionados: '',
        });
      }
    } else {
      const { selectedClientsAppointment, employeSelected, daySelected, flowSelected, allEmployees } = this.state;
      this.setState({ loading: true });
      try {
        const reqData = {
          diaSelecionado: dateFormat(daySelected, 'DD/MM/yyyy'),
          fluxo: flowSelected,
          promotor: allEmployees.find((empl) => empl.USR_ID === employeSelected).USR_ID || undefined,
          scheduleType:
            allEmployees.find((empl) => empl.USR_ID === employeSelected).USR_GMOVEL_PROMOTOR === 'V' ? 0 : 1,
          supervisor: allEmployees.find((empl) => empl.USR_ID === employeSelected).USR_ID || undefined,
          scheduleActive: 1,
          clientes: selectedClientsAppointment,
        };
        let res = await api.put(`/v1/schedule/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`, reqData);

        if (res.data.sucess) {
          alerta('Agendamento realizado com sucesso!', 1);
        }
      } catch (e) {
        alerta('Erro ao criar agendamento agenda', 2);
      } finally {
        this.cleanFilter();
        this.loadSchedules();
        this.loadFilter();
        this.setState({
          renderConfirmEditSchedule: false,
          renderConfirmReschedule: false,
          renderNewSchedule: false,
          loading: false,
          renderFlow: false,
          employeSelected: '',
          flowSelected: '',
        });
      }
    }
  };

  handleFilterCustomers = async (text) => {
    const { empresaAtiva, usuarioAtivo } = this.state;

    try {
      this.setState({ loading: true });
      let url = `v1/schedule/clientes/${empresaAtiva}/${usuarioAtivo}`;
      const dataToSend = {
        filtro: String(text),
      };

      const retorno = await api.post(url, dataToSend);
      const { sucess, data } = retorno.data;

      if (sucess) {
        let clientes = data;

        this.setState({ clientes });
      }
    } catch (err) {
      alerta('Erro ao carregar os clientes =>' + err, 2);
    } finally {
      this.setState({ loading: false });
    }
  };

  isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  handleTableRender = async (dateSelect = null, user) => {
    try {
      let { empresaAtiva, usuarioAtivo, daySelected } = this.state;

      if (dateSelect) {
        daySelected = dateSelect;
      }
      const dataFinal = add(daySelected, { days: 6 });
      this.setState({ loading: true });

      const payload = {
        dataInicial: dateFormat(daySelected, 'DD/MM/yyyy'),
        dataFinal: dateFormat(dataFinal, 'DD/MM/yyyy'),
        usuarioAgenda: user,
        status: 1,
        clienteId: undefined,
      };
      const res = await api.post(`/v1/schedule/${empresaAtiva}/${usuarioAtivo}`, payload);

      const { sucess, data } = res.data;

      if (sucess) {
        const arrayClients = [];
        const today = new Date();
        let lowerDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);

        const array = data.map((item, index) => {
          item.CLIENTES = item.CLIENTES.map((cli, idxCli) => {
            const partes = item.GAA_DTA_AGENDA.split('/');
            const data = new Date(partes[2], partes[1] - 1, partes[0]);
            if (data < lowerDate) {
              lowerDate = data;
            }

            cli.DATE = data;
            cli.date = data;
            cli.id = `${index}_${idxCli}`;
            arrayClients.push(cli);
            return cli;
          });
          return item;
        });

        if (data && data.length === 0) {
          lowerDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        }
        if (dateSelect) {
          lowerDate = dateSelect;
        }

        this.setState({
          resultPromotorTable: array,
          clientsPromotorTable: arrayClients,
          lowerDate,
        });
      }
    } catch (error) {
      //
    } finally {
      this.setState({ loading: false });
    }
  };

  handlePagePerTabs = (ev) => {
    const linkOfPageElement = ev.target;
    const numberPage = linkOfPageElement.href.substr(linkOfPageElement.href.length - 1, linkOfPageElement.href.length);

    this.setState({
      pageActive: parseInt(numberPage),
    });
  };

  render() {
    const {
      loading,
      filterTypeSchedule,
      promotores,
      renderConfirmReschedule,
      renderConfirmEditSchedule,
      clientes,
      promotersSelecionadosDel,
      schedulesList,
      changePromotorSchedule,
      editPromotorSchedule,
      supervisorsSelecionadosDel,
      supervisores,
      daySelected,
      renderNewSchedule,
      allEmployees,
      employeSelected,
      renderFlow,
      flowSelected,
      flowsData,
      selectedClientsAppointment,
      renderConfirmDel,
      selectedToDel,
      clientsPromotorTable,
      resultPromotorTable,
      pageActive,
      filterTypeScheduleTab2,
      lowerDate,
      promotorTab2,
      supervisorTab2,
      TIPO,
      removeSupervisor,
      removePromotor,
    } = this.state;

    return (
      <>
        <Header />
        <WaitScreen loading={loading} />
        <Container className="containerSearchs">
          <DirectTituloJanela
            urlVoltar={'/home'}
            titulo={
              loading ? (
                'Aguarde...'
              ) : (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon>schedule</Icon> Agenda Flexível
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
              active={pageActive === 0}
              options={{
                duration: 300,
                onShow: null,
                responsiveThreshold: Infinity,
                swipeable: true,
              }}
              title={'AGENDA DIÁRIA'}
            >
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
                    header="Clique para filtrar"
                    icon={<Icon>filter_list</Icon>}
                    node="div"
                  >
                    <Linha className="filter">
                      <ContentItem>
                        <SaibRadioGroup
                          style={{ padding: '5px' }}
                          valueItems={'"0","2","3", "4" '}
                          classNameItems={'"client","supervisor","promoter", "all"'}
                          textItems={'"Cliente","Supervisor", "Promotor", "Todos"'}
                          idItems={'"client", "supervisor", "promoter", "all"'}
                          classNameRadio="filterTypeSchedule"
                          flexDirectionRadio="row"
                          disabledRadio="false"
                          defaultCheckedId={'all'}
                          captionRadio="Tipo de Agenda"
                          onChange={async (value) => {
                            this.setState(
                              {
                                filterTypeSchedule: value,
                              },
                              () => {
                                this.cleanFilter();
                              }
                            );
                          }}
                        />
                      </ContentItem>
                      {filterTypeSchedule !== '' && filterTypeSchedule !== '4' && (
                        <ContentItem>
                          <p style={{ width: '100%', textAlign: 'center', fontSize: '14px', marginTop: '5px' }}>
                            Pesquisa
                          </p>
                          <DivDetalhe flex={3} style={{ minWidth: '350px' }}>
                            {filterTypeSchedule === '0' ? (
                              <>
                                <Labels>cliente</Labels>
                                <SelectQuery
                                  inputName="selectClient"
                                  onChangeComponentIsExternal
                                  colorPrimary
                                  query={clientes}
                                  keys={['CLI_CODIGO', 'CLI_NOME_FANTASIA', 'CLI_RAZAO_SOCIAL']}
                                  label="CLI_NOME_FANTASIA"
                                  onChange={async (text) => {
                                    await this.handleFilterCustomers(isNaN(text) ? text?.toUpperCase() : Number(text));
                                  }}
                                  onSelect={(item) => {
                                    this.handleManipulaClientes(item.CLI_CODIGO);
                                  }}
                                  onDelete={() => {
                                    this.setState({ clientesSelecionados: '' });
                                  }}
                                />
                              </>
                            ) : filterTypeSchedule === '2' ? (
                              <>
                                <Labels>Supervisor</Labels>
                                <SelectQuery
                                  ref={this.refSelectQuerySupervisor}
                                  inputName="selectSupervisor"
                                  itemSelected={supervisorsSelecionadosDel}
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
                                    this.setState({ supervisorsSelecionadosDel: '' });
                                  }}
                                />
                              </>
                            ) : filterTypeSchedule === '3' ? (
                              <>
                                <Labels>Promotor</Labels>
                                <SelectQuery
                                  ref={this.refSelectQueryPromoter}
                                  inputName="selectPromoter"
                                  itemSelected={promotersSelecionadosDel}
                                  onChangeComponentIsExternal={false}
                                  loading={false}
                                  colorPrimary
                                  query={promotores}
                                  keys={['USR_ID', 'USR_NOME']}
                                  label="USR_NOME"
                                  onChange={async () => {}}
                                  onSelect={(item) => {
                                    this.handleManipulaPromotersDel(item.USR_ID);
                                  }}
                                  onDelete={() => {
                                    this.setState({ promotersSelecionadosDel: '' });
                                  }}
                                />
                              </>
                            ) : (
                              ''
                            )}
                          </DivDetalhe>
                        </ContentItem>
                      )}
                      <ContentItem style={{ minWidth: '130px', height: '70px', justifyContent: 'start' }}>
                        <p style={{ width: '100%', textAlign: 'center', fontSize: '14px', marginTop: '5px' }}>data</p>
                        <DivDetalhe flex="0" style={{ marginTop: '10px' }}>
                          <Calendar
                            date={daySelected}
                            onChange={(date) => {
                              this.setState({
                                daySelected: date,
                              });
                            }}
                          />
                        </DivDetalhe>
                      </ContentItem>
                    </Linha>

                    <Linha className="filter" style={{ display: 'flex', justifyContent: 'end', marginBottom: '10px' }}>
                      <Button
                        className="waves-effect waves-light saib-button is-primary"
                        style={{ padding: '10px', marginRight: '10px' }}
                        onClick={() => this.setState({ renderNewSchedule: true })}
                      >
                        <Icon>add</Icon>
                        Criar Agendamento
                      </Button>
                      <Button
                        className="waves-effect waves-light saib-button is-primary"
                        style={{ padding: '10px', marginRight: '10px' }}
                        onClick={() => this.loadSchedules()}
                      >
                        <Icon>search</Icon>
                        Pesquisar
                      </Button>
                    </Linha>
                  </CollapsibleItem>
                </Collapsible>
              </Linha>

              <Linha>
                <div
                  style={{
                    width: '100%',
                    backgroundColor: '#8E44AD',
                    margin: '5px',
                    marginLeft: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '5px',
                  }}
                >
                  <MdEventNote color="#FFF" size={18} />
                  <p
                    style={{
                      textAlign: 'start',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#FFF',
                      paddingLeft: '20px',
                    }}
                  >
                    Agendamentos
                  </p>
                </div>
              </Linha>

              <Linha>
                {schedulesList && schedulesList.length > 0 ? (
                  <CardContainer>
                    {schedulesList.map((schedule) => {
                      return (
                        <CardBox key={schedule.GAA_ID} style={{ width: '350px' }}>
                          <CardStripe color={schedule.GAA_FLG_STATUS === 1 ? '#3f51b5' : 'green'} />
                          <div
                            style={{
                              marginLeft: 30,
                              padding: '10px',
                              width: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div style={{ width: '100%' }}>
                              <div
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <p
                                  style={{
                                    fontWeight: 700,
                                    color: schedule.GAA_FLG_STATUS === 1 ? '#3f51b5' : 'green',
                                  }}
                                >
                                  {schedule.TIPO === 0 ? 'SUPERVISOR' : 'PROMOTOR'}
                                </p>
                                <p
                                  style={{
                                    fontWeight: 700,
                                    color: schedule.GAA_FLG_STATUS === 1 ? '#3f51b5' : 'green',
                                  }}
                                >
                                  AGENDADO
                                </p>
                              </div>
                              <p style={{ fontWeight: 700 }}>{schedule.USR_NOME}</p>
                              <p style={{ fontWeight: 700, color: '#898989' }}>{schedule.GAA_DTA_AGENDA}</p>
                              <p style={{ fontWeight: 700, color: '#898989' }}>{schedule.QTDE_CLIENTES} CLIENTES</p>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'row',
                                width: '100%',
                                justifyContent: 'flex-end',
                                marginTop: '10px',
                                gap: '10px',
                                alignSelf: 'end',
                              }}
                            >
                              <Button
                                className="waves-effect waves-light saib-button is-primary"
                                style={{ borderRadius: '4px', padding: '5px' }}
                                onClick={() => {
                                  if (this.state.renderConfirmReschedule) {
                                    return this.setState({ renderConfirmReschedule: false }, () => {
                                      this.setState({
                                        renderConfirmReschedule: true,
                                        changePromotorSchedule: schedule,
                                      });
                                    });
                                  }
                                  this.setState({ renderConfirmReschedule: true, changePromotorSchedule: schedule });
                                }}
                              >
                                <Icon tiny>people</Icon>
                                Trocar Profissional
                              </Button>
                              <Button
                                className="waves-effect waves-light saib-button is-primary"
                                style={{ borderRadius: '4px', padding: '5px' }}
                                onClick={() => {
                                  if (this.state.renderConfirmEditSchedule) {
                                    return this.setState({ renderConfirmEditSchedule: false }, () => {
                                      this.setState({
                                        renderConfirmEditSchedule: true,
                                        changePromotorSchedule: schedule,
                                        editPromotorSchedule: schedule,
                                      });
                                    });
                                  }
                                  this.setState({
                                    renderConfirmEditSchedule: true,
                                    changePromotorSchedule: schedule,
                                    editPromotorSchedule: schedule,
                                  });
                                }}
                              >
                                <Icon tiny>edit</Icon>
                                Alterar
                              </Button>
                              <Button
                                className="waves-effect waves-light saib-button is-primary"
                                style={{ borderRadius: '4px', padding: '5px' }}
                                onClick={() => this.setState({ renderConfirmDel: true, selectedToDel: schedule })}
                              >
                                <Icon tiny>delete</Icon>
                                Apagar
                              </Button>
                            </div>
                          </div>
                        </CardBox>
                      );
                    })}
                  </CardContainer>
                ) : (
                  clientsPromotorTable &&
                  clientsPromotorTable.length === 0 && (
                    <div
                      style={{
                        width: '100%',
                        textAlign: 'center',
                        height: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}
                    >
                      <p style={{ fontSize: '18px', fontWeight: 600 }}>
                        Sem agendamentos para os filtros selecionados!
                      </p>
                    </div>
                  )
                )}
              </Linha>
            </Tab>
            <Tab
              tabWidth={200}
              className="tabClient"
              active={pageActive === 1}
              options={{
                duration: 300,
                onShow: null,
                responsiveThreshold: Infinity,
                swipeable: true,
              }}
              title={'AGENDA SEMANAL'}
            >
              <>
                <Linha className="filter">
                  <ContentItem>
                    <SaibRadioGroup
                      style={{ padding: '5px' }}
                      valueItems={'"1","2"'}
                      classNameItems={'"supervisorTab2","promoterTab2"'}
                      textItems={'"Supervisor", "Promotor"'}
                      idItems={'"supervisorTab2", "promoterTab2"'}
                      classNameRadio="filterTypeScheduleTab2"
                      flexDirectionRadio="row"
                      disabledRadio="false"
                      defaultCheckedId={'all'}
                      captionRadio="Selecione um cargo"
                      onChange={async (value) => {
                        this.setState({
                          filterTypeScheduleTab2: value,
                        });
                      }}
                    />
                  </ContentItem>
                </Linha>
                {filterTypeScheduleTab2 === '1' && (
                  <>
                    <Labels>Supervisor</Labels>
                    <SelectQuery
                      ref={this.refSelectQuerySupervisor}
                      inputName="selectSupervisor"
                      itemSelected={supervisorTab2}
                      onChangeComponentIsExternal={false}
                      loading={false}
                      colorPrimary
                      query={supervisores}
                      keys={['USR_ID', 'USR_NOME']}
                      label="USR_NOME"
                      onChange={async () => {}}
                      onSelect={(item) => {
                        this.handleTableRender(null, item.USR_ID);
                        this.setState({ promotorTab2: '', TIPO: 0, supervisorTab2: item.USR_ID });
                      }}
                      onDelete={() => {
                        this.setState({
                          removeSupervisor: true,
                        });
                      }}
                    />
                  </>
                )}
                {filterTypeScheduleTab2 === '2' && (
                  <>
                    <Labels>Promotor</Labels>
                    <SelectQuery
                      ref={this.refSelectQueryPromoter}
                      inputName="selectPromoter"
                      itemSelected={promotorTab2}
                      onChangeComponentIsExternal={false}
                      loading={false}
                      colorPrimary
                      query={promotores}
                      keys={['USR_ID', 'USR_NOME']}
                      label="USR_NOME"
                      onChange={async () => {}}
                      onSelect={(item) => {
                        this.handleTableRender(null, item.USR_ID);
                        this.setState({ promotorTab2: item.USR_ID, TIPO: 1, supervisorTab2: '' });
                      }}
                      onDelete={() => {
                        this.setState({
                          removePromotor: true,
                        });
                      }}
                    />
                  </>
                )}

                {(!clientsPromotorTable || (clientsPromotorTable && clientsPromotorTable.length === 0)) && (
                  <div
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <p style={{ fontSize: '18px', fontWeight: 600 }}>Sem agendamentos para os filtros selecionados!</p>
                  </div>
                )}

                {clientsPromotorTable && (
                  <WeekBar
                    data={clientsPromotorTable}
                    schedule={resultPromotorTable}
                    lowerDate={lowerDate}
                    handleTableRender={(date) => this.handleTableRender(date, promotorTab2)}
                    type={typeof promotorTab2 === 'number' ? 2 : 1}
                    add={typeof promotorTab2 === 'number' || typeof supervisorTab2 === 'number'}
                    promotor={promotorTab2}
                    supervisor={supervisorTab2}
                    flowsData={flowsData.filter((e) => e.GAF_FLG_TIPO_USUARIO === TIPO)}
                  />
                )}

                {removePromotor && (
                  <Modal
                    actions={[
                      <>
                        <Button
                          className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                          onClick={() =>
                            this.setState({
                              resultPromotorTable: [],
                              clientsPromotorTable: [],
                              promotorTab2: '',
                              TIPO: '',
                              removePromotor: false,
                              lowerDate: new Date(),
                            })
                          }
                          color="primary"
                        >
                          Sim
                        </Button>
                        <Button
                          className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                          onClick={() => {
                            this.setState({ removePromotor: false });
                          }}
                          color="primary"
                        >
                          Não
                        </Button>
                      </>,
                    ]}
                    bottomSheet={false}
                    fixedFooter={true}
                    header={'Remover promotor selecionado'}
                    options={{
                      dismissible: true,
                      endingTop: '10%',
                      inDuration: 0,
                      onCloseStart: null,
                      onOpenEnd: null,
                      opacity: 0.5,
                      outDuration: 0,
                      preventScrolling: true,
                      startingTop: '4%',
                      onCloseEnd: () => {
                        this.setState({
                          removePromotor: false,
                        });
                      },
                    }}
                    open={removePromotor}
                  >
                    <div
                      style={{
                        overflowY: 'unset',
                        overflowX: 'hidden',
                        height: 'unset',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '16px',
                      }}
                    >
                      Você poderá perder dados não salvos, deseja continuar?
                    </div>
                  </Modal>
                )}
                {removeSupervisor && (
                  <Modal
                    actions={[
                      <>
                        <Button
                          className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                          onClick={() =>
                            this.setState({
                              resultPromotorTable: [],
                              clientsPromotorTable: [],
                              supervisorTab2: '',
                              TIPO: '',
                              removeSupervisor: false,
                              lowerDate: new Date(),
                            })
                          }
                          color="primary"
                        >
                          Sim
                        </Button>
                        <Button
                          className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                          onClick={() => {
                            this.setState({ removeSupervisor: false });
                          }}
                          color="primary"
                        >
                          Não
                        </Button>
                      </>,
                    ]}
                    bottomSheet={false}
                    fixedFooter={true}
                    header={'Remover supervisor selecionado'}
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
                    open={removeSupervisor}
                  >
                    <div
                      style={{
                        overflowY: 'unset',
                        overflowX: 'hidden',
                        height: 'unset',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '16px',
                      }}
                    >
                      Você poderá perder dados não salvos, deseja continuar?
                    </div>
                  </Modal>
                )}
              </>
            </Tab>
          </Tabs>
        </Container>

        {renderConfirmReschedule && (
          <Modal
            className="modalQuestion"
            actions={[
              <>
                <Button
                  className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                  onClick={async () => await this.handleChangePromoterSchedule()}
                  color="primary"
                >
                  Salvar
                </Button>
                <Button
                  className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                  onClick={() => {
                    this.cleanFilter();
                    this.setState({ renderConfirmReschedule: false });
                  }}
                  color="primary"
                >
                  Voltar
                </Button>
              </>,
            ]}
            bottomSheet={false}
            fixedFooter={true}
            header={'Reatribuição de agenda'}
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
            open={renderConfirmReschedule}
          >
            <div
              style={{
                overflowY: 'unset',
                overflowX: 'hidden',
                display: 'flex',
                width: '100%',
                height: '90%',
              }}
            >
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'start',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <CardBox style={{ width: '100%', margin: '30px' }}>
                  <CardStripe color={changePromotorSchedule.GAA_FLG_STATUS === 1 ? '#3f51b5' : 'green'} />
                  <div style={{ marginLeft: 30, padding: '10px', width: '100%' }}>
                    <p style={{ fontWeight: 700 }}>{changePromotorSchedule.USR_NOME}</p>
                    <p style={{ fontWeight: 700, color: '#898989' }}>{changePromotorSchedule.GAA_DTA_AGENDA}</p>
                    <p style={{ fontWeight: 700, color: '#898989' }}>{changePromotorSchedule.QTDE_CLIENTES} CLIENTES</p>
                  </div>
                </CardBox>

                <DivDetalhe flex={3} style={{ width: '100%', justifyContent: 'start' }}>
                  <div style={{ width: '100%' }}>
                    <Labels>Profissional</Labels>
                    <SelectQuery
                      inputName="selectAllEmploye"
                      itemSelected={employeSelected}
                      onChangeComponentIsExternal={false}
                      loading={false}
                      colorPrimary
                      query={allEmployees}
                      keys={['value', 'description']}
                      label="description"
                      onChange={async () => {}}
                      onSelect={(item) => {
                        this.handleManipulaallEmployes(item.value, item.description);
                      }}
                      onDelete={() => {
                        this.setState({ employeSelected: '', renderFlow: false, flowSelected: '' });
                      }}
                    />
                  </div>
                </DivDetalhe>
              </div>
            </div>
          </Modal>
        )}
        {renderConfirmEditSchedule && (
          <Modal
            className="modalQuestion"
            actions={[
              <>
                <Button
                  className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                  onClick={async () => await this.handleSaveNewSchedule(true)}
                  color="primary"
                >
                  Salvar
                </Button>
                <Button
                  className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                  onClick={() => {
                    this.cleanFilter();
                    this.setState({ renderConfirmEditSchedule: false });
                  }}
                  color="primary"
                >
                  Voltar
                </Button>
              </>,
            ]}
            bottomSheet={false}
            fixedFooter={true}
            header={'Alterar agenda'}
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
            open={renderConfirmEditSchedule}
          >
            <div
              style={{
                overflowY: 'unset',
                overflowX: 'hidden',
                display: 'flex',
                width: '100%',
                height: '90%',
              }}
            >
              <WaitScreen loading={loading} />
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'start',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <p style={{ width: '100%', fontSize: '18px', textAlign: 'center', fontWeight: 700 }}>
                  {this.getFormatedDate()}
                </p>
                <p style={{ width: '100%', fontSize: '18px', textAlign: 'center', fontWeight: 700 }}>
                  {changePromotorSchedule.USR_NOME}
                </p>
                <div style={{ width: '100%' }}>
                  <DivDetalhe flex={3} style={{ width: '100%', marginTop: '20px', justifyContent: 'start' }}>
                    <Labels>Clientes</Labels>
                    <SelectQuery
                      onChangeComponentIsExternal
                      colorPrimary
                      query={clientes}
                      keys={['CLI_ID', 'CLI_NOME_FANTASIA', 'CLI_RAZAO_SOCIAL']}
                      label="CLI_NOME_FANTASIA"
                      onChange={async (text) => {
                        await this.handleFilterCustomers(isNaN(text) ? text?.toUpperCase() : Number(text));
                      }}
                      onSelect={(item) => {
                        this.handleManipulaClients(item);
                      }}
                      onDelete={() => {
                        // console.log("here")
                      }}
                    />
                  </DivDetalhe>
                </div>

                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'end',
                    padding: '10px',
                    borderBottom: '1px solid #c2c2c2',
                    marginBottom: '20px',
                  }}
                ></div>
                {editPromotorSchedule.CLIENTES &&
                  editPromotorSchedule.CLIENTES.map((cli) => {
                    return (
                      <CardBox key={cli.CLI_ID} style={{ width: '100%', marginTop: '10px' }}>
                        <CardStripe color={changePromotorSchedule.GAA_FLG_STATUS === 1 ? '#3f51b5' : 'green'} />
                        <div style={{ marginLeft: 30, padding: '10px', width: '100%' }}>
                          <p style={{ fontWeight: 700 }}>
                            {cli.CLI_CODIGO} - {cli.CLI_NOME_FANTASIA}
                          </p>
                          <p style={{ fontWeight: 700, color: '#898989' }}>{cli.CLI_RAZAO_SOCIAL}</p>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              width: '100%',
                              justifyContent: 'end',
                              margin: '10px',
                              gap: '40px',
                            }}
                          >
                            <Button
                              className="waves-effect waves-light saib-button is-primary"
                              style={{ borderRadius: '4px', padding: '10px', marginRight: '10px' }}
                              onClick={() => this.deleteAppointmentsEdit(cli.CLI_ID)}
                            >
                              <Icon>delete</Icon>
                              Apagar
                            </Button>
                          </div>
                        </div>
                      </CardBox>
                    );
                  })}
              </div>
            </div>
          </Modal>
        )}
        {renderNewSchedule && (
          <Modal
            className="modalQuestion"
            actions={[
              <>
                <Button
                  className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                  onClick={async () => await this.handleSaveNewSchedule(false)}
                  color="primary"
                >
                  Salvar
                </Button>
                <Button
                  className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                  onClick={() => {
                    this.cleanFilter();
                    this.loadFilter();
                    this.setState({ renderNewSchedule: false });
                  }}
                  color="primary"
                >
                  Voltar
                </Button>
              </>,
            ]}
            bottomSheet={false}
            fixedFooter={true}
            header={'Criar Agendamento'}
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
            open={renderNewSchedule}
          >
            <div
              style={{
                overflowY: 'unset',
                overflowX: 'hidden',
                display: 'flex',
                width: '100%',
                height: '90%',
              }}
            >
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'start',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <WaitScreen loading={loading} />
                <p style={{ width: '100%', fontSize: '18px', textAlign: 'center', fontWeight: 700 }}>
                  {this.getFormatedDate(daySelected)}
                </p>
                {/* <p style={{ width: '100%', fontSize: '18px', textAlign: 'center', fontWeight: 700 }}>
                  {changePromotorSchedule.USR_NOME}
                </p> */}
                <div style={{ width: '100%' }}>
                  <Labels>Profissional</Labels>
                  <SelectQuery
                    inputName="selectAllEmploye"
                    onChangeComponentIsExterna
                    colorPrimary
                    query={allEmployees}
                    keys={['value', 'description']}
                    label="description"
                    onChange={async () => {}}
                    onSelect={(item) => {
                      this.handleManipulaallEmployes(item.value, item.description);
                    }}
                    onDelete={() => {
                      this.setState({ employeSelected: '', renderFlow: false, flowSelected: '' });
                    }}
                    fixBrokenMenu={true}
                  />
                </div>
                {renderFlow && (
                  <div style={{ width: '100%' }}>
                    <Labels>Fluxo</Labels>
                    <SelectQuery
                      inputName="selectFlow"
                      itemSelected={flowSelected}
                      onChangeComponentIsExternal={false}
                      loading={false}
                      colorPrimary
                      query={flowsData}
                      keys={['GAF_ID', 'GAF_DESCRICAO']}
                      label="GAF_DESCRICAO"
                      onChange={async () => {}}
                      onSelect={(item) => {
                        this.handleManipulaFlow(item.GAF_ID);
                      }}
                      onDelete={() => {
                        this.setState({ flowSelected: '' });
                      }}
                    />
                  </div>
                )}
                {flowSelected !== '' && (
                  <div style={{ width: '100%' }}>
                    <Labels>Clientes</Labels>
                    <SelectQuery
                      onChangeComponentIsExternal
                      colorPrimary
                      query={clientes}
                      keys={['CLI_ID', 'CLI_NOME_FANTASIA', 'CLI_RAZAO_SOCIAL']}
                      label="CLI_NOME_FANTASIA"
                      onChange={async (text) => {
                        await this.handleFilterCustomers(text?.toUpperCase());
                      }}
                      onSelect={(item) => {
                        this.handleManipulaClientsNewAppointment(item);
                      }}
                      onDelete={() => {
                        // console.log("here")
                      }}
                      fixBrokenMenu={true}
                    />
                  </div>
                )}
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'end',
                    padding: '10px',
                    borderBottom: '1px solid #c2c2c2',
                    marginBottom: '20px',
                  }}
                ></div>
                {selectedClientsAppointment.length > 0 &&
                  selectedClientsAppointment.map((cli) => {
                    return (
                      <CardBox key={cli.CLI_ID} style={{ width: '100%', marginTop: '10px' }}>
                        <CardStripe color={changePromotorSchedule.GAA_FLG_STATUS === 1 ? '#3f51b5' : 'green'} />
                        <div style={{ marginLeft: 30, padding: '10px', width: '100%' }}>
                          <p style={{ fontWeight: 700 }}>{cli.label}</p>
                          <p style={{ fontWeight: 700, color: '#898989' }}>{cli.CLI_RAZAO_SOCIAL}</p>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              width: '100%',
                              justifyContent: 'end',
                              margin: '10px',
                              gap: '40px',
                            }}
                          >
                            <Button
                              className="waves-effect waves-light saib-button is-primary"
                              style={{ borderRadius: '4px', padding: '10px', marginRight: '10px' }}
                              onClick={() => this.deleteAppointmentsNewAppointment(cli.CLI_ID)}
                            >
                              <Icon>delete</Icon>
                              Apagar
                            </Button>
                          </div>
                        </div>
                      </CardBox>
                    );
                  })}
              </div>
            </div>
          </Modal>
        )}
        {renderConfirmDel && (
          <Modal
            className="modalQuestion"
            actions={[
              <>
                <Button
                  className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                  onClick={async () => await this.handleDeleteSchedule(selectedToDel.GAA_ID)}
                  color="primary"
                >
                  Sim
                </Button>
                <Button
                  className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                  onClick={() => {
                    this.setState({ renderConfirmDel: false, selectedToDel: 0 });
                  }}
                  color="primary"
                >
                  Não
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
            open={renderConfirmDel}
          >
            <div
              style={{
                overflowY: 'unset',
                overflowX: 'hidden',
                display: 'flex',
                width: '100%',
                height: '90%',
                paddingTop: '20px',
              }}
            >
              <p>
                Deseja confirmar a exclusão do agendamento do {selectedToDel.TIPO === 0 ? 'Supervisor' : 'Promotor'}:
                &nbsp;&nbsp;<strong>{selectedToDel.USR_NOME}</strong> ?{' '}
              </p>
            </div>
          </Modal>
        )}
      </>
    );
  }
}

class FlexibleSchedule extends Component {
  render() {
    return <FlexibleScheduleComponent {...this.props} />;
  }
}

export default withRouter(FlexibleSchedule);
