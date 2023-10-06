FROM node:20-alpine

VOLUME ["/app", "/pocket"]

RUN apk add --no-cache cargo openssl-dev

RUN cargo install monolith

ENV PATH "$PATH:/root/.cargo/bin"

# RUN
 # mkdir /app \
    # && mkdir /pocket \
    # && chown user /pocket

# RUN addgroup -g 1000 user \
    # && adduser -u 1000 -G user -s /bin/sh -D user
# USER user

WORKDIR "/app"

# RUN npm i

ENTRYPOINT ["./entrypoint.sh"]
# CMD ["npm", "start"]
# CMD ["tail", "-f", "/bin/sh"]
