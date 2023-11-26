## Installation lokalt

1. Installera git - https://git-scm.com/download/win
   - Installera Git LFS - https://git-lfs.com/
2. Installera ffmpeg - https://phoenixnap.com/kb/ffmpeg-windows
3. Installera node - https://nodejs.org/download/release/v18.18.2/node-v18.18.2-x64.msi
4. Ladda hem projektet
   - Öppna git bash
   - git clone https://github.com/oliwen/flygandeveteraner.git
   - cd flygandeveteraner/backend && npm install && cd ..

## Konfigurera filmer

1. Lägg mp4-filmer i videos-mappen i root-mappen
2. Uppdatera `config.json` i root-mappen
3. Kör `sh prepare.sh`
4. Kopiera över backend-mapp till motsvarande plats på Raspberry pi

## Starta på Raspberry Pi

1. Se till att `prepare.sh` är kört
2. Kör `startPlayer`/`sh start.sh` på Raspberry pi
