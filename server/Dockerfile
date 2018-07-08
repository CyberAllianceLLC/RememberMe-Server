FROM node:latest

# Start
ENV NODE_ENV="production"
ENV PORT="3000"

WORKDIR ./app
COPY ./ ./

# Build
RUN npm install

# Finish
EXPOSE 3000
CMD npm start