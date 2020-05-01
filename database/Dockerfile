from postgres:11

ENV POSTGRES_PASSWORD postgres
ENV POSTGRES_DB godb

COPY init.sql /docker-entrypoint-initdb.d/
