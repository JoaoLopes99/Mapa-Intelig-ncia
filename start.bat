@echo off
echo Iniciando o servidor de backend...
cd server
start "Backend Server" cmd /k "node dist/server.js"
cd ..
echo Iniciando o servidor de frontend...
start "Frontend Server" cmd /k "npm run dev"
echo.
echo Ambos os servidores foram iniciados!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
pause 