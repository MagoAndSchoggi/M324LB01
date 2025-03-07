FROM node:22.14

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run lint && npm run test && npm run build

EXPOSE 3000

CMD [ "npm", "run", "start" ]