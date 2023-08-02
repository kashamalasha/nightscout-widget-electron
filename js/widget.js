"use strict";

import { getData } from "./backend.js";
import { prepareData, alert } from "./util.js";

const CONNECTION_RETRY_LIMIT = 5;
const CONFIG = await window.electronAPI.getSettings();

const log = window.electronAPI.logger;

const Fields = {
  cgv: document.querySelector(`.cgv`),
  last: document.querySelector(`.cgv__last`),
  delta: document.querySelector(`.cgv__delta`),
  trend: document.querySelector(`.cgv__trend`),
  age: document.querySelector(`.cgv__age`),
  ageValue: document.querySelector(`.cgv__age-value`),
};

const flickerFields = document.querySelectorAll(`.cgv--flicker`);

const Buttons = {
  close: document.querySelector(`#button-close`),
  settings: document.querySelector(`#button-settings`),
  browse: document.querySelector(`#button-browse`),
};

const ModMap = {
  critical: `cgv__last--critical`,
  warning: `cgv__last--warning`,
  ok: `cgv__last--ok`,
  default: `cgv__last--`,
};

Buttons.close.addEventListener(`click`, () => {
  window.electronAPI.closeWindow();
});

Buttons.settings.addEventListener(`click`, () => {
  window.electronAPI.showSettings();
});

Buttons.browse.addEventListener(`pointerdown`, () => {
  Fields.last.classList.toggle(`cgv__last--accented`);

  log.info(`Open nightscout site was triggered`);
  window.electronAPI.openNightscout();
});

Buttons.browse.addEventListener(`pointerup`, () => {
  Fields.last.classList.toggle(`cgv__last--accented`);
});

Fields.last.addEventListener(`mouseup`, (evt) => {
  evt.target.classList.toggle(`cgv__last--accented`, false);
});

const render = (data) => {

  Fields.last.textContent = data.last;
  Fields.delta.textContent = data.delta;
  Fields.trend.innerHTML = data.direction;
  Fields.ageValue.textContent = data.age;

  if (CONFIG.WIDGET.SHOW_AGE) {
    Fields.age.style.display = `block`;
  } 

  if (!Fields.last.className.includes(ModMap.default)) {
    Fields.last.classList.add(ModMap.default);
  }

  let classMod;
  if (data.age > CONFIG.WIDGET.AGE_LIMIT) {
    Fields.cgv.classList.add(`cgv--frozen`);
    classMod = ModMap.default;
  } else { 
    if (Fields.cgv.classList.contains(`cgv--frozen`)) {
      Fields.cgv.classList.remove(`cgv--frozen`);
    }

    const lastResult = parseFloat(data.last);
    if (lastResult >= CONFIG.BG.HIGH || lastResult <= CONFIG.BG.LOW) {
      classMod = ModMap.critical;
    } else if (lastResult >= CONFIG.BG.TARGET.TOP || lastResult <= CONFIG.BG.TARGET.BOTTOM) {
      classMod = ModMap.warning;
    } else {  
      classMod = ModMap.ok;
    }
  }

  Fields.last.className = Fields.last.className.replace(/cgv__last--.*/, classMod);
};

window.electronAPI.setAgeVisibility((_evt, show) => {
  if (show) {
    Fields.age.style.display = `block`;
  } else {
    Fields.age.style.display = `none`;
  }
});

let isAlertShown = false;
let retry = 0;

const onSuccess = (result) => {
  retry = 0;
  isAlertShown = false;

  flickerFields.forEach((element) => {
    element.classList.remove(`cgv--flicker`);
  });

  render(prepareData(result));
};

const onError = (errorMessage) => {
  const msg = `${errorMessage} - was encountered over than ${retry++} times`;

  if (retry > CONNECTION_RETRY_LIMIT && !isAlertShown) {
    log.error(msg);
    Fields.cgv.classList.add(`cgv--frozen`);
    Fields.last.className = Fields.last.className.replace(/cgv__last--.*/, ModMap.default);
    alert(`error`, `Connection error`, msg);
    isAlertShown = true;
  }
};

document.addEventListener(`visibilitychange`, () => {
  if (document.visibilityState === `visible`) {
    getData(onSuccess, onError);
    log.info(`Get data due to visibility change`);
  }
});

setInterval(() => {
  getData(onSuccess, onError);
}, CONFIG.NIGHTSCOUT.INTERVAL * 1000);

getData(onSuccess, onError);
