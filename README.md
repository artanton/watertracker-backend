# Water Tracker Backend  

## Overview  

This is the **Node.js + Express.js** backend for the **Water Tracker Application**. It provides API endpoints for user authentication, water intake tracking, and statistics management. The backend is designed to work seamlessly with the frontend application, ensuring a smooth user experience.  

The backend is **deployed on Render**, which may cause a slight delay on the first request due to cold starts.  

This backend uses **access token authentication**, ensuring secure user sessions.  

## Features  

✔ **User Authentication** – Secure sign-up, login, logout, and access token management.  
✔ **Personalized Daily Water Intake Calculation** – Uses gender, weight, and activity level.  
✔ **Water Intake Logging** – Users can record and manage their daily water consumption.  
✔ **Statistics & Reports** – Provides detailed water intake history.  
✔ **RESTful API with Swagger Documentation** – API is documented for easy integration.  
✔ **Database Integration** – Stores user data and water intake logs in MongoDB.  
✔ **Access Token Authentication** – Uses JWT tokens for secure authentication.  

## Installation  

### Prerequisites  
- **Node.js** (LTS recommended) – [Download and install](https://nodejs.org/)  
- **MongoDB** (local or cloud-based) – [Get started with MongoDB](https://www.mongodb.com/)  

### Setup Steps  
1. Clone the repository:  
   ```sh
   git clone https://github.com/your-username/water-tracker-backend.git
   cd water-tracker-backend/backend
   ```
2. Install dependencies:
```sh
npm install
```

3. Create a .env file in the backend directory and configure it as follows:
```
PORT=3000
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
ACCESS_TOKEN_EXPIRES=1h
```
4. Start the server:
```npm run dev```
The server will run on [http://localhost:3000](http://localhost:3000)

## API Documentation

The API is documented using Swagger.
Once the backend is running, you can view the API documentation at:
👉 https://watertracker-backend-rsfd.onrender.com/api-docs/

## API Endpoints

## API Endpoints  

### **Authentication**  

| Method | Endpoint         | Description                         | Auth Required |
|--------|-----------------|-------------------------------------|--------------|
| POST   | /api/auth/register  | Register a new user                | ❌           |
| POST   | /api/auth/login | Login user and return access token | ❌           |
| POST   | /api/auth/logout | Logout user                        | ✅           |
| GET    | /api/auth/current | Current user checkout               | ✅           |

### **Water Intake**  

| Method | Endpoint       | Description                      | Auth Required |
|--------|---------------|----------------------------------|--------------|
| GET    | /api/water/today    | Get user's daily water intake logs | ✅           |
| GET    | /api/water/month    | Get user's month water intake stat | ✅           |
| POST   | /api/water/add    | Add user's water dose | ✅           |
| PATCH   | /api/water/:id    | Update user's water entry        | ✅           |
| PATCH   | /api/water/waterrate   | Update user's water dayily norma        | ✅           |
| DELETE | /api/water/:id | Delete a logged water entry       | ✅           |

### **User Management**  

| Method | Endpoint          | Description               | Auth Required |
|--------|------------------|---------------------------|--------------|
| GET    | /api/updateProfile | Get user profile data     | ✅           |
| PATCH  | /api/updateProfile | Update user information   | ✅           |

### **API docs**  

https://watertracker-backend-rsfd.onrender.com/api-docs/


## Project Structure
```
backend/
├── controllers        # Business logic handlers for routes
├── services           # Core business logic
├── routes             # API routes
├── middleware         # Middleware for authentication and error handling
├── models             # MongoDB schemas (User, Water Intake)
├── schemas            # Joi validation schemas
├── helpers            # Helper functions (e.g., JWT token handling)
├── decorators         # Decorators for DRY code
├── swagger.yaml       # API documentation
├── .gitignore         # Ignored files (node_modules, .env)
├── package.json       # Dependencies and scripts
├── README.md          # This documentation file
├── app.js          # Main entry point

```

**Start tracking your hydration today with Water Tracker Backend!** 🚀