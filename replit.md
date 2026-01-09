# APK Store

## Overview
A simple APK store application built with Node.js and Express. Users can upload APK files and download previously uploaded applications.

## Project Structure
- `server.js` - Express server with file upload and download endpoints
- `public/` - Static files including the main HTML page
- `uploads/` - Directory where uploaded APK files are stored

## Running the Application
The application runs on port 5000 using the command:
```
npm start
```

## API Endpoints
- `GET /` - Main page with upload form and app list
- `GET /apps` - Returns JSON list of uploaded files
- `POST /upload` - Upload an APK file (multipart/form-data)
- `GET /download/:filename` - Download a specific file

## Dependencies
- express - Web framework
- multer - File upload handling
