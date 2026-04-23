# 📦 Lost & Found Management System

A full-stack MERN application that allows users to report, search, and manage lost and found items efficiently.

---

## 🚀 Features

* 🔐 User Authentication (Register/Login)
* 📦 Add Lost/Found Items
* 🔍 Search Items by Name & Category
* 📋 View All Items
* ✏️ Update Own Items
* ❌ Delete Own Items
* 🔒 Protected Routes with JWT

---

## 🛠️ Tech Stack

* **Frontend:** React.js
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **Authentication:** JWT
* **Deployment:** Render (Backend)

---

## 🌐 API Endpoints

### 🔐 Authentication Routes

* Register → POST /api/register
* Login → POST /api/login

---

### 📦 Item Routes

* Add Item (Protected) → POST /api/items
* Get All Items → GET /api/items
* Get Item by ID → GET /api/items/:id
* Search Items → GET /api/items/search?name=xyz&category=abc
* Update Item (Protected) → PUT /api/items/:id
* Delete Item (Protected) → DELETE /api/items/:id

---

## 🔗 Live Backend

https://lost-and-found-management-v3vr.onrender.com

---

## 🔑 Authentication

Uses JWT (JSON Web Token)

Include token in headers:
Authorization: Bearer <your_token>

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

git clone https://github.com/your-username/lost-and-found.git
cd lost-and-found

### 2. Install Dependencies

npm install

### 3. Create .env File

PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key

### 4. Run Server

npm start

---

## 📁 Project Structure

models/
routes/
controllers/
middleware/
config/
server.js

---

## 🧠 Future Improvements

* Image upload support
* Real-time notifications
* Admin dashboard
* Mobile app integration

---

## 👨‍💻 Author

Akshit vats

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
