export const MOCK_USERS = [
    {
        uid: "user1",
        name: "Aarav Sharma",
        email: "aarav.sharma@university.edu",
        role: "member",
        year: "3rd Year",
        graduationYear: "2025",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",
        disabled: false,
        bio: "Full-stack developer passionate about AI and distributed systems. Lead developer for the Chapter Website.",
        skills: ["React", "Node.js", "Python", "TensorFlow"],
        joinedDate: "2023-01-15"
    },
    {
        uid: "user2",
        name: "Isha Patel",
        email: "isha.patel@university.edu",
        role: "member",
        year: "2nd Year",
        graduationYear: "2026",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Isha",
        disabled: false,
        bio: "UI/UX Designer and Frontend enthusiast. Love creating beautiful and accessible interfaces.",
        skills: ["Figma", "React", "Tailwind CSS", "TypeScript"],
        joinedDate: "2023-08-20"
    },
    {
        uid: "user3",
        name: "Vikram Reddy",
        email: "vikram.admin@acm.org",
        role: "admin",
        year: "4th Year",
        graduationYear: "2024",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
        disabled: false,
        bio: "Current ACM Student Chapter President. Overseeing repository migration and member outreach.",
        skills: ["Project Management", "Golang", "Cloud Architecture"],
        joinedDate: "2022-05-10"
    },
    {
        uid: "user4",
        name: "Ananya Gupta",
        email: "ananya.g@university.edu",
        role: "member",
        year: "1st Year",
        graduationYear: "2027",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
        disabled: true,
        bio: "Competitive programmer and math enthusiast.",
        skills: ["C++", "Algorithms", "Data Structures"],
        joinedDate: "2024-02-01"
    }
];

export const MOCK_PROJECTS = [
    {
        id: "proj1",
        title: "ACM Digital Repository",
        description: "A centralized platform for members to showcase their technical projects and domains.",
        status: "approved",
        author: { name: "Vikram Reddy", uid: "user3" },
        techStack: ["React", "Firebase", "Tailwind"],
        createdAt: "2024-03-01T10:00:00Z",
        githubUrl: "https://github.com/acm/repository",
        tags: ["Web", "Internal"]
    },
    {
        id: "proj2",
        title: "AI Attendance System",
        description: "Face-recognition based attendance system for classroom management.",
        status: "pending",
        author: { name: "Aarav Sharma", uid: "user1" },
        techStack: ["Python", "OpenCV", "Flask"],
        createdAt: "2024-03-05T14:30:00Z",
        githubUrl: "https://github.com/aarav/attendance-ai",
        tags: ["AI", "OpenCV"]
    },
    {
        id: "proj3",
        title: "Crypto Dashboard",
        description: "Real-time cryptocurrency tracking and analysis tool.",
        status: "rejected",
        author: { name: "Ananya Gupta", uid: "user4" },
        techStack: ["Vue.js", "D3.js", "Express"],
        createdAt: "2024-02-15T09:00:00Z",
        githubUrl: "https://github.com/ananya/crypto-track",
        tags: ["FinTech", "Data Viz"]
    }
];

export const MOCK_TAGS = [
    { id: "tag1", name: "Artificial Intelligence", projectCount: 15 },
    { id: "tag2", name: "Web Development", projectCount: 42 },
    { id: "tag3", name: "Machine Learning", projectCount: 28 },
    { id: "tag4", name: "Cybersecurity", projectCount: 12 },
    { id: "tag5", name: "Blockchain", projectCount: 8 }
];
