FROM ubuntu:20.04

RUN apt-get update && \
    apt-get install -y curl build-essential

# 安装Rustup和Rust工具链
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /project

COPY . /project

RUN cargo build --release