# NomNomNotes 🍽️

A full-stack food diary application that helps users track their dining experiences, rate restaurants, and share discoveries with friends.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![React Version](https://img.shields.io/badge/react-18.0.0-blue)](https://reactjs.org)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Diagrams](#-diagrams)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Database Schema](#️-database-schema)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Security](#-security)
- [License](#-license)

---

## ✨ Features

### 🍕 Diary Management

- **Create & Edit Entries**: Add detailed restaurant reviews with photos, notes, and ratings
- **Rating System**: Rate taste, service, and value on a 5-star scale
- **Photo Upload**: Upload multiple images to S3 for each dining experience
- **Location Integration**: Search and save restaurant locations with Google Places API
- **Cuisine & Label Filtering**: Categorize entries with cuisine types and custom labels
- **Price Range Tracking**: Track restaurant price ranges ($, $$, $$$, $$$$)

### 👥 Social Features

- **Friend System**: Send and accept friend requests using unique user IDs
- **Friend Discovery**: Find friends by their UID
- **Shared Experiences**: View friends' diary entries
- **Username Customization**: Set and update your display name

### 🔐 Authentication & Security

- **Firebase Authentication**: Secure login with email/password and Google OAuth
- **JWT Token Verification**: Protected API routes with Firebase admin SDK
- **User Initialization**: Automatic user setup in database upon registration
- **Input Sanitization**: Protection against XSS and injection attacks

### 🎨 User Experience

- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Feedback**: Toast notifications for user actions
- **Advanced Filtering**: Filter entries by cuisine, price, labels, and search terms
- **Sorting Options**: Sort by date (most recent) or rating (highest rated)
- **Paper-like Interface**: Unique lined paper aesthetic for diary entries

---

## 🛠️ Tech Stack

### Frontend
- [React 18](https://reactjs.org/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool and dev server
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Firebase Auth](https://firebase.google.com/products/auth) - Authentication
- [React Hot Toast](https://react-hot-toast.com/) - Toast notifications
- [Phosphor Icons](https://phosphoricons.com/) - Icon library

### Backend
- [Node.js](https://nodejs.org/) - Runtime environment
- [Express.js](https://expressjs.com/) - Web framework
- [SQLite](https://www.sqlite.org/) - Database
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) - Authentication verification
- [AWS S3](https://aws.amazon.com/s3/) - Image storage
- [Multer](https://github.com/expressjs/multer) - File upload handling

### DevOps & Tools
- [Git](https://git-scm.com/) - Version control
- [ESLint](https://eslint.org/) - Code linting
- [Jest](https://jestjs.io/) - Testing framework
- [Playwright](https://playwright.dev/) - End-to-end testing framework

---

## 📐 Diagrams

todo

---

## 🚀 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn
- [Firebase project](https://console.firebase.google.com/)
- [AWS S3 bucket](https://aws.amazon.com/s3/)
- [Google Cloud Platform account](https://console.cloud.google.com/) (for Places API)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/nomnomnotes.git
cd nomnomnotes
```

### 2. Install Dependencies

**Client:**
```bash
cd client
npm install
```

**Server:**
```bash
cd ../server
npm install
```

**Database:**
```bash
cd ../sqlDB
npm install
```

### 3. Set Up Environment Variables

Create `.env` files in both `client` and `server` directories.

**Client `.env`:**
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Server `.env`:**
```env
# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-2
S3_BUCKET_NAME=your_bucket_name
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Server
PORT=8080
NODE_ENV=development
```

### 4. Set Up Firebase

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password and Google providers
3. Generate a service account key:
   - Go to **Project Settings** → **Service Accounts**
   - Click **"Generate new private key"**
   - Drop the `service-account.json` file into the server file

### 5. Set Up AWS S3

1. Create an S3 bucket for image storage
2. Set up IAM user with S3 permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

### 6. Initialize Database

```bash
cd sqlDB
node dbSetup.js
```

### 7. Start the Application

**Development Mode:**

Terminal 1 (Server):
```bash
cd server
npm start
```

Terminal 2 (Client):
```bash
cd client
npm run dev
```

The application will be available at:
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:8080](http://localhost:8080)

---

## 🔧 Environment Variables

### Required Variables

#### Client

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase web API key | `AIzaSyC...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `myapp.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | `my-project-12345` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `my-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID | `123456789` |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | `1:123:web:abc...` |

#### Server

| Variable | Description | Example |
|----------|-------------|---------|
| `FIREBASE_PROJECT_ID` | Firebase project ID | `my-project-12345` |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key | `-----BEGIN PRIVATE KEY-----...` |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | `firebase-adminsdk-xxx@my-project.iam.gserviceaccount.com` |
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | AWS region | `us-east-2` |
| `S3_BUCKET_NAME` | S3 bucket name | `nomnomnotes-images` |
| `PORT` | Server port | `8080` |
| `NODE_ENV` | Environment mode | `development` or `production` |

---

## 📖 Usage

### Creating Your First Diary Entry

1. **Sign Up/Login**: Create an account or sign in with Google
2. **Set Username**: Choose a display name for your profile
3. **Create Entry**: Click the "+" button to add a new diary entry
4. **Add Details**:
   - Restaurant name and location
   - Upload photos of your meal
   - Rate taste, service, and value
   - Add notes and select cuisine types
   - Set price range and custom labels
5. **Save**: Your entry will be saved and visible in your diary

### Managing Friends

- **Find Friends**: Use the friend finder with username or UID
- **Send Requests**: Send friend requests to other users
- **Accept/Decline**: Manage incoming friend requests
- **View Shared Content**: See friends' diary entries (if shared)

### Filtering and Search

- **Search**: Use the search bar to find entries by restaurant name or notes
- **Filter by Cuisine**: Select specific cuisine types
- **Filter by Price**: Choose price ranges
- **Filter by Labels**: Select custom labels
- **Sort**: Order by most recent or highest rated

---

## 📡 API Documentation

### Authentication Routes (`/api/auth`)

#### `POST /api/diary/initfriend`
Initialize a new user in the database.

**Headers:**
```http
Authorization: Bearer <firebase_token>
```

**Body:**
```json
{
  "uid": "user_firebase_uid"
}
```

---

### Diary Routes (`/api/diary`)

#### `GET /api/diary`
Get all diary entries for the authenticated user.

**Headers:**
```http
Authorization: Bearer <firebase_token>
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": "abc123",
    "title": "Sushi Paradise",
    "selected_cuisines": "[\"Japanese\",\"Sushi\"]",
    "location": "{\"name\":\"...\",\"address\":\"...\"}",
    "taste": 4.5,
    "service": 4.0,
    "value": 5.0,
    "images": "[\"url1\",\"url2\"]",
    "date": "2024-01-15"
  }
]
```

#### `POST /api/diary/create`
Create a new diary entry.

**Headers:**
```http
Authorization: Bearer <firebase_token>
Content-Type: multipart/form-data
```

**Body (FormData):**
```
title: "Restaurant Name"
location: JSON.stringify({name: "...", address: "..."})
selectedCuisines: JSON.stringify(["Japanese", "Sushi"])
selectedLabels: JSON.stringify(["Date Night", "Special"])
selectedPrices: "$$$"
taste: "4.5"
service: "4"
value: "5"
notes: "Excellent experience"
images: [File, File, ...]
```

#### `PUT /api/diary/edit/:id`
Edit an existing diary entry.

**Headers:**
```http
Authorization: Bearer <firebase_token>
Content-Type: multipart/form-data
```

**Parameters:**
- `id` - Diary entry ID

---

### User Routes (`/api/user`)

#### `GET /api/user/friends`
Get user's friends list.

**Headers:**
```http
Authorization: Bearer <firebase_token>
```

#### `GET /api/user/friends/requests`
Get pending friend requests.

**Headers:**
```http
Authorization: Bearer <firebase_token>
```

#### `POST /api/user/add-friend`
Send a friend request.

**Headers:**
```http
Authorization: Bearer <firebase_token>
```

**Body:**
```json
{
  "friendId": "friend_uid_or_username"
}
```

#### `PATCH /api/user/updateUsername`
Update user's display name.

**Headers:**
```http
Authorization: Bearer <firebase_token>
```

**Body:**
```json
{
  "username": "newusername"
}
```

---

## 🗄️ Database Schema

### Tables

#### `users`
```sql
CREATE TABLE users (
    uid TEXT PRIMARY KEY,
    username TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `diary_entries`
```sql
CREATE TABLE diary_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    selected_cuisines TEXT,
    location TEXT,
    place_id TEXT,
    lat REAL,
    lng REAL,
    selected_prices TEXT,
    selected_labels TEXT,
    images TEXT,
    notes TEXT,
    taste REAL,
    service REAL,
    value REAL,
    date TEXT DEFAULT CURRENT_DATE,
    FOREIGN KEY (user_id) REFERENCES users(uid)
);
```

#### `friends`
```sql
CREATE TABLE friends (
    user_id TEXT PRIMARY KEY,
    friends TEXT DEFAULT '[]',
    sent_requests TEXT DEFAULT '[]',
    received_requests TEXT DEFAULT '[]',
    FOREIGN KEY (user_id) REFERENCES users(uid)
);
```

---

## 📁 Project Structure

```
nomnomnotes/
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── dashboard/   # Dashboard components
│   │   │   └── diary/       # Diary-related components
│   │   ├── utils/           # Utility functions
│   │   ├── firebase.js      # Firebase configuration
│   │   └── App.jsx          # Main App component
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── server/                  # Express backend
│   ├── api/                 # API routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── utils/           # Server utilities
│   │   ├── diaryRoutes.js   # Diary endpoints
│   │   └── userRoutes.js    # User endpoints
│   ├── firebase.js          # Firebase admin configuration
│   ├── s3Config.js          # AWS S3 configuration
│   └── server.js            # Express server setup
├── sqlDB/                   # Database layer
│   ├── dbFunctions.js       # Database operations
│   ├── dbSetup.js           # Database initialization
│   └── helperFunctions.js   # Database helpers
└── README.md               # This file
```

---

## 🧪 Testing

Run tests for the database layer:
```bash
cd sqlDB
npm test
```

Run server tests:
```bash
cd server
npm test
```

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)

1. Build the client:
```bash
cd client
npm run build
```

2. Deploy the `dist` folder to your hosting service
3. Set environment variables in your hosting platform

### Backend (Railway/Render/Heroku)

1. Set up your hosting service
2. Configure environment variables
3. Set build command: `cd server && npm install`
4. Set start command: `cd server && npm start`

### Database

For production, consider migrating to:
- [PostgreSQL](https://www.postgresql.org/) (Railway, Supabase)
- [MySQL](https://www.mysql.com/) (PlanetScale)
- [MongoDB](https://www.mongodb.com/) (MongoDB Atlas)

---

## 🔒 Security

- **Environment Variables**: Never commit `.env` files
- **Firebase Rules**: Set up proper Firestore security rules
- **Input Validation**: All user inputs are sanitized
- **Authentication**: All API routes require valid Firebase tokens
- **File Upload**: Images are validated and stored securely in S3

---

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com/) for authentication services
- [AWS S3](https://aws.amazon.com/s3/) for image storage
- [Google Places API](https://developers.google.com/maps/documentation/places) for location services
- All the amazing open-source libraries that made this project possible

---

**Made with ❤️ by the NomNomNotes Team**