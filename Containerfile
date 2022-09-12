FROM node:16-alpine

ENV NODE_ENV=production

RUN apk --no-cache add ca-certificates

WORKDIR /app

CMD ["node", "index.js"]

COPY ./dist/ .

RUN chown -R node:node /app
