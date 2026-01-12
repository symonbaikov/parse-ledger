# Prometheus + Grafana в Railway (staging) для `parse-ledger`

Этот документ описывает, как поднять Prometheus в Railway (в staging окружении), собирать метрики с бэкенда и подключить Grafana с готовым datasource и дашбордом из репозитория.

## Что уже есть в проекте

- Метрики бэкенда доступны по `GET /api/v1/metrics` (Prometheus format).
- Есть локальный стек наблюдаемости: `docker-compose.observability.yml`.
- Есть provisioning Grafana и дашборд:
  - `observability/grafana/provisioning/datasources/datasources.yml`
  - `observability/grafana/provisioning/dashboards/dashboards.yml`
  - `observability/grafana/dashboards/finflow-backend-http.json`

## Вариант A (рекомендуемый для Railway staging): 2 отдельных Railway services

Схема:
1) `parse-ledger` (основной сервис: frontend+backend)
2) `prometheus` (отдельный сервис)
3) `grafana` (отдельный сервис)

### 1) Подготовь окружение staging в Railway

- Railway → Project → Environments → создай `staging`.
- Убедись, что `staging` деплоится из нужной ветки (например `staging`).

### 2) Проверь, что метрики доступны изнутри проекта

Метрики у нас публичные только при отсутствии токена. Если хочешь закрыть метрики токеном:
- в сервисе `parse-ledger` добавь переменную `METRICS_AUTH_TOKEN=<random>`
- тогда Prometheus должен слать заголовок `Authorization: Bearer <token>` (см. раздел ниже)

Без токена можно оставить как есть, но в staging лучше закрыть.

### 3) Создай сервис `prometheus` в Railway

1) Railway → Add Service → New Service → Deploy from repo.
2) Root directory: используй Dockerfile `observability/prometheus/Dockerfile`.
3) Добавь переменные окружения для `prometheus`:
   - `BACKEND_METRICS_TARGET` — внутренний адрес бэкенда + порт API.

Как выбрать `BACKEND_METRICS_TARGET`:
- Если у основного сервиса внутренний порт API — это `API_PORT` (по умолчанию `4000`), то target обычно будет `<service-name>:4000`.
- В Railway названия/внутренние домены зависят от проекта. Проще всего:
  - открыть Railway variables основного сервиса и найти `RAILWAY_PRIVATE_DOMAIN` (если доступно),
  - тогда `BACKEND_METRICS_TARGET="${RAILWAY_PRIVATE_DOMAIN}:<API_PORT>"`.

Prometheus конфиг для Railway лежит в `observability/prometheus.railway.yml` и использует `--config.expand-env`.

#### (Опционально) Скрейп с токеном

Если включишь `METRICS_AUTH_TOKEN` на бэкенде, то добавь в `observability/prometheus.railway.yml` блок `authorization`/`bearer_token` нельзя напрямую (Prometheus ожидает файл). Практичный вариант — оставить метрики доступными только по private сети:
- не публиковать `prometheus` наружу (без public domain),
- а бэкенд метрики не выставлять на public ingress (они всё равно находятся под `/api/v1`, но Prometheus ходит по private адресу).

### 4) Создай сервис `grafana` в Railway

1) Railway → Add Service → New Service → Deploy from repo.
2) Root directory: `observability/grafana/Dockerfile`.
3) Добавь переменные окружения:
   - `GF_SECURITY_ADMIN_USER=admin`
   - `GF_SECURITY_ADMIN_PASSWORD=<strong-password>`
   - `GF_USERS_ALLOW_SIGN_UP=false`

Provisioning уже настроен так, чтобы datasource смотрел на `http://prometheus:9090`.
Важно: сервис Prometheus в Railway должен называться `prometheus` (или поправь URL в `observability/grafana/provisioning/datasources/datasources.yml`).

### 5) Персистентность (чтобы не терять данные)

Если в Railway включены Volumes:
- для `prometheus` примонтируй volume к `/prometheus`
- для `grafana` примонтируй volume к `/var/lib/grafana`

Без volume всё будет работать, но метрики/настройки дашбордов потеряются при пересоздании контейнера.

### 6) Доступ к Grafana

- Открой public domain для `grafana` в Railway.
- Зайди по URL, логин/пароль из `GF_SECURITY_ADMIN_*`.
- Открой дашборд в папке `FinFlow` (он должен появиться автоматически из provisioning).

## Вариант B: Grafana Cloud (если не хочется держать Prometheus/Grafana в Railway)

Если staging должен быть “лёгким”, проще:
- использовать Grafana Cloud (Grafana + Hosted Prometheus),
- поднять agent/collector (например Grafana Agent/Alloy) в Railway,
- отправлять метрики в облако.

Плюсы: меньше сервисов, меньше забот про диски/обновления. Минусы: внешняя зависимость и стоимость.

## Troubleshooting

- Prometheus “target down”: проверь `BACKEND_METRICS_TARGET` и что бэкенд слушает на `API_PORT` внутри контейнера.
- В Grafana нет datasource: проверь имя сервиса Prometheus и URL в `observability/grafana/provisioning/datasources/datasources.yml`.
- `/api/v1/metrics` отдаёт 401/403: проверь `METRICS_AUTH_TOKEN` и стратегию доступа (лучше private-only).

