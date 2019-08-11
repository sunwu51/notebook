# 用heroku写在线的mongo增删改查
```Dockerfile
FROM node:8 as bd
WORKDIR /code
COPY ./ /code
RUN npm build

FROM mongo
RUN mkdir /app
COPY --from=bd /code/ /app/
RUN chmod+x /app
CMD /app/run.sh
```