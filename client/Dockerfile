# syntax=docker/dockerfile:1

FROM node

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
# ENV NODE_ENV=production
ENV CHOKIDAR_USEPOLLING=true
ENV WDS_SOCKET_HOST=192.168.0.199


COPY ["package.json", "package-lock.json*", "tsconfig.json", "tsconfig.tsbuildinfo", "./"]

RUN npm install
RUN npm install react-scripts

COPY . ./

CMD ["npm", "run", "local"]
# CMD ["react-scripts", "start"]
# npx tsc; PORT=3000 react-scripts start
