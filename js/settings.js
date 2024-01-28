"use strict";

import { customAssign, alert, convertUnitsFor, formDataToObject } from "./util.js";
import { getStatus } from "./backend.js";
import { Translator } from "./translator.js";

const LANGUAGE = await window.electronAPI.getLanguage();
const CONFIG = await window.electronAPI.getSettings();
const VERSION = await window.electronAPI.getVersion();

const translator = new Translator();
translator.load(LANGUAGE);

const log = window.electronAPI.logger;

const form = document.forms['settings-form'];

const FormFields = {
  NIGHTSCOUT: {
    URL: form.querySelector(`#nightscout-url`),
    TOKEN: form.querySelector(`#nightscout-token`),
    INTERVAL: form.querySelector(`#nightscout-interval`),
  },
  WIDGET: {
    AGE_LIMIT: form.querySelector(`#age-limit`),
    SHOW_AGE: form.querySelector(`#show-age`),
    UNITS_IN_MMOL: form.querySelector(`#units-in-mmol`),
    CALC_TREND: form.querySelector(`#calc-trend`),
  },
  BG: {
    HIGH: form.querySelector(`#bg-high`),
    LOW: form.querySelector(`#bg-low`),
    TARGET: {
      TOP: form.querySelector(`#bg-target-top`),
      BOTTOM: form.querySelector(`#bg-target-bottom`),
    },
  },
};

const FormButtons = {
  SUBMIT: form.querySelector(`#button-submit`),
  TEST: form.querySelector(`#button-test`),
  LOG: form.querySelector(`.settings__log-link`),
  CLOSE: document.querySelector(`#button-close`),
};

const Language = {
  BUTTON: document.querySelector(`.settings-language__button`),
  LIST: document.querySelector(`.language-list`),
};

Language.BUTTON.textContent = translator.getLanguage();

customAssign(FormFields, CONFIG);
const initialFormState = new FormData(form);

document.querySelector(`#app-version`).textContent = VERSION;

FormFields.WIDGET.SHOW_AGE.addEventListener(`change`, (evt) => {
  const show = evt.target.checked;
  try {
    window.electronAPI.testAgeVisisblity(show);
  } catch (error) {
    log.error(error);
  }
});

FormFields.WIDGET.UNITS_IN_MMOL.addEventListener(`change`, (evt) => {
  const isMMOL = evt.target.checked;

  try {
    window.electronAPI.testUnits(isMMOL);
  } catch (error) {
    log.error(error);
  }
});

FormFields.WIDGET.CALC_TREND.addEventListener(`change`, (evt) => {
  const calcTrend = evt.target.checked;

  try {
    window.electronAPI.testCalcTrend(calcTrend, FormFields.WIDGET.UNITS_IN_MMOL.checked);
  } catch (error) {
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

const formSubmission = (formDataObj) => {
  const msg = `Settings were updated. Widget will be restarted.`;

  formDataObj[`show-age`] = !!formDataObj[`show-age`];
  formDataObj[`units-in-mmol`] = !!formDataObj[`units-in-mmol`];
  formDataObj[`calc-trend`] = !!formDataObj[`calc-trend`];

  window.electronAPI.setSettings(formDataObj);
  alert(`info`, `OK`, msg, true);
  log.warn(msg);

  window.electronAPI.closeWindow();
  window.electronAPI.restart();
};

window.electronAPI.setUnits((_evt, isMMOL) => {
  log.info(`Test of converting units in mmol/l: ${isMMOL} from settingsWindow`);

  convertUnitsFor(CONFIG.BG, isMMOL);
  customAssign(FormFields.BG, CONFIG.BG);
});

form.addEventListener(`submit`, async (evt) => {
  evt.preventDefault();

  const formData = new FormData(evt.target);
  const formDataObj = formDataToObject(formData);

  try {
    await testConnection(evt);
    formSubmission(formDataObj);
  } catch (error) {
    log.error(error);
    alert(`error`, `Error`, `Something went wrong`, true);
  }
});

FormButtons.LOG.addEventListener(`click`, (evt) => {
  evt.preventDefault();

  window.electronAPI.openLogFile();
  window.electronAPI.closeWindow();
});

const isFormModified = (currentForm, initialForm) => {
  return JSON.stringify(formDataToObject(currentForm)) !== JSON.stringify(formDataToObject(initialForm));
};

FormButtons.CLOSE.addEventListener(`click`, () => {
  const currentFormState = new FormData(form);
  const modified = isFormModified(currentFormState, initialFormState);

  if (modified) {
    alert(`warning`, `Save settings`, `Save the settings before exit`, true);
    FormButtons.SUBMIT.focus();
  } else {
    window.electronAPI.closeWindow();
  }
});

setTimeout(window.electronAPI.checkFormValidation, 100);

const languages = Language.LIST.querySelectorAll(`.language-list__item`);
const languageArray = Array.from(languages);

let menuIsOpen = false;

const openLanguageList = () => {
  Language.LIST.style.display = `block`;
  Language.BUTTON.classList.add(`settings-language__button--active`);
  menuIsOpen = true;
};

const closeLanguageList = () => {
  Language.LIST.style.display = `none`;
  Language.BUTTON.classList.remove(`settings-language__button--active`);
  menuIsOpen = false;
};

const setLanguage = (selectedLanguage) => {
  window.electronAPI.setLanguage(selectedLanguage);
  Language.BUTTON.textContent = selectedLanguage;

  translator.load(selectedLanguage);
  closeLanguageList();
};

const languageMenuHandler = (element) => {
  if (element.dataset.value) {
    setLanguage(element.dataset.value);
  } else {
    window.electronAPI.openSite(`poeditor`);
    closeLanguageList();
    window.electronAPI.closeWindow();
  }
};

Language.BUTTON.addEventListener(`pointerdown`, () => {
  if (menuIsOpen) {
    closeLanguageList();
  } else {
    openLanguageList();
  }
});

Language.BUTTON.addEventListener(`blur`, (evt) => {
  if (menuIsOpen) {
    evt.preventDefault();
    setTimeout(() => {
      Language.LIST.focus();
    });
  }
});

Language.BUTTON.addEventListener(`keydown`, (evt) => {
  if (menuIsOpen) {
    if (evt.code === `Escape`) {
      closeLanguageList();
    } else if (evt.code === `ArrowDown`) {
      languageArray[0].focus();
    }
  }
});

document.addEventListener(`focusin`, (evt) => {
  if (menuIsOpen) {
    if (!Language.LIST.contains(evt.target) && evt.target !== Language.BUTTON) {
      closeLanguageList();
    }
  }
});

document.addEventListener(`pointerdown`, (evt) => {
  if (menuIsOpen) {
    if (!Language.LIST.contains(evt.target) && evt.target !== Language.BUTTON) {
      closeLanguageList();
    }
  }
});

languageArray.forEach((element) => {
  element.addEventListener(`pointerdown`, (evt) => {
    evt.preventDefault();
    languageMenuHandler(element);
  });

  element.addEventListener(`keydown`, (evt) => {
    let currentIndex = languageArray.indexOf(element);

    if (evt.code === `ArrowDown`) {
      currentIndex = (currentIndex + 1) % languageArray.length;
    } else if (evt.code === `ArrowUp`) {
      currentIndex = (currentIndex - 1 + languageArray.length) % languageArray.length;
    } else if (evt.code === `Enter` || evt.code === `Space`) {
      languageMenuHandler(element);
    } else if (evt.code === `Escape`) {
      closeLanguageList();
    }

    languageArray[currentIndex].focus();
  });
});
