"use strict";

const log = window.electronAPI.logger;

class Translator {
  _availableLanguages = [`en`, `ru`];
  _language = `en`;

  constructor(language = null) {
    this._elements = document.querySelectorAll(`[data-i18n]`);
    if (language && this._availableLanguages.includes(language)) {
      this._language = language;
    }
  }

  async load(language = null) {
    if (language && this._availableLanguages.includes(language)) {
      this._language = language;
    }

    try {
      const TRANSLATION = await window.electronAPI.getTranslate(this._language);
      this._translate(TRANSLATION);
    } catch (error) {
      log.error(`Error obtaining translation data: ${error}`);
    }
  }

  _translate(translation) {
    this._elements.forEach((element) => {
      const keys = element.dataset.i18n.split(`.`);
      const text = keys.reduce((obj, i) => obj[i], translation);
      if (text) {
        element.textContent = text;
      }
    });
  }

  getLanguage() {
    return this._language;
  }

}

export { Translator };
