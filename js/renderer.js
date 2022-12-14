"use strict";

import { getData } from "./backend.js";
import { prepareData } from "./util.js";

const CONFIG = await window.electronAPI.getSettings();

const Fields = {
  last: document.querySelector(`.cgv__last`),
  delta: document.querySelector(`.cgv__delta`),
  trend: document.querySelector(`.cgv__trend`),
};

const Buttons = {
  close: document.querySelector(`#button-close`),
  settings: document.querySelector(`#button-settings`),
};

Buttons.close.addEventListener(`click`, () => {
  window.electronAPI.closeWindow();
});

Buttons.settings.addEventListener(`click`, () => {
  window.electronAPI.showSettings();
});

const render = (data) => {

  Fields.last.textContent = data.last;
  Fields.delta.textContent = data.delta;
  Fields.trend.innerHTML = data.direction;

  Fields.last.classList.add(`cgv__last--ok`);

  const lastResult = parseFloat(data.last);

  if ((lastResult > CONFIG.BG.TARGET.TOP & lastResult <= CONFIG.BG.HIGH) |
      (lastResult >= CONFIG.BG.LOW & lastResult < CONFIG.BG.TARGET.BOTTOM)) {
    Fields.last.className = Fields.last.className.replace(/cgv__last--.+/, `cgv__last--warning`);
  } else if (lastResult > CONFIG.BG.HIGH | lastResult < CONFIG.BG.LOW) {
    Fields.last.className = Fields.last.className.replace(/cgv__last--.+/, `cgv__last--critical`);
  } else {
    Fields.last.className = Fields.last.className.replace(/cgv__last--.+/, `cgv__last--ok`);
  }
};

const onSuccess = (result) => {
  render(prepareData(result));
};

const onError = (errorMessage) => {
  console.log(`Error qty: ${errorCount}`, errorMessage);
};

getData(onSuccess, onError);

setInterval(() => {
  getData(onSuccess, onError);
}, CONFIG.NIGHTSCOUT.INTERVAL);
