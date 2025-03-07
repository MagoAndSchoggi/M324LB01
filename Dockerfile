FROM node:22.14

WORKDIR /app

COPY package*.json .

RUN yarn install

COPY . .

RUN yarn lint && yarn test && yarn build

EXPOSE 3000

CMD [ "yarn", "start" ]
