const dotenv = require(`dotenv`)
const fs = require('fs')
const path = require('path')
const electronNotarize = require('@electron/notarize');

const result = dotenv.config({ path: path.join(__dirname, `.env`)})

if (result.error) {
  throw result.error
}

module.exports = async function (params) {

    const appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`);
    const appleId = process.env.APPLE_ID; 
    const appId = process.env.APP_ID;
    const appIdPassword = process.env.APPLE_APP_SPECIFIC_PASSWORD;
    const appleTeamId = process.env.APPLE_TEAM_ID;
    const prefix = `  •`

    if (process.platform !== 'darwin') {
        return
    }

    console.log(`${prefix} afterSign hook triggered for the ${params.packager.appInfo.productFilename}.app`)

    if (!fs.existsSync(appPath)) {
        console.log(`${prefix} !! notarization process was skiped due to File not found`)
        return
    }

    console.log(`${prefix} notarizing ${appId} found at ${appPath} with Apple ID ${appleId}`)

    try {
        await electronNotarize.notarize({
            tool: `notarytool`,
            appBundleId: appId,
            appPath: appPath,
            appleId: appleId,
            appleIdPassword: appIdPassword,
            teamId: appleTeamId,
        })
    } catch (error) {
        console.error(error)
    }

    console.log(`${prefix} done notarizing ${appId} for the ${params.packager.appInfo.productFilename}.app`)
}