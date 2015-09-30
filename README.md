# Aquest alpha

Aquest Technologies © 2015

*Rock'n'Roll*

### En manque d'idées ?

- [ ] Pagination
- [ ] VALIDATIONS!!!
- [ ] Gérer formdata
- [ ] queryDb renvoie une erreur si il n'y a pas d'atomes pour createTopic
- [ ] Gérer les 400 et les 401 lors de login
- [ ] Rendre les atoms disabled quand `atomsShouldGetReady === true`
- [ ] Interdire les '/' et autres charactères spéciaux dans les titres de topics et les noms d'univers
- [ ] Sécurité: cookie en `http_only` (voir même `secure` en prod) et redis des utilisateurs connectés
- [ ] Mesurer le temps entre les actions request et success et l'afficher dans le log
- [ ] loading bar
- [ ] Supprimer tous les <br/>
- [ ] Proptypes pour tous les composants
- [ ] verifier les escapes du state ( < > ' " SQL)
- [ ] verifier les escapes du put ( < > ' " SQL)
- [ ] mettre en place RabbitMQ
- [ ] faire les liens Hapijs <-> webSocket <-> rabbitMQ <-> postgres 
- [ ] liens comme sur [ce site](http://hugogiraudel.com/2014/02/06/calc-css-riddle/)
- [ ] Boutons comme sur google dev
- [ ] responsive design
- [x] Interdire `null` ?
- [x] Passer les actions autrement
- [x] mettre en place un outil scrum, exemple : https://github.com/aliasaria/scrumblr
- [x] NextCSS
- [x] Implementer un fichier config (constantes, production, liens du bundle, etc...)
- [x] IsoFetch
- [x] Immutable ?
- [x] changer trucActions par trucsActions
- [x] Implementer Redux 1.0
- [x] Dans les requetes SQL : double quotes : remplace trucid par trucId
- [x] window.STATE\_FROM_SERVER
- [x] chalk --> https://github.com/sindresorhus/chalk
- [x] Correction logTailor

### Liens utiles :
- [Hapi](http://hapijs.com/api)
- [Redux](https://github.com/gaearon/redux)
- [Emoji](http://www.emoji-cheat-sheet.com)

### Convention de nommage des log :
| Préfixe | Signification |
| :-----: | :------------ |
| !!! | erreur |
| ... | App |
| .A. | ActionCreators |
| .R. | Reducers |
| .E. | Side Effects |
| .P. | Phidippides |
| .X. | Authentication |
| +++ | Fetchers |
| _w_ | Websocket |
| .C. | Composants React |
| -C- | Action de l'utilisateur dans composants React |

### Informations sur la base de données
- Groupe administrateur : admin, Utilisateur : aquest
- Groupe Utilisateur : users, Utilisateur : aquestuser
- Base de données : aquestdb

### Créer la base de données
- cd /home/aquest/createDB
- psql posgres < create_aquestdb.sql  (l'idéale serai un seul fichier, j'y travaille)
- psql aquestdb < create_tables.sql

### Visualiser les tables de la base de données
- psql aquestdb
- \dt aquest_schema.*

### INSTALL POSTGRESQL 9.4 AND PLV8

sudo apt-get update
sudo touch /etc/apt/sources.list.d/pgdg.list
echo "deb http://apt.postgresql.org/pub/repos/apt/ trusty-pgdg main" | sudo tee -a /etc/apt/sources.list.d/pgdg.list
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get install postgresql-9.4
sudo apt-get install postgresql-9.4-plv8
sudo useradd aquest
sudo passwd aquest
--> <password1 here>
--> <password1 here>
sudo mkdir /home/aquest
sudo chown aquest /home/aquest
sudo su postgres // sudo -u postgres psql postgres ne fonctionne pas
psql postgres
postgres=#CREATE ROLE aquest LOGIN PASSWORD '<password1 here>' SUPERUSER VALID UNTIL 'infinity';
postgres=#CREATE ROLE aquestuser LOGIN PASSWORD 'aquestuser' VALID UNTIL 'infinity';
postgres=#GRANT admin TO aquest;
postgres=#GRANT users TO aquestuser;
postgres=#\q
su aquest
--> <password1 here>
mkdir /home/createDataBase
vi createDataBase/create_dataBase.sql # insert conf
vi createDataBase/create_tables.sql # insert conf
psql postres < createDataBase/create_dataBase.sql
psql aquestdb
postgres=#CREATE EXTENSION plv8;
postgres=#\q
psql postres < createDataBase/create_tables.sql
sudo vi /etc/postgresql/9.4/main/pg_hba.conf 
--> host aquestdb aquestuser ip/32     md5
--> host all      all        0.0.0.0/0 md5
sudo vi /etc/postgresql/9.4/main/postgresql.conf 
--> listen_addresses = '*'
sudo /etc/init.d/postgresql restart
psql postgres 
postgres=#CREATE ROLE admin INHERIT;
postgres=#CREATE ROLE users INHERIT;
