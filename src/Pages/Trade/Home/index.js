/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import {
  Labels,
  Container,
  SubContainer,
  Linha,
  DivDetalhe,
  DayCard,
  DayCardChecked,
  TradeTitle,
  MessageUnavailable,
  StopWatchHome,
} from './style';
import { IoIosSpeedometer } from 'react-icons/io';
import api from '../../../services/api';
import { getFromStorage } from '../../../services/auth';
import {
  alerta,
  haveData,
  weekDay,
  getCurrentDate,
  diffInSeconds,
  base64Decode,
  saveScheduleData,
  updateScheduleData,
  getScheduleData,
} from '../../../services/funcoes';
import {
  getLocalObject,
  setLocalObject,
  delLocalObject,
  getGps,
  setGps,
  deleteDB,
} from '../../../services/databaseLocal';
import { Icon, Button } from 'react-materialize';
import WaitScreen from '../../../Components/Globals/WaitScreen';
import {
  forceSyncLocalData,
  getAllSyncs,
  getBase64,
  getDataSync,
  getStatusSchedule,
  loadLocalData,
  loadLocalOutOfSyncData,
  syncLocationData,
} from './tradeGlobalFunctions';
import TradeLocation from '../../../Components/FieldWork/TradeLocation';
import { EnviromentVars } from '../../../config/env';
import Header from '../../../Components/System/Header';
import { ComponentsHomeContext } from '../../../providers/componentsHome';
import './forced.css';
import Question from '../../../Components/Globals/Question';
import { format } from 'date-fns';
import { IoMdPhotos } from 'react-icons/io';
import imageCompression from 'browser-image-compression';

// let _isMounted = false;
class Trade extends Component {
  static contextType = ComponentsHomeContext;
  state = {
    loading: false,
    selectedDate: undefined,
    lastUpdateTrade: 0,
    lastUpdate: 0,
    indexedDBSupported: -1,
    timerGps: undefined,
    latitude: undefined,
    longitude: undefined,
    forceGpsUpdate: false,
    interruptForced: false,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalTimeInSeconds: 0,
    interval: undefined,
    intervalCheckTime: undefined,
    isDayFinalized: false,
    isCheckMinutesForEnd: false,
    userEmail: '',
    isAdmin: false,
    GAA_KM_INICIAL: '',
    GAA_KM_FINAL: '',
    imageKmInitial: null,
    imageKmFinal: null,
    currentDrivenOdometro: {
      GKM_USR_AGENDA_ID: null,
      GKM_DATA: null,
      GKM_KM_INICIAL: null,
      GKM_KM_INICIAL_DATA: null,
      GKM_KM_INICIAL_FOTO: null,
      GKM_KM_INICIAL_LATITUDE: null,
      GKM_KM_INICIAL_LONGITUDE: null,
      GKM_KM_FINAL: null,
      GKM_KM_FINAL_DATA: null,
      GKM_KM_FINAL_FOTO: null,
      GKM_KM_FINAL_LATITUDE: null,
      GKM_KM_FINAL_LONGITUDE: null,
    },
  };

  componentDidMount = async () => {
    let { interruptForced } = this.state;
    interruptForced = this.props.location.state ? this.props.location.state.interruptForced : false;

    await this.carregarVariaveisEstado();

    const hodometroActive = await getLocalObject('hodometroActive');

    await this.loadScreen(0);
    // this.setState({ indexedDBSupported: undefined });
    this.setState({ interruptForced, hodometroActive });
  };

  handleGenerateCode = async () => {
    const { userEmail } = this.state;
    try {
      const retorno = await api.post('v1/pwd', {
        usrEmail: userEmail,
      });
      const _data = retorno.data;
      if (_data.data.length > 0 && _data.sucess) {
        this.setState({ code: _data.data });
      }
    } catch (err) {
      // console.log(err);
    }
  };

  loadScreen = async (lastUpdateTradeNew) => {
    let { timerGps, gmovelHodometro } = this.state;
    clearInterval(timerGps);
    await this.loadScheduleData();

    await this.setSelectedDate(0);
    timerGps = setInterval(() => {
      this.getActualPosition();
    }, EnviromentVars.gpsRefresh);

    this.setState(
      {
        timerGps,
        indexedDB: window.indexedDB,
        lastUpdateTrade: lastUpdateTradeNew,
      },
      async () => {
        if (gmovelHodometro) {
          await this.handleGetOdometro();
        }
      }
    );
  };

  componentWillUnmount = () => {
    let { timerGps, gpsOffline, intervalStart, intervalCheckTime, interval, intervalRegressive } = this.state;
    clearInterval(timerGps);
    clearInterval(gpsOffline);
    clearInterval(intervalStart);
    clearInterval(intervalCheckTime);
    clearInterval(interval);
    clearInterval(intervalRegressive);
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();

    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      empresaCnpj: sessao.empresaCnpj,
      frotaId: sessao.frotaId,
      gmovel: sessao.gmovel,
      gmovelTrade: sessao.gmovelTrade,
      gmovelPromotor: sessao.gmovelPromotor,
      gmovelSupervisor: sessao.gmovelSupervisor,
      userEmail: sessao.email,
      isAdmin: sessao.isAdmin,
      gmovelHodometro: sessao.gmovelHodometro,
    });
  };

  handleGetOdometro = async () => {
    try {
      const { scheduleSelected, empresaAtiva, usuarioAtivo } = this.state;

      let date = format(new Date(), 'dd/MM/yyyy');
      if (scheduleSelected && scheduleSelected.status !== undefined) {
        date = scheduleSelected.GAA_DTA_AGENDA;
      }

      this.setState({ loading: true });

      const res = await api.get(`v2/trade/kmdriven/${empresaAtiva}/${usuarioAtivo}`, {
        params: {
          data: date,
          usuarioAgenda: usuarioAtivo,
        },
      });

      const { data } = res.data;

      if (haveData(data)) {
        await setLocalObject('currentDrivenOdometro', data[0]);

        if (!data[0].GKM_KM_FINAL_FOTO && !data[0].GKM_KM_FINAL) {
          this.setState({ hodometroActive: true });
        }

        this.setState({
          currentDrivenOdometro: data[0],
          imageKmInitial: data[0].GKM_KM_INICIAL_FOTO,
          imageKmFinal: data[0].GKM_KM_FINAL_FOTO,
          GAA_KM_INICIAL: data[0].GKM_KM_INICIAL,
          GAA_KM_FINAL: data[0].GKM_KM_FINAL,
        });
      }
    } catch (error) {
      //
    } finally {
      this.setState({ loading: false });
    }
  };

  handleSaveOdometro = async () => {
    try {
      const {
        empresaAtiva,
        usuarioAtivo,
        latitude,
        longitude,
        imageKmInitial,
        imageKmFinal,
        GAA_KM_INICIAL,
        GAA_KM_FINAL,
        fileExtensionInitial,
        fileExtensionFinal,
        currentDrivenOdometro,
      } = this.state;
      this.setState({ loading: true });

      if (!Number(GAA_KM_INICIAL) && Number(GAA_KM_INICIAL) === 0 && !GAA_KM_FINAL && GAA_KM_FINAL === 0) {
        alerta('Informe os dados do hodômetro', 2);
        return;
      }

      if (GAA_KM_FINAL && GAA_KM_FINAL < GAA_KM_INICIAL) {
        alerta('A quilometragem do fim do dia não pode ser menor que a do início', 2);
        return;
      }

      if (!currentDrivenOdometro?.GKM_KM_INICIAL_FOTO && imageKmInitial) {
        currentDrivenOdometro.GKM_KM_INICIAL_FOTO = await this.handleSaveImage(
          imageKmInitial,
          `Foto_inicio${fileExtensionInitial}`,
          `km inicio dia`
        );
      }

      if (!currentDrivenOdometro?.GKM_KM_FINAL_FOTO && imageKmFinal) {
        currentDrivenOdometro.GKM_KM_FINAL_FOTO = await this.handleSaveImage(
          imageKmFinal,
          `Foto_fim${fileExtensionFinal}`,
          `km fim dia`
        );
      }

      if (GAA_KM_INICIAL && !currentDrivenOdometro.GKM_KM_INICIAL_FOTO) {
        alerta('Adicione a foto do início do dia', 2);
        return;
      }

      if (GAA_KM_FINAL && !currentDrivenOdometro.GKM_KM_FINAL_FOTO) {
        alerta('Adicione a foto do fim do dia', 2);
        return;
      }

      const payload = {
        GKM_USR_AGENDA_ID: usuarioAtivo,
        GKM_DATA: format(new Date(), 'yyyy-MM-dd'),
        GKM_KM_INICIAL: GAA_KM_INICIAL,
        GKM_KM_INICIAL_DATA:
          currentDrivenOdometro?.GKM_KM_INICIAL_FOTO && !currentDrivenOdometro?.GKM_KM_INICIAL_DATA
            ? format(new Date(), 'yyyy-MM-dd hh:mm:ss')
            : currentDrivenOdometro?.GKM_KM_INICIAL_DATA,
        GKM_KM_INICIAL_FOTO: currentDrivenOdometro.GKM_KM_INICIAL_FOTO,
        GKM_KM_INICIAL_LATITUDE:
          currentDrivenOdometro?.GKM_KM_INICIAL_FOTO && !currentDrivenOdometro?.GKM_KM_INICIAL_LATITUDE
            ? latitude
            : currentDrivenOdometro?.GKM_KM_INICIAL_LATITUDE,
        GKM_KM_INICIAL_LONGITUDE:
          currentDrivenOdometro?.GKM_KM_INICIAL_FOTO && !currentDrivenOdometro?.GKM_KM_INICIAL_LONGITUDE
            ? longitude
            : currentDrivenOdometro?.GKM_KM_INICIAL_LONGITUDE,
        GKM_KM_FINAL: GAA_KM_FINAL,
        GKM_KM_FINAL_DATA:
          currentDrivenOdometro?.GKM_KM_FINAL_FOTO && !currentDrivenOdometro?.GKM_KM_FINAL_DATA
            ? format(new Date(), 'yyyy-MM-dd hh:mm:ss')
            : currentDrivenOdometro?.GKM_KM_FINAL_DATA,
        GKM_KM_FINAL_FOTO: currentDrivenOdometro.GKM_KM_FINAL_FOTO,
        GKM_KM_FINAL_LATITUDE:
          currentDrivenOdometro?.GKM_KM_FINAL_FOTO && !currentDrivenOdometro?.GKM_KM_FINAL_LATITUDE
            ? latitude
            : currentDrivenOdometro?.GKM_KM_FINAL_LATITUDE,
        GKM_KM_FINAL_LONGITUDE:
          currentDrivenOdometro?.GKM_KM_FINAL_FOTO && !currentDrivenOdometro?.GKM_KM_FINAL_LONGITUDE
            ? longitude
            : currentDrivenOdometro?.GKM_KM_FINAL_LONGITUDE,
      };
      const res = await api.post(`v2/trade/kmdriven/${empresaAtiva}/${usuarioAtivo}`, payload);

      const { sucess, data } = res.data;

      if (sucess) {
        let resData = data;
        if (Array.isArray(data)) {
          resData = data[0];
        }
        if (currentDrivenOdometro?.GKM_KM_FINAL_FOTO) {
          await setLocalObject('hodometroActive', false);
          this.setState({ hodometroActive: false });
        } else {
          await setLocalObject('hodometroActive', true);
          this.setState({ hodometroActive: true });
        }
        await setLocalObject('currentDrivenOdometro', resData);
        this.setState({ currentDrivenOdometro: resData });
        alerta('Salvo com sucesso', 1);
      }
    } catch (error) {
      alerta('Não foi possível salvar', 2);
    } finally {
      this.setState({ loading: false });
    }
  };

  getActualPosition = async () => {
    let { lastUpdate, timerGps, latitude } = this.state;
    this.setState({ lastUpdate: lastUpdate + 1 });
  };

  onUpdateCoord = async (gpsAvailable, gpsEnabled, coords) => {
    let { empresaAtiva, usuarioAtivo } = this.state;

    if (coords.latitude !== undefined) {
      syncLocationData(empresaAtiva, usuarioAtivo, coords.latitude, coords.longitude);
      this.setState({ latitude: coords.latitude, longitude: coords.longitude });
      setGps(coords.latitude, coords.longitude);
    }
  };

  loadScheduleData = async () => {
    this.setState({ loading: true });
    try {
      let { empresaAtiva, usuarioAtivo, latitude, longitude } = this.state;
      let scheduleData;
      let allScheduleData = [];
      let tableData = await getScheduleData();
      let userLocal = await base64Decode(`${localStorage.getItem('SaibGeoMovel')}`);
      userLocal = JSON.parse(userLocal);

      if (
        userLocal?.codigoUsuario === tableData?.GAA_USR_ID_AGENDA &&
        (tableData?.sucessStarted ||
          (tableData !== undefined && tableData.REN_FLG_STATUS !== 0 && tableData.status !== undefined))
      ) {
        scheduleData = tableData;
        allScheduleData.push(scheduleData);

        this.setState({
          scheduleData,
          loading: false,
          allScheduleData,
        });
        return;
      }

      const url = '/v1/schedule/' + empresaAtiva + '/' + usuarioAtivo;
      const data = {
        usuarioAgenda: usuarioAtivo,
        status: 1,
        dataInicial: getCurrentDate(),
        dataFinal: getCurrentDate(7),
        latitude,
        longitude,
      };
      const retorno = await api.post(url, data);

      // alert('6');
      if (retorno.data.data !== undefined) {
        // alert('7');
        let retorno_ = retorno.data.data;

        for (const dados of retorno_) {
          allScheduleData.push(dados);
        }
      }
      // alert('8');
      if (allScheduleData !== undefined) {
        // alert('9');
        let dataHoje = getCurrentDate();
        let dataAmanha = getCurrentDate(1);

        for (const schedule of allScheduleData) {
          if (schedule.GAA_DTA_AGENDA === dataHoje) {
            schedule.diaSemana = 'Hoje';
            const pesquisas = await this.loadFlowData(schedule.GAA_GAF_ID);
            schedule.PESQUISAS = pesquisas.PESQUISAS;
            await deleteDB('ScheduleDataDB');
            await saveScheduleData(schedule);
          } else {
            if (schedule.GAA_DTA_AGENDA === dataAmanha) {
              schedule.diaSemana = 'Amanhã';
            } else {
              schedule.diaSemana = weekDay(schedule.GAA_DTA_AGENDA);
            }
          }
        }
      }

      let recompos = await this.handleGetAllData();
      if (recompos) {
        this.setState({
          loading: false,
          noInternet: false,
        });
        return;
      }

      this.setState({
        loading: false,
        allScheduleData,
        noInternet: false,
      });
    } catch (error) {
      this.setState({ noInternet: true, loading: false });
      alerta(String(error));
    }
    this.setState({ loading: false });
  };

  handleGetAllData = async () => {
    try {
      const { empresaAtiva, usuarioAtivo } = this.state;
      this.setState({ loading: true });
      const date = format(new Date(), 'dd/MM/yyyy');
      const res = await getAllSyncs(empresaAtiva, usuarioAtivo, date);

      const lastItem = res[res.length - 1];

      if (lastItem) {
        return await this.handleGetDataCloud(lastItem);
      }
      return false;
    } catch (error) {
      return false;
    } finally {
      this.setState({ loading: false });
    }
  };

  handleGetDataCloud = async (dataSelected) => {
    try {
      const { allScheduleData } = this.state;
      this.setState({ loading: true });
      let res = await getDataSync(dataSelected._id);
      const arrayAux = allScheduleData || [];

      if (res) {
        const dataRes = res.find((e) => e._id === dataSelected._id);

        if (dataRes.DB) {
          let resParse = Buffer.from(dataRes.DB, 'base64').toString('utf8');
          resParse = JSON.parse(resParse);
          let { empresaAtiva, usuarioAtivo } = this.state;
          let scheduleStatus = await getStatusSchedule(empresaAtiva, usuarioAtivo, resParse.GAA_ID);

          if (scheduleStatus?.GAA_FLG_STATUS === 2) {
            resParse.status = 2;

            let _data = JSON.stringify(resParse);
            _data = Buffer.from(_data.toString()).toString('base64');
            await saveScheduleData(resParse);

            if (allScheduleData) {
              arrayAux.unshift(resParse);
            } else {
              arrayAux.push(resParse);
            }

            this.setState({
              scheduleData: resParse,
              scheduleSelected: resParse,
              allScheduleData: arrayAux,
            });
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      return false;
    } finally {
      this.setState({ loading: false });
    }
  };

  loadFlowData = async (fluxoId) => {
    try {
      let { empresaAtiva, usuarioAtivo } = this.state;
      const url = '/v1/flows/full/' + empresaAtiva + '/' + usuarioAtivo;
      const data = {
        codigoFluxo: fluxoId,
        somenteAtivos: true,
      };

      const retorno = await api.post(url, data);

      let fluxo = retorno.data.data[0];
      for (const pesquisa of fluxo.PESQUISAS) {
        pesquisa.GFP_POSICAO = parseInt(pesquisa.GFP_POSICAO);
      }
      // let pesquisasOrdenadas = fluxo.PESQUISAS.sort((a,b) => {return a.GFP_POSICAO < b.GFP_POSICAO ? -1 : 0 });
      fluxo.PESQUISAS = fluxo.PESQUISAS.sort((a, b) => {
        return a.GFP_POSICAO < b.GFP_POSICAO ? -1 : 0;
      });
      return fluxo;
    } catch (error) {
      this.setState({ noInternet: true });
    }
  };

  setSelectedDate = async (addDay, outOfSync = false) => {
    let {
      scheduleData,
      allScheduleData,
      outSyncData,
      selectedDate,
      empresaAtiva,
      alertaEmpresaDiferente,
      intervalCheckTime,
    } = this.state;

    scheduleData = undefined;
    outSyncData = await loadLocalOutOfSyncData();
    let scheduleSelected;

    if (outOfSync) {
      selectedDate = outOfSync.GAA_DTA_AGENDA;
      scheduleSelected = outOfSync;
    } else {
      if (!allScheduleData) {
        await delLocalObject('allScheduleData');
        await delLocalObject('scheduleData');
        await delLocalObject('perguntas');
        this.setState({ scheduleData, allScheduleData });
        return;
      }
      selectedDate = getCurrentDate(addDay);
      scheduleSelected = allScheduleData.find((item) => item.GAA_DTA_AGENDA === getCurrentDate(addDay));

      if (scheduleSelected !== undefined && scheduleSelected.GAA_DTA_AGENDA === getCurrentDate(0)) {
        scheduleData = await getScheduleData();
        if (outSyncData === undefined && scheduleSelected !== undefined && scheduleData === undefined) {
          scheduleData = scheduleSelected;
        } else {
          scheduleData = await getScheduleData();
          if (scheduleData !== undefined) {
            scheduleSelected = scheduleData;
          }
        }
      }
    }
    alertaEmpresaDiferente =
      scheduleSelected !== undefined && scheduleSelected.GAA_EMP_ID !== empresaAtiva
        ? scheduleSelected.GAA_EMP_ID
        : undefined;

    const weekDayInterrupt = weekDay(new Date());

    if (scheduleData && scheduleData?.HORARIOS_TRABALHO) {
      if (weekDayInterrupt === 'Sábado') {
        scheduleSelected.HORARIOS_TRABALHO.INICIO_JORNADA = scheduleSelected.HORARIOS_TRABALHO.INICIO_JORNADA_SA;
        scheduleSelected.HORARIOS_TRABALHO.FIM_JORNADA = scheduleSelected.HORARIOS_TRABALHO.FIM_JORNADA_SA;
        scheduleSelected.HORARIOS_TRABALHO.INICIO_PARADA1 = scheduleSelected.HORARIOS_TRABALHO.INICIO_PARADA1_SA;
        scheduleSelected.HORARIOS_TRABALHO.FIM_PARADA1 = scheduleSelected.HORARIOS_TRABALHO.FIM_PARADA1_SA;
        scheduleSelected.HORARIOS_TRABALHO.FORCAR_PARADA1 = scheduleSelected.HORARIOS_TRABALHO.FORCAR_PARADA1_SA;
      }

      if (
        scheduleSelected &&
        scheduleSelected.HORARIOS_TRABALHO &&
        Object.keys(scheduleSelected.HORARIOS_TRABALHO).length !== 0
      ) {
        let initial = new Date();
        if (scheduleSelected.HORARIOS_TRABALHO.INICIO_JORNADA !== null) {
          const hoursInitial = scheduleSelected.HORARIOS_TRABALHO.INICIO_JORNADA.split(':', 3);
          initial.setHours(hoursInitial[0], hoursInitial[1], hoursInitial[2]);
        } else {
          initial = null;
        }

        let final = new Date();
        if (scheduleSelected.HORARIOS_TRABALHO.FIM_JORNADA !== null) {
          const hoursEnd = scheduleSelected.HORARIOS_TRABALHO.FIM_JORNADA.split(':', 3);
          final.setHours(hoursEnd[0], hoursEnd[1], hoursEnd[2]);
        } else {
          final = null;
        }

        if (initial && final) {
          const resultInitial = diffInSeconds(new Date(), initial);
          const resultFinal = diffInSeconds(new Date(), final);

          if (
            (resultInitial >= 0 && resultFinal <= 0) ||
            (!scheduleSelected.endAttendances && scheduleSelected.startAttendances)
          ) {
            scheduleSelected.HORARIOS_TRABALHO.Released = true;
          } else {
            scheduleSelected.HORARIOS_TRABALHO.Released = false;
            if (resultInitial <= 0) {
              this.handleStopWatch(resultInitial);
              this.handleStopWatchRegressive(scheduleSelected);
            } else {
              this.setState({ isDayFinalized: true });
            }
          }

          if (resultInitial >= 0 && resultFinal / 60 >= -30 && resultFinal !== 0) {
            this.setState({ isCheckMinutesForEnd: true });
            this.handleStopWatch(resultFinal);
            this.handleStopWatchRegressiveEndDay();
          }

          intervalCheckTime = setInterval(() => {
            const resultInitialInFunction = diffInSeconds(new Date(), initial);
            const resultFinalInFunction = diffInSeconds(new Date(), final);

            if (
              (resultInitialInFunction >= 0 && resultFinalInFunction <= 0) ||
              (!scheduleSelected.endAttendances && scheduleSelected.startAttendances)
            ) {
              if (scheduleSelected.HORARIOS_TRABALHO.Released === false) {
                clearInterval(intervalCheckTime);
              }
              scheduleSelected.HORARIOS_TRABALHO.Released = true;
            } else {
              scheduleSelected.HORARIOS_TRABALHO.Released = false;
              if (resultInitialInFunction <= 0) {
                this.handleStopWatch(resultInitialInFunction);
                this.handleStopWatchRegressive(scheduleSelected);
              } else {
                this.setState({ isDayFinalized: true });
              }
            }
          }, 1000 * 30);
        } else {
          scheduleSelected.HORARIOS_TRABALHO.Released = true;
        }
      }
    }

    this.setState({
      alertaEmpresaDiferente,
      selectedDate,
      scheduleSelected,
      scheduleData,
      outSyncData,
      intervalCheckTime,
    });
  };

  handleStopWatch = (result) => {
    let { totalTimeInSeconds, hours, minutes, seconds } = this.state;

    totalTimeInSeconds = result * -1;
    hours = Math.floor(totalTimeInSeconds / 3600) % 24;
    minutes = Math.floor(totalTimeInSeconds / 60) % 60;
    seconds = totalTimeInSeconds % 60;

    this.setState({ totalTimeInSeconds, hours, minutes, seconds });
  };

  handleStopWatchRegressive = (scheduleSelected) => {
    let { totalTimeInSeconds, minutes, seconds, hours, interval } = this.state;

    interval = setInterval(() => {
      if (totalTimeInSeconds > 0) {
        totalTimeInSeconds = totalTimeInSeconds - 1;
        hours = Math.floor(totalTimeInSeconds / 3600) % 24;
        minutes = Math.floor(totalTimeInSeconds / 60) % 60;
        seconds = totalTimeInSeconds % 60;
        this.setState({ totalTimeInSeconds, hours, minutes, seconds });
      } else {
        clearInterval(interval);
        scheduleSelected.HORARIOS_TRABALHO.Released = true;
      }
    }, 1000);

    this.setState({ interval, scheduleSelected });
  };

  handleStopWatchRegressiveEndDay = () => {
    let { totalTimeInSeconds, minutes, seconds, hours, intervalRegressive } = this.state;

    intervalRegressive = setInterval(() => {
      if (totalTimeInSeconds > 0) {
        totalTimeInSeconds = totalTimeInSeconds - 1;
        hours = Math.floor(totalTimeInSeconds / 3600) % 24;
        minutes = Math.floor(totalTimeInSeconds / 60) % 60;
        seconds = totalTimeInSeconds % 60;
        this.setState({ totalTimeInSeconds, hours, minutes, seconds });
      } else {
        this.setState({ isDayFinalized: true, isCheckMinutesForEnd: false });
        clearInterval(intervalRegressive);
      }
    }, 1000);
    this.setState({ intervalRegressive });
  };

  syncLocalData = async (forceClose) => {
    let {
      scheduleData,
      latitude,
      longitude,
      empresaAtiva,
      usuarioAtivo,
      empresaCnpj,
      currentDrivenOdometro,
      gmovelHodometro,
    } = this.state;

    if (gmovelHodometro && !currentDrivenOdometro?.GKM_KM_FINAL && !currentDrivenOdometro?.GKM_KM_FINAL_FOTO) {
      alerta('Para finalizar o dia, é necessário informar o KM final', 2);
      return;
    }

    this.setState({ loading: true });

    if (!scheduleData) {
      scheduleData = await loadLocalData();
    }

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
      await delLocalObject('scheduleData');
      await delLocalObject('perguntas');
      await deleteDB(EnviromentVars.imageDB);
      await deleteDB(EnviromentVars.gpsDB);
      await deleteDB('ScheduleDataDB');
      this.setState({ loading: false });
      alerta('Dia finalizado com sucesso', 1);
      this.props.history.push('/Home');
      this.setSelectedDate(0);
    }
    this.setState({ loading: false });

    if (!res && forceClose) {
      alerta('Não foi possível finalizar o dia, verifique a sua conexão com a internet e tente novamente.', 2);
    }
    this.setSelectedDate(0);
  };

  handleStartDay = async () => {
    let gpsData = await getGps();

    const { scheduleSelected, gmovelHodometro, currentDrivenOdometro } = this.state;

    if (
      gmovelHodometro &&
      scheduleSelected !== undefined &&
      scheduleSelected.status === undefined &&
      !scheduleSelected?.sucessStarted
    ) {
      if (!currentDrivenOdometro.GKM_KM_INICIAL_FOTO && !currentDrivenOdometro.GKM_KM_INICIAL) {
        alerta('Para iniciar o dia, é necessário informar o KM inicial, e a foto', 2);
        return;
      }
    }

    if (gpsData === undefined || !gpsData || gpsData.length === 0) {
      alerta('Ative a localização do seu aparelho.', 2);
    } else {
      const { active } = this.context;
      if (!active) {
        this.setState({ loading: false });
        let { scheduleData } = this.state;
        await updateScheduleData(scheduleData);
        await delLocalObject('perguntas');
        this.props.history.push('/StartWorkDay', { state: { scheduleData, action: 'editar' } });
      } else {
        this.setState({ loading: true });
        const intervalStart = setInterval(async () => {
          const { active } = this.context;
          if (!active) {
            this.setState({ loading: false });
            let { scheduleData } = this.state;
            await updateScheduleData(scheduleData);
            await delLocalObject('perguntas');
            this.props.history.push('/StartWorkDay', { state: { scheduleData, action: 'editar' } });
            clearInterval(intervalStart);
          } else {
            this.setState({ loading: true });
          }
        }, 500);
        this.setState({ intervalStart });
      }
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

  handleGetImage = async (event) => {
    try {
      this.setState({ loading: true });
      const img = event.target.files[0];

      if (img) {
        const options = {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        let compressedFile = await imageCompression(img, options);

        const fileExtension = compressedFile.name.substring(
          compressedFile.name.lastIndexOf('.'),
          compressedFile.name.length
        );

        const resData = await getBase64(compressedFile.size > img.size ? img : compressedFile);
        return { image: resData, fileExtension };
      }
    } catch (error) {
      alerta('Não foi possível salvar a imagem', 2);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleSaveImage = async (image, filename, uniqueid) => {
    try {
      const { usuarioAtivo, empresaCnpj, scheduleData, imageKm, fileExtension } = this.state;

      this.setState({
        loading: true,
      });

      const payload = {
        fileName: filename,
        id: 1,
        imageData: image,
        uniqueid,
      };

      const url = '/v2/trade/sync/image/' + empresaCnpj + '/' + usuarioAtivo;
      const res = await api.post(url, payload, {
        timeout: 30 * 1000,
      });

      const { data } = res.data;
      if (haveData(data)) {
        return data.urlPath;
      }
    } catch (error) {
      alerta('Não foi possível salvar a foto', 2);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    let {
      loading,
      noInternet,
      allScheduleData,
      selectedDate,
      scheduleSelected,
      scheduleData,
      outSyncData,
      indexedDBSupported,
      lastUpdate,
      percent,
      message,
      alertaEmpresaDiferente,
      hours,
      minutes,
      seconds,
      isDayFinalized,
      isCheckMinutesForEnd,
      isAdmin,
      code,
      imageKmInitial,
      imageKmFinal,
      gmovelHodometro,
      GAA_KM_INICIAL,
      GAA_KM_FINAL,
      currentDrivenOdometro,
      hodometroActive,
    } = this.state;

    return (
      <>
        <WaitScreen loading={loading} percent={percent} message={message} />
        <TradeLocation onUpdateCoord={this.onUpdateCoord} lastUpdate={lastUpdate} />
        <Header />
        {indexedDBSupported !== -1 && !haveData(indexedDBSupported) ? (
          <Container className="tradeContainers">
            <Linha
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                color: '#f44336',
                padding: '10px',
                borderRadius: '10px',
                backgroundColor: '#ffeb3b',
                width: '250px',
              }}
            >
              <Icon>warning</Icon>
              <Labels color={'#f44336'}>Navegador não suportado!</Labels>
            </Linha>
          </Container>
        ) : (
          <>
            {allScheduleData !== undefined ? (
              <>
                <Container className="tradeContainers">
                  <SubContainer
                    style={{
                      paddingLeft: '0px',
                      paddingRight: '0px',
                    }}
                  >
                    <Linha
                      style={{
                        width: '100%',
                        alignItems: 'flex-start',
                        gap: '0.2rem',
                        paddingTop: '0px',
                        paddingBottom: '0px',
                      }}
                    >
                      <section
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                        }}
                      >
                        {isAdmin && (
                          <div>
                            <Question
                              iconeBotaoPadrao={<Icon large>lock_outline</Icon>}
                              classeBotaoPadrao="waves-effect waves-light saib-button is-primary"
                              textoBotaoPadrao=""
                              titulo={'Codigo para limpeza de dados locais'}
                              tituloBotaoSim="Fechar"
                              classeBotaoSim="waves-effect waves-light saib-button is-primary modal-action modal-close"
                              message={
                                <div>
                                  <p style={{ marginTop: '50px', textAlign: 'center' }}>
                                    Segue abaixo o codigo para liberação de limpeza de dados locais, este código pode
                                    ser utilizado apenas <strong>UMA</strong> vez. <br />
                                  </p>
                                  <div
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      width: '100%',
                                      alignItems: 'center',
                                      marginTop: '50px',
                                    }}
                                  >
                                    <Button
                                      className="waves-effect waves-light saib-button is-primary"
                                      style={{ width: '200px' }}
                                      onClick={async () => await this.handleGenerateCode()}
                                    >
                                      <Icon large>lock_outline</Icon>
                                      Gerar Codigo
                                    </Button>
                                    {code && (
                                      <input
                                        style={{
                                          marginTop: '30px',
                                          textAlign: 'center',
                                          fontWeight: 'bold',
                                          fontSize: '36px',
                                          width: '200px',
                                        }}
                                        value={code}
                                      />
                                    )}
                                  </div>
                                </div>
                              }
                              onNo={() => {}}
                              onYes={() => {}}
                              singleButton={true}
                            />
                          </div>
                        )}

                        {(gmovelHodometro || hodometroActive) && (
                          <div>
                            <Question
                              iconeBotaoPadrao={<IoIosSpeedometer size={18} />}
                              classeBotaoPadrao="waves-effect waves-light saib-button is-primary"
                              textoBotaoPadrao=""
                              titulo={
                                currentDrivenOdometro?.GKM_KM_INICIAL_FOTO &&
                                currentDrivenOdometro?.GKM_KM_INICIAL &&
                                currentDrivenOdometro?.GKM_KM_FINAL_FOTO &&
                                currentDrivenOdometro?.GKM_KM_FINAL
                                  ? 'Os dados do hodômetro já foram preenchidos'
                                  : 'Informe os dados do hodômetro'
                              }
                              tituloBotaoSim={
                                currentDrivenOdometro?.GKM_KM_INICIAL_FOTO &&
                                currentDrivenOdometro?.GKM_KM_INICIAL &&
                                currentDrivenOdometro?.GKM_KM_FINAL_FOTO &&
                                currentDrivenOdometro?.GKM_KM_FINAL
                                  ? ''
                                  : 'Salvar'
                              }
                              classeBotaoSim={
                                currentDrivenOdometro?.GKM_KM_INICIAL_FOTO &&
                                currentDrivenOdometro?.GKM_KM_INICIAL &&
                                currentDrivenOdometro?.GKM_KM_FINAL_FOTO &&
                                currentDrivenOdometro?.GKM_KM_FINAL
                                  ? 'hidden'
                                  : 'waves-effect waves-light saib-button is-primary modal-action modal-close'
                              }
                              tituloBotaoNao="Fechar"
                              classeBotaoNao="waves-effect waves-light saib-button is-primary modal-action modal-close"
                              message={
                                <div
                                  style={{
                                    overflowY: 'unset',
                                    overflowX: 'hidden',
                                    height: 'unset',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    fontWeight: '700',
                                    fontSize: '16px',
                                    gap: '0.5rem',
                                    width: '95%',
                                  }}
                                >
                                  {!currentDrivenOdometro.GKM_KM_INICIAL_FOTO && !isNaN(currentDrivenOdometro.GKM_KM_INICIAL) && (
                                      <>
                                        <Labels color={'#000'} fontSize={'1.1rem'} style={{ marginTop: '0.4rem' }}>
                                          Km inicial do dia
                                        </Labels>
                                        <input
                                          id="km_initial"
                                          type="number"
                                          value={GAA_KM_INICIAL}
                                          disabled={currentDrivenOdometro.GKM_KM_INICIAL}
                                          placeholder="Informe a KM inicial do dia"
                                          onChange={(e) =>
                                            this.setState({ GAA_KM_INICIAL: Number(e.target.value) || '' })
                                          }
                                          style={{ width: '95%' }}
                                        />
                                        <label
                                          htmlFor="inputPhoto"
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            width: '98%',
                                            color: '#fff',
                                            fontSize: '1.2rem',
                                            padding: '0.3rem 0.5rem',
                                            background: '#8e44ad',
                                          }}
                                        >
                                          Foto do início do dia
                                          <IoMdPhotos size={20} />
                                        </label>

                                        <input
                                          className="hidden"
                                          id="inputPhoto"
                                          type="file"
                                          accept="image/*"
                                          disabled={currentDrivenOdometro.GKM_KM_INICIAL_FOTO}
                                          capture
                                          onChange={async (event) => {
                                            const res = await this.handleGetImage(event);
                                            if (res) {
                                              this.setState({
                                                imageKmInitial: res.image,
                                                fileExtensionInitial: res.fileExtension,
                                              });
                                            }
                                          }}
                                        />
                                        {imageKmInitial && (
                                          <img src={imageKmInitial} alt="Foto saída" width={240} height={200} />
                                        )}
                                      </>
                                    )}

                                  {currentDrivenOdometro.GKM_KM_INICIAL_FOTO && !isNaN(currentDrivenOdometro.GKM_KM_INICIAL) &&
                                    !currentDrivenOdometro.GKM_KM_FINAL_FOTO && !isNaN(currentDrivenOdometro.GKM_KM_FINAL) && (
                                      <>
                                        <Labels color={'#000'} fontSize={'1.1rem'} style={{ marginTop: '0.4rem' }}>
                                          Km final do dia
                                        </Labels>
                                        <input
                                          id="km_initial"
                                          type="number"
                                          disabled={currentDrivenOdometro.GKM_KM_FINAL}
                                          placeholder="Informe a KM final do dia"
                                          value={GAA_KM_FINAL}
                                          onChange={(e) => {
                                            this.setState({ GAA_KM_FINAL: Number(e.target.value) || '' });
                                          }}
                                          style={{ width: '95%' }}
                                        />
                                        <label
                                          htmlFor="inputPhotoFinal"
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            width: '98%',
                                            color: '#fff',
                                            fontSize: '1.2rem',
                                            padding: '0.3rem 0.5rem',
                                            background: '#8e44ad',
                                          }}
                                        >
                                          Foto do fim do dia
                                          <IoMdPhotos size={20} />
                                        </label>

                                        <input
                                          className="hidden"
                                          id="inputPhotoFinal"
                                          type="file"
                                          accept="image/*"
                                          disabled={currentDrivenOdometro.GKM_KM_FINAL_FOTO}
                                          capture
                                          onChange={async (event) => {
                                            const res = await this.handleGetImage(event);
                                            if (res) {
                                              this.setState({
                                                imageKmFinal: res.image,
                                                fileExtensionFinal: res.fileExtension,
                                              });
                                            }
                                          }}
                                        />
                                        {imageKmFinal && (
                                          <img src={imageKmFinal} alt="Foto chegada" width={240} height={200} />
                                        )}
                                      </>
                                    )}
                                </div>
                              }
                              onNo={() => {}}
                              onYes={async () => {
                                await this.handleSaveOdometro();
                              }}
                            />
                          </div>
                        )}

                        <Link
                          className="botaoConfig saib-button is-circle"
                          onClick={() => {
                            let { timerGps } = this.state;
                            clearInterval(timerGps);
                          }}
                          to={{
                            pathname: '/TradeAdmin',
                          }}
                          style={{ textDecoration: 'none', color: 'white', marginTop: '9px', width: '48px' }}
                        >
                          <Icon style={{ margin: '0px 4px' }} small>
                            phonelink_setup
                          </Icon>
                        </Link>
                      </section>
                    </Linha>
                    {noInternet ||
                    alertaEmpresaDiferente !== undefined ||
                    (allScheduleData !== undefined && allScheduleData.length === 0) ? (
                      <>
                        <DivDetalhe>
                          {alertaEmpresaDiferente !== undefined && (
                            <>
                              <TradeTitle>
                                Não é possível utilizar o aplicativo de coleta, ele foi utilizado para coletar pesquisas
                                da empresa {alertaEmpresaDiferente}.
                              </TradeTitle>
                              <Button
                                className="waves-effect waves-light saib-button is-primary"
                                onClick={() => this.props.history.push('/login')}
                              >
                                <Icon>logout</Icon> Sair
                              </Button>
                            </>
                          )}
                          {!noInternet && allScheduleData !== undefined && allScheduleData.length === 0 && (
                            <>
                              <TradeTitle>Sem atividades agendadas</TradeTitle>
                              <Button
                                className="waves-effect waves-light saib-button is-primary"
                                onClick={() => this.loadScheduleData()}
                              >
                                {' '}
                                <Icon>refresh</Icon> Atualizar
                              </Button>
                            </>
                          )}
                        </DivDetalhe>
                      </>
                    ) : (
                      <>
                        <Linha>
                          <TradeTitle>Agenda</TradeTitle>
                        </Linha>
                        <Linha
                          className="carrossel"
                          style={{
                            flexDirection: 'row',
                            flexWrap: 'nowrap',
                            paddingLeft: '0px',
                            paddingRight: '0px',
                            overflowX: 'overlay',
                          }}
                        >
                          {outSyncData !== undefined && (
                            <DayCard
                              display={outSyncData !== undefined ? 'flex' : 'none'}
                              onClick={() => this.setSelectedDate(0, outSyncData)}
                              style={{ color: '#bf1f7c' }}
                            >
                              Não Sinc. <br />
                              {outSyncData.GAA_DTA_AGENDA} <br />
                              <DayCardChecked display={selectedDate === outSyncData.GAA_DTA_AGENDA ? 'flex' : 'none'} />
                            </DayCard>
                          )}
                          <DayCard
                            display={
                              allScheduleData.find((item) => item.GAA_DTA_AGENDA === getCurrentDate()) !== undefined
                                ? 'flex'
                                : 'none'
                            }
                            onClick={() => this.setSelectedDate(0)}
                          >
                            Hoje <br />
                            {getCurrentDate()} <br />
                            <DayCardChecked display={selectedDate === getCurrentDate() ? 'flex' : 'none'} />
                          </DayCard>
                          <DayCard
                            display={
                              allScheduleData.find((item) => item.GAA_DTA_AGENDA === getCurrentDate(1)) !== undefined
                                ? 'flex'
                                : 'none'
                            }
                            onClick={() => this.setSelectedDate(1)}
                          >
                            Amanhã <br />
                            {getCurrentDate(1)} <br />
                            <DayCardChecked display={selectedDate === getCurrentDate(1) ? 'flex' : 'none'} />
                          </DayCard>
                          <DayCard
                            display={
                              allScheduleData.find((item) => item.GAA_DTA_AGENDA === getCurrentDate(2)) !== undefined
                                ? 'flex'
                                : 'none'
                            }
                            onClick={() => this.setSelectedDate(2)}
                          >
                            {weekDay(getCurrentDate(2))}
                            <br />
                            {getCurrentDate(2)} <br />
                            <DayCardChecked display={selectedDate === getCurrentDate(2) ? 'flex' : 'none'} />
                          </DayCard>
                          <DayCard
                            display={
                              allScheduleData.find((item) => item.GAA_DTA_AGENDA === getCurrentDate(3)) !== undefined
                                ? 'flex'
                                : 'none'
                            }
                            onClick={() => this.setSelectedDate(3)}
                          >
                            {weekDay(getCurrentDate(3))}
                            <br />
                            {getCurrentDate(3)} <br />
                            <DayCardChecked display={selectedDate === getCurrentDate(3) ? 'flex' : 'none'} />
                          </DayCard>
                          <DayCard
                            display={
                              allScheduleData.find((item) => item.GAA_DTA_AGENDA === getCurrentDate(4)) !== undefined
                                ? 'flex'
                                : 'none'
                            }
                            onClick={() => this.setSelectedDate(4)}
                          >
                            {weekDay(getCurrentDate(4))}
                            <br />
                            {getCurrentDate(4)} <br />
                            <DayCardChecked display={selectedDate === getCurrentDate(4) ? 'flex' : 'none'} />
                          </DayCard>
                          <DayCard
                            display={
                              allScheduleData.find((item) => item.GAA_DTA_AGENDA === getCurrentDate(5)) !== undefined
                                ? 'flex'
                                : 'none'
                            }
                            onClick={() => this.setSelectedDate(5)}
                          >
                            {weekDay(getCurrentDate(5))}
                            <br />
                            {getCurrentDate(5)} <br />
                            <DayCardChecked display={selectedDate === getCurrentDate(5) ? 'flex' : 'none'} />
                          </DayCard>
                          <DayCard
                            display={
                              allScheduleData.find((item) => item.GAA_DTA_AGENDA === getCurrentDate(6)) !== undefined
                                ? 'flex'
                                : 'none'
                            }
                            onClick={() => this.setSelectedDate(6)}
                          >
                            {weekDay(getCurrentDate(6))}
                            <br />
                            {getCurrentDate(6)} <br />
                            <DayCardChecked display={selectedDate === getCurrentDate(6) ? 'flex' : 'none'} />
                          </DayCard>
                        </Linha>
                        {scheduleSelected !== undefined &&
                          outSyncData === undefined &&
                          scheduleSelected.GAA_DTA_AGENDA === getCurrentDate() &&
                          scheduleSelected.CLIENTES[0].SEQ_PADRAO !== -1 && (
                            <>
                              <Linha style={{ alignItems: 'center' }}>
                                <DivDetalhe>
                                  <Button
                                    disabled={
                                      Object.keys(scheduleSelected.HORARIOS_TRABALHO).length !== 0
                                        ? !scheduleSelected.HORARIOS_TRABALHO.Released || isDayFinalized
                                          ? true
                                          : false
                                        : false
                                    }
                                    title="Alterar"
                                    className="waves-effect waves-light saib-button is-primary"
                                    onClick={this.handleStartDay}
                                  >
                                    {scheduleSelected !== undefined &&
                                    scheduleSelected.status === undefined &&
                                    !scheduleSelected?.sucessStarted ? (
                                      <>Iniciar atendimento</>
                                    ) : (
                                      <>Continuar atendimento</>
                                    )}
                                  </Button>{' '}
                                  {Object.keys(scheduleSelected.HORARIOS_TRABALHO).length !== 0 &&
                                    scheduleSelected.HORARIOS_TRABALHO.Released === false &&
                                    !isDayFinalized && (
                                      <StopWatchHome>
                                        <strong>&nbsp;{hours.toString().padStart(2, '0')}</strong>
                                        <strong>:</strong>
                                        <strong>{minutes.toString().padStart(2, '0')}</strong>
                                        <strong>:</strong>
                                        <strong>{seconds.toString().padStart(2, '0')}</strong>
                                        <span>&nbsp;para iniciar o atendimento</span>
                                      </StopWatchHome>
                                    )}
                                  {isDayFinalized && (
                                    <MessageUnavailable>Horário de atendimento encerrado</MessageUnavailable>
                                  )}
                                  {isCheckMinutesForEnd && (
                                    <StopWatchHome>
                                      <strong>&nbsp;{hours.toString().padStart(2, '0')}</strong>
                                      <strong>:</strong>
                                      <strong>{minutes.toString().padStart(2, '0')}</strong>
                                      <strong>:</strong>
                                      <strong>{seconds.toString().padStart(2, '0')}</strong>
                                      <span>&nbsp;para encerrar o horário de atendimento</span>
                                    </StopWatchHome>
                                  )}
                                </DivDetalhe>
                              </Linha>
                            </>
                          )}
                        {scheduleSelected !== undefined &&
                          outSyncData === undefined &&
                          scheduleSelected.GAA_DTA_AGENDA === getCurrentDate() &&
                          scheduleSelected.CLIENTES[0].SEQ_PADRAO === -1 && (
                            <>
                              <Linha style={{ alignItems: 'center' }}>
                                <DivDetalhe>
                                  <Link
                                    className="iniciarDia"
                                    style={{ display: 'none' }}
                                    to={{
                                      pathname: '/StartWorkDay',
                                      state: { scheduleData, action: 'editar' },
                                    }}
                                  >
                                    Iniciar
                                  </Link>
                                  <Button
                                    title="Alterar"
                                    className="waves-effect waves-light saib-button is-primary"
                                    onClick={() => this.loadScreen(0)}
                                  >
                                    Ative a localização!
                                  </Button>
                                </DivDetalhe>
                              </Linha>
                            </>
                          )}

                        {outSyncData !== undefined && selectedDate === outSyncData.GAA_DTA_AGENDA && (
                          <>
                            <Linha style={{ alignItems: 'center' }}>
                              <DivDetalhe>
                                <Button
                                  title="Sincronizar"
                                  className="waves-effect waves-light saib-button is-primary"
                                  onClick={() => this.syncLocalData(true)}
                                >
                                  Finalizar dia
                                </Button>
                              </DivDetalhe>
                            </Linha>
                          </>
                        )}

                        {scheduleSelected !== undefined &&
                          scheduleSelected.CLIENTES.map((cliente) => (
                            <Linha
                              key={cliente.CLI_ID}
                              style={{
                                flexDirection: 'row',
                                paddingBottom: '20px',
                                margin: '0px',
                                paddingLeft: '0px',
                                paddingRight: '0px',
                                backgroundColor: cliente.colorir ? '#8e44ad29' : 'unset',
                                borderBottom: '1px solid #ccc',
                              }}
                            >
                              <DivDetalhe flex={0}>
                                <Labels color={'#5a5a5a'}>
                                  <Icon>store</Icon>
                                </Labels>
                              </DivDetalhe>
                              <DivDetalhe flex={4}>
                                <Labels fontWeight={700} fontSize={'1.1rem'} lineHeight={'1rem'} color={'#5a5a5a'}>
                                  {cliente.CLI_CODIGO + ' - ' + cliente.CLI_NOME_FANTASIA}{' '}
                                  <small>({cliente.CLI_RAZAO_SOCIAL})</small>
                                </Labels>
                                <Labels
                                  fontWeight={500}
                                  fontSize={'1.1rem'}
                                  lineHeight={'1.1rem'}
                                  padding={'5px 0px'}
                                  color={'#858585'}
                                >
                                  {cliente.CLI_ENDERECO}
                                </Labels>
                              </DivDetalhe>
                            </Linha>
                          ))}

                        {scheduleSelected !== undefined && scheduleSelected.length === 0 && (
                          <TradeTitle>Sem agendamentos.</TradeTitle>
                        )}
                      </>
                    )}
                  </SubContainer>
                </Container>
              </>
            ) : (
              <>
                {!noInternet && (
                  <Container style={{ marginTop: '20px' }}>
                    <TradeTitle>Para carregar sua agenda de atendimentos, clique em atualizar.</TradeTitle>
                    <Button
                      className="waves-effect waves-light saib-button is-primary"
                      onClick={() => this.loadScheduleData()}
                    >
                      {' '}
                      <Icon>refresh</Icon> Atualizar
                    </Button>
                  </Container>
                )}
                {noInternet && (
                  <Container style={{ marginTop: '20px' }}>
                    <TradeTitle>
                      Não foi possível verificar os agendamentos de hoje, verifique sua conexão com a internet e clique
                      em Tentar novamente!
                    </TradeTitle>
                    <Button
                      className="waves-effect waves-light saib-button is-primary"
                      onClick={() => this.loadScheduleData()}
                    >
                      {' '}
                      <Icon>refresh</Icon> Tentar novamente!{' '}
                    </Button>
                  </Container>
                )}
              </>
            )}
          </>
        )}
      </>
    );
  }
}

export default withRouter(Trade);
