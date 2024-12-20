FROM node:18 AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install -g @angular/cli && npm install
COPY . .
CMD ["ng", "serve", "--host", "0.0.0.0"] 