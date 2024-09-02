FROM ubuntu:18.04
RUN apt update && apt install -y python3 python3-venv
RUN python3 -m venv /netpruneenv 

RUN /netpruneenv/bin/python -m pip install --upgrade pip
COPY requirements.txt requirements.txt
RUN /netpruneenv/bin/pip install -r requirements.txt

VOLUME /server 

ENV FLASK_APP=app.py
ENV FLASK_ENV=development
ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8

WORKDIR /server 
CMD ["/netpruneenv/bin/python", "-m", "flask", "run", "--host", "0.0.0.0"]

