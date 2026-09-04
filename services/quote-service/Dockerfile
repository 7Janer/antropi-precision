FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY src ./src
ENV PORT=8083
EXPOSE 8083
CMD ["node", "src/index.js"]
