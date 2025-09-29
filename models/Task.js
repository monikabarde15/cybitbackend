// models/Project.js
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    projectId: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    date: {
        type: String,
        required: true // This was causing the validation error
    },
    tags: [{
        type: String,
        trim: true
    }],
    image: {
        type: Boolean,
        default: false
    },
    position: {
        type: Number,
        default: 0
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const projectSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    tasks: [taskSchema]
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
