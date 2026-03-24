# Hustle Hub - University Marketplace

Hustle Hub is a full-stack MERN application designed as a marketplace for university students to buy, sell, and find gigs.

## 🚀 Technologies Used

- **Frontend**: React.js, Vite, Tailwind CSS (v4), React Router, React Hot Toast
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose)
- **Utilities**: Concurrently (to run both servers at once), PostCSS, Dotenv

## 📂 Project Structure

- `/client`: Frontend React application.
- `/server`: Backend Express API.
- `/root`: Configuration files and scripts to manage the entire stack.

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js installed on your machine.


### 2. Installation
Run the following command in the **root** directory to install the necessary base dependencies:
```bash
npm install
```

### 3. Environment Variables
Ensure the following `.env` files exist:

**Server (`/server/.env`):**
```text
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern-app
```

**Client (`/client/.env`):**
```text
VITE_API_URL=http://localhost:5000/api
```

## 🏃 How to Run

From the **root directory**, run:
```bash
npm run dev
```

This command uses `concurrently` to start:
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Frontend App**: [http://localhost:5173](http://localhost:5173) (Vite proxy handles `/api` requests to the backend)

## 📍 Key Features
- **Role-Based Routing**: Dedicated views for Owners, Admins, and Customers.
- **Modern UI**: Styled with Tailwind CSS v4 and a professional Dark Blue/White/Black palette.
- **API Health Check**: Integrated status monitor on the homepage to verify server connectivity.

## 🎨 3D Model Credits

The following 3D models are used in this project under the **Creative Commons Attribution (CC-BY)** license via Poly Pizza:

- Flower Pot — Zsky  
- Bird House — Zsky  
- Pillar — Zsky  
- Garden Lamp — Zsky  
- M939 Truck — J-Toastie  
- Suit — Quaternius  

🔗 Source: Poly Pizza  
https://poly.pizza/

> These assets are licensed under CC-BY, which allows reuse with proper attribution to the original creators.

### 🎨 Theme
- Primary Color: `#051094` (Blue)
