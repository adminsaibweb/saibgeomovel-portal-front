FROM node:10.16.3

RUN mkdir -p /home/marketing/front && chown -R node:node /home/marketing/front

WORKDIR /home/marketing/front

COPY package*.json ./

RUN npm install

COPY . .

COPY --chown=node:node . .

USER node

EXPOSE 3000

CMD [ "npm", "run", "start" ]

#para criar 
#docker build -t juniorsaibweb/mkt-front .

#para inicializar
#docker run --name mkt-front -p 3000:3000 -d juniorsaibweb/mkt-front