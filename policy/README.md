# Policy-as-Code (OPA/Rego)

Этот каталог содержит политики OPA/Rego, которые исполняются в CI через `conftest`.

Локальный запуск (пример):

```bash
docker run --rm -v "$PWD":/project -w /project openpolicyagent/conftest:v0.56.0 \
  test -p policy/docker-compose docker-compose.yml docker-compose.dev.yml docker-compose.observability.yml
```

