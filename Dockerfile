FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json ./
COPY scripts-setup/package.json scripts-setup/package.json
COPY scripts-connect/package.json scripts-connect/package.json

RUN npm ci

COPY . .

