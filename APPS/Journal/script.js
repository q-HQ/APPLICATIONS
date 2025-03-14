// DOM Elements
const entriesContainer = document.getElementById('entries-container');
const favoritesContainer = document.getElementById('favorites-container');
const entryModal = document.getElementById('entry-modal');
const menuItems = document.querySelectorAll('.menu-item');
const views = document.querySelectorAll('.view');
const newEntryBtn = document.getElementById('new-entry');
const closeModalBtn = document.querySelector('.close-modal');
const saveEntryBtn = document.getElementById('save-entry');
const cancelEntryBtn = document.getElementById('cancel-entry');
const tagInput = document.getElementById('tag-input');
const tagsList = document.getElementById('tags-list');
const entryDate = document.getElementById('entry-date');
const entryTitle = document.getElementById('entry-title');
const editor = document.getElementById('editor');
const moodOptions = document.querySelectorAll('.mood');
const toast = document.getElementById('toast');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const fontSizeButtons = document.querySelectorAll('.font-size-btn');
const editorToolbarButtons = document.querySelectorAll('.editor-toolbar button');
const searchInput = document.querySelector('.search-bar input');
const calendarDays = document.getElementById('calendar-days');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const monthYearDisplay = document.getElementById('month-year');
const currentDateDisplay = document.getElementById('current-date');

// Global Variables
let entries = JSON.parse(localStorage.getItem('journalEntries')) || [];
let currentEntryId = null;
let currentTags = [];
let selectedMood = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Initialize the app
function initApp() {
    setCurrentDate();
    renderEntries();
    renderCalendar();

    // Check if dark mode was previously enabled
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }

    // Check font size preference
    const fontSize = localStorage.getItem('fontSize') || 'medium';
    document.body.classList.add(`font-${fontSize}`);
    fontSizeButtons.forEach(btn => {
        if (btn.dataset.size === fontSize) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Show welcome message for new users
    if (entries.length === 0) {
        showWelcomeMessage();
    }

    // Add animation to the menu items
    animateMenuItems();
}

// Set current date in the header
function setCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateDisplay.textContent = now.toLocaleDateString('en-US', options);

    // Set default entry date to today
    entryDate.valueAsDate = now;
}

// Render all journal entries
function renderEntries() {
    entriesContainer.innerHTML = '';
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sortedEntries.length === 0) {
        entriesContainer.innerHTML = `
            <div class="no-entries">
                <i class="fas fa-book-open"></i>
                <p>No entries yet. Start by creating your first journal entry!</p>
            </div>
        `;
        return;
    }

    sortedEntries.forEach(entry => {
        const entryElement = createEntryElement(entry);
        entriesContainer.appendChild(entryElement);
    });

    // Render favorites
    renderFavorites();
}

// Create an entry card element
function createEntryElement(entry) {
    const entryCard = document.createElement('div');
    entryCard.className = 'entry-card';
    entryCard.dataset.id = entry.id;

    // Create a preview of the content (strip HTML tags)
    const contentPreview = entry.content
        .replace(/<[^>]*>/g, '')
        .substring(0, 120) + (entry.content.length > 120 ? '...' : '');

    entryCard.innerHTML = `
        <div class="entry-date">
            <span>${formatDate(entry.date)}</span>
            <span class="entry-mood mood-${entry.mood}">${capitalizeFirstLetter(entry.mood)}</span>
        </div>
        <div class="entry-title">${entry.title}</div>
        <div class="entry-preview">${contentPreview}</div>
        <div class="entry-tags">
            ${entry.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <div class="entry-actions">
            <button class="action-btn edit" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn favorite ${entry.favorite ? 'active' : ''}" title="Favorite">
                <i class="fas fa-star"></i>
            </button>
            <button class="action-btn delete" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    // Add click event to open the entry
    entryCard.addEventListener('click', (e) => {
        // Don't open if clicking on action buttons
        if (e.target.closest('.action-btn')) return;

        openEntryInModal(entry);
    });

    // Add event listeners to action buttons
    const editBtn = entryCard.querySelector('.edit');
    const favoriteBtn = entryCard.querySelector('.favorite');
    const deleteBtn = entryCard.querySelector('.delete');

    editBtn.addEventListener('click', () => {
        openEntryInModal(entry);
    });

    favoriteBtn.addEventListener('click', () => {
        toggleFavorite(entry.id);
    });

    deleteBtn.addEventListener('click', () => {
        deleteEntry(entry.id);
    });

    // Add entrance animation
    setTimeout(() => {
        entryCard.style.opacity = '1';
        entryCard.style.transform = 'translateY(0)';
    }, 10);

    return entryCard;
}

// Render favorite entries
function renderFavorites() {
    favoritesContainer.innerHTML = '';
    const favoriteEntries = entries.filter(entry => entry.favorite);

    if (favoriteEntries.length === 0) {
        favoritesContainer.innerHTML = `
            <div class="no-entries">
                <i class="fas fa-star"></i>
                <p>No favorite entries yet. Mark entries as favorites to see them here.</p>
            </div>
        `;
        return;
    }

    favoriteEntries.forEach(entry => {
        const entryElement = createEntryElement(entry);
        favoritesContainer.appendChild(entryElement);
    });
}

// Toggle favorite status
function toggleFavorite(id) {
    const index = entries.findIndex(entry => entry.id === id);
    if (index !== -1) {
        entries[index].favorite = !entries[index].favorite;
        saveEntries();

        // Update the UI
        const favoriteBtn = document.querySelector(`.entry-card[data-id="${id}"] .favorite`);
        if (favoriteBtn) {
            favoriteBtn.classList.toggle('active');
            favoriteBtn.classList.add('bounce');
            setTimeout(() => {
                favoriteBtn.classList.remove('bounce');
            }, 800);
        }

        // Rerender favorites view if it's active
        if (document.querySelector('#favorites-view').classList.contains('active')) {
            renderFavorites();
        }

        showToast(entries[index].favorite ? 'Added to favorites!' : 'Removed from favorites');
    }
}

// Delete an entry
function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
        entries = entries.filter(entry => entry.id !== id);
        saveEntries();

        // Remove the entry element with animation
        const entryCard = document.querySelector(`.entry-card[data-id="${id}"]`);
        if (entryCard) {
            entryCard.style.opacity = '0';
            entryCard.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                entryCard.remove();

                // Rerender if no entries left
                if (entries.length === 0) {
                    renderEntries();
                }

                // Rerender favorites if in favorites view
                if (document.querySelector('#favorites-view').classList.contains('active')) {
                    renderFavorites();
                }

                // Rerender calendar if in mood tracker view
                if (document.querySelector('#moods-view').classList.contains('active')) {
                    renderCalendar();
                }
            }, 300);
        }

        showToast('Entry deleted successfully');
    }
}

// Open entry in modal for viewing/editing
function openEntryInModal(entry = null) {
    // Reset the form
    resetEntryForm();

    if (entry) {
        // Editing existing entry
        currentEntryId = entry.id;
        entryTitle.value = entry.title;
        editor.innerHTML = entry.content;

        // Set the date
        const entryDateTime = new Date(entry.date);
        entryDateTime.setMinutes(entryDateTime.getMinutes() - entryDateTime.getTimezoneOffset());
        entryDate.value = entryDateTime.toISOString().split('T')[0];

        // Set mood
        selectedMood = entry.mood;
        moodOptions.forEach(option => {
            if (option.dataset.mood === entry.mood) {
                option.classList.add('active');
            }
        });

        // Add tags
        currentTags = [...entry.tags];
        renderTags();

        // Update modal title
        document.getElementById('modal-title').textContent = 'Edit Journal Entry';
    } else {
        // New entry
        currentEntryId = null;
        document.getElementById('modal-title').textContent = 'New Journal Entry';
    }

    // Show the modal with animation
    entryModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal

    // Add focus to title with slight delay to allow animation
    setTimeout(() => {
        entryTitle.focus();
    }, 300);
}

// Reset the entry form
function resetEntryForm() {
    currentEntryId = null;
    entryTitle.value = '';
    editor.innerHTML = '';
    currentTags = [];
    selectedMood = null;

    // Reset mood selection
    moodOptions.forEach(option => {
        option.classList.remove('active');
    });

    // Clear tags
    tagsList.innerHTML = '';
}

// Save the entry
function saveEntry() {
    // Validate form
    const title = entryTitle.value.trim();
    const content = editor.innerHTML.trim();
    const date = entryDate.value;

    if (!title) {
        showToast('Please enter a title for your entry', 'error');
        entryTitle.focus();
        return;
    }

    if (!content) {
        showToast('Please write something in your journal entry', 'error');
        editor.focus();
        return;
    }

    if (!selectedMood) {
        showToast('Please select your mood for this entry', 'error');
        return;
    }

    const entryData = {
        id: currentEntryId || Date.now().toString(),
        title,
        content,
        date,
        mood: selectedMood,
        tags: currentTags,
        favorite: currentEntryId ? entries.find(e => e.id === currentEntryId).favorite : false,
        lastUpdated: new Date().toISOString()
    };

    if (currentEntryId) {
        // Update existing entry
        const index = entries.findIndex(entry => entry.id === currentEntryId);
        if (index !== -1) {
            entries[index] = entryData;
        }
    } else {
        // Add new entry
        entries.push(entryData);
    }

    // Save to localStorage
    saveEntries();

    // Close the modal
    closeModal();

    // Show success message
    showToast(currentEntryId ? 'Entry updated successfully' : 'New entry added successfully');

    // Rerender entries
    renderEntries();

    // Update calendar if in mood view
    if (document.querySelector('#moods-view').classList.contains('active')) {
        renderCalendar();
    }
}

// Save entries to localStorage
function saveEntries() {
    localStorage.setItem('journalEntries', JSON.stringify(entries));
}

// Close the entry modal
function closeModal() {
    entryModal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

// Handle tags
function handleTagInput(e) {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();

        const tag = tagInput.value.trim().replace(',', '');
        if (tag && !currentTags.includes(tag)) {
            currentTags.push(tag);
            renderTags();
            showToast(`Added tag: ${tag}`);
        }

        tagInput.value = '';
    }
}

// Render tags in the form
function renderTags() {
    tagsList.innerHTML = '';

    currentTags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-item new-tag';
        tagElement.innerHTML = `
            ${tag}
            <i class="fas fa-times" data-tag="${tag}"></i>
        `;

        tagElement.querySelector('i').addEventListener('click', () => {
            removeTag(tag);
        });

        tagsList.appendChild(tagElement);
    });
}

// Remove a tag
function removeTag(tag) {
    currentTags = currentTags.filter(t => t !== tag);
    renderTags();
}

// Render calendar for mood tracker
function renderCalendar() {
    calendarDays.innerHTML = '';

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    // Update header
    monthYearDisplay.textContent = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    // Create days
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'day empty';
        calendarDays.appendChild(emptyDay);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        dayElement.textContent = i;

        const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;

        // Check if there's an entry for this day
        const entriesForDay = entries.filter(entry => entry.date === dateStr);

        if (entriesForDay.length > 0) {
            // Get the last entry for the day (most recent)
            const lastEntry = entriesForDay[entriesForDay.length - 1];
            dayElement.style.backgroundColor = getMoodColor(lastEntry.mood);
            dayElement.title = `${lastEntry.title} - ${capitalizeFirstLetter(lastEntry.mood)}`;

            // Add click event to show entries for this day
            dayElement.addEventListener('click', () => {
                showEntriesForDate(dateStr);
            });
            dayElement.classList.add('has-entry');
        }

        // Highlight today
        const today = new Date();
        if (today.getDate() === i && today.getMonth() === currentMonth && today.getFullYear() === currentYear) {
            dayElement.classList.add('today');
        }

        calendarDays.appendChild(dayElement);
    }
}

// Get color for mood
function getMoodColor(mood) {
    switch (mood) {
        case 'sad': return '#ff7979';
        case 'okay': return '#ffbe76';
        case 'good': return '#55efc4';
        case 'great': return '#74b9ff';
        default: return 'transparent';
    }
}

// Show entries for a specific date
function showEntriesForDate(date) {
    const entriesForDay = entries.filter(entry => entry.date === date);
    if (entriesForDay.length > 0) {
        // Navigate to entries view
        showView('entries');

        // Highlight these entries
        const dateFormatted = formatDate(date);
        showToast(`Showing entries for ${dateFormatted}`);

        // Filter the entries
        searchInput.value = dateFormatted;
        filterEntries(dateFormatted);
    }
}

// Filter entries based on search input
function filterEntries(searchTerm) {
    const entryCards = document.querySelectorAll('.entry-card');
    searchTerm = searchTerm.toLowerCase();

    entryCards.forEach(card => {
        const title = card.querySelector('.entry-title').textContent.toLowerCase();
        const content = card.querySelector('.entry-preview').textContent.toLowerCase();
        const date = card.querySelector('.entry-date span').textContent.toLowerCase();
        const tags = Array.from(card.querySelectorAll('.tag')).map(t => t.textContent.toLowerCase());

        // Check if search term matches any of the entry data
        const matches = title.includes(searchTerm) ||
                        content.includes(searchTerm) ||
                        date.includes(searchTerm) ||
                        tags.some(tag => tag.includes(searchTerm));

        // Show/hide with animation
        if (matches) {
            card.style.display = '';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 10);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

// Format date for display
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Show a specific view
function showView(viewName) {
    views.forEach(view => {
        view.classList.add('hidden');
    });

    document.getElementById(`${viewName}-view`).classList.remove('hidden');

    menuItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === viewName) {
            item.classList.add('active');
        }
    });
}

// Show toast notification
function showToast(message, type = 'success') {
    const toastIcon = toast.querySelector('.toast-icon i');
    const toastMessage = toast.querySelector('.toast-message');

    // Set icon and color based on type
    if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle';
        toastIcon.style.color = '#ff6b6b';
    } else {
        toastIcon.className = 'fas fa-check-circle';
        toastIcon.style.color = '#2ecc71';
    }

    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Show welcome message for new users
function showWelcomeMessage() {
    const welcomeEntry = {
        id: Date.now().toString(),
        title: 'Welcome to Your Journal!',
        content: `
            <p>Hello and welcome to your personal journal app!</p>
            <p>This is a safe space for you to capture your thoughts, track your moods, and reflect on your journey. Here are some ways you can use this journal:</p>
            <ul>
                <li>📝 Record daily events and reflections</li>
                <li>🎯 Track your goals and progress</li>
                <li>🧠 Practice gratitude and mindfulness</li>
                <li>📊 Monitor your mood patterns over time</li>
            </ul>
            <p>To get started, click the "New Entry" button on the left sidebar. You can format your text, add tags, and select your mood for each entry.</p>
            <p>Your journal entries are stored locally in your browser. For privacy, you may want to export your data regularly.</p>
            <p>Happy journaling!</p>
        `,
        date: new Date().toISOString().split('T')[0],
        mood: 'great',
        tags: ['welcome', 'getting-started'],
        favorite: false,
        lastUpdated: new Date().toISOString()
    };

    entries.push(welcomeEntry);
    saveEntries();
    renderEntries();
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Animation for menu items
function animateMenuItems() {
    menuItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, 100 * (index + 1));
    });
}

// Export journal data
function exportJournalData() {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `journal-export-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    showToast('Journal data exported successfully');
}

// Clear all journal data
function clearAllData() {
    if (confirm('Are you sure you want to clear all journal data? This cannot be undone!')) {
        entries = [];
        localStorage.removeItem('journalEntries');
        renderEntries();
        renderCalendar();
        showToast('All journal data has been cleared');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', initApp);

// Menu navigation
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        const viewName = item.dataset.view;
        showView(viewName);
    });
});

// Entry modal
newEntryBtn.addEventListener('click', () => {
    openEntryInModal();
});

closeModalBtn.addEventListener('click', closeModal);
saveEntryBtn.addEventListener('click', saveEntry);
cancelEntryBtn.addEventListener('click', closeModal);

// Tags
tagInput.addEventListener('keydown', handleTagInput);

// Mood selection
moodOptions.forEach(option => {
    option.addEventListener('click', () => {
        // Remove active class from all moods
        moodOptions.forEach(m => m.classList.remove('active'));
        // Add active class to selected mood
        option.classList.add('active');
        // Set the selected mood
        selectedMood = option.dataset.mood;
    });
});

// Calendar navigation
// Calendar navigation (continued)
prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
});

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.trim();
    filterEntries(searchTerm);
});

// Dark Mode Toggle
darkModeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// Font Size Buttons
fontSizeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const size = btn.dataset.size;
        document.body.className = document.body.className.replace(/font-(small|medium|large)/, '');
        document.body.classList.add(`font-${size}`);

        // Update active state
        fontSizeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Save preference
        localStorage.setItem('fontSize', size);
    });
});

// Editor Toolbar
editorToolbarButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const command = btn.dataset.command;
        const value = btn.dataset.value || null;

        if (command === 'createLink') {
            const url = prompt('Enter the URL:');
            if (url) {
                document.execCommand(command, false, url);
            }
        } else if (command === 'insertImage') {
            const url = prompt('Enter the image URL:');
            if (url) {
                document.execCommand(command, false, url);
            }
        } else if (command === 'formatBlock') {
            document.execCommand(command, false, value);
        } else {
            document.execCommand(command, false, value);
        }

        // Focus back on editor
        editor.focus();
    });
});

// Export and Import buttons
document.getElementById('export-data').addEventListener('click', exportJournalData);

document.getElementById('import-data').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const importedData = JSON.parse(event.target.result);
                    if (Array.isArray(importedData)) {
                        // Confirm before overwriting or merging
                        const choice = confirm('Do you want to merge with existing entries? Click OK to merge or Cancel to overwrite all data.');

                        if (choice) {
                            // Merge - add non-duplicate entries
                            const existingIds = entries.map(entry => entry.id);
                            const newEntries = importedData.filter(entry => !existingIds.includes(entry.id));
                            entries = [...entries, ...newEntries];
                        } else {
                            // Overwrite
                            entries = importedData;
                        }

                        // Save and update
                        saveEntries();
                        renderEntries();
                        renderCalendar();
                        showToast('Journal data imported successfully');
                    } else {
                        showToast('Invalid journal data format', 'error');
                    }
                } catch (error) {
                    showToast('Error importing data: ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
        }
    });

    input.click();
});

// Clear all data button
document.getElementById('clear-data').addEventListener('click', clearAllData);

// Stats view
document.getElementById('stats-btn').addEventListener('click', generateJournalStats);

function generateJournalStats() {
    // Navigate to stats view
    showView('stats');

    const statsContainer = document.getElementById('stats-container');
    statsContainer.innerHTML = ''; // Clear previous stats

    if (entries.length === 0) {
        statsContainer.innerHTML = `
            <div class="no-entries">
                <i class="fas fa-chart-bar"></i>
                <p>No entries available to generate statistics.</p>
            </div>
        `;
        return;
    }

    // Calculate stats
    const totalEntries = entries.length;
    const firstEntryDate = new Date(entries.reduce((earliest, entry) =>
        new Date(entry.date) < new Date(earliest.date) ? entry : earliest
    , entries[0]).date);

    const lastEntryDate = new Date(entries.reduce((latest, entry) =>
        new Date(entry.date) > new Date(latest.date) ? entry : latest
    , entries[0]).date);

    const daysSinceFirstEntry = Math.floor((new Date() - firstEntryDate) / (1000 * 60 * 60 * 24));
    const entriesPerDay = totalEntries / (daysSinceFirstEntry || 1);

    // Count entries by mood
    const moodCounts = entries.reduce((counts, entry) => {
        counts[entry.mood] = (counts[entry.mood] || 0) + 1;
        return counts;
    }, {});

    // Count entries by month
    const entriesByMonth = entries.reduce((counts, entry) => {
        const month = new Date(entry.date).toLocaleString('default', { month: 'long' });
        counts[month] = (counts[month] || 0) + 1;
        return counts;
    }, {});

    // Find most used tags
    const tagCounts = entries.reduce((counts, entry) => {
        entry.tags.forEach(tag => {
            counts[tag] = (counts[tag] || 0) + 1;
        });
        return counts;
    }, {});

    const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Average entry length
    const totalWords = entries.reduce((count, entry) => {
        const words = entry.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        return count + words;
    }, 0);

    const averageWords = Math.round(totalWords / totalEntries);

    // Create stats cards
    statsContainer.innerHTML = `
        <div class="stats-grid">
            <div class="stats-card">
                <h3>Journal Summary</h3>
                <div class="stats-item">
                    <i class="fas fa-book"></i>
                    <div>
                        <p>Total Entries</p>
                        <h4>${totalEntries}</h4>
                    </div>
                </div>
                <div class="stats-item">
                    <i class="fas fa-calendar-alt"></i>
                    <div>
                        <p>Journal Age</p>
                        <h4>${daysSinceFirstEntry} days</h4>
                    </div>
                </div>
                <div class="stats-item">
                    <i class="fas fa-pen"></i>
                    <div>
                        <p>Average</p>
                        <h4>${entriesPerDay.toFixed(1)} entries/day</h4>
                    </div>
                </div>
                <div class="stats-item">
                    <i class="fas fa-align-left"></i>
                    <div>
                        <p>Average Length</p>
                        <h4>${averageWords} words</h4>
                    </div>
                </div>
            </div>
            
            <div class="stats-card">
                <h3>Mood Distribution</h3>
                <div class="mood-chart">
                    ${generateMoodChart(moodCounts)}
                </div>
                <div class="mood-legends">
                    ${Object.entries(moodCounts).map(([mood, count]) => `
                        <div class="mood-legend">
                            <span class="mood-dot" style="background-color: ${getMoodColor(mood)}"></span>
                            <span>${capitalizeFirstLetter(mood)}: ${count} entries</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="stats-card">
                <h3>Entry Timeline</h3>
                <div class="timeline-chart">
                    ${generateTimelineChart(entriesByMonth)}
                </div>
            </div>
            
            <div class="stats-card">
                <h3>Top Tags</h3>
                <div class="tags-chart">
                    ${sortedTags.map(([tag, count]) => `
                        <div class="tag-bar">
                            <div class="tag-name">${tag}</div>
                            <div class="tag-bar-container">
                                <div class="tag-bar-fill" style="width: ${(count / totalEntries) * 100}%"></div>
                            </div>
                            <div class="tag-count">${count}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <div class="stats-insights">
            <h3>Journal Insights</h3>
            <p>You started journaling on ${firstEntryDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.</p>
            <p>Your most frequent mood is ${getMostFrequentMood(moodCounts)}.</p>
            <p>Your most active journaling month is ${getMostActiveMonth(entriesByMonth)}.</p>
            <p>${generateRandomInsight(entries)}</p>
        </div>
    `;
}

// Helper function for mood chart
function generateMoodChart(moodCounts) {
    const total = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);

    return `
        <div class="pie-chart">
            ${Object.entries(moodCounts).map(([mood, count], index) => {
                const percentage = (count / total) * 100;
                return `<div class="pie-segment" style="
                    --percentage: ${percentage}%; 
                    --rotation: ${getRotation(moodCounts, mood)}deg;
                    --color: ${getMoodColor(mood)};
                "></div>`;
            }).join('')}
        </div>
    `;
}

// Get rotation for pie chart segments
function getRotation(moodCounts, currentMood) {
    const moods = Object.keys(moodCounts);
    const total = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);

    let rotation = 0;
    for (let i = 0; i < moods.indexOf(currentMood); i++) {
        rotation += (moodCounts[moods[i]] / total) * 360;
    }

    return rotation;
}

// Helper function for timeline chart
function generateTimelineChart(entriesByMonth) {
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];

    const maxEntries = Math.max(...Object.values(entriesByMonth));

    return `
        <div class="bar-chart">
            ${months.map(month => {
                const count = entriesByMonth[month] || 0;
                const height = count ? (count / maxEntries) * 100 : 0;
                
                return `
                    <div class="bar-container">
                        <div class="bar-label">${month.substring(0, 3)}</div>
                        <div class="bar" style="height: ${height}%;" title="${month}: ${count} entries"></div>
                        <div class="bar-value">${count}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Get the most frequent mood
function getMostFrequentMood(moodCounts) {
    return Object.entries(moodCounts)
        .sort((a, b) => b[1] - a[1])[0][0];
}

// Get the most active month
function getMostActiveMonth(entriesByMonth) {
    return Object.entries(entriesByMonth)
        .sort((a, b) => b[1] - a[1])[0][0];
}

// Generate random insight
function generateRandomInsight(entries) {
    const insights = [
        `You've written ${getTotalWordCount(entries)} words in your journal so far. That's approximately ${Math.round(getTotalWordCount(entries) / 250)} pages of a book!`,
        `Your longest entry was on ${getLongestEntryDate(entries)} with ${getLongestEntryWordCount(entries)} words.`,
        `You tend to journal most frequently on ${getMostFrequentDayOfWeek(entries)}.`,
        `Your journal entries from the past month show a ${getMoodTrend(entries)} trend in mood.`,
        `You've used ${getUniqueTagCount(entries)} unique tags to categorize your thoughts.`
    ];

    return insights[Math.floor(Math.random() * insights.length)];
}

// Helper functions for insights
function getTotalWordCount(entries) {
    return entries.reduce((count, entry) => {
        return count + entry.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    }, 0);
}

function getLongestEntryDate(entries) {
    const longest = entries.reduce((longest, entry) => {
        const wordCount = entry.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        return wordCount > longest.count ? { count: wordCount, date: entry.date } : longest;
    }, { count: 0, date: null });

    return longest.date ? formatDate(longest.date) : 'Not available';
}

function getLongestEntryWordCount(entries) {
    return entries.reduce((max, entry) => {
        const wordCount = entry.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        return wordCount > max ? wordCount : max;
    }, 0);
}

function getMostFrequentDayOfWeek(entries) {
    const dayCount = entries.reduce((counts, entry) => {
        const day = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long' });
        counts[day] = (counts[day] || 0) + 1;
        return counts;
    }, {});

    return Object.entries(dayCount)
        .sort((a, b) => b[1] - a[1])[0][0];
}

function getMoodTrend(entries) {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const recentEntries = entries.filter(entry => new Date(entry.date) >= oneMonthAgo);

    if (recentEntries.length < 2) return 'stable';

    const moodScores = {
        'sad': 1,
        'okay': 2,
        'good': 3,
        'great': 4
    };

    // Get mood scores for first and last half of the month
    const midPoint = Math.floor(recentEntries.length / 2);
    const firstHalf = recentEntries.slice(0, midPoint);
    const secondHalf = recentEntries.slice(midPoint);

    const firstHalfAvg = firstHalf.reduce((sum, entry) => sum + moodScores[entry.mood], 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, entry) => sum + moodScores[entry.mood], 0) / secondHalf.length;

    const difference = secondHalfAvg - firstHalfAvg;
    if (difference > 0.5) return 'positive';
    if (difference < -0.5) return 'negative';
    return 'stable';
}

function getUniqueTagCount(entries) {
    const uniqueTags = new Set();
    entries.forEach(entry => {
        entry.tags.forEach(tag => uniqueTags.add(tag));
    });
    return uniqueTags.size;
}

// Print functionality
document.getElementById('print-entry').addEventListener('click', () => {
    if (!currentEntryId) return;

    const entry = entries.find(e => e.id === currentEntryId);
    if (!entry) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${entry.title}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .entry-header {
                    border-bottom: 1px solid #ccc;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                .entry-title {
                    font-size: 24px;
                    margin: 0 0 10px;
                }
                .entry-meta {
                    font-size: 14px;
                    color: #666;
                    display: flex;
                    justify-content: space-between;
                }
                .entry-content {
                    margin: 20px 0;
                }
                .entry-tags {
                    margin-top: 20px;
                    font-style: italic;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="entry-header">
                <h1 class="entry-title">${entry.title}</h1>
                <div class="entry-meta">
                    <div>Date: ${formatDate(entry.date)}</div>
                    <div>Mood: ${capitalizeFirstLetter(entry.mood)}</div>
                </div>
            </div>
            <div class="entry-content">
                ${entry.content}
            </div>
            <div class="entry-tags">
                Tags: ${entry.tags.join(', ') || 'None'}
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `);

    printWindow.document.close();
});

// Additional helper functions for editor
editor.addEventListener('focus', () => {
    editor.classList.add('focused');
});

editor.addEventListener('blur', () => {
    editor.classList.remove('focused');
});

// Reminder functionality
document.getElementById('set-reminder').addEventListener('click', () => {
    const title = entryTitle.value.trim();
    if (!title) {
        showToast('Please enter a title first', 'error');
        return;
    }

    const reminderDate = prompt('Enter a date for your reminder (YYYY-MM-DD):');
    if (reminderDate) {
        // Here you would typically set up a reminder using a service worker
        // or other notification method. For this demo, we'll just store it
        // in localStorage

        const reminders = JSON.parse(localStorage.getItem('journalReminders') || '[]');
        reminders.push({
            id: Date.now(),
            title: `Reminder: ${title}`,
            date: reminderDate
        });

        localStorage.setItem('journalReminders', JSON.stringify(reminders));
        showToast(`Reminder set for ${formatDate(reminderDate)}`);
    }
});

// Check for reminders on load
function checkReminders() {
    const reminders = JSON.parse(localStorage.getItem('journalReminders') || '[]');
    const today = new Date().toISOString().split('T')[0];

    const dueReminders = reminders.filter(reminder => reminder.date <= today);

    if (dueReminders.length > 0) {
        dueReminders.forEach(reminder => {
            showToast(`Reminder: ${reminder.title}`);
        });

        // Remove the shown reminders
        const updatedReminders = reminders.filter(reminder => reminder.date > today);
        localStorage.setItem('journalReminders', JSON.stringify(updatedReminders));
    }
}

// Check reminders on startup
setTimeout(checkReminders, 2000);

// Template functionality
document.getElementById('use-template').addEventListener('click', () => {
    const templates = [
        {
            name: 'Daily Reflection',
            content: `
                <h2>Daily Reflection</h2>
                <p><strong>Three good things that happened today:</strong></p>
                <ol>
                    <li></li>
                    <li></li>
                    <li></li>
                </ol>
                <p><strong>What could have gone better:</strong></p>
                <p></p>
                <p><strong>What I'm grateful for:</strong></p>
                <p></p>
                <p><strong>Tomorrow's focus:</strong></p>
                <p></p>
            `
        },
        {
            name: 'Goal Setting',
            content: `
                <h2>Goal Setting</h2>
                <p><strong>My goal:</strong></p>
                <p></p>
                <p><strong>Why this matters to me:</strong></p>
                <p></p>
                <p><strong>Steps to achieve this:</strong></p>
                <ol>
                    <li></li>
                    <li></li>
                    <li></li>
                </ol>
                <p><strong>Potential obstacles:</strong></p>
                <p></p>
                <p><strong>How I'll overcome them:</strong></p>
                <p></p>
                <p><strong>Target date:</strong></p>
                <p></p>
            `
        },
        {
            name: 'Gratitude Journal',
            content: `
                <h2>Gratitude Journal</h2>
                <p><strong>I'm grateful for:</strong></p>
                <ol>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                </ol>
                <p><strong>Someone who helped me recently:</strong></p>
                <p></p>
                <p><strong>A challenge I overcame:</strong></p>
                <p></p>
                <p><strong>Something beautiful I noticed today:</strong></p>
                <p></p>
            `
        }
    ];

    // Create template selection dialog
    const dialog = document.createElement('div');
    dialog.className = 'template-dialog';
    dialog.innerHTML = `
        <div class="template-dialog-content">
            <h3>Choose a Template</h3>
            <div class="template-options">
                ${templates.map((template, index) => `
                    <div class="template-option" data-index="${index}">
                        <h4>${template.name}</h4>
                        <div class="template-preview">${template.content.substring(0, 100)}...</div>
                    </div>
                `).join('')}
            </div>
            <div class="template-dialog-footer">
                <button id="cancel-template">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    // Add event listeners
    dialog.querySelectorAll('.template-option').forEach(option => {
        option.addEventListener('click', () => {
            const index = parseInt(option.dataset.index);
            editor.innerHTML = templates[index].content;
            document.body.removeChild(dialog);
        });
    });

    document.getElementById('cancel-template').addEventListener('click', () => {
        document.body.removeChild(dialog);
    });
});