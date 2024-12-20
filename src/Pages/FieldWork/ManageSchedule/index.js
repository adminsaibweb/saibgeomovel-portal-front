import React, { Component, forwardRef } from 'react';
import { withRouter } from 'react-router';
import DirectTituloJanela from '../../../Components/Globals/DirectTituloJanela';
import WaitScreen from '../../../Components/Globals/WaitScreen';
import Header from '../../../Components/System/Header';
import SaibRadioGroup from '../../../Components/Globals/SaibRadioGroup';
import { Container, Content, ContentDate, DivDetalhe, DivSelect, Labels, Line, Td, Th, Tr } from './style';
import { Button, Icon, Modal, Table } from 'react-materialize';
import { addDays, differenceInDays, format, isAfter, isBefore, parse, startOfDay } from 'date-fns';
import api from '../../../services/api';
import { getFromStorage } from '../../../services/auth';
import { getLocalObject, setLocalObject } from '../../../services/databaseLocal';
import SelectQuery from '../../../Components/Globals/SelectQuery';
import { alerta } from '../../../services/funcoes';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ptBR from 'date-fns/locale/pt-BR';

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

class ManageSchedule extends Component {
  state = {
    loading: false,
    data: [],
    originData: [],
    fluxo: null,
    filterSelected: 3,
    dataErros: '',
    selectedRows: [],
    gridApi: null,
    percentage: 0,
    message: 0,
    flowsData: [],
    renderFluxo: false,
    flowSelected: '',
    startDate: new Date(),
    endDate: new Date(),
    errors: {},
    customSelectedInitial: 0,
    customSelectedEnd: 0,
    typeDaySchedule: 0,
  };

  refSelectQuery = React.createRef(null);

  componentDidMount = async () => {
    try {
      let originData = [];
      await this.carregarVariaveisEstado();

      let resValidate = [];
      const dataLocal = await getLocalObject('ManageSchedule');
      if (dataLocal) {
        originData = dataLocal?.data || this.props.location.state || [];
        resValidate = dataLocal.resValidate || [];
      }

      let fluxo = Object.entries(originData[0]);
      fluxo = fluxo[0][0];
      this.validateData(originData, resValidate, fluxo);

      const url = `v1/schedule/allfilter/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`;
      try {
        const { data } = await api.get(url);
        const flowsData = data.data.fluxos;
        if (data.sucess) {
          if (flowsData.filter((flow) => flow.GAF_FLG_TIPO_USUARIO === 1).length === 1) {
            this.setState({ flowSelected: flowsData.find((flow) => flow.GAF_FLG_TIPO_USUARIO === 1).GAF_ID });
          }
          this.setState({ flowsData });
        }
      } catch (e) {
      } finally {
      }

      this.setState({ fluxo });
    } catch (error) {}
  };

  carregarVariaveisEstado = async () => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      empresaCnpj: sessao.empresaCnpj,
    });
  };

  validateData = async (dataValidate, validates, fluxo) => {
    const { empresaAtiva, usuarioAtivo } = this.state;

    const arrayAux = validates || [];
    this.setState({ loading: true, percentage: 5, message: 'Começando validação de dados' });
    await Promise.allSettled(
      dataValidate.map(async (item, i) => {
        let add = {};
        try {
          const parser = Object.values(item);
          const dateSplit = parser[2].split('/');
          const date = format(new Date(`20${dateSplit[2]}`, dateSplit[0] - 1, dateSplit[1]), 'dd/MM/yyyy');
          const idAux = `${parser[0]}_${date}`;

          const exist = validates.find((e) => e.id === idAux);

          if (!exist) {
            const clientes = [];
            parser.slice(3, parser.length).map((ele) => clientes.push(ele));
            const payload = {
              promotor: parser[1].toLowerCase().includes('promotor') ? parser[0] : null,
              supervisor: parser[1].toLowerCase().includes('supervisor') ? parser[0] : null,
              data: date,
              clientes: clientes.reduce((f, s) => `${f},${s}`),
            };
            const add = {
              id: `${parser[0]}_${date}`,
              idAux: `${parser[0]}_${parser[1]}`,
              clientes: [],
              cargo: parser[0],
              diaSelecionado: date,
              typeCargo: parser[1],
              error: null,
              promotor: [],
              supervisor: [],
              rejected: [],
            };
            const res = await api.get(`v1/schedule/import/validate/${empresaAtiva}/${usuarioAtivo}`, {
              params: payload,
            });

            const { sucess, data } = res.data;
            if (sucess) {
              if (data.clientes.length > 0) {
                if (data.promotor && data.promotor.length > 0) {
                  add.clientes = data.clientes;
                  add.promotor = data.promotor;
                }
                if (data.supervisor && data.supervisor.length > 0) {
                  add.clientes = data.clientes;
                  add.supervisor = data.supervisor;
                }
                if (data.promotor && data.promotor.length === 0 && parser[1].toLowerCase() === 'promotor') {
                  add.rejected.push({ id: add.cargo, error: 'Codigo de promotor não existe.' });
                }
                if (data.supervisor && data.supervisor.length === 0 && parser[1].toLowerCase() === 'supervisor') {
                  add.rejected.push({ id: add.cargo, error: 'Codigo de supervisor não existe.' });
                }
                arrayAux.push(add);

                const dataLocal = await getLocalObject('ManageSchedule');
                const resValidateLocal = arrayAux;
                await setLocalObject('ManageSchedule', {
                  file: dataLocal?.file,
                  data: dataLocal?.data,
                  resValidate: resValidateLocal,
                });
              } else {
                if (data.clientes.length === 0) {
                  const clientsList = clientes.map((cli) => {
                    return {
                      id: cli,
                      error: 'Codigo de cliente não encontrado no sistema.',
                    };
                  });
                  add.rejected.push(...clientsList);
                }
                arrayAux.push(add);
              }
            }
            if (i % 5 !== 0) {
              this.setState({ percentage: this.state.percentage + 1, message: 'Organizando agendamentos' });
            }
          }
        } catch (error) {
          add.error = error;
          arrayAux.push(add);
        } finally {
        }
      })
    );
    this.setState({ percentage: 90, message: 'Organizando agendamentos' });
    const arrayCargo = [];
    const allClients = arrayAux
      .map((schedules) =>
        schedules.clientes.map((cli) => {
          return {
            ...cli,
            date: schedules.diaSelecionado,
          };
        })
      )
      .flat();
    arrayAux.forEach((element) => {
      const scheduled = element.clientes.filter((e) => e.AGENDAMENTO !== 0).length;
      const existCarg = arrayCargo.findIndex((e) => e.id === element.idAux);
      const elementClients = element.clientes.map((cli) => cli.ID);
      const verify = allClients.filter((cli) => elementClients.includes(cli.ID) && cli.date === element.diaSelecionado);
      if (existCarg !== 'undefined' && existCarg !== -1) {
        arrayCargo[existCarg].data = [
          ...(arrayCargo[existCarg].data || []),
          {
            date: element.diaSelecionado,
            agendado: scheduled,
            clientes_payload: element.clientes.map((cli) => {
              return {
                ...cli,
                date: element.diaSelecionado,
                promotor: element.promotor || [{ NOME: element.idAux || '-' }],
                supervisor: element.supervisor || [{ NOME: element.idAux || '-' }],
                cargo: element.typeCargo,
                error:
                  verify.length > elementClients.length
                    ? 'Cliente com agendamento repetido.'
                    : cli.AGENDAMENTO !== 0
                      ? fluxo === 'id'
                        ? 'O agendamento do cliente sera transferido para o promotor da importação.'
                        : 'Cliente já agendado.'
                      : 'Pronto Para Importação.',
                idCargo: element.cargo,
              };
            }),
            rejected: element.rejected,
            clientes: element.clientes.map((ele) => {
              return `${ele.CODIGO} - ${ele.NOME}`;
            }),
          },
        ];
      } else {
        const obj = {
          id: element.idAux,
          idCargo: element.cargo,
          cargo: element.typeCargo,
          fluxo,
          promotor: element.promotor || [{ NOME: element.idAux || '-' }],
          supervisor: element.supervisor || [{ NOME: element.idAux || '-' }],
          data: [
            {
              date: element.diaSelecionado,
              agendado: scheduled,
              clientes_payload: element.clientes.map((cli) => {
                return {
                  ...cli,
                  date: element.diaSelecionado,
                  promotor: element.promotor || [{ NOME: element.idAux || '-' }],
                  supervisor: element.supervisor || [{ NOME: element.idAux || '-' }],
                  cargo: element.typeCargo,
                  error:
                    verify.length > elementClients.length
                      ? 'Cliente com agendamento repetido.'
                      : cli.AGENDAMENTO !== 0
                        ? fluxo === 'id'
                          ? 'O agendamento do cliente sera transferido para o promotor da importação.'
                          : 'Cliente já agendado.'
                        : 'Pronto Para Importação.',
                  idCargo: element.cargo,
                };
              }),
              rejected: element.rejected,
              clientes: element.clientes.map((ele) => {
                return `${ele.CODIGO} - ${ele.NOME}`;
              }),
            },
          ],
        };

        arrayCargo.push(obj);
      }
    });
    this.setState({ loading: false });
    let initialSelected = arrayCargo.map((obj) => obj.data.map((data) => data.clientes_payload).flat()).flat();
    this.setState({
      data: arrayCargo.map((data) => {
        if (data.error === 'Cliente já agendado') {
          return { ...data, error: '', clienteAgendado: true };
        }
        return data;
      }),
      originData: arrayCargo.map((data) => {
        if (data.error === 'Cliente já agendado') {
          return { ...data, error: '', clienteAgendado: true };
        }
        return data;
      }),
      fluxo,
      selectedRows:
        fluxo === 'id'
          ? initialSelected.filter(
              (agnd) =>
                agnd.error === 'Pronto Para Importação.' ||
                agnd.error === 'O agendamento do cliente sera transferido para o promotor da importação.'
            )
          : initialSelected.filter((agnd) => agnd.error === 'Pronto Para Importação.'),
    });
  };

  selectAll = () => {
    let { data, rowsSelects, arrayIds } = this.state;

    data.forEach((item) => {
      const parser = Object.values(item);
      const id = `${parser[0]}_${parser[2]}_${parser[3]}`;
      rowsSelects = [...rowsSelects, item];
      arrayIds = [...arrayIds, id];
    });

    this.setState({ rowsSelects, arrayIds });
  };

  agruparPorCodigoPessoaEData = (array) => {
    const grupos = {};
    array.forEach((obj) => {
      const agruparPorPessoaEData = (pessoa) => {
        pessoa.forEach((p) => {
          if (grupos.hasOwnProperty(p.CODIGO)) {
            if (grupos[p.CODIGO].hasOwnProperty(obj.date)) {
              grupos[p.CODIGO][obj.date].push(obj);
            } else {
              grupos[p.CODIGO][obj.date] = [obj];
            }
          } else {
            grupos[p.CODIGO] = {};
            grupos[p.CODIGO][obj.date] = [obj];
          }
        });
      };

      if (obj.hasOwnProperty('promotor') && Array.isArray(obj.promotor)) {
        // Agrupar por promotor
        agruparPorPessoaEData(obj.promotor);
      }

      if (obj.hasOwnProperty('supervisor') && Array.isArray(obj.supervisor)) {
        agruparPorPessoaEData(obj.supervisor);
      }
    });
    return grupos;
  };

  findSameWeekdayInRange = (start, end, targetDay) => {
    const result = [];
    let currentDate = addDays(startOfDay(start), 1);

    while (currentDate.getDay() !== targetDay) {
      currentDate = addDays(currentDate, 1);
    }

    while (isBefore(currentDate, end) || currentDate.getTime() === end.getTime()) {
      result.push(currentDate);
      currentDate = addDays(currentDate, 7);
    }

    return result;
  };

  confirmSchedule = async () => {
    let { empresaAtiva, usuarioAtivo, fluxo, data, selectedRows, flowSelected, startDate, endDate, typeDaySchedule } =
      this.state;

    try {
      this.setState({ loading: true, message: 'Importando Agendamentos', percentage: 50 });
      let dataAux = data;
      const groupedRows = this.agruparPorCodigoPessoaEData(selectedRows);
      await Promise.allSettled(
        Object.values(groupedRows)
          .map((grp) => Object.values(grp))
          .map(async (grpDate, index) => {
            try {
              grpDate.map(async (item) => {
                const payload = {
                  clientes: [
                    ...item.map((cli) => {
                      return {
                        CLI_ID: cli.ID,
                        CLI_CODIGO: cli.CODIGO,
                        CLI_RAZAO_SOCIAL: cli.NOME,
                        CLI_NOME_FANTASIA: cli.NOME,
                      };
                    }),
                  ],
                  scheduleType: item[0].cargo.toLowerCase() === 'supervisor' ? 0 : 1,
                  supervisor: item[0].cargo.toLowerCase() === 'supervisor' ? item[0].idCargo : null,
                  promotor: item[0].cargo.toLowerCase() === 'promotor' ? item[0].idCargo : null,
                  fluxo: flowSelected ? flowSelected : fluxo,
                  diaSelecionado: item[0].date,
                  scheduleActive: 1,
                };

                const originalDate = parse(payload.diaSelecionado, 'dd/MM/yyyy', new Date());
                const targetDay = originalDate.getDay();

                const sameWeekdays = this.findSameWeekdayInRange(startDate, endDate, targetDay);

                const createAgendamentos = (agendamentoBase, dates) => {
                  return dates.map((date) => ({
                    ...agendamentoBase,
                    diaSelecionado: format(date, 'dd/MM/yyyy'),
                  }));
                };

                let res;
                const agendamentosReplicados = createAgendamentos(payload, sameWeekdays);
                const agendamentosIds = item.map((cli) => cli.AGENDAMENTO);
                const uniqueAgendamentosIds = [...new Set(agendamentosIds)];
                const retornosDeleteAgenda = [];
                if (uniqueAgendamentosIds.length > 0) {
                  uniqueAgendamentosIds.forEach(async (id) => {
                    const delInfo = await api.delete(`v1/schedule/${empresaAtiva}/${usuarioAtivo}/${id}`);
                    retornosDeleteAgenda.push(delInfo.data.sucess);
                  });
                }
                if (retornosDeleteAgenda.filter((ret) => ret === false).length === 0) {
                  if (fluxo === 'id' && typeDaySchedule === 1) {
                    Promise.all(
                      agendamentosReplicados.map(async (agd) => {
                        if (fluxo === 'id' && item.error !== 'Pronto Para Importação.') {
                          const verifySchedulePayload = {
                            usuarioAgenda: Number(agd.promotor),
                            status: 1,
                            dataInicial: agd.diaSelecionado,
                            dataFinal: agd.diaSelecionado,
                          };
                          const verifySchedule = await api.post(
                            `v1/schedule/${empresaAtiva}/${usuarioAtivo}`,
                            verifySchedulePayload
                          );
                          if (verifySchedule.data.data.length > 0 && verifySchedule.data.sucess) {
                            const deleteSchedule = await api.delete(
                              `v1/schedule/${empresaAtiva}/${usuarioAtivo}/${verifySchedule.data.data[0].GAA_ID}`
                            );
                            if (deleteSchedule.data.sucess) {
                              res = await api.post(`v1/schedule/add/${empresaAtiva}/${usuarioAtivo}`, agd);
                            }
                          } else {
                            res = await api.post(`v1/schedule/add/${empresaAtiva}/${usuarioAtivo}`, agd);
                          }
                        } else {
                          res = await api.post(`v1/schedule/add/${empresaAtiva}/${usuarioAtivo}`, agd);
                        }
                        const { error, sucess } = res.data;
                        let arrayAux = [];
                        let add = {};
                        try {
                          const date = agd.diaSelecionado;
                          const idAux = `${agd.promotor}_${date}`;

                          const exist = data.find((e) => e.id === idAux);

                          if (!exist) {
                            const clientes = [];
                            const validatePayload = {
                              promotor: agd.promotor || null,
                              supervisor: agd.supervisor || null,
                              data: date,
                              clientes: agd.clientes.map((cli) => cli.CLI_CODIGO).join(','),
                            };
                            const add = {
                              id: `${agd.promotor}_${date}`,
                              idAux: `${agd.promotor || agd.supervisor}_${agd.supervisor ? 'supervisor' : 'promotor'}`,
                              clientes: [],
                              cargo: agd.supervisor ? 'supervisor' : 'promotor',
                              diaSelecionado: date,
                              typeCargo: agd.supervisor ? 'supervisor' : 'promotor',
                              error: null,
                              promotor: [],
                              supervisor: [],
                              rejected: [],
                            };
                            const res = await api.get(`v1/schedule/import/validate/${empresaAtiva}/${usuarioAtivo}`, {
                              params: validatePayload,
                            });

                            const { sucess: sucessValidade, data: reqData } = res.data;
                            if (sucessValidade) {
                              if (reqData.clientes.length > 0) {
                                if (reqData.promotor && reqData.promotor.length > 0) {
                                  add.clientes = reqData.clientes;
                                  add.promotor = reqData.promotor;
                                }
                                if (reqData.supervisor && reqData.supervisor.length > 0) {
                                  add.clientes = reqData.clientes;
                                  add.supervisor = reqData.supervisor;
                                }
                                if (reqData.promotor && reqData.promotor.length === 0 && agd.promotor) {
                                  add.rejected.push({ id: add.cargo, error: 'Codigo de promotor não existe.' });
                                }
                                if (reqData.supervisor && reqData.supervisor.length === 0 && agd.supervisor) {
                                  add.rejected.push({ id: add.cargo, error: 'Codigo de supervisor não existe.' });
                                }
                                arrayAux.push(add);
                              } else {
                                if (data.clientes.length === 0) {
                                  const clientsList = clientes.map((cli) => {
                                    return {
                                      id: cli,
                                      error: 'Codigo de cliente não encontrado no sistema.',
                                    };
                                  });
                                  add.rejected.push(...clientsList);
                                }
                                arrayAux.push(add);
                              }
                            }
                          }
                        } catch (error) {
                          add.error = error;
                          arrayAux.push(add);
                        } finally {
                        }

                        const arrayCargo = [];

                        arrayAux.forEach((element) => {
                          const scheduled = element.clientes.filter((e) => e.AGENDAMENTO !== 0).length;

                          const obj = {
                            id: element.idAux,
                            idCargo: element.cargo,
                            cargo: element.typeCargo,
                            fluxo,
                            promotor: element.promotor || [{ NOME: element.idAux || '-' }],
                            supervisor: element.supervisor || [{ NOME: element.idAux || '-' }],
                            data: [
                              {
                                date: element.diaSelecionado,
                                agendado: scheduled,
                                clientes_payload: element.clientes.map((cli) => {
                                  return {
                                    ...cli,
                                    date: element.diaSelecionado,
                                    promotor: element.promotor || [{ NOME: element.idAux || '-' }],
                                    supervisor: element.supervisor || [{ NOME: element.idAux || '-' }],
                                    cargo: element.typeCargo,
                                    error: sucess ? 'Importado com sucesso!' : error,
                                    idCargo: element.cargo,
                                  };
                                }),
                                rejected: element.rejected,
                                clientes: element.clientes.map((ele) => {
                                  return `${ele.CODIGO} - ${ele.NOME}`;
                                }),
                              },
                            ],
                          };

                          arrayCargo.push(obj);
                        });
                        const clientsCodes = item.map((cli) => cli.CODIGO);
                        if (!sucess) {
                          dataAux = dataAux.map((dAux) => {
                            return {
                              ...dAux,
                              data: [
                                ...dAux.data.map((data) => {
                                  return {
                                    ...data,
                                    clientes_payload: data.clientes_payload.map((cliP) => {
                                      if (cliP.date === item[0].date && clientsCodes.includes(cliP.CODIGO)) {
                                        return { ...cliP, error: error };
                                      } else {
                                        return cliP;
                                      }
                                    }),
                                  };
                                }),
                                ...arrayCargo[0].data.map((data) => {
                                  return {
                                    ...data,
                                    clientes_payload: data.clientes_payload.map((cliP) => {
                                      if (cliP.date === item[0].date && clientsCodes.includes(cliP.CODIGO)) {
                                        return { ...cliP, error: error };
                                      } else {
                                        return cliP;
                                      }
                                    }),
                                  };
                                }),
                              ],
                            };
                          });
                        } else {
                          dataAux = dataAux.map((dAux) => {
                            return {
                              ...dAux,
                              data: [
                                ...dAux.data.map((data) => {
                                  return {
                                    ...data,
                                    clientes_payload: [
                                      ...data.clientes_payload.map((cliP) => {
                                        if (cliP.date === item[0].date && clientsCodes.includes(cliP.CODIGO)) {
                                          return { ...cliP, error: 'Importado com sucesso!' };
                                        } else {
                                          return cliP;
                                        }
                                      }),
                                    ],
                                  };
                                }),
                                ...arrayCargo[0].data.map((data) => {
                                  return {
                                    ...data,
                                    clientes_payload: [
                                      ...data.clientes_payload.map((cliP) => {
                                        if (cliP.date === item[0].date && clientsCodes.includes(cliP.CODIGO)) {
                                          return { ...cliP, error: 'Importado com sucesso!' };
                                        } else {
                                          return cliP;
                                        }
                                      }),
                                    ],
                                  };
                                }),
                              ],
                            };
                          });
                        }
                        this.setState({ data: dataAux, loading: false  });
                      })
                    );
                  } else {
                    if (typeDaySchedule === 0 && item.error !== 'Pronto Para Importação.') {
                      const verifySchedulePayload = {
                        usuarioAgenda: Number(payload.promotor),
                        status: 1,
                        dataInicial: payload.diaSelecionado,
                        dataFinal: payload.diaSelecionado,
                      };
                      const verifySchedule = await api.post(
                        `v1/schedule/${empresaAtiva}/${usuarioAtivo}`,
                        verifySchedulePayload
                      );
                      if (verifySchedule.data.data.length > 0 && verifySchedule.data.sucess) {
                        const deleteSchedule = await api.delete(
                          `v1/schedule/${empresaAtiva}/${usuarioAtivo}/${verifySchedule.data.data[0].GAA_ID}`
                        );
                        if (deleteSchedule.data.sucess) {
                          res = await api.post(`v1/schedule/add/${empresaAtiva}/${usuarioAtivo}`, payload);
                        }
                      } else {
                        res = await api.post(`v1/schedule/add/${empresaAtiva}/${usuarioAtivo}`, payload);
                      }
                    } else {
                      res = await api.post(`v1/schedule/add/${empresaAtiva}/${usuarioAtivo}`, payload);
                    }

                    const { error, sucess } = res.data;
                    const clientsCodes = item.map((cli) => cli.CODIGO);
                    if (!sucess) {
                      dataAux = dataAux.map((dAux) => {
                        return {
                          ...dAux,
                          data: dAux.data.map((data) => {
                            return {
                              ...data,
                              clientes_payload: data.clientes_payload.map((cliP) => {
                                if (cliP.date === item[0].date && clientsCodes.includes(cliP.CODIGO)) {
                                  return { ...cliP, error: error };
                                } else {
                                  return cliP;
                                }
                              }),
                            };
                          }),
                        };
                      });
                    } else {
                      dataAux = dataAux.map((dAux) => {
                        return {
                          ...dAux,
                          data: dAux.data.map((data) => {
                            return {
                              ...data,
                              clientes_payload: data.clientes_payload.map((cliP) => {
                                if (cliP.date === item[0].date && clientsCodes.includes(cliP.CODIGO)) {
                                  return { ...cliP, error: 'Importado com sucesso!' };
                                } else {
                                  return cliP;
                                }
                              }),
                            };
                          }),
                        };
                      });
                    }
                    this.setState({ data: dataAux, loading: false  });
                  }
                } else {
                  alerta('Erro ao realizar reagendamento.');
                }
              });
            } catch (error) {
              console.log(error);
            }
          })
      );
    } catch (e) {
    } finally {
      setTimeout(() => {
        this.setState({ });
      }, 1000);
    }
  };

  handleRadioGroup = (e) => {
    this.setState({ filterSelected: Number(e) });
  };

  handleManipulaFlow = (flowSelected) => {
    if (flowSelected) {
      this.setState({ flowSelected });
    }
  };

  onChangeTipoDayAgendamento = (e) => {
    this.setState({
      typeDaySchedule: parseInt(e),
      // fluxoPromotoresSelecionados: [],
      // fluxoSupervisoresSelecionados: [],
    });
  };

  handleStartDateChange = async (date) => {
    const { endDate } = this.state;
    const today = new Date();

    if (isBefore(date, today)) {
      alerta('A data inicial não pode ser menor que o dia de hoje.');
      return;
    }

    if (endDate && isAfter(date, endDate)) {
      alerta('A data inicial não pode ser maior que a data final.');
      return;
    }

    if (endDate && differenceInDays(endDate, date) > 60) {
      alerta('O período entre a data inicial e a data final não deve ser maior que 60 dias.');
      return;
    }

    this.setState({ startDate: date });
  };

  handleEndDateChange = async (date) => {
    const { startDate } = this.state;

    if (startDate && isAfter(startDate, date)) {
      alerta('A data final não pode ser menor que a data inicial.');
      return;
    }

    if (startDate && differenceInDays(date, startDate) > 90) {
      alerta('O período entre a data inicial e a data final não deve ser maior que 90 dias.');
      return;
    }

    this.setState({ endDate: date });
  };

  render() {
    const {
      loading,
      data,
      filterSelected,
      selectedRows,
      percentage,
      message,
      renderFluxo,
      flowsData,
      flowSelected,
      fluxo,
      startDate,
      endDate,
      errors,
      customSelectedInitial,
      customSelectedEnd,
      typeDaySchedule,
    } = this.state;

    return (
      <>
        <Header />
        <WaitScreen loading={loading} percent={percentage} message={message} />
        <Container>
          <DirectTituloJanela
            urlVoltar={'/schedules'}
            titulo={
              loading ? (
                'Aguarde...'
              ) : (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon>schedule</Icon>Gerenciar agenda
                </span>
              )
            }
          />

          <main>
            <div style={{ width: '100%' }}>
              <p
                style={{
                  width: '100%',
                  textAlign: 'center',
                  fontSize: '24px',
                  color: '#8e44ad',
                  fontWeight: 700,
                  padding: '10px 0px',
                  borderBottom: '1px solid #c2c2c2',
                }}
              >
                {fluxo === 'id' ? 'Modelo 2' : 'Modelo 1'}
              </p>
            </div>
            <div style={{ width: '95%', display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <div style={{ width: '20%' }}></div>
              <SaibRadioGroup
                valueItems={'"0","1", "2", "3"'}
                classNameItems={'"itemagendados","itemValidados", "comErro", "itemTodos"'}
                textItems={'"Já agendados","Validados", "Com erro", "Todos"'}
                idItems={'"itemagendados","itemValidados", "comErro", "itemTodos"'}
                flexDirectionRadio="row"
                disabledRadio="false"
                defaultCheckedId={'itemTodos'}
                captionRadio={<>Filtrar</>}
                onChange={this.handleRadioGroup}
              />
              <button
                style={{ marginBottom: '0.5rem', width: '12rem' }}
                className="saib-button is-primary"
                onClick={async () => {
                  data[0].fluxo === 'id' ? this.setState({ renderFluxo: true }) : await this.confirmSchedule();
                }}
              >
                Importar agenda
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {data.map((item, index) => {
                let parseData;
                if (filterSelected === 0) {
                  parseData = item.data
                    .filter((t) => t.clientes_payload.some((tst) => tst.AGENDAMENTO > 0))
                    .map((data) => {
                      if (data.clientes_payload.some((cli) => cli.AGENDAMENTO !== 0)) {
                        const scheduledClients = data.clientes_payload.filter((cli) => cli.AGENDAMENTO > 0);
                        return {
                          ...data,
                          clientes_payload: scheduledClients,
                          error: undefined,
                        };
                      }
                      return { ...data };
                    });
                }

                if (filterSelected === 1) {
                  parseData = item.data
                    .filter((t) => t.rejected.length === 0 && !t.clientes_payload.every((tst) => tst.AGENDAMENTO > 0))
                    .map((data) => {
                      if (data.clientes_payload.some((cli) => cli.AGENDAMENTO !== 0)) {
                        return {
                          ...data,
                          error: undefined,
                        };
                      }
                      return { ...data };
                    });
                }

                if (filterSelected === 2) {
                  parseData = item.data
                    .filter((t) => t.rejected.length > 0 && t.rejected[0].error !== 'Importado com sucesso!')
                    .map((data) => {
                      if (data.clientes_payload.some((cli) => cli.AGENDAMENTO !== 0)) {
                        return {
                          ...data,
                          error: undefined,
                        };
                      }
                      return { ...data };
                    });
                }

                if (filterSelected === 3) {
                  parseData = item.data.map((data) => {
                    if (data.clientes_payload.some((cli) => cli.AGENDAMENTO !== 0)) {
                      return {
                        ...data,
                        error: undefined,
                      };
                    }
                    return { ...data };
                  });
                }

                parseData = parseData.sort((a, b) => {
                  if (a.rejected.length > 0 && b.rejected.length === 0) {
                    return 1;
                  } else if (a.rejected.length === 0 && b.rejected.length > 0) {
                    return -1;
                  } else {
                    return 0;
                  }
                });
                return (
                  <div style={{ padding: '10px', margin: '10px 0px' }} key={index}>
                    {parseData.map((data, i) => {
                      return (
                        <div key={i}>
                          {data.rejected.length > 0 && filterSelected !== 0 && (
                            <Content>
                              {i === 0 && (
                                <p style={{ fontSize: '16px', fontWeight: '700', margin: '5px 0px' }}>
                                  {item.cargo} -{' '}
                                  {item.promotor.length > 0
                                    ? item.promotor[0]?.NOME || 'N/A'
                                    : item.supervisor[0]?.NOME || 'N/A'}
                                </p>
                              )}
                              <DivDetalhe style={{ border: '' }}>
                                <p style={{ fontSize: '14px', fontWeight: '700', color: 'red', margin: '10px 0px' }}>
                                  Erros
                                </p>
                                <p style={{ fontSize: '14px', fontWeight: '700', margin: '10px 0px' }}>{data.date}</p>
                                <Table className="table-scroll small-first-col">
                                  <thead>
                                    <tr style={{ backgroundColor: '#8e44ad', border: '1px solid #8e44ad' }}>
                                      <Th style={{ width: '45%' }}>Codigo</Th>
                                      <Th style={{ width: '45%' }}>Menssagem</Th>
                                    </tr>
                                  </thead>
                                  <tbody className="body-half-screen">
                                    {data.rejected.map((agnd, index) => {
                                      return (
                                        <Tr key={`${i} - ${index}`}>
                                          <Td>&nbsp;&nbsp;{agnd.id}</Td>
                                          <Td>
                                            <div>
                                              <p
                                                style={{
                                                  display: 'inline-block',
                                                  lineHeight: '30px',
                                                  borderRadius: '4px',
                                                  padding: '0px 8px',
                                                  color: '#fff',
                                                  backgroundColor: '#FF413E',
                                                }}
                                              >
                                                {agnd.error}
                                              </p>
                                            </div>
                                          </Td>
                                        </Tr>
                                      );
                                    })}
                                  </tbody>
                                </Table>
                              </DivDetalhe>
                            </Content>
                          )}
                          {data.clientes_payload.length > 0 && (
                            <Content>
                              {i === 0 && (
                                <p style={{ fontSize: '16px', fontWeight: '700', margin: '5px 0px' }}>
                                  {item.cargo} -{' '}
                                  {item.promotor.length > 0
                                    ? item.promotor[0]?.NOME || 'N/A'
                                    : item.supervisor[0]?.NOME || 'N/A'}
                                </p>
                              )}
                              <DivDetalhe style={{ border: '' }}>
                                <p style={{ fontSize: '14px', fontWeight: '700', margin: '10px 0px' }}>{data.date}</p>
                                <Table className="table-scroll small-first-col">
                                  <thead>
                                    <tr style={{ backgroundColor: '#8e44ad', border: '1px solid #8e44ad' }}>
                                      <Th style={{ width: '10%', borderRadius: '0px', paddingLeft: '5px' }}>
                                        {' '}
                                        N. Agendamento
                                      </Th>
                                      <Th style={{ width: '45%' }}>Cliente</Th>
                                      <Th style={{ width: '45%' }}>Menssagem</Th>
                                    </tr>
                                  </thead>
                                  <tbody className="body-half-screen">
                                    {data.clientes_payload.map((agnd, index) => {
                                      return (
                                        <Tr key={`${i} - ${index}`}>
                                          <Td
                                            onClick={() => {
                                              if (agnd.error !== 'Pronto Para Importação.' && fluxo !== 'id') {
                                                return;
                                              }
                                              let alreadySelected =
                                                selectedRows.filter(
                                                  (selected) =>
                                                    selected.date === agnd.date && selected.CODIGO === agnd.CODIGO
                                                ).length > 0;
                                              if (alreadySelected) {
                                                return this.setState({
                                                  selectedRows: selectedRows.filter(
                                                    (sr) => !(sr.date === agnd.date && sr.CODIGO === agnd.CODIGO)
                                                  ),
                                                });
                                              }
                                              this.setState({ selectedRows: [...selectedRows, agnd] });
                                            }}
                                          >
                                            {(agnd.AGENDAMENTO === 0 ||
                                              (agnd.error === 'Cliente já agendado' && fluxo === 'id')) && (
                                              <input
                                                type="checkbox"
                                                disabled={
                                                  fluxo === 'id'
                                                    ? agnd.error === 'Cliente já agendado'
                                                      ? false
                                                      : agnd.error !== 'Pronto Para Importação.'
                                                    : false
                                                }
                                                checked={
                                                  selectedRows.filter(
                                                    (selected) =>
                                                      selected.date === agnd.date && selected.CODIGO === agnd.CODIGO
                                                  ).length > 0
                                                }
                                                onChange={() => {}}
                                                style={{
                                                  cursor: 'pointer',
                                                  position: 'unset',
                                                  opacity: '1',
                                                  transform: 'scale(1.5)',
                                                  margin: '0px 10px',
                                                  filter: 'grayscale(59%) hue-rotate(63deg)',
                                                }}
                                              />
                                            )}
                                            &nbsp;&nbsp;{agnd.AGENDAMENTO}
                                          </Td>
                                          <Td flex="1">{agnd.NOME}</Td>
                                          <Td>
                                            <p
                                              style={{
                                                display: 'inline-block',
                                                lineHeight: '30px',
                                                borderRadius: '4px',
                                                padding: '0px 8px',
                                                color: '#fff',
                                                backgroundColor:
                                                  agnd.error === 'Cliente já agendado.' ||
                                                  agnd.error === 'Codigo de promotor não existe.' ||
                                                  agnd.error === 'Codigo de supervisor não existe.' ||
                                                  agnd.error === 'Codigo de cliente não encontrado no sistema.' ||
                                                  agnd.error === 'Cliente com agendamento repetido.'
                                                    ? '#FF413E'
                                                    : agnd.error === 'Importado com sucesso!' ||
                                                        agnd.error === 'Pronto Para Importação.'
                                                      ? 'green'
                                                      : '#2E6AFF',
                                              }}
                                            >
                                              {agnd.error}
                                            </p>
                                          </Td>
                                        </Tr>
                                      );
                                    })}
                                  </tbody>
                                </Table>
                              </DivDetalhe>
                            </Content>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </main>
          {renderFluxo && (
            <Modal
              className="modalQuestion"
              actions={[
                <>
                  <Button
                    className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                    onClick={async () => this.confirmSchedule()}
                    color="primary"
                    disabled={flowSelected === ''}
                  >
                    Sim
                  </Button>
                  <Button
                    className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                    onClick={() => {
                      this.setState({ renderFluxo: false });
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
              open={renderFluxo}
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
                  justifyContent: 'space-around',
                }}
              >
                <p> Selecione o periodo e o fluxo para qual os agendamentos devem ser realizados. </p>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', marginTop: '20px' }}>
                  <Labels>Data/periodo para visita</Labels>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div>
                      <SaibRadioGroup
                        // readOnly={disabledForm}
                        valueItems={'"0","1"'}
                        classNameItems={'"nextWeek","period"'}
                        textItems={'"Próxima Semana","Periodo"'}
                        idItems={'"nextWeek","period"'}
                        classNameRadio="TipoAgendamento"
                        flexDirectionRadio="row"
                        disabledRadio="false"
                        captionRadio={<></>}
                        defaultCheckedId={typeDaySchedule === 0 ? 'nextWeek' : 'period'}
                        onChange={this.onChangeTipoDayAgendamento}
                      />
                    </div>
                    {typeDaySchedule === 1 && (
                      <ContentDate disabled={false} style={{ marginLeft: '20px' }}>
                        <Labels className="labelPeriodDate">Data/periodo para visita</Labels>
                        <div>
                          <Line>
                            <DatePicker
                              selected={startDate}
                              onChange={this.handleStartDateChange}
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
                              // readOnly={disabledForm}
                              onChange={this.handleEndDateChange}
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
                      </ContentDate>
                    )}
                  </div>
                </div>
                <DivSelect flex={3} style={{ width: '100%' }}>
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
                    fixBrokenMenu={true}
                  />
                </DivSelect>
              </div>
            </Modal>
          )}
        </Container>
      </>
    );
  }
}

export default withRouter(ManageSchedule);
