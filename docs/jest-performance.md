Оптимизация Jest тестов и потребления памяти (Nest + TypeScript)
1. Ограничить количество воркеров
По умолчанию Jest запускает воркеров = количеству CPU. На M-чипах это много.

 

Рекомендации:

--maxWorkers=50%

--maxWorkers=2

Для e2e/интеграционных: --runInBand.

Результат: тесты становятся чуть медленнее, но без бешеного расхода RAM.

2. Разделить unit и e2e тесты
Ошибка — один конфиг на всё.

Unit используют воркеры, e2e работают в один поток.

Пример: jest.unit.config.js и jest.e2e.config.js.

3. Убрать ts-jest на больших проектах
ts-jest удобный, но прожорливый.

Опции: swc-jest или предсборка + jest.

4. Включить кэш Jest
--cache значительно экономит время и память.

5. Не поднимать Nest App в beforeEach
beforeEach создаёт много DI-контейнеров.

Правильно — использовать beforeAll и afterAll.

6. Закрывать ресурсы после тестов
DB, Redis, Kafka, HTTP агенты, Docker — всё должно закрываться.

Иначе память не освобождается.

7. Следить за supertest
Не держать keepAlive агентов глобально.

8. Не запускать e2e + unit в одном процессе
В CI лучше запускать по отдельности.

9. Настроить testEnvironment
Для Nest: testEnvironment=node.

10. Не тестировать DI тяжело
Unit не должен поднимать NestFactory.

11. Docker Desktop
Держит 2–6GB RAM просто так.

Если не нужен — выключить.

12. VS Code и TS Server
При тестах TS Server может есть 2–4GB.

Совет: exclude большие директории, закрывать лишние окна, запускать jest через терминал.

13. Примеры конфигов
e2e:

maxWorkers=1, runInBand, cache=true

 

unit:

maxWorkers=50%, cache=true, swc.

14. reuse TestingModule
createTestingModule в beforeAll, а не beforeEach.

15. Линейный запуск в CI
Слабые агенты падают при большом параллелизме.

16. e2e + база
Лучшее: ephemeral DB или тестовая база.

Худшее: бить боевую.

17. Избегать watch
--watchAll на монорепах = +3–6GB RAM.

18. Unified Memory на M-чипах
GPU/Browser/VSCode тоже едят RAM.

24GB = реально ~18–20GB без свопа.

19. Декомпозиция монорепы
Nx/Turborepo/Jest по пакетам снижает нагрузку.

20. Чистка конфигов
Удалить jest-preview, jest-dom, babel, ts-jest если не нужны.