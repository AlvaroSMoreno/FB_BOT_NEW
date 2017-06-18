@echo off

:loop
cd C:\Users\ALVARO~1\Desktop\FB_BOT_NEW\files\ips
if exist ip_file.txt (del ip_file.txt)
if exist ip_temp.txt (del ip_temp.txt)
ping -n 7 192.168.1.253 > ip_temp.txt
find /i "Respuesta desde 192.168.1.253: bytes=32" ip_temp.txt > ip_file.txt
ping localhost -n 7 > nul
goto loop
