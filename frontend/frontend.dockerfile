FROM node:16-alpine

COPY ./     /app/

WORKDIR /app

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "build"]