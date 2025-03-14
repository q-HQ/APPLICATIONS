document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const boardContainer = document.querySelector('.board-container');
    const addBoardPlaceholder = document.querySelector('.add-board-placeholder');
    const addCardBtns = document.querySelectorAll('.add-card-btn');
    const cardModal = document.getElementById('card-modal');
    const projectModal = document.getElementById('project-modal');
    const confirmModal = document.getElementById('confirm-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const addCardForm = document.getElementById('add-card-form');
    const addProjectForm = document.getElementById('add-project-form');
    const darkModeBtn = document.getElementById('dark-mode-btn');
    const addBoardBtn = document.getElementById('add-board-btn');
    const newProjectBtn = document.getElementById('new-project-btn');
    const projectSelect = document.getElementById('project-select');
    const confirmYesBtn = document.getElementById('confirm-yes');
    const confirmNoBtn = document.getElementById('confirm-no');
    const confirmMessage = document.getElementById('confirm-message');

    // Current active board for adding cards
    let activeBoard = null;
    let currentAction = null;
    let actionPayload = null;

    // Project data structure
    let projects = {
        default: {
            name: "Default Project",
            description: "Default project board",
            boards: [] // Board IDs will be stored here
        }
    };

    let currentProject = 'default';

    // Initialize board delay animations
    document.querySelectorAll('.board').forEach((board, index) => {
        board.style.animationDelay = `${0.1 * (index + 1)}s`;
    });

    // Load data from localStorage if available
    function loadFromLocalStorage() {
        const savedProjects = localStorage.getItem('flowBoardProjects');
        const savedCurrentProject = localStorage.getItem('flowBoardCurrentProject');
        const savedTheme = localStorage.getItem('flowBoardTheme');

        if (savedProjects) {
            projects = JSON.parse(savedProjects);
            updateProjectSelector();
        }

        if (savedCurrentProject && projects[savedCurrentProject]) {
            currentProject = savedCurrentProject;
            projectSelect.value = currentProject;
        }

        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            darkModeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    // Save data to localStorage
    function saveToLocalStorage() {
        localStorage.setItem('flowBoardProjects', JSON.stringify(projects));
        localStorage.setItem('flowBoardCurrentProject', currentProject);
    }

    // Update project selector dropdown
    function updateProjectSelector() {
        projectSelect.innerHTML = '';

        Object.keys(projects).forEach(projectId => {
            const option = document.createElement('option');
            option.value = projectId;
            option.textContent = projects[projectId].name;
            projectSelect.appendChild(option);
        });

        projectSelect.value = currentProject;
    }

    // Load boards for current project
    function loadBoards() {
        // Clear existing boards except the add placeholder
        const existingBoards = document.querySelectorAll('.board');
        existingBoards.forEach(board => {
            board.remove();
        });

        // Create HTML from the current project's boards
        if (projects[currentProject] && Array.isArray(projects[currentProject].boards)) {
            projects[currentProject].boards.forEach((boardData, index) => {
                const board = createBoardElement(boardData, index);
                boardContainer.insertBefore(board, addBoardPlaceholder);
            });
        }

        // Reinitialize drag and drop
        initDragAndDrop();
    }

    // Create a board element from data
    function createBoardElement(boardData, index) {
        const board = document.createElement('div');
        board.className = 'board';
        board.setAttribute('data-board-id', boardData.id);
        board.style.animationDelay = `${0.1 * (index + 1)}s`;

        board.innerHTML = `
            <div class="board-header">
                <h3 contenteditable="true">${boardData.title}</h3>
                <div class="board-controls">
                    <button class="add-card-btn"><i class="fas fa-plus"></i></button>
                    <button class="delete-board-btn"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div class="cards-container"></div>
        `;

        // Add event listeners
        const addCardBtn = board.querySelector('.add-card-btn');
        addCardBtn.addEventListener('click', () => {
            activeBoard = board;
            openModal(cardModal);
        });

        const deleteBoardBtn = board.querySelector('.delete-board-btn');
        deleteBoardBtn.addEventListener('click', () => {
            confirmAction('Are you sure you want to delete this board?', () => {
                deleteBoard(board);
            });
        });

        const boardTitle = board.querySelector('h3');
        boardTitle.addEventListener('blur', () => {
            updateBoardTitle(board, boardTitle.textContent);
        });

        // Add cards to this board
        const cardsContainer = board.querySelector('.cards-container');
        if (boardData.cards && Array.isArray(boardData.cards)) {
            boardData.cards.forEach(cardData => {
                const card = createCardElement(cardData);
                cardsContainer.appendChild(card);
            });
        }

        return board;
    }

    // Create a card element from data
    function createCardElement(cardData) {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('draggable', 'true');
        card.setAttribute('data-card-id', cardData.id);

        card.innerHTML = `
            <div class="card-content">
                <h4>${cardData.title}</h4>
                <p>${cardData.description || ''}</p>
            </div>
            <div class="card-footer">
                <span class="priority ${cardData.priority}">${cardData.priority.charAt(0).toUpperCase() + cardData.priority.slice(1)}</span>
                <span class="date">${formatDate(cardData.dueDate)}</span>
                <button class="delete-card-btn"><i class="fas fa-times"></i></button>
            </div>
        `;

        // Add event listeners
        const deleteBtn = card.querySelector('.delete-card-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            confirmAction('Are you sure you want to delete this card?', () => {
                deleteCard(card);
            });
        });

        // Add drag events
        initCardDragEvents(card);

        return card;
    }

    // Add new board
    function addNewBoard() {
        const boardId = `board-${Date.now()}`;
        const newBoardData = {
            id: boardId,
            title: "New Board",
            cards: []
        };

        // Update data structure
        if (!projects[currentProject].boards) {
            projects[currentProject].boards = [];
        }

        projects[currentProject].boards.push(newBoardData);
        saveToLocalStorage();

        // Create DOM element
        const board = createBoardElement(newBoardData, projects[currentProject].boards.length - 1);
        boardContainer.insertBefore(board, addBoardPlaceholder);

        // Reinitialize drag and drop
        initDragAndDrop();
    }

    // Delete a board
    function deleteBoard(board) {
        const boardId = board.getAttribute('data-board-id');

        // Remove from data structure
        projects[currentProject].boards = projects[currentProject].boards.filter(b => b.id !== boardId);
        saveToLocalStorage();

        // Animate removal
        board.classList.add('board-exit');
        setTimeout(() => {
            board.remove();
        }, 400);
    }

    // Update board title
    function updateBoardTitle(board, newTitle) {
        const boardId = board.getAttribute('data-board-id');

        // Update in data structure
        const boardData = projects[currentProject].boards.find(b => b.id === boardId);
        if (boardData) {
            boardData.title = newTitle;
            saveToLocalStorage();
        }
    }

    // Add a new card to a board
    function addCardToBoard(boardElement, cardData) {
        const boardId = boardElement.getAttribute('data-board-id');

        // Add to data structure
        const boardData = projects[currentProject].boards.find(b => b.id === boardId);
        if (boardData) {
            if (!boardData.cards) {
                boardData.cards = [];
            }

            boardData.cards.push(cardData);
            saveToLocalStorage();

            // Create DOM element
            const card = createCardElement(cardData);
            const cardsContainer = boardElement.querySelector('.cards-container');
            cardsContainer.appendChild(card);

            // Add animation class
            card.style.animationDelay = '0s';
        }
    }

    // Delete a card
    function deleteCard(card) {
        const cardId = card.getAttribute('data-card-id');
        const board = card.closest('.board');
        const boardId = board.getAttribute('data-board-id');

        // Remove from data structure
        const boardData = projects[currentProject].boards.find(b => b.id === boardId);
        if (boardData && boardData.cards) {
            boardData.cards = boardData.cards.filter(c => c.id !== cardId);
            saveToLocalStorage();
        }

        // Animate removal
        card.classList.add('card-exit');
        setTimeout(() => {
            card.remove();
        }, 300);
    }

    // Format date for display
    function formatDate(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        const month = date.toLocaleString('default', { month: 'short' });
        return `${month} ${date.getDate()}`;
    }

    // Open modal
    function openModal(modal) {
        modal.style.display = 'block';

        if (modal === cardModal) {
            document.getElementById('card-title').focus();
        } else if (modal === projectModal) {
            document.getElementById('project-name').focus();
        }
    }

    // Close modal
    function closeModal(modal) {
        modal.style.display = 'none';

        // Reset form
        if (modal === cardModal) {
            addCardForm.reset();
        } else if (modal === projectModal) {
            addProjectForm.reset();
        }
    }

    // Confirm action modal
    function confirmAction(message, onConfirm) {
        confirmMessage.textContent = message;
        openModal(confirmModal);

        currentAction = onConfirm;
    }

    // Create new project
    function addNewProject(name, description) {
        const projectId = `project-${Date.now()}`;

        projects[projectId] = {
            name: name,
            description: description,
            boards: []
        };

        currentProject = projectId;
        updateProjectSelector();
        saveToLocalStorage();
        loadBoards();
    }

    // Initialize drag and drop
    function initDragAndDrop() {
        const cards = document.querySelectorAll('.card');
        const cardsContainers = document.querySelectorAll('.cards-container');

        cards.forEach(card => {
            initCardDragEvents(card);
        });

        cardsContainers.forEach(container => {
            container.addEventListener('dragover', e => {
                e.preventDefault();
                const afterElement = getDragAfterElement(container, e.clientY);
                const draggable = document.querySelector('.dragging');

                if (afterElement == null) {
                    container.appendChild(draggable);
                } else {
                    container.insertBefore(draggable, afterElement);
                }

                container.classList.add('drop-zone');
            });

            container.addEventListener('dragleave', () => {
                container.classList.remove('drop-zone');
            });

            container.addEventListener('drop', e => {
                container.classList.remove('drop-zone');

                // Update data structure after drag
                updateCardPositions();
            });
        });
    }

    // Initialize drag events for a card
    function initCardDragEvents(card) {
        card.addEventListener('dragstart', () => {
            card.classList.add('dragging');

            // Add delay to prevent immediate drag end
            setTimeout(() => {
                card.classList.add('opacity-low');
            }, 0);
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            card.classList.remove('opacity-low');

            // Update card's board data
            const board = card.closest('.board');
            const boardId = board.getAttribute('data-board-id');
            const cardId = card.getAttribute('data-card-id');

            moveCardToBoard(cardId, boardId);
        });
    }

    // Move card to a different board in the data structure
    function moveCardToBoard(cardId, targetBoardId) {
        // Find the card data in all boards
        let cardData = null;
        let sourceBoardData = null;

        projects[currentProject].boards.forEach(board => {
            if (board.cards) {
                const foundCard = board.cards.find(c => c.id === cardId);
                if (foundCard) {
                    cardData = foundCard;
                    sourceBoardData = board;
                }
            }
        });

        if (cardData && sourceBoardData) {
            // Remove from source board
            sourceBoardData.cards = sourceBoardData.cards.filter(c => c.id !== cardId);

            // Add to target board
            const targetBoardData = projects[currentProject].boards.find(b => b.id === targetBoardId);
            if (targetBoardData) {
                if (!targetBoardData.cards) {
                    targetBoardData.cards = [];
                }
                targetBoardData.cards.push(cardData);
            }

            saveToLocalStorage();
        }
    }

    // Update card positions after drag and drop
    function updateCardPositions() {
        const boards = document.querySelectorAll('.board');

        boards.forEach(board => {
            const boardId = board.getAttribute('data-board-id');
            const boardData = projects[currentProject].boards.find(b => b.id === boardId);

            if (boardData) {
                boardData.cards = [];

                // Get all cards in their current order
                const cards = board.querySelectorAll('.card');
                cards.forEach(card => {
                    const cardId = card.getAttribute('data-card-id');

                    // Find original card data from any board
                    let cardData = null;
                    projects[currentProject].boards.forEach(b => {
                        if (b.cards) {
                            const foundCard = b.cards.find(c => c.id === cardId);
                            if (foundCard) {
                                cardData = foundCard;
                            }
                        }
                    });

                    if (cardData) {
                        boardData.cards.push(cardData);
                    }
                });

                saveToLocalStorage();
            }
        });
    }

    // Get the element after which to place the dragged card
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.card:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Event Listeners

    // Dark mode toggle
    darkModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');

        if (document.body.classList.contains('dark-mode')) {
            darkModeBtn.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('flowBoardTheme', 'dark');
        } else {
            darkModeBtn.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('flowBoardTheme', 'light');
        }
    });

    // Add board button
    addBoardBtn.addEventListener('click', addNewBoard);

    // Add board placeholder
    addBoardPlaceholder.addEventListener('click', addNewBoard);

    // Close modal buttons
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            closeModal(modal);
        });
    });

    // Add card form submission
    addCardForm.addEventListener('submit', e => {
        e.preventDefault();

        if (!activeBoard) return;

        const cardId = `card-${Date.now()}`;
        const cardData = {
            id: cardId,
            title: document.getElementById('card-title').value,
            description: document.getElementById('card-description').value,
            priority: document.getElementById('card-priority').value,
            dueDate: document.getElementById('card-date').value
        };

        addCardToBoard(activeBoard, cardData);
        closeModal(cardModal);

        // Reset active board after adding card
        activeBoard = null;
    });

    // Add project form submission
    addProjectForm.addEventListener('submit', e => {
        e.preventDefault();

        const projectName = document.getElementById('project-name').value;
        const projectDescription = document.getElementById('project-description').value;

        addNewProject(projectName, projectDescription);
        closeModal(projectModal);
    });

    // Project selection change
    projectSelect.addEventListener('change', () => {
        currentProject = projectSelect.value;
        localStorage.setItem('flowBoardCurrentProject', currentProject);
        loadBoards();
    });

    // New project button
    newProjectBtn.addEventListener('click', () => {
        openModal(projectModal);
    });

    // Confirm action buttons
    confirmYesBtn.addEventListener('click', () => {
        if (currentAction) {
            currentAction();
            currentAction = null;
        }
        closeModal(confirmModal);
    });

    confirmNoBtn.addEventListener('click', () => {
        closeModal(confirmModal);
        currentAction = null;
    });

    // Initialize existing add card buttons
    addCardBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            activeBoard = btn.closest('.board');
            openModal(cardModal);
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', e => {
        if (e.target === cardModal) {
            closeModal(cardModal);
        } else if (e.target === projectModal) {
            closeModal(projectModal);
        } else if (e.target === confirmModal) {
            closeModal(confirmModal);
            currentAction = null;
        }
    });

    // Initialize app
    loadFromLocalStorage();
    loadBoards();
    initDragAndDrop();

    // Initialize existing board titles
    document.querySelectorAll('.board-header h3').forEach(title => {
        title.addEventListener('blur', () => {
            const board = title.closest('.board');
            updateBoardTitle(board, title.textContent);
        });
    });

    // Initialize existing delete board buttons
    document.querySelectorAll('.delete-board-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const board = btn.closest('.board');
            confirmAction('Are you sure you want to delete this board?', () => {
                deleteBoard(board);
            });
        });
    });

    // Save initial data if none exists
    if (!localStorage.getItem('flowBoardProjects')) {
        // Create initial board data from existing HTML structure
        const initialBoards = [];
        document.querySelectorAll('.board').forEach(board => {
            const boardId = board.getAttribute('data-board-id');
            const boardTitle = board.querySelector('h3').textContent;

            const cards = [];
            board.querySelectorAll('.card').forEach(card => {
                const cardId = `card-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                card.setAttribute('data-card-id', cardId);

                const cardTitle = card.querySelector('h4').textContent;
                const cardDesc = card.querySelector('p').textContent;
                const priorityEl = card.querySelector('.priority');
                const priority = priorityEl ? priorityEl.classList[1] : 'medium';
                const dateEl = card.querySelector('.date');
                const dueDate = dateEl ? dateEl.textContent : '';

                cards.push({
                    id: cardId,
                    title: cardTitle,
                    description: cardDesc,
                    priority: priority,
                    dueDate: dueDate
                });
            });

            initialBoards.push({
                id: boardId,
                title: boardTitle,
                cards: cards
            });
        });

        projects.default.boards = initialBoards;
        saveToLocalStorage();
    }
});