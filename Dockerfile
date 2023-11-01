FROM node:20-alpine

VOLUME ["/app", "/pocket"]

RUN apk add --no-cache cargo openssl-dev

RUN cargo install monolith

ENV PATH "$PATH:/root/.cargo/bin"

RUN set -ex; \
    apk add --no-cache shadow; \
    chown 1000:1000 -R /pocket;

USER 1000

WORKDIR "/app"

RUN npm i
CMD npm start

# ENTRYPOINT ["./entrypoint.sh"]