"use strict";

import { customAssign, alert } from "./util.js";
import { getStatus } from "./backend.js";

const CONFIG = await window.electronAPI.getSettings();
const VERSION = await window.electronAPI.getVersion();
const TRANSLATE = await window.electronAPI.getTranslate();

const log = window.electronAPI.logger;

const FormFields = {
  NIGHTSCOUT: {
    URL: document.querySelector(`#nightscout-url`),
    TOKEN: document.querySelector(`#nightscout-token`),
    INTERVAL: document.querySelector(`#nightscout-interval`),
  },
  WIDGET: {
    OPACITY: document.querySelector(`#widget-opacity`),
    AGE_LIMIT: document.querySelector(`#age-limit`),
    SHOW_AGE: document.querySelector(`#show-age`),
  },
  BG: {
    HIGH: document.querySelector(`#bg-high`),
    LOW: document.querySelector(`#bg-low`),
    TARGET: {
      TOP: document.querySelector(`#bg-target-top`),
      BOTTOM: document.querySelector(`#bg-target-bottom`),
    }
  },
};

const FormButtons = {
  SUBMIT: document.querySelector(`form`),
  TEST: document.querySelector(`#button-test`),
  LOG: document.querySelector(`.settings__log-link`),
  CLOSE: document.querySelector(`#button-close`),
};

const FormLabels = {
  TITLE: document.querySelector(`h1.settings__title`),
  NIGHTSCOUT: {
    TITLE: document.querySelector(`.settings-fields__nightscout > h2.settings-field__title`),
    URL: document.querySelector(`label[for="nightscout-url"]`),
    TOKEN: document.querySelector(`label[for="nightscout-token"]`),
    INTERVAL: document.querySelector(`label[for="nightscout-interval"]`)
  },
  WIDGET: {
    TITLE: document.querySelector(`.settings-fields__widget > h2.settings-field__title`),
    OPACITY: document.querySelector(`label[for="widget-opacity"]`),
    AGE_LIMIT: document.querySelector(`label[for="age-limit"]`),
    SHOW_AGE: document.querySelector(`label[for="show-age"] > .settings-input__label`),
    CALC_TREND: document.querySelector(`label[for="calc-trend"] > .settings-input__label`)
  },
  BG: {
    TITLE: document.querySelector(`.settings-fields__bg > h2.settings-field__title`),
    HIGH: document.querySelector(`label[for="bg-high"`),
    LOW: document.querySelector(`label[for="bg-low"]`),
    TARGET: {
      TOP: document.querySelector(`label[for="bg-target-top"]`),
      BOTTOM: document.querySelector(`label[for="bg-target-bottom"]`),
    }
  },
};

customAssign(FormFields, CONFIG);
customAssign(FormLabels, TRANSLATE.settings, `textContent`);

document.querySelector(`#app-version`).textContent = VERSION;

FormFields.WIDGET.OPACITY.addEventListener(`change`, (evt) => {
  const opacity = evt.target.valueAsNumber;
  try {
    window.electronAPI.setWidgetOpacity(opacity);
  } catch(error) {
    log.error(error);
  }
});

FormFields.WIDGET.SHOW_AGE.addEventListener(`change`, (evt) => {
  const show = evt.target.checked;
  try {
    window.electronAPI.testAgeVisisblity(show);
  } catch(error) {
    log.error(error);
  }
});

const testConnection = (evt) => {
  return new Promise((resolve, reject) => {
    const testParams = {
      url: FormFields.NIGHTSCOUT.URL.value,
      token: FormFields.NIGHTSCOUT.TOKEN.value,
    };

    const onSuccess = (result) => {
      if (evt.target.id === `button-test`) {
        const msg = `Connection successfully established.`;
        alert(`info`, `OK`, `It looks good!\n${msg}`);
        log.info(msg);
      }

      resolve(result);
    };

    const onError = (errorMessage) => {
      log.error(errorMessage);
      const msg = `Connection failed: ${errorMessage}.`;

      reject(new Error(msg));
    };

    getStatus(testParams, onSuccess, onError);
  });
};

FormButtons.TEST.addEventListener(`click`, async (evt) => {
  try {
    await testConnection(evt);
  } catch (error) {
    alert(`error`, `Connection failed.`, error);
  }
});

const nightscoutTextInputs = [
  FormFields.NIGHTSCOUT.URL,
  FormFields.NIGHTSCOUT.TOKEN
];

const trimInputs = (evt) => {
  const inputValue = evt.target.value;
  const trimmedValue = inputValue.trim();

  const modifiedValue = trimmedValue.replace(/[./]+$/, ``);
  evt.target.value = modifiedValue;
};

nightscoutTextInputs.forEach((input) => {
  input.addEventListener(`blur`, trimInputs);
});

FormButtons.SUBMIT.addEventListener(`submit`, async (evt) => {
  evt.preventDefault();

  const msg = `Settings were updated. Widget will be restarted.`;

  const formData = new FormData(evt.target);
  const formDataObj = Object.fromEntries(formData.entries());

  formDataObj[`show-age`] = (formDataObj[`show-age`]) ? true : false;

  try {
    await testConnection(evt);
    window.electronAPI.setSettings(formDataObj);
    alert(`info`, `OK`, msg, true);
    log.warn(msg);
    window.electronAPI.closeWindow();
    window.electronAPI.restart();
  } catch(error) {
    log.error(error);
    alert(`error`, `Something went wrong`, msg, true);
  }
});

FormButtons.LOG.addEventListener(`click`, (evt) => {
  evt.preventDefault();

  window.electronAPI.openLogFile();
  window.electronAPI.closeWindow();
});

FormButtons.CLOSE.addEventListener(`click`, () => {
  window.electronAPI.closeWindow();
});

setTimeout(window.electronAPI.checkFormValidation, 100);
