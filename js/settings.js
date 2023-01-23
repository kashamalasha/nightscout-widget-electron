"use strict";

import { customAssign } from "./util.js";
import { getStatus } from "./backend.js";

const CONFIG = await window.electronAPI.getSettings();

const log = window.electronAPI.logger;

const FormFields = {
  NIGHTSCOUT: {
    URL: document.querySelector(`#nightscout-url`),
    TOKEN: document.querySelector(`#nightscout-token`),
    INTERVAL: document.querySelector(`#nightscout-interval`),
  },
  WIDGET: {
    OPACITY: document.querySelector(`#widget-opacity`),
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

customAssign(FormFields, CONFIG);

FormFields.WIDGET.OPACITY.addEventListener(`change`, (evt) => {
  const opacity = evt.target.valueAsNumber;
  try {
    window.electronAPI.setWidgetOpacity(opacity);
  } catch(error) {
    log.error(error);
  }
});

const buttonTest = document.querySelector(`#button-test`);

buttonTest.addEventListener(`click`, () => {

  const testParams = {
    url: FormFields.NIGHTSCOUT.URL.value,
    token: FormFields.NIGHTSCOUT.TOKEN.value,
  };

  const onSuccess = (result) => {
    alert(`It looks good!`);
    log.info(`Connection test to ${testParams.url} was successfull.`);
  };

  const onError = (errorMessage) => {
    alert(errorMessage);
    log.error(`Connection test to ${testParams.url} wasn't successfull because of ${errorMessage}.`);
  };

  getStatus(testParams, onSuccess, onError);
})

const formSettings = document.querySelector(`form`);

formSettings.addEventListener(`submit`, (evt) => {
  evt.preventDefault();

  const formData = new FormData(evt.target);
  const formDataObj = Object.fromEntries(formData.entries());

  try {
    window.electronAPI.setSettings(formDataObj);
    alert('Settings were saved. Widget will be restarted.');
    log.warn(`Settings were updated, app will be restarted.`);
    window.electronAPI.closeWindow();
  } catch(error) {
    log.error(error);
    alert(error);
  }
});
