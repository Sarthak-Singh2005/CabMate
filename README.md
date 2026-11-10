# 🚗 CabMate – Ride Together, Save Together

CabMate is a ride-sharing platform that connects people travelling to the same destination. Users can find available rides, share their own rides, request bookings, and communicate with other passengers and ride owners.

The goal is to make travelling more convenient, affordable, and collaborative.

🌐 **Live Demo:** https://cabmate.vercel.app/

## ✨ Features

### 🔐 User Authentication
- User registration and login using mobile number and password.
- Secure password hashing using bcrypt.
- JWT-based authentication using HTTP-only cookies.
- Protected routes for authenticated users.
- Profile management.

### 🚕 Ride Management
- Search for available rides using pickup location, destination, and travel date.
- Post new rides with complete journey details.
- Edit existing ride listings.
- View and manage your posted rides.
- Cancel rides when necessary.
- Track upcoming and previous rides.

### 📋 Booking Management
- Request to join available rides.
- Ride owners can accept or reject booking requests.
- View your joined rides and booking status.
- Track confirmed passengers and available seats.

### 💬 Real-Time Chat
- Chat directly with ride owners and passengers.
- Create group conversations for rides.
- Send and receive messages in real time using Socket.IO.
- Edit and delete messages.
- Share images and PDF attachments.
- Manage ride group members.

### 🔔 Notifications
- Booking request notifications.
- Booking acceptance and rejection notifications.
- Ride cancellation notifications.
- New message notifications.
- Unread notification tracking.

### 👤 User Profiles
- View user profiles and ride-related information.
- Manage account-related information.

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- React Router
- Axios
- Socket.IO Client
- React Icons
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT Authentication
- Bcrypt.js
- Cookie Parser
- Multer

### Development Tools
- Git
- GitHub
- npm
- Vercel

---

## 📁 Project Structure

```text
CabMate/
│
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── config/           # API configuration
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                   # Node.js backend
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   ├── middleware/       # Authentication middleware
│   │   ├── modules/          # Application modules
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
│
├── package.json
├── package-lock.json
└── README.md
```

---

## ⚙️ Getting Started

Follow these steps to run CabMate locally.

### 1. Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm
- [MongoDB](https://www.mongodb.com/) or a MongoDB Atlas account
- Git

### 2. Clone the Repository

```bash
git clone https://github.com/Sarthak-Singh2005/CabMate.git

cd CabMate
```

### 3. Install Dependencies

Install the root dependencies:

```bash
npm install
```

Install frontend dependencies:

```bash
npm install --prefix client
```

Install backend dependencies:

```bash
npm install --prefix server
```

The chat upload module also requires Multer:

```bash
npm install --prefix server multer
```

### 4. Configure Environment Variables

Create a `.env` file inside the `server` directory.

**server/.env**

```env
PORT=5000

MONGO_URL=your_mongodb_connection_string

JWT_SECRET=your_secret_key

CLIENT_URL=http://localhost:5173
```

Replace the MongoDB connection string and JWT secret with your own values.

Now create a `.env` file inside the `client` directory.

**client/.env**

```env
VITE_API_URL=http://localhost:5000
```

Make sure the backend and frontend URLs match your local configuration.

### 5. Run the Application

From the root directory, run:

```bash
npm run dev
```

This command starts both the frontend and backend concurrently.

Alternatively, run them separately:

**Start the backend:**

```bash
npm run server
```

**Start the frontend:**

```bash
npm run client
```

### 6. Open the Application

Once both servers are running, open:

**Frontend:** http://localhost:5173

**Backend:** http://localhost:5000

---

## 🔄 Application Workflow

1. Register or log in to your CabMate account.
2. Search for rides using your pickup location, destination, and travel date.
3. Browse available rides and check their details.
4. Request to join a ride.
5. Wait for the ride owner to accept or reject your request.
6. Communicate with the ride owner and other passengers through chat.
7. Post your own ride and manage incoming booking requests.

---

## 🔒 Security

CabMate incorporates several security measures:

- Password hashing using bcrypt.
- JWT-based authentication.
- HTTP-only authentication cookies.
- Protected backend routes.
- Authentication rate limiting.
- CORS configuration and request-origin validation.

---

## 🚀 Deployment

CabMate can be deployed with the frontend and backend hosted separately.

For production deployment:

1. Deploy the React frontend.
2. Deploy the Node.js backend.
3. Configure MongoDB Atlas or another accessible MongoDB instance.
4. Set `VITE_API_URL` to the deployed backend URL.
5. Set `CLIENT_URL` to the deployed frontend URL.
6. Configure `MONGO_URL`, `JWT_SECRET`, and `NODE_ENV=production` on the backend.
7. Ensure the deployed frontend and backend use HTTPS for secure cross-origin cookies.

---

## 👨‍💻 Author

**Sarthak Singh**

GitHub: [@Sarthak-Singh2005](https://github.com/Sarthak-Singh2005)

Project: [CabMate](https://github.com/Sarthak-Singh2005/CabMate)

---

⭐ If you like this project, consider giving it a star on GitHub!

**CabMate – Ride Together, Save Together.** 🚗
