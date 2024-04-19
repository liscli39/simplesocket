FROM node:14-alpine
RUN apk add g++ make py3-pip
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install --prod
RUN npm install -g nodemon

# Bundle app source
COPY . /usr/src/app

CMD [ "npm", "run", "start" ]