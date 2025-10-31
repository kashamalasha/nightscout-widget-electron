/* eslint-disable no-console */

const fs = require(`fs`);
const path = require(`path`);

const RED = `\x1b[1;91m`;
const YELLOW = `\x1b[1;93m`;
const GREEN = `\x1b[1;92m`;
const RESET = `\x1b[0m`;

console.log(`Current package.json version is: ${YELLOW}${process.env.npm_package_version}${RESET}\n`);

const readmeFiles = [
  path.join(process.cwd(), `README.md`),
  path.join(process.cwd(), `docs`, `README.it.md`),
  path.join(process.cwd(), `docs`, `README.pl.md`),
  path.join(process.cwd(), `docs`, `README.ru.md`),
  path.join(process.cwd(), `.github`, `ISSUE_TEMPLATE`, `bug-report.yml`),
  path.join(process.cwd(), `build`, `winget`, `kashamalasha.Owlet.yaml`),
  path.join(process.cwd(), `build`, `winget`, `kashamalasha.Owlet.locale.en-US.yaml`),
  path.join(process.cwd(), `build`, `winget`, `kashamalasha.Owlet.installer.yaml`)
];

readmeFiles.forEach((file) => {
  try {
    let readmeContent = fs.readFileSync(file, `utf-8`);
    readmeContent = readmeContent.replace(/\d\.\d\.\d-beta/g, process.env.npm_package_version);
    fs.writeFileSync(file, readmeContent, `utf-8`);
    console.log(`${GREEN}${path.relative(process.cwd(), file)}${RESET} is updated`);
  } catch (error) {
    console.error(`${RED}Error reading file: ${path.relative(process.cwd(), file)}${RESET}: \n${error}`);
  }
});

console.log(`\nVersion-update job is done`);
