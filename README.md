# erikocompanybackend
 Examensarbete

# Backend Server med Express, PHP, Google Sheets och MySQL

Detta är en backend-serverapplikation byggd med Express.js och PHP som integreras med Google Sheets och MySQL-databasen. Applikationen är utformad för att hantera dataflöden mellan Google Sheets, en MySQL-databas och en Node.js backend.

## Funktioner

- **Express.js Backend**: Servern körs med Node.js och Express.js för att hantera HTTP-förfrågningar och kommunicera med både MySQL och Google Sheets.
- **Google Sheets Integration**: Applikationen använder Google Sheets API för att läsa och skriva data från ett Google Sheets-dokument där podukterna hanteras.
- **MySQL Databas**: Applikationen lagrar data i en MySQL-databas för långsiktig lagring och effektiv åtkomst.

### Förutsättningar

Innan du börjar måste du se till att följande program är installerade:

- **Node.js och npm** (för att köra Express.js)
- **PHP** (för backendfunktioner som kräver PHP) variton php-8-4-1
- **MySQL** (för databaslagring)
- **Google Cloud Project** med aktiverad Google Sheets API och rätt autentisering (OAuth 2.0)

## Installationsguide
### Steg för installation

1. **Clone Repository**  
   Börja med att klona detta repository:
   ```bash
   git clone https://github.com/Erikli15/erikocompanybackend.git
   cd backend-server

2. **Installera NPM-paket "package.json"**
Installera alla nödvändiga paket med npm: bash npm install

3. **Installera PHP-beroenden "composer.json"**
Installera alla nödvändiga PHP-funktioner med Composer: bash composer install

4. **MySQL-databas**
Skapa databasen: CREATE DATABASE your_database_name;

5. **Google Sheets API**
    1. Gå till Google Cloud Console.
    2. Skapa ett nytt projekt.
    3. Aktivera Google Sheets API under "API & Services" > "Library"
    4. Skapa autentiseringsuppgifter för API:t (OAuth 2.0 eller en servicekonto-nyckel) och ladda ner JSON-filen för autentisering.
    5. Placera den nedladdade JSON-filen i rotmappen av ditt projekt.

6. **Konfigurera miljövariabler i .env**
1. Skapa en fil .env i rotmappen med följande innehåll:
#googleApi
`API_KEY`

#google sheet
`GOOGLE_AUTH_CONFIG`
`SPREADSHEET_ID`
`RANGE`

#mysql
`DB_SERVERNAME`
`DB_USERNAME`
`DB_PASSWORD`
`DB_DBNAME`

#Google loggin
`GOOGLE_CLIENT_ID`
`GOOGLE_CLIENT_SECRET`
`COOKIE_SECRET_KEY`

#klarna (för betalniings hantering)
`KLARNA_API_KEY`
`KLARNA_USERNAME`
`KLARNA_USER`
`klarna_client`

7. **Starta servern**
Starta servern med följande kommando: bash npm start