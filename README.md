# RS Mercher

A tool for runescape merching

## Installing

Make sure that you have both `node` and `npm` installed, as they're required to build/run this project.

You will also need a functioning MySQL database with the MySQLX plugin working, and a database like 
would be created by the [sister project](https://github.com/LandonDeam/osrspricedb) to this one.

```bash
# Clone the repository
git clone https://github.com/LandonDeam/rsmercher

# Change directory into the repo
cd rsmercher

# Install libraries
npm i
```

(Note: The "MYSQL_PORT" variable is the port of the MySQLX plugin, not your server as a whole)
Also make sure to include a .env file in the main directory of this project with the following parameters to connect to your MySQL server:

```.env
MYSQL_USERNAME=username
MYSQL_PASSWORD=password
MYSQL_PORT=33060
MYSQL_HOST=localhost
DB_NAME=osrs_market
```

## Developing

Once you've installed all of the dependencies, you can start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of the app:

```bash
npm run build
```

## Running

You can preview the production build with `npm run preview`. Otherwise, you can run the production build with:

```bash
node build
```

Or if you prefer to simply have a dev server, as discussed earlier, simply use:

```bash
npm run dev
```