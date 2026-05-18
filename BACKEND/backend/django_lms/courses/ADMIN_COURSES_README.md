# Admin Course Management and Real-Time Sync

## Overview

This implementation provides **admin course management** with **real-time WebSocket synchronization**. Admins can create, update, and delete any course, and all changes are instantly broadcast to all connected users (students, teachers, and other admins) without requiring page refreshes.

## Key Capabilities

✅ **Admin Full Control** — Admins can create, update, and delete any course (not restricted to courses they created)  
✅ **Real-Time Synchronization** — All course changes broadcast to connected users via WebSocket  
✅ **Cross-Role Visibility** — Students can see courses created by teachers AND admins  
✅ **Automatic UI Updates** — Course lists update instantly for all users without page reload  
✅ **JWT Authentication** — WebSocket connections secured with JWT tokens  
- **Graceful Fallback** — In-memory channel layer keeps the demo self-contained

## Features

### 1. Admin Course Management Endpoints

#### Create Course (Admin Only)
- **Endpoint**: `POST /api/courses/admin/courses/`
- **Permission**: `IsAdminRole` required
- **Request Body**:
```json
{
  "title": "Advanced Python Programming",
  "description": "Master advanced Python concepts and best practices"
}
```
- **Response**: Returns the created course object
- **Status**: 201 Created

#### Update Course (Full Update - Admin Only)
- **Endpoint**: `PUT /api/courses/admin/courses/<course_id>/`
- **Permission**: `IsAdminRole` required
- **Request Body**: Complete course data required
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```
- **Response**: Returns the updated course object
- **Status**: 200 OK

#### Partial Update (Admin Only)
- **Endpoint**: `PATCH /api/courses/admin/courses/<course_id>/`
- **Permission**: `IsAdminRole` required
- **Request Body**: Only fields to update
```json
{
  "title": "New Title"
}
```
- **Status**: 200 OK

#### Delete Course (Admin Only)
- **Endpoint**: `DELETE /api/courses/admin/courses/<course_id>/`
- **Permission**: `IsAdminRole` required
- **Status**: 204 No Content

#### List All Courses (Admin)
- **Endpoint**: `GET /api/courses/admin/courses/`
- **Permission**: `IsAdminRole` required
- **Response**: Paginated list of all courses
- **Pagination**: 20 courses per page by default

#### Get Course Details
- **Endpoint**: `GET /api/courses/admin/courses/<course_id>/`
- **Note**: Use detail views for individual course retrieval

## Real-Time Synchronization

### WebSocket Connection

When any admin creates, updates, or deletes a course, all connected users (students, teachers, other admins) are instantly notified via WebSocket.

#### Connecting to WebSocket
```javascript
// Frontend example (JavaScript)
const accessToken = localStorage.getItem('accessToken');
const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const wsUrl = `${wsProtocol}://${window.location.host}/ws/courses/?token=${accessToken}`;
const ws = new WebSocket(wsUrl);

ws.onopen = () => {
  console.log('Connected to course updates');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Course update:', data);
  
  // data.event can be: "course_created", "course_updated", or "course_deleted"
  // data.course contains the full course object
  
  if (data.event === 'course_created') {
    // Add course to local list
    addCourseToUI(data.course);
  } else if (data.event === 'course_updated') {
    // Update course in local list
    updateCourseInUI(data.course);
  } else if (data.event === 'course_deleted') {
    // Remove course from local list
    removeCourseFromUI(data.course.id);
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket connection closed');
  // Implement reconnection logic if needed
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

1. **Admin Action** — Admin creates/updates/deletes a course via REST API (`POST /api/courses/admin/courses/`, etc.)
2. **Signal Trigger** — Django post_save or post_delete signal is automatically triggered on Course model
3. **Signal Handler** — Signal handler in `courses/signals.py` serializes the course and broadcasts the event
4. **Channel Broadcast** — Event is sent to "courses_updates" channel group via Channels layer
5. **WebSocket Notification** — All connected WebSocket clients in the group receive the update message
6. **Frontend Update** — JavaScript processes the event and updates the local course list
7. **UI Re-render** — React/vanilla JS re-renders the course list on the screen

### Architecture Diagram

```
Admin REST API Request
       ↓
Django View (AdminCourseView)
       ↓
Course Model Save/Delete
       ↓
Django Signal (post_save/post_delete)
       ↓
Signal Handler (broadcasts to "courses_updates" group)
       ↓
Channels Layer (InMemoryChannelLayer)
       ↓
WebSocket Group Send
       ↓
All Connected WebSocket Clients Receive Update
       ↓
Frontend JavaScript Handler
       ↓
Update Local State + Re-render UI
```

## Technology Stack

- **Django Channels**: Real-time WebSocket communication protocol support
- **Daphne**: ASGI application server (replaces WSGI for async support)
- **ASGI Protocol**: Supports both HTTP and WebSocket protocols
- **In-Memory Channel Layer**: Used by this repository (`InMemoryChannelLayer`)

### Installed Dependencies
```
channels==4.0.0
daphne==4.0.0
```

## Development Setup

### 1. Install Dependencies
```bash
cd BACKEND/backend/django_lms
pip install -r requirements.txt
```

### 2. Run Development Server
```bash
python manage.py runserver
```

**Important**: Run the backend with ASGI support enabled so WebSocket routes are available. Typical output includes:
```
Starting ASGI/Daphne version 4.0.0 development server at http://127.0.0.1:8000/
```

### 3. Test WebSocket Connection

You can test the WebSocket using:

**Browser DevTools Console:**
```javascript
const token = 'your_jwt_access_token';
const ws = new WebSocket(`ws://localhost:8000/ws/courses/?token=${token}`);
ws.onmessage = (e) => console.log(JSON.parse(e.data));
ws.onopen = () => console.log('Connected');
ws.onerror = (e) => console.error('Error', e);
```

**WebSocket CLI Tool:**
```bash
wscat -c "ws://localhost:8000/ws/courses/?token=<your_jwt_token>"
```

**Curl/HTTP Client:**
Most modern browsers and HTTP clients (Postman, Insomnia) support WebSocket connections.

## Authentication

WebSocket connections require JWT authentication:

1. **User Login** — User logs in via `/api/auth/login/` and receives `access` token
2. **Token Storage** — Frontend stores token (typically in localStorage or sessionStorage)
3. **WebSocket Connection** — Client connects with URL: `ws://localhost:8000/ws/courses/?token=<access_token>`
4. **Token Verification** — Consumer middleware extracts token from URL query parameters
5. **User Authentication** — Token is decoded and verified; user is authenticated
6. **Connection Established** — If valid, WebSocket connection is accepted
7. **Connection Rejected** — If invalid or missing, connection is closed

**Token Lifecycle:**
- Access tokens expire after 60 minutes
- If token expires during WebSocket session, connection becomes invalid
- Client should reconnect with a fresh token obtained via refresh endpoint

## Permissions

| Feature | Student | Teacher | Admin |
|---------|---------|---------|-------|
| View all courses | ✓ | ✓ | ✓ |
| Create course | ✗ | ✓ (own) | ✓ (any) |
| Update course | ✗ | ✓ (own) | ✓ (any) |
| Delete course | ✗ | ✓ (own) | ✓ (any) |
| Manage users | ✗ | ✗ | ✓ |
| Receive WebSocket updates | ✓ | ✓ | ✓ |

## Troubleshooting

### WebSocket Connection Fails
**Symptom**: WebSocket connections immediately close or fail to establish
**Causes**:
- Invalid or expired JWT token
- Backend not running with ASGI/WebSocket support
- Firewall blocking WebSocket connections
- Incorrect WebSocket URL

**Solution**:
1. Verify token is valid: `python manage.py shell` → `from rest_framework_simplejwt.tokens import AccessToken` → `AccessToken(token)`
2. Check backend is running with ASGI output after `python manage.py runserver`
3. Check browser console for errors (F12 → Console tab)
4. Verify WebSocket URL format: `ws://hostname:port/ws/courses/?token=<token>`

### Course Updates Not Broadcasting
**Symptom**: Course changes don't appear for other users
**Causes**:
- WebSocket connection not established
- Backend using wrong channel layer configuration
- Signal handlers not registered

**Solution**:
1. Verify WebSocket is connected: `ws.readyState === WebSocket.OPEN`
2. Check channel layer: `python manage.py shell` → `from channels.layers import get_channel_layer` → `get_channel_layer()`
3. Verify signals are registered: Check `courses/apps.py` has `ready()` method that imports signals

### Multiple Users Not Seeing Updates
**Symptom**: Only the user who made the change sees the update
**Causes**:
- Each user needs their own WebSocket connection
- Users not logged in (no active session)
- Connections closing unexpectedly

**Solution**:
1. Have all users log in to establish their own WebSocket connection
2. Check that all connections are to "courses_updates" group
3. Verify no connection errors in DevTools

## Channel Layer Setup

Current configuration:
```python
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer"
    }
}
```
- Single-process only
- No persistence
- Configured in `config/settings/base.py`

## API Examples

### Create Course
```bash
curl -X POST http://localhost:8000/api/courses/admin/courses/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Web Development",
    "description": "Learn modern web development"
  }'
```

### Update Course
```bash
curl -X PUT http://localhost:8000/api/courses/admin/courses/1/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced Web Development",
    "description": "Master advanced web techniques"
  }'
```

### Delete Course
```bash
curl -X DELETE http://localhost:8000/api/courses/admin/courses/1/ \
  -H "Authorization: Bearer <token>"
```

### List Courses
```bash
curl http://localhost:8000/api/courses/admin/courses/ \
  -H "Authorization: Bearer <token>"
```

## Future Enhancements

- 👁️ Add presence tracking (who's viewing which courses)
- 📢 Add course activity notifications (enrollment, completion)
- 🔔 Implement course subscription/filtering by user role
- ⏱️ Add rate limiting for course operations
- 🔄 Add automatic reconnection logic in frontend
- 📱 Add mobile-optimized WebSocket client
- 📊 Add analytics for course creation/deletion events
- 🔐 Add additional security checks for WebSocket connections
- 🗂️ Add course categories and filtering by category
