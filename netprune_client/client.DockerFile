FROM ubuntu:18.04
RUN apt update && apt install -y curl wget xz-utils
RUN mkdir /node
WORKDIR /node
RUN wget https://nodejs.org/dist/v17.9.1/node-v17.9.1-linux-x64.tar.xz
RUN tar -xf node-v17.9.1-linux-x64.tar.xz
ENV PATH=$PATH:/node/node-v17.9.1-linux-x64/bin/
RUN useradd -ms /bin/bash client_user
RUN mkdir /client && chown client_user:client_user /client
WORKDIR /client

USER client_user
RUN curl https://install.meteor.com/\?release\=2.16 | sh
RUN ls -l /client  
COPY --chown=client_user:client_user client /client/client
COPY --chown=client_user:client_user imports /client/imports
COPY --chown=client_user:client_user server /client/server
COPY --chown=client_user:client_user public /client/public
RUN echo '{"MONGO_URL": "mongodb://mongo:27017/","FLASK_URL": "http://netprune:5000"}' | tee /client/dev_settings.json
ENV PATH=$PATH:/home/client_user/.meteor/
RUN meteor create --release 2.16 .
RUN meteor npm install --save react react-dom react-router react-router-dom @material-ui/core @material-ui/icons prop-types cytoscape d3 @material-ui/lab
RUN meteor add http
ENV MONGO_URL=mongodb://mongo:27017/meteor
CMD [ "meteor",  "run", "--settings", "/client/dev_settings.json" ]