# Frontend - Collaborative Notes App

This folder contains the Next.js frontend app for the Collaborative Notes App, built with React and styled with Tailwind CSS.

## Features:

- **Authentication:** Login and signup pages using JWT-based authentication (with an in-memory AuthContext).
- **Notes Management:** A dashboard to view all notes, a page to create new notes, and an editor to update or delete notes.
- **Real-Time Collaboration:** Integration with Socket.io to provide live updates when multiple users edit the same note.
- **Responsive UI:** Designed with Tailwind CSS for a modern, responsive look.

## Prerequisites

- Node.js (version 14 or later)
- npm or yarn

## Installation & Running

```bash
npm install
npm run dev
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`NEXT_PUBLIC_BACKEND_URL`

## Troubleshooting

- Access Token Issues:
  If you face issues with the access token (especially after page refresh), ensure your AuthContext is configured for silent token refresh.

- API Connectivity:
  Verify that the NEXT_PUBLIC_BACKEND_URL in your .env.local is correct and that your backend is running.

- Error Logging:
  Check the browser console for error messages.

## License

[MIT](https://choosealicense.com/licenses/mit/)

License
This project is licensed under the MIT License.
