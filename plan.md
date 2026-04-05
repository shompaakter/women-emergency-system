# Women Emergency Response System — Implementation Plan
## 1. Project Overview
**Project name:** Women Emergency Response System

**Goal:** Build a response system for women that can be used in case of emergency or unsafe situations such as being followed, approached or stalked while outside by themselves. 

The system allows:
- users to register and provide a list of trusted contacts
- admin can view users, detect and remove suspicious users, view SOS alert history, manage database

The system contains the feature of SOS button which registered users can use. When pressed to activate OS, the button will:
- send an alert message through SMS to trusted contacts of the user
- send link of the users live location to their trusted contacts so that the user receives immediate help as soon as possible.

## 2. Core vision
The system is a safety response system that is designed to help women get immediate help if they face any unsafe situation. 
- With a single click on the SOS button, the system enables a user to imdiate help.

## 3. Technology
### Frontend 
- Next.js
- React
- Tailwind CSS
- Axios
- Geolocation API
- Leaflet
- OpenStreetMap

### Backend 
- Node.js
- Express.js

### Database 
- MongoDB

### Authentication 
- NextAuth.js or JWT-based custom auth

### File/Image Storage 
- 

### Deployment (Free)### 
- Vercel (frontend)
- Render (backend)
- MongoDB Atlas (database)

## 4. Primary user roles 
### 1. Visitor 
- Can visit the website and explore the about page 
- Can register by creating an account and filling the form of trusted contacts.

### 2. User 
- Can activate SOS button in case of emergency and receive its benefits.
- Can update profile information, add or remove a trusted contact from the list of trusted contacts.
### 3. Admin 
- can view and manage users
- can detect and remove suspicious users
- can view SOS alert history.

## 5. Features

### 1. User Features
### User registration and login 
- Users can register with this system by using their phone number. An OTP will then be sent to the phone number and the user is verified.
- Once verified, the user must complete the form of trusted contacts, providing their name and contact number.
- Users must also allow location access for the system to work accurately. Once registered, users can access the services provided by the system. 

### Trusted contact management (For User) 
- Users can add, update and delete their trusted contacts list whenever needed. 

### SOS button 

When a user senses they are in any unsafe situation, they can simple press the SOS button, which will immediately :
- Send an emergency message to their trusted contacts
- Send maps live location link to trusted contacts

### Real-time GPS location tracking 
- Real time GPS tracking allows a user’s trusted contact (a family member or a trusted frined) to exactly identify the users location and movements. This plays a major role to help the contacts to easily find and reach the user when they receive the SOS alert.

### 2. Admin Features
- View all registered users and their alert history
- View or track live SOS alerts
- Detect and remove suspicious accounts or users

## 6. Folder Structure

```
frontend
├── app
│   ├── page.js
│   ├── login
│   │   └── page.js
│   ├── register
│   │   └── page.js
│   ├── dashboard
│   │   └── page.js
│   ├── contacts
│   │   └── page.js
│   └── sos
│       └── page.js
│
├── components
│   ├── Navbar.js
│   ├── Footer.js
│   ├── SOSButton.js
│   └── ContactCard.js
│
├── services
│   └── api.js
│
└── utils
    └── getLocation.js

backend
├── models
│   ├── User.js
│   ├── Contact.js
│   └── Alert.js
│
├── routes
│   ├── authRoutes.js
│   ├── contactRoutes.js
│   └── sosRoutes.js
│
├── controllers
│   ├── authController.js
│   ├── contactController.js
│   └── sosController.js
│
└── server.jsx
```
## 7. Pages to build
### 1. Home Page 

Contains
- system introduction
- safety information
- login/register button

### 2. Register Page 

Shows Fields
- name
- phone number
- password

### 3. Login Page 
Shows Fields
- phone number
- password

### 4. User Dashboard Page 
- profile summary
- trusted contacts preview
- SOS button

### 5. Trusted Contacts Page 

A user can add, update, delete a contact

shows fields:
- name
- phone number
- relation

### 6. SOS Emergency 
- Main Feature
- Large SOS Button

### 7. Map Page 
- show user location
- display location marker

### 8. Admin Login Page 
- Admin authentication page.

### 9. Admin Dashboard 

Admin can
- view users
- view SOS alerts
- delete suspicious users

## 8. Phase Wise Development Plan

### Phase 1: Project Setup and Environment Configuration
Goal: Prepare the development environment and base project structure.

Tasks:
- Create frontend project using Next.js
- Setup backend using Node.js and Express
- Create Git repository for version control
- Setup MongoDB Atlas database
- Install required packages (Axios, Tailwind CSS, JWT, Mongoose, etc.)
- Create basic folder structure for frontend and backend

### Phase 2: Authentication System
Goal: Implement user registration and login functionality.

Tasks:
- Create user model in MongoDB- Implement user registration API
- Implement login API
- Add password hashing for security
- Implement JWT authentication
- Build Register and Login pages
- Connect frontend forms with backend APIs

### Phase 3: User Profile and Trusted Contacts
Goal: Allow users to manage trusted contacts.

Tasks:
- Create Contact model
- Implement APIs for:
  - Add contact
  - Update contact
  - Delete contact
  - View contacts
- Build Trusted Contacts page UI
- Connect frontend with backend APIs

### Phase 4: SOS Emergency Feature
Goal: Implement the core emergency alert system.

Tasks:
- Create SOS button component
- Detect user location using Geolocation API
- Generate location link using Google Maps or OpenStreetMap
- Create Alert model
- Implement API to store SOS alerts
- Send alert message with location link to trusted contacts
- Display confirmation to the user

### Phase 5: Map and Live Location Feature
Goal: Show the user's live location on a map.

Tasks:
- Integrate Leaflet map library
- Use OpenStreetMap for map display
- Display user's current location with marker
- Show map page after SOS activation

### Phase 6: Admin Panel
Goal: Allow admin to manage the system.

Tasks:
- Create admin authentication
- Build Admin Login page
- Build Admin Dashboard
- Show list of users
- Show SOS alert history
- Add functionality to remove suspicious users

### Phase 7: UI/UX Improvements 
Goal: Improve the design and usability of the system.

Tasks:
- Design responsive layout using Tailwind CSS
- Improve dashboard layout
- Improve SOS button visibility
- Add loading states and error messages
- Optimize user experience

### Phase 8: Testing and Deployment
Goal: Ensure the system works correctly and deploy it online.

Tasks:
- Test user registration and login
- Test contact management
- Test SOS alerts and location tracking
- Fix bugs and performance issues
- Deploy frontend to Vercel
- Deploy backend to Render
- Connect MongoDB Atlas database

## 9. Summary
The system will be developed using modern web technologies including Next.js for the frontend, Node.js and Express for the backend, and MongoDB for the database. Deployment will be done using free cloud services such as Vercel, Render, and MongoDB Atlas.

Overall, the project aims to create a simple, accessible, and reliable safety response platform that can help women receive immediate assistance during dangerous situations.
