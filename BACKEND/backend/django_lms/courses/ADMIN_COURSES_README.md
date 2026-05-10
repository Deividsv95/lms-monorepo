# Admin Course Management and Real-Time Sync

## Overview

This implementation enables administrators to create and delete courses, with real-time synchronization across all connected users via WebSocket.

## Features

### 1. Admin Course Management Endpoints

#### Create Course (Admin Only)
- **Endpoint**: `POST /api/courses/admin/courses/`
- **Permission**: Admin role required
- **Request Body**:
```json
{
  "title": "Advanced Python",
  "description": "Learn advanced Python concepts"
}
```
- **Response**: Returns the created course with ID, timestamps, and creator info
- **Status**: 201 Created

#### Update Course (Admin Only)
- **Endpoint**: `PUT /api/courses/admin/courses/<course_id>/`
- **Endpoint**: `PATCH /api/courses/admin/courses/<course_id>/`
- **Permission**: Admin role required
- **Description**: Admins can update any course (regardless of who created it)

#### Delete Course (Admin Only)
- **Endpoint**: `DELETE /api/courses/admin/courses/<course_id>/`
- **Permission**: Admin role required
- **Status**: 204 No Content

#### List All Courses (Admin)
- **Endpoint**: `GET /api/courses/admin/courses/`
- **Permission**: Admin role required
- **Returns**: Paginated list of all courses

## Real-Time Synchronization

### WebSocket Connection

When an admin creates, updates, or deletes a course, all connected users are instantly notified via WebSocket.

#### Connecting to WebSocket
```javascript
// Frontend example (JavaScript)
const token = localStorage.getItem('access_token');
const ws = new WebSocket(`ws://localhost:8000/ws/courses/?token=${token}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Course update:', data);
  
  // data.event can be: "course_created", "course_updated", or "course_deleted"
  // data.course contains the full course object
  
  if (data.event === 'course_created') {
    // Add course to local list
  } else if (data.event === 'course_updated') {
    // Update course in local list
  } else if (data.event === 'course_deleted') {
    // Remove course from local list
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket connection closed');
};
```

### Message Format

All WebSocket messages follow this format:
```json
{
  "type": "course_update",
  "event": "course_created|course_updated|course_deleted",
  "course": {
    "id": 1,
    "title": "Course Title",
    "description": "Course Description",
    "created_by": 1,
    "created_at": "2024-05-10T10:00:00Z",
    "updated_at": "2024-05-10T10:00:00Z"
  }
}
```

## How Synchronization Works

1. **Admin creates/updates/deletes a course** via REST API
2. **Django signal is triggered** (post_save or post_delete on Course model)
3. **Signal handler broadcasts message** to all connected WebSocket clients
4. **All connected users receive real-time notification** of the change
5. **Frontend updates UI accordingly** (add, update, or remove course from list)

## Technology Stack

- **Django Channels**: Real-time WebSocket communication
- **Daphne**: ASGI server for handling WebSocket connections
- **In-Memory Channel Layer**: Used in development (channels-redis for production)

## Development Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Development Server
```bash
python manage.py runserver
```

The server will now use Daphne ASGI server instead of the default Django development server.

### 3. Test WebSocket Connection

You can test the WebSocket using any WebSocket client:
- **URL**: `ws://localhost:8000/ws/courses/?token=<your_jwt_token>`
- **Authentication**: JWT token must be passed as a query parameter

## Authentication

WebSocket connections require JWT authentication:
1. User logs in and receives access token
2. Token is passed as `token` query parameter in WebSocket URL
3. Consumer verifies token and authenticates the user
4. If token is invalid or missing, connection is rejected

## Permissions

- **Admins**: Can create, read, update, and delete all courses
- **Teachers**: Can create, read courses they created; read all courses
- **Students**: Can view all courses and enroll in them

## Future Enhancements

- Add Redis channel layer for production multi-server deployment
- Add presence tracking (who's viewing which courses)
- Add course activity notifications
- Implement course subscription/filtering by user role
- Add rate limiting for course operations
