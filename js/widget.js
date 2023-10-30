"use strict";

import { getData } from "./backend.js";
import { prepareData, alert } from "./util.js";

const CONNECTION_RETRY_LIMIT = 5;
const CONFIG = await window.electronAPI.getSettings();

const log = window.electronAPI.logger;

const Fields = {
  sgv: document.querySelector(`.sgv`),
  last: document.querySelector(`.sgv__last`),
  delta: document.querySelector(`.sgv__delta`),
  trend: document.querySelector(`.sgv__trend`),
  age: document.querySelector(`.sgv__age`),
  ageValue: document.querySelector(`.sgv__age-value`),
};

const flickerFields = document.querySelectorAll(`.sgv--flicker`);

const Buttons = {
  close: document.querySelector(`#button-close`),
  settings: document.querySelector(`#button-settings`),
  browse: document.querySelector(`#button-browse`),
};

const ModMap = {
  critical: `sgv__last--critical`,
  warning: `sgv__last--warning`,
  ok: `sgv__last--ok`,
  default: `sgv__last--`,
};

Buttons.close.addEventListener(`click`, () => {
  window.electronAPI.closeWindow();
});

Buttons.settings.addEventListener(`click`, () => {
  window.electronAPI.showSettings();
});

Buttons.browse.addEventListener(`pointerdown`, () => {
  Fields.last.classList.toggle(`sgv__last--accented`);

  log.info(`Open nightscout site was triggered`);
  window.electronAPI.openSite(`nightscout`);
});

Buttons.browse.addEventListener(`pointerup`, () => {
  Fields.last.classList.toggle(`sgv__last--accented`);
});

Fields.last.addEventListener(`mouseup`, (evt) => {
  evt.target.classList.toggle(`sgv__last--accented`, false);
});

const render = (data, isTestMMOL=false) => {

  Fields.last.textContent = data.last;
  Fields.delta.textContent = data.delta;
  Fields.trend.innerHTML = data.direction;
  Fields.ageValue.textContent = data.age;

  if (CONFIG.WIDGET.SHOW_AGE) {
    Fields.age.style.display = `block`;
  }

  if ((CONFIG.WIDGET.UNITS_IN_MMOL && !isTestMMOL) || (!CONFIG.WIDGET.UNITS_IN_MMOL && isTestMMOL)) {
    Fields.last.classList.add('sgv__last-converted');
  } else {
    Fields.last.classList.remove('sgv__last-converted');
  }

  if (!Fields.last.className.includes(ModMap.default)) {
    Fields.last.classList.add(ModMap.default);
  }

  let classMod = ModMap.default;
  if (data.age > CONFIG.WIDGET.AGE_LIMIT) {
    Fields.sgv.classList.add(`sgv--frozen`);
  } else {
    if (Fields.sgv.classList.contains(`sgv--frozen`)) {
      Fields.sgv.classList.remove(`sgv--frozen`);
    }

    if (!isTestMMOL) {
      const lastResult = parseFloat(data.last);
      if (lastResult >= CONFIG.BG.HIGH || lastResult <= CONFIG.BG.LOW) {
        classMod = ModMap.critical;
      } else if (lastResult >= CONFIG.BG.TARGET.TOP || lastResult <= CONFIG.BG.TARGET.BOTTOM) {
        classMod = ModMap.warning;
      } else {
        classMod = ModMap.ok;
      }
    }
  }

  Fields.last.className = Fields.last.className.replace(/sgv__last--\S*/, classMod);
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
    element.classList.remove(`sgv--flicker`);
  });

  render(prepareData(result, CONFIG.WIDGET.UNITS_IN_MMOL));
};

const onError = (errorMessage) => {
  const msg = `${errorMessage} - was encountered over than ${retry++} times`;

  if (retry > CONNECTION_RETRY_LIMIT && !isAlertShown) {
    log.error(msg);
    Fields.sgv.classList.add(`sgv--frozen`);
    Fields.last.className = Fields.last.className.replace(/sgv__last--.*/, ModMap.default);
    alert(`error`, `Connection error`, msg);
    isAlertShown = true;
  }
};

window.electronAPI.setUnits((_evt, isMMOL) => {
  log.info(`Test of displaying units in mmol/l: ${isMMOL}`);
  const isTestValue = (CONFIG.WIDGET.UNITS_IN_MMOL !== isMMOL);

  const onSuccessSwitch = (result) => {
    render(prepareData(result, isMMOL), isTestValue);
  };

  getData(onSuccessSwitch, onError);
});


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
