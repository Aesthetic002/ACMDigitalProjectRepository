# ACM Digital Project Repository - Cloudinary Integration

## Table of Contents
- [Overview](#overview)
- [Integration Architecture](#integration-architecture)
- [Upload Workflow](#upload-workflow)
- [Asset Management](#asset-management)
- [Storage Strategy](#storage-strategy)
- [Performance Optimization](#performance-optimization)
- [Security & Access Control](#security--access-control)
- [Error Handling & Resilience](#error-handling--resilience)

## Overview

Cloudinary serves as the primary asset management solution for the ACM Digital Project Repository, handling image uploads, document storage, automatic optimization, and global CDN delivery. This integration provides a robust, scalable alternative to Firebase Storage with enhanced features for web applications.

### Why Cloudinary?

**Advantages over Firebase Storage**:
- **Image Optimization**: Automatic format conversion (WebP, AVIF)
- **Dynamic Transformations**: Resize, crop, compress on-the-fly
- **Global CDN**: Faster delivery worldwide
- **Better Analytics**: Upload and delivery metrics
- **Format Support**: Images, videos, documents, and raw files

### Integration Scope

```mermaid
graph TB
    subgraph "File Types Supported"
        A[Images] --> A1[JPEG, PNG, GIF, WebP, SVG]
        B[Documents] --> B1[PDF, DOC/DOCX, PPT/PPTX]
        C[Archives] --> C1[ZIP, RAR, TAR.GZ]
        D[Videos] --> D1[MP4, MOV, AVI]
        E[Code Files] --> E1[.js, .py, .json, .md]
    end

    subgraph "Use Cases"
        F[Project Thumbnails] --> F1[Auto-optimized previews]
        G[Documentation] --> G1[PDF reports, presentations]
        H[Source Code] --> H1[Downloadable project files]
        I[Media Assets] --> I1[Demo videos, screenshots]
    end
```

## Integration Architecture

### Service Integration Pattern

```mermaid
sequenceDiagram
    participant C as Client Browser
    participant FE as Frontend App
    participant GW as API Gateway
    participant AS as Asset Service
    participant CL as Cloudinary
    participant FS as Firestore

    Note over C,FS: File Upload Flow
    C->>FE: Select File
    FE->>GW: POST /api/v1/assets/upload
    GW->>AS: Forward multipart request
    AS->>AS: Validate file (type, size)
    AS->>CL: Upload via SDK
    CL-->>AS: Return asset metadata
    AS->>FS: Store asset record
    AS-->>GW: Return asset details
    GW-->>FE: API response
    FE-->>C: Update UI with preview

    Note over C,FS: File Access Flow
    C->>FE: Request asset view
    FE->>GW: GET /api/v1/assets/project/{id}
    GW->>AS: Forward request
    AS->>FS: Query asset records
    FS-->>AS: Return asset metadata
    AS-->>GW: Return URLs + metadata
    GW-->>FE: Asset list
    FE->>CL: Direct CDN requests
    CL-->>FE: Optimized asset delivery
```

### Configuration Layer

```javascript
// backend/shared/utils/cloudinary.js
const cloudinary = require('cloudinary').v2;

// Environment-based configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Force HTTPS URLs
});

module.exports = cloudinary;
```

### Asset Service Integration

```mermaid
graph TB
    subgraph "Asset Service Layer"
        A[Multer Middleware] --> B[File Validation]
        B --> C[Cloudinary Upload]
        C --> D[Metadata Storage]
        D --> E[Response Generation]
    end

    subgraph "Cloudinary Operations"
        F[Upload API] --> G[Auto-optimization]
        G --> H[CDN Distribution]
        H --> I[Transformation Pipeline]
    end

    subgraph "Database Layer"
        J[Firestore Collection] --> K[Asset Metadata]
        K --> L[Project Association]
        L --> M[Access Control]
    end

    C --> F
    D --> J
    E --> N[Client Response]
```

## Upload Workflow

### 1. Client-Side Upload Preparation

```javascript
// Frontend file upload component
const handleFileUpload = async (file, projectId) => {
  // Validation before upload
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/*', 'application/pdf', 'application/zip'];

  if (file.size > maxSize) {
    throw new Error('File size exceeds 10MB limit');
  }

  // Create FormData for multipart upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('projectId', projectId);
  formData.append('category', getFileCategory(file.type));

  // Upload with progress tracking
  const response = await fetch('/api/v1/assets/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
    },
    body: formData
  });

  return response.json();
};
```

### 2. Server-Side Upload Processing

```mermaid
flowchart TD
    A[Multipart Request] --> B{File Validation}
    B -->|Invalid| C[Return 400 Error]
    B -->|Valid| D[Extract File Buffer]

    D --> E[Generate Upload Options]
    E --> F[Cloudinary Upload Stream]
    F --> G{Upload Success?}

    G -->|No| H[Return 500 Error]
    G -->|Yes| I[Process Cloudinary Response]

    I --> J[Create Asset Record]
    J --> K[Store in Firestore]
    K --> L{Database Success?}

    L -->|No| M[Cleanup Cloudinary Asset]
    L -->|Yes| N[Return Success Response]

    M --> H
```

### 3. Upload Implementation Details

```javascript
// backend/asset-service/routes/assets.routes.js
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { projectId, category = 'general' } = req.body;
    const file = req.file;

    // Validate file
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'No file provided'
      });
    }

    // Generate unique public ID
    const publicId = `acm-projects/${projectId}/${Date.now()}-${file.originalname}`;

    // Upload options based on file type
    const uploadOptions = {
      public_id: publicId,
      folder: `acm-projects/${projectId}`,
      resource_type: 'auto', // Auto-detect file type
      format: file.mimetype.startsWith('image/') ? 'auto' : undefined,
      transformation: getTransformationOptions(file.mimetype),
      context: {
        project_id: projectId,
        category: category,
        uploaded_by: req.user.uid
      }
    };

    // Upload to Cloudinary using stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    });

    // Store metadata in Firestore
    const assetData = {
      id: uploadResult.public_id,
      projectId: projectId,
      originalName: file.originalname,
      cloudinaryPublicId: uploadResult.public_id,
      cloudinaryUrl: uploadResult.url,
      secureUrl: uploadResult.secure_url,
      mimeType: file.mimetype,
      sizeBytes: uploadResult.bytes,
      format: uploadResult.format,
      category: category,
      uploadedBy: req.user.uid,
      uploadedAt: new Date().toISOString(),
      isDeleted: false,
      transformations: uploadResult.transformation || []
    };

    const assetRef = await db
      .collection('projects')
      .doc(projectId)
      .collection('assets')
      .add(assetData);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      asset: {
        id: assetRef.id,
        ...assetData
      }
    });

  } catch (error) {
    console.error('Upload error:', error);

    // Cleanup Cloudinary asset if database storage fails
    if (uploadResult?.public_id) {
      cloudinary.uploader.destroy(uploadResult.public_id);
    }

    res.status(500).json({
      success: false,
      error: 'UploadError',
      message: error.message
    });
  }
});
```

## Asset Management

### Asset Lifecycle Management

```mermaid
stateDiagram-v2
    [*] --> Uploading : Client selects file
    Uploading --> Validating : File received
    Validating --> Processing : Validation passed
    Validating --> Failed : Validation failed
    Processing --> Stored : Upload successful
    Processing --> Failed : Upload failed
    Stored --> Active : Metadata saved
    Active --> Transforming : Optimization requested
    Transforming --> Active : Transform complete
    Active --> Archived : Soft delete
    Archived --> Active : Restore
    Archived --> Deleted : Hard delete
    Failed --> [*]
    Deleted --> [*]
```

### File Organization Strategy

```javascript
// Cloudinary folder structure
acm-projects/
├── {projectId}/                    // Project-specific folder
│   ├── thumbnails/                 // Generated thumbnails
│   ├── documents/                  // PDF, DOC files
│   ├── images/                     // Photos, diagrams
│   ├── videos/                     // Demo videos
│   └── archives/                   // ZIP, TAR files
└── shared/                         // Platform-wide assets
    ├── avatars/                    // User profile pictures
    ├── branding/                   // ACM logos, banners
    └── templates/                  // Document templates
```

### Dynamic Transformations

```javascript
// Transformation options based on file type and use case
const getTransformationOptions = (mimeType, context = {}) => {
  const transformations = [];

  if (mimeType.startsWith('image/')) {
    // Image optimizations
    transformations.push({
      quality: 'auto:best',
      format: 'auto',
      flags: 'progressive'
    });

    // Generate responsive variants
    if (context.generateThumbs) {
      transformations.push(
        { width: 150, height: 150, crop: 'fill', gravity: 'center' }, // Thumbnail
        { width: 400, height: 300, crop: 'fit' }, // Preview
        { width: 800, height: 600, crop: 'limit' }  // Display
      );
    }
  }

  if (mimeType === 'application/pdf') {
    // PDF preview generation
    transformations.push({
      format: 'jpg',
      page: 1,
      width: 400,
      height: 300,
      crop: 'fit'
    });
  }

  return transformations;
};
```

### Asset URL Generation

```javascript
// Generate optimized URLs for different contexts
const generateAssetUrls = (asset, context = 'display') => {
  const baseUrl = asset.secureUrl;

  const urls = {
    original: baseUrl,

    // Image variants
    thumbnail: cloudinary.url(asset.cloudinaryPublicId, {
      transformation: [
        { width: 150, height: 150, crop: 'fill', gravity: 'center' },
        { quality: 'auto', format: 'auto' }
      ]
    }),

    preview: cloudinary.url(asset.cloudinaryPublicId, {
      transformation: [
        { width: 400, height: 300, crop: 'fit' },
        { quality: 'auto', format: 'auto' }
      ]
    }),

    display: cloudinary.url(asset.cloudinaryPublicId, {
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto', format: 'auto' }
      ]
    }),

    // PDF preview (first page)
    pdfPreview: asset.mimeType === 'application/pdf' ?
      cloudinary.url(asset.cloudinaryPublicId, {
        transformation: [
          { format: 'jpg', page: 1 },
          { width: 300, height: 200, crop: 'fit' }
        ]
      }) : null
  };

  return urls;
};
```

## Storage Strategy

### Storage Cost Optimization

```mermaid
graph TB
    subgraph "Storage Tiers"
        A[Hot Storage] --> A1[Active Projects<br/>Immediate Access]
        B[Warm Storage] --> B1[Archived Projects<br/>Occasional Access]
        C[Cold Storage] --> C1[Historical Projects<br/>Rare Access]
    end

    subgraph "Optimization Techniques"
        D[Auto-Format] --> D1[WebP for browsers<br/>JPEG fallback]
        E[Quality Adjustment] --> E1[80-90% for web<br/>Original for download]
        F[Lazy Loading] --> F1[Load on demand<br/>Progressive enhancement]
    end

    subgraph "Cleanup Policies"
        G[Unused Assets] --> G1[30-day cleanup<br/>Orphaned files]
        H[Version Control] --> H1[Keep 3 versions<br/>Auto-delete old]
        I[Size Limits] --> I1[10MB per file<br/>100MB per project]
    end
```

### Backup & Redundancy

```javascript
// Asset backup strategy
const backupStrategy = {
  primary: 'Cloudinary (Global CDN)',
  secondary: 'Firebase Storage (Legacy)',

  // Automatic backup for critical files
  autoBackup: {
    triggers: ['project_published', 'admin_featured'],
    destinations: ['firebase_storage', 'local_cache'],
    retention: '2_years'
  },

  // Manual backup for bulk operations
  bulkBackup: {
    schedule: 'monthly',
    scope: 'all_active_projects',
    format: 'tar.gz_archive'
  }
};
```

### Migration from Firebase Storage

```javascript
// Migration utility for existing Firebase Storage assets
const migrateFromFirebase = async (projectId) => {
  try {
    // 1. List Firebase Storage files
    const [files] = await bucket
      .getFiles({ prefix: `projects/${projectId}/` });

    const migrationResults = [];

    for (const file of files) {
      // 2. Download from Firebase
      const [buffer] = await file.download();
      const metadata = await file.getMetadata();

      // 3. Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload_stream({
        public_id: `migrated/${projectId}/${file.name}`,
        resource_type: 'auto',
        context: {
          migrated_from: 'firebase',
          original_path: file.name,
          migration_date: new Date().toISOString()
        }
      }, buffer);

      // 4. Update Firestore records
      await updateAssetRecord(projectId, file.name, {
        cloudinaryUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        migrated: true,
        migrationDate: new Date().toISOString()
      });

      migrationResults.push({
        originalPath: file.name,
        cloudinaryUrl: uploadResult.secure_url,
        status: 'success'
      });
    }

    return migrationResults;

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};
```

## Performance Optimization

### CDN & Delivery Optimization

```mermaid
graph TB
    subgraph "Global CDN Network"
        A[Cloudinary CDN] --> B[Edge Locations Worldwide]
        B --> C[Automatic Geo-routing]
        C --> D[Reduced Latency]
    end

    subgraph "Image Optimization"
        E[Format Selection] --> F[WebP for Chrome/Firefox<br/>JPEG for Safari<br/>AVIF for modern browsers]
        G[Quality Adjustment] --> H[Auto quality based on<br/>device, connection speed]
        I[Responsive Images] --> J[Multiple sizes generated<br/>Client selects optimal]
    end

    subgraph "Caching Strategy"
        K[Browser Cache] --> L[1 year for immutable assets<br/>1 hour for dynamic content]
        M[CDN Cache] --> N[30 days default<br/>Instant purge available]
        O[Application Cache] --> P[Firestore metadata<br/>5 minutes TTL]
    end
```

### Lazy Loading Implementation

```javascript
// Frontend lazy loading for assets
const LazyImage = ({ asset, alt, className }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = imgRef.current;
          img.src = asset.urls.display;
          img.onload = () => setLoaded(true);
          img.onerror = () => setError(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [asset]);

  if (error) {
    return <div className="asset-error">Failed to load image</div>;
  }

  return (
    <div className={`asset-container ${loaded ? 'loaded' : 'loading'}`}>
      <img
        ref={imgRef}
        alt={alt}
        className={className}
        src={asset.urls.thumbnail} // Low-quality placeholder
        style={{
          filter: loaded ? 'none' : 'blur(5px)',
          transition: 'filter 0.3s ease'
        }}
      />
      {!loaded && <div className="loading-spinner" />}
    </div>
  );
};
```

### Batch Operations

```javascript
// Efficient bulk operations
const bulkUploadAssets = async (projectId, files) => {
  const uploadPromises = files.map(async (file, index) => {
    // Stagger uploads to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, index * 100));

    return uploadAsset(projectId, file);
  });

  // Process in batches of 5
  const batchSize = 5;
  const results = [];

  for (let i = 0; i < uploadPromises.length; i += batchSize) {
    const batch = uploadPromises.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch);
    results.push(...batchResults);
  }

  return results;
};
```

## Security & Access Control

### Upload Security

```javascript
// File validation and sanitization
const validateUpload = (file) => {
  const security = {
    // File type validation
    allowedMimeTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/zip',
      'video/mp4', 'video/quicktime'
    ],

    // Size limitations
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxDimensions: { width: 4096, height: 4096 },

    // Content validation
    scanForMalware: true,
    validateHeaders: true,

    // Rate limiting
    maxUploadsPerMinute: 10,
    maxStoragePerProject: 100 * 1024 * 1024 // 100MB
  };

  // MIME type validation
  if (!security.allowedMimeTypes.includes(file.mimetype)) {
    throw new Error(`File type ${file.mimetype} not allowed`);
  }

  // Size validation
  if (file.size > security.maxFileSize) {
    throw new Error('File size exceeds limit');
  }

  // File header validation (prevent MIME spoofing)
  if (!validateFileHeader(file.buffer, file.mimetype)) {
    throw new Error('File content does not match declared type');
  }

  return true;
};
```

### Access Control

```mermaid
sequenceDiagram
    participant U as User
    participant AS as Asset Service
    participant FB as Firestore
    participant CL as Cloudinary

    Note over U,CL: Asset Access Control
    U->>AS: Request asset access
    AS->>FB: Check user permissions
    FB-->>AS: Return access level

    alt User is project owner/contributor
        AS->>CL: Generate signed URL
        CL-->>AS: Return secure URL
        AS-->>U: Full access granted
    else User is authenticated
        AS->>CL: Public URL for published assets
        CL-->>AS: Return public URL
        AS-->>U: Limited access granted
    else User is anonymous
        AS-->>U: Deny access (403)
    end
```

### Signed URLs for Private Content

```javascript
// Generate time-limited signed URLs
const generateSignedUrl = (asset, expirationMinutes = 60) => {
  const timestamp = Math.floor(Date.now() / 1000) + (expirationMinutes * 60);

  const signedUrl = cloudinary.utils.private_download_zip_url({
    public_ids: [asset.cloudinaryPublicId],
    expires_at: timestamp,
    type: 'authenticated'
  });

  return {
    url: signedUrl,
    expiresAt: new Date(timestamp * 1000).toISOString()
  };
};
```

## Error Handling & Resilience

### Upload Failure Recovery

```mermaid
flowchart TD
    A[Upload Initiated] --> B{Network Available?}
    B -->|No| C[Queue for Retry]
    B -->|Yes| D[Attempt Upload]

    D --> E{Upload Success?}
    E -->|No| F{Retry Count < 3?}
    E -->|Yes| G[Store Metadata]

    F -->|Yes| H[Exponential Backoff]
    F -->|No| I[Mark as Failed]

    H --> D
    C --> J[Background Retry Service]
    J --> B

    G --> K[Success Response]
    I --> L[Error Response]
```

### Fallback Strategies

```javascript
// Multi-provider upload with fallback
const uploadWithFallback = async (file, options) => {
  const providers = [
    { name: 'Cloudinary', upload: uploadToCloudinary },
    { name: 'Firebase', upload: uploadToFirebase },
    { name: 'Local', upload: uploadToLocal }
  ];

  for (const provider of providers) {
    try {
      const result = await provider.upload(file, options);

      // Store provider info for future reference
      result.provider = provider.name;
      result.uploadedAt = new Date().toISOString();

      return result;

    } catch (error) {
      console.warn(`Upload failed for ${provider.name}:`, error.message);

      // Continue to next provider
      if (provider === providers[providers.length - 1]) {
        throw new Error('All upload providers failed');
      }
    }
  }
};
```

### Monitoring & Alerting

```javascript
// Upload monitoring and metrics
const uploadMetrics = {
  // Success/failure rates
  trackUpload: (result, duration, fileSize) => {
    metrics.increment('uploads.total');
    metrics.histogram('uploads.duration', duration);
    metrics.histogram('uploads.file_size', fileSize);

    if (result.success) {
      metrics.increment('uploads.success');
    } else {
      metrics.increment('uploads.failure');
      metrics.increment(`uploads.error.${result.errorType}`);
    }
  },

  // Performance monitoring
  trackPerformance: (endpoint, responseTime, statusCode) => {
    metrics.histogram(`api.${endpoint}.duration`, responseTime);
    metrics.increment(`api.${endpoint}.${statusCode}`);
  },

  // Storage utilization
  trackStorage: async () => {
    const usage = await cloudinary.api.usage();
    metrics.gauge('storage.bytes', usage.storage.usage);
    metrics.gauge('storage.transformations', usage.transformations.usage);
    metrics.gauge('storage.requests', usage.requests.usage);
  }
};
```

---

**Cloudinary Integration Benefits**:
- ✅ Global CDN with automatic optimization
- ✅ Dynamic image transformations
- ✅ Robust upload handling with fallbacks
- ✅ Cost-effective storage solution
- ✅ Enhanced user experience with fast delivery
- ✅ Professional asset management capabilities

**Next: See [APP-OVERVIEW.md](./APP-OVERVIEW.md) for complete application functionality**