FROM tensorflow:2.2.0-gpu

ADD requirements.txt /tmp/requirements.txt
RUN cd /tmp && pip install -r requirements.txt 

WORKDIR /opt/app
ADD . /opt/app

EXPOSE 5000
CMD ["python", "app.py" ]
