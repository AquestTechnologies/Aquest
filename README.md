# Aquest alpha

Aquest Technologies © 2015

*Rock'n'Roll*

## A faire

- [ ] Migrer vers rethinkdb
- [ ] Appliquer les nouvelles betas
- [ ] Appliquer convention nommage fichiers
- [ ] Contenariser sur ECS
- [ ] Deployer en prod + integration continue
- [ ] Optimiser le code actuel
- [ ] Ajouter de nouvelles fonctionnalités

## En manque d'idées ?

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

## Liens utiles :
- [Hapi](http://hapijs.com/api)
- [Redux](https://github.com/gaearon/redux)
- [Emoji](http://www.emoji-cheat-sheet.com)

## Convention de nommage des log :
| Préfixe | Signification |
| :-----: | :------------ |
| !!! | erreur *(jamais comme raison d'un Promise.reject)* |
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

## Schemas

All schemas include a unique **id** and **createdAt** and **updatedAt** timestamps corresponding to Date.prototype.getTime.

### Users

| key | Type | Constraints | Unique | Mandatory |
|-----|------|-------------|--------|-----------|
|pseudo|string|min 1, max 15|✓|✓|
|email|string|email|✓|✓|
|passwordHash|string|||✓|
|creationIp|string|ip||✓|
|fullName|string|min 1, max 30|||
|description|string|min 1, max 200|||
|imageId|id||✓|✓|

### Universes

| key | Type | Constraints | Unique | Mandatory |
|-----|------|-------------|--------|-----------|
|handle|string|min 1, max 30|✓|✓|
|name|string|min 1, max 30|✓|✓|
|creationIp|string|ip||✓|
|description|string|max 200|||
|rules|string|max 200|||
|userId|id|||✓|
|imageId|id|||✓|
|relatedUniverses|array of ids||||
|relatedBallots|array of ids||||

### Chats

| key | Type | Constraints | Unique | Mandatory |
|-----|------|-------------|--------|-----------|
|name|string|min 1, max 30||✓|
|chattableId|id||✓|✓|

### Messages

| key | Type | Constraints | Unique | Mandatory |
|-----|------|-------------|--------|-----------|
|atom|atom|||✓|
|chatId|id||✓|✓|
|userId|id||✓|✓|

### Topics

| key | Type | Constraints | Unique | Mandatory |
|-----|------|-------------|--------|-----------|
|handle|string|min 1, max 30|✓|✓|
|title|string|min 1, max 100||✓|
|previewAtom|atom|||✓|
|atoms|array of atoms|||✓|
|creationIp|string|ip||✓|
|userId|id|||✓|
|universeId|id|||✓|

### Ballots

| key | Type | Constraints | Unique | Mandatory |
|-----|------|-------------|--------|-----------|
|content|string||✓|✓|
|value|integer|||✓|
|description|string|min 1, max 50|||
|userId|id|||✓|

### Votes

| key | Type | Constraints | Unique | Mandatory |
|-----|------|-------------|--------|-----------|
|ballotId|id|||✓|
|voterId|id|||✓|
|voteeId|id|||✓|
|universeId|id|||✓|
|votableId|id|||✓|

### Images

| key | Type | Constraints | Unique | Mandatory |
|-----|------|-------------|--------|-----------|
|name|string|||✓|
|url|string|url from CDN|✓|✓|
|creationIp|string|ip||✓|
|userId|id|||✓|
