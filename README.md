# React Boilerplate

![React Logo](http://www.toptal.com/uploads/blog/category/logo/291/react.png)

A ReactJS starter kit that focuses on **usability**, **scalability**, and **performance**.

## Usage
1. `git clone https://github.com/theponti/react-boilerplate.git`
2. `make fresh`
3. `npm start`
4. Start Coding

## Features
* React (v0.13.1) 
* React Router (v0.13.2)
* Browserify
* Gulp
* ESLint
* SCSS
* Karma
* Jasmine
* Browser-sync server

## NPM Scripts

##### `npm run build`
This script will build the un-minified JavaScript, CSS, and HTML files.

##### `npm run build:prod`
This script will build the minified JavaScript, CSS, and HTML files.

##### `npm run pagespeed`
This script will execute Google Pagespeed Insights on the URL to which you deploy your site. You will need to set this property within the `gulpfile`.

##### `npm start`
This script will build the un-minified JavaScript, CSS, and HTML files. It will also begin the development server at port 3000. (The port can be changed in the gulpfile)

##### `npm test`
This task will begin the `Karma` server, which will run continuously, executing the test suite upon file changes within the `src/scripts` directory.

##### `npm run test:single`
This task will run the `Karma` test suite once.
