"use strict";

import { getData } from "./backend.js";
import { prepareData } from "./util.js";

const CONFIG = await window.electronAPI.getSettings();

const log = window.electronAPI.logger;

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

Fields.last.addEventListener(`mousedown`, (evt) => {
  if (evt.shiftKey) {
    evt.preventDefault();

    evt.target.classList.toggle(`cgv__last--active`);
    log.info(`Open nightscout site was triggered`);
    window.electronAPI.openNightscout();
  }
});

Fields.last.addEventListener(`mouseup`, (evt) => {
  evt.target.classList.toggle(`cgv__last--active`, false);
})

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
  log.error(`Error qty: ${errorCount}`, errorMessage);
};

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === `visible`) {
    getData(onSuccess, onError);
    log.info(`Get data due to visibility change`);
  }
});

setInterval(() => {
  getData(onSuccess, onError);
}, CONFIG.NIGHTSCOUT.INTERVAL * 1000);

getData(onSuccess, onError);
