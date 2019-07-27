# docker-compose
# 基本用法
```yml
version: 3
services:
    web:
        image: nginx
        ports:
        - 80:80
        environments:
        - MYENV=zzzz
        volumes:
        - /h:/nginx
    php:
        image: php
        volumes:
        - /b:/c
```