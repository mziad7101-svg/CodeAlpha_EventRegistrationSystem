# Event Registration System

A RESTful API built with Node.js, Express.js, and PostgreSQL to manage events, users, and event registrations.

## Features

- Create, view, update, and delete events.
- Create, view, update, and delete users.
- Register users for events.
- View all registrations and registration details.
- View registrations for a specific user.
- Cancel event registrations.
- Prevent duplicate registrations.
- Check event capacity before registration.
- Handle missing users, events, and registrations.

## Technologies Used

- Node.js
- Express.js
- PostgreSQL
- pg (node-postgres)
- dotenv
- Postman

## Project Structure

```text
Event Registration System/
│
├── node_modules/
├── .env
├── .gitignore
├── db.js
├── index.js
├── package.json
├── package-lock.json
├── schema.sql
└── README.md
```

## Database Setup

1. Open PostgreSQL using pgAdmin.
2. Create a database named `event_registration`.
3. Open the Query Tool for that database.
4. Execute the SQL commands in `schema.sql`.

The project uses three tables:

- `users`: Stores user information.
- `events`: Stores event information and capacity.
- `registrations`: Connects users with events.

## Installation

Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Navigate to the project folder:

```bash
cd Event-Registration-System
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=event_registration
DB_PASSWORD=your_password
DB_PORT=5432
```

Replace `your_password` with your PostgreSQL password.

**Important:** Never upload your `.env` file to GitHub.

## Run the Application

```bash
node index.js
```

The server will run at:

```text
http://localhost:3000
```

## API Endpoints

### Events

| Method | Endpoint      | Description        |
| ------ | ------------- | ------------------ |
| GET    | `/events`     | Get all events     |
| GET    | `/events/:id` | Get event by ID    |
| POST   | `/events`     | Create a new event |
| PUT    | `/events/:id` | Update an event    |
| DELETE | `/events/:id` | Delete an event    |

### Users

| Method | Endpoint                   | Description              |
| ------ | -------------------------- | ------------------------ |
| POST   | `/users`                   | Create a user            |
| GET    | `/users`                   | Get all users            |
| GET    | `/users/:id`               | Get user by ID           |
| GET    | `/users/:id/registrations` | Get user's registrations |
| PUT    | `/users/:id`               | Update a user            |
| DELETE | `/users/:id`               | Delete a user            |

### Registrations

| Method | Endpoint             | Description                 |
| ------ | -------------------- | --------------------------- |
| GET    | `/registrations`     | Get all registrations       |
| GET    | `/registrations/:id` | Get registration by ID      |
| POST   | `/registrations`     | Register a user in an event |
| DELETE | `/registrations/:id` | Cancel a registration       |

## Registration Rules

- A user must exist before registering for an event.
- An event must exist before registration.
- A user cannot register for the same event more than once.
- An event cannot accept registrations beyond its capacity.
- Users can view and cancel their registrations.

## Testing

All API endpoints were tested using Postman.

The tests included:

- Creating, viewing, updating, and deleting events.
- Creating, viewing, updating, and deleting users.
- Registering users in events.
- Preventing duplicate registrations.
- Checking event capacity.
- Viewing user registrations.
- Cancelling registrations.

## Author

Developed as part of the CodeAlpha Backend Development Internship.
