FROM node:18

WORKDIR /app

WORKDIR /user/src/app

COPY package*.json ./

RUN rm -f package-lock.json
RUN npm install

COPY . . 

EXPOSE 3002

CMD ["npm", "start"]


