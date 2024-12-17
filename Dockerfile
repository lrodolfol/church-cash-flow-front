FROM node:20 AS build-stage
WORKDIR /app
COPY . .
RUN npm install
RUN npm install @angular/cli -g

EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0"]
