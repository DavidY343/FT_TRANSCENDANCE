FROM node:22-alpine

WORKDIR /app

COPY package.json /app/package.json
COPY vite.config.js /app/vite.config.js
COPY index.html /app/index.html
COPY public /app/public
COPY src /app/src

RUN npm install
RUN npm run build
RUN npm install -g serve

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
