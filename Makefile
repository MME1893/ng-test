dev:
	docker compose -f docker-compose.dev.yml up -d

dev-build:
	docker compose -f docker-compose.dev.yml up --build -d

dev-down:
	docker compose -f docker-compose.dev.yml down

prod:
	docker compose up -d

prod-build:
	docker compose up --build -d

prod-down:
	docker compose down