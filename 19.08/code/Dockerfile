FROM sunwu51/pkg:8-alpine as bd
WORKDIR /code
COPY ./ /code
RUN npm install && npm run build

FROM mongo
WORKDIR /app
COPY --from=bd /code /app
RUN chmod +x /app/*
CMD ./run.sh
