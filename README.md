
# LMS Monorepo

This is a fullstack LMS project with separate backend and frontend apps in one repo. Students can browse and enroll in courses, teachers can manage their own courses, and admins can manage courses and users.

## Project Structure

```text
lms-monorepo/
├── BACKEND/backend/django_lms/
└── FRONTEND/FrontendLMS/
```

More setup details:
- [BACKEND/backend/django_lms/README.md](BACKEND/backend/django_lms/README.md)
- [FRONTEND/FrontendLMS/README.md](FRONTEND/FrontendLMS/README.md)

## Stack

Backend:
- Python
- Django
- Django REST Framework
- JWT auth
- Channels

Frontend:
- React
- Vite
- CSS

## Main Features

- Login with JWT
- Student course browsing and enrollment
- Teacher course create, update, and delete
- Admin course and user management
- Real-time course updates with WebSockets

## Links

- Frontend: https://deividsv95.github.io/
- Backend: https://lms-monorepo-zrob.onrender.com/api/v1/

## Quick Start

### Backend

```bash
cd BACKEND/backend/django_lms
python -m venv venv
# Windows: venv\Scripts\Activate.ps1
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file with at least:

```text
SECRET_KEY=replace-this-with-a-real-key
```

Then run:

```bash
python manage.py migrate
python manage.py seed_demo_users
python manage.py runserver
```

Backend runs at `http://127.0.0.1:8000`

### Frontend

```bash
cd FRONTEND/FrontendLMS
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

## Demo Accounts

```text
admin_demo    / Admin@123    / admin
teacher_demo  / Teacher@123  / teacher
student_demo  / Student@123  / student
```

## Testing

Backend tests:

```bash
cd BACKEND/backend/django_lms
python manage.py test
```

Frontend tests:

```bash
cd FRONTEND/FrontendLMS
npm install
npm run test
```

Optional API script:

```powershell
cd FRONTEND/FrontendLMS
powershell -ExecutionPolicy Bypass -File .\run_tests.ps1 -BaseUrl http://localhost:8000
```

Production build:

```bash
cd FRONTEND/FrontendLMS
npm run build
```

## Wireframe

![Wireframe](./wireframe.png)

## Environment Variables

Backend environment setup is documented in [BACKEND/backend/django_lms/README.md](BACKEND/backend/django_lms/README.md).

The frontend does not need a `.env` file by default.




## Developer Notes & Retrospective

Building this LMS was a huge learning curve. The biggest challenge was taking the original, massive vanilla JavaScript file and breaking it down into clean, modular React components while keeping the student, teacher, and admin roles separate. 

The backend was a massive hurdle, especially since it was my first time using Render to deploy a Python API. Getting the GitHub Pages frontend and the Render backend container to actually communicate with each other was incredibly challenging due to cross-origin issues and deployment mismatches. To debug it, I relied heavily on VS Code to trace exactly what the code was doing step-by-step. I had to look back through a ton of my old personal notes and previous course lessons to fix countless layout and connection mistakes. When I got stuck, I turned to a current LMS used in my workplace to to have a rough idea of what i wanted to achieve i also used Google, YouTube, and social media developer communities for inspiration and troubleshooting help. Because of those bottlenecks, I ended up having to rewrite and simplify a lot of the code to strip out unnecessary complexity and finally get the connection stable. 

Getting the student enrollment flow to instantly update the dashboard layout took some serious work with React state lifecycles. But after all the simplification and plenty of long nights, everything connects perfectly now, the app runs smoothly, and I am incredibly happy with how the project turned out!


### What I Would Add Next (Future Scopes)
Given more time, my next priority would be adding a student progress tracker to visualize course completion percentages and actual course material that could be used. I would also like to implement soft-deletes for courses so that teachers don’t accidentally wipe out student enrollment histories, and add a simple profile picture upload feature to make the profiles more authentic to the user. Visually i would like to add page transitions to give it a more premium look.