all: reload

stop:
	@ docker-compose -f docker-compose.yml down

clean: stop
	@ ./docker/clean.sh all
	
prune: clean
	@ docker system prune -f

reload: 
	@ docker-compose -f docker-compose.yml up --build

.PHONY: linux stop clean prune reload all