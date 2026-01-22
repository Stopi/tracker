DROP TABLE IF EXISTS info;
CREATE TABLE info (
  key   text NOT NULL,
  value text,
  CONSTRAINT id_info PRIMARY KEY (key)
);
INSERT INTO info
VALUES ('db_migration_version', 1);

--

DROP TABLE IF EXISTS u;
CREATE TABLE u (
  id         BIGSERIAL NOT NULL,
  username   TEXT      NOT NULL,
  password   TEXT      NOT NULL,
  roles      TEXT    DEFAULT '',
  dark_theme BOOLEAN DEFAULT FALSE,
  flag_1 TEXT DEFAULT 'seen',
  flag_2 TEXT DEFAULT '',
  flag_3 TEXT DEFAULT '',
  flag_4 TEXT DEFAULT '',
  flag_5 TEXT DEFAULT '',
  flag_6 TEXT DEFAULT '',
  flag_7 TEXT DEFAULT '',
  flag_8 TEXT DEFAULT '',
  PRIMARY KEY (id),
  UNIQUE (username)
);


--

DROP TABLE IF EXISTS item;
CREATE TABLE item (
  id         BIGSERIAL NOT NULL,
  category   SMALLINT,
  child_id   BIGINT,
  created_on TIMESTAMP,
  PRIMARY KEY (id)
);

--

DROP TABLE IF EXISTS show;
CREATE TABLE show (
  id                  BIGSERIAL NOT NULL,
  tmdb_id             INT       NOT NULL,
  name                TEXT      NOT NULL,
  started             TEXT,
  ended               TEXT,
  status              TEXT,
  next_episode_to_air TEXT,
  nb_seasons          SMALLINT,
  nb_episodes         SMALLINT,
  origin_country      TEXT[],
  original_language   TEXT,
  original_name       TEXT,
  overview            TEXT,
  image               TEXT,
  archive             BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS episode;
CREATE TABLE episode (
  id         BIGSERIAL NOT NULL,
  tmdb_id    INT       NOT NULL,
  name       TEXT      NOT NULL,
  show_id    BIGINT,
  season_nb  SMALLINT,
  episode_nb SMALLINT,
  air_date   TIMESTAMP,
  image               TEXT,
  overview   TEXT      NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (show_id, season_nb, episode_nb)
);

DROP TABLE IF EXISTS u_show;
CREATE TABLE u_show (
  u_id    BIGINT,
  show_id BIGINT,
  archive BOOLEAN,
  PRIMARY KEY (u_id, show_id)
);

DROP TABLE IF EXISTS u_episode;
CREATE TABLE u_episode (
  u_id       BIGINT,
  episode_id BIGINT,
  flag_1     BOOLEAN DEFAULT FALSE,
  flag_2     BOOLEAN DEFAULT FALSE,
  flag_3     BOOLEAN DEFAULT FALSE,
  flag_4     BOOLEAN DEFAULT FALSE,
  flag_5     BOOLEAN DEFAULT FALSE,
  flag_6     BOOLEAN DEFAULT FALSE,
  flag_7     BOOLEAN DEFAULT FALSE,
  flag_8     BOOLEAN DEFAULT FALSE,
  language   TEXT,
  subtitles  TEXT,
  PRIMARY KEY (u_id, episode_id)
);
