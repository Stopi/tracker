# What is it?

This is a generic tracker to help me monitor a ton of things.  
I primarily use this tool on my own computer, not online (yet!)

Right now, it's only capable to track **TV Shows**.

<u>Don't ask me to add features</u>, this is a personal project I code on my (almost inexistant) free time.  
I have no commitment to any roadmap, nor any schedule.

If you need some changes: the project is under GPL-3, feel free to fork it.

# Features
- user authentification
- responsive interface
- TV show management:
  - search for any show and add it to the DB
  - find all episodes (by season) for each show
  - add specific user flags to each episode (up to 8 flags)
    - example of flags: "Seen", "Favorite", "Watch again", etc.
    - users can define their own label for each flag

# What's missing

Honestly a ton of features could be added, I only implement what I really need.  

Here's a few more ideas for the future:
- possibility to track other things than TV Shows.
- admin interface to manage users
- user settings should allow to change password
- show some cool stats

## ideas for TV Shows:
- color code to immediately see all episodes/seasons which are under one flag (e.g. "Seen")
- management of user's own collection
  - filepath
  - languages
  - subtitles
- saving images locally instead of getting them from TMDB (to allow offline consultation).
- allow deleting a show


# What could be improved (technically)

1. The DB wrapper on server side is sensible to **SQL injection**, but that's actually not an issue since it's only called by internal models, and all the data coming from the user is thoroughly filtered in the controllers.

2. The flag mechanism is a bit barebone, only checkboxes, and 8 hardcoded flags can be limiting. But since they are internal boolean in DB, they allow very **efficient query** to run for **stats**.

3. The current code works well in *my personnal case*, but if a public server were to deploy this code, it should seriously consider to implement a rate limiting feature for not **spaming the TMDB API**  
  <u>Note:</u> the code is already limiting requests for each user, but if lots of users are using it simultaneously, that can be a problem.

4. The show list could use some **pagination** mechanism in case it grows too large

5. Maybe I could add Document API with **OpenAPI/Swagger** (just for the fun).

6. Current project is meant to be used with **PostgreSQL**. Could be an idea to use an external lib like **drizzle** to support more DB.

7. Last but not least, server side could use **unit tests** and **more comments**.

# How to run this on your computer

## steps to build the app

### 1. get an API key from TMDB

1. sign-in https://www.themoviedb.org  
2. go to https://www.themoviedb.org/settings/api
3. create an API key
4. copy your key (32 chars long)

### 2. clone the repo
```shell
git clone https://github.com/Stopi/tracker
cd tracker
bun install
```

### 3. create the DB
As a PostgreSQL admin, create a database.
```sql
CREATE ROLE db_user WITH LOGIN PASSWORD 'db_pass';
CREATE DATABASE db_name OWNER db_user;
```
Replace the placeholders (db_user, db_pass, db_name).

#### opinionated note
I **HATE** when open source project expect you to run a script **as root** or when a script asks for your **db master password**.  
You'll have to do it manually.

You can also use a containerized db.

### 4. initialize the app
```shell
bun scripts/deploy.js
```
This script will help to initialize the server/.env and the DB.

### 5. create a user
```shell
bun scripts/add_user.js
```
This script will help to initialize the server/.env and the DB.

### 6. launch the app
```shell
bun run dev
```
By default, the server is on http://localhost:3000, while vite runs on 

### 7. tests
```shell
bun run test
bun run test:coverage   # <= generate code coverage
bun run test:report     # <= generate code coverage and open report in browser
```

## change the config
You can edit the .env files:

#### 1. `server/.env`
```
DATABASE_URL=postgresql://db_user:db_password@db_host:db_port/db_name
AUTH_SECRET=<secret_passphrase_for_redis___32_chars_minimum>
TMDB_API_KEY=<api_key_from_tmdb___32_chars>
CORS_ORIGIN=http://localhost:5173
```
CORS_ORIGIN should point to the frontend URL.

#### 2. `client/.env`
```
VITE_SERVER_URL=http://localhost:3000
```
VITE_SERVER_URL should point to the server URL.

## tech stack
The base is a [bhvr](https://github.com/stevedylandev/bhvr) stack.  
The user data is filtered with [Zod](https://github.com/colinhacks/zod).  
I use [shadcn/ui](https://github.com/shadcn-ui/ui) on frontend.  
The frontend test framework is [Vitest](https://github.com/vitest-dev/vitest).

For TV shows, the list of shows, seasons, episodes with all details and pictures are coming from [TMDB API](https://developer.themoviedb.org/docs/getting-started).