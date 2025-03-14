document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const reminderForm = document.getElementById('reminderForm');
    const remindersList = document.getElementById('remindersList');
    const reminderAlert = document.getElementById('reminderAlert');
    const alertTitle = document.getElementById('alertTitle');
    const alertTime = document.getElementById('alertTime');
    const dismissBtn = document.getElementById('dismissBtn');

    // Sound elements
    const beepSound = document.getElementById('beepSound');
    const bellSound = document.getElementById('bellSound');
    const chimeSound = document.getElementById('chimeSound');

    // Load reminders from localStorage
    let reminders = JSON.parse(localStorage.getItem('reminders')) || [];

    // Check reminders every second
    setInterval(checkReminders, 1000);

    // Render existing reminders
    renderReminders();

    // Form submit event
    reminderForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('title').value;
        const dateTime = document.getElementById('dateTime').value;
        const animationType = document.getElementById('animationType').value;
        const soundType = document.getElementById('soundType').value;
        const colorTheme = document.getElementById('colorTheme').value;

        const reminder = {
            id: Date.now(),
            title,
            dateTime,
            animationType,
            soundType,
            colorTheme,
            isActive: true
        };

        reminders.push(reminder);
        localStorage.setItem('reminders', JSON.stringify(reminders));

        renderReminders();
        reminderForm.reset();
    });

    // Delete reminder event delegation
    remindersList.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-delete')) {
            const reminderId = parseInt(e.target.getAttribute('data-id'));
            reminders = reminders.filter(reminder => reminder.id !== reminderId);
            localStorage.setItem('reminders', JSON.stringify(reminders));
            renderReminders();
        }
    });

    // Dismiss alert button
    dismissBtn.addEventListener('click', function() {
        reminderAlert.style.display = 'none';
    });

    // Function to render reminders
    function renderReminders() {
        remindersList.innerHTML = '';

        // Sort reminders by date
        reminders.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

        reminders.forEach(reminder => {
            const li = document.createElement('li');
            li.className = `reminder-item ${reminder.colorTheme}`;

            const dateObj = new Date(reminder.dateTime);
            const formattedDate = dateObj.toLocaleString();

            li.innerHTML = `
                <div class="reminder-info">
                    <div class="reminder-title">${reminder.title}</div>
                    <div class="reminder-time">${formattedDate}</div>
                    <div class="reminder-details">
                        Animation: ${reminder.animationType} | Sound: ${reminder.soundType}
                    </div>
                </div>
                <div class="reminder-actions">
                    <button class="btn-delete" data-id="${reminder.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            remindersList.appendChild(li);
        });
    }

    // Function to check for due reminders
    function checkReminders() {
        const now = new Date();

        reminders.forEach(reminder => {
            const reminderDate = new Date(reminder.dateTime);

            // If reminder time is within the last minute and is active
            if (reminder.isActive &&
                reminderDate <= now &&
                reminderDate >= new Date(now - 60000)) {

                // Show alert
                showAlert(reminder);

                // Mark reminder as inactive
                reminder.isActive = false;
                localStorage.setItem('reminders', JSON.stringify(reminders));
            }
        });
    }

    // Function to show alert
    function showAlert(reminder) {
        // Set alert content
        alertTitle.textContent = reminder.title;
        alertTime.textContent = new Date(reminder.dateTime).toLocaleString();

        // Add animation class
        alertTitle.className = reminder.animationType;

        // Play sound
        playSound(reminder.soundType);

        // Show alert
        reminderAlert.style.display = 'flex';
    }

    // Function to play sound based on type
    // This code from your script.js already handles playing the sounds
function playSound(soundType) {
    // Reset all sounds
    beepSound.pause();
    beepSound.currentTime = 0;
    bellSound.pause();
    bellSound.currentTime = 0;
    chimeSound.pause();
    chimeSound.currentTime = 0;

    // Play selected sound
    switch(soundType) {
        case 'beep':
            beepSound.play();
            break;
        case 'bell':
            bellSound.play();
            break;
        case 'chime':
            chimeSound.play();
            break;
        // No sound for 'none'
    }
}
});