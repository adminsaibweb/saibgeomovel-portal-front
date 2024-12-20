import { EnviromentVars } from '../config/env';
export const TOKEN_KEY = EnviromentVars.cookieName;

export const isAuthenticated = () => {
  let data = localStorage.getItem(EnviromentVars.cookieName);
  if (data !== undefined && data != null) {
    data = Buffer.from(data, 'base64').toString('utf8');
    data = JSON.parse(data);
    return data.token !== undefined && data.token !== null;
  } else {
    return;
  }
};

export const getToken = () => {
  let data = localStorage.getItem(EnviromentVars.cookieName);
  if (data !== undefined && data != null) {
    data = Buffer.from(data, 'base64').toString('utf8');
    data = JSON.parse(data);
    return data.token;
  } else {
    return;
  }
};

export const logOut = () => {
  sessionStorage.removeItem(EnviromentVars.cookieName);
  sessionStorage.removeItem(EnviromentVars.cookieNameMenu);
  localStorage.removeItem(EnviromentVars.cookieName);
  localStorage.removeItem('currentDrivenOdometro');
  localStorage.removeItem('hodometroActive');
  localStorage.removeItem('reportVariables');
  localStorage.removeItem('ManageSchedule');
};

export const getFromStorage = () => {
  let data = localStorage.getItem(EnviromentVars.cookieName);
  if (data !== undefined && data != null) {
    let decodedData = Buffer.from(data, 'base64').toString('utf8');
    let jsonData = JSON.parse(decodedData);
    return jsonData;
  } else {
    return;
  }
};

export const login = async (token) => {
  try {
    var _data = JSON.stringify(token);
    _data = Buffer.from(_data.toString()).toString('base64');
    localStorage.setItem(EnviromentVars.cookieName, _data);

  } catch (error) {
    //console.log('erro ao salvar os menus no sessionStorage');
    //console.log(error);
  }
};

export const saveMenuToStorage = (data) => {
  try {
    var _data = JSON.stringify(data);
    _data = Buffer.from(_data.toString()).toString('base64');
    sessionStorage.setItem(EnviromentVars.cookieNameMenu, _data);
  } catch (error) {
    //console.log('erro ao salvar os menus no sessionStorage');
    //console.log(error);
  }
};

export const getMenuToStorage = () => {
  let data = sessionStorage.getItem(EnviromentVars.cookieNameMenu);
  if (data !== undefined && data != null) {
    data = Buffer.from(data, 'base64').toString('utf8');
    data = JSON.parse(data);
    return data;
  } else {
    return;
  }
};
