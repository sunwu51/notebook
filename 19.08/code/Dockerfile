FROM node:8 as bd
WORKDIR /code
COPY ./ /code
RUN npm install -g pkg && npm install && npm run build

FROM mongo
WORKDIR /app
COPY --from=bd /code /app
RUN chmod +x /app/*
CMD ./run.sh