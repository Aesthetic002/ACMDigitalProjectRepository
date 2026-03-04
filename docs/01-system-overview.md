# System Overview

## 1. The "Big Picture"

The ACM Digital Project Repository uses a modern **Three-Tier Architecture** tailored for cloud deployment. It is designed to be scalable, secure, and user-friendly.

![Architecture Diagram](https://mermaid.ink/img/pako:eNptkMFqwzAMhl_F6NRC-wI9DBa20zaG3WzHowi210RiOxxbKSXs3efkdB100M0S_v_Tj2R7Q845Q4bqeTNoCx-19ejaWzgce_j6-IR4PMLH5_v3Rzge4XW_R6M9KqVRCQ3aaC-1tVpZpZTW1qAD2tJ7Y7Xe6I0x4NArQzYc-kL-3_yCDi0qow3a0qE7lC0twaAzo9TIG1oZtP9i9vKAvW-gRyu1L6C0hV5ro3f4iZ_4L_7E9_iO2d1lM0mSSZpNMp_kZJL5ZDbJbJLdJKeTzCfZXjZ32Uyyu8t8kvkk80nmk5xMMp9MOckwCV8XFMcfsFhe0A)

```mermaid
graph TD
    User((User))
    
    subgraph Client [Client Side (Browser)]
        Frontend[React Application]
    end
    
    subgraph Cloud [Cloud Services]
        Firebase[Firebase Auth & Firestore]
    end
    
    subgraph Server [Backend Server]
        API[Express REST API]
    end

    User <-->|Interacts| Frontend
    Frontend <-->|Authenticates| Firebase
    Frontend <-->|Data Requests + Auth Token| API
    API <-->|Validates Token & Stores Data| Firebase
```

## 2. The Three Pillars

### A. The Frontend (Client)
*   **Technology**: React (Vite) + Tailwind CSS
*   **Role**: This is what you see in the browser. It handles:
    *   Displaying pages (Home, Dashboard, Projects).
    *   Taking user input (Forms, buttons).
    *   **Communicating with Google**: This is crucial. Only the browser can securely ask the user for their Google Password. The server cannot see this.

### B. The Backend (Server)
*   **Technology**: Node.js + Express
*   **Role**: The "Brain" and "Bodyguard" of the application.
    *   **Security**: It verifies that the user is who they say they are before saving data.
    *   **Logic**: It handles business rules (e.g., "Only Admins can approve projects").
    *   **API**: It provides endpoints (like `/api/v1/projects`) that the Frontend calls to fetch or save data.

### C. The Database & Auth (Cloud)
*   **Technology**: Google Firebase (Firestore + Authentication)
*   **Role**: The "Vault".
    *   **Authentication**: Google handles the hard work of encrypting passwords and managing sessions.
    *   **Firestore**: A NoSQL database that stores your Projects, Users, and Reviews as JSON-like documents.

## 3. Why this split?
You asked, **"Why connect Frontend to Firebase directly?"**

1.  **Security (OAuth)**: To log in with Google, the flow **must** start in the browser (Frontend). Google will not allow your backend server to just "send a password" for a user. The user must actively click "Allow" in a popup on their screen.
2.  **Performance**: Firebase allows some direct reads for speed, but having a Backend (Express) allows us to add complex logic (like Admin approvals) that Firebase rules alone make difficult.
3.  **Modern Standard**: This "Headerless" or "Decoupled" approach is the industry standard for modern web apps. It allows you to swap out the Frontend (e.g., build a Mobile App later) without changing the Backend.
