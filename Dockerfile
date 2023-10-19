FROM node:20-alpine

VOLUME ["/app", "/pocket"]

RUN apk add --no-cache cargo openssl-dev

RUN cargo install monolith

ENV PATH "$PATH:/root/.cargo/bin"

# RUN
 # mkdir /app \
    # && mkdir /pocket \
    # && chown user /pocket

RUN set -ex; \
    apk add --no-cache shadow; \
    # deluser www-data; \
    addgroup -g 33 -S git; \
    adduser -u 33 -D -S -G git git; \
    chown git:git -R /pocket;

# RUN addgroup -g 1000 user \
    # && adduser -u 1000 -G user -s /bin/sh -D user
# USER user

WORKDIR "/app"

# RUN npm i

ENTRYPOINT ["./entrypoint.sh"]
# CMD ["npm", "start"]
# CMD ["tail", "-f", "/bin/sh"]
