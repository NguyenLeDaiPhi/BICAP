# Fix PowerShell Execution Policy Error

## Vấn đề
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded. 
The file is not digitally signed.
```

## Giải pháp

### Option 1: Chạy trực tiếp với Node (Khuyến nghị)
```powershell
cd clients/web-app/farm-management-web
node src/authentication.js
```

### Option 2: Dùng Batch File
```powershell
cd clients/web-app/farm-management-web
.\start-server.bat
```

### Option 3: Dùng PowerShell Script
```powershell
cd clients/web-app/farm-management-web
.\start-server.ps1
```

### Option 4: Bypass Execution Policy cho session hiện tại
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
npm start
```

### Option 5: Dùng CMD thay vì PowerShell
```cmd
cd clients\web-app\farm-management-web
npm start
```

## Khuyến nghị

**Cách đơn giản nhất:** Dùng `node src/authentication.js` thay vì `npm start`

```powershell
cd clients/web-app/farm-management-web
node src/authentication.js
```

Server sẽ chạy và bạn sẽ thấy:
```
Farm Management web app started on http://localhost:3002
```
