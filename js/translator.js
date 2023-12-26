"use strict";

const log = window.electronAPI.logger;

class Translator {
  _availableLanguages = [`en`, `es`, `he`, `it`, `pl`, `ru`, `sk`];
  _language = `en`;
  _direction = `ltr`;

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
      this._setDirection(TRANSLATION.direction);
      this._translate(TRANSLATION);
    } catch (error) {
      log.error(`Error obtaining translation data: ${error}`);
    }
  }

  _setDirection(direction) {
    if (direction) {
      this._direction = direction;
    } else {
      this._direction = `ltr`;
    }

    document.body.dir = this._direction;

    const languageMenu = document.querySelector(`.language-list`);
    languageMenu.dir = this._direction;

    const classNameWithDirection = `settings-input__field--text-${this._direction}`;
    const inputTextFields = document.querySelectorAll(`.settings-input__field[type=text]`);
    inputTextFields.forEach((field) => {
      field.className = field.className.replace(/settings-input__field--text\S*/, classNameWithDirection);
    });
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

  getDirection() {
    return this._direction;
  }

  getLanguage() {
    return this._language;
  }

}

export { Translator };
