FROM node:20-alpine

VOLUME ["/app", "/pocket"]

RUN apk add --no-cache cargo openssl-dev

RUN cargo install monolith

RUN addgroup -g 1000 user \
    && adduser -u 1000 -G user -s /bin/sh -D user

RUN mkdir /app \
    && mkdir /pocket \
    && chown user /pocket

USER user

WORKDIR "/app"

RUN npm i

CMD ["npm", "start"]
