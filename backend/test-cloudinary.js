const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

// NOTE: Ensure your server is running, and you have valid Cloudinary keys set up in your .env file
async function runTest() {
    try {
        // We assume a dummy file for testing, update this path if necessary
        const dummyFile = path.join(__dirname, 'README.md');
        if (!fs.existsSync(dummyFile)) {
            console.error('Test file not found');
            return;
        }

        // 1. Create a dummy test project via our no-auth route from TESTING-GUIDE.md
        console.log('Creating a test project...');
        const projectResponse = await axios.post('http://localhost:3000/api/v1/test/create-project-noauth', {
            title: "Upload Test Project",
            description: "Testing Cloudinary upload",
            techStack: ["React"],
            userEmail: "test@acm.com"
        });

        const projectId = projectResponse.data.project.id;
        console.log('Project created with ID:', projectId);

        const form = new FormData();
        form.append('projectId', projectId); // use the valid project ID 

        // Form data uses fs to determine mime type, README is text/markdown or text/plain
        form.append('file', fs.createReadStream(dummyFile), {
            filename: 'README.md',
            contentType: 'text/plain'
        });

        console.log('Starting upload request...');
        const response = await axios.post('http://localhost:3000/api/v1/assets/upload', form, {
            headers: {
                ...form.getHeaders(),
                'x-test-bypass': 'true'
            }
        });

        console.log('Upload successful!', response.data);
    } catch (error) {
        console.error('Upload failed:');
        if (error.response) {
            console.error(error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

runTest();
