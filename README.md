# Kremen API

Set of different APIs based on Kremenchuk's open data.

## Init

Create `config.dev.json` and `config.prod.json` with configs:

```json
{
  "REDIS_HOST": "%host%",
  "REDIS_PORT": 5555,
  "REDIS_PASS": "%pass%"
}

```

Where:

- `REDIS_HOST / REDIS_PORT / REDIS_PASS` - redis credentials

## Invoke

```
sls invoke local -f transport --stage dev --data '{ "resource": "/transport/routes"}'
sls invoke local -f transport --stage dev --data '{ "resource": "/transport/buses"}'
sls invoke local -f transport --stage dev \
  --data '{ "resource": "/transport/find", "queryStringParameters": {"from": "49.060470,33.406315", "to": "49.084064,33.423749" }}'

sls invoke local -f cinemas --stage dev --data '{ "resource": "/cinemas"}'
```
