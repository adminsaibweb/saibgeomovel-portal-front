import axios from "axios";
import {getToken} from "./auth";
import { alerta } from '../services/funcoes';
import {EnviromentVars} from '../config/env';


const api = axios.create({
  baseURL: EnviromentVars.urlSaibGeoMovelBack,
});

api.interceptors.request.use(async config => {
  // config.crossDomain = true;
  // config.headers.common['Content-Type'] = 'application/json';
  // config.headers.common['Access-Control-Allow-Origin'] =
  //    'http://localhost:3000';
  // config.headers.common['Access-Control-Allow-Methods'] =
  //    'GET, PUT, POST, DELETE, OPTIONS';
  // //console.log('config.baseURL');
  // //console.log(config.baseURL);
  // //console.log('config');
  // //console.log(config);
  const token = getToken();

  if (token !== undefined) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(function (response) {
  return response;
}, function (error) {
    if (error.response !== undefined && 401 === error.response.status) {
      alerta('Sessão expirada! Redirecionado para a página de login.', 2);
      localStorage.removeItem(EnviromentVars.cookieName);
      setTimeout(() => {
        window.location.href = '/expired';
      }, 600)
  } else {
      return Promise.reject(error);
  }
});


export default api;
