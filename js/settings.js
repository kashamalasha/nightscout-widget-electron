"use strict";

import { customAssign, alert } from "./util.js";
import { getStatus } from "./backend.js";
import { Translator } from "./translator.js";

const LANGUAGE = await window.electronAPI.getLanguage();
const CONFIG = await window.electronAPI.getSettings();
const VERSION = await window.electronAPI.getVersion();

const translator = new Translator();
translator.load(LANGUAGE);

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

const Language = {
  BUTTON : document.querySelector(`.settings-language__button`),
  LIST : document.querySelector(`.language-list`),
};

Language.BUTTON.textContent = translator.getLanguage();

customAssign(FormFields, CONFIG);

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

const setLanguage = (language) => {
  const selectedLanguage = language.getAttribute(`data-value`);

  window.electronAPI.setLanguage(selectedLanguage);
  Language.BUTTON.textContent = selectedLanguage;

  translator.load(selectedLanguage);
  closeLanguageList();
};

Language.BUTTON.addEventListener(`click`, () => {
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

languageArray.forEach((language) => {
  language.addEventListener(`pointerdown`, (evt) => {
    evt.preventDefault();
    setLanguage(language);
  });

  language.addEventListener(`keydown`, (evt) => {
    let currentIndex = languageArray.indexOf(language);

    if (evt.code === `ArrowDown`) {
      currentIndex = (currentIndex + 1) % languageArray.length;
    } else if (evt.code === `ArrowUp`) {
      currentIndex = (currentIndex - 1 + languageArray.length) % languageArray.length;
    } else if (evt.code === `Enter` || evt.code === `Space`) {
      setLanguage(language);
    } else if (evt.code === `Escape`) {
      closeLanguageList();
    }

    languageArray[currentIndex].focus();
  });
});
