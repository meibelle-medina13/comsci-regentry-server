# Comsci Regentry Server (Backend)

## Description

This is a RESTful API built with Node.js and Express that provides backend services for a registration or logging system. It handles list of Computer Science students and their log information in an event. This server uses MySQL database.

## Installation

If you want to setup this repository in your local device, follow these steps:
1. Clone the repository:

    ```bash
    git clone https://github.com/meibelle-medina13/comsci-regentry-server.git
    ```

2. Install NPM Packages
    ```bash
    npm install
    ```

3. Setup environment variables by creating .env file. Here are the variables needed in .env file

    ```bash
    DATABASE_HOST = <host>
    DATABASE_USERNAME = <username>
    DATABASE_PASSWORD = <password>
    DATABASE_NAME = <dbname>
    PORT = <port>
    ```

4. Start the server
    ```bash
    npm run dev or npm run start
    ```

    Your server should now be running at `http://localhost:3000/`

## Usage

### API Endpoints

#### /masterlist
* `GET` : Get the list of students according to the parameter
* `POST` : Imports CSV file containing the list of students

#### /logs
* `GET` : Get the logs of the students
* `POST` : Add a new log information of a specific student

#### /logs/most-recent
* `GET` : Gets the last 5 log information in the system

#### /logs/summary
* `GET` : Get the number of attendees and total number of students per year level

Example on how to use the API:
```bash
http://localhost:3000/logs
```

### Deployment
This server is already deployed in Vercel. You may access it using this domain [Comsci Regentry](comsci-regentry-server.vercel.app).