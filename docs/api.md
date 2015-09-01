
### Получение списков:
```
GET /whitelist/
GET /blacklist/
resp: {status: "ok" | "fail",
  result: [{id: /(\d+)/, site: String,}]}
```

### Добавить сайт:
```
POST /whitelist/
POST /blacklist/

body: {site: String}
resp: {status: "ok"| "fail", id: /(\d+)/}
```

### Удалить список:
```
DELETE /blacklist/
DELETE /whitelist/
resp: {status: "ok"| "fail"}
```
### Удалить сайт из списка:
```
DELETE /whitelist/{id}
DELETE /blacklist/{id}
resp: {status: "ok"| "fail"}
```
Строго говоря, может возникнуть так можно случайно не тот сайт удалить, но пока считаем, что юзер - один.

### Получить конфиг:
``` GET /config/ ```
`resp: {statys: "ok"| "fail", result: Object}`
пример и дефолтные значения Object смотри в config/config.js
