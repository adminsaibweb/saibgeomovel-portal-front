import api from '../../../services/api';
import {
  getLocalObject,
  setLocalObject,
  delLocalObject,
  deleteDB,
  getLocalImageRegistry,
  getScheduleDay,
  startGpsDB,
  putObject,
  deleteObject,
  getGps,
  startErrorsDB,
  getObjectAll,
  getAllImages,
  delLocalImage,
} from '../../../services/databaseLocal';
import {
  haveData,
  alerta,
  getCurrentDate,
  formatDateTimeToBr,
  formatFloat,
  getScheduleData,
  updateScheduleData,
  // sameObject,
} from '../../../services/funcoes';
import { EnviromentVars } from '../../../config/env';
import { compressToBase64, decompressFromBase64, decompress } from 'lz-string';
import { format } from 'date-fns';
// import React, { Component } from 'react';
// import Mailto from 'react-mailto';

// Status agendamento (-2 Cancelada | -1 Pausada | 0  Novo/Não agendado | 1 Agendado | 2 Em execução | 3 Finalizado)

export const scheduleCancel = -2;
export const schedulePaused = -1;
export const scheduleNew = 0;
export const scheduled = 1;
export const scheduleExecution = 2;
export const scheduleEnded = 3;

export const syncLocalTradeData = async (localData, empresaAtiva, usuarioAtivo, sincrono, onUpload) => {
  let scheduleData;
  if (sincrono) {
    localData.sincrono = true;
  }
  var compactada = stringCompress(JSON.stringify(localData));
  const payload = {
    file: compactada,
  };
  try {
    const url = '/v2/trade/sync/' + empresaAtiva + '/' + usuarioAtivo;
    let config = undefined;
    if (onUpload !== undefined) {
      config = {
        onUploadProgress: (progressEvent) => {
          onUpload(0, 'Sincronizando as pesquisas...', true);
          // let percentCompleted = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
          // do whatever you like with the percentage complete
          // maybe dispatch an action that will update a progress bar or something
        },
      };
    }
    let retorno;
    // alerta(`Antes: syncLocalTradeDataapi.post(${String(sincrono)})`, 1);

    if (sincrono) {
      retorno = await api.post(url, payload, config);
      let sRetorno = String(retorno?.data?.data);
      var descompactada = sRetorno !== 'undefined' ? stringDecompress(sRetorno) : '';
      scheduleData = haveData(descompactada) ? JSON.parse(descompactada) : null;
    } else {
      api.post(url, payload);
      scheduleData = localData;
    }
    // alerta('Depois: syncLocalTradeDataapi.post()', 1);
    let error = undefined;
    return { scheduleData, error };
  } catch (error) {
    alerta(`Não foi possível sincronizar ${error}`, 1);
    return { scheduleData, error: `Erro => ${error}` };
  }
};

export const setScheduleStatus = async (empresaAtiva, usuarioAtivo, gaaId, status) => {
  try {
    const url = '/v1/schedule/setstatus/' + empresaAtiva + '/' + usuarioAtivo;
    let data = {
      gaaId,
      status,
    };
    await api.post(url, data);
  } catch (error) {
    return { error };
  }
};

export const loadLocalOutOfSyncData = async () => {
  let tableData = await getScheduleData()
  if (tableData !== undefined) {
    if (!tableData.sincronizado && tableData.GAA_DTA_AGENDA !== getCurrentDate(0)) {
      return tableData;
    }
  }
  return undefined;
};

export const loadLocalData = async () => {
  return await getScheduleData()
};

export const loadLastSyncData = async () => {
  let lastSync = await getLocalObject('lastSyncScheduleData', 'tradeGlobalFunctions -> loadLastSyncData');
  return lastSync;
};

export const distance = async (lat1, lon1, lat2, lon2, unit = 'N') => {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;

    if (unit === 'K') {
      dist = dist * 1.609344;
    }
    if (unit === 'N') {
      dist = dist * 0.8684;
    }
    return dist;
  }
};

export const isOnline = async () => {
  return navigator.onLine;
  // // return true;
  // let finalReturn = false;
  // try {
  //   const url = '/v1/gps/ping'
  //   const retorno = await api.get(url);
  //   finalReturn = retorno.data !== undefined ? retorno.data.sucess : false;
  // } catch (error) {
  //   finalReturn = false;
  // }
  // if (!finalReturn){
  //   alerta('Não está online...', 2);
  // }oooooooooooooooooo
  // return finalReturn;
};

export const uploadImage = async (empresaCnpj, usuarioAtivo, pergunta, onUpload) => {
  if (onUpload !== undefined) {
    onUpload(10, `Preparando a imagem ${pergunta.RESPOSTA}...`, true);
  }
  let imageRegistry = await getLocalImageRegistry(pergunta.RESPOSTA);

  try {
    if (onUpload !== undefined) {
      onUpload(10, `Enviando a imagem ${pergunta.RESPOSTA}...`, true);
    }
    if (haveData(imageRegistry)) {
      const url = '/v2/trade/sync/image/' + empresaCnpj + '/' + usuarioAtivo;
      let retorno = await api.post(url, imageRegistry ? imageRegistry : undefined, {
        timeout: 30 * 1000, // 30 segundos
      });

      let error = undefined;
      if (onUpload !== undefined) {
        onUpload(10, `Imagem ${pergunta.RESPOSTA} enviada com sucesso!`, true);
      }
      return {
        physicalPath: retorno.data.data.physicalPath,
        urlPath: retorno.data.data.urlPath,
        error,
      };
    } else {
      return {
        physicalPath: '',
        urlPath: '',
        error: '',
      };
    }
  } catch (error) {
    if (onUpload !== undefined) {
      // onUpload(10, `ERRO ao enviar a imagem ${pergunta.RESPOSTA}`, true);
    }
    // alerta(`ERRO ao enviar a imagem ${error.}`);
    return {
      physicalPath: undefined,
      urlPath: undefined,
      error,
    };
  }
};

export const uploadScheduleDay = async (empresaCnpj, usuarioAtivo) => {
  let dataDb = await getScheduleDay();
  var _data = JSON.stringify(dataDb);
  _data = Buffer.from(_data.toString()).toString('base64');

  let nameDb = 'scheduleDatabase.json';

  let pacote = {
    imageData: ',' + _data,
    fileName: nameDb,
  };

  try {
    const url = '/v1/trade/sync/scheduleday/' + empresaCnpj + '/' + usuarioAtivo;
    let retorno = await api.post(url, pacote);
    let error = undefined;
    return {
      physicalPath: retorno.data.data.physicalPath,
      urlPath: retorno.data.data.urlPath,
      error,
    };
  } catch (error) {
    return {
      physicalPath: undefined,
      urlPath: undefined,
      error,
    };
  }
};

export const syncImages = async (empresaAtiva, usuarioAtivo, empresaCnpj, onUpload, fullSync) => {
  try {
    let localData = await getScheduleData();
    const searchesLocal = (await getLocalObject('perguntas')) || [];
    if (!localData.imagesChanged && !fullSync) {
      return true;
    }

    let actualImage = 0;
    let progress = 11;
    let retornoSyncImagesFailed = [];
    let objSearch = null;

    for (const cliente of localData.CLIENTES) {
      if (haveData(cliente.pesquisas)) {
        for (const pesquisa of cliente.pesquisas) {
          objSearch = searchesLocal.find((e) => e.GFP_ID === pesquisa.GFP_ID);

          for (const [index, detalhamento] of Object.entries(pesquisa.DETALHAMENTO)) {
            if (detalhamento.AGRUPAMENTO !== undefined) {
              for (const [indexAgrup, agrupamento] of Object.entries(detalhamento.AGRUPAMENTO)) {
                for (const [indexItem, item] of Object.entries(agrupamento.ITEMS)) {
                  for (const [indexPergunta, pergunta] of Object.entries(item.PERGUNTAS)) {
                    if (pergunta.GPP_TIPO_CAMPO === 7) {
                      if (pergunta.RESPOSTA === 'limpar') {
                        pergunta.URL = null;
                        pergunta.ENDERECO_FISICO = null;
                        pergunta.RESPOSTA = null;
                        //programar para apagar a imagem físicamente do servidor//
                      }
                      if (!haveData(pergunta.RESPOSTA)) {
                        pergunta.URL = null;
                        pergunta.ENDERECO_FISICO = null;
                      } else {
                        if (
                          fullSync ||
                          (pergunta.URL !== undefined &&
                            String(pergunta.URL).toLowerCase().indexOf('http') === -1 &&
                            pergunta.RESPOSTA !== 'limpar')
                        ) {
                          progress += 1;
                          actualImage += 1;
                          if (onUpload !== undefined) {
                            onUpload(progress, `Sincronizando as imagens... [${actualImage}]`);
                          }
                          let retornoUpload = {};
                          if (pergunta.RESPOSTA !== 'nao-se-aplica-eca82f') {
                            retornoUpload = await uploadImage(empresaCnpj, usuarioAtivo, pergunta, onUpload);
                          } else {
                            retornoUpload.urlPath =
                              'https://imgweb.saibweb.com.br/entregas/imagens/37426786000100/nao-se-aplica-eca82f.png';
                            retornoUpload.physicalPath =
                              'https://imgweb.saibweb.com.br/entregas/imagens/37426786000100/nao-se-aplica-eca82f.png';
                          }

                          if (!retornoUpload.error) {
                            pergunta.URL = retornoUpload.urlPath;
                            pergunta.ENDERECO_FISICO = retornoUpload.physicalPath;
                            if (objSearch) {
                              objSearch.DETALHAMENTO[index].AGRUPAMENTO[indexAgrup].ITEMS[indexItem].PERGUNTAS[
                                indexPergunta
                              ].URL = retornoUpload.urlPath;
                              await setLocalObject('perguntas', searchesLocal);
                            }
                            await delLocalImage(pergunta.RESPOSTA);
                            await updateScheduleData(localData)
                          } else {
                            let retorno = {};
                            retorno.pergunta = pergunta;
                            retorno.error = retornoUpload.error;
                            retornoSyncImagesFailed.push(retorno);
                            // alerta(`Não foi possível sincronizar a imagem ${pergunta.RESPOSTA}`, 1);
                          }
                        }
                      }
                    }
                  }
                }
              }
            } else {
              for (const [indexPergunta, pergunta] of Object.entries(detalhamento.PERGUNTAS)) {
                if (pergunta.GPP_TIPO_CAMPO === 7) {
                  if (pergunta.RESPOSTA === 'limpar') {
                    pergunta.URL = null;
                    pergunta.ENDERECO_FISICO = null;
                    pergunta.RESPOSTA = null;
                    //programar para apagar a imagem físicamente do servidor//
                  }
                  if (!haveData(pergunta.RESPOSTA)) {
                    pergunta.URL = null;
                    pergunta.ENDERECO_FISICO = null;
                  } else {
                    if (
                      fullSync ||
                      (pergunta.URL !== undefined &&
                        String(pergunta.URL).toLowerCase().indexOf('http') === -1 &&
                        pergunta.RESPOSTA !== 'limpar')
                    ) {
                      progress += 1;
                      actualImage += 1;
                      if (onUpload !== undefined) {
                        onUpload(progress, `Sincronizando as imagens... [${actualImage}]`);
                      }
                      let retornoUpload = {};
                      if (pergunta.RESPOSTA !== 'nao-se-aplica-eca82f') {
                        retornoUpload = await uploadImage(empresaCnpj, usuarioAtivo, pergunta, onUpload);
                      } else {
                        retornoUpload.urlPath =
                          'https://imgweb.saibweb.com.br/entregas/imagens/37426786000100/nao-se-aplica-eca82f.png';
                        retornoUpload.physicalPath =
                          'https://imgweb.saibweb.com.br/entregas/imagens/37426786000100/nao-se-aplica-eca82f.png';
                      }

                      if (!retornoUpload.error) {
                        pergunta.URL = retornoUpload.urlPath;
                        pergunta.ENDERECO_FISICO = retornoUpload.physicalPath;
                        if (objSearch) {
                          objSearch.DETALHAMENTO[index].PERGUNTAS[indexPergunta].URL = retornoUpload.urlPath;
                        }
                        await delLocalImage(pergunta.RESPOSTA);
                      } else {
                        let retorno = {};
                        retorno.pergunta = pergunta;
                        retorno.error = retornoUpload.error;
                        retornoSyncImagesFailed.push(retorno);
                        // alerta(`Não foi possível sincronizar a imagem ${pergunta.RESPOSTA}`, 1);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    localData.imagesChanged = retornoSyncImagesFailed.length !== 0;
    await updateScheduleData(localData)
    if (objSearch) {
      await setLocalObject('perguntas', searchesLocal);
    }
    return retornoSyncImagesFailed.length === 0;
  } catch (error) {
    // alerta('Não foi possível sincronizar as imagens');
    return false;
  }
};

export const syncLocalData = async (
  forceClose,
  empresaAtiva,
  usuarioAtivo,
  cnpjEmpresa,
  sincrono,
  onUpload,
  fullSync
) => {
  let localData;
  let online = await isOnline();
  if (online) {
    if (onUpload !== undefined) {
      onUpload(10, 'Sincronizando as imagens....');
    }
    let imagensOk = await syncImages(empresaAtiva, usuarioAtivo, cnpjEmpresa, onUpload, fullSync);

    if (onUpload !== undefined && imagensOk) {
      onUpload(0, 'Imagens sincronizadas com sucesso!', true);
    }

    localData = await getScheduleData();
    if (imagensOk) {
      let retorno;
      // alerta('Antes: await getScheduleData()', 1);
      // alerta('Depois: await getScheduleData()', 1);
      // alerta('Antes: syncLocalTradeData()', 1);
      if (onUpload !== undefined) {
        onUpload(1, 'Sincronizando as pesquisas...', true);
      }

      retorno = await syncLocalTradeData(localData, empresaAtiva, usuarioAtivo, sincrono, onUpload);

      if (retorno === undefined || retorno.scheduleData === undefined) {
        if (forceClose) {
          let scheduleStatus = await getStatusSchedule(empresaAtiva, usuarioAtivo, localData?.GAA_ID);
          await uploadLocalData(empresaAtiva, 3328);

          if (scheduleStatus?.GAA_FLG_STATUS === 3) {
            return true;
          }
        }
        return false;
      }

      if (onUpload !== undefined) {
        onUpload(90, 'Pesquisas sincronizadas com sucesso!');
      }
      // alerta('Depois: syncLocalTradeData()', 1);
      let { scheduleData, error } = retorno;

      scheduleData.sincronizando = false;
      if (error === undefined) {
        if (forceClose) {
          setScheduleStatus(empresaAtiva, usuarioAtivo, scheduleData.GAA_ID, 3);
          onUpload(91, 'Limpando os dados locais...[scheduleData]');
          await delLocalObject('scheduleData');
          await delLocalObject('perguntas');
          onUpload(92, 'Limpando os dados locais...[imageDB]');
          await deleteDB(EnviromentVars.imageDB);
          onUpload(93, 'Limpando os dados locais...[allScheduleData]');
          await delLocalObject('allScheduleData');
          onUpload(94, 'Limpando os dados locais...[gpsDB]');
          await deleteDB(EnviromentVars.gpsDB);
          onUpload(100, 'Dados limpos com sucesso!');
        } else {
          await updateScheduleData(scheduleData)
        }
        if (onUpload !== undefined) {
          onUpload(99, 'Fim do sincronismo das pesquisas!');
        }
        return true;
      } else {
        if (haveData) {
          await updateScheduleData(scheduleData)
        }
        alerta(String(error), 1);
        return false;
      }
    } else {
      if (forceClose) {
        let scheduleStatus = await getStatusSchedule(empresaAtiva, usuarioAtivo, localData?.GAA_ID);
        await uploadLocalData(empresaAtiva, 3328);

        if (scheduleStatus?.GAA_FLG_STATUS === 3) {
          return true;
        }
      }
      alerta('Não foi possível sincronizar todas as imagens.', 1);
      return false;
    }
  } else {
    if (forceClose) {
      alerta('Verifique sua conexão com a internet.', 2);
      return false;
    } else {
      return online; // força para true o sincronismo caso o usuário não tenha internet no momento e não esteja forçando a finalização do dia
    }
  }
};

export const forceSyncLocalData = async (
  forceClose,
  scheduleData,
  empresaAtiva,
  usuarioAtivo,
  latitude,
  longitude,
  empresaCnpj,
  onUpdateWaitScreen
) => {
  if (forceClose) {
    let dataDataHoraUsuario = new Date();
    await endWorkDay(
      scheduleData,
      empresaAtiva,
      usuarioAtivo,
      scheduleData.GAA_ID,
      latitude,
      longitude,
      dataDataHoraUsuario,
      onUpdateWaitScreen
    );

    scheduleData.status = scheduleEnded;
    let endAttendances = {};
    endAttendances.dataHoraInicio = dataDataHoraUsuario;
    endAttendances.latitude = latitude;
    endAttendances.longitude = longitude;
    scheduleData.startAttendances = endAttendances;
    await updateScheduleData(scheduleData)
  }

  let retorno = await syncLocalData(forceClose, empresaAtiva, usuarioAtivo, empresaCnpj, false, onUpdateWaitScreen);

  if (retorno && !forceClose) {
    let scheduleData = await getScheduleData()
    await deleteDB(EnviromentVars.errosDB);
    return scheduleData;
  }

  return retorno;
};

export async function uploadLocalData(empresaAtiva, usuarioAtivo) {
  try {
    let database = await startErrorsDB('ErrosDB', 'errors');

    let erros = {};
    let photos;

    photos = await getAllImages();
    photos = JSON.stringify(photos);
    erros.FOTOS = photos || [];

    if (database) {
      let object = await getObjectAll(database, 'errors');
      erros.ERROS = object || null;
    }
    let localData = await getScheduleData();
    localData = Buffer.from(JSON.stringify(localData)).toString('base64');
    erros = Buffer.from(JSON.stringify(erros)).toString('base64');

    const payloadLocalData = {
      GSTO_FILE: localData,
    };

    const payloadErros = {
      GSTO_FILE: erros,
    };

    await api.post(`v2/trade/file/${empresaAtiva}/${usuarioAtivo}`, payloadLocalData);
    await api.post(`v2/trade/file/${empresaAtiva}/${usuarioAtivo}`, payloadErros);
  } catch (error) {}
}

export async function getDataCloud(empresaAtiva, usuarioAtivo) {
  try {
    const res = await api.get(`v2/trade/file/${empresaAtiva}/${usuarioAtivo}`);

    const { sucess, data } = res.data;

    if (sucess) {
      if (data.GSTO_FILE) {
        await updateScheduleData(data.GSTO_FILE)
      } else {
        await deleteDB('ScheduleDataDB');
      }
    }
  } catch (error) {
    // alerta('Erro ao fazer download dos dados', 2);
  }
}

export const setImagesChanged = async (changed) => {
  let localData = await getScheduleData()
  localData.imagesChanged = changed;
  await updateScheduleData(localData)
};

export const syncLocationData = async (empresaAtiva, usuarioAtivo, latitude, longitude) => {
  if (await isOnline()) {
    let database = await startGpsDB(EnviromentVars.gpsDB, EnviromentVars.gpsTable);
    let gpsData = await getGps();
    gpsData = gpsData.sort();
    gpsData = gpsData.reverse();

    if (gpsData.length > 1) {
      for (let index = 0; index < gpsData.length - 1; index++) {
        if (gpsData[index] !== undefined && gpsData[index].latitude !== undefined && gpsData[index].synced === 0) {
          let oldLatitude = gpsData[index + 1].latitude;
          let oldLongitude = gpsData[index + 1].longitude;

          if (
            (await distance(gpsData[index].latitude, gpsData[index].longitude, oldLatitude, oldLongitude)) < 0.02 &&
            gpsData[index].id
          ) {
            await deleteObject(database, EnviromentVars.gpsTable, gpsData[index].id);
          } else {
            let data = {
              latitude: gpsData[index].latitude,
              longitude: gpsData[index].longitude,
            };
            try {
              await api.post(`v1/gps/${empresaAtiva}/${usuarioAtivo}`, data, {
                timeout: 20 * 1000, // 20 segundos
              });

              if (database) {
                let data = {
                  id: gpsData[index].id,
                  latitude: gpsData[index].latitude,
                  longitude: gpsData[index].longitude,
                  dateTime: new Date(),
                  synced: 1,
                };
                await putObject(database, EnviromentVars.gpsTable, data);
              }
            } catch (error) {
              //console.log('Não foi possível enviar a localização =>' + error);
            }
          }
        }
      }
    } else if (gpsData !== undefined && gpsData[0].latitude !== undefined) {
      let data = {
        latitude: gpsData[0].latitude,
        longitude: gpsData[0].longitude,
      };
      try {
        await api.post(`v1/gps/${empresaAtiva}/${usuarioAtivo}`, data, {
          timeout: 20 * 1000, // 20 segundos
        });

        if (database) {
          let data = {
            id: gpsData[0].id,
            latitude: gpsData[0].latitude,
            longitude: gpsData[0].longitude,
            dateTime: new Date(),
            synced: 1,
          };
          await putObject(database, EnviromentVars.gpsTable, data);
        }
      } catch (error) {
        //console.log('Não foi possível enviar a localização =>' + error);
      }
    }
  }
};

export const setStatusSchedule = async (empresaAtiva, usuarioAtivo, scheduleId, status) => {
  if (await isOnline()) {
    const url = '/v1/schedule/setstatus/' + empresaAtiva + '/' + usuarioAtivo;
    let data = {
      gaaId: scheduleId,
      status,
    };
    api
      .post(url, data)
      .then((res) => {})
      .catch((error) => {
        //console.log('Não foi possível atualizar o agendamento =>' + error);
      });
  }
};

export const startWorkDay = async (
  empresaAtiva,
  usuarioAtivo,
  scheduleId,
  latitude,
  longitude,
  dataHoraUsuario,
  onUpdate
) => {
  let ok = undefined;
  if (await isOnline()) {
    if (onUpdate !== undefined) {
      onUpdate(40, 'Iniciando o dia...');
    }
    let scheduleData = await getScheduleData();
    const url = '/v2/trade/startday/' + empresaAtiva + '/' + usuarioAtivo;
    let data = {
      scheduleData,
      dataHoraUsuario,
      gaaId: scheduleId,
      status: scheduleExecution,
      latitude,
      longitude,
    };

    var compactada = stringCompress(JSON.stringify(data));
    data = {
      file: compactada,
    };

    let retorno = await api.post(url, data);
    if (onUpdate !== undefined) {
      onUpdate(99, 'Dia iniciado com sucesso!');
    }
    let sRetorno = String(retorno?.data?.data);
    var descompactada = sRetorno !== 'undefined' ? stringDecompress(sRetorno) : '';
    return haveData(descompactada) ? JSON.parse(descompactada) : null;
  }
  return ok;
};

export const endWorkDay = async (
  scheduleData,
  empresaAtiva,
  usuarioAtivo,
  scheduleId,
  latitude,
  longitude,
  dataHoraUsuario,
  onUpdate
) => {
  if (await isOnline()) {
    const url = '/v2/trade/endday/' + empresaAtiva + '/' + usuarioAtivo;
    if (onUpdate !== undefined) {
      onUpdate(10, 'Finalizando o dia...');
    }

    let data = {
      scheduleData,
      dataHoraUsuario,
      gaaId: scheduleId,
      status: scheduleEnded,
      latitude,
      longitude,
    };

    var compactada = stringCompress(JSON.stringify(data));
    data = {
      file: compactada,
    };

    api
      .post(url, data)
      .then((res) => {
        if (onUpdate === undefined) {
          onUpdate(99, 'Dia finalizado com sucesso!');
        }
      })
      .catch((error) => {
        alerta('Não foi possível enviar a finalização do dia para o servidor =>' + error);
      });
  }
};

export const postServiceAlert = async (empresaAtiva, usuarioAtivo, body, onUpdate) => {
  if (await isOnline()) {
    try {
      if (onUpdate !== undefined) {
        onUpdate(1, 'Enviando alerta...');
      }
      const url = '/v1/trade/servicealert/' + empresaAtiva + '/' + usuarioAtivo;

      let res = await api.post(url, body);
      if (res.data && res.data.data) {
        if (onUpdate !== undefined) {
          onUpdate(99, 'Alerta enviado com sucesso!', true);
        }
        alerta('Alerta enviado com sucesso!', 1);
      }
    } catch (err) {
      alerta('Não foi possível enviar o alerta ao servidor =>' + err);
    }
  }
};

export const makeRoute = (origin, destination) => {
  window.open(
    `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}`,
    'Rota Cliente'
  );
};

export const getBase64 = (blob) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};

export const synchronizing = async () => {
  let localData = await getScheduleData();
  let synched = localData.sincronizando;
  return synched;
};

export const getQtdeImagensDentroPerguntas = async (perguntas) => {
  // let contador = 0;
  let encontrei = perguntas.find(
    (pergunta) =>
      pergunta.GPP_TIPO_CAMPO === 7 &&
      (pergunta.URL === undefined ||
        pergunta.RESPOSTA === 'limpar' ||
        (pergunta.URL !== undefined &&
          pergunta.RESPOSTA !== undefined &&
          haveData(pergunta.RESPOSTA) &&
          String(pergunta.URL).toLowerCase().indexOf('http') === -1))
  );

  return encontrei !== undefined ? encontrei.length : 0;
  // for (const pergunta of perguntas) {
  //   if (pergunta.GPP_TIPO_CAMPO === 7){
  //     contador += (pergunta.URL === undefined || pergunta.RESPOSTA === 'limpar' ||
  //       (pergunta.URL !== undefined && pergunta.RESPOSTA !== undefined && haveData(pergunta.RESPOSTA) &&
  //         String(pergunta.URL).toLowerCase().indexOf('http') === -1))
  //       ? 1
  //       : 0;
  //   }
  // }
  // return contador;
};

export const getQtdeImages = async (progress, onUpload) => {
  let localData = await getScheduleData()
  let retorno = 0;
  let totalClientes = localData.CLIENTES.length;
  let contador = 0;

  // if (!haveData(localData.qtdeImages)) {
  for (const cliente of localData.CLIENTES) {
    if (haveData(onUpload)) {
      onUpload(progress, `Contabilizando as imagens [${contador}/${totalClientes}]`);
    }
    if (haveData(cliente.pesquisas)) {
      for (const pesquisa of cliente.pesquisas) {
        for (const detalhamento of pesquisa.DETALHAMENTO) {
          if (detalhamento.AGRUPAMENTO !== undefined) {
            for (const agrupamento of detalhamento.AGRUPAMENTO) {
              for (const item of agrupamento.ITEMS) {
                retorno += await getQtdeImagensDentroPerguntas(item.PERGUNTAS);
              }
            }
          } else {
            retorno += await getQtdeImagensDentroPerguntas(detalhamento.PERGUNTAS);
          }
        }
      }
    }
  }
  //   localData.qtdeImages = retorno;
  //   await setLocalObject('scheduleData', localData);
  // } else {
  //   retorno = localData.qtdeImages;
  // }
  return retorno;
};
// export const EnviarEmail = ({ email, subject, body, ...props })  =>{
//   return (
//     <a href={`mailto:${email}?subject=${subject || ""}&body=${JSON.stringify(body) || ""}`}>
//       {props.children}
//     </a>
//   );
// }

//   <NewWindow
//     url={`https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}`}
//     name="teste"
//     title="teste"
//   >
//     {/* <h1>Hi 👋</h1> */}
//   </NewWindow>
// );

export const checkAlert = async (
  client,
  dataScheduled,
  empresaAtiva,
  usuarioAtivo,
  latitudeEmployee,
  longitudeEmployee
) => {
  try {
    if (
      client.CLI_LATITUDE !== null &&
      client.CLI_LONGITUDE !== null &&
      client.status !== 1 &&
      client.galId !== false
    ) {
      let distanceClient = await distance(
        client.CLI_LATITUDE,
        client.CLI_LONGITUDE,
        latitudeEmployee,
        longitudeEmployee,
        'K'
      );
      distanceClient = distanceClient * 1000;
      const raio = dataScheduled.HORARIOS_TRABALHO.RAIO_ATENDIMENTO;
      const gaaId = dataScheduled.GAA_ID;
      if (distanceClient > raio) {
        const data = formatDateTimeToBr(new Date());
        let distance =
          distanceClient - raio > 1000
            ? `${parseFloat(formatFloat((distanceClient - raio) / 1000))}km`
            : `${parseFloat(formatFloat(distanceClient - raio))}m`;

        const alert = {
          gaaId: gaaId,
          gatId: client.gatId,
          gtiId: 10,
          observacao: `CLIENTE: ${client.CLI_CODIGO} - ${client.CLI_NOME_FANTASIA}, ${data}, DISTÂNCIA: ${distance} [${client.CLI_LATITUDE}:${client.CLI_LONGITUDE}|${latitudeEmployee}:${longitudeEmployee}]`,
        };

        const res = await api.post(`v2/trade/addalert/${empresaAtiva}/${usuarioAtivo}`, alert);

        if (res.data.sucess) {
          const obj = {
            galId: res.data.data.galId,
          };
          const alertResponse = await api.post(`v2/trade/alertresponse/${empresaAtiva}/${usuarioAtivo}`, obj);

          return alertResponse.data.data;
        }
      }
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

export const handleButtonRefreshRelease = async (client, empresaAtiva, usuarioAtivo, scheduleData, alert) => {
  try {
    const alertResponse = await api.post(`v2/trade/alertresponse/${empresaAtiva}/${usuarioAtivo}`, {
      galId: client.galId,
    });
    if (alertResponse.data.data.find((item) => item.GAL_FLG_LIBERA_ATD === 1 && item.GTI_FLG_IMPEDE_ATD === 1)) {
      const pos = scheduleData.CLIENTES.findIndex((item) => item.CLI_ID === client.CLI_ID);
      const obj = {
        pos: pos,
        status: 1,
      };
      return obj;
    } else if (
      alertResponse.data.data.find(
        (item) => item.GAL_FLG_LIBERA_ATD === 0 && item.GTI_FLG_IMPEDE_ATD === 1 && item.GAL_FLG_STATUS === 1
      )
    ) {
      const pos = scheduleData.CLIENTES.findIndex((item) => item.CLI_ID === client.CLI_ID);
      const obj = {
        pos: pos,
        status: -1,
      };
      return obj;
    } else {
      if (alert === 1) {
        alerta('Ainda não foi liberado!', 1);
      }
      return false;
    }
  } catch (err) {
    alerta('Não foi possível verificar!', 2);
  }
};

export const getTradeTeam = async (empresaAtiva, usuarioAtivo) => {
  try {
    let url;
    url = '/v1/tradeteam/' + empresaAtiva + '/' + usuarioAtivo;
    // const data = {
    //   GET_ID: '',
    //   GET_COD_GERENTE: '',
    //   GET_DESCR_GERENTE: '',
    //   GET_COD_SUPERVISOR: '',
    //   GET_DESCR_SUPERVISOR: '',
    //   GET_COD_PROMOTOR: '',
    //   GET_DESCR_PROMOTOR: '',
    //   GET_FLG_SITUACAO: '',
    // };
    const retorno = await api.post(url);
    const { sucess, data } = retorno.data;
    if (sucess) {
      return data;
    }
  } catch (err) {
    alerta('Erro ao carregar as pesquisas =>' + err, 2);
  }
};

export async function getAllSyncs(empresaAtiva, usuarioAtivo, date) {
  try {
    const dateFinal = date ? date : format(new Date(), 'dd/MM/yyyy');

    const res = await api.get(`v2/trade/sync/db/${empresaAtiva}/${usuarioAtivo}`, {
      params: {
        data: dateFinal,
      },
    });

    const { sucess, data } = res.data;

    if (sucess && data && data.length > 0) {
      return data;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function getDataSync(id) {
  try {
    const res = await api.get('v2/trade/sync/db', {
      params: {
        id,
      },
    });

    const { sucess, data } = res.data;

    if (sucess && data && data.length > 0) {
      return data;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function getStatusSchedule(empresaAtiva, usuarioAtivoid, gaaId) {
  try {
    const res = await api.post(`v1/schedule/data/${empresaAtiva}/${usuarioAtivoid}`, { gaaId });

    const { sucess, data } = res.data;

    if (sucess && data) {
      return data;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export function stringCompress(data) {
  return compressToBase64(data);
}

export function stringDecompress(data) {
  try {
    let res = decompressFromBase64(data);
    JSON.parse(res);
    return res;
  } catch (error) {
    return decompress(data);
  }
}

export async function handleGetDataInventory(empresaId, codigoUsuario, id) {
  try {
    const res = await api.get(`v1/trade/admin/inventory/${empresaId}/${codigoUsuario}`, {
      params: {
        cliente_id: id,
      },
    });

    const { data, sucess } = res.data;

    if (sucess) {
      const scheduleData = await getScheduleData()
      scheduleData.CONFERENCE.INVENTORY = data;
      await updateScheduleData(scheduleData)
      return data;
    }
  } catch (error) {
    return null;
  }
}

export async function handleFindProduct(empresaId, codigoUsuario, search) {
  try {
    const res = await api.get(`v1/trade/admin/find-product/${empresaId}/${codigoUsuario}`, {
      params: {
        chave_pesquisa: search.charAt(0).toUpperCase() + search.slice(1),
      },
    });

    const { data, sucess } = res.data;

    if (sucess) {
      return data;
    }
  } catch (error) {
    alerta('Não foi possível buscar os dados, verifique sua conexão com a internet', 2);
    return null;
  }
}

export async function handleGetSales(empresaId, codigoUsuario, atd_id) {
  try {
    if (!atd_id) {
      return;
    }

    const res = await api.get(`v1/trade/admin/sales/${empresaId}/${codigoUsuario}`, {
      params: {
        atd_id,
        atd_flag_situacao: "P"
      },
    });

    const { data, sucess } = res.data;

    if (sucess) {
      return data;
    }
  } catch (error) {
    alerta('Não foi possível buscar os dados, verifique sua conexão com a internet', 2);
    return null;
  }
}

export async function handleAddSale(
  ATD_TIPO_FRETE,
  ATD_OPER_ID,
  empresaId,
  codigoUsuario,
  ATD_CLI_ID,
  ATD_ESTR_ID,
  ATD_VALOR_TOTAL,
  ATD_OBS,
  ATD_QTDE_TOTAL,
  ITEMS,
  ATD_COD_ATENDIMENTO,
  PAGAMENTOS
) {
  try {
    const payload = {
      ATD_TIPO_FRETE,
      ATD_OPER_ID,
      ATD_DATA: format(new Date(), 'yyyy-MM-dd'),
      ATD_CLI_ID,
      ATD_ESTR_ID,
      ATD_VALOR_TOTAL,
      ATD_OBS,
      ATD_QTDE_TOTAL,
      ITEMS,
      ATD_COD_ATENDIMENTO,
      ATD_EMP_ID: Number(empresaId),
      PAGAMENTOS: PAGAMENTOS || []
    };

    const res = await api.post(`v1/trade/admin/sales/${empresaId}/${codigoUsuario}`, payload);

    const { data, sucess } = res.data;

    if (sucess) {
      return data;
    }
    return false;
  } catch (error) {
    alerta('Não foi possível criar o pedido', 2);
    return false;
  }
}

export async function handleEditSale(
  ATD_TIPO_FRETE,
  ATD_OPER_ID,
  id,
  empresaId,
  codigoUsuario,
  ATD_CLI_ID,
  ATD_ESTR_ID,
  ATD_VALOR_TOTAL,
  ATD_OBS,
  ATD_QTDE_TOTAL,
  ITEMS,
  PAGAMENTOS
) {
  try {
    const payload = {
      ATD_TIPO_FRETE,
      ATD_OPER_ID,
      ATD_ID: id,
      ATD_DATA: format(new Date(), 'yyyy-MM-dd'),
      ATD_CLI_ID,
      ATD_ESTR_ID,
      ATD_VALOR_TOTAL,
      ATD_QTDE_TOTAL,
      ATD_OBS,
      ITEMS,
      PAGAMENTOS
    };

    const res = await api.post(`v1/trade/admin/sales/${empresaId}/${codigoUsuario}`, payload);

    const { data, sucess } = res.data;

    if (sucess) {
      alerta('Pedido alterado com sucesso!', 1);
      return data;
    }
    return false;
  } catch (error) {
    alerta('Não foi possível editar o pedido', 2);
    return false;
  }
}

export async function handleDeleteSale(empresaId, codigoUsuario, atd_id, msg = true) {
  try {
    const res = await api.delete(`v1/trade/admin/sales/${empresaId}/${codigoUsuario}/${atd_id}`);

    const { sucess } = res.data;

    if (sucess) {
      if (msg) {
        alerta('Pedido deletado com sucesso!', 1);
      }
      return true;
    } else {
      alerta('Não foi possível deletar o pedido ou ele já foi deletado', 2);
    }
    return false;
  } catch (error) {
    alerta('Não foi possível deletar o pedido', 2);
    return false;
  }
}

export async function handleGetEvents(empresaId, codigoUsuario, CLI_CODIGO, GEV_CLI_ID) {
  try {
    const res = await api.get(`v2/trade/pdv/events/${empresaId}/${codigoUsuario}`, {
      params: {
        CLI_CODIGO,
        GEV_CLI_ID
      }
    })

    const { data } = res.data

    if (data) {
      return data
    }
  } catch (error) {
  }
}
