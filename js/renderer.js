"use strict";

import CONFIG from "./config.json" assert { type: "json" };
import { getData } from "./backend.js";
import { prepareData } from "./util.js";

const render = (data) => {

  const Fields = {
    last: document.querySelector(`.cgv_last`),
    delta: document.querySelector(`.cgv_delta`),
    trend: document.querySelector(`.cgv_trend`),
  };

  Fields.last.textContent = data.last;
  Fields.delta.textContent = data.delta;
  Fields.trend.innerHTML = data.direction;

  Fields.last.classList.add(`cgv_last--ok`);

  const lastResult = parseFloat(data.last);

  if ((lastResult > CONFIG.BG.TARGET.TOP & lastResult < CONFIG.BG.HIGH) |
      (lastResult > CONFIG.BG.LOW & lastResult < CONFIG.BG.TARGET.BOTTOM)) {
    Fields.last.className = Fields.last.className.replace(/cgv_last--.+/, `cgv_last--warning`);
  } else if (lastResult > CONFIG.BG.HIGH | lastResult < CONFIG.BG.LOW) {
    Fields.last.className = Fields.last.className.replace(/cgv_last--.+/, `cgv_last--critical`);
  } else {
    Fields.last.className = Fields.last.className.replace(/cgv_last--.+/, `cgv_last--ok`);
  }
};

const onSuccess = (result) => {
  render(prepareData(result));
};

const onError = (errorMessage) => {
  console.log(errorMessage);
};

getData(onSuccess, onError);

setInterval(() => {
  getData(onSuccess, onError);
}, CONFIG.NIGHTSCOUT.GET_INTERVAL_MS);
