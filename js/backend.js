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
  FIELDS: `sgv,direction,srvCreated`,
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
      let xhrStatusText;
      if (xhr.response) {
        xhrStatusText = xhr.statusText === `` ? xhr.response.message : `${xhr.statusText}: ${xhr.response.message}`;
      } else {
        xhrStatusText = xhr.statusText;
      }
      onError(`Request status: ${xhr.status} - ${xhrStatusText}`);
    }
  });

  xhr.addEventListener(`error`, () => {
    let errorMessage = 'An unknown error occurred.';
    if (!navigator.onLine) {
      errorMessage = 'You are currently offline. Please check your network connection.';
    } else if (xhr.status === 0) {
      errorMessage = 'The server is not responding. Check your nightscout site address.';
    } else if (xhr.status >= 400 && xhr.status < 500) {
      errorMessage = 'The request could not be completed because the server returned an error.';
    } else if (xhr.status >= 500 && xhr.status < 600) {
      errorMessage = 'The server encountered an error and could not complete the request.';
    }
    onError(errorMessage);
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
