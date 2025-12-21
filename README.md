# 🏆 UniPlay – University Sports Management Platform

UniPlay is a full-stack MERN web application designed to centralize and manage sports activities within a university. It allows students to explore events, register teams, and request tournaments, while administrators can approve, manage, and monitor events through a secure dashboard.

---

## 🚀 Features

### 👥 User Features
- Browse upcoming university sports events
- View detailed event information (date, venue, fee, prizes)
- Request new sports events
- Register teams for approved events
- Explore multiple sports (Cricket, Football, Basketball, E-Sports, Chess, etc.)

### 🛠️ Admin Features
- Secure admin-only dashboard
- View all event requests with filters (All / Pending / Approved / Rejected)
- Approve or reject events with admin notes
- Delete invalid or duplicate event requests
- Real-time event status updates

### 📊 Platform Highlights
- Role-based access control (Admin / User)
- REST API-based data handling
- Responsive and clean UI
- Scalable architecture for future features

---

## 🧑‍💻 Tech Stack (MERN)

**Frontend**
- React.js
- React Router
- HTML5, CSS3
- JavaScript (ES6+)

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB

**Tools**
- Git & GitHub
- RESTful APIs
- LocalStorage

---

## 📂 Project Structure

UniPlay/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── server.js
│
└── README.md

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
git clone https://github.com/himanshukirodiwal21/UniPlay.git  
cd UniPlay

### 2️⃣ Frontend Setup
cd frontend  
npm install  
npm run dev

### 3️⃣ Backend Setup
cd backend  
npm install  
npm start

### 4️⃣ Environment Variables
Create a `.env` file inside the backend folder:

PORT=8000  
MONGO_URI=your_mongodb_connection_string

---

## 🌐 API Endpoints (Sample)

| Method | Endpoint | Description |
|------|---------|------------|
| GET | /api/events | Fetch all approved events |
| POST | /api/v1/requests | Submit event request |
| PUT | /api/v1/requests/:id/approve | Approve event (Admin) |
| PUT | /api/v1/requests/:id/decline | Reject event (Admin) |
| DELETE | /api/v1/requests/:id | Delete event request |

---

## 🚧 Future Enhancements
- Live match score updates
- Win probability & score prediction
- Player and team leaderboards
- Notification system
- Online payment integration

---

## 👨‍🎓 Author

Himanshu Kirodiwal  
B.Tech (IT), Rajasthan Technical University  
Aspiring Full-Stack Developer  

GitHub: https://github.com/himanshukirodiwal21

---

## ⭐ Support
If you like this project, don’t forget to star ⭐ the repository!
