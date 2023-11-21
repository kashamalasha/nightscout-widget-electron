"use strict";

const CONFIG = await window.electronAPI.getSettings();

const REQUEST_TIMEOUT = 10000;
const log = window.electronAPI.logger;

const StatusCode = {
  OK: 200,
  NOT_FOUND: 404,
};

const Endpoints = {
  AUTH: `/api/v2/authorization/request`,
  DATA: `/api/v3/entries`,
  TEST: `/api/v3/status`,
};

const GetParams = {
  SORT_BY: `date`,
  LIMIT: 6,
  FIELDS: `sgv,direction,srvCreated`,
  TYPE: `sgv`,
  TOKEN: null,
};

const createRequest = (method, url, onLoad, onError, async=true) => {
  const xhr = new XMLHttpRequest();
  xhr.responseType = async ? `json` : ``;

  xhr.addEventListener(`load`, () => {
    let xhrStatusText = ``;

    switch (xhr.status) {
    case StatusCode.OK:
      onLoad(xhr.response);
      break;
    case StatusCode.NOT_FOUND:
      xhrStatusText = `The requested resource was not found on the server`;
      onError(`Request status: ${xhr.status} - ${xhrStatusText}`);
      break;
    default:
      if (xhr.response) {
        xhrStatusText = xhr.statusText === `` ? xhr.response.message : `${xhr.statusText}: ${xhr.response.message}`;
      } else {
        xhrStatusText = xhr.statusText;
      }
      onError(`Request status: ${xhr.status} - ${xhrStatusText}`);
    }
  });

  xhr.addEventListener(`error`, () => {
    let errorMessage = `An unknown error occurred.`;
    if (!navigator.onLine) {
      errorMessage = `You are currently offline. Please check your network connection.`;
    } else if (xhr.status === 0) {
      errorMessage = `The server is not responding. Check your nightscout site address.`;
    } else if (xhr.status >= 400 && xhr.status < 500) {
      errorMessage = `The request could not be completed because the server returned an error.`;
    } else if (xhr.status >= 500 && xhr.status < 600) {
      errorMessage = `The server encountered an error and could not complete the request.`;
    }
    onError(errorMessage);
  });

  xhr.addEventListener(`timeout`, () => {
    onError(`Request timeout reached: ${xhr.timeout} ms.`);
  });

  xhr.timeout = async ? REQUEST_TIMEOUT : ``;
  xhr.open(method, url, async);

  return xhr;
};

const hasTokenExpired = () => {
  const now = Date.now();

  if (now > CONFIG.JWT_EXPIRATION) {
    return true;
  }

  return false;
};

const obtainToken = (paramsObj) => {
  log.info(`Requesting JWT token for the ${paramsObj.token}`);
  const url = new URL(paramsObj.url + Endpoints.AUTH + `/` + paramsObj.token);
  const xhr = createRequest(
    `GET`,
    url,
    (responseText) => {
      const response = JSON.parse(responseText);
      const expirationInMillis = response.exp * 1000;

      GetParams.TOKEN = response.token;
      window.electronAPI.setJWTExpiration(expirationInMillis);

      log.info(`JWT token obtained successfully`);
    },
    (error) => {
      log.error(`Failed to obtain JWT token ${error} for the ${paramsObj.token}`);
    },
    false
  );

  xhr.send();
};

const getData = (onSuccess, onError) => {
  const params = {
    "url": CONFIG.NIGHTSCOUT.URL,
    "token": CONFIG.NIGHTSCOUT.TOKEN
  };

  const url = new URL(params.url + Endpoints.DATA);

  url.searchParams.set(`sort$desc`, GetParams.SORT_BY);
  url.searchParams.set(`limit`, GetParams.LIMIT);
  url.searchParams.set(`fields`, GetParams.FIELDS);
  url.searchParams.set(`type$eq`, GetParams.TYPE);

  const xhr = createRequest(`GET`, url, onSuccess, onError);

  if (!GetParams.TOKEN || hasTokenExpired()) {
    obtainToken(params);
  }

  xhr.setRequestHeader(`Authorization`, `Bearer ${GetParams.TOKEN}`);
  xhr.send();
};

const getStatus = (testParams, onSuccess, onError) => {
  const url = new URL(testParams.url + Endpoints.TEST);

  const xhr = createRequest(`GET`, url, onSuccess, onError);

  if (testParams.url !== CONFIG.NIGHTSCOUT.URL || !GetParams.TOKEN || hasTokenExpired()) {
    obtainToken(testParams);
  }

  xhr.setRequestHeader(`Authorization`, `Bearer ${GetParams.TOKEN}`);
  xhr.send();
};

export { getData, getStatus };
