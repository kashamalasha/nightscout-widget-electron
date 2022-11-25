"use strict";

const MMOL_TO_MGDL = 18;

const dir2Char = {
  NONE: `⇼`,
  TripleUp: `⤊`,
  DoubleUp: `⇈`,
  SingleUp: `↑`,
  FortyFiveUp: `↗`,
  Flat: `→`,
  FortyFiveDown: `↘`,
  SingleDown: `↓`,
  DoubleDown: `⇊`,
  TripleDown: `⤋`,
  "NOT COMPUTABLE": `-`,
  "RATE OUT OF RANGE": `⇕`
};

const mgdlToMMOL = (mgdl) => {
  return (Math.round((mgdl / MMOL_TO_MGDL) * 10) / 10).toFixed(1);
};

const charToEntity = (char) => {
  return char && char.length && `&#` + char.charCodeAt(0) + `;`;
};

const directionToChar = (direction) => {
  return dir2Char[direction] || `-`;
};

const prepareData = (obj) => {
  let result = {};

  result.last = mgdlToMMOL(obj.result[0].sgv);
  result.prev = mgdlToMMOL(obj.result[1].sgv);
  result.direction = charToEntity(directionToChar(obj.result[0].direction));

  let delta = Math.round((result.last - result.prev) * 100) / 100;

  if (delta > 0) {
    result.delta = `+` + delta;
  } else if (delta === 0) {
    result.delta = `+0.0`;
  } else {
    result.delta = delta.toString();
  }

  return result;
};

export { prepareData };
