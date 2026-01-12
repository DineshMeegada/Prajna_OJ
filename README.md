# Prajna OJ

Prajna OJ is a modern, full-featured Online Judge platform built with a high-performance backend and a stunning, coder-friendly frontend. It allows users to browse problems, write code in multiple languages (Python, C++), and get real-time verdicts including "Accepted", "Wrong Answer", "Time Limit Exceeded", etc.

## 🚀 Features

- **Authentication**: Secure JWT-based auth with Google Login and "Forgot Password" flow.
- **Problem Bank**: Browse and solve algorithmic problems.
- **Online Compiler**: Integrated Monaco Editor with multi-language support (Python 3, C++ 17).
- **Judge System**: Dockerized judge environment for secure and isolated code execution.
- **AI Review**: Get AI-powered feedback on your code (Premium feature).
- **Responsive UI**: Glassmorphism design with a dark aesthetic, optimized for all devices.
- **Admin Dashboard**: Manage problems and users (for Admins/Masters).

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, CSS Modules
- **State Management**: React Context
- **Editor**: Monaco Editor (`@monaco-editor/react`)

### Backend
- **Framework**: [Django REST Framework](https://www.django-rest-framework.org/)
- **Language**: Python 3.10+
- **Database**: PostgreSQL
- **Task Queue**: Celery & Redis
- **Auth**: `django-allauth`, `dj-rest-auth`, JWT

### DevOps
- **Containerization**: Docker & Docker Compose
- **Judge Environment**: Isolated containers for running user code.

## 📦 Installation & Setup

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- Git

### Steps

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/DineshMeegada/Prajna_OJ.git
    cd Prajna_OJ
    ```

2.  **Environment Setup**
    - The project comes with a default configuration in `docker-compose.yml`.
    - `postgres_data` is configured as a Docker volume.
    - Ensure your ports `8000`, `8001`, `3000`, `5435`, `6379` are free.

3.  **Run with Docker Compose**
    ```bash
    docker-compose up -d --build
    ```
    This command will:
    - Build the backend and judge images.
    - Start PostgreSQL, Redis, Celery, and the Backend server.

4.  **Frontend Setup**
    Open a new terminal for the frontend:
    ```bash
    cd frontend/prajna
    npm install
    npm run dev
    ```
    The frontend will be available at [http://localhost:3000](http://localhost:3000).

5.  **Access the App**
    - **Frontend**: [http://localhost:3000](http://localhost:3000)
    - **Backend API**: [http://localhost:8001/api/v1/](http://localhost:8001/api/v1/)

## 🧪 Testing

- **Run Backend Tests**: `docker exec -it prajna_oj-backend-1 python manage.py test`
- **Lint Frontend**: `cd frontend/prajna && npm run lint`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Commit your changes (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/YourFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
