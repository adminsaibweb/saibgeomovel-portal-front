import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';
import { parseISO, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { getObjectAll, saveObject, startErrorsDB, startScheduleDataDB, updateObject } from './databaseLocal';
import { format } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';

export const filtrarArray = (arr, filtro) => {
  const retorno = arr.filter((t) => t !== filtro);
  retorno.sort();
  return retorno;
};

export const filtrarArrays = async (arr, filtro) => {
  let retorno = arr;
  // ////console.log('filtrandoo...');
  // ////console.log(retorno);
  await filtro.forEach((filtrar) => {
    retorno = retorno.filter((t) => t !== filtrar);
  });
  retorno.sort();
  return retorno;
};

export const mensagemTemporaria = (mensagem) => {
  toast.configure({
    autoClose: true,
    draggable: false,
    position: toast.POSITION.TOP_CENTER,
    hideProgressBar: true,
    newestOnTop: true,
    //etc you get the idea
  });
  toast.info(mensagem);
};

export const base64Encode = async (strTexto) => {
  return Buffer.from(strTexto.toString()).toString('base64');
};

export const base64Decode = async (strTexto) => {
  return Buffer.from(strTexto, 'base64').toString('utf8');
};

export const alerta = async (mensagem, tipoMensagem) => {
  /*
  0 - mensagem aviso
  1 - mensagem info
  2 - mensagem erro

 */

  toast.configure({
    autoClose: 5000,
    draggable: false,
    position: toast.POSITION.BOTTOM_CENTER,
    hideProgressBar: false,
    newestOnTop: true,

    //etc you get the idea
  });

  switch (tipoMensagem) {
    case 0:
      toast.warn(mensagem);
      break;
    case 1:
      toast.info(mensagem);
      break;
    case 2:
      toast.error(mensagem);
      break;
    default:
      toast.warn(mensagem);
    // code block
  }
};

export const tratarErros = (data) => {
  if (!data || data.error === undefined) {
    alerta('Erro não tratado. =>' + data.message, 2);
    return;
  }
  if (data.error) {
    // eslint-disable-next-line
    if (data.error == []) {
      alerta(data.message, 2);
      return;
    }
    if (data.error.parameters !== undefined) {
      alerta(data.message + '\n\n' + data.error.message, 2);
      return;
    } else {
      let erros = '';
      let cont = 1;
      try {
        data.error.forEach((err) => {
          erros = erros + `${cont} - ${err}\n`;
          cont = cont + 1;
        });
        alerta(data.message + '\n\n' + erros, 1);
        return;
      } catch (error) {
        // ////console.log(data);
        if (data.error.message.error !== undefined) {
          alerta(data.message + '\n\n' + data.error.message.error, 1);
        } else {
          if (data.message !== undefined) {
            alerta(data.message, 1);
          } else {
            alerta('Erro não tratado.', 1);
          }
        }
      }
    }
  }
};

export const inicializarObjeto = (objeto) => {
  if (objeto === undefined) {
    let obj = [];
    return obj;
  } else return objeto;
};

export function FormataValorMonetario(valor, usarCifrao) {
  const val = valor || '0';
  let valorFormatado = parseFloat(String(val)).toLocaleString('pt-br', {
    style: 'currency',
    currency: 'BRL',
  });
  if (!usarCifrao) {
    valorFormatado = valorFormatado.replace('R$', '').trimStart();
  }
  return valorFormatado;
}

export function formatarMoeda(valor = '') {
  let v = String(valor).replace(/\D/g, '');

  v = (Number(v) / 100).toFixed(2).toString();

  v = v.replace('.', ',');

  v = v.replace(/(\d)(\d{3})(\d{3}),/g, '$1.$2.$3,');

  v = v.replace(/(\d)(\d{3}),/g, '$1.$2,');
  return v;
}

export function formataMoedaPFloat(valor, n = 2) {
  if (!isNaN(Number(valor)) && typeof Number(valor) === 'number' && Number(valor) % 1 !== 0) {
    return Number(Number(valor).toFixed(2));
  }
  if (typeof valor === 'number' && valor % 2 !== 0 && valor % 2 !== 1) {
    return valor;
  }
  return toFloat(String(valor).replace('R$', '').replace(/[. ]+/g, ''), n);
}

export const formatFloatBr = (valor, estilo = 'currency') => {
  let retorno;
  if (isNaN(valor) || valor == null) {
    retorno = 0;
  } else {
    retorno = valor;
  }
  const formato = {};
  if (estilo === 'currency') {
    formato.style = 'currency';
  }
  formato.currency = 'BRL';
  formato.minimumFractionDigits = 2;
  formato.maximumFractionDigits = 2;

  retorno = retorno.toLocaleString('pt-BR', formato);

  return retorno;
};

export const formatFloat = (valor) => {
  let retorno;
  if (isNaN(valor) || valor == null) {
    retorno = 0;
  } else {
    retorno = valor;
  }
  const formato = {};
  formato.minimumFractionDigits = 2;
  formato.maximumFractionDigits = 2;

  retorno = retorno.toLocaleString('pt-BR', formato);
  retorno = retorno.replaceAll(',', '.');

  return retorno;
};

export function toFloat(v, n = 2) {
  if (!v) {
    v = '0';
  }
  return typeof v === 'string' || isFloat(v) ? Number(parseFloat(remVirgulaNum(v)).toFixed(n)) : v;
}

export const isFloat = (valor) => {
  return String(valor).includes('.');
};

export function remVirgulaNum(str) {
  let valor = String(str);
  valor = valor.replace(/(,)/g, '.');

  const qtdePontosDoValor = String(valor).match(/(['.'])/g)?.length;

  if (qtdePontosDoValor && qtdePontosDoValor > 1) {
    for (let i = 1; i < qtdePontosDoValor; i++) {
      valor = valor.replace('.', '');
    }
  }

  return valor;
}

export const currencyFormat = (valor, estilo = 'currency', casasDecimais = 2) => {
  let retorno;
  // //console.log('valor');
  // //console.log(valor);
  if (isNaN(valor) || valor == null) {
    retorno = 0;
  } else {
    retorno = Number(valor);
  }

  retorno = new Intl.NumberFormat('pt-BR', {
    style: estilo === '' ? 'decimal' : estilo,
    currency: 'BRL',
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  }).format(retorno);
  // //console.log('retorno');
  // //console.log(retorno);
  return retorno;
};

export const formatDateTimeToBr = (date, format = 'DD/MM/YYYY HH:mm:ss') => {
  return moment(date).format(format);
};

export const formatDateTimeToBrUtc = (date, format = 'DD/MM/YYYY HH:mm:ss') => {
  return moment.utc(date).format(format);
};

export const capitalize = (str, lower = false) => {
  if (str !== null) {
    return (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, (match) => match.toUpperCase());
  } else return '';
};

export function getCurrentDate(addDays = 0, separator = '/') {
  return moment().add(addDays, 'days').format('DD/MM/YYYY');
}

export function getCurrentTime(formato = 'HH:mm:ss') {
  return moment().format(formato);
}

export const isValidDate = function (data) {
  if (data === '' || data === undefined || data === null) {
    return false;
  }
  // //console.log('validando da data=>'+data)
  moment.locale('pt-BR');
  const _data = moment(data, 'DD/MM/YYYY');
  // //console.log(_data);
  return _data._isValid;
};

export const weekDay = (data) => {
  moment.locale('pt-BR');
  let diaSemana = moment(data, 'DD/MM/YYYY').weekday();
  switch (diaSemana) {
    case 0:
      return 'Domingo';
    case 1:
      return 'Segunda';
    case 2:
      return 'Terça';
    case 3:
      return 'Quarta';
    case 4:
      return 'Quinta';
    case 5:
      return 'Sexta';
    case 6:
      return 'Sábado';
    default:
      return '';
  }
};

export const weekDayNumber = (data) => {
  moment.locale('pt-BR');
  let diaSemana = moment(data, 'DD/MM/YYYY').weekday();
  return diaSemana;
};

export const formatOracleDateToBr = (data, comHora = false) => {
  let format = 'DD/MM/YYYY ' + (comHora ? 'HH:mm:ss' : '');
  // //console.log(format)
  return moment(data).format(format);
};

export const dateFormat = (data, format = 'DD/MM/YYYY') => {
  return moment(data).format(format);
};

export const roundTwoDecimals = (numberToRoud) => {
  const rounded = Math.round(numberToRoud * 100) / 100;
  if (rounded === Infinity) {
    return 0;
  }
  return rounded;
};

export const randomNumber = () => {
  Math.floor(Math.random() * 100000000);
};

export const haveData = (value) => {
  return value !== undefined && value != null && value !== '';
};

export const parseDate = (date) => {
  let _date = parseISO(date);
  return _date;
};

export const parseDateMoment = (date) => {
  return moment(date);
};

export const diffInMinutes = (dataHoraInicial, dataHoraFinal) => {
  return differenceInMinutes(dataHoraInicial, dataHoraFinal);
};

export const diffInSeconds = (dataHoraInicial, dataHoraFinal) => {
  return differenceInSeconds(dataHoraInicial, dataHoraFinal);
};

export const lowerCase = (texto) => {
  return haveData(texto) ? String(texto).toLowerCase() : texto;
};

export const prepareFileName = (text) => {
  const a = 'àáäâãèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;';
  const b = 'aaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh.-_---';
  const p = new RegExp(a.split('').join('|'), 'g');
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special chars
    .replace(/&/g, '-and-') // Replace & with 'and
    .replace(/[\s\W-]+/g, '-'); // Replace spaces, non-word characters and dashes with a single dash (-)
};

export const sameObject = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

export const dateBrValid = (date) => {
  let isValid = moment(date, 'DD/MM/YYYY').isValid();
  return isValid;
};

export const dateTimeBrValid = (date) => {
  let isValid = moment(date, 'DD/MM/YYYY HH:mm').isValid();
  return isValid;
};

export const timeBrValid = (time) => {
  let isValid = moment(time, 'HH:mm').isValid();
  return isValid;
};

export const percentualComp = async (total, concluido) => {
  if (isNaN(total) || total == null || concluido || concluido == null) {
    return 0;
  }

  let retorno = (100 * concluido) / total;

  return formatFloatBr(retorno, '');
};

export const Logger = async (message) => {
  let database = await startErrorsDB('ErrosDB', 'errors');
  if (database) {
    const res = {
      message,
      date: format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
    };
    console.log(`Log ${res.date}: `, res.message);
    await saveObject(database, 'errors', res);
  }
};

export function isImageValid(value) {
  if (typeof value === 'string') {
    // Verificar se a string é uma URL de imagem
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
    const url = value.toLowerCase();
    return imageExtensions.some((ext) => url.endsWith(`.${ext}`));
  } else if (value instanceof File) {
    // Verificar se é um objeto File com um tipo MIME de imagem válido
    const imageMIMETypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/svg+xml'];
    return imageMIMETypes.includes(value.type);
  }
  return false;
}

export const saveScheduleData = async (data) => {
  const database = await startScheduleDataDB('ScheduleDataDB', 'scheduleData');
  if (database) {
    await saveObject(database, 'scheduleData', data);
  }
};

export const getScheduleData = async () => {
  const database = await startScheduleDataDB('ScheduleDataDB', 'scheduleData');
  if (database) {
    const res = await getObjectAll(database, 'scheduleData');
    if (res && res.length > 0) {
      return res[0]
    }
  }
};

export const updateScheduleData = async (data) => {
  const database = await startScheduleDataDB('ScheduleDataDB', 'scheduleData');
  if (database && data && data?.id) {
    const id = data?.id
    updateObject(database, 'scheduleData', id, data)
      .then((result) => {
        // console.log('Objeto atualizado com sucesso:', result);
      })
      .catch((error) => {
        console.error('Erro ao atualizar o objeto:', error);
      });
  }
};

export function dataHoraAtual() {
  const data = zonedTimeToUtc(new Date(), 'America/Sao_Paulo');
  return data;
}
