"use strict";

const CONFIG = await window.electronAPI.getSettings();

const REQUEST_TIMEOUT = 10000;

const StatusCode = {
  OK: 200
};

const Endpoints = {
  DATA: `/api/v3/entries`,
  TEST: `/api/v3/status`,
}

const GetParams = {
  SORT_BY: `date`,
  LIMIT: 2,
  FIELDS: `sgv,direction`,
  TYPE: `sgv`,
};

const createRequest = (method, url, onLoad, onError) => {
  const xhr = new XMLHttpRequest();
  xhr.responseType = `json`;

  xhr.addEventListener(`load`, () => {
    switch (xhr.status) {
    case StatusCode.OK:
      onLoad(xhr.response);
      break;
    default:
      onError(`Request status: ${xhr.status} - ${xhr.statusText}`);
    }
  });

  xhr.addEventListener(`error`, () => {
    onError(`Connection error`);
  });

  xhr.addEventListener(`timeout`, () => {
    onError(`Request timeout reached: ${xhr.timeout} ms.`);
  });

  xhr.timeout = REQUEST_TIMEOUT;
  xhr.open(method, url);

  return xhr;
};

const getData = (onSuccess, onError) => {
  let url = new URL(CONFIG.NIGHTSCOUT.URL + Endpoints.DATA);

  url.searchParams.set(`token`, CONFIG.NIGHTSCOUT.TOKEN);
  url.searchParams.set(`sort$desc`, GetParams.SORT_BY);
  url.searchParams.set(`limit`, GetParams.LIMIT);
  url.searchParams.set(`fields`, GetParams.FIELDS);
  url.searchParams.set(`type$eq`, GetParams.TYPE);

  const xhr = createRequest(`GET`, url, onSuccess, onError);
  xhr.send();
};

const getStatus = (testParams, onSuccess, onError) => {
  let url = new URL(testParams.url + Endpoints.TEST);

  url.searchParams.set(`token`, testParams.token);

  const xhr = createRequest(`GET`, url, onSuccess, onError);
  xhr.send();
}

export { getData, getStatus };
