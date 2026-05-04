const editBtn = document.getElementById('edit-btn');
const grid = document.getElementById('grid');
let isEditMode = false;
let draggedItem = null;
const placeholder = document.createElement('div');
placeholder.className = 'placeholder';

editBtn.addEventListener('click', () => {
    isEditMode = !isEditMode;
    if (isEditMode) {
        editBtn.textContent = 'Готово';
        grid.classList.add('edit-mode');
        document.querySelectorAll('.card').forEach(card => card.setAttribute('draggable', 'true'));
    } else {
        editBtn.textContent = 'Редагувати';
        grid.classList.remove('edit-mode');
        document.querySelectorAll('.card').forEach(card => card.removeAttribute('draggable'));
    }
});

grid.addEventListener('click', (e) => {
    if (isEditMode && e.target.classList.contains('delete-btn')) {
        e.target.parentElement.remove();
    }
});

grid.addEventListener('dragstart', (e) => {
    if (!isEditMode) {
        e.preventDefault();
        return;
    }
    draggedItem = e.target;
    setTimeout(() => {
        draggedItem.style.display = 'none';
        grid.insertBefore(placeholder, draggedItem.nextSibling);
    }, 0);
});

grid.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!isEditMode || !draggedItem) return;

    const target = e.target.closest('.card:not(.placeholder)');
    if (target && target !== draggedItem) {
        const box = target.getBoundingClientRect();
        const offsetX = e.clientX - box.left;
        if (offsetX > box.width / 2) {
            target.after(placeholder);
        } else {
            target.before(placeholder);
        }
    } else if (e.target === grid && !grid.contains(placeholder)) {
        grid.appendChild(placeholder);
    }
});

grid.addEventListener('dragend', () => {
    if (!isEditMode || !draggedItem) return;
    draggedItem.style.display = 'flex';
    if (placeholder.parentNode) {
        grid.insertBefore(draggedItem, placeholder);
        placeholder.remove();
    }
    draggedItem = null;
});