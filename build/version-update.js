const fs = require(`fs`);
const path = require(`path`);

console.log(`Current version is:`, process.env.npm_package_version);

const readmeFiles = [
  path.join(process.cwd(), `README.md`),
  path.join(process.cwd(), `docs`, `README.it.md`),
  path.join(process.cwd(), `docs`, `README.pl.md`),
  path.join(process.cwd(), `docs`, `README.ru.md`),
];

readmeFiles.forEach((file) => {
  let readmeContent = fs.readFileSync(file, `utf-8`);
  readmeContent = readmeContent.replace(/\d\.\d\.\d-beta/g, process.env.npm_package_version);
  fs.writeFileSync(file, readmeContent, `utf-8`);
  console.log(`${path.relative(process.cwd(), file)} updated with the latest version:`, process.env.npm_package_version);
});

console.log(`Version-update job is done`);
