# #Kremen.Cinemas bot

Check webhook update:

```bash
BOT_WEBHOOK=dev && \
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"update_id":246644438, "message":{"message_id":76,"from":{"id":1801040},"chat":{"id":1801040},"date":1584270799,"text":"/start"}}' \
  "http://localhost:8083/cinemas/bot/$BOT_WEBHOOK"
```

Set webhook:

```bash
BOT_TOKEN=token && \
BOT_WEBHOOK=webhook && \
curl "https://api.telegram.org/bot$BOT_TOKEN/setWebhook?url=$BOT_WEBHOOK"
```

## Messages

```markdown
Привіт 😊! Я збираю інформацію про сеанси фільмів в Кременчуці і можу відправляти вам розклад в зручному форматі. Я можу виконувати наступні команди:

/schedule - розклад сеансів
/help - допомога

Контакти: https://fb.me/snipter
```

```markdown
🔥"Шахрайки", "Покемон детектив Пікачу", "Черлідерки" вже у кіно! Переглянути розклад: /schedule
```

```markdown
Хвилинку...
Вибачте, але сервіс тимчасово недоступний 😕
```

```markdown
🍿 Люди в чорному: Інтернешнл

🎥 Галактика (2D/3D)
🕒 14:30, 16:45, 19:00, 21:20, 10:00, 12:15

🍿 Подорож хорошого пса

🎥 Галактика (2D)
🕒 14:25, 16:40, 18:55, 21:10

🍿 Рокетмен

🎥 Галактика (2D)
🕒 16:25, 18:45, 21:05, 10:05
...