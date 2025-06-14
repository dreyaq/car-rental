# AutoRent - Система аренды автомобилей

Веб-приложение для аренды автомобилей с функциональностью для арендаторов и владельцев автомобилей.

## 🚗 Описание проекта

AutoRent - это полнофункциональная система управления арендой автомобилей, которая позволяет:
- **Арендаторам**: просматривать доступные автомобили, бронировать их и управлять своими арендами
- **Владельцам**: добавлять свои автомобили и управлять заявками на аренду

## 🛠 Технологический стек

### Backend
- **Go** - основной язык программирования
- **Gin** - веб-фреймворк
- **GORM** - ORM для работы с базой данных
- **PostgreSQL** - основная база данных
- **JWT** - аутентификация и авторизация
- **RabbitMQ** - очередь сообщений для уведомлений
- **Docker** - контейнеризация

### Frontend
- **HTML5/CSS3** - разметка и стилизация
- **Vanilla JavaScript** - логика клиентской части

### DevOps
- **Docker Compose** - оркестрация контейнеров

## 📋 Функциональность

### Для всех пользователей
- 🔐 Регистрация и авторизация
- 🚗 Просмотр каталога доступных автомобилей
- 🔍 Фильтрация автомобилей по марке, типу кузова и цене

### Для арендаторов
- 📝 Создание заявок на аренду
- 📅 Управление своими арендами
- 💰 Расчет стоимости аренды
- 🚗 Возможность аренды с водителем
- 📋 Просмотр деталей аренды
- ❌ Отмена заявок

### Для владельцев автомобилей
- ➕ Добавление автомобилей в систему
- ✏️ Редактирование информации об автомобилях
- 🗑️ Удаление автомобилей
- 📋 Управление заявками на аренду
- ✅ Подтверждение/отклонение заявок
- 🔄 Изменение статуса аренды
- 📊 Просмотр всех заявок

## 🚀 Быстрый старт

### Предварительные требования
- Docker и Docker Compose
- Git

### Установка и запуск

1. **Клонируйте репозиторий:**
```bash
git clone <repository-url>
cd coursework
```

2. **Запустите приложение:**
```bash
docker-compose up -d
```

3. **Откройте в браузере:**
```
http://localhost
```

### Тестовые учетные записи

После запуска вы можете зарегистрировать новые учетные записи или использовать тестовые данные.

## 📁 Структура проекта

```
coursework/
├── docker-compose.yml          # Конфигурация Docker Compose
├── backend/                    # Backend-приложение на Go
│   ├── main.go                # Точка входа
│   ├── api/                   
│   │   ├── controllers/       # Контроллеры HTTP-запросов
│   │   ├── middleware/        # Middleware для аутентификации
│   │   └── routes/           # Определение маршрутов
│   ├── config/               # Конфигурация БД и RabbitMQ
│   ├── models/               # Модели данных
│   ├── services/             # Бизнес-логика
│   └── utils/                # Утилиты (JWT, пароли)
├── frontend/                 # Frontend-приложение
│   ├── index.html           # Главная страница
│   ├── css/                 # Стили
│   └── js/                  # JavaScript-логика
└── docker/                  # Docker-конфигурации
    ├── backend.Dockerfile   
    ├── frontend.Dockerfile  
    ├── nginx.conf          
    └── init-db.sh          
```

## 🔧 API Endpoints

### Аутентификация
- `POST /api/register` - Регистрация пользователя
- `POST /api/login` - Вход в систему
- `POST /api/logout` - Выход из системы

### Автомобили
- `GET /api/cars` - Получить список автомобилей
- `GET /api/cars/:id` - Получить автомобиль по ID
- `POST /api/cars` - Создать автомобиль (только владельцы)
- `PUT /api/cars/:id` - Обновить автомобиль (только владельцы)
- `DELETE /api/cars/:id` - Удалить автомобиль (только владельцы)

### Аренда
- `GET /api/rentals` - Получить аренды пользователя
- `GET /api/rentals/:id` - Получить аренду по ID
- `POST /api/rentals` - Создать заявку на аренду
- `PATCH /api/rentals/:id/status` - Изменить статус аренды

## 🧪 Тестирование

### Backend тесты
```bash
cd backend
go test ./...
```

### Запуск тестов в Docker
```bash
docker-compose exec backend go test ./...
```

## 🐳 Docker-конфигурация

Приложение использует следующие сервисы:

- **backend** - Go-приложение (порт 8080)
- **frontend** - Nginx с статическими файлами (порт 80)
- **postgres** - База данных PostgreSQL (порт 5432)
- **rabbitmq** - Брокер сообщений (порты 5672, 15672)

## 🔒 Безопасность

- JWT-токены для аутентификации
- Хеширование паролей с использованием bcrypt
- Валидация данных на backend
- CORS-заголовки настроены для безопасности

## 📝 Использование

### Регистрация и вход
1. Откройте приложение в браузере
2. Нажмите "Регистрация"
3. Выберите роль (Арендатор или Владелец автомобилей)
4. Заполните форму и зарегистрируйтесь

### Для арендаторов
1. Войдите в систему как арендатор
2. Перейдите в раздел "Автомобили"
3. Выберите понравившийся автомобиль
4. Нажмите "Подробнее" и затем "Арендовать"
5. Заполните форму аренды
6. Отслеживайте статус в разделе "Мои аренды"

### Для владельцев
1. Войдите в систему как владелец
2. Перейдите в раздел "Мои автомобили"
3. Добавьте свои автомобили
4. Управляйте заявками в разделе "Мои аренды"
5. Подтверждайте или отклоняйте заявки

## 🔧 Разработка

### Требования для разработки
- Go 1.19+
- Node.js (для фронтенда, если нужна сборка)
- PostgreSQL
- RabbitMQ

### Запуск в режиме разработки

1. **Backend:**
```bash
cd backend
go mod download
go run main.go
```

2. **Frontend:**
Просто откройте `frontend/index.html` в браузере или используйте локальный сервер.

### Переменные окружения

Backend использует следующие переменные окружения:
- `DB_HOST` - хост базы данных
- `DB_PORT` - порт базы данных
- `DB_NAME` - имя базы данных
- `DB_USER` - пользователь БД
- `DB_PASSWORD` - пароль БД
- `JWT_SECRET` - секретный ключ для JWT
- `RABBITMQ_URL` - URL RabbitMQ

## 📄 Лицензия

Этот проект является учебным и предназначен для демонстрации навыков разработки.

---

**AutoRent** - современное решение для аренды автомобилей! 🚗✨
