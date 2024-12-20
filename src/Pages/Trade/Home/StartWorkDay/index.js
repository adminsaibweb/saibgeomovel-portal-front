import React, { Component, Fragment } from 'react';
import { Link, withRouter } from 'react-router-dom';
import {
  Labels,
  Container,
  Linha,
  DivDetalhe,
  SubContainerTitle,
  FooterPage,
  Titulo,
  StopWatch,
  Alert,
} from '../style';
import Question from '../../../../Components/Globals/Question';
import { getFromStorage } from '../../../../services/auth';
import { Icon, Button } from 'react-materialize';
import { getLocalObject, getGps, setGps, delLocalObject } from '../../../../services/databaseLocal';
import './forced.css';
import {
  alerta,
  formatDateTimeToBr,
  haveData,
  diffInSeconds,
  weekDay,
  getScheduleData,
  updateScheduleData,
  dataHoraAtual,
} from '../../../../services/funcoes';
import {
  makeRoute,
  syncLocationData,
  syncLocalData,
  setStatusSchedule,
  scheduleExecution,
  schedulePaused,
  startWorkDay,
  isOnline,
  checkAlert,
  handleButtonRefreshRelease,
  forceSyncLocalData,
} from '../tradeGlobalFunctions';
import WaitScreen from '../../../../Components/Globals/WaitScreen';
import { EnviromentVars } from '../../../../config/env';
import TradeLocation from '../../../../Components/FieldWork/TradeLocation';
import { deleteDB } from 'idb';
import { format, formatISO } from 'date-fns';
// import TradeLocation from '../TradeLocation';

class StartWorkDay extends Component {
  hasUnmounted = false;
  state = {
    loading: false,
    lastUpdate: 0,
    percent: 0,
    GAL_OBSERVACAO: '',
    GAL_GAT_ID: undefined,
    interruptForced: -1,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalTimeInSeconds: 0,
    intervalRaio: undefined,
    interval: undefined,
    searchs: undefined,
    endOfJourney: false,
  };

  componentDidMount = async () => {
    try {
      let { intervalRaio, interruptForced } = this.state;
      await this.carregarVariaveisEstado();
      let forceCommit = this.props.history.location.state.forceCommit;

      this.setState({ forceCommit });
      this.setState({ loading: true, percent: 0, message: undefined });

      let scheduleData = await getScheduleData();
      const weekDayInterrupt = weekDay(new Date());

      if (weekDayInterrupt === 'Sábado') {
        scheduleData.HORARIOS_TRABALHO.INICIO_JORNADA = scheduleData?.HORARIOS_TRABALHO?.INICIO_JORNADA_SA;
        scheduleData.HORARIOS_TRABALHO.FIM_JORNADA = scheduleData?.HORARIOS_TRABALHO?.FIM_JORNADA_SA;
        scheduleData.HORARIOS_TRABALHO.INICIO_PARADA1 = scheduleData?.HORARIOS_TRABALHO?.INICIO_PARADA1_SA;
        scheduleData.HORARIOS_TRABALHO.FIM_PARADA1 = scheduleData?.HORARIOS_TRABALHO?.FIM_PARADA1_SA;
        scheduleData.HORARIOS_TRABALHO.FORCAR_PARADA1 = scheduleData?.HORARIOS_TRABALHO?.FORCAR_PARADA1_SA;
      }

      this.setState({ scheduleData });
      await this.handleWorkSchedule();

      await this.startWorkDay();
      await this.handleInterruptsForced();

      const intervalInterrupted = setInterval(async () => {
        await this.handleInterruptsForced(scheduleData);
      }, EnviromentVars.timerCronometerInterrupt);
      this.setState({ intervalInterrupted });

      if (forceCommit) {
        await this.handleSaveState(false);
      }

      this.getActualPosition();

      let timerGps = setInterval(() => {
        this.getActualPosition();
      }, EnviromentVars.gpsRefresh);

      const client = scheduleData.CLIENTES.find(
        (element) => element.galId !== false && element.galId !== -1 && element.galId
      );
      const inProgress = scheduleData.CLIENTES.filter((item) => item.status !== 1).length;

      if (client && inProgress === scheduleData.CLIENTES.length && interruptForced !== 2) {
        clearInterval(intervalRaio);
        intervalRaio = setInterval(async () => {
          let response = await handleButtonRefreshRelease(
            client,
            this.state.empresaAtiva,
            this.state.usuarioAtivo,
            scheduleData,
            0
          );
          await this.handleStopBlock(response);
        }, EnviromentVars.verifyAlert);
        this.setState({ intervalRaio });
      }

      this.setState({ loading: false, timerGps });
    } catch (error) {
      alerta('Houve um problema ao iniciar os atendimentos', 2);
      this.props.history.push('/Home');
      this.setState({ loading: false });
    }
  };

  componentWillUnmount = () => {
    const { timerGps, intervalRaio, interval, intervalInterrupted, intervalWaitLocation } = this.state;
    clearInterval(timerGps);
    clearInterval(intervalRaio);
    clearInterval(interval);
    clearInterval(intervalInterrupted);
    clearInterval(intervalWaitLocation);
  };

  handleWorkSchedule = async () => {
    try {
      const { scheduleData } = this.state;

      const inProgress = scheduleData.CLIENTES.find((element) => element.status === 1);
      if (scheduleData && scheduleData.HORARIOS_TRABALHO && Object.keys(scheduleData.HORARIOS_TRABALHO).length !== 0) {
        const final = new Date();
        if (scheduleData.HORARIOS_TRABALHO?.FIM_JORNADA !== null) {
          const hoursEnd = scheduleData.HORARIOS_TRABALHO?.FIM_JORNADA?.split(':', 3);
          final.setHours(hoursEnd[0], hoursEnd[1], hoursEnd[2]);
        }

        const resultFinal = diffInSeconds(new Date(), final);
        if (resultFinal > 0) {
          this.setState({ endOfJourney: true });
        } else if (resultFinal <= 0 || inProgress) {
          this.setState({ endOfJourney: false });
        } else {
          this.setState({ endOfJourney: true });
        }
      }
    } catch (error) {
      this.setState({ endOfJourney: false });
    }
  };

  handleInterruptsForced = async () => {
    let { scheduleData } = this.state;

    let resultInitial = null;
    let resultFinal = null;

    if (
      Object.keys(scheduleData?.HORARIOS_TRABALHO).length !== 0 &&
      scheduleData?.HORARIOS_TRABALHO?.INICIO_PARADA1 !== null
    ) {
      const stop = new Date();
      const hoursStop = scheduleData?.HORARIOS_TRABALHO?.INICIO_PARADA1?.split(':', 3);
      stop.setHours(hoursStop[0], hoursStop[1], hoursStop[2]);

      const stopFinal = new Date();
      const hoursFinal = scheduleData?.HORARIOS_TRABALHO?.FIM_PARADA1?.split(':', 3);
      stopFinal.setHours(hoursFinal[0], hoursFinal[1], hoursFinal[2]);

      resultInitial = diffInSeconds(new Date(), stop);
      resultFinal = diffInSeconds(new Date(), stopFinal);
    }

    if (resultInitial / 60 >= -30 && resultInitial / 60 <= 0 && scheduleData?.HORARIOS_TRABALHO?.FORCAR_PARADA1 === 1) {
      this.handleStopWatch(resultInitial);
      this.setState({ interruptForced: 1 });
      this.handleStopWatchRegressive();
    } else if (
      resultFinal / 60 <= 0 &&
      resultInitial / 60 >= 0 &&
      scheduleData?.HORARIOS_TRABALHO?.FORCAR_PARADA1 === 1
    ) {
      this.handleStopWatch(resultFinal);
      await this.handleChangeStatusWork(true, 1);
      scheduleData.status = -1;
      this.setState({ interruptForced: 2, scheduleData });
      this.handleStopWatchRegressive();
    } else if (
      Object.keys(scheduleData?.HORARIOS_TRABALHO).length !== 0 &&
      scheduleData?.HORARIOS_TRABALHO?.INICIO_PARADA2 !== null
    ) {
      const stop = new Date();
      const hoursStop = scheduleData?.HORARIOS_TRABALHO?.INICIO_PARADA2?.split(':', 3);
      stop.setHours(hoursStop[0], hoursStop[1], hoursStop[2]);

      const stopFinal = new Date();
      const hoursFinal = scheduleData?.HORARIOS_TRABALHO?.FIM_PARADA2?.split(':', 3);
      stopFinal.setHours(hoursFinal[0], hoursFinal[1], hoursFinal[2]);

      resultInitial = diffInSeconds(new Date(), stop);
      resultFinal = diffInSeconds(new Date(), stopFinal);

      if (scheduleData?.HORARIOS_TRABALHO?.FORCAR_PARADA2 === 1) {
        if (resultInitial / 60 >= -30 && resultInitial / 60 <= 0) {
          this.handleStopWatch(resultInitial);

          this.setState({ interruptForced: 1 });
          this.handleStopWatchRegressive();
        } else if (resultFinal / 60 <= 0 && resultInitial / 60 >= 0) {
          this.handleStopWatch(resultFinal);
          await this.handleChangeStatusWork(true, 1);
          scheduleData.status = -1;
          this.setState({ interruptForced: 2, scheduleData });
          this.handleStopWatchRegressive();
        }
      }
    }
  };

  handleStopWatch = (result) => {
    let { totalTimeInSeconds, hours, minutes, seconds } = this.state;

    totalTimeInSeconds = result * -1;
    hours = Math.floor(totalTimeInSeconds / 3600) % 24;
    minutes = Math.floor(totalTimeInSeconds / 60) % 60;
    seconds = totalTimeInSeconds % 60;

    this.setState({ totalTimeInSeconds, hours, minutes, seconds });
  };

  handleStopWatchRegressive = async () => {
    let { totalTimeInSeconds, minutes, seconds, interruptForced, hours, scheduleData, interval } = this.state;
    scheduleData = await getScheduleData();

    interval = setInterval(async () => {
      if (totalTimeInSeconds > 0) {
        totalTimeInSeconds = totalTimeInSeconds - 1;
        hours = Math.floor(totalTimeInSeconds / 3600) % 24;
        minutes = Math.floor(totalTimeInSeconds / 60) % 60;
        seconds = totalTimeInSeconds % 60;
        this.setState({ totalTimeInSeconds, hours, minutes, seconds });
      } else if (interruptForced === 1) {
        clearInterval(interval);
        await this.handleChangeStatusWork(false, 1);
        await this.handleInterruptsForced(scheduleData);
      } else if (interruptForced === 2) {
        clearInterval(interval);
        await this.handleChangeStatusWork(false, 10);
        scheduleData.status = 2;
        this.setState({ interruptForced: -1, scheduleData });
        if (!scheduleData.startAttendances) {
          await this.startWorkDay(true);
        }
      } else {
        clearInterval(interval);
        scheduleData.status = 2;
        this.setState({ interruptForced: -1, scheduleData });
      }
    }, 1000);
    this.setState({ interval });
  };

  startWorkDay = async (interrupted = false) => {
    let { scheduleData, empresaAtiva, usuarioAtivo, latitude, longitude } = this.state;
    if (scheduleData === undefined) {
      return;
    }
    if (scheduleData.status === undefined || interrupted) {
      if (!latitude || !longitude) {
        let gpsData = await getGps();

        if (gpsData === undefined || !gpsData || gpsData.length === 0) {
          latitude = 0;
          longitude = 0;
          alerta('Não foi possível localizar a posição atual, ative o GPS do celular ou tente novamente', 2);
          this.props.history.push('/Home');
          return;
        } else {
          latitude = gpsData[0].latitude;
          longitude = gpsData[0].longitude;
        }
      }

      const dataDataHoraUsuario = formatISO(dataHoraAtual())

      let scheduleDataDay = await startWorkDay(
        empresaAtiva,
        usuarioAtivo,
        scheduleData.GAA_ID,
        latitude,
        longitude,
        dataDataHoraUsuario,
        this.onUpdateWaitScreen
      );
      if (scheduleDataDay === undefined) {
        alerta(
          'Não é possível continuar, o dia não foi iniciado.\nVerifique sua conexão com a internet e se seu GPS está ativo.',
          2
        );
        this.props.history.goBack();
        return;
      }

      if (scheduleDataDay && scheduleDataDay.sucessStarted) {
        scheduleDataDay.status = scheduleExecution;
        let startAttendances = {};
        startAttendances.dataHoraInicio = dataDataHoraUsuario;
        startAttendances.latitude = latitude ? latitude : 0;
        startAttendances.longitude = longitude ? longitude : 0;
        scheduleDataDay.startAttendances = startAttendances;
        await updateScheduleData(scheduleDataDay);
        this.setState({ scheduleData: scheduleDataDay });
      } else {
        alerta('Não foi possível iniciar o atendimento, tente novamente', 2);
        this.props.history.push('/Home');
        return;
      }
    }
  };

  pauseWorkDay = () => {
    let { scheduleData, empresaAtiva, usuarioAtivo } = this.state;
    scheduleData.status = schedulePaused;
    setStatusSchedule(empresaAtiva, usuarioAtivo, scheduleData.GAA_ID, schedulePaused);
  };

  returnWorkDay = () => {
    let { scheduleData, empresaAtiva, usuarioAtivo } = this.state;
    scheduleData.status = schedulePaused;
    setStatusSchedule(empresaAtiva, usuarioAtivo, scheduleData.GAA_ID, scheduleExecution);
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      empresaCnpj: sessao.empresaCnpj,
      gmovelHodometro: sessao.gmovelHodometro,
    });
  };

  handleSaveState = async (checkout = false) => {
    let { cliente, pesquisas, latitude, longitude } = this.state;
    if (cliente === undefined) {
      return;
    }
    let scheduleData = await getScheduleData();

    for (const cli of scheduleData.CLIENTES) {
      if (cli.CLI_ID === cliente.CLI_ID) {
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
          // 0 - não foi feito atendimento
          // 1 - em atendimento
          // 2 - finalizado
          scheduleData.emAtendimento = false;
          scheduleData.cliAtendimento = undefined;
          // scheduleData.GAA_FLG_STATUS = 1;
        } else {
          cli.pesquisas = pesquisas;
        }
        break;
      }
    }
    await updateScheduleData(scheduleData);
    this.setState({ scheduleData });
  };

  handleStardWorkCustomer = async (cliente, boolSync) => {
    let { intervalWaitLocation } = this.state;
    await this.getActualPosition();
    this.setState({ loading: true });
    intervalWaitLocation = setInterval(async () => {
      const { latitude, longitude } = this.state;
      if (latitude && longitude) {
        clearInterval(intervalWaitLocation);
        this.setState({ loading: false });
        await this.handleStartWork(cliente, boolSync);
      }
    }, 1000);
    this.setState({ intervalWaitLocation });
  };

  handleStartWork = async (cliente, boolSync) => {
    let { scheduleData, latitude, longitude, empresaAtiva, usuarioAtivo, intervalRaio, endOfJourney } = this.state;
    let scheduleDataBefore = undefined;

    await this.handleWorkSchedule(scheduleData);
    if (!endOfJourney) {
      if (boolSync) {
        scheduleDataBefore = await getScheduleData();
      }

      for (const cli of scheduleData.CLIENTES) {
        if (cli.CLI_ID === cliente.CLI_ID) {
          const skipValidationPromoterLocalization = scheduleData?.HORARIOS_TRABALHO?.RAIO_ATENDIMENTO <= 0;

          const res = skipValidationPromoterLocalization
            ? false
            : await checkAlert(cli, scheduleData, empresaAtiva, usuarioAtivo, latitude, longitude);

          if (!res) {
            let item = {
              descricao: null,
              galId: null,
              liberado: true,
              lido: null,
            };
            cli.alert = item;
            cli.galId = false;
            clearInterval(intervalRaio);
          } else {
            let alert = [];
            for (let element of res) {
              let item = {};
              item.descricao = element.GTI_DESCRICAO;
              item.galId = element.GAL_ID;
              item.liberado = element.GTI_FLG_IMPEDE_ATD === 1 ? false : true;
              item.lido = element.GAL_FLG_STATUS === 1 ? true : false;
              alert.push(item);
            }

            cli.alert = alert;
            cli.galId = alert.find((item) => item.liberado === false).galId;
            await updateScheduleData(scheduleData);
            this.setState({ scheduleData });

            let response = null;
            clearInterval(intervalRaio);

            intervalRaio = setInterval(async () => {
              response = await handleButtonRefreshRelease(
                cli,
                this.state.empresaAtiva,
                this.state.usuarioAtivo,
                scheduleData,
                0
              );

              await this.handleStopBlock(response);
            }, EnviromentVars.verifyAlert);

            this.setState({ intervalRaio });

            return;
          }

          if (!haveData(cli.checkIn)) {
            cli.checkIn = [];
          }
          if (cli.status === 0 || cli.status === undefined || cli.status === 2) {
            let checkIn = {};
            checkIn.start = new Date();
            checkIn.status = 1;
            checkIn.latitudeCheckIn = latitude;
            checkIn.longitudeCheckIn = longitude;
            cli.checkIn.push(checkIn);
            cli.status = 1;
            cli.lastCheckIn = checkIn.start;
            cli.lastCheckout = undefined;
          }
          // 0 - não foi feito atendimento
          // 1 - em atendimento
          // 2 - finalizado
        }
      }
      scheduleData.emAtendimento = true;
      scheduleData.cliAtendimento = cliente.CLI_ID;
      scheduleData.status = 2;
      await updateScheduleData(scheduleData);
      this.setState({ scheduleData });
      if (boolSync) {
        this.setState({ loading: true, percent: 0, message: undefined });
        let { empresaAtiva, usuarioAtivo, empresaCnpj } = this.state;
        let retornoSync = await syncLocalData(
          false,
          empresaAtiva,
          usuarioAtivo,
          empresaCnpj,
          false,
          this.onUpdateWaitScreen
        );
        if (!retornoSync) {
          await updateScheduleData(scheduleDataBefore);
          this.setState({ scheduleData: scheduleDataBefore });
          alerta(
            'Não foi possível iniciar o atendimento.\nVerifique sua conexão com a internet e se seu GPS está ativo.',
            2
          );
          // this.props.history.push('/home');
          this.setState({ loading: false });
          return;
        }
        this.setState({ loading: false });
      }
      clearInterval(intervalRaio);
      let button = `iniciarAtendimento${cliente.CLI_ID}`;
      document.getElementsByClassName(button)[0].click();
    } else {
      alerta('O horário de expediente chegou ao fim!');
    }
  };

  handleRefreshRelease = async (cli) => {
    const { scheduleData, usuarioAtivo, empresaAtiva } = this.state;
    const customer = scheduleData.CLIENTES.find((item) => item.CLI_ID === cli.CLI_ID);
    const res = await handleButtonRefreshRelease(customer, empresaAtiva, usuarioAtivo, scheduleData, 1);
    await this.handleStopBlock(res);
  };

  handleStopBlock = async (res) => {
    const { scheduleData, intervalRaio } = this.state;

    if (res.status === 1 && res !== false) {
      const posAlert = scheduleData.CLIENTES[res.pos].alert.findIndex((item) => item.liberado === false);

      scheduleData.CLIENTES[res.pos].alert[posAlert].liberado = true;
      scheduleData.CLIENTES[res.pos].alert[posAlert].lido = true;
      scheduleData.CLIENTES[res.pos].alert[posAlert].observation = `Liberado ${formatDateTimeToBr(new Date())}`;
      scheduleData.CLIENTES[res.pos].galId = false;

      clearInterval(intervalRaio);
      await updateScheduleData(scheduleData);
      this.setState({ scheduleData });
    } else if (res.status === -1 && res !== false) {
      const posAlert = scheduleData.CLIENTES[res.pos].alert.findIndex((item) => item.liberado === false);

      scheduleData.CLIENTES[res.pos].alert[posAlert].liberado = -1;
      scheduleData.CLIENTES[res.pos].alert[posAlert].lido = true;
      scheduleData.CLIENTES[res.pos].alert[posAlert].observation = `Não foi liberado ${formatDateTimeToBr(new Date())}`;
      scheduleData.CLIENTES[res.pos].galId = -1;

      clearInterval(intervalRaio);
      await updateScheduleData(scheduleData);
      this.setState({ scheduleData });
    }
  };

  handleResendLocationResendAlert = async (customer) => {
    let { intervalWaitLocation } = this.state;
    await this.getActualPosition();
    this.setState({ loading: true });
    intervalWaitLocation = setInterval(async () => {
      const { latitude, longitude } = this.state;
      if (latitude && longitude) {
        clearInterval(intervalWaitLocation);
        this.setState({ loading: false });
        await this.handleResendAlert(customer);
      }
    }, 1000);
    this.setState({ intervalWaitLocation });
  };

  handleResendAlert = async (client) => {
    let { scheduleData, latitude, longitude, empresaAtiva, usuarioAtivo } = this.state;

    const res = await checkAlert(client, scheduleData, empresaAtiva, usuarioAtivo, latitude, longitude);

    if (!res) {
      let item = {
        descricao: null,
        galId: null,
        liberado: true,
        lido: null,
      };
      client.alert = item;
      client.galId = false;
    } else {
      let alert = [];
      for await (let element of res) {
        let item = {};
        item.descricao = element.GTI_DESCRICAO;
        item.galId = element.GAL_ID;
        item.liberado = element.GTI_FLG_IMPEDE_ATD === 1 ? false : true;
        item.lido = element.GAL_FLG_STATUS === 1 ? true : false;
        alert.push(item);
      }

      client.alert = alert;
      client.galId = alert.find((item) => item.liberado === false).galId;

      await updateScheduleData(scheduleData);
      this.setState({ scheduleData });
    }
  };

  handleChangeStatusWork = async (pause, forced) => {
    let { latitude, longitude } = this.state;
    let scheduleData = await getScheduleData();

    let interrupcaoItem;
    let interrupcao;

    if (!forced) {
      if (pause) {
        interrupcao = document.getElementById('selectInterrupcao_' + scheduleData.GAA_ID).value;
        this.pauseWorkDay();
      } else {
        interrupcao = document.getElementById('selectRetomada_' + scheduleData.GAA_ID).value;
        this.returnWorkDay();
      }
    } else {
      interrupcao = forced;
    }

    if (!haveData(interrupcao)) {
      alerta('A justificativa é obrigatória.', 2);
      return;
    } else {
      interrupcaoItem = scheduleData.TIPOS_INTERRUPCAO.find((tipo) => tipo.GMI_ID === parseInt(interrupcao));
    }
    if (scheduleData.interrupts === undefined) {
      scheduleData.interrupts = [];
    }
    if (interrupcaoItem) {
      interrupcaoItem.latitude = latitude;
      interrupcaoItem.longitude = longitude;
      interrupcaoItem.dataHora = new Date();
    }
    scheduleData.interrupts.push(interrupcaoItem);

    //Status agendamento (-2 Cancelada | -1 Pausada | 0  Novo/Não agendado | 1 Agendado | 2 Em execução | 3 Finalizado)
    scheduleData.status = pause ? -1 : 2;

    await updateScheduleData(scheduleData);
    this.setState({ scheduleData });
  };

  forceSyncLocalDataFn = async (forceClose) => {
    try {
      const { scheduleData, empresaAtiva, usuarioAtivo, latitude, longitude, empresaCnpj, gmovelHodometro } =
        this.state;

      const currentDrivenOdometro = await getLocalObject('currentDrivenOdometro');
      const date = format(new Date(), 'dd/MM/yyyy');
      const dateKmInitial = currentDrivenOdometro?.GKM_KM_INICIAL_DATA ? format(new Date(currentDrivenOdometro?.GKM_KM_INICIAL_DATA), 'dd/MM/yyyy') : null;

      if (
        forceClose &&
        gmovelHodometro &&
        !currentDrivenOdometro &&
        !currentDrivenOdometro?.GKM_KM_FINAL &&
        !currentDrivenOdometro?.GKM_KM_FINAL_FOTO &&
        dateKmInitial && date !== dateKmInitial
      ) {
        alerta('Para finalizar o dia, é necessário informar o KM final, e a foto', 2);
        return;
      }
      this.setState({ loading: true, percent: 0, message: undefined });

      const res = await forceSyncLocalData(
        forceClose,
        scheduleData,
        empresaAtiva,
        usuarioAtivo,
        latitude,
        longitude,
        empresaCnpj,
        this.onUpdateWaitScreen
      );

      if (res && forceClose) {
        await deleteDB("ScheduleDataDB");
        await delLocalObject('scheduleData');
        await delLocalObject('perguntas');
        await deleteDB(EnviromentVars.imageDB);
        await deleteDB(EnviromentVars.gpsDB);
        this.setState({ loading: false });
        this.props.history.push('/Home');
        alerta('Dia finalizado com sucesso', 1);
        return true;
      }

      if (res) {
        this.setState({ scheduleData: res });
        this.setState({ loading: false });
        return true;
      }

      return false;
    } catch (error) {
      alerta('Não foi possível finalizar a operação', 1);
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
      makeRoute(origin, destination);
    }
  };

  onUpdateCoord = (gpsAvailable, gpsEnabled, coords) => {
    let { empresaAtiva, usuarioAtivo } = this.state;
    syncLocationData(empresaAtiva, usuarioAtivo, coords.latitude, coords.longitude);
    this.setState({ latitude: coords.latitude, longitude: coords.longitude });
    setGps(coords.latitude, coords.longitude);
  };

  justifyNotAttending = async (customer) => {
    let { scheduleData } = this.state;
    let scheduleDataBefore = await getScheduleData();

    let justificativaItem;
    let justificativa = document.getElementById('selectJustificativa_' + customer.CLI_ID).value;
    if (!haveData(justificativa)) {
      alerta('A justificativa é obrigatória.', 2);
      return;
    } else {
      justificativaItem = scheduleData.TIPOS_JUSTIFICATIVA.find((tipo) => tipo.GAJ_ID === parseInt(justificativa));
    }

    for (const cli of scheduleData.CLIENTES) {
      if (cli.CLI_ID === customer.CLI_ID) {
        cli.motivoNaoAtendimento = justificativaItem.GAJ_DESCRICAO;
      }
    }
    let retornoSync = await this.forceSyncLocalDataFn(false);
    if (retornoSync) {
      await updateScheduleData(scheduleData);
      this.setState({ scheduleData });
    } else {
      this.setState({ scheduleData: scheduleDataBefore });
      alerta(
        'Não foi possível justificar o não atendimento.\nVerifique sua conexão com a internet e se seu GPS está ativo.',
        2
      );
    }
  };

  handleOnline = async () => {
    let online = await isOnline();
    if (online) {
      alerta('Estou online...');
    } else {
      alerta('Não estou online...');
    }
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

  handleChangeAlertaAtendimentos = (e) => {
    let { GAL_OBSERVACAO } = this.state;
    GAL_OBSERVACAO = e.target.value;
    this.setState({ GAL_OBSERVACAO });
  };

  handleChangeCustomerAlertaAtendimentos = (e) => {
    let { GAL_GAT_ID } = this.state;
    GAL_GAT_ID = e.target.value;
    this.setState({ GAL_GAT_ID });
  };

  onPopUpAlerta = () => {
    let { GAL_OBSERVACAO, GAL_GAT_ID } = this.state;
    GAL_OBSERVACAO = '';
    GAL_GAT_ID = undefined;
    this.setState({ GAL_OBSERVACAO, GAL_GAT_ID });
  };

  render() {
    const {
      scheduleData,
      endOfJourney,
      loading,
      lastUpdate,
      percent,
      message,
      interruptForced,
      hours,
      minutes,
      seconds,
    } = this.state;

    return (
      <>
        <WaitScreen loading={loading} percent={percent} message={message} />
        <TradeLocation onUpdateCoord={this.onUpdateCoord} lastUpdate={lastUpdate} />
        <Titulo
          style={{
            justifyContent: 'flex-start',
            paddingLeft: '15px',
            top: '0px',
            zIndex: '2',
          }}
        >
          <>
            <button
              style={{ cursor: 'pointer', color: 'white' }}
              onClick={() =>
                this.props.history.push({
                  pathname: '/Home',
                  state: {
                    interruptForced,
                  },
                })
              }
              className="waves-effect waves-light saib-button is-cancel"
            >
              <Icon className="modal-close">arrow_back</Icon>
            </button>
            <p style={{ position: 'unset', top: 'unset', width: '100%', flex: '3' }}>Atendimentos</p>
            {/* {scheduleData !== undefined && (
              <>
                <Question
                  iconeBotaoPadrao={
                    <span style={{ position: 'relative', top: '2px' }}>
                      &nbsp;<Icon large>info</Icon>
                    </span>
                  }
                  larguraDiv="unset"
                  classeBotaoPadrao="waves-effect waves-light saib-button is-primary is-alert"
                  aoMostrar={this.onPopUpAlerta}
                  textoBotaoPadrao={''}
                  titulo={'Alerta de atendimentos.'}
                  tituloBotaoSim="Enviar alerta"
                  classeBotaoSim="waves-effect waves-light saib-button is-primary modal-action modal-close"
                  tituloBotaoNao="Cancelar"
                  classeBotaoNao="waves-effect waves-light saib-button is-primary modal-action modal-close"
                  message={
                    <>
                      <Linha style={{ width: '100%' }}>
                        <DivDetalhe className="divAlertaAtendimentos">
                          <Labels>Cliente</Labels>
                          <select
                            style={{ display: 'flex', width: '100%' }}
                            value={GAL_GAT_ID === undefined ? '-1' : GAL_GAT_ID}
                            onChange={this.handleChangeCustomerAlertaAtendimentos}
                          >
                            <option value="-1">Não relacionado a cliente</option>
                            {scheduleData.CLIENTES.map((cliente) => (
                              <React.Fragment key={randomNumber()}>
                                <option value={cliente.gatId}>
                                  {cliente.CLI_CODIGO +
                                    ' - ' +
                                    cliente.CLI_NOME_FANTASIA +
                                    ' (' +
                                    cliente.CLI_RAZAO_SOCIAL +
                                    ')'}
                                </option>
                                )}
                              </React.Fragment>
                            ))}
                          </select>
                        </DivDetalhe>
                      </Linha>
                      <Linha style={{ width: '100%' }}>
                        <DivDetalhe className="divAlertaAtendimentos">
                          <Labels>Mensagem de alerta</Labels>
                          <input
                            className="alertaAtendimentos"
                            onChange={this.handleChangeAlertaAtendimentos}
                            value={GAL_OBSERVACAO}
                          />
                        </DivDetalhe>
                      </Linha>
                    </>
                  }
                  onNo={() => {}}
                  onYes={async () => {

                    let cliId =
                      GAL_GAT_ID !== undefined
                        ? scheduleData.CLIENTES.filter((cliente) => cliente.gatId === parseInt(GAL_GAT_ID))[0].CLI_ID
                        : undefined;
                    let body = {
                      GAL_GAA_ID: scheduleData.GAA_ID,
                      GAL_GAA_EMP_ID: scheduleData.GAA_EMP_ID,
                      GAL_GAT_ID,
                      GAL_GAT_EMP_ID: empresaAtiva,
                      GAL_GTA_ID: 5,
                      GAL_OBSERVACAO,
                      CLI_ID: cliId,
                      GAA_USR_ID_AGENDA: scheduleData.GAA_USR_ID_AGENDA,
                    };

                    this.setState({loading: true});
                    await postServiceAlert(empresaAtiva, usuarioAtivo, body, this.onUpdateWaitScreen);
                    this.setState({loading: false});
                  }}
                />
              </>
            )} */}
          </>
        </Titulo>
        <Container className="startWorkDayContainer">
          {/* <Button onClick={()=>this.setState({lastUpdate: lastUpdate + 1})} className="waves-effect waves-light saib-button"> Localização </Button> */}
          {scheduleData !== undefined ? (
            <>
              {interruptForced !== 2 && endOfJourney === false ? (
                <Linha className="topStartWorkDay" style={{ borderBottom: '1px solid #ccc' }}>
                  <Question
                    iconeBotaoPadrao={
                      <>
                        {scheduleData.status !== -1 || scheduleData.interrupts === undefined ? (
                          <Icon large>pause</Icon>
                        ) : (
                          <Icon large>replay</Icon>
                        )}
                      </>
                    }
                    classeBotaoPadrao="waves-effect waves-light saib-button is-secondary"
                    textoBotaoPadrao={
                      scheduleData.status !== -1 || scheduleData.interrupts === undefined
                        ? 'Pausar atendimento'
                        : 'Retornar ao atendimento'
                    }
                    titulo={'Retomando a atividade'}
                    tituloBotaoSim="Sim"
                    classeBotaoSim="waves-effect waves-light saib-button is-primary modal-action modal-close"
                    tituloBotaoNao="Não"
                    classeBotaoNao="waves-effect waves-light saib-button is-primary modal-action modal-close"
                    message={
                      <Linha style={{ width: '100%' }}>
                        {scheduleData !== undefined && scheduleData.TIPOS_INTERRUPCAO !== undefined ? (
                          <>
                            {scheduleData.status !== -1 || scheduleData.interrupts === undefined ? (
                              <>
                                <select
                                  style={{ display: 'flex', width: '100%' }}
                                  name={`selectInterrupcao_${scheduleData.GAA_ID}`}
                                  id={`selectInterrupcao_${scheduleData.GAA_ID}`}
                                >
                                  {scheduleData.TIPOS_INTERRUPCAO.map((justificativa) => (
                                    <React.Fragment key={justificativa.GMI_ID}>
                                      {parseInt(justificativa.GMI_TIPO_INTERRUPCAO) === 0 && (
                                        <>
                                          <option value={justificativa.GMI_ID}>{justificativa.GMI_DESCRICAO}</option>
                                        </>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </select>
                              </>
                            ) : (
                              <>
                                <select
                                  style={{ display: 'flex', width: '100%' }}
                                  name={`selectRetomada_${scheduleData.GAA_ID}`}
                                  id={`selectRetomada_${scheduleData.GAA_ID}`}
                                >
                                  {scheduleData.TIPOS_INTERRUPCAO.map((justificativa, key) => (
                                    <React.Fragment key={key}>
                                      {parseInt(justificativa.GMI_TIPO_INTERRUPCAO) === 1 && (
                                        <>
                                          <option value={justificativa.GMI_ID}>{justificativa.GMI_DESCRICAO}</option>
                                        </>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </select>
                              </>
                            )}
                          </>
                        ) : (
                          <>nop</>
                        )}
                      </Linha>
                    }
                    onNo={() => {}}
                    onYes={async () => {
                      await this.handleChangeStatusWork(
                        scheduleData.status !== -1 || scheduleData.interrupts === undefined
                      );
                    }}
                  />
                  {interruptForced === 1 && (
                    <StopWatch>
                      <div>
                        <strong>&nbsp;{hours.toString().padStart(2, '0')}</strong>
                        <strong>:</strong>
                        <strong>{minutes.toString().padStart(2, '0')}</strong>
                        <strong>:</strong>
                        <strong>{seconds.toString().padStart(2, '0')}</strong>
                        <span>&nbsp;para a parada obrigatória</span>
                      </div>
                    </StopWatch>
                  )}
                </Linha>
              ) : interruptForced === 2 ? (
                <Linha>
                  <StopWatch>
                    <h5>Aplicativo bloqueado por parada obrigatória</h5>
                    <div>
                      <strong>&nbsp;{hours.toString().padStart(2, '0')}</strong>
                      <strong>:</strong>
                      <strong>{minutes.toString().padStart(2, '0')}</strong>
                      <strong>:</strong>
                      <strong>{seconds.toString().padStart(2, '0')}</strong>
                      <span>
                        &nbsp;{interruptForced === 1 ? 'para a parada obrigatória' : 'para retornar o serviço'}
                      </span>
                    </div>
                  </StopWatch>
                </Linha>
              ) : (
                endOfJourney === true && (
                  <Linha>
                    <StopWatch>
                      <h5>Horário de expediente chegou ao fim</h5>
                    </StopWatch>
                  </Linha>
                )
              )}

              <Linha>
                {scheduleData.CLIENTES.map((customer, indice) => (
                  <Fragment key={indice}>
                    <Linha className="linhaStartWorkDay">
                      <Linha className="linhaStartWorkDayInterna">
                        <Labels>
                          {customer.checkIn !== undefined &&
                            customer.status !== 1 &&
                            customer.status !== -1 &&
                            haveData(customer.checkIn) && (
                              <Labels color={'#bf1f7c'}>
                                <Icon>done_all</Icon>
                              </Labels>
                            )}
                          {customer.CLI_CODIGO + ' - ' + customer.CLI_NOME_FANTASIA}
                          <small> ({customer.CLI_RAZAO_SOCIAL})</small>
                        </Labels>
                      </Linha>
                      {haveData(customer.CLI_LATITUDE) && haveData(customer.CLI_LONGITUDE) && !endOfJourney && (
                        <Linha className="linhaStartWorkDayInterna" style={{ alignItems: 'center' }}>
                          <Labels
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              paddingBottom: '2px',
                              cursor: 'pointer',
                            }}
                            onClick={() => this.makeWindowRoute(customer.CLI_LATITUDE, customer.CLI_LONGITUDE)}
                          >
                            <Icon>place</Icon> Sugestão trajeto
                          </Labels>
                        </Linha>
                      )}
                      {customer.alert && customer.galId !== -1 && customer.galId !== false && !endOfJourney ? (
                        <Alert>
                          <span>
                            <Icon>lock</Icon>
                            Atendimento bloqueado
                          </span>
                          <strong>{customer.alert.find((item) => item.liberado === false).descricao}</strong>
                        </Alert>
                      ) : (
                        customer.alert &&
                        customer.galId === -1 &&
                        !endOfJourney && (
                          <Alert>
                            <span>
                              <Icon>lock</Icon>
                              Atendimento bloqueado
                            </span>
                            <strong>
                              <Icon>close</Icon>O atendimento não foi liberado
                            </strong>
                          </Alert>
                        )
                      )}
                      <Linha
                        className="linhaStartWorkDayInterna"
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                        }}
                      >
                        {scheduleData.emAtendimento && customer.status !== 1 ? (
                          <></>
                        ) : (
                          <>
                            {scheduleData.status !== -1 && (
                              <>
                                {customer.status !== 1 &&
                                !haveData(customer.motivoNaoAtendimento) &&
                                !customer.galId &&
                                !endOfJourney ? (
                                  <DivDetalhe>
                                    <Question
                                      iconeBotaoPadrao={<Icon large>play_arrow</Icon>}
                                      classeBotaoPadrao="waves-effect waves-light saib-button is-primary"
                                      textoBotaoPadrao="Atender"
                                      titulo={'Iniciando o Check-in'}
                                      tituloBotaoSim="Sim"
                                      classeBotaoSim="waves-effect waves-light saib-button is-primary modal-action modal-close"
                                      tituloBotaoNao="Não"
                                      classeBotaoNao="waves-effect waves-light saib-button is-primary modal-action modal-close"
                                      message={
                                        <div className="divModal">
                                          <p className="spanModal"> Gostaria de iniciar o atendimento de </p>
                                          <p className="spanModal bold"> {customer.CLI_RAZAO_SOCIAL}</p>
                                        </div>
                                      }
                                      onNo={() => {}}
                                      onYes={() => {
                                        this.handleStardWorkCustomer(customer, true);
                                      }}
                                    />
                                  </DivDetalhe>
                                ) : customer.status !== 1 &&
                                  !haveData(customer.motivoNaoAtendimento) &&
                                  customer.galId !== -1 &&
                                  !endOfJourney ? (
                                  <DivDetalhe style={{ alignItems: 'center', padding: '10px' }}>
                                    <Button
                                      className="waves-effect waves-light saib-button is-primary"
                                      onClick={async () => {
                                        await this.handleRefreshRelease(customer);
                                      }}
                                    >
                                      <Icon>refresh</Icon> &nbsp; Verificar liberação
                                    </Button>
                                  </DivDetalhe>
                                ) : (
                                  customer.galId !== -1 &&
                                  !endOfJourney && (
                                    <>
                                      {!haveData(customer.motivoNaoAtendimento) ? (
                                        <DivDetalhe style={{ alignItems: 'center' }}>
                                          <Button
                                            disabled={interruptForced === 2}
                                            className="waves-effect waves-light saib-button is-primary"
                                            onClick={() => {
                                              this.handleStardWorkCustomer(customer, false);
                                            }}
                                          >
                                            <Icon>fast_forward</Icon> &nbsp; Continuar
                                          </Button>
                                          {customer.lastCheckIn !== undefined &&
                                            customer.lastCheckout === undefined && (
                                              <Labels
                                                fonsSize="0.9rem"
                                                style={{
                                                  position: 'relative',
                                                  top: '4px',
                                                }}
                                              >
                                                {formatDateTimeToBr(customer.lastCheckIn, 'HH:mm:ss')}
                                              </Labels>
                                            )}
                                        </DivDetalhe>
                                      ) : (
                                        <>
                                          <Labels
                                            color={'#e91e63'}
                                            style={{
                                              alignItems: 'center',
                                              display: 'flex',
                                            }}
                                          >
                                            <Icon>event_busy</Icon>
                                            <span>Não atendido ({customer.motivoNaoAtendimento})</span>
                                          </Labels>
                                        </>
                                      )}
                                    </>
                                  )
                                )}
                                {customer.checkIn === undefined &&
                                !haveData(customer.motivoNaoAtendimento) &&
                                customer.galId !== -1 ? (
                                  <DivDetalhe>
                                    <Question
                                      iconeBotaoPadrao={<Icon large>block</Icon>}
                                      classeBotaoPadrao="waves-effect waves-light saib-button is-primary is-alert"
                                      textoBotaoPadrao="Não atender"
                                      titulo={'Justificativa não atendimento'}
                                      tituloBotaoSim="Salvar"
                                      classeBotaoSim="waves-effect waves-light saib-button is-primary modal-action modal-close"
                                      tituloBotaoNao="Cancelar"
                                      classeBotaoNao="waves-effect waves-light saib-button is-primary modal-action modal-close"
                                      message={
                                        <Linha>
                                          {scheduleData.TIPOS_JUSTIFICATIVA !== undefined ? (
                                            <>
                                              <select
                                                style={{
                                                  display: 'flex',
                                                  width: '100%',
                                                }}
                                                name={`selectJustificativa_${customer.CLI_ID}`}
                                                id={`selectJustificativa_${customer.CLI_ID}`}
                                              >
                                                {scheduleData.TIPOS_JUSTIFICATIVA.map((justificativa, key) => (
                                                  <React.Fragment key={key}>
                                                    <option value={justificativa.GAJ_ID}>
                                                      {justificativa.GAJ_DESCRICAO}
                                                    </option>
                                                  </React.Fragment>
                                                ))}
                                              </select>
                                            </>
                                          ) : (
                                            <>
                                              <input className={`inputJustificativa_${customer.CLI_ID}`} />
                                            </>
                                          )}
                                        </Linha>
                                      }
                                      onNo={() => {}}
                                      onYes={() => {
                                        this.justifyNotAttending(customer);
                                      }}
                                    />
                                  </DivDetalhe>
                                ) : (
                                  customer.galId === -1 && (
                                    <>
                                      <DivDetalhe style={{ alignItems: 'center', padding: '10px' }}>
                                        <Button
                                          className="waves-effect waves-light saib-button is-primary"
                                          onClick={async () => {
                                            await this.handleResendLocationResendAlert(customer);
                                          }}
                                        >
                                          <Icon>call_made</Icon> &nbsp; Solicitar novamente
                                        </Button>
                                      </DivDetalhe>
                                      <DivDetalhe>
                                        <Question
                                          iconeBotaoPadrao={<Icon large>block</Icon>}
                                          classeBotaoPadrao="waves-effect waves-light saib-button is-primary is-alert"
                                          textoBotaoPadrao="Não atender"
                                          titulo={'Justificativa não atendimento'}
                                          tituloBotaoSim="Salvar"
                                          classeBotaoSim="waves-effect waves-light saib-button is-primary modal-action modal-close"
                                          tituloBotaoNao="Cancelar"
                                          classeBotaoNao="waves-effect waves-light saib-button is-primary modal-action modal-close"
                                          message={
                                            <Linha>
                                              {scheduleData.TIPOS_JUSTIFICATIVA !== undefined ? (
                                                <>
                                                  <select
                                                    style={{
                                                      display: 'flex',
                                                      width: '100%',
                                                    }}
                                                    name={`selectJustificativa_${customer.CLI_ID}`}
                                                    id={`selectJustificativa_${customer.CLI_ID}`}
                                                  >
                                                    {scheduleData.TIPOS_JUSTIFICATIVA.map((justificativa, key) => (
                                                      <React.Fragment key={key}>
                                                        <option value={justificativa.GAJ_ID}>
                                                          {justificativa.GAJ_DESCRICAO}
                                                        </option>
                                                      </React.Fragment>
                                                    ))}
                                                  </select>
                                                </>
                                              ) : (
                                                <>
                                                  <input className={`inputJustificativa_${customer.CLI_ID}`} />
                                                </>
                                              )}
                                            </Linha>
                                          }
                                          onNo={() => {}}
                                          onYes={() => {
                                            this.justifyNotAttending(customer);
                                          }}
                                        />
                                      </DivDetalhe>
                                    </>
                                  )
                                )}
                              </>
                            )}
                            <Link
                              className={`iniciarAtendimento` + customer.CLI_ID}
                              style={{ display: 'none' }}
                              to={{
                                pathname: '/ServiceSearchs',
                                state: {
                                  userHours: scheduleData.HORARIOS_TRABALHO,
                                  cliente: customer,
                                  forceCommit: false,
                                  pesquisas:
                                    customer.pesquisas === undefined ? scheduleData.PESQUISAS : customer.pesquisas,
                                },
                              }}
                            ></Link>
                          </>
                        )}
                      </Linha>
                    </Linha>
                  </Fragment>
                ))}
              </Linha>
              <FooterPage className="footerStartWorkDay">
                {!endOfJourney && (
                  <Question
                    iconeBotaoPadrao={
                      <span style={{ color: 'white', width: 'unset' }}>
                        {' '}
                        <Icon large>sync</Icon>
                      </span>
                    }
                    classeBotaoPadrao="waves-effect waves-light saib-button is-primary"
                    textoBotaoPadrao="Sincronizar"
                    titulo={'Sincronizando os dados'}
                    tituloBotaoSim="Sim"
                    classeBotaoSim="waves-effect waves-light saib-button is-primary modal-action modal-close"
                    tituloBotaoNao="Não"
                    classeBotaoNao="waves-effect waves-light saib-button is-primary modal-action modal-close"
                    message={
                      <div className="divModal">
                        <p className="spanModal bold">Confirma o sincronismo dos dados?</p>
                        <p className="spanModal">
                          Esta ação pode demorar alguns minutos e necessita de conexão com a internet.
                        </p>
                      </div>
                    }
                    onNo={() => {}}
                    onYes={async () => {
                      if (!(await this.forceSyncLocalDataFn(false))) {
                        alerta(
                          'Não foi possível sincronizar os dados.\nVerifique sua conexão com a internet e se seu GPS está ativo.',
                          2
                        );
                      } else {
                        alerta('Sincronizado com sucesso!', 1);
                      }
                    }}
                  />
                )}
                &nbsp;
                {!scheduleData.emAtendimento && scheduleData.status !== -1 && (
                  <Question
                    iconeBotaoPadrao={
                      <span style={{ color: 'white', width: 'unset' }}>
                        {' '}
                        <Icon large>done_all</Icon>
                      </span>
                    }
                    classeBotaoPadrao="waves-effect waves-light saib-button is-primary"
                    textoBotaoPadrao="Finalizar dia"
                    titulo={'Iniciando o Check-out'}
                    tituloBotaoSim="Sim"
                    classeBotaoSim="waves-effect waves-light saib-button is-primary modal-action modal-close"
                    tituloBotaoNao="Não"
                    classeBotaoNao="waves-effect waves-light saib-button is-primary modal-action modal-close"
                    message={
                      <div className="divModal">
                        <p className="spanModal bold">Gostaria de finalizar o dia?</p>
                        <p className="spanModal">
                          Esta ação é irreversível e você não conseguirá voltar nesta listagem de clientes.
                        </p>
                      </div>
                    }
                    onNo={() => {}}
                    onYes={async () => {
                      if (
                        scheduleData.CLIENTES.find(
                          (item) => item.checkIn === undefined && item.motivoNaoAtendimento === undefined
                        )
                      ) {
                        alerta('Justifique os clientes não atendidos.', 2);
                      } else {
                        await this.forceSyncLocalDataFn(true);
                      }
                    }}
                  />
                )}
              </FooterPage>
            </>
          ) : (
            <>
              <DivDetalhe>
                <SubContainerTitle>Você não tem atendimentos agendados.</SubContainerTitle>
                <Button
                  className="waves-effect waves-light saib-button is-primary"
                  onClick={() => this.props.history.goBack()}
                >
                  {' '}
                  <Icon>arrow_back</Icon> Voltar
                </Button>
              </DivDetalhe>
            </>
          )}
        </Container>
      </>
    );
  }
}

export default withRouter(StartWorkDay);
