NomNomNotes 🍽️
A full-stack food diary application that helps users track their dining experiences, rate restaurants, and share discoveries with friends.

📋 Table of Contents
Features
Tech Stack
Installation
Environment Variables
Usage
API Documentation
Database Schema
Project Structure
Contributing
License

✨ Features
🍕 Diary Management
Create & Edit Entries: Add detailed restaurant reviews with photos, notes, and ratings
Rating System: Rate taste, service, and value on a 5-star scale
Photo Upload: Upload multiple images to S3 for each dining experience
Location Integration: Search and save restaurant locations with Google Places API
Cuisine & Label Filtering: Categorize entries with cuisine types and custom labels
Price Range Tracking: Track restaurant price ranges ($, $$, $$$, $$$$)

👥 Social Features
Friend System: Send and accept friend requests using unique user IDs
Friend Discovery: Find friends by their username or UID
Shared Experiences: View friends' diary entries (when permissions allow)
Username Customization: Set and update your display name

🔐 Authentication & Security
Firebase Authentication: Secure login with email/password and Google OAuth
JWT Token Verification: Protected API routes with Firebase admin SDK
User Initialization: Automatic user setup in database upon registration
Input Sanitization: Protection against XSS and injection attacks

🎨 User Experience
Responsive Design: Mobile-first design with Tailwind CSS
Real-time Feedback: Toast notifications for user actions
Advanced Filtering: Filter entries by cuisine, price, labels, and search terms
Sorting Options: Sort by date (most recent) or rating (highest rated)
Paper-like Interface: Unique lined paper aesthetic for diary entries

🛠️ Tech Stack
Frontend
React 18 - UI framework
Vite - Build tool and dev server
Tailwind CSS - Utility-first CSS framework
Firebase Auth - Authentication
React Hot Toast - Toast notifications
Phosphor Icons - Icon library
Backend
Node.js - Runtime environment
Express.js - Web framework
SQLite - Database
Firebase Admin SDK - Authentication verification
AWS S3 - Image storage
Multer - File upload handling
DevOps & Tools
Git - Version control
ESLint - Code linting
Jest - Testing framework
Playwright - End to End testing framework

🚀 Installation
Prerequisites
Node.js (v18 or higher)
npm or yarn
Firebase project
AWS S3 bucket
Google Cloud Platform account (for Places API)
1. Clone the Repository
git clone https://github.com/yourusername/nomnomnotes.git
cd nomnomnotes
2. Install Dependencies
client
cd client
npm install
server
cd ../server
npm install
database
cd ../sqlDB
npm install
3. Set Up Environment Variables
Create .env files in both client and server directories:
Client .env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
Server .env
# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-2
S3_BUCKET_NAME=your_bucket_name

# Server
PORT=8080
NODE_ENV=development
4. Set Up Firebase
Create a Firebase project at Firebase Console
Enable Authentication with Email/Password and Google providers
Generate a service account key:
Go to Project Settings → Service Accounts
Click "Generate new private key"
Save as service-account.json
5. Set Up AWS S3
Create an S3 bucket for image storage
Set up IAM user with S3 permissions:
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
6. Initialize Database
cd sqlDB
node dbSetup.js
7. Start the Application
Development Mode
Terminal 1 (Server):
cd server
npm start
Terminal 2 (Client):
cd client
npm run dev
The application will be available at:

Frontend: http://localhost:5173
Backend API: http://localhost:8080
Production Mode
Build the client:
cd client
npm run build
Start the server:
cd server
npm run start:prod
🔧 Environment Variables
Required Variables
Client

Variable	Description	Example
VITE_FIREBASE_API_KEY	Firebase web API key	AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN	Firebase auth domain	myapp.firebaseapp.com
VITE_FIREBASE_PROJECT_ID	Firebase project ID	my-project-12345
VITE_FIREBASE_STORAGE_BUCKET	Firebase storage bucket	my-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID	Firebase sender ID	123456789
VITE_FIREBASE_APP_ID	Firebase app ID	1:123:web:abc...
Server
Server
Variable	Description	Example
FIREBASE_PROJECT_ID	Firebase project ID	my-project-12345
FIREBASE_PRIVATE_KEY	Firebase service account private key	-----BEGIN PRIVATE KEY-----...
FIREBASE_CLIENT_EMAIL	Firebase service account email	firebase-adminsdk-xxx@my-project.iam.gserviceaccount.com
AWS_ACCESS_KEY_ID	AWS access key	AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY	AWS secret key	wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION	AWS region	us-east-2
S3_BUCKET_NAME	S3 bucket name	nomnomnotes-images
PORT	Server port	8080
NODE_ENV	Environment mode	development or production
📖 Usage
Creating Your First Diary Entry
Sign Up/Login: Create an account or sign in with Google
Set Username: Choose a display name for your profile
Create Entry: Click the "+" button to add a new diary entry
Add Details:
Restaurant name and location
Upload photos of your meal
Rate taste, service, and value
Add notes and select cuisine types
Set price range and custom labels
Save: Your entry will be saved and visible in your diary
Managing Friends
Find Friends: Use the friend finder with username or UID
Send Requests: Send friend requests to other users
Accept/Decline: Manage incoming friend requests
View Shared Content: See friends' diary entries (if shared)
Filtering and Search
Search: Use the search bar to find entries by restaurant name or notes
Filter by Cuisine: Select specific cuisine types
Filter by Price: Choose price ranges
Filter by Labels: Select custom labels
Sort: Order by most recent or highest rated
📡 API Documentation
Authentication Routes (/api/auth)
POST /api/diary/initfriend
Initialize a new user in the database.
Headers:
Body:
Diary Routes (/api/diary)
GET /api/diary
Get all diary entries for the authenticated user.
Headers:
Response:
POST /api/diary/create
Create a new diary entry.
Headers:
Authorization: Bearer <firebase_token>
Content-Type: multipart/form-data
Body (FormData):
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
PUT /api/diary/edit/:id
Edit an existing diary entry.
Headers:
Authorization: Bearer <firebase_token>
Content-Type: multipart/form-data
User Routes (/api/user)
GET /api/user/friends
Get user's friends list.

GET /api/user/friends/requests
Get pending friend requests.

POST /api/user/add-friend
Send a friend request.

PATCH /api/user/updateUsername
Update user's display name.

🗄️ Database Schema
Tables
users
CREATE TABLE users (
    uid TEXT PRIMARY KEY,
    username TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


Workspace
Collecting workspace information

NomNomNotes 🍽️
A full-stack food diary application that helps users track their dining experiences, rate restaurants, and share discoveries with friends.

📋 Table of Contents
Features
Tech Stack
Installation
Environment Variables
Usage
API Documentation
Database Schema
Project Structure
Contributing
License
✨ Features
🍕 Diary Management
Create & Edit Entries: Add detailed restaurant reviews with photos, notes, and ratings
Rating System: Rate taste, service, and value on a 5-star scale
Photo Upload: Upload multiple images to S3 for each dining experience
Location Integration: Search and save restaurant locations with Google Places API
Cuisine & Label Filtering: Categorize entries with cuisine types and custom labels
Price Range Tracking: Track restaurant price ranges ($, $$, $$$, $$$$)
👥 Social Features
Friend System: Send and accept friend requests using unique user IDs
Friend Discovery: Find friends by their username or UID
Shared Experiences: View friends' diary entries (when permissions allow)
Username Customization: Set and update your display name
🔐 Authentication & Security
Firebase Authentication: Secure login with email/password and Google OAuth
JWT Token Verification: Protected API routes with Firebase admin SDK
User Initialization: Automatic user setup in database upon registration
Input Sanitization: Protection against XSS and injection attacks
🎨 User Experience
Responsive Design: Mobile-first design with Tailwind CSS
Real-time Feedback: Toast notifications for user actions
Advanced Filtering: Filter entries by cuisine, price, labels, and search terms
Sorting Options: Sort by date (most recent) or rating (highest rated)
Paper-like Interface: Unique lined paper aesthetic for diary entries
🛠️ Tech Stack
Frontend
React 18 - UI framework
Vite - Build tool and dev server
Tailwind CSS - Utility-first CSS framework
Firebase Auth - Authentication
React Hot Toast - Toast notifications
Phosphor Icons - Icon library
Backend
Node.js - Runtime environment
Express.js - Web framework
SQLite - Database
Firebase Admin SDK - Authentication verification
AWS S3 - Image storage
Multer - File upload handling
DevOps & Tools
Git - Version control
ESLint - Code linting
Jest - Testing framework
🚀 Installation
Prerequisites
Node.js (v18 or higher)
npm or yarn
Firebase project
AWS S3 bucket
Google Cloud Platform account (for Places API)
1. Clone the Repository
2. Install Dependencies
Client
Server
Database
3. Set Up Environment Variables
Create .env files in both client and server directories:

Client .env
Server .env
4. Set Up Firebase
Create a Firebase project at Firebase Console
Enable Authentication with Email/Password and Google providers
Generate a service account key:
Go to Project Settings → Service Accounts
Click "Generate new private key"
Save as service-account.json
5. Set Up AWS S3
Create an S3 bucket for image storage
Set up IAM user with S3 permissions:
6. Initialize Database
7. Start the Application
Development Mode
Terminal 1 (Server):

Terminal 2 (Client):

The application will be available at:

Frontend: http://localhost:5173
Backend API: http://localhost:8080
Production Mode
Build the client:

Start the server:

🔧 Environment Variables
Required Variables
Client
Variable	Description	Example
VITE_FIREBASE_API_KEY	Firebase web API key	AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN	Firebase auth domain	myapp.firebaseapp.com
VITE_FIREBASE_PROJECT_ID	Firebase project ID	my-project-12345
VITE_FIREBASE_STORAGE_BUCKET	Firebase storage bucket	my-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID	Firebase sender ID	123456789
VITE_FIREBASE_APP_ID	Firebase app ID	1:123:web:abc...
Server
Variable	Description	Example
FIREBASE_PROJECT_ID	Firebase project ID	my-project-12345
FIREBASE_PRIVATE_KEY	Firebase service account private key	-----BEGIN PRIVATE KEY-----...
FIREBASE_CLIENT_EMAIL	Firebase service account email	firebase-adminsdk-xxx@my-project.iam.gserviceaccount.com
AWS_ACCESS_KEY_ID	AWS access key	AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY	AWS secret key	wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION	AWS region	us-east-2
S3_BUCKET_NAME	S3 bucket name	nomnomnotes-images
PORT	Server port	8080
NODE_ENV	Environment mode	development or production
📖 Usage
Creating Your First Diary Entry
Sign Up/Login: Create an account or sign in with Google
Set Username: Choose a display name for your profile
Create Entry: Click the "+" button to add a new diary entry
Add Details:
Restaurant name and location
Upload photos of your meal
Rate taste, service, and value
Add notes and select cuisine types
Set price range and custom labels
Save: Your entry will be saved and visible in your diary
Managing Friends
Find Friends: Use the friend finder with username or UID
Send Requests: Send friend requests to other users
Accept/Decline: Manage incoming friend requests
View Shared Content: See friends' diary entries (if shared)
Filtering and Search
Search: Use the search bar to find entries by restaurant name or notes
Filter by Cuisine: Select specific cuisine types
Filter by Price: Choose price ranges
Filter by Labels: Select custom labels
Sort: Order by most recent or highest rated
📡 API Documentation
Authentication Routes (/api/auth)
POST /api/diary/initfriend
Initialize a new user in the database.

Headers:

Body:

Diary Routes (/api/diary)
GET /api/diary
Get all diary entries for the authenticated user.

Headers:

Response:

POST /api/diary/create
Create a new diary entry.

Headers:

Cont
Body (FormData):

File
PUT /api/diary/edit/:id
Edit an existing diary entry.

Headers:

User Routes (/api/user)
GET /api/user/friends
Get user's friends list.

GET /api/user/friends/requests
Get pending friend requests.

POST /api/user/add-friend
Send a friend request.

PATCH /api/user/updateUsername
Update user's display name.

🗄️ Database Schema
Tables
users
diary_entries

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

friends

CREATE TABLE friends (
    user_id TEXT PRIMARY KEY,
    friends TEXT DEFAULT '[]',
    sent_requests TEXT DEFAULT '[]',
    received_requests TEXT DEFAULT '[]',
    FOREIGN KEY (user_id) REFERENCES users(uid)
);

📁 Project Structure
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

🧪 Testing
Run tests for the database layer:
cd sqlDB
npm test

Run server tests:
cd server
npm test
🚀 Deployment
Frontend (Vercel/Netlify)
Build the client: