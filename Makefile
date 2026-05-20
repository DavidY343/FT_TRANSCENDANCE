all:
	@echo "Starting..."
	@docker compose -f ./docker-compose.yml up --build

down:
	@echo "Shutting down..."
	@docker compose -f ./docker-compose.yml down

fclean:
	@echo "Cleaning volumes, containers and images"
	@docker compose -f ./docker-compose.yml down -v
	@docker rmi -f backend:latest
	@docker rmi -f frontend:latest
	@docker rmi -f nginx:latest
	@docker rmi -f postgres:16-alpine
	@docker images
	@docker ps -a

re: fclean all
