COMPOSE = docker compose -f ./docker-compose.yml

GREEN   = \033[0;32m
RED     = \033[0;31m
YELLOW  = \033[0;33m
RESET   = \033[0m

all:
	@echo "$(GREEN)Starting containers and building...$(RESET)"
	@$(COMPOSE) up --build

down:
	@echo "$(YELLOW)Shutting down containers...$(RESET)"
	@$(COMPOSE) down

clean:
	@echo "$(YELLOW)Stopping containers and cleaning dangling images...$(RESET)"
	@$(COMPOSE) down
	@docker image prune -f

fclean:
	@echo "$(RED)Deep cleaning: volumes, containers, networks and images...$(RESET)"
	@$(COMPOSE) down -v --rmi all
	@echo "$(GREEN)\nDocker clean state:$(RESET)"
	@docker ps -a
	@docker images

re: fclean all

.PHONY: all down clean fclean re
