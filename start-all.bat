@echo off
:: Start demo data generator
start cmd /k "cd tests && node demoBackyardUltra.js"

:: Start backend server
start cmd /k "cd backend && node server.js"

:: Start frontend (Vite)
start cmd /k "cd frontend && npm run dev"

echo All services started.
pause