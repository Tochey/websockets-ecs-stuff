FROM --platform=linux/amd64 node:19

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY ./ .

EXPOSE 8085

CMD ["npm","start"]