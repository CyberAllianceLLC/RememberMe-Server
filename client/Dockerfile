FROM node:latest

# Start
ENV NODE_ENV="development"

WORKDIR ./app
COPY ./ ./

# Build
RUN npm install

# Finish
EXPOSE 8080
CMD npm run serve