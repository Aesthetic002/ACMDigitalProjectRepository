const multer = require('multer');

// Configure Multer to store uploaded files in memory
const storage = multer.memoryStorage();

// Define a file filter to only allow certain file types
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/svg+xml',
        'application/pdf',
        'application/msword', // doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
        'application/vnd.ms-excel', // xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
        'application/vnd.ms-powerpoint', // ppt
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
        'text/plain',
        'application/zip',
        'application/x-rar-compressed'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed. MIME type: ${file.mimetype}`), false);
    }
};

// Limit file size to 100MB
const limits = {
    fileSize: 100 * 1024 * 1024,
};

const upload = multer({
    storage,
    fileFilter,
    limits,
});

module.exports = upload;
