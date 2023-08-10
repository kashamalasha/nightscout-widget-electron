const fs = require('fs');
const path = require('path');
const electronNotarize = require('@electron/notarize');

module.exports = async function (context) {
  let params = {
    tool: `notarytool`,
    appPath: path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`),
  };

  if (!process.env.GITHUB_ACTIONS) {
    const dotenv = require('dotenv');
    const result = dotenv.config({ path: path.join(__dirname, '.env') });

    params = {
      ...params,
      appBundleId: process.env.APP_ID,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID
    };

    if (result.error) {
      throw result.error;
    }
  } else {
    params = {
      ...params,
      keychain: process.env.KEYCHAIN,
      keychainProfile: process.env.KEYCHAIN_PROFILE
    };
  }

  if (process.platform !== 'darwin') {
    return;
  }
  const prefix = `  •`;

  console.log(`${prefix || ''} afterSign hook triggered for the ${context.packager.appInfo.productFilename}.app`);

  if (!fs.existsSync(params.appPath)) {
    console.log(`${prefix || ''} !! notarization process was skipped due to File not found`);
    return;
  }

  console.log(`${prefix || ''} notarizing App file at ${params.appPath}`);

  try {
    await electronNotarize.notarize(params);
  } catch (error) {
    console.error(error);
  }

  console.log(`${prefix || ''} done notarizing for the ${context.packager.appInfo.productFilename}.app`);
};
