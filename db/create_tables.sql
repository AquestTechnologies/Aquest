------------
-- SCHEMA --
------------
DROP SCHEMA IF EXISTS aquest_schema CASCADE;
CREATE SCHEMA aquest_schema;
ALTER SCHEMA aquest_schema OWNER TO admin;
ALTER DATABASE aquestdb SET search_path='"$user", public, aquest_schema';


-----------------
-- PRIVILEDGES --
-----------------
GRANT ALL ON ALL TABLES IN SCHEMA aquest_schema TO admin WITH GRANT OPTION;
GRANT SELECT, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA aquest_schema TO users;

GRANT USAGE ON SCHEMA aquest_schema TO users;

ALTER DEFAULT PRIVILEGES IN SCHEMA aquest_schema 
GRANT SELECT, REFERENCES, INSERT ON TABLES TO users;

ALTER DEFAULT PRIVILEGES IN SCHEMA aquest_schema
GRANT ALL ON TABLES TO admin WITH GRANT OPTION;

ALTER DEFAULT PRIVILEGES IN SCHEMA aquest_schema
GRANT SELECT, UPDATE ON SEQUENCES TO users;

ALTER DEFAULT PRIVILEGES IN SCHEMA aquest_schema
GRANT ALL ON FUNCTIONS TO admin WITH GRANT OPTION;

ALTER DEFAULT PRIVILEGES IN SCHEMA aquest_schema
GRANT USAGE ON TYPES TO users;


------------
-- TABLES --
------------
CREATE TABLE aquest_schema.USER (
  id                  TEXT PRIMARY KEY,
  email               TEXT NOT NULL UNIQUE,
  password_hash       TEXT NOT NULL,
  creation_ip         INET NOT NULL,
  first_name          TEXT DEFAULT '',
  last_name           TEXT DEFAULT '',
  picture             TEXT DEFAULT '',
  bio                 TEXT DEFAULT '',
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE aquest_schema.CHAT(
  id                  BIGSERIAL PRIMARY KEY,
  name                TEXT NOT NULL,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE aquest_schema.UNIVERSE(
  id                  TEXT PRIMARY KEY,
  chat_id             BIGINT NOT NULL UNIQUE,
  user_id             TEXT NOT NULL,
  creation_ip         INET NOT NULL,
  name                TEXT NOT NULL,
  picture             TEXT NOT NULL,
  description         TEXT DEFAULT '',
  rules               TEXT DEFAULT '',
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (chat_id) REFERENCES aquest_schema.CHAT(id),
  FOREIGN KEY (user_id) REFERENCES aquest_schema.USER(id)
);

CREATE TABLE aquest_schema.UNIVERSE_UNIVERSE(
  id                  BIGSERIAL PRIMARY KEY,
  universe1_id        TEXT NOT NULL,
  universe2_id        TEXT NOT NULL,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (universe1_id) REFERENCES aquest_schema.UNIVERSE(id),
  FOREIGN KEY (universe2_id) REFERENCES aquest_schema.UNIVERSE(id)
);

CREATE TABLE aquest_schema.TOPIC(
  id                  TEXT PRIMARY KEY,
  user_id             TEXT NOT NULL,
  chat_id             BIGINT NOT NULL UNIQUE,
  universe_id         TEXT NOT NULL,
  title               TEXT NOT NULL,
  preview_type        TEXT NOT NULL,
  preview_content     JSON NOT NULL,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES aquest_schema.USER(id),
  FOREIGN KEY (universe_id) REFERENCES aquest_schema.UNIVERSE(id),
  FOREIGN KEY (chat_id) REFERENCES aquest_schema.CHAT(id)
);

CREATE TABLE aquest_schema.ATOMTOPIC(
  id                  BIGSERIAL PRIMARY KEY,
  topic_id            TEXT NOT NULL,
  type                TEXT NOT NULL,
  content             JSON NOT NULL,
  position            INTEGER NOT NULL,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (topic_id) REFERENCES aquest_schema.TOPIC(id)
);

CREATE TABLE aquest_schema.ATOMMESSAGE(
  id                  BIGSERIAL PRIMARY KEY,
  chat_id             BIGINT NOT NULL,
  user_id             TEXT NOT NULL,
  type                TEXT NOT NULL,
  content             JSON NOT NULL,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (chat_id) REFERENCES aquest_schema.CHAT(id),
  FOREIGN KEY (user_id) REFERENCES aquest_schema.USER(id)
);

CREATE TABLE aquest_schema.FILE(
  id                  BIGSERIAL PRIMARY KEY,
  user_id             TEXT NOT NULL,
  name                TEXT NOT NULL,
  url                 TEXT NOT NULL,
  creation_ip         INET NOT NULL,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- CREATE TABLE aquest_schema.RANK(
--   id                  BIGSERIAL PRIMARY KEY,
--   universe_id         TEXT NOT NULL,
--   title               TEXT NOT NULL,
--   level               SMALLINT NOT NULL,
--   created_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
--   updated_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
--   FOREIGN KEY (universe_id) REFERENCES aquest_schema.UNIVERSE(id)
-- );

CREATE TABLE aquest_schema.BALLOT(
  id                  BIGSERIAL PRIMARY KEY,
  content             TEXT NOT NULL,
  value               INTEGER NOT NULL,
  deleted             BOOLEAN
);

CREATE TABLE aquest_schema.BALLOT_UNIVERSE(
  id                  BIGSERIAL PRIMARY KEY,
  universe_id         TEXT NOT NULL,
  ballot_id           BIGINT NOT NULL,
  user_id             TEXT,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted             BOOLEAN,
  FOREIGN KEY (user_id) REFERENCES aquest_schema.USER(id),
  FOREIGN KEY (universe_id) REFERENCES aquest_schema.UNIVERSE(id),
  FOREIGN KEY (ballot_id) REFERENCES aquest_schema.BALLOT(id)
);

CREATE TABLE aquest_schema.BALLOT_MESSAGE(
  id                  BIGSERIAL PRIMARY KEY,
  author_id           TEXT NOT NULL,
  user_id             TEXT NOT NULL, 
  universe_id         TEXT NOT NULL,
  message_id          BIGINT NOT NULL,
  ballot_id           BIGINT NOT NULL,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (author_id) REFERENCES aquest_schema.USER(id),
  FOREIGN KEY (user_id) REFERENCES aquest_schema.USER(id),
  FOREIGN KEY (universe_id) REFERENCES aquest_schema.UNIVERSE(id),
  FOREIGN KEY (message_id) REFERENCES aquest_schema.ATOMMESSAGE(id),
  FOREIGN KEY (ballot_id) REFERENCES aquest_schema.BALLOT(id)
);

CREATE TABLE aquest_schema.BALLOT_TOPIC(
  id                  BIGSERIAL PRIMARY KEY,
  author_id           TEXT NOT NULL,
  user_id             TEXT NOT NULL, 
  universe_id         TEXT NOT NULL,
  topic_id            TEXT NOT NULL,
  ballot_id           BIGINT NOT NULL,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted             BOOLEAN,
  FOREIGN KEY (author_id) REFERENCES aquest_schema.USER(id),
  FOREIGN KEY (user_id) REFERENCES aquest_schema.USER(id),
  FOREIGN KEY (universe_id) REFERENCES aquest_schema.UNIVERSE(id),
  FOREIGN KEY (topic_id) REFERENCES aquest_schema.TOPIC(id),
  FOREIGN KEY (ballot_id) REFERENCES aquest_schema.BALLOT(id)
);

-- CREATE TABLE aquest_schema.GOALS(
--   id                  BIGSERIAL PRIMARY KEY,
--   rank_id             BIGINT NOT NULL,
--   content             JSON,
--   created_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
--   updated_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
--   FOREIGN KEY (rank_id) REFERENCES aquest_schema.RANK
-- );

-- CREATE TABLE aquest_schema.USER_UNIVERSE(
--   id                  BIGSERIAL PRIMARY KEY,
--   user_id             TEXT NOT NULL,
--   universe_id         TEXT NOT NULL,
--   created_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
--   updated_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
--   start_universe      BOOLEAN,
--   FOREIGN KEY (user_id) REFERENCES aquest_schema.USER(id),
--   FOREIGN KEY (universe_id) REFERENCES aquest_schema.UNIVERSE(id)
-- );

-- CREATE TABLE aquest_schema.ATOM(
--   id                  BIGSERIAL PRIMARY KEY,
--   type                TEXT NOT NULL,
--   structure           JSON,
--   created_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
--   updated_at          TIMESTAMP WITH TIME ZONE DEFAULT now()
-- );


-------------------------------------------------------------
-- TRIGGER : ID AND CHAT GENERATION FOR UNIVERSE AND TOPIC --
-------------------------------------------------------------
CREATE FUNCTION aquest_schema.prepare_insert() 
  RETURNS TRIGGER AS $prepare_insert$
  DECLARE
    new_id TEXT;
    same_id TEXT;
    new_chat_id BIGINT;
  BEGIN
    -- Universe
    IF (TG_TABLE_NAME = 'universe') THEN
      new_id := replace(trim(both ' ' from NEW.name), ' ', '_');
      same_id := (SELECT id FROM aquest_schema.universe WHERE universe.id = new_id);
      INSERT INTO aquest_schema.chat (name) VALUES (NEW.name) RETURNING id INTO new_chat_id;
    -- Topic
    ELSIF (TG_TABLE_NAME = 'topic') THEN
      new_id := replace(trim(both ' ' from NEW.title), ' ', '_');
      same_id := (SELECT id FROM aquest_schema.topic WHERE topic.id = new_id ORDER BY id DESC);
      INSERT INTO aquest_schema.chat (name) VALUES (NEW.title) RETURNING id INTO new_chat_id;
    END IF;
    
    IF (same_id <> '') THEN
      new_id := concat(new_id, '_', left(md5(random()::text), 7));
    END IF;
    
    NEW.chat_id := new_chat_id;
    NEW.id := new_id;
    RETURN NEW;
  END;
$prepare_insert$ LANGUAGE plpgsql;

-- Universe
CREATE TRIGGER prepare_insert
  BEFORE INSERT ON aquest_schema.universe
  FOR EACH ROW EXECUTE PROCEDURE aquest_schema.prepare_insert();
-- Topic
CREATE TRIGGER prepare_insert
  BEFORE INSERT ON aquest_schema.topic
  FOR EACH ROW EXECUTE PROCEDURE aquest_schema.prepare_insert();
  
------------------------------------------------------------
-- TRIGGER : DEFAULT BALLOT VALUE GENERATION FOR UNIVERSE --
------------------------------------------------------------
CREATE FUNCTION aquest_schema.prepare_ballot() 
  RETURNS TRIGGER AS $prepare_ballot$
  DECLARE
    ballot_id BIGINT;
  BEGIN
    INSERT INTO aquest_schema.ballot (content, value) VALUES (NEW.id, 1) RETURNING id INTO ballot_id;
    INSERT INTO aquest_schema.ballot_universe (universe_id, ballot_id) VALUES (NEW.id, ballot_id);
    INSERT INTO aquest_schema.ballot_universe (universe_id, ballot_id) VALUES (NEW.id, 1);
    INSERT INTO aquest_schema.ballot_universe (universe_id, ballot_id) VALUES (NEW.id, 2);
    INSERT INTO aquest_schema.ballot_universe (universe_id, ballot_id) VALUES (NEW.id, 3);
    INSERT INTO aquest_schema.ballot_universe (universe_id, ballot_id) VALUES (NEW.id, 4);
    INSERT INTO aquest_schema.ballot_universe (universe_id, ballot_id) VALUES (NEW.id, 5);
    RETURN NEW;
  END;
$prepare_ballot$ LANGUAGE plpgsql;

----------------------
-- TRIGGER : BALLOT --
----------------------
-- ballot
CREATE TRIGGER prepare_ballot
  AFTER INSERT ON aquest_schema.universe
  FOR EACH ROW EXECUTE PROCEDURE aquest_schema.prepare_ballot();
--------------------------
-- TRIGGER : UPDATED_AT -- 
--------------------------
CREATE FUNCTION aquest_schema.set_updated_timestamp()
  RETURNS TRIGGER AS $set_updated_timestamp$
  BEGIN
    NEW.updated_at := now(); 
    RETURN NEW;
  END;
$set_updated_timestamp$ LANGUAGE plpgsql;

-- User
CREATE TRIGGER update_timestamp
  BEFORE UPDATE ON aquest_schema.user 
  FOR EACH ROW EXECUTE PROCEDURE aquest_schema.set_updated_timestamp();
-- Universe
CREATE TRIGGER update_timestamp
  BEFORE UPDATE ON aquest_schema.universe 
  FOR EACH ROW EXECUTE PROCEDURE aquest_schema.set_updated_timestamp();
-- Topic
CREATE TRIGGER update_timestamp
  BEFORE UPDATE ON aquest_schema.topic 
  FOR EACH ROW EXECUTE PROCEDURE aquest_schema.set_updated_timestamp();
-- Chat
CREATE TRIGGER update_timestamp
  BEFORE UPDATE ON aquest_schema.chat 
  FOR EACH ROW EXECUTE PROCEDURE aquest_schema.set_updated_timestamp();
-- Atomtopic
CREATE TRIGGER update_timestamp
  BEFORE UPDATE ON aquest_schema.atomtopic 
  FOR EACH ROW EXECUTE PROCEDURE aquest_schema.set_updated_timestamp();
-- AtomMessage
CREATE TRIGGER update_timestamp
  BEFORE UPDATE ON aquest_schema.atommessage
  FOR EACH ROW EXECUTE PROCEDURE aquest_schema.set_updated_timestamp();
-- File
CREATE TRIGGER update_timestamp
  BEFORE UPDATE ON aquest_schema.file
  FOR EACH ROW EXECUTE PROCEDURE aquest_schema.set_updated_timestamp();
-- ballot
CREATE TRIGGER update_timestamp
  BEFORE UPDATE ON aquest_schema.ballot
  FOR EACH ROW EXECUTE PROCEDURE aquest_schema.set_updated_timestamp();
  

----------------------------------------
-- FUNCTION : TOPIC w/ ATOMS CREATION --
----------------------------------------
-- automaticaly create topic and associated atoms 
CREATE OR REPLACE FUNCTION aquest_schema.create_topic(user_id TEXT, universe_id TEXT, title TEXT, preview_type TEXT, preview_content TEXT, atoms TEXT) 
  RETURNS JSON AS $$
  return plv8.subtransaction(function() {
  
    var parsedAtoms = JSON.parse(atoms);
    var parsedPreviewContent = JSON.parse(preview_content);
    
    var newTopic = plv8.execute( 
      'INSERT INTO aquest_schema.topic ' +
        '(user_id, universe_id, title, preview_type, preview_content) ' +
      'VALUES ' +
        '($1, $2, $3, $4, $5) ' + 
      'RETURNING topic.id AS "id", topic.chat_id AS "chatId", topic.created_at as "createdAt"',
      [user_id, universe_id, title, preview_type, parsedPreviewContent]
    )[0];
    
    var topicId = newTopic.id;
    
    parsedAtoms.forEach(function(atom, index) {
      plv8.execute( 
        'INSERT INTO aquest_schema.atomtopic ' +
          '(topic_id, type, content, position) ' +
        'VALUES ' + 
          '($1, $2, $3, $4)',
        [topicId, atom['type'], atom.content, index] 
      );  
    });
    
    return {
      id: topicId, 
      userId: user_id, 
      universeId: universe_id, 
      chatId: newTopic.chatId, 
      title: title, 
      atoms: parsedAtoms,
      previewType: preview_type,
      previewContent: parsedPreviewContent,
      createdAt: newTopic.createdAt,
    };
  });
$$ LANGUAGE plv8;


----------------
-- JSON UTILS --
----------------
-- Concats an array of JSON object into JSON properties  
CREATE OR REPLACE FUNCTION aquest_schema.concat_json_array(json_array JSON)
RETURNS JSON AS $$
  var o = {};
  for (var i = 0, json_array_length = json_array.length ; i < json_array_length ; i++) {
    for (var key in json_array[i]) {
      if (json_array[i].hasOwnProperty(key)) o[key] = json_array[i][key];
    }
  }
  return o;
$$ LANGUAGE plv8 IMMUTABLE STRICT;

-- Concats two JSON objects in one JSON object
CREATE OR REPLACE FUNCTION aquest_schema.concat_json_object(obj1 JSON, obj2 JSON)
RETURNS JSON AS $$
	var o = {};
	for (var key in obj1) {
		if (obj1.hasOwnProperty(key)) o[key] = obj1[key];
	}
	for (var key in obj2) {
		if (obj1.hasOwnProperty(key)) o[key] = obj2[key];
	}
  return o;
$$ LANGUAGE plv8 IMMUTABLE STRICT;

-- DEFINE INITIALE BALLOTS
INSERT INTO aquest_schema.ballot (content, value) VALUES ('Thanks', 1);
INSERT INTO aquest_schema.ballot (content, value) VALUES ('Agree', 1);
INSERT INTO aquest_schema.ballot (content, value) VALUES ('Disagree', 0);
INSERT INTO aquest_schema.ballot (content, value) VALUES ('Irrelevant', -1);
INSERT INTO aquest_schema.ballot (content, value) VALUES ('Shocking', -10);

-------------------------
-- MOCK DATA INSERTION --
-------------------------

INSERT INTO aquest_schema.user (email, id, first_name, last_name, password_hash, creation_ip) 
  VALUES ('admin@aquest.tech', 'admin', 'Aquest', 'Technologies', '$2a$10$m3jpaE2uelYFzoPTu/fG/eU5rTkmL0d8ph.eF3uQrdQE46UbhhpdW', '192.168.0.1');

INSERT INTO aquest_schema.universe (name, user_id, description, picture, creation_ip) 
  VALUES ('Test', 'admin', 'Make some, fail some, love some.', 'http://d2ifokkknaunnx.cloudfront.net/pillars.png', '192.168.0.1');
