FROM node:25-alpine3.23
LABEL authors="ljubomirvasic"

WORKDIR /app

COPY package.json ./

RUN npm install

COPY .env ./.env
COPY server ./server
COPY database ./database

EXPOSE 3000

# start the server
CMD sh -c "npm run start"

# Run the build with command: docker build -t flash-auction:1.0.0 .