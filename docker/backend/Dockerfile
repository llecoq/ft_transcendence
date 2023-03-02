FROM		alpine:3.14

RUN			apk update
RUN			apk upgrade

#==== NODEJS ==================================================================#
RUN			apk add --update git nodejs-current npm
RUN			mkdir -p /var/www/html/backend
VOLUME		["/var/www/html/backend"]

EXPOSE		8080

WORKDIR 	/var/www/html/backend
ENTRYPOINT	["./entrypoint.sh"]
