/**
 * Mock Data for Frontend Development
 *
 * This file contains all dummy data used when the backend is unavailable.
 * Use this branch for frontend-only development without backend dependencies.
 */

// Helper to create dates (use ISO strings for compatibility)
const toDate = (daysAgo) => new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

// ─── MOCK USERS ───────────────────────────────────────────────────────────────

export const mockUsers = [
    {
        uid: "user-001",
        email: "alice.johnson@acm.edu",
        name: "Alice Johnson",
        role: "admin",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
        year: "4th Year",
        graduationYear: "2025",
        bio: "Full-stack developer passionate about AI and machine learning.",
        skills: ["React", "Node.js", "Python", "TensorFlow"],
        github: "https://github.com/alicejohnson",
        linkedin: "https://linkedin.com/in/alicejohnson",
        createdAt: toDate(180),
        updatedAt: toDate(5),
    },
    {
        uid: "user-002",
        email: "bob.smith@acm.edu",
        name: "Bob Smith",
        role: "member",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
        year: "3rd Year",
        graduationYear: "2026",
        bio: "Backend engineer with a focus on distributed systems.",
        skills: ["Java", "Kubernetes", "PostgreSQL", "Go"],
        github: "https://github.com/bobsmith",
        createdAt: toDate(120),
        updatedAt: toDate(10),
    },
    {
        uid: "user-003",
        email: "carol.williams@acm.edu",
        name: "Carol Williams",
        role: "member",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carol",
        year: "2nd Year",
        graduationYear: "2027",
        bio: "UI/UX designer and frontend developer.",
        skills: ["Figma", "React", "Tailwind CSS", "Framer Motion"],
        github: "https://github.com/carolwilliams",
        createdAt: toDate(90),
        updatedAt: toDate(3),
    },
    {
        uid: "user-004",
        email: "david.chen@acm.edu",
        name: "David Chen",
        role: "member",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        year: "4th Year",
        graduationYear: "2025",
        bio: "Machine learning researcher focused on computer vision.",
        skills: ["Python", "PyTorch", "OpenCV", "CUDA"],
        github: "https://github.com/davidchen",
        createdAt: toDate(150),
        updatedAt: toDate(7),
    },
    {
        uid: "user-005",
        email: "emma.davis@acm.edu",
        name: "Emma Davis",
        role: "member",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
        year: "3rd Year",
        graduationYear: "2026",
        bio: "Cybersecurity enthusiast and CTF player.",
        skills: ["Network Security", "Penetration Testing", "Linux", "Python"],
        github: "https://github.com/emmadavis",
        createdAt: toDate(100),
        updatedAt: toDate(15),
    },
    {
        uid: "user-006",
        email: "frank.miller@acm.edu",
        name: "Frank Miller",
        role: "member",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Frank",
        year: "2nd Year",
        graduationYear: "2027",
        bio: "Mobile app developer specializing in cross-platform solutions.",
        skills: ["React Native", "Flutter", "Firebase", "TypeScript"],
        github: "https://github.com/frankmiller",
        createdAt: toDate(60),
        updatedAt: toDate(2),
    },
    {
        uid: "user-007",
        email: "grace.lee@acm.edu",
        name: "Grace Lee",
        role: "admin",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Grace",
        year: "4th Year",
        graduationYear: "2025",
        bio: "DevOps engineer and cloud architecture specialist.",
        skills: ["AWS", "Docker", "Terraform", "CI/CD"],
        github: "https://github.com/gracelee",
        createdAt: toDate(200),
        updatedAt: toDate(8),
    },
    {
        uid: "user-008",
        email: "henry.wilson@acm.edu",
        name: "Henry Wilson",
        role: "member",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Henry",
        year: "1st Year",
        graduationYear: "2028",
        bio: "Aspiring data scientist exploring the world of analytics.",
        skills: ["Python", "R", "SQL", "Tableau"],
        github: "https://github.com/henrywilson",
        createdAt: toDate(30),
        updatedAt: toDate(1),
    },
];

// ─── MOCK PROJECTS ────────────────────────────────────────────────────────────

export const mockProjects = [
    {
        id: "proj-001",
        title: "AI-Powered Study Assistant",
        description: "An intelligent study companion that uses natural language processing to help students understand complex topics. Features include adaptive quizzes, personalized learning paths, and real-time Q&A with an AI tutor.",
        techStack: ["React", "Python", "TensorFlow", "Firebase"],
        status: "approved",
        ownerId: "user-001",
        ownerName: "Alice Johnson",
        ownerEmail: "alice.johnson@acm.edu",
        githubUrl: "https://github.com/acm-chapter/study-assistant",
        demoUrl: "https://study-assistant.demo.com",
        thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
        tags: ["AI / Machine Learning", "Web Development"],
        views: 1250,
        likes: 89,
        createdAt: toDate(90),
        updatedAt: toDate(10),
    },
    {
        id: "proj-002",
        title: "Campus Event Management System",
        description: "A comprehensive platform for managing university events, from registration to attendance tracking. Includes QR code check-ins, real-time analytics, and automated email notifications.",
        techStack: ["Next.js", "Node.js", "PostgreSQL", "Tailwind CSS"],
        status: "approved",
        ownerId: "user-002",
        ownerName: "Bob Smith",
        ownerEmail: "bob.smith@acm.edu",
        githubUrl: "https://github.com/acm-chapter/event-manager",
        demoUrl: "https://events.acm-demo.com",
        thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
        tags: ["Web Development"],
        views: 980,
        likes: 67,
        createdAt: toDate(75),
        updatedAt: toDate(20),
    },
    {
        id: "proj-003",
        title: "Smart Campus Navigation",
        description: "An AR-enhanced mobile application for indoor campus navigation. Uses computer vision and Bluetooth beacons for precise positioning, helping new students find their way around campus.",
        techStack: ["React Native", "ARKit", "Node.js", "MongoDB"],
        status: "approved",
        ownerId: "user-003",
        ownerName: "Carol Williams",
        ownerEmail: "carol.williams@acm.edu",
        githubUrl: "https://github.com/acm-chapter/campus-nav",
        thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
        tags: ["Web Development", "AI / Machine Learning"],
        views: 756,
        likes: 52,
        createdAt: { _seconds: 1704000000 },
        updatedAt: { _seconds: 1707000000 },
    },
    {
        id: "proj-004",
        title: "Automated Code Review Bot",
        description: "A GitHub bot that performs automated code reviews using static analysis and machine learning. Detects potential bugs, security vulnerabilities, and suggests improvements.",
        techStack: ["Python", "FastAPI", "Docker", "GitHub Actions"],
        status: "approved",
        ownerId: "user-004",
        ownerName: "David Chen",
        ownerEmail: "david.chen@acm.edu",
        githubUrl: "https://github.com/acm-chapter/code-review-bot",
        thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
        tags: ["AI / Machine Learning", "Cybersecurity"],
        views: 1456,
        likes: 112,
        createdAt: { _seconds: 1701000000 },
        updatedAt: { _seconds: 1709500000 },
    },
    {
        id: "proj-005",
        title: "Blockchain Voting System",
        description: "A secure, transparent voting platform built on blockchain technology for student government elections. Features anonymity, tamper-proof records, and real-time result tracking.",
        techStack: ["Solidity", "React", "Web3.js", "Ethereum"],
        status: "approved",
        ownerId: "user-005",
        ownerName: "Emma Davis",
        ownerEmail: "emma.davis@acm.edu",
        githubUrl: "https://github.com/acm-chapter/blockchain-voting",
        thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800",
        tags: ["Cybersecurity", "Web Development"],
        views: 892,
        likes: 78,
        createdAt: { _seconds: 1703000000 },
        updatedAt: { _seconds: 1706000000 },
    },
    {
        id: "proj-006",
        title: "IoT Plant Monitoring System",
        description: "A smart monitoring system for campus greenhouses using IoT sensors. Tracks soil moisture, temperature, and light levels, with automated watering and alerts.",
        techStack: ["Arduino", "Python", "React", "InfluxDB"],
        status: "approved",
        ownerId: "user-006",
        ownerName: "Frank Miller",
        ownerEmail: "frank.miller@acm.edu",
        githubUrl: "https://github.com/acm-chapter/plant-monitor",
        thumbnail: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
        tags: ["Robotics", "Web Development"],
        views: 634,
        likes: 45,
        createdAt: { _seconds: 1705000000 },
        updatedAt: { _seconds: 1708500000 },
    },
    {
        id: "proj-007",
        title: "Real-time Collaboration Whiteboard",
        description: "A collaborative digital whiteboard for remote team brainstorming sessions. Features real-time synchronization, infinite canvas, and AI-powered diagram suggestions.",
        techStack: ["Vue.js", "Socket.io", "Canvas API", "Redis"],
        status: "pending",
        ownerId: "user-007",
        ownerName: "Grace Lee",
        ownerEmail: "grace.lee@acm.edu",
        githubUrl: "https://github.com/acm-chapter/collab-whiteboard",
        thumbnail: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800",
        tags: ["Web Development"],
        views: 245,
        likes: 23,
        createdAt: { _seconds: 1709000000 },
        updatedAt: { _seconds: 1709500000 },
    },
    {
        id: "proj-008",
        title: "ML-Based Plagiarism Detector",
        description: "An advanced plagiarism detection tool that uses machine learning to identify paraphrased content. Supports multiple file formats and provides detailed similarity reports.",
        techStack: ["Python", "BERT", "Flask", "React"],
        status: "pending",
        ownerId: "user-008",
        ownerName: "Henry Wilson",
        ownerEmail: "henry.wilson@acm.edu",
        githubUrl: "https://github.com/acm-chapter/plagiarism-detector",
        thumbnail: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800",
        tags: ["AI / Machine Learning"],
        views: 156,
        likes: 12,
        createdAt: { _seconds: 1709500000 },
        updatedAt: { _seconds: 1710000000 },
    },
    {
        id: "proj-009",
        title: "Competitive Programming Judge",
        description: "An online judge system for hosting competitive programming contests. Features secure code execution, real-time leaderboards, and support for 15+ programming languages.",
        techStack: ["Go", "Docker", "React", "PostgreSQL"],
        status: "pending",
        ownerId: "user-004",
        ownerName: "David Chen",
        ownerEmail: "david.chen@acm.edu",
        githubUrl: "https://github.com/acm-chapter/online-judge",
        thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800",
        tags: ["Competitive Programming", "Web Development"],
        views: 189,
        likes: 18,
        createdAt: { _seconds: 1709800000 },
        updatedAt: { _seconds: 1710000000 },
    },
    {
        id: "proj-010",
        title: "Neural Network Visualizer",
        description: "An interactive tool for visualizing neural network architectures and training processes. Supports popular frameworks and exports publication-ready diagrams.",
        techStack: ["React", "D3.js", "Python", "TensorFlow"],
        status: "rejected",
        ownerId: "user-001",
        ownerName: "Alice Johnson",
        ownerEmail: "alice.johnson@acm.edu",
        githubUrl: "https://github.com/acm-chapter/nn-visualizer",
        thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
        tags: ["AI / Machine Learning"],
        views: 89,
        likes: 5,
        rejectionReason: "Similar project already exists in the archive. Consider collaborating with the existing team.",
        createdAt: { _seconds: 1708000000 },
        updatedAt: { _seconds: 1708500000 },
    },
];

// ─── MOCK TAGS / DOMAINS ──────────────────────────────────────────────────────

export const mockTags = [
    {
        id: "tag-001",
        name: "AI / Machine Learning",
        description: "Projects involving artificial intelligence, machine learning, deep learning, and data science.",
        color: "#8B5CF6",
        projectCount: 4,
        createdAt: { _seconds: 1700000000 },
    },
    {
        id: "tag-002",
        name: "Web Development",
        description: "Full-stack web applications, frontend frameworks, backend APIs, and web technologies.",
        color: "#3B82F6",
        projectCount: 7,
        createdAt: { _seconds: 1700000000 },
    },
    {
        id: "tag-003",
        name: "Cybersecurity",
        description: "Security research, penetration testing, cryptography, and secure system design.",
        color: "#10B981",
        projectCount: 2,
        createdAt: { _seconds: 1700000000 },
    },
    {
        id: "tag-004",
        name: "Robotics",
        description: "Hardware projects, IoT systems, embedded programming, and autonomous systems.",
        color: "#F59E0B",
        projectCount: 1,
        createdAt: { _seconds: 1700000000 },
    },
    {
        id: "tag-005",
        name: "Competitive Programming",
        description: "Algorithm challenges, data structures, competitive coding, and problem-solving tools.",
        color: "#EF4444",
        projectCount: 1,
        createdAt: { _seconds: 1700000000 },
    },
    {
        id: "tag-006",
        name: "Mobile Development",
        description: "iOS, Android, and cross-platform mobile application development.",
        color: "#EC4899",
        projectCount: 1,
        createdAt: { _seconds: 1702000000 },
    },
    {
        id: "tag-007",
        name: "Cloud Computing",
        description: "Cloud architecture, serverless computing, DevOps, and infrastructure automation.",
        color: "#06B6D4",
        projectCount: 0,
        createdAt: { _seconds: 1703000000 },
    },
];

// ─── MOCK EVENTS ──────────────────────────────────────────────────────────────

export const mockEvents = [
    {
        id: "event-001",
        title: "Hackathon 2026: Code for Good",
        description: "Join us for our annual 48-hour hackathon focused on building solutions for social impact. Teams will compete to create innovative apps addressing community challenges. Prizes include internship opportunities and tech gadgets!",
        date: "2026-04-15",
        time: "9:00 AM - 9:00 PM",
        location: "Engineering Building, Room 101",
        type: "hackathon",
        capacity: 150,
        registered: 127,
        image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
        organizer: "user-001",
        organizerName: "Alice Johnson",
        createdAt: { _seconds: 1708000000 },
    },
    {
        id: "event-002",
        title: "Workshop: Introduction to React",
        description: "A hands-on workshop for beginners to learn the fundamentals of React.js. We'll cover components, state management, hooks, and best practices. Bring your laptop with Node.js installed!",
        date: "2026-03-25",
        time: "2:00 PM - 5:00 PM",
        location: "Computer Science Lab 3",
        type: "workshop",
        capacity: 40,
        registered: 38,
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
        organizer: "user-003",
        organizerName: "Carol Williams",
        createdAt: { _seconds: 1709000000 },
    },
    {
        id: "event-003",
        title: "Tech Talk: The Future of AI",
        description: "Industry experts from leading tech companies discuss the latest trends in artificial intelligence, including large language models, computer vision, and ethical AI development.",
        date: "2026-04-02",
        time: "6:00 PM - 8:00 PM",
        location: "Auditorium A",
        type: "talk",
        capacity: 200,
        registered: 156,
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
        organizer: "user-004",
        organizerName: "David Chen",
        createdAt: { _seconds: 1709500000 },
    },
    {
        id: "event-004",
        title: "CTF Competition: Capture the Flag",
        description: "Test your cybersecurity skills in our monthly CTF competition. Challenges range from beginner to advanced, covering web exploitation, reverse engineering, cryptography, and more.",
        date: "2026-04-10",
        time: "10:00 AM - 6:00 PM",
        location: "Online + CS Building Room 205",
        type: "competition",
        capacity: 100,
        registered: 67,
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
        organizer: "user-005",
        organizerName: "Emma Davis",
        createdAt: { _seconds: 1709800000 },
    },
    {
        id: "event-005",
        title: "Networking Night: Meet the Alumni",
        description: "Connect with ACM alumni working at top tech companies. Great opportunity for mentorship, internship leads, and career advice. Refreshments will be provided!",
        date: "2026-04-20",
        time: "7:00 PM - 9:00 PM",
        location: "Student Union Ballroom",
        type: "networking",
        capacity: 80,
        registered: 52,
        image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800",
        organizer: "user-007",
        organizerName: "Grace Lee",
        createdAt: { _seconds: 1710000000 },
    },
];

// ─── MOCK ANALYTICS ───────────────────────────────────────────────────────────

export const mockAnalytics = {
    summary: {
        totalUsers: 156,
        totalProjects: 47,
        activeDomains: 7,
        pendingApprovals: 3,
        totalViews: 15420,
        totalEvents: 12,
    },
    distribution: {
        "AI / Machine Learning": { count: 12, members: 28 },
        "Web Development": { count: 18, members: 45 },
        "Cybersecurity": { count: 6, members: 15 },
        "Robotics": { count: 4, members: 12 },
        "Competitive Programming": { count: 7, members: 22 },
    },
    recentActivity: [
        { type: "project_created", user: "Alice Johnson", project: "AI Study Assistant", time: "2 hours ago" },
        { type: "user_joined", user: "Henry Wilson", time: "5 hours ago" },
        { type: "project_approved", user: "Bob Smith", project: "Event Manager", time: "1 day ago" },
        { type: "event_created", user: "Grace Lee", event: "Networking Night", time: "2 days ago" },
    ],
    projectsByStatus: {
        approved: 38,
        pending: 6,
        rejected: 3,
    },
    monthlyGrowth: {
        users: [12, 18, 25, 31, 42, 56, 68, 85, 98, 112, 134, 156],
        projects: [5, 8, 12, 15, 19, 24, 28, 33, 38, 41, 44, 47],
        months: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    },
};

// ─── MOCK SEARCH RESULTS ──────────────────────────────────────────────────────

export const mockSearchResults = {
    search: (query) => {
        const q = query.toLowerCase();
        const results = [];

        // Search projects
        mockProjects.forEach(project => {
            if (
                project.title.toLowerCase().includes(q) ||
                project.description.toLowerCase().includes(q) ||
                project.techStack.some(tech => tech.toLowerCase().includes(q))
            ) {
                results.push({ type: "project", ...project });
            }
        });

        // Search users
        mockUsers.forEach(user => {
            if (
                user.name.toLowerCase().includes(q) ||
                user.email.toLowerCase().includes(q) ||
                user.skills?.some(skill => skill.toLowerCase().includes(q))
            ) {
                results.push({ type: "user", ...user });
            }
        });

        // Search tags
        mockTags.forEach(tag => {
            if (tag.name.toLowerCase().includes(q)) {
                results.push({ type: "tag", ...tag });
            }
        });

        return results;
    }
};

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

export const getProjectById = (id) => mockProjects.find(p => p.id === id) || null;
export const getUserById = (uid) => mockUsers.find(u => u.uid === uid) || null;
export const getTagById = (id) => mockTags.find(t => t.id === id) || null;
export const getEventById = (id) => mockEvents.find(e => e.id === id) || null;

export const getProjectsByStatus = (status) => {
    if (!status || status === 'all') return mockProjects;
    return mockProjects.filter(p => p.status === status);
};

export const getProjectsByOwner = (ownerId) => mockProjects.filter(p => p.ownerId === ownerId);

export const getPendingProjects = () => mockProjects.filter(p => p.status === 'pending');
export const getApprovedProjects = () => mockProjects.filter(p => p.status === 'approved');

// ─── EXPORTS ──────────────────────────────────────────────────────────────────

export default {
    users: mockUsers,
    projects: mockProjects,
    tags: mockTags,
    events: mockEvents,
    analytics: mockAnalytics,
    search: mockSearchResults,
};
