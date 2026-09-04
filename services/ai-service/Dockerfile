FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY src ./src
ENV PORT=8082
EXPOSE 8082
CMD ["node", "src/index.js"]
