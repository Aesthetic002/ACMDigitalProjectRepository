/**
 * Project Write Operations Routes
 * 
 * Handles project creation, update, and deletion (all protected by authentication):
 * - POST /api/v1/projects - Create a new project (contributor or admin only)
 * - PUT /api/v1/projects/:projectId - Update an existing project
 * - DELETE /api/v1/projects/:projectId - Archive/soft-delete a project
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { requireContributor } = require('../middleware/admin');
const { db } = require('../firebase');

/**
 * POST /api/v1/projects
 * 
 * Creates a new project. Only contributors or admins can create projects.
 * Viewers must be upgraded to contributor role first.
 * The ownerId is automatically set from the authenticated user's uid.
 * 
 * Required fields: title, description
 * Optional fields: techStack, contributors, status
 * 
 * Response:
 *   201: { success: true, project: {...} }
 *   400: { success: false, error: 'ValidationError', message: '...' }
 *   403: { success: false, error: 'Forbidden', message: 'Contributor access required' }
 */
router.post('/', verifyToken, requireContributor, async (req, res) => {
  try {
    const { title, description, techStack, contributors, status, repoUrl, githubUrl, demoUrl } = req.body;

    // Validation: Required fields
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Project title is required'
      });
    }

    if (!description || description.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Project description is required'
      });
    }

    // Build project data
    const projectData = {
      title: title.trim(),
      description: description.trim(),
      techStack: techStack || [],
      contributors: contributors || [],
      ownerId: req.user.uid, // CRITICAL: ownerId comes from authenticated user, NOT request body
      status: status || 'pending',
      repoUrl: repoUrl || githubUrl || '',
      demoUrl: demoUrl || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false // For soft delete functionality
    };

    // Ensure techStack is an array
    if (!Array.isArray(projectData.techStack)) {
      projectData.techStack = [projectData.techStack];
    }

    // Ensure contributors is an array
    if (!Array.isArray(projectData.contributors)) {
      projectData.contributors = [projectData.contributors];
    }

    // Add owner to contributors if not already included
    if (!projectData.contributors.includes(req.user.uid)) {
      projectData.contributors.push(req.user.uid);
    }

    // Create project in Firestore
    const projectRef = await db.collection('projects').add(projectData);

    // Fetch the created project with its ID
    const createdProject = {
      id: projectRef.id,
      ...projectData
    };

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: createdProject
    });

  } catch (error) {
    console.error('Create project error:', error.message);

    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to create project'
    });
  }
});

/**
 * PUT /api/v1/projects/:projectId
 * 
 * Updates an existing project.
 * Only the project owner or contributors can update the project.
 * 
 * Updatable fields: title, description, techStack, contributors, status
 * 
 * Response:
 *   200: { success: true, project: {...} }
 *   403: { success: false, error: 'Forbidden', message: '...' }
 *   404: { success: false, error: 'NotFound', message: 'Project not found' }
 */
router.put('/:projectId', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const authenticatedUid = req.user.uid;

    // Check if project exists
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Project not found'
      });
    }

    const projectData = projectDoc.data();

    // Check if project is soft-deleted
    if (projectData.isDeleted) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Project not found'
      });
    }

    // Authorization: Only owner or contributors can update
    const isOwner = projectData.ownerId === authenticatedUid;
    const isContributor = projectData.contributors && projectData.contributors.includes(authenticatedUid);

    if (!isOwner && !isContributor) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to update this project'
      });
    }

    // Extract updatable fields from request body
    const { title, description, techStack, contributors, status, repoUrl, githubUrl, demoUrl } = req.body;

    // Build update object (only include provided fields)
    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) {
      if (title.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Project title cannot be empty'
        });
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      if (description.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Project description cannot be empty'
        });
      }
      updateData.description = description.trim();
    }

    if (techStack !== undefined) {
      updateData.techStack = Array.isArray(techStack) ? techStack : [techStack];
    }

    if (contributors !== undefined) {
      updateData.contributors = Array.isArray(contributors) ? contributors : [contributors];

      // Ensure owner is always in contributors
      if (!updateData.contributors.includes(projectData.ownerId)) {
        updateData.contributors.push(projectData.ownerId);
      }
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (repoUrl !== undefined) updateData.repoUrl = repoUrl;
    else if (githubUrl !== undefined) updateData.repoUrl = githubUrl;

    if (demoUrl !== undefined) updateData.demoUrl = demoUrl;

    // Prevent updating protected fields
    // ownerId should NEVER be updated via API
    delete updateData.ownerId;
    delete updateData.createdAt;

    // Update project in Firestore
    await projectRef.update(updateData);

    // Fetch and return updated project data
    const updatedDoc = await projectRef.get();
    const updatedProjectData = {
      id: projectId,
      ...updatedDoc.data()
    };

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProjectData
    });

  } catch (error) {
    console.error('Update project error:', error.message);

    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to update project'
    });
  }
});

/**
 * DELETE /api/v1/projects/:projectId
 * 
 * Soft-deletes (archives) a project.
 * Only the project owner or contributors can delete the project.
 * 
 * Response:
 *   200: { success: true, message: 'Project archived successfully' }
 *   403: { success: false, error: 'Forbidden', message: '...' }
 *   404: { success: false, error: 'NotFound', message: 'Project not found' }
 */
router.delete('/:projectId', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const authenticatedUid = req.user.uid;

    // Check if project exists
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Project not found'
      });
    }

    const projectData = projectDoc.data();

    // Check if already deleted
    if (projectData.isDeleted) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Project not found'
      });
    }

    // Authorization: Only owner or contributors can delete
    const isOwner = projectData.ownerId === authenticatedUid;
    const isContributor = projectData.contributors && projectData.contributors.includes(authenticatedUid);

    if (!isOwner && !isContributor) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to delete this project'
      });
    }

    // Soft delete: Set isDeleted flag and update timestamp
    await projectRef.update({
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy: authenticatedUid,
      updatedAt: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Project archived successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error.message);

    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to archive project'
    });
  }
});

module.exports = router;
