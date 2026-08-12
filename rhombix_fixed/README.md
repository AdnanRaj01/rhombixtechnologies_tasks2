# Rhombix Social Network

A full-stack social networking web application developed as part of the **Rhombix Technologies Internship Program**.

The application allows users to create an account, securely log in, access their social feed, manage their profile, and interact with the application through a responsive user interface.

---

## 📌 Internship Task

**Organization:** Rhombix Technologies  
**Internship:** Web Development Internship  
**Task:** Social Network Web Application  
**Developer:** Muhammad Adnan

---

## 🚀 Project Overview

Rhombix Social Network is a full-stack web application built using the MERN-oriented technology stack.

The project focuses on implementing:

- User registration
- User authentication
- Secure password hashing
- JWT-based authentication
- Social feed
- User profile
- Responsive navigation
- Mobile burger menu
- Login and registration validation
- Success and error notifications
- Logout functionality
- MongoDB database integration
- REST API communication

The application has been designed to provide a clean and responsive experience across desktop, tablet, and mobile devices.

---

## ✨ Features

### 🔐 Authentication

- User registration
- User login
- JWT authentication
- Secure password hashing using bcrypt
- Logout functionality
- Protected user functionality
- Gmail-based email validation
- Strong password validation
- Password confirmation validation
- Username validation
- Terms & Conditions and Privacy Policy acceptance

### 👤 User Profile

- View user profile
- Display user's name
- Display username
- Display email
- Profile information management
- Profile picture support
- Bio support

### 📰 Social Feed

- Feed page for authenticated users
- Post-oriented social network structure
- Post content support
- Image/video media support
- Like functionality structure
- Comment functionality structure

### 📱 Responsive Design

The application is responsive for:

- Desktop
- Laptop
- Tablet
- Mobile devices

On mobile devices, the navigation changes into a burger menu containing:

- Home
- Profile
- User information
- Logout

### 🔔 Notifications

The application provides:

- Login success notification
- Registration success notification
- Authentication errors
- Validation errors
- Server/API errors

Success notifications are displayed before redirecting the user to the feed.

---

## 🛠️ Technologies Used

### Frontend

- React.js
- React Router DOM
- JavaScript ES6+
- HTML5
- CSS3
- Vite

### Backend

- Node.js
- Express.js
- REST API
- JWT
- bcryptjs

### Database

- MongoDB
- Mongoose

### Development Tools

- Visual Studio Code
- Git
- GitHub
- npm
- Postman

---

## 📂 Project Structure

```text
rhombixtechnologies_tasks/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── controllers/
│   ├── models/
│   │   ├── User.js
│   │   └── Post.js
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md

⚙️ Installation
1. Clone Repository
git clone https://github.com/YOUR_USERNAME/rhombixtechnologies_tasks.git

Move into the project:

cd rhombixtechnologies_tasks
💻 Frontend Setup

Open the frontend directory:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend will normally run on:

http://localhost:5173
🖥️ Backend Setup

Open another terminal and navigate to:

cd backend

Install dependencies:

npm install

Create a .env file:

PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

Start the backend:

npm run dev 

📱 Responsive Navigation

The navigation system provides separate experiences for desktop and mobile devices.

Desktop
Rhombix Social     Home   Profile   User   Logout
Mobile
Rhombix Social                         ☰

Home
Profile
User
Logout

The mobile burger menu automatically closes when a navigation item is selected.

🧪 Validation

The application includes validation for:

Full Name
Required
Minimum 2 characters
Username
Required
3–20 characters
Supports letters
Supports numbers
Supports underscores
Supports special characters
Gmail
Required
Must use a valid Gmail address
Password

Password must contain:

Minimum 8 characters
At least one uppercase letter
At least one lowercase letter
At least one number
At least one special character
Confirm Password
Must match the password
🧹 Code Quality

ESLint is used to identify JavaScript and React code quality issues.

Run:

npm run lint

The project should be submitted after resolving all lint errors.

👨‍💻 Developer

Muhammad Adnan

Full Stack Web Developer

GitHub:
https://github.com/AdnanRaj01

LinkedIn:
https://www.linkedin.com/in/muhammad-adnan-a0a1aa2b1/

📄 License

This project was developed for educational and internship purposes as part of the Rhombix Technologies Internship Program.