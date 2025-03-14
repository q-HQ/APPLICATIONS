// Store notes in localStorage
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let currentNoteId = null;

// DOM Elements
const notesContainer = document.getElementById('notes-container');
const addNoteBtn = document.getElementById('add-note-btn');
const noteModal = document.getElementById('note-modal');
const closeModalBtn = document.querySelector('.close-modal');
const saveNoteBtn = document.getElementById('save-note-btn');
const cancelNoteBtn = document.getElementById('cancel-note-btn');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');
const searchInput = document.getElementById('search-input');

// Initialize the app
function init() {
    renderNotes();
    setupEventListeners();
}

// Render all notes
function renderNotes(filteredNotes = null) {
    notesContainer.innerHTML = '';

    const notesToRender = filteredNotes || notes;

    if (notesToRender.length === 0) {
        notesContainer.innerHTML = '<div class="empty-state">No notes yet. Add a new note to get started!</div>';
        return;
    }

    notesToRender.forEach(note => {
        const noteElement = createNoteElement(note);
        notesContainer.appendChild(noteElement);
    });
}

// Create HTML element for a note
function createNoteElement(note) {
    const noteDiv = document.createElement('div');
    noteDiv.classList.add('note');
    noteDiv.dataset.id = note.id;

    const date = new Date(note.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    noteDiv.innerHTML = `
        <h2>${note.title}</h2>
        <p>${note.content}</p>
        <small>Created: ${formattedDate}</small>
        <div class="note-actions">
            <button class="edit-btn" data-id="${note.id}">Edit</button>
            <button class="delete-btn" data-id="${note.id}">Delete</button>
        </div>
    `;

    // Add animation class for new notes
    if (note.isNew) {
        noteDiv.classList.add('new-note');
        // Remove the isNew flag after animation
        setTimeout(() => {
            note.isNew = false;
            saveNotesToStorage();
        }, 500);
    }

    return noteDiv;
}

// Setup all event listeners
function setupEventListeners() {
    // Add new note button
    addNoteBtn.addEventListener('click', openNewNoteModal);

    // Close modal
    closeModalBtn.addEventListener('click', closeModal);
    cancelNoteBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === noteModal) {
            closeModal();
        }
    });

    // Save note
    saveNoteBtn.addEventListener('click', saveNote);

    // Search functionality
    searchInput.addEventListener('input', searchNotes);

    // Edit and delete note event delegation
    notesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const noteId = e.target.dataset.id;
            editNote(noteId);
        } else if (e.target.classList.contains('delete-btn')) {
            const noteId = e.target.dataset.id;
            deleteNote(noteId);
        }
    });

    // Listen for Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && noteModal.style.display === 'block') {
            closeModal();
        }
    });
}

// Open modal for a new note
function openNewNoteModal() {
    currentNoteId = null;
    noteTitleInput.value = '';
    noteContentInput.value = '';
    noteModal.style.display = 'block';
    noteTitleInput.focus();
}

// Close the modal
function closeModal() {
    noteModal.style.display = 'none';
    currentNoteId = null;
}

// Save a note (create new or update existing)
function saveNote() {
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();

    if (!title) {
        alert('Please enter a title for your note');
        return;
    }

    if (currentNoteId) {
        // Update existing note
        const index = notes.findIndex(note => note.id === currentNoteId);
        if (index !== -1) {
            notes[index].title = title;
            notes[index].content = content;
            notes[index].timestamp = Date.now();
        }
    } else {
        // Create new note
        const newNote = {
            id: Date.now().toString(),
            title,
            content,
            timestamp: Date.now(),
            isNew: true
        };
        notes.unshift(newNote);
    }

    saveNotesToStorage();
    renderNotes();
    closeModal();
}

// Edit an existing note
function editNote(id) {
    const note = notes.find(note => note.id === id);
    if (note) {
        currentNoteId = id;
        noteTitleInput.value = note.title;
        noteContentInput.value = note.content;
        noteModal.style.display = 'block';
        noteTitleInput.focus();
    }
}

// Delete a note with animation
function deleteNote(id) {
    const noteElement = document.querySelector(`.note[data-id="${id}"]`);
    if (noteElement) {
        noteElement.classList.add('deleting');

        // Wait for animation to complete before removing from DOM and data
        setTimeout(() => {
            notes = notes.filter(note => note.id !== id);
            saveNotesToStorage();
            renderNotes();
        }, 300);
    }
}

// Search notes
function searchNotes() {
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (!searchTerm) {
        renderNotes();
        return;
    }

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm) ||
        note.content.toLowerCase().includes(searchTerm)
    );

    renderNotes(filteredNotes);
}

// Save notes to localStorage
function saveNotesToStorage() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);