# ACM Digital Project Repository - System Architecture

## Table of Contents
- [System Overview](#system-overview)
- [Architecture Patterns](#architecture-patterns)
- [Technology Stack](#technology-stack)
- [Design Principles](#design-principles)
- [Data Architecture](#data-architecture)
- [Security Architecture](#security-architecture)
- [Performance Architecture](#performance-architecture)
- [Future Architecture](#future-architecture)

## System Overview

The ACM Digital Project Repository is a full-stack web application designed to showcase and manage academic computing projects. The system follows a modern microservices architecture with a React frontend, Node.js backend services, and Firebase for authentication and data storage.

### Mission Statement
Enable ACM members to discover, contribute to, and showcase innovative computing projects while providing administrators with tools for content moderation and community management.

### System Context Diagram

```mermaid
C4Context
    title System Context - ACM Digital Project Repository

    Person(student, "ACM Student", "Browses and uploads projects")
    Person(admin, "ACM Admin", "Moderates content and manages platform")
    Person(visitor, "Public Visitor", "Discovers published projects")

    System(acm_app, "ACM Digital Project Repository", "Web platform for project management and discovery")

    System_Ext(firebase, "Firebase", "Authentication, Firestore DB")
    System_Ext(cloudinary, "Cloudinary", "Image & document storage, CDN")
    System_Ext(github, "GitHub", "Source code repositories")

    Rel(student, acm_app, "Manages projects", "HTTPS")
    Rel(admin, acm_app, "Administers platform", "HTTPS")
    Rel(visitor, acm_app, "Browses projects", "HTTPS")

    Rel(acm_app, firebase, "Authenticates users, stores data", "HTTPS/SDK")
    Rel(acm_app, cloudinary, "Stores & serves assets", "HTTPS/API")
    Rel(acm_app, github, "Links to repositories", "HTTPS")
```

### Container Diagram

```mermaid
C4Container
    title Container Diagram - ACM Digital Project Repository

    Person(user, "User", "ACM member or visitor")

    Container_Boundary(c1, "ACM Digital Project Repository") {
        Container(frontend, "Frontend Application", "React, Vite", "Provides user interface and experience")

        Container(api_gateway, "API Gateway", "Node.js, Express", "Routes requests to microservices")

        Container(user_service, "User Service", "Node.js, Express", "Handles authentication and user management")
        Container(project_service, "Project Service", "Node.js, Express", "Manages project CRUD and admin operations")
        Container(asset_service, "Asset Service", "Node.js, Express", "Handles file uploads and storage")
        Container(search_service, "Search Service", "Node.js, Express", "Provides search and discovery features")

        ContainerDb(shared_lib, "Shared Libraries", "Node.js modules", "Common utilities and middleware")
    }

    System_Ext(firebase, "Firebase Platform", "Authentication and Firestore database")
    System_Ext(cloudinary, "Cloudinary", "Asset storage and CDN")

    Rel(user, frontend, "Uses", "HTTPS")
    Rel(frontend, api_gateway, "Makes API calls", "HTTPS/JSON")

    Rel(api_gateway, user_service, "Routes auth requests", "HTTP")
    Rel(api_gateway, project_service, "Routes project requests", "HTTP")
    Rel(api_gateway, asset_service, "Routes asset requests", "HTTP")
    Rel(api_gateway, search_service, "Routes search requests", "HTTP")

    Rel(user_service, shared_lib, "Uses", "Import")
    Rel(project_service, shared_lib, "Uses", "Import")
    Rel(asset_service, shared_lib, "Uses", "Import")
    Rel(search_service, shared_lib, "Uses", "Import")

    Rel(user_service, firebase, "Authenticates, stores users", "HTTPS/SDK")
    Rel(project_service, firebase, "Stores projects", "HTTPS/SDK")
    Rel(asset_service, firebase, "Stores asset metadata", "HTTPS/SDK")
    Rel(search_service, firebase, "Queries data", "HTTPS/SDK")
    Rel(asset_service, cloudinary, "Stores files", "HTTPS/API")
```

## Architecture Patterns

### 1. Microservices Architecture

**Pattern**: Domain-Driven Design with Service Decomposition
- Each service owns a specific business domain
- Services communicate via HTTP/REST APIs
- Shared database with collection-level separation
- Centralized API Gateway for routing

**Benefits**:
- Independent deployment and scaling
- Technology diversity per service
- Better fault isolation
- Team autonomy and ownership

### 2. API Gateway Pattern

**Pattern**: Single Entry Point with Request Routing
- All client requests go through API Gateway
- Service discovery via static configuration
- Centralized cross-cutting concerns (CORS, logging)

```mermaid
graph TB
    Client[Client Applications] --> Gateway[API Gateway :3000]

    Gateway --> UserSvc[User Service :3001]
    Gateway --> ProjectSvc[Project Service :3002]
    Gateway --> AssetSvc[Asset Service :3003]
    Gateway --> SearchSvc[Search Service :3004]

    subgraph "Cross-Cutting Concerns"
        CORS[CORS Headers]
        Logging[Request Logging]
        RateLimit[Rate Limiting]
        Auth[Authentication*]
    end

    Gateway -.-> CORS
    Gateway -.-> Logging
    Gateway -.-> RateLimit
    Gateway -.-> Auth

    Note["* Authentication handled by individual services currently"]
```

### 3. Shared Database Pattern

**Pattern**: Single Database, Multiple Service Access
- All services share Firebase Firestore instance
- Collection-level data ownership boundaries
- Eventual consistency across services

**Trade-offs**:
- ✅ Simplified transactions and queries
- ✅ Reduced operational complexity
- ❌ Tight coupling between services
- ❌ Schema coordination required

### 4. Backend for Frontend (BFF) Pattern

**Pattern**: API designed specifically for web frontend needs
- RESTful APIs tailored for React application
- Aggregated responses to minimize round trips
- Frontend-friendly data structures

## Technology Stack

### Frontend Technology Choices

```mermaid
graph TB
    subgraph "Frontend Stack"
        A[React 18] --> B[Modern Hooks & Context]
        A --> C[Component-Based UI]

        D[Vite] --> E[Fast Development Server]
        D --> F[Optimized Production Builds]

        G[JavaScript/ES6+] --> H[Modern Language Features]

        I[CSS3 + Flexbox/Grid] --> J[Responsive Design]

        K[Firebase SDK] --> L[Client-side Auth]
        K --> M[Real-time Updates]
    end

    subgraph "Build & Development"
        N[ESLint] --> O[Code Quality]
        P[Vite Plugin System] --> Q[Hot Module Replacement]
    end
```

**Rationale**:
- **React**: Component reusability, large ecosystem, team familiarity
- **Vite**: Faster builds than webpack, better development experience
- **Firebase SDK**: Direct integration with backend services
- **Modern JavaScript**: Better performance, cleaner code

### Backend Technology Choices

```mermaid
graph TB
    subgraph "Runtime & Platform"
        A[Node.js 18+] --> B[JavaScript Everywhere]
        A --> C[NPM Ecosystem]
        A --> D[Async I/O Performance]
    end

    subgraph "Web Framework"
        E[Express.js] --> F[Mature HTTP Server]
        E --> G[Middleware Ecosystem]
        E --> H[RESTful API Design]
    end

    subgraph "Database & Auth"
        I[Firebase Admin SDK] --> J[Firestore NoSQL]
        I --> K[Firebase Authentication]
        I --> L[Google Cloud Integration]
    end

    subgraph "File Storage"
        M[Cloudinary] --> N[Image Optimization]
        M --> O[Global CDN]
        M --> P[Automatic Transformations]

        Q[Firebase Storage] --> R[Legacy File Support]
    end

    subgraph "Development Tools"
        S[Nodemon] --> T[Auto-restart Development]
        U[Concurrently] --> V[Multi-service Orchestration]
        W[Dotenv] --> X[Environment Configuration]
    end
```

**Rationale**:
- **Node.js**: Single language across stack, good for I/O intensive operations
- **Express.js**: Lightweight, flexible, extensive middleware ecosystem
- **Firebase**: Managed authentication, real-time database, Google integration
- **Cloudinary**: Professional asset management, better than building custom solution

### External Service Integration

```mermaid
graph LR
    subgraph "Authentication"
        A[Firebase Auth] --> B[JWT Tokens]
        A --> C[Social Logins]
        A --> D[User Management]
    end

    subgraph "Data Storage"
        E[Firestore] --> F[Document Database]
        E --> G[Real-time Sync]
        E --> H[Offline Support]
    end

    subgraph "Asset Management"
        I[Cloudinary] --> J[Image Processing]
        I --> K[Video Support]
        I --> L[CDN Distribution]
    end

    subgraph "Code Repositories"
        M[GitHub API] --> N[Repository Links]
        M --> O[Issue Tracking]
        M --> P[Contribution Stats]
    end
```

## Design Principles

### 1. Domain-Driven Design (DDD)

Services are organized around business capabilities:

```mermaid
graph TB
    subgraph "User Domain"
        UA[Authentication]
        UB[User Profiles]
        UC[Role Management]
    end

    subgraph "Project Domain"
        PA[Project CRUD]
        PB[Project Discovery]
        PC[Taxonomy/Tags]
    end

    subgraph "Asset Domain"
        AA[File Upload]
        AB[Storage Management]
        AC[CDN Delivery]
    end

    subgraph "Search Domain"
        SA[Full-text Search]
        SB[Filtering]
        SC[Result Ranking]
    end

    subgraph "Admin Domain"
        ADA[Content Moderation]
        ADB[User Management]
        ADC[Platform Statistics]
    end
```

### 2. Separation of Concerns

**Layered Architecture within Services**:
```
┌─────────────────┐
│   Routes        │ ← HTTP endpoint definitions
├─────────────────┤
│   Controllers   │ ← Business logic coordination
├─────────────────┤
│   Services      │ ← Core business operations
├─────────────────┤
│   Data Access   │ ← Firebase/Cloudinary integration
├─────────────────┤
│   Models        │ ← Data structure definitions
└─────────────────┘
```

### 3. Fail-Fast Principle

- Input validation at service boundaries
- Early error detection and reporting
- Graceful degradation when external services fail

### 4. Configuration over Convention

- Environment-based configuration
- Explicit service discovery
- Configurable external service endpoints

## Data Architecture

### Data Flow Patterns

```mermaid
flowchart TD
    A[Client Request] --> B[API Gateway]
    B --> C{Route Decision}

    C -->|User Data| D[User Service]
    C -->|Project Data| E[Project Service]
    C -->|File Data| F[Asset Service]
    C -->|Search Query| G[Search Service]

    D --> H[Firebase Auth]
    D --> I[Firestore Users Collection]

    E --> I
    E --> J[Firestore Projects Collection]
    E --> K[Firestore Tags Collection]

    F --> J
    F --> L[Cloudinary API]
    F --> M[Firebase Storage]

    G --> I
    G --> J
    G --> K

    H --> N[Client Response]
    I --> N
    J --> N
    K --> N
    L --> N
    M --> N
```

### Data Consistency Model

**Eventual Consistency**:
- Services may have slightly stale data
- Updates propagate through shared database
- Client-side optimistic updates for better UX

**Strong Consistency**:
- Authentication decisions (critical security)
- Financial or audit-related operations (future)

### Caching Strategy

```mermaid
graph TB
    subgraph "Caching Layers"
        A[Browser Cache] --> B[Static Assets, API Responses]
        C[CDN Cache] --> D[Cloudinary Images, Public Files]
        E[Application Cache] --> F[Firebase Queries, User Sessions]
        G[Database Cache] --> H[Firestore Internal Caching]
    end

    subgraph "Cache Invalidation"
        I[Time-based TTL] --> J[Static Content]
        K[Event-based] --> L[User Data Changes]
        M[Manual] --> N[Admin Operations]
    end
```

## Security Architecture

### Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant U as User Browser
    participant F as Frontend App
    participant G as API Gateway
    participant S as Service
    participant FB as Firebase Auth
    participant FS as Firestore

    U->>F: Login Credentials
    F->>FB: Authenticate User
    FB-->>F: ID Token (JWT)
    F->>F: Store Token (localStorage)

    Note over F: Subsequent API Calls
    F->>G: API Request + Bearer Token
    G->>S: Forward Request + Token
    S->>FB: Verify Token
    FB-->>S: User Claims
    S->>FS: Query with User Context
    FS-->>S: Filtered Results
    S-->>G: Response
    G-->>F: Response
```

### Security Layers

**1. Transport Security**:
- HTTPS enforced in production
- Firebase SDK encryption in transit
- Cloudinary secure URLs

**2. Authentication Security**:
- Firebase ID tokens (JWT with Google signing)
- Token expiration (1 hour default)
- Refresh token rotation

**3. Authorization Security**:
- Role-based access control (user, admin)
- Resource ownership validation
- Firebase Security Rules as backup

**4. Input Security**:
- Request validation middleware
- File type and size restrictions
- SQL injection prevention (NoSQL database)

**5. Data Security**:
- User data isolation by UID
- Soft deletes for audit trails
- Admin action logging

### Security Configuration

```javascript
// Firebase Security Rules Example
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }

    // Projects are readable by authenticated users
    match /projects/{projectId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        (request.auth.uid == resource.data.ownerId ||
         isAdmin(request.auth.uid));
    }
  }
}
```

## Performance Architecture

### Performance Optimization Strategies

```mermaid
graph TB
    subgraph "Frontend Optimizations"
        A[Code Splitting] --> A1[Lazy Loading Components]
        B[Bundle Optimization] --> B1[Tree Shaking, Minification]
        C[Caching] --> C1[Browser Cache, Service Workers]
    end

    subgraph "Backend Optimizations"
        D[Connection Pooling] --> D1[Firebase Admin SDK]
        E[Query Optimization] --> E1[Firestore Indexes]
        F[Response Compression] --> F1[Gzip Middleware]
    end

    subgraph "Infrastructure Optimizations"
        G[CDN] --> G1[Cloudinary Global Distribution]
        H[Load Balancing] --> H1[API Gateway Routing]
        I[Horizontal Scaling] --> I1[Independent Service Scaling]
    end
```

### Monitoring & Observability

**Application Metrics**:
- Response time per endpoint
- Request volume per service
- Error rates and patterns
- User session analytics

**Infrastructure Metrics**:
- CPU and memory usage per service
- Network I/O patterns
- Database query performance
- External API latency

**Business Metrics**:
- User registration/retention rates
- Project upload success rates
- Search query patterns
- Asset storage utilization

## Future Architecture

### Planned Architectural Improvements

```mermaid
graph TB
    subgraph "Current State (v1.0)"
        A[Synchronous HTTP] --> B[Simple Request/Response]
        C[Shared Database] --> D[All Services → Firestore]
        E[Manual Scaling] --> F[Static Service Instances]
    end

    subgraph "Future State (v2.0)"
        G[Event-Driven Architecture] --> H[Async Message Queues]
        I[Database per Service] --> J[Service-Owned Data]
        K[Auto Scaling] --> L[Container Orchestration]
        M[Service Mesh] --> N[Advanced Networking]
    end

    A -.->|Evolution| G
    C -.->|Migration| I
    E -.->|Enhancement| K
    B -.->|Addition| M
```

### Technology Roadmap

**Phase 1 (Current)**: Microservices Foundation
- ✅ Service decomposition
- ✅ API Gateway implementation
- ✅ Shared libraries
- ✅ Health monitoring

**Phase 2 (Next 6 months)**: Enhanced Resilience
- Circuit breakers for external services
- Redis caching layer
- Comprehensive logging (ELK stack)
- API rate limiting

**Phase 3 (6-12 months)**: Advanced Architecture
- Event sourcing for audit trails
- CQRS for read/write separation
- Message queues (RabbitMQ/Apache Kafka)
- Container orchestration (Docker + Kubernetes)

**Phase 4 (12+ months)**: Platform Maturity
- Service mesh (Istio/Linkerd)
- Advanced monitoring (Prometheus/Grafana)
- AI/ML integration for project recommendations
- Multi-tenant architecture for different organizations

### Scaling Strategy

```mermaid
graph TD
    A[Current: Single Tenant] --> B[Multi-Tenant SaaS]
    C[Regional Deployment] --> D[Global Distribution]
    E[Reactive Scaling] --> F[Predictive Auto-scaling]
    G[Manual Monitoring] --> H[AI-Driven Operations]

    subgraph "Scaling Dimensions"
        I[Horizontal: More Instances]
        J[Vertical: Bigger Machines]
        K[Functional: More Services]
        L[Geographic: More Regions]
    end
```

---

**Architecture Benefits Achieved**:
- ✅ Modular, maintainable codebase
- ✅ Independent service lifecycle
- ✅ Technology flexibility
- ✅ Improved fault tolerance
- ✅ Better developer experience
- ✅ Simplified testing and deployment

**Next: See [CLOUDINARY-INTEGRATION.md](./CLOUDINARY-INTEGRATION.md) for asset management details**