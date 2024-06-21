# Stage 1
# Build docker image of react app
FROM node:18.0.0 as build-stage

# set working directory
RUN mkdir /usr/app
#copy all files from current directory to docker
COPY . /usr/app

WORKDIR /usr/app

# install and cache app dependencies
RUN yarn

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

RUN npm run build

# Stage 2
# Copy the react app build above in nginx
FROM nginx:alpine

# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY --from=build-stage /usr/app/build .

# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]