import React, { Component } from 'react';
import { Container, Linha, DivDetalhe, Labels, UploadFile } from '../style';
import { Button, Icon, Collapsible, CollapsibleItem, Chip, Checkbox } from 'react-materialize';
import { alerta, dateFormat, tratarErros } from '../../../../services/funcoes';
import api from '../../../../services/api';
import M from 'materialize-css';
import WaitScreen from '../../../../Components/Globals/WaitScreen';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import SelectQuery from '../../../../Components/Globals/SelectQuery';
class NewSchedule extends Component {
  state = {
    clientesSelecionados: [],
    clientes: [],
    selectAll: false,
    sorted: [],
    loading: false,
  };

  handleUpdateLocalState = () => {
    let cidades = this.props.cidades;
    let vendedores = this.props.vendedores;
    let ramosAtividades = this.props.ramosAtividades;
    let cidadesChips = this.props.cidadesChips;
    let vendedoresChips = this.props.vendedoresChips;
    let ramosAtividadesChips = this.props.ramosAtividadesChips;
    let empresaAtiva = this.props.empresaAtiva;
    let usuarioAtivo = this.props.usuarioAtivo;
    let promotoresSelecionados = this.props.promotoresSelecionados;
    let scheduleType = this.props.scheduleType;
    let lastUpdate = this.props.lastUpdate;
    let supervisoresSelecionados = this.props.supervisoresSelecionados;
    let supervisores = this.props.supervisores;
    let promotores = this.props.promotores;
    let diaSelecionado = this.props.diaSelecionado;
    let clientesSelecionados = this.props.clientesSelecionados;
    let scheduleId = this.props.scheduleId;
    let fluxoSupervisoresSelecionados = this.props.fluxoSupervisoresSelecionados;
    let fluxoPromotoresSelecionados = this.props.fluxoPromotoresSelecionados;
    let fluxosSupervisores = this.props.fluxosSupervisores;
    let fluxosPromotores = this.props.fluxosPromotores;
    let diasSelecionados = this.props.diasSelecionados;
    let startDate = this.props.startDate;
    let endDate = this.props.endDate;
    let scheduleActive = this.props.scheduleActive;
    let disabledForm = this.props.disabledForm;
    let scheduleOnSaturdays = this.props.scheduleOnSaturdays;
    let scheduleOnSundays = this.props.scheduleOnSundays;

    this.setState({
      scheduleActive,
      fluxoSupervisoresSelecionados,
      fluxoPromotoresSelecionados,
      fluxosSupervisores,
      fluxosPromotores,
      scheduleId,
      clientesSelecionados,
      promotores,
      supervisores,
      scheduleType,
      supervisoresSelecionados,
      promotoresSelecionados,
      cidades,
      vendedores,
      ramosAtividades,
      cidadesChips,
      vendedoresChips,
      ramosAtividadesChips,
      empresaAtiva,
      usuarioAtivo,
      lastUpdate,
      diaSelecionado,
      diasSelecionados,
      startDate,
      endDate,
      disabledForm,
      scheduleOnSaturdays,
      scheduleOnSundays,
    });
  };

  componentDidMount = () => {
    this.handleUpdateLocalState();
  };

  componentDidUpdate = (prevProps, prevState) => {
    let { lastUpdate, clientes } = this.state;

    if (lastUpdate !== this.props.lastUpdate) {
      this.handleUpdateLocalState();
    }

    if (prevProps.diasSelecionados !== this.props.diasSelecionados) {
      this.handleUpdateLocalState();
    }

    if (prevProps.saveSchedule !== this.props.saveSchedule) {
      if (this.props.saveSchedule) {
        this.handleSaveSchedule();
      }
    }

    if (prevProps.clientesSelecionados !== this.props.clientesSelecionados) {
      this.setState({
        clientesSelecionados: this.props.clientesSelecionados,
      });
      if (this.props.clientesSelecionados.length === 0) {
        clientes.forEach((cliente) => {
          cliente.checked = false;
        });
      }

      // this.props.clientesSelecionados.length > 0 && this.handleSaveSchedule();
    }
  };

  loadCustomers = async () => {
    const { empresaAtiva, usuarioAtivo, clientesSelecionados } = this.state;
    try {
      this.setState({ loading: true });
      let vendedores = this.getSelectedVendedores();
      let ramosAtividades = this.getSelectedRamosAtividades();
      let cidades = this.getSelectedCidades();
      let url;
      url = '/v1/schedule/clientes/' + empresaAtiva + '/' + usuarioAtivo;
      let data = {
        vendedores,
        ramosAtividades,
        cidades,
      };
      const retorno = await api.post(url, data);
      let existeClientesSelecionados = clientesSelecionados.length > 0;
      if (retorno.data && retorno.data.sucess) {
        let clientes = retorno.data.data;
        let counter = 0;
        for (const dataItem of clientes) {
          if (existeClientesSelecionados) {
            dataItem.checked = clientesSelecionados.find((item) => item.CLI_ID === dataItem.CLI_ID) !== undefined;
          } else {
            dataItem.checked = false;
          }

          dataItem.counter = counter;
          // dataItem.checked = false;
          counter += 1;
        }

        this.setState({ clientes, loading: false });
      }
      this.setState({ loading: false });
    } catch (err) {
      alerta('Erro ao carregar os clientes =>' + err, 2);
      this.setState({ loading: false });
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

  getSelectedRamosAtividades = () => {
    let { ramosAtividadesSelecionados, ramosAtividades } = this.state;
    return this.makeIn(ramosAtividadesSelecionados, ramosAtividades, 'filtro', 'RAMO_ID');
  };

  getSelectedSupervisores = async () => {
    let { supervisoresSelecionados } = this.state;

    return supervisoresSelecionados;
  };

  getSelectedPromotores = async () => {
    let { promotoresSelecionados } = this.state;

    return promotoresSelecionados;
  };

  makeIn = (chipsElement, elements, searchText, searchKey, comAspas = true) => {
    let inElements = '';
    if (chipsElement === undefined || elements === undefined) {
      return inElements;
    }
    for (const element of chipsElement) {
      const _element = elements.find((elemento) => elemento[searchText] === element.tag);
      if (_element !== undefined) {
        inElements += (comAspas ? "'" : '') + _element[searchKey] + (comAspas ? "'" : '') + ',';
      }
    }
    if (inElements !== '') {
      return inElements.substr(0, inElements.length - 1);
    }
    return inElements;
  };

  getSelectedCidades = () => {
    let { cidadesSelecionadas, cidades } = this.state;
    return this.makeIn(cidadesSelecionadas, cidades, 'CIDADE', 'CIDADE');
  };

  getSelectedVendedores = () => {
    let { vendedoresSelecionados, vendedores } = this.state;
    return this.makeIn(vendedoresSelecionados, vendedores, 'filtro', 'VENDEDOR_ID');
  };

  getSelectedFluxoSupervisores = () => {
    let { fluxoSupervisoresSelecionados } = this.state;
    return fluxoSupervisoresSelecionados;
  };

  getSelectedFluxoPromotores = () => {
    let { fluxoPromotoresSelecionados } = this.state;
    return fluxoPromotoresSelecionados;
    // return this.makeIn(fluxoPromotoresSelecionados, fluxosPromotores, 'filtro', 'GAF_ID', false);
  };

  verifyIfHaveFiltersAplied = () => {
    const { vendedoresSelecionados, ramosAtividadesSelecionados, cidadesSelecionadas } = this.state;
    const objectToReturn = {
      vendedoresSelecionados,
      ramosAtividadesSelecionados,
      cidadesSelecionadas,
    };

    Object.keys(objectToReturn).forEach((key) => {
      if (!objectToReturn[key] || !objectToReturn[key]?.length > 0) {
        delete objectToReturn[key];
      }
    });

    return Object.values(objectToReturn).length > 0;
  };

  handleAllDataUpdate = () => {
    if (this.verifyIfHaveFiltersAplied()) {
      this.loadCustomers();
    } else {
      alerta('Preencha algum filtro para listar os clientes');
    }
  };

  handleManipulaCidades = (event, chip) => {
    if (document.getElementById('cidadesChips') !== undefined) {
      let dados = M.Chips.getInstance(document.getElementById('cidadesChips'));
      const { cidades } = this.state;
      let cidadesSelecionadas = [];
      if (dados !== undefined) {
        for (const chip of dados.chipsData) {
          if (cidades.find((item) => item.filtro === chip.tag) !== undefined) {
            cidadesSelecionadas.push(chip);
          }
        }
      } else {
        cidadesSelecionadas = [];
      }
      this.setState({ cidadesSelecionadas });
    }
  };

  handleManipulaVendedores = () => {
    if (document.getElementById('vendedoresChips') !== undefined) {
      let dados = M.Chips.getInstance(document.getElementById('vendedoresChips'));
      const { vendedores } = this.state;
      let vendedoresSelecionados = [];
      if (dados !== undefined) {
        for (const chip of dados.chipsData) {
          if (vendedores.find((item) => item.filtro === chip.tag) !== undefined) {
            vendedoresSelecionados.push(chip);
          }
        }
        // vendedoresSelecionados = dados.chipsData;
      } else {
        vendedoresSelecionados = [];
      }
      this.setState({ vendedoresSelecionados });
    }
  };

  handleManipulaRamosAtividades = () => {
    if (document.getElementById('ramosAtividadesChips') !== undefined) {
      let dados = M.Chips.getInstance(document.getElementById('ramosAtividadesChips'));
      const { ramosAtividades } = this.state;
      let ramosAtividadesSelecionados = [];
      if (dados !== undefined) {
        for (const chip of dados.chipsData) {
          if (ramosAtividades.find((item) => item.filtro === chip.tag) !== undefined) {
            ramosAtividadesSelecionados.push(chip);
          }
        }
        // vendedoresSelecionados = dados.chipsData;
      } else {
        ramosAtividadesSelecionados = [];
      }
      this.setState({ ramosAtividadesSelecionados });
    }
  };

  onClickSelectCustomer = async (checked, cliente) => {
    this.setState({
      loading: true,
    });
    const { daysFixed, typeDaySchedule } = this.props;
    const { clientes, diasSelecionados, clientesSelecionados, scheduleType } = this.state;
    cliente.checked = checked;

    let daysPickedUp = []
    if (typeDaySchedule === 1) {
      diasSelecionados.forEach((element) => {
        const hoursFinal = element.label.split('/', 3);
        const currentDay = `${hoursFinal[2]}-${hoursFinal[1]}-${hoursFinal[0]}`;

        const diaSemana = moment(currentDay).weekday();
        const current = daysFixed.some((e) => e === diaSemana);
        if (current) {
          daysPickedUp.push(element);
        }
      });
    } else {
      daysPickedUp = diasSelecionados
    }

    this.setState({ diasSelecionados: daysPickedUp })

    if (checked) {
      if (scheduleType === 1) {
        let daysScheduled = [];
        for (let dia of daysPickedUp) {
          const idpromotor = await this.getSelectedPromotores();

          await this.verifyHasScheduleChecked(cliente.CLI_ID, idpromotor, dia.label).then((res) => {
            const isScheduled = res[0];

            if (isScheduled) {
              daysScheduled.push(res[1]);
              this.removeSelectedCustomer(cliente);
            } else if (!isScheduled) {
              dia.idClientsSelecteds = [...dia.idClientsSelecteds, cliente.CLI_ID];
            } else {
              daysScheduled.push(res[1]);
              // countDaysAreScheduled++;
            }
          });
        }

        if (daysPickedUp.length === daysScheduled.length) {
          if (daysPickedUp.length === 1) {
            alerta(`Já existe agendamento para o cliente: ${cliente.CLI_RAZAO_SOCIAL} para a data selecionada`);
          } else {
            alerta(`Já existe agendamento para o cliente: ${cliente.CLI_RAZAO_SOCIAL} em todo o periodo selecionado!`);
          }
          this.removeSelectedCustomer(cliente);
        } else if (daysScheduled.length > 0) {
          if (daysScheduled.length === 1) {
            alerta(
              `Já existe agendamento para o cliente: ${cliente.CLI_RAZAO_SOCIAL} na data: ${daysScheduled.map(
                (date) => `${date}`
              )}, verifique`
            );
          } else {
            alerta(
              `Já existe agendamentos para o cliente: ${
                cliente.CLI_RAZAO_SOCIAL
              } nas seguintes datas: ${daysScheduled.map((date) => `\n ${date}`)}, verifique`
            );
          }
        } else {
          if (clientesSelecionados.find((item) => item.CLI_ID === cliente.CLI_ID) === undefined) {
            clientesSelecionados.push(cliente);
          }
        }

        this.setState(
          {
            clientesSelecionados,
            clienteAtualSelecionado: cliente,
          },
          () => {
            this.props.handleClientsSelecteds(clientesSelecionados);
          }
        );
      } else {
        const idSupervisor = await this.getSelectedSupervisores();
        let daysScheduled = [];
        for (let dia of daysPickedUp) {
          await this.verifyHasScheduleChecked(cliente.CLI_ID, idSupervisor, dia.label).then((res) => {
            const isScheduled = res[0];
            if (isScheduled) {
              daysScheduled.push(res[1]);
              this.removeSelectedCustomer(cliente);
            } else if (!isScheduled) {
              dia.idClientsSelecteds = [...dia.idClientsSelecteds, cliente.CLI_ID];
            }
          });
        }

        if (daysPickedUp.length === daysScheduled.length) {
          if (daysPickedUp.length === 1) {
            alerta(`Já existe agendamento para o cliente: ${cliente.CLI_RAZAO_SOCIAL} para a data selecionada`);
          } else {
            alerta(`Já existe agendamento para o cliente: ${cliente.CLI_RAZAO_SOCIAL} em todo o periodo selecionado!`);
          }
          this.removeSelectedCustomer(cliente);
        } else if (daysScheduled.length > 0) {
          if (daysScheduled.length === 1) {
            alerta(
              `Já existe agendamento para o cliente: ${cliente.CLI_RAZAO_SOCIAL} na data: ${daysScheduled.map(
                (date) => `${date}`
              )}, verifique`
            );
          } else {
            alerta(
              `Já existe agendamentos para o cliente: ${
                cliente.CLI_RAZAO_SOCIAL
              } nas seguintes datas: ${daysScheduled.map((date) => `\n ${date}`)}, verifique`
            );
          }
        } else {
          if (clientesSelecionados.find((item) => item.CLI_ID === cliente.CLI_ID) === undefined) {
            clientesSelecionados.push(cliente);
          }
        }

        this.setState(
          {
            diasSelecionados: daysPickedUp,
            clientesSelecionados,
            clienteAtualSelecionado: cliente,
          },
          () => {
            this.props.handleClientsSelecteds(clientesSelecionados);
          }
        );
      }
    } else {
      let _clientesSelecionados = clientesSelecionados.filter((item) => item.CLI_ID !== cliente.CLI_ID && cliente);

      daysPickedUp.forEach((dia) => {
        dia.idClientsSelecteds.forEach((id, i) => {
          if (parseInt(id) === parseInt(cliente.CLI_ID)) {
            const idToRemove = dia.idClientsSelecteds.splice(i, i + 1)[0];
            dia.idClientsSelecteds = dia.idClientsSelecteds.filter((id_) => id_ !== idToRemove && id);
          }
        });
      });
      this.setState(
        {
          diasSelecionados: daysPickedUp,
          clientesSelecionados: _clientesSelecionados,
          clientes,
        },
        () => {
          this.props.handleClientsSelecteds(_clientesSelecionados);
        }
      );
    }

    // setTimeout(() => {
    //   console.log(this.state.diasSelecionados);
    // }, 2000);
  };

  removeSelectedCustomer = (cliente) => {
    let { clientesSelecionados, clientes } = this.state;

    let _clientesSelecionados = clientesSelecionados.filter((item) => item.CLI_ID !== cliente.CLI_ID);

    let _cliente = clientes.find((item) => item.CLI_ID === cliente.CLI_ID);
    if (_cliente !== undefined) {
      _cliente.checked = false;
    }
    this.props.handleClientsSelecteds(_clientesSelecionados);
    this.setState({ clientesSelecionados: _clientesSelecionados, clientes });
  };

  unCheckDataPerClient = (idClient) => {
    const { diasSelecionados } = this.state;
    diasSelecionados.forEach((dia) => {
      dia.idClientsSelecteds.length > 0 &&
        dia.idClientsSelecteds.forEach((id_, i) => {
          if (parseInt(id_) === parseInt(idClient)) {
            const idToRemove = dia.idClientsSelecteds.splice(i, i + 1)[0];
            dia.idClientsSelecteds = dia.idClientsSelecteds.filter((id_) => id_ !== idToRemove && idClient);
          }
        });
    });

    this.setState({
      diasSelecionados,
    });
  };

  onClickSelectAll = () => {
    let { selectAll, clientes, clientesSelecionados } = this.state;

    selectAll = !selectAll;
    for (const cliente of clientes) {
      cliente.checked = selectAll;
      if (selectAll && clientesSelecionados.find((item) => item.CLI_ID === cliente.CLI_ID) === undefined) {
        clientesSelecionados.push(cliente);
      }
    }

    if (!selectAll) {
      for (let cliente of clientesSelecionados) {
        this.onClickSelectCustomer(false, cliente).then(() => {
          this.setState({
            loading: false,
          });
        });
      }
      clientesSelecionados = [];
    }

    if (clientesSelecionados.length > 0) {
      for (let cliente of clientesSelecionados) {
        this.onClickSelectCustomer(selectAll, cliente).then(() => {
          this.setState({
            loading: false,
          });
        });
      }
    }

    setTimeout(() => {
      this.setState({ clientes, selectAll, clientesSelecionados }, () =>
        this.props.handleClientsSelecteds(clientesSelecionados)
      );
    }, 200);
  };

  handleOrderBy = (campo) => {
    let { clientes, sorted } = this.state;

    let sortFinded = sorted.find((item) => item.CAMPO === campo);
    let ordem = 'ASC';
    if (sortFinded === undefined) {
      let sort = {};
      sort.CAMPO = campo;
      sort.ORDEM = ordem;
      sorted.push(sort);
    } else {
      sortFinded.ORDEM = sortFinded.ORDEM === 'ASC' ? 'DEC' : 'ASC';
      ordem = sortFinded.ORDEM;
    }

    // let clientes_ = clientes.sort((x, y)=>x[campo] < y[campo])
    // let clientes_ = clientes.sort((x, y)=> {return x.CLI_CODIGO < y.CLI_CODIGO})
    let clientes_;
    if (ordem === 'ASC') {
      clientes_ = clientes.sort((a, b) => (a[campo] > b[campo] ? 1 : b[campo] > a[campo] ? -1 : 0));
    } else {
      clientes_ = clientes.sort((a, b) => (a[campo] < b[campo] ? 1 : b[campo] < a[campo] ? -1 : 0));
    }
    let counter = 0;
    for (const cliente of clientes_) {
      cliente.counter = counter;
      counter += 1;
    }

    this.setState({ clientes: clientes_, sorted });
  };

  handleValidateSave = () => {
    const { clientesSelecionados, supervisoresSelecionados, scheduleType, promotoresSelecionados } = this.state;
    let result = '';

    if (scheduleType === 1) {
      //supervisor
      if (promotoresSelecionados === undefined || promotoresSelecionados.length === 0) {
        result += 'Selecione um promotor antes de salvar.\n';
      }
      if (this.getSelectedFluxoPromotores() === '') {
        result += 'Selecione um fluxo de pesquisa para o seu agendamento.\n';
      }
    } else {
      if (supervisoresSelecionados === undefined || supervisoresSelecionados.length === 0) {
        result += 'Selecione um supervisor antes de salvar.\n';
      }
      if (this.getSelectedFluxoSupervisores() === '') {
        result += 'Selecione um fluxo de pesquisa para o seu agendamento.\n';
      }
    }
    if (clientesSelecionados.length === 0) {
      result += 'Selecione um ou mais clientes antes de salvar.\n';
    }
    return result;
  };

  onChangeSelectDates = async (e, dia, diasSelecionados) => {
    const { scheduleType, clienteAtualSelecionado, clientes } = this.state;
    if (e.target.checked) {
      if (scheduleType === 1) {
        const idpromotor = await this.getSelectedPromotores();
        if (!idpromotor) {
          alerta('Necessário selecionar um promotor');
          this.unCheckDataPerClient(clienteAtualSelecionado.CLI_ID);
        } else {
          const isCheckSchedule = await this.verifyHasScheduleChecked('', idpromotor, dia.label);

          if (!isCheckSchedule) {
            // dia.idClientsSelecteds = [
            //   ...dia.idClientsSelecteds,
            //   clienteAtualSelecionado.CLI_ID,
            // ];
            // clientes.forEach((cliente) => {
            //   if (cliente.CLI_ID === clienteAtualSelecionado.CLI_ID) {
            //     cliente.dataSchedule = dia.label;
            //     cliente.datasSchedule = cliente?.datasSchedule
            //       ? [...cliente?.datasSchedule, ` | ${dia.label}`]
            //       : dia.label;
            //   }
            // });
            this.setState({
              diasSelecionados,
            });
          } else {
            this.setState({
              diasSelecionados,
            });
          }
        }
      } else {
        const idSupervisor = this.getSelectedSupervisores();
        if (!idSupervisor) {
          alerta('Necessário selecionar um supervisor');
          this.unCheckDataPerClient(clienteAtualSelecionado.CLI_ID);
        } else {
          const isCheckSchedule = await this.verifyHasScheduleChecked('', idSupervisor, dia.label);
          if (!isCheckSchedule) {
            dia.idClientsSelecteds = [...dia.idClientsSelecteds, clienteAtualSelecionado.CLI_ID];
            clientes.forEach((cliente) => {
              if (cliente.CLI_ID === clienteAtualSelecionado.CLI_ID) {
                cliente.dataSchedule = dia.label;
                cliente.datasSchedule = cliente?.datasSchedule ? [...cliente?.datasSchedule, dia.label] : [dia.label];
              }
            });
            this.setState({
              diasSelecionados,
            });
          } else {
            this.setState({
              diasSelecionados,
            });
          }
        }
      }
    } else {
      const newDays = diasSelecionados.map((dia_) => {
        if (dia_ === dia) {
          dia_.idClientsSelecteds = [];
        }
        return dia_;
      });
      this.setState({
        diasSelecionados: newDays,
      });
    }
  };

  verifyHasScheduleChecked = async (idCliente, idProfessional, dia) => {
    let dia_ = String(dia);
    const { startDate, endDate } = this.state;
    const dataToSend = {
      usuarioAgenda: String(idProfessional),
      dataInicial: dateFormat(startDate),
      dataFinal: endDate ? dateFormat(endDate) : '',
    };

    const res = await api.post(`v1/schedule/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`, dataToSend);
    const { data, sucess } = res.data;

    if (sucess) {
      if (data.length > 0) {
        const res = await isCheckedSchedule(data);
        return res;
      } else return false;
    } else return false;

    async function isCheckedSchedule(data) {
      let datesAreScheduleded = '';
      const isScheduled = data.every((schedule) => {
        if (schedule.GAA_DTA_AGENDA === dia_ && schedule.GAA_USR_ID_AGENDA === parseInt(idProfessional)) {
          return schedule.CLIENTES.every((cliente) => {
            if (cliente.CLI_ID === parseInt(idCliente)) {
              datesAreScheduleded = schedule.GAA_DTA_AGENDA;
              // alerta(
              //   `Já existe agendamento para o dia ${schedule.GAA_DTA_AGENDA} com esse profissional e cliente: ${cliente.CLI_RAZAO_SOCIAL} não será agendado novamente somente neste dia!`,
              //   0
              // );

              return false;
            } else {
              return true;
            }
          });
        } else return true;
      });
      return [!isScheduled, datesAreScheduleded];
    }
  };

  verifyIfClientSelectedSomeDate = () => {
    const { clienteAtualSelecionado, diasSelecionados, clientes } = this.state;
    let clientInSomeSchedule = false;
    diasSelecionados.forEach((dia) => {
      if (dia.idClientsSelecteds.length > 0) {
        dia.idClientsSelecteds.forEach((id) => {
          clienteAtualSelecionado.CLI_ID === parseInt(id) && (clientInSomeSchedule = true);
        });
      }
    });
    if (!clientInSomeSchedule) {
      clientes.forEach((cliente) => {
        if (cliente.CLI_ID === clienteAtualSelecionado.CLI_ID) {
          cliente.checked = false;
          this.removeSelectedCustomer(cliente);
        }
      });
      this.setState({
        clientes,
      });
      alerta('Cliente não pôde ser adicionado, deve-se selecionar uma data', 0);
    }
  };

  verifyDayInsideDaysFixedOfWeek = (day) => {
    const { daysFixed } = this.props;

    const date = moment(moment(day.label, 'DD/MM/yyyy')._d);
    const positionDay = moment(date).weekday();

    return !daysFixed.every((day_) => {
      if (day_ !== positionDay) return true;
      else return false;
    });
  };

  handleSave = async () => {
    this.setState({
      loading: true,
    });

    const {
      diaSelecionado,
      clientesSelecionados,
      empresaAtiva,
      usuarioAtivo,
      scheduleId,
      scheduleType,
      scheduleActive,
    } = this.state;
    const { action, typeDaySchedule } = this.props;
    const { diasSelecionados } = this.state;
    let scheduledDays = [];

    if (action && action === 'novo') {
      for (let dia of diasSelecionados) {
        let clientsAgroupeds = [];
        if (dia.idClientsSelecteds.length > 0) {
          if (typeDaySchedule === 1) {
            const dayOutsideOfDaysFixedOfWeek = this.verifyDayInsideDaysFixedOfWeek(dia);

            if (!dayOutsideOfDaysFixedOfWeek) {
              continue;
            }
          }

          clientsAgroupeds = dia.idClientsSelecteds.map((id) => {
            return clientesSelecionados.find((cliente) => cliente.CLI_ID === id && cliente);
            // clientsAgroupeds.push(cliente);
          });

          let data = {
            scheduleId,
            scheduleType,
            clientes: clientsAgroupeds.filter((item) => item !== undefined),
            supervisor: await this.getSelectedSupervisores(),
            promotor: await this.getSelectedPromotores(),
            fluxo: scheduleType === 0 ? this.getSelectedFluxoSupervisores() : this.getSelectedFluxoPromotores(),
            diaSelecionado: dia.label,
            scheduleActive: scheduleActive,
          };

          let url = '/v1/schedule/add/' + empresaAtiva + '/' + usuarioAtivo;
          const res = await api.post(url, data);
          const { sucess } = res.data;
          if (sucess) {
            scheduledDays.push(dia.label);
            this.props.history.push('/Schedules');
          } else {
            alerta(`Erro ao salvar ${dia.label}`, 1);
            this.props.history.push('/Schedules');
            tratarErros(res.data);
          }
        }
      }

      if (scheduledDays.length > 1) {
        alerta(`Agendamentos salvos com sucesso para os dias: ${scheduledDays.map((date) => `\n ${date}`)}`, 1);
      } else {
        alerta(`Agendamento salvo com sucesso para o dia: ${scheduledDays.map((date) => `${date}`)}`, 1);
      }
    }

    if (action && action === 'editar') {
      let data = {
        gaaId: scheduleId,
        fluxo: scheduleType === 0 ? this.getSelectedFluxoSupervisores() : this.getSelectedFluxoPromotores(),
        scheduleType,
        scheduleStatus: scheduleActive,
        supervisor: await this.getSelectedSupervisores(),
        promotor: await this.getSelectedPromotores(),
        scheduleActive,
        diaSelecionado,
        clientes: clientesSelecionados,
      };

      let url = '/v1/schedule/' + empresaAtiva + '/' + usuarioAtivo;
      const res = await api.put(url, data);
      const { sucess } = res.data;
      if (sucess) {
        alerta(`Agendamento(s) salvo com sucesso `, 1);
        this.props.history.push('/Schedules');
      } else {
        alerta(`Erro ao salvar  `, 2);
        this.props.history.push('/Schedules');
        tratarErros(res.data);
      }
    }

    this.setState({
      loading: false,
    });
  };

  handleSaveSchedule = async () => {
    let validateReturn = this.handleValidateSave();
    if (validateReturn !== '') {
      alerta(validateReturn, 1);
      return;
    }

    try {
      this.setState({ loading: true });
      this.handleSave();

      this.setState({ loading: false });
    } catch (err) {
      alerta('Erro ao salvar o agendamento =>' + err, 2);
      this.setState({ loading: false });
    }
  };

  handleChangeFile = async (event) => {
    this.setState({
      loading: true,
    });
    var file = event.target.files[0];
    await this.loadFileSelected(file);
    this.setState({ loading: false });
  };

  loadFileSelected = async (file) => {
    const dataToSend = new FormData();
    dataToSend.append('file', file);

    try {
      const res = await api.post('v1/upload/local/excel', dataToSend);

      const { data, sucess } = res.data;

      if (sucess) {
        this.setState(
          {
            nameFile: data,
          },
          () => this.handleClientsPerFile()
        );
      } else {
        alerta('Erro ao carregar arquivo, verifique');
      }
    } catch (error) {
      alerta('Erro ao carregar arquivo, verifique');
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  handleClientsPerFile = async () => {
    this.setState({
      loading: true,
    });
    const { nameFile } = this.state;

    const dataToSend = {
      vendedores: '',
      ramosAtividades: '',
      cidades: '',
      nomeArquivo: nameFile,
    };

    try {
      const res = await api.post(
        `v1/schedule/clientes/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
        dataToSend
      );
      const { data, sucess } = res.data;

      if (sucess) {
        this.setState({
          clientes: data,
        });
      } else {
        alerta('Erro ao listar clientes, verifique');
      }
    } catch (error) {
      alerta('Erro ao listar clientes, verifique');
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  render() {
    const {
      loading,
      ramosAtividadesChips,
      vendedoresChips,
      cidadesChips,
      vendedoresSelecionados,
      cidadesSelecionadas,
      ramosAtividadesSelecionados,
      clientes,
      selectAll,
      clientesSelecionados,
      // diasSelecionados,
      disabledForm,
    } = this.state;
    return (
      <Container className="newSchedule">
        <WaitScreen loading={loading} />

        <DivDetalhe>
          <Labels>Clientes selecionados: {clientesSelecionados.length}</Labels>
        </DivDetalhe>
        <Linha style={{ flexDirection: 'row' }}>
          {clientesSelecionados.map((cliente, i) => (
            <React.Fragment key={i}>
              <div
                className="chip"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => this.removeSelectedCustomer(cliente)}
              >
                <p>{cliente.CLI_CODIGO + ' - ' + cliente.CLI_RAZAO_SOCIAL}</p>
                <Icon>close</Icon>
              </div>
            </React.Fragment>
          ))}
        </Linha>

        <Collapsible
          accordion={false}
          style={{
            width: '100%',
            borderStyle: 'none',
            boxShadow: 'none',
          }}
        >
          <CollapsibleItem
            expanded
            header="Clique para filtrar e selecionar clientes"
            icon={<Icon>filter_list</Icon>}
            node="div"
          >
            <Linha>
              <DivDetalhe flex="1">
                <Labels>Clientes</Labels>
                <SelectQuery
                  onChangeComponentIsExternal
                  loading={this.state?.loadingSelectQuery}
                  colorPrimary
                  query={clientes}
                  keys={['CLI_ID', 'CLI_NOME_FANTASIA']}
                  label="CLI_NOME_FANTASIA"
                  onChange={async (text) => {
                    await this.handleFilterCustomers(isNaN(text) ? text?.toUpperCase() : Number(text));
                  }}
                  onSelect={(item) => {
                    this.setState({
                      customerSelected: item,
                    });
                  }}
                  onDelete={() => {
                    this.setState({
                      customerSelected: null,
                    });
                  }}
                />
              </DivDetalhe>
            </Linha>
            <Linha className="topLine">
              <DivDetalhe flex={3}>
                <Labels>Vendedores</Labels>
                <Chip
                  id="vendedoresChips"
                  className="vendedoresChips"
                  close={false}
                  closeIcon={<Icon className="close">close</Icon>}
                  options={{
                    data: vendedoresSelecionados !== undefined ? vendedoresSelecionados : [],
                    onChipAdd: this.handleManipulaVendedores,
                    onChipDelete: this.handleManipulaVendedores,
                    autocompleteOptions: {
                      data: vendedoresChips,
                      limit: 1,
                      onAutocomplete: function noRefCheck() {},
                    },
                  }}
                />
              </DivDetalhe>
              <DivDetalhe flex={3}>
                <Labels>Cidades</Labels>
                <Chip
                  id="cidadesChips"
                  className="cidadesChips"
                  close={false}
                  closeIcon={<Icon className="close">close</Icon>}
                  options={{
                    data: cidadesSelecionadas !== undefined ? cidadesSelecionadas : [],
                    onChipAdd: this.handleManipulaCidades,
                    onChipDelete: this.handleManipulaCidades,
                    autocompleteOptions: {
                      data: cidadesChips,
                      limit: 1,
                      onAutocomplete: function noRefCheck() {},
                    },
                  }}
                />
              </DivDetalhe>
            </Linha>

            <Linha>
              <DivDetalhe flex={3}>
                <Labels>Ramos Atividades</Labels>
                <Chip
                  id="ramosAtividadesChips"
                  className="ramosAtividadesChips"
                  close={false}
                  closeIcon={<Icon className="close">close</Icon>}
                  options={{
                    data: ramosAtividadesSelecionados !== undefined ? ramosAtividadesSelecionados : [],
                    onChipAdd: this.handleManipulaRamosAtividades,
                    onChipDelete: this.handleManipulaRamosAtividades,
                    autocompleteOptions: {
                      data: ramosAtividadesChips,
                      limit: 1,
                      onAutocomplete: function noRefCheck() {},
                    },
                  }}
                />
              </DivDetalhe>

              <DivDetalhe paddingLess>
                <UploadFile>
                  <label
                    htmlFor="input-file"
                    className="waves-effect waves-light saib-button is-primary"
                    onClick={() => document.getElementById('fileClients').click()}
                  >
                    Listar por arquivo
                  </label>

                  <input
                    id="fileClients"
                    type="file"
                    value=""
                    accept=".xlsx, .xls, .csv"
                    onChange={(event) => this.handleChangeFile(event)}
                  />
                  <span id="file-name"></span>
                </UploadFile>
                {/* <Labels>Listar por arquivo</Labels>
                <input
                  id="searchImage"
                  type="file"
                  value=""
                  accept=".xlsx, .xls, .csv"
                  onChange={(event) => this.handleChangeFile(event)}
                />
                <span id="file-name"></span> */}
              </DivDetalhe>
              <DivDetalhe paddingLess>
                <Button
                  className="waves-effect waves-light saib-button is-primary"
                  onClick={() => {
                    this.handleAllDataUpdate();
                  }}
                >
                  Filtrar
                </Button>
              </DivDetalhe>
              <DivDetalhe paddingLess>
                <Button
                  className="waves-effect waves-light saib-button is-primary"
                  onClick={() => {
                    this.setState({
                      cidadesSelecionadas: [],
                      vendedoresSelecionados: [],
                      ramosAtividadesSelecionados: [],
                      clientes: [],
                      sorted: [],
                    });
                  }}
                >
                  Limpar
                </Button>
              </DivDetalhe>
            </Linha>
            {clientes !== undefined && clientes.length > 0 && (
              <>
                <Linha className="contentClients">
                  <table>
                    <thead>
                      <tr>
                        <td className="th-checkAll">
                          <Checkbox
                            disabled={disabledForm}
                            className="customerSelector"
                            checked={selectAll}
                            label=""
                            value="true"
                            id={`selectAllCustomer`}
                            onChange={() => this.onClickSelectAll()}
                          />
                        </td>
                        <td
                          className="th-cod"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            this.handleOrderBy('CLI_CODIGO');
                          }}
                        >
                          Código
                        </td>
                        <td
                          className="th-razaoSocial"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            this.handleOrderBy('CLI_RAZAO_SOCIAL');
                          }}
                        >
                          Razão Social
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.clientes.map((cliente, i) => (
                        <React.Fragment key={i}>
                          <tr
                            className={cliente.checked ? 'active' : 'normal'}
                            // style={{
                            //   backgroundColor:
                            //     cliente.counter % 2 !== 0
                            //       ? 'rgba(126,58,157,0.1)'
                            //       : 'white',
                            // }}
                          >
                            <td className="checkClient">
                              <Checkbox
                                disabled={disabledForm}
                                className="customerSelector"
                                label=""
                                value="true"
                                id={`cliente${cliente.CLI_ID}`}
                                checked={cliente.checked ? true : false}
                                onChange={async (e) => {
                                  this.onClickSelectCustomer(e.target.checked, cliente).then(() => {
                                    this.setState({
                                      loading: false,
                                    });
                                  });
                                }}
                              />
                            </td>
                            <td>{cliente.CLI_CODIGO} </td>
                            <td className="td-nameClient">
                              <p>{cliente.CLI_RAZAO_SOCIAL}</p>
                              <small>{cliente.CLI_NOME_FANTASIA}</small>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </Linha>
              </>
            )}
          </CollapsibleItem>
        </Collapsible>
      </Container>
    );
  }
}

export default withRouter(NewSchedule);
