// routes/projectRoutes.js
import express from 'express';
import Project from '../models/Task.js';

const router = express.Router();

// GET all projects with properly sorted tasks
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        
        const projectsWithSortedTasks = projects.map(project => {
            const tasksWithPositions = (project.tasks || []).map((task, index) => ({
                ...task.toObject(),
                position: task.position !== undefined ? task.position : index,
                sortOrder: task.sortOrder !== undefined ? task.sortOrder : index
            }));
            
            const sortedTasks = tasksWithPositions.sort((a, b) => (a.position || 0) - (b.position || 0));
            
            return {
                ...project.toObject(),
                tasks: sortedTasks
            };
        });
        
        res.json(projectsWithSortedTasks);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: error.message });
    }
});

// POST create new project
router.post('/', async (req, res) => {
    try {
        const { title } = req.body;
        
        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Title is required' });
        }
        
        const lastProject = await Project.findOne().sort({ id: -1 });
        const newId = lastProject ? lastProject.id + 1 : 1;
        
        const project = new Project({
            id: newId,
            title: title.trim(),
            tasks: []
        });
        
        const savedProject = await project.save();
        res.status(201).json(savedProject);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(400).json({ message: error.message });
    }
});

// PUT update project with position handling
router.put('/:id', async (req, res) => {
    try {
        const { title, tasks } = req.body;
        
        console.log('Received tasks for update:', tasks?.map(t => ({ 
            id: t.id, 
            title: t.title, 
            position: t.position 
        })));
        
        // Ensure ALL tasks have required fields
        const tasksWithPositions = tasks ? tasks.map((task, index) => ({
            id: task.id || Date.now() + index,
            projectId: parseInt(req.params.id),
            title: task.title || '',
            description: task.description || '',
            date: task.date || new Date().toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            }).replace(/ /g, ' '),
            tags: Array.isArray(task.tags) ? task.tags : (task.tags ? task.tags.split(',').map(tag => tag.trim()) : []),
            image: task.image || false,
            position: task.position !== undefined ? task.position : index,
            sortOrder: task.sortOrder !== undefined ? task.sortOrder : index,
            updatedAt: new Date()
        })) : [];

        const project = await Project.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            { 
                title: title,
                tasks: tasksWithPositions
            },
            { new: true }
        );
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        const projectWithSortedTasks = {
            ...project.toObject(),
            tasks: (project.tasks || []).sort((a, b) => (a.position || 0) - (b.position || 0))
        };
        
        res.json(projectWithSortedTasks);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: error.message });
    }
});

// DELETE project
router.delete('/:id', async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({ id: parseInt(req.params.id) });
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: error.message });
    }
});

// POST add task to project
router.post('/:id/tasks', async (req, res) => {
    try {
        const { title, description, tags } = req.body;
        
        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Task title is required' });
        }
        
        const project = await Project.findOne({ id: parseInt(req.params.id) });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const nextPosition = project.tasks ? project.tasks.length : 0;
        const maxTaskId = project.tasks.length > 0 
            ? Math.max(...project.tasks.map(task => task.id)) 
            : 0;

        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = today.getMonth();
        const yyyy = today.getFullYear();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const newTask = {
            id: maxTaskId + 1,
            projectId: parseInt(req.params.id),
            title: title.trim(),
            description: description?.trim() || '',
            date: dd + ' ' + monthNames[mm] + ', ' + yyyy,
            tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            image: false,
            position: nextPosition,
            sortOrder: nextPosition,
            updatedAt: new Date()
        };

        project.tasks.push(newTask);
        await project.save();

        const projectWithSortedTasks = {
            ...project.toObject(),
            tasks: (project.tasks || []).sort((a, b) => (a.position || 0) - (b.position || 0))
        };
        
        res.status(201).json(projectWithSortedTasks);
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(400).json({ message: error.message });
    }
});

// PUT update task in project - FIXED VERSION
router.put('/:projectId/tasks/:taskId', async (req, res) => {
    try {
        const projectId = parseInt(req.params.projectId);
        const taskId = parseInt(req.params.taskId);
        const { title, description, tags } = req.body;

        console.log('Updating task:', { projectId, taskId, title, description, tags });

        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Task title is required' });
        }

        const project = await Project.findOne({ id: projectId });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const taskIndex = project.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Get the current task to preserve existing fields
        const currentTask = project.tasks[taskIndex];

        // Update task while preserving ALL required fields
        project.tasks[taskIndex] = {
            id: currentTask.id, // REQUIRED: Preserve existing ID
            projectId: projectId, // REQUIRED: Ensure projectId is set
            title: title.trim(),
            description: description?.trim() || currentTask.description || '',
            date: currentTask.date || new Date().toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            }).replace(/ /g, ' '), // REQUIRED: Preserve or set date
            tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : (currentTask.tags || []),
            image: currentTask.image || false,
            position: currentTask.position !== undefined ? currentTask.position : taskIndex,
            sortOrder: currentTask.sortOrder !== undefined ? currentTask.sortOrder : taskIndex,
            updatedAt: new Date()
        };

        console.log('Updated task data:', project.tasks[taskIndex]);

        await project.save();

        const projectWithSortedTasks = {
            ...project.toObject(),
            tasks: (project.tasks || []).sort((a, b) => (a.position || 0) - (b.position || 0))
        };
        
        res.json(projectWithSortedTasks);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: error.message });
    }
});

// DELETE a task by task id from a project
router.delete('/:projectId/tasks/:taskId', async (req, res) => {
    try {
        const projectId = parseInt(req.params.projectId);
        const taskId = parseInt(req.params.taskId);

        const project = await Project.findOne({ id: projectId });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const taskIndex = project.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Remove the task
        project.tasks.splice(taskIndex, 1);

        // Reorder remaining tasks positions - PRESERVE ALL REQUIRED FIELDS
        project.tasks = project.tasks.map((task, index) => ({
            id: task.id, // REQUIRED: Preserve ID
            projectId: task.projectId || projectId, // REQUIRED: Ensure projectId
            title: task.title,
            description: task.description || '',
            date: task.date || new Date().toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            }).replace(/ /g, ' '), // REQUIRED: Preserve or set date
            tags: task.tags || [],
            image: task.image || false,
            position: index,
            sortOrder: index,
            updatedAt: new Date()
        }));

        await project.save();

        const projectWithSortedTasks = {
            ...project.toObject(),
            tasks: (project.tasks || []).sort((a, b) => (a.position || 0) - (b.position || 0))
        };
        
        res.json(projectWithSortedTasks);
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
