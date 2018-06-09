FROM node:8.1

# Start
WORKDIR ./app
COPY ./ ./

# Build
RUN npm install

# Finish (sleep 8 sec to ensure build)
CMD sleep 8 && node models.js