# #Kremen.Cinemas bot

Check webhook update:

```bash
BOT_WEBHOOK=dev && \
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"update_id":246644438, "message":{"message_id":76,"from":{"id":1801040},"chat":{"id":1801040},"date":1584270799,"text":"/start"}}' \
  "http://localhost:8084/cinemas/bot/$BOT_WEBHOOK"
```

Set webhook:

```bash
BOT_TOKEN=token && \
BOT_WEBHOOK=webhook && \
curl "https://api.telegram.org/bot$BOT_TOKEN/setWebhook?url=$BOT_WEBHOOK"
```
