document.addEventListener('DOMContentLoaded', () => {
    // Tab Navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabs = document.querySelectorAll('.tab');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');

            // Remove active class from all buttons and tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            tabs.forEach(tab => tab.classList.remove('active'));

            // Add active class to clicked button and corresponding tab
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Clock functionality
    function updateClock() {
        const now = new Date();

        // Update digital clock
        const timeDisplay = document.querySelector('.digital-clock .time');
        const dateDisplay = document.querySelector('.digital-clock .date');
        const timezoneDisplay = document.querySelector('.digital-clock .timezone');

        // Format time with leading zeros
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;

        // Format date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.textContent = now.toLocaleDateString(undefined, options);

        // Get timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const offset = -(now.getTimezoneOffset() / 60);
        const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;
        timezoneDisplay.textContent = `${timezone} (UTC${offsetStr}:00)`;

        // Update analog clock
        const secondHand = document.querySelector('.second-hand');
        const minuteHand = document.querySelector('.minute-hand');
        const hourHand = document.querySelector('.hour-hand');

        const secondsDegrees = (now.getSeconds() / 60) * 360;
        const minutesDegrees = ((now.getMinutes() + now.getSeconds() / 60) / 60) * 360;
        const hoursDegrees = ((now.getHours() % 12 + now.getMinutes() / 60) / 12) * 360;

        secondHand.style.transform = `rotate(${secondsDegrees}deg)`;
        minuteHand.style.transform = `rotate(${minutesDegrees}deg)`;
        hourHand.style.transform = `rotate(${hoursDegrees}deg)`;
    }

    // Update clock immediately and then every second
    updateClock();
    setInterval(updateClock, 1000);

    // Timer functionality
    const timerHoursInput = document.getElementById('hours');
    const timerMinutesInput = document.getElementById('minutes');
    const timerSecondsInput = document.getElementById('seconds');
    const timerHoursDisplay = document.getElementById('timer-hours');
    const timerMinutesDisplay = document.getElementById('timer-minutes');
    const timerSecondsDisplay = document.getElementById('timer-seconds');
    const progressBar = document.querySelector('.progress-bar');
    const timerStartBtn = document.getElementById('timer-start');
    const timerPauseBtn = document.getElementById('timer-pause');
    const timerResetBtn = document.getElementById('timer-reset');
    const presetBtns = document.querySelectorAll('.preset-btn');

    let timerInterval;
    let timerTotalSeconds = 0;
    let timerRemainingSeconds = 0;
    let timerIsRunning = false;
    let timerEndTime = 0;

    // Input validation to ensure proper limits
    [timerHoursInput, timerMinutesInput, timerSecondsInput].forEach(input => {
        input.addEventListener('input', function() {
            if (this.value > parseInt(this.max)) {
                this.value = this.max;
            }
            if (this.value < 0) {
                this.value = 0;
            }
        });
    });

    // Timer preset buttons
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const seconds = parseInt(btn.getAttribute('data-time'));
            resetTimer();
            setTimerValue(seconds);
            btn.classList.add('animate-pulse');
            setTimeout(() => {
                btn.classList.remove('animate-pulse');
            }, 1000);
        });
    });

    function setTimerValue(totalSeconds) {
        timerRemainingSeconds = totalSeconds;
        timerTotalSeconds = totalSeconds;

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        timerHoursInput.value = hours;
        timerMinutesInput.value = minutes;
        timerSecondsInput.value = seconds;

        updateTimerDisplay();
    }

        function updateTimerDisplay() {
        const hours = Math.floor(timerRemainingSeconds / 3600);
        const minutes = Math.floor((timerRemainingSeconds % 3600) / 60);
        const seconds = timerRemainingSeconds % 60;

        timerHoursDisplay.textContent = String(hours).padStart(2, '0');
        timerMinutesDisplay.textContent = String(minutes).padStart(2, '0');
        timerSecondsDisplay.textContent = String(seconds).padStart(2, '0');

        // Update progress bar
        const progressPercentage = ((timerTotalSeconds - timerRemainingSeconds) / timerTotalSeconds) * 100;
        progressBar.style.width = `${progressPercentage}%`;
    }

    function startTimer() {
        if (timerIsRunning) return;

        // Get values from inputs if timer is not already running
        const hours = parseInt(timerHoursInput.value) || 0;
        const minutes = parseInt(timerMinutesInput.value) || 0;
        const seconds = parseInt(timerSecondsInput.value) || 0;

        timerTotalSeconds = hours * 3600 + minutes * 60 + seconds;
        timerRemainingSeconds = timerTotalSeconds;

        if (timerTotalSeconds <= 0) {
            alert('Please enter a valid time');
            return;
        }

        timerIsRunning = true;
        timerEndTime = Date.now() + (timerRemainingSeconds * 1000);

        updateTimerDisplay();

        timerStartBtn.disabled = true;
        timerPauseBtn.disabled = false;
        timerResetBtn.disabled = false;

        timerInterval = setInterval(() => {
            timerRemainingSeconds--;

            // If timer reaches zero
            if (timerRemainingSeconds <= 0) {
                clearInterval(timerInterval);
                timerIsRunning = false;
                timerStartBtn.disabled = false;
                timerPauseBtn.disabled = true;

                // Visual and audio alert when timer ends
                document.querySelector('.timer-countdown').classList.add('animate-pulse');
                playAlertSound();
                showNotification('Timer Complete', 'Your timer has finished!');

                setTimeout(() => {
                    document.querySelector('.timer-countdown').classList.remove('animate-pulse');
                }, 3000);
            }

            updateTimerDisplay();
        }, 1000);
    }

    function pauseTimer() {
        clearInterval(timerInterval);
        timerIsRunning = false;
        timerStartBtn.disabled = false;
        timerPauseBtn.disabled = true;
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timerIsRunning = false;
        timerRemainingSeconds = 0;
        timerTotalSeconds = 0;

        timerHoursInput.value = '';
        timerMinutesInput.value = '';
        timerSecondsInput.value = '';

        timerHoursDisplay.textContent = '00';
        timerMinutesDisplay.textContent = '00';
        timerSecondsDisplay.textContent = '00';

        progressBar.style.width = '0%';

        timerStartBtn.disabled = false;
        timerPauseBtn.disabled = true;
        timerResetBtn.disabled = true;
    }

    timerStartBtn.addEventListener('click', startTimer);
    timerPauseBtn.addEventListener('click', pauseTimer);
    timerResetBtn.addEventListener('click', resetTimer);

    // Stopwatch functionality
    const stopwatchDisplay = document.getElementById('stopwatch-time');
    const stopwatchStartBtn = document.getElementById('stopwatch-start');
    const stopwatchPauseBtn = document.getElementById('stopwatch-pause');
    const stopwatchResetBtn = document.getElementById('stopwatch-reset');
    const stopwatchLapBtn = document.getElementById('stopwatch-lap');
    const lapsList = document.querySelector('.laps-list');

    let stopwatchInterval;
    let stopwatchStartTime = 0;
    let stopwatchElapsedTime = 0;
    let stopwatchRunning = false;
    let lapCounter = 1;

    function formatStopwatchTime(timeInMs) {
        const ms = Math.floor(timeInMs % 1000);
        const seconds = Math.floor((timeInMs / 1000) % 60);
        const minutes = Math.floor((timeInMs / (1000 * 60)) % 60);
        const hours = Math.floor((timeInMs / (1000 * 60 * 60)));

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
    }

    function updateStopwatch() {
        const currentTime = Date.now();
        const elapsedTime = stopwatchElapsedTime + (currentTime - stopwatchStartTime);
        stopwatchDisplay.textContent = formatStopwatchTime(elapsedTime);
    }

    function startStopwatch() {
        if (stopwatchRunning) return;

        stopwatchRunning = true;
        stopwatchStartTime = Date.now();

        stopwatchStartBtn.disabled = true;
        stopwatchPauseBtn.disabled = false;
        stopwatchResetBtn.disabled = false;
        stopwatchLapBtn.disabled = false;

        stopwatchInterval = setInterval(updateStopwatch, 10); // Update every 10ms for more precision
    }

    function pauseStopwatch() {
        clearInterval(stopwatchInterval);
        stopwatchRunning = false;
        stopwatchElapsedTime += (Date.now() - stopwatchStartTime);

        stopwatchStartBtn.disabled = false;
        stopwatchPauseBtn.disabled = true;
    }

    function resetStopwatch() {
        clearInterval(stopwatchInterval);
        stopwatchRunning = false;
        stopwatchElapsedTime = 0;
        stopwatchDisplay.textContent = '00:00:00.000';

        stopwatchStartBtn.disabled = false;
        stopwatchPauseBtn.disabled = true;
        stopwatchResetBtn.disabled = true;
        stopwatchLapBtn.disabled = true;

        // Clear laps
        lapsList.innerHTML = '';
        lapCounter = 1;
    }

    function recordLap() {
        const currentTime = Date.now();
        const lapTime = stopwatchElapsedTime + (currentTime - stopwatchStartTime);

        const lapItem = document.createElement('div');
        lapItem.classList.add('lap-item');

        const lapNumberSpan = document.createElement('span');
        lapNumberSpan.classList.add('lap-number');
        lapNumberSpan.textContent = `Lap ${lapCounter}`;

        const lapTimeSpan = document.createElement('span');
        lapTimeSpan.classList.add('lap-time');
        lapTimeSpan.textContent = formatStopwatchTime(lapTime);

        lapItem.appendChild(lapNumberSpan);
        lapItem.appendChild(lapTimeSpan);

        // Add to the beginning of the list for easier reading
        lapsList.insertBefore(lapItem, lapsList.firstChild);

        lapCounter++;
    }

    stopwatchStartBtn.addEventListener('click', startStopwatch);
    stopwatchPauseBtn.addEventListener('click', pauseStopwatch);
    stopwatchResetBtn.addEventListener('click', resetStopwatch);
    stopwatchLapBtn.addEventListener('click', recordLap);

    // Alarm functionality
    const alarmHoursInput = document.getElementById('alarm-hours');
    const alarmMinutesInput = document.getElementById('alarm-minutes');
    const setAlarmBtn = document.getElementById('set-alarm');
    const alarmsContainer = document.getElementById('alarms-container');

    let alarms = [];
    let alarmCheckInterval;

    function checkAlarms() {
        if (alarms.length === 0) return;

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        alarms.forEach((alarm, index) => {
            if (alarm.hour === currentHour && alarm.minute === currentMinute) {
                // Trigger alarm
                playAlertSound();
                showNotification('Alarm!', `Your alarm set for ${formatAlarmTime(alarm)} has triggered!`);

                // Make alarm item pulse
                const alarmItem = document.querySelector(`[data-alarm-index="${index}"]`);
                if (alarmItem) {
                    alarmItem.classList.add('animate-pulse');
                    setTimeout(() => {
                        alarmItem.classList.remove('animate-pulse');
                    }, 5000);
                }
            }
        });
    }

    function formatAlarmTime(alarm) {
        return `${String(alarm.hour).padStart(2, '0')}:${String(alarm.minute).padStart(2, '0')}`;
    }

    function setAlarm() {
        const hours = parseInt(alarmHoursInput.value);
        const minutes = parseInt(alarmMinutesInput.value);

        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            alert('Please enter valid hours (0-23) and minutes (0-59)');
            return;
        }

        const newAlarm = {
            hour: hours,
            minute: minutes
        };

        alarms.push(newAlarm);

        // Start checking alarms if this is the first one
        if (alarms.length === 1) {
            alarmCheckInterval = setInterval(checkAlarms, 1000);
        }

        renderAlarms();

        // Clear input fields
        alarmHoursInput.value = '';
        alarmMinutesInput.value = '';
    }

    function deleteAlarm(index) {
        alarms.splice(index, 1);

        // Stop checking if no more alarms
        if (alarms.length === 0) {
            clearInterval(alarmCheckInterval);
        }

        renderAlarms();
    }

    function renderAlarms() {
        alarmsContainer.innerHTML = '';

        if (alarms.length === 0) {
            const noAlarms = document.createElement('p');
            noAlarms.textContent = 'No alarms set';
            noAlarms.style.textAlign = 'center';
            noAlarms.style.color = '#888';
            alarmsContainer.appendChild(noAlarms);
            return;
        }

        alarms.forEach((alarm, index) => {
            const alarmItem = document.createElement('div');
            alarmItem.classList.add('alarm-item');
            alarmItem.setAttribute('data-alarm-index', index);

            const alarmTime = document.createElement('div');
            alarmTime.classList.add('alarm-time');
            alarmTime.textContent = formatAlarmTime(alarm);

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('alarm-delete');
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', () => deleteAlarm(index));

            alarmItem.appendChild(alarmTime);
            alarmItem.appendChild(deleteBtn);

            alarmsContainer.appendChild(alarmItem);
        });
    }

    setAlarmBtn.addEventListener('click', setAlarm);
    renderAlarms(); // Initial render

    // Pomodoro functionality
    const pomodoroDisplay = document.querySelector('.pomodoro-time');
    const pomodoroMode = document.querySelector('.pomodoro-mode');
    const pomodoroCycles = document.querySelector('.pomodoro-cycles');
    const pomodoroProgress = document.querySelector('.pomodoro-progress');
    const pomodoroStartBtn = document.getElementById('pomodoro-start');
    const pomodoroPauseBtn = document.getElementById('pomodoro-pause');
    const pomodoroResetBtn = document.getElementById('pomodoro-reset');

    const focusTimeInput = document.getElementById('focus-time');
    const breakTimeInput = document.getElementById('break-time');
    const longBreakTimeInput = document.getElementById('long-break-time');
    const cyclesInput = document.getElementById('pomodoro-cycles');

    let pomodoroInterval;
    let pomodoroRunning = false;
    let pomodoroRemainingTime = 0;
    let pomodoroTotalTime = 0;
    let currentCycle = 1;
    let isBreak = false;
    let isLongBreak = false;

    function updatePomodoroDisplay() {
        const minutes = Math.floor(pomodoroRemainingTime / 60);
        const seconds = pomodoroRemainingTime % 60;

        pomodoroDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Update progress bar
        const progressPercentage = ((pomodoroTotalTime - pomodoroRemainingTime) / pomodoroTotalTime) * 100;
        pomodoroProgress.style.width = `${progressPercentage}%`;

        // Update cycles display
        const totalCycles = parseInt(cyclesInput.value) || 4;
        pomodoroCycles.textContent = `Cycle ${currentCycle}/${totalCycles}`;
    }

    function startPomodoro() {
        if (pomodoroRunning) return;

        pomodoroRunning = true;

        if (pomodoroRemainingTime === 0) {
            // Start a new pomodoro session
            currentCycle = 1;
            isBreak = false;
            isLongBreak = false;

            switchPomodoroMode();
        }

        pomodoroStartBtn.disabled = true;
        pomodoroPauseBtn.disabled = false;
        pomodoroResetBtn.disabled = false;

        // Disable settings while timer is running
        focusTimeInput.disabled = true;
        breakTimeInput.disabled = true;
        longBreakTimeInput.disabled = true;
        cyclesInput.disabled = true;

        pomodoroInterval = setInterval(() => {
            pomodoroRemainingTime--;

            if (pomodoroRemainingTime <= 0) {
                clearInterval(pomodoroInterval);

                // Play sound and show notification when timer ends
                playAlertSound();

                if (isBreak) {
                    if (isLongBreak) {
                        // After a long break, reset to cycle 1
                        currentCycle = 1;
                        showNotification('Pomodoro', 'Long break finished. Ready to start a new set of focus sessions?');
                    } else {
                        showNotification('Pomodoro', 'Break time over. Back to focusing!');
                    }

                    isBreak = false;
                    isLongBreak = false;
                } else {
                    const totalCycles = parseInt(cyclesInput.value) || 4;

                    isBreak = true;

                    if (currentCycle % totalCycles === 0) {
                        isLongBreak = true;
                        showNotification('Pomodoro', 'Good job! Time for a long break.');
                    } else {
                        currentCycle++;
                        showNotification('Pomodoro', 'Focus session complete. Take a short break!');
                    }
                }

                switchPomodoroMode();
                pomodoroRunning = false;
                pomodoroStartBtn.disabled = false;
                pomodoroPauseBtn.disabled = true;
            }

            updatePomodoroDisplay();
        }, 1000);
    }

    function switchPomodoroMode() {
        const focusTime = parseInt(focusTimeInput.value) || 25;
        const breakTime = parseInt(breakTimeInput.value) || 5;
        const longBreakTime = parseInt(longBreakTimeInput.value) || 15;

        if (isBreak) {
            if (isLongBreak) {
                pomodoroRemainingTime = longBreakTime * 60;
                pomodoroTotalTime = pomodoroRemainingTime;
                pomodoroMode.textContent = 'Long Break';
                pomodoroMode.style.color = 'var(--pomodoro-break)';
                pomodoroProgress.style.backgroundColor = 'var(--pomodoro-break)';
            } else {
                pomodoroRemainingTime = breakTime * 60;
                pomodoroTotalTime = pomodoroRemainingTime;
                pomodoroMode.textContent = 'Short Break';
                pomodoroMode.style.color = 'var(--pomodoro-break)';
                pomodoroProgress.style.backgroundColor = 'var(--pomodoro-break)';
            }
        } else {
            pomodoroRemainingTime = focusTime * 60;
            pomodoroTotalTime = pomodoroRemainingTime;
            pomodoroMode.textContent = 'Focus Time';
            pomodoroMode.style.color = 'var(--pomodoro-work)';
            pomodoroProgress.style.backgroundColor = 'var(--pomodoro-work)';
        }

        updatePomodoroDisplay();
    }

    function pausePomodoro() {
        clearInterval(pomodoroInterval);
        pomodoroRunning = false;
        pomodoroStartBtn.disabled = false;
        pomodoroPauseBtn.disabled = true;
    }

    function resetPomodoro() {
        clearInterval(pomodoroInterval);
        pomodoroRunning = false;
        pomodoroRemainingTime = 0;
        currentCycle = 1;
        isBreak = false;
        isLongBreak = false;

        pomodoroStartBtn.disabled = false;
        pomodoroPauseBtn.disabled = true;
        pomodoroResetBtn.disabled = true;

        // Re-enable settings
        focusTimeInput.disabled = false;
        breakTimeInput.disabled = false;
        longBreakTimeInput.disabled = false;
        cyclesInput.disabled = false;

        switchPomodoroMode();
    }

    pomodoroStartBtn.addEventListener('click', startPomodoro);
    pomodoroPauseBtn.addEventListener('click', pausePomodoro);
    pomodoroResetBtn.addEventListener('click', resetPomodoro);

    // Initialize pomodoro display
    switchPomodoroMode();

    // Utility functions
    function playAlertSound() {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play()
            .catch(error => console.log('Error playing sound:', error));
    }

    function showNotification(title, message) {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(title, {
                    body: message,
                    icon: 'https://img.icons8.com/color/96/000000/alarm-clock--v1.png'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(title, {
                            body: message,
                            icon: 'https://img.icons8.com/color/96/000000/alarm-clock--v1.png'
                        });
                    }
                });
            }
        }

        // Also create an on-screen notification
        const notification = document.createElement('div');
        notification.classList.add('on-screen-notification');
        notification.innerHTML = `
            <h3>${title}</h3>
            <p>${message}</p>
        `;
        document.body.appendChild(notification);

        // Add styles for the notification
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = 'white';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '10px';
        notification.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        notification.style.zIndex = '1000';
        notification.style.maxWidth = '300px';
        notification.style.animation = 'slideIn 0.5s forwards';

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s forwards';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 5000);
    }

    // Add necessary animations to the stylesheet
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Add dark mode toggle feature
    const darkModeToggle = document.createElement('button');
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i> Toggle Dark Mode';
    darkModeToggle.classList.add('control-btn');
    darkModeToggle.style.position = 'fixed';
    darkModeToggle.style.bottom = '20px';
    darkModeToggle.style.right = '20px';
    darkModeToggle.style.zIndex = '100';

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');

        if (document.body.classList.contains('dark-mode')) {
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Toggle Light Mode';
        } else {
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i> Toggle Dark Mode';
        }
    });

    document.body.appendChild(darkModeToggle);
});