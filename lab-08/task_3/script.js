function allowDrop(ev) {
    ev.preventDefault();
    if (!ev.currentTarget.classList.contains('drag-over')) {
        ev.currentTarget.classList.add('drag-over');
    }
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    ev.target.classList.add('dragging');
}

function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);

    draggedElement.classList.remove('dragging');

    let targetList = ev.target;
    if (!targetList.classList.contains('task-list')) {
        targetList = ev.target.closest('.task-list');
    }

    if (targetList) {
        targetList.appendChild(draggedElement);
        targetList.classList.remove('drag-over');
    }
}

document.addEventListener('dragleave', (ev) => {
    if (ev.target.classList.contains('task-list')) {
        ev.target.classList.remove('drag-over');
    }
});

document.addEventListener('dragend', (ev) => {
    if (ev.target.classList.contains('task-card')) {
        ev.target.classList.remove('dragging');
    }
    document.querySelectorAll('.task-list').forEach(list => {
        list.classList.remove('drag-over');
    });
});