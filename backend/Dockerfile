FROM node:25-alpine3.23
LABEL authors="ljubomirvasic"

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package files first to leverage Docker layer caching
COPY package*.json ./

RUN npm ci


COPY .env ./.env
COPY server ./server
COPY database ./database

EXPOSE 3000

# start the server
CMD ["npm", "run", "start"]

# Run the build with command: `docker build -t flash-auction:1.0.0 .`