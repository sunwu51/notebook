const { app, BrowserWindow,ipcMain,webContents } = require('electron')

var m = {};

function createWindow (name) {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })
  m[name] = win.webContents.id;
  win.loadFile('index.html')
}

app.whenReady().then(()=>{
    createWindow('x1')
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.on('show',(e,cmd)=>{
    console.log(cmd)
    createCmdDetailsWindow(cmd);
})

function createCmdDetailsWindow(cmd){
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          nodeIntegration: true
        }
    })
    win.loadFile('cmd.html').then(_=>{
        win.webContents.send('cmd',cmd)
    })
}
