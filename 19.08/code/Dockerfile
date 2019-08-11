FROM node:8 as bd
WORKDIR /code
COPY ./ /code
RUN npm build

FROM mongo
COPY --from=bd /code/target /app
RUN chmod+x /app/*
CMD /app/run.sh