/* eslint-disable no-console */

const fs = require(`fs`);
const path = require(`path`);

const RED = `\x1b[1;91m`;
const YELLOW = `\x1b[1;93m`;
const GREEN = `\x1b[1;92m`;
const RESET = `\x1b[0m`;

console.log(`Current package.json version is: ${YELLOW}${process.env.npm_package_version}${RESET}\n`);

let countOldVersion = 0;

const readmeFiles = [
  path.join(process.cwd(), `README.md`),
  path.join(process.cwd(), `docs`, `README.it.md`),
  path.join(process.cwd(), `docs`, `README.pl.md`),
  path.join(process.cwd(), `docs`, `README.ru.md`),
  path.join(process.cwd(), `.github`, `ISSUE_TEMPLATE`, `bug-report.yml`),
];

readmeFiles.forEach((file) => {
  try {
    const readmeContent = fs.readFileSync(file, `utf-8`);
    const linksInFileArray = readmeContent.match(/\d\.\d\.\d-beta/g);

    let hasOldVersion = false;

    linksInFileArray.some((linkVersion) => {
      if (linkVersion != process.env.npm_package_version) {
        hasOldVersion = true;
        countOldVersion++;
      }
      return hasOldVersion;
    });

    if (hasOldVersion) {
      console.log(`${RED}${path.relative(process.cwd(), file)}${RESET} is outdated`);
    } else {
      console.log(`${GREEN}${path.relative(process.cwd(), file)}${RESET} is ok`);
    }
  } catch (error) {
    console.error(`${RED}Error reading file: ${path.relative(process.cwd(), file)}${RESET}: \n${error}`);
  }
});

console.log(`\nVersion-check job is done`);

if (countOldVersion > 0) {
  process.exit(1);
}
