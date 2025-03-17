# Frontend - Collaborative Notes App

This folder contains the Next.js frontend app for the Collaborative Notes App, built with React and styled with Tailwind CSS.

## Features:

- **User Authentication:** Handling signup, login, token refresh, and logout using JWT tokens.
- **Notes Management:** Creating, reading, updating (with revision history), and deleting notes.
- **Real-Time Collaboration:** Using Socket.io to enable live updates for collaborative note editing.

## Prerequisites

- Node.js (version 14 or later)
- npm or yarn
- A MongoDB instance (e.g., [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or a local MongoDB server)

## Installation & Running

```bash
npm install
npm run dev
```

or

```bash
npm install
npm start
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`MONGO_URI`

`JWT_SECRET`

`FRONTEND_URL`

`PORT`

## API Reference

### Auth Routes

#### Register a new user.

```http
  POST /api/auth/signup
```

#### Login and receive an access token.

```http
  POST /api/auth/login
```

#### Refresh the access token using the refresh token stored in an HTTP-only cookie.

```http
  POST /api/auth/token
```

#### Logout and clear the refresh token.

```http
  POST /api/auth/logout
```

### Notes Routes

#### Create a new note.

```http
  POST /api/notes
```

#### Retrieve all notes.

```http
  GET /api/notes
```

#### Retrieve a single note.

```http
  GET /api/notes/:id
```

#### Update a note (with revision history).

```http
  PUT /api/notes/:id
```

#### Delete a note.

```http
  DELETE /api/notes/:id
```

## Troubleshooting

- Database Connection:
  Ensure your MONGO_URI is correct and that your MongoDB instance is accessible.

- Error Logging:
  Check your server console for error messages if API calls fail.

## License

[MIT](https://choosealicense.com/licenses/mit/)

License
This project is licensed under the MIT License.
