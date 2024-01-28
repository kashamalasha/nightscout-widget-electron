<a href="#"><img width="256" height="256" src="asset/owlet_main_icon.png" align="left" /></a>


# Owlet

The cross-platform application, that uses the [Nightscout API](https://nightscout.github.io/). The aim is to provide a lightweight interface for your `T1D` measurement visualization (blood sugar levels).

The app's name is "Owlet", which means baby owl and is chosen because of the Nightscout project logo.

<div>
  <a href="https://github.com/kashamalasha/nightscout-widget-electron/releases"><img src="https://img.shields.io/github/downloads/kashamalasha/nightscout-widget-electron/total?color=%2300834a" /></a>
  <a href="https://github.com/kashamalasha/nightscout-widget-electron/releases/latest"><img src="https://img.shields.io/github/downloads/kashamalasha/nightscout-widget-electron/latest/total?color=%2300834a&label=latest" /></a>
  <a href="https://github.com/kashamalasha/nightscout-widget-electron/releases/latest"><img src="https://img.shields.io/github/v/release/kashamalasha/nightscout-widget-electron?color=%2300834a" /></a>
</div>


## README Translation

[![IT](https://img.shields.io/badge/Language-IT-red.svg)](https://github.com/kashamalasha/nightscout-widget-electron/blob/main/docs/README.it.md)
[![PL](https://img.shields.io/badge/Language-PL-red.svg)](https://github.com/kashamalasha/nightscout-widget-electron/blob/main/docs/README.pl.md)
[![RU](https://img.shields.io/badge/Language-RU-red.svg)](https://github.com/kashamalasha/nightscout-widget-electron/blob/main/docs/README.ru.md) 


## Project Description

The widget will stay on top of your screen, so you don't need to keep your Nightscout site in the browser opened to see your/your relative's or kid's measurements in real-time anymore.

I was inspired by the [mlukasek/M5_NightscoutMon](https://github.com/mlukasek/M5_NightscoutMon) solution, built on [M5 Stack's](https://m5stack.com/) hardware platform.

<img src="docs/screenshot-widget.png" alt="Screenshot-widget" width="300"/>


## Installation packages

[![Download for Windows](https://img.shields.io/badge/Download-Windows%20.exe-blue?style=for-the-badge&logo=windows)](https://github.com/kashamalasha/nightscout-widget-electron/releases/download/v0.8.1-beta/Owlet-0.8.0-beta-win-x64.exe)

[![Download for macOS(Apple Silicon)](https://img.shields.io/badge/Download-macOS%20(Apple%20Silicon)%20.dmg-blue?style=for-the-badge&logo=apple)](https://github.com/kashamalasha/nightscout-widget-electron/releases/download/v0.8.1-beta/Owlet-0.8.1-beta-mac-arm64.dmg)

[![Download for macOS(Intel)](https://img.shields.io/badge/Download-macOS%20(Intel)%20.dmg-blue?style=for-the-badge&logo=apple)](https://github.com/kashamalasha/nightscout-widget-electron/releases/download/v0.8.1-beta/Owlet-0.8.1-beta-mac-x64.dmg)

[![Download for Linux](https://img.shields.io/badge/Download-Linux%20.AppImage-blue?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/kashamalasha/nightscout-widget-electron/releases/download/v0.8.1-beta/Owlet-0.8.1-beta-linux-x86_64.AppImage)

[![Download Souces](https://img.shields.io/badge/Download-Sources%20.tar.gz-blue?style=for-the-badge&logo=electron&logoColor=white)](https://github.com/kashamalasha/nightscout-widget-electron/archive/refs/tags/v0.8.1-beta.tar.gz)

[![Download Souces](https://img.shields.io/badge/Browse-Latest%20Release-red?style=for-the-badge&logo=github&logoColor=white)](https://github.com/kashamalasha/nightscout-widget-electron/releases/latest)

<details>
  <summary><b>LINUX</b> user, expand it and read.. </summary>
  <br>
  The widget is packed in an [AppImage](https://appimage.org/) package due to the following reasons:

  - It runs on all common Linux distributions
  - It supports an auto-update feature (but doesn't support notification about it)
  - AppImage usage simplifies the development process and testing on many different Linux distributions

  I recommend using [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) to properly integrate the AppImage into the OS and create all the necessary `.desktop` files to launch it as an installed application. However, this decision is entirely up to you. You can launch the application immediately after downloading from the folder you choose to download and create the `.desktop` file manually.

  Please install the listed dependencies using the OS package manager:

  - wmctrl
  - xdg-utils

  Without these listed dependencies, the widget will still work, but it might be difficult to manage the window states properly (`wmctrl` is used to hide the app from the application panel and tray) and to open other applications (`xdg-open` is used to open the browser for redirecting to the Nightscout site and open the file manager to navigate to the logs folder).

  Without these packages, the widget will alert you about the missing dependencies once a day on every launch.

  <b>Auto-update may cause freezing</b>. The application starts checking for updates right after the launch, but only once a day. If it finds a new version in the latest releases, it will begin downloading and replacing the AppImage on your drive, which usually takes about 1-2 minutes. If the application freezes, you need to wait until it awakens, or alternatively, you can kill the process using the `ps` command and restart it.

  The issue is related to the lack of usability of the `notification-daemon`. Sometimes, the D-Bus service doesn't configure properly, and as a result, the `notify-send` command cannot be executed. If the `notify-send` command works fine on your distribution, then it is not your issue, and everything should function properly.

  Please note that the AppImage doesn't have yet a built-in mechanism to notify about the updates. If you are knowledgeable about how to implement this feature, you are welcome to contribute by submitting a pull request; I would sincerely appreciate it.

</details>


## ⚠️ Before start

> ‼️ **THIS IS VERY IMPORTANT**: You have to be sure that all steps are done before you make the first launch!

1. Log in to the admin panel of your Nightscout site (e.g. https://some-cgm.site.com/admin/)
2. Create a new role with permission to read data using the pattern `*:*:read`
3. Create a new subject for the application with the role created in step 2, or use an existing role with the pattern to read data `*:*:read`
4. Copy the access token for this subject to your clipboard or save it


## First start

On the first launch, the app will prompt you to fill in the following settings

<figure>
  <p>
    <img src="docs/screenshot-settings-default-en.png" alt="Screenshot-widget"/>
  </p>
</figure>


### 1. Nightscout API Settings

- **NIGHTSCOUT URL** - is the address of your nightscout (e.g. https://some-cgm.fly.dev) 
- **NIGHTSCOUT TOKEN** - the access token you've created on the previous steps
- **NIGHTSCOUT REQUEST INTERVAL (SEC.)** - (*default: 60*) the interval of the getting information from the Nightscout site to display in the widget


### 2. Widget preferences

- **AGE LIMIT (MIN.)** - (*default: 20*) the timeout of data requesting interval, after that interval widget will change its appearance to a "frozen" state. This typically indicates that the reader is offline, detached from the sensor, or the smartphone's battery is drained. If you prefer the widget not to freeze, you can set this property to 0. The maximum allowable value for this field, as well as the maximum value shown, is 999 minutes.

<img src="docs/screenshot-widget-frozen.png" alt="Screenshot-widget" width="200"/>

- **SHOW AGE** - (*default: enabled*) that option displays additional information about how old the shown data is

- **UNITS IN MMOL/L** - (*default: enabled*) that option allows to display sensor glucose values in mmol/l instead of mg/d. If you decide to modify this setting, please verify the blood sugar level preferences based on the selected units of measurement after making changes. Remember to save the settings after adjusting the measurement unit system.

- **CALC TREND** - (*default: disabled*) This option allows to calculate the direction of the trend using the last six received (for the last half an hour) SGV values. You may find it useful when your sensor doesn't have built-in option (e.g., Dexcom, Medtronic) and the Nightscout API doesn't store this value. In such cases, you will see a ` - ` symbol in the bottom right corner of the widget all the time instead of a trend arrow.

The app uses the following Abbot™ FreeStyle Libre™ sensors algorithm to recognize the trend pattern.

<figure>
  <p>
    <img src="docs/fs-libre-trend-arrows.png" alt="Screenshot-widget"/>
  </p>
</figure>

You can find more information on the approach to using trend arrows to adjust insulin doses in the article of the **Journal of the Endocrine Society**: [Approach to Using Trend Arrows in the FreeStyle Libre Flash Glucose Monitoring Systems in Adults](https://academic.oup.com/jes/article/2/12/1320/5181247). 

[PDF version](docs/js.2018-00294.pdf) available for downloading.


### 3. Blood sugar levels preferences

Set the blood sugar tracking parameters using the following guides:

- Above the **HIGH LEVEL TRESHOLD** (*default: 10*) and below th **LOW LEVEL THRESHOLD** (*default: 3.5*) the last value will be colored in red

<img src="docs/screenshot-widget-critical.png" alt="Screenshot-widget" width="200"/>

- Above the **TARGET TOP LEVEL** (*default: 8.5*) and below the **TARGET BOTTOM LEVEL** (*default: 4*) the last value will be colored in orange

<img src="docs/screenshot-widget-warning.png" alt="Screenshot-widget" width="200"/>

- By default, the last value will be colored in green

<img src="docs/screenshot-widget-ok.png" alt="Screenshot-widget" width="200"/>

- You may test the entered connection parameters by clicking the **TEST** button to verify the Nightscout site is accessible and the token is correct
- If everything is ok, press the **SAVE** button to save settings and restart the application


### 4. Settings language and localization 

- You can choose the settings language by clicking on the top left **EN** icon and selecting your preferred language.

<figure>
  <p>
    <img src="docs/screenshot-settings-language-en.png" alt="Screenshot-widget" width="400"/>
  </p>
</figure>

- Currently, the application offers the following languages:
  - English
  - Hebrew
  - Italian
  - Polish
  - Russian
  - Slovak
  - Spanish

- If you feel confident and have a good grasp of a foreign language, you can contribute to the translation of the application by becoming a project contributor on [POEditor](https://poeditor.com/join/project/PzcEMSOFc7).


## Using the widget

- After restarting, the widget will always stay on top of the screen until you close it by clicking the top left corner with the X sign.
- If you need to change the settings you can click by the gear symbol in the bottom left corner.
- If you want to fast navigate to the Nightscout site, you can click the middle button with the graph symbol.


## Auto updates

- The widget has a built-in implementation of the update system.
- The widget will check for the latest release availability every time it starts, but only once a day.
- If the latest release is available, the widget will automatically download and install it right after exiting.
- On **Mac** and **Windows** operating systems, users will receive a notification about the newly downloaded version.
- On **Linux**, the notification doesn't work properly yet.


## Work In Progress 

- Unit tests coverage using [Jest](https://jestjs.io/)
- Create landing page of the project based on [Jekyll](https://jekyllrb.com/)
- Replace the Electron engine for the [Tauri app](https://beta.tauri.app/)

If you feel desire to improve it or help. 
You can suggest any ideas or detected bugs to the [project board](https://github.com/users/kashamalasha/projects/2/views/1).


## To build it from source code

To clone and run this repository, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line do:

```bash
# Clone this repository
git clone https://github.com/kashamalasha/nightscout-widget-electron
# Go into the repository
cd nightscout-widget-electron
# Install dependencies
npm install
# Run the app
npm start
# Or run in developer mode for deeper logging and debugging
npm run dev
```

## Operating systems compatibility

Compatible with:
* Apple MacOS (10.10+)
* Microsoft Windows (10+)
* Linux (tested on Ubuntu, Fedora, CentOS, Alma on GNOME Desktop and XFCE)


## Additional Resources

- [Nightscout API v3](https://github.com/nightscout/cgm-remote-monitor/blob/master/lib/api3/doc/tutorial.md) - Nightscout API v3 documentation
- [Icons8.com](https://icons8.com/) - Great icons and assets collection that I used in this project
- [POEditor](https://poeditor.com/join/project/PzcEMSOFc7) - localization of the application


## License

[GNU GPL v3](LICENSE.md)


## Contacts

Feel free to contact me any of these ways:
- dmitry.burnyshev@gmail.com
- https://linkedin.com/in/diburn
- https://t.me/diburn

🙏 I'll appreciate any feedback!
