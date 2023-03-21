import { app, BrowserWindow, systemPreferences } from 'electron';

import { join } from 'path';
import IPCs from './IPCs';

type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };

global.IS_DEV = !app.isPackaged;

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: global.IS_DEV ? 1300 : 720,
    height: 540,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: global.IS_DEV,
      preload: join(__dirname, '../preload/index.js'),
    },
  });
  mainWindow.setMenuBarVisibility(false);

  if (global.IS_DEV) {
    mainWindow
      .loadURL('http://localhost:5173')
      .catch((e) => {
        console.log(e);
      })
      .then(() => {
        mainWindow.webContents.openDevTools();
      });
  } else {
    mainWindow.loadFile(join(__dirname, '../index.html')).catch((e) => {
      console.log(e);
    });
  }

  // Initialize IPC Communication
  IPCs.initialize(mainWindow);
};

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    systemPreferences.setUserDefault('NSDisabledDictationMenuItem', 'boolean', true);
    systemPreferences.setUserDefault('NSDisabledCharacterPaletteMenuItem', 'boolean', true);
  }

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
