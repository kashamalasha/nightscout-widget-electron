"use strict";

import { getData } from "./backend.js";
import { prepareData } from "./util.js";

const CONFIG = await window.electronAPI.getSettings();

const log = window.electronAPI.logger;

const Fields = {
  cgv: document.querySelector(`.cgv`),
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

    evt.target.classList.toggle(`cgv__last--accented`);
    log.info(`Open nightscout site was triggered`);
    window.electronAPI.openNightscout();
  }
});

Fields.last.addEventListener(`mouseup`, (evt) => {
  evt.target.classList.toggle(`cgv__last--accented`, false);
})

const render = (data) => {

  const modMap = {
    critical: `cgv__last--critical`,
    warning: `cgv__last--warning`,
    ok: `cgv__last--ok`,
    default: `cgv__last--`
  }

  const lastResult = parseFloat(data.last);

  let classMod;

  Fields.last.textContent = data.last;
  Fields.delta.textContent = data.delta;
  Fields.trend.innerHTML = data.direction;

  if (!Fields.last.className.includes(modMap.default)) {
    Fields.last.classList.add(modMap.default);
  }

  if (data.age > CONFIG.WIDGET.AGE_LIMIT) {
    Fields.cgv.classList.add(`cgv--frozen`);
    classMod = modMap.default;
  } else { 
    if (Fields.cgv.classList.contains(`cgv--frozen`)) {
      Fields.cgv.classList.remove(`cgv--frozen`);
    }

    if (lastResult >= CONFIG.BG.HIGH || lastResult <= CONFIG.BG.LOW) {
      classMod = modMap.critical;
    } else if (lastResult >= CONFIG.BG.TARGET.TOP || lastResult <= CONFIG.BG.TARGET.BOTTOM) {
      classMod = modMap.warning;
    } else {  
      classMod = modMap.ok;
    }
  }

  Fields.last.className = Fields.last.className.replace(/cgv__last--.*/, classMod);
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
