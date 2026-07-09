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

test:
	@echo "$(YELLOW)Verifying website availability...$(RESET)"
	@if curl -s -k --connect-timeout 2 https://127.0.0.1:8080 > /dev/null; then \
		echo "$(GREEN)Ready! Running tests...$(RESET)"; \
		npx playwright test; \
	else \
		echo "$(RED)Error: The website is down. Please run 'make' before running the tests.$(RESET)"; \
		exit 1; \
	fi

.PHONY: all down clean fclean re test
