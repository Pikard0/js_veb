'use strict';

let state = {
    tasks: [],
    sortBy: null
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
const getTimestamp = () => new Date().getTime();

const addTask = (tasks, text) => [
    ...tasks,
    { id: generateId(), text, completed: false, createdAt: getTimestamp(), updatedAt: getTimestamp() }
];

const deleteTask = (tasks, id) => tasks.filter(task => task.id !== id);

const toggleTaskStatus = (tasks, id) => tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed, updatedAt: getTimestamp() } : task
);


const updateTaskText = (tasks, id, newText) => tasks.map(task =>
    task.id === id ? { ...task, text: newText, updatedAt: getTimestamp() } : task
);

const sortTasks = (tasks, sortBy) => {
    if (!sortBy) return tasks;
    const copy = [...tasks];

    if (sortBy === 'created') {
        return copy.sort((a, b) => b.createdAt - a.createdAt); // Новіші зверху
    }
    if (sortBy === 'updated') {
        return copy.sort((a, b) => b.updatedAt - a.updatedAt); // Останні оновлені зверху
    }
    if (sortBy === 'status') {
        return copy.sort((a, b) => Number(a.completed) - Number(b.completed));
    }
    return copy;
};

const DOM = {
    form: document.getElementById('todoForm'),
    input: document.getElementById('taskInput'),
    list: document.getElementById('taskList'),
    emptyMsg: document.getElementById('emptyMessage')
};

const renderTasks = () => {
    const processedTasks = sortTasks(state.tasks, state.sortBy);

    DOM.list.innerHTML = '';
    DOM.emptyMsg.classList.toggle('hidden', processedTasks.length > 0);

    processedTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;

        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
            </div>
            <div class="task-actions">
                <button class="btn edit-btn">Редагувати</button>
                <button class="btn danger-btn">Видалити</button>
            </div>
        `;

        const checkbox = li.querySelector('.task-checkbox');
        const textSpan = li.querySelector('.task-text');
        const contentDiv = li.querySelector('.task-content');
        const editBtn = li.querySelector('.edit-btn');
        const deleteBtn = li.querySelector('.danger-btn');

        checkbox.addEventListener('change', () => {
            state.tasks = toggleTaskStatus(state.tasks, task.id);
            renderTasks();
        });

        deleteBtn.addEventListener('click', () => {
            li.classList.add('removing');
            setTimeout(() => {
                state.tasks = deleteTask(state.tasks, task.id);
                renderTasks();
            }, 300);
        });

        editBtn.addEventListener('click', () => {
            if (li.classList.contains('editing')) {
                const inputElement = contentDiv.querySelector('.edit-input');
                const newText = inputElement.value.trim();

                if (newText && newText.length >= 3) {
                    state.tasks = updateTaskText(state.tasks, task.id, newText);
                    renderTasks();
                } else {
                    renderTasks();
                }
            } else {
                li.classList.add('editing');
                checkbox.style.display = 'none';
                textSpan.style.display = 'none';

                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'edit-input';
                input.value = task.text;

                contentDiv.appendChild(input);
                input.focus();

                editBtn.textContent = 'Зберегти';
                editBtn.classList.remove('edit-btn');
                editBtn.classList.add('primary-btn');
            }
        });

        DOM.list.appendChild(li);
    });
};

DOM.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = DOM.input.value.trim();
    if (text) {
        state.tasks = addTask(state.tasks, text);
        DOM.input.value = '';
        renderTasks();
    }
});

document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        state.sortBy = e.target.dataset.sort;
        renderTasks();
    });
});

document.getElementById('resetSortBtn').addEventListener('click', () => {
    state.sortBy = null;
    renderTasks();
});

renderTasks();