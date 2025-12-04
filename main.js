let tasks = [];
let searchKeyword = '';
const RENDER_EVENT = 'render-event';
const STORAGE_KEY = 'nects-todo';

function isStorageExist() {
  if (typeof(Storage) === undefined) {
    return false;
  }
  return true;
}

function save() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(tasks);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
  return;
}

function loadData() {
  if (!isStorageExist()) {
    tasks = [];
    return;
  }
  
  const serialized = localStorage.getItem(STORAGE_KEY);
  if (!serialized) {
    tasks = [];
    return;
  }
  
  let parsed;
  try {
    parsed = JSON.parse(serialized);
  } catch (error) {
    parsed = [];
  }
  
  if (Array.isArray(parsed)) {
    tasks = parsed;
  } else {
    tasks = [];
  }
}

function render() {
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function generateTimestamp() {
  return Date.now();
}

function taskObject(id, title, description, timestamp, isCompleted) {
  return {
    id,
    title,
    description,
    timestamp,
    isCompleted
  };
}

function findTask(id) {
  for (const task of tasks) {
    if (task.id === id) {
      return task;
    }
  }
  return null;
}

function findTaskIndex(id) {
  for (const index in tasks) {
    if (tasks[index].id === id) {
      return index;
    }
  }
  return -1;
}

function completeTask(id) {
  const taskObject = findTask(id);
  
  if (taskObject === null) return;
  
  if (!taskObject.isCompleted) {
    taskObject.isCompleted = true;
  } else {
    taskObject.isCompleted = false;
  }
  
  render();
  save();
}

function removeTask(id) {
  const taskIndex = findTaskIndex(id);
  
  if (taskIndex === -1) return;
  
  tasks.splice(taskIndex, 1);
  
  render();
  save();
}

function removeAll() {
  tasks = tasks.filter((task) => task.isCompleted === false);
  
  render();
  save();
}

function generateElement(taskObject) {
  const taskContainer = document.createElement('div');
  const taskTitle = document.createElement('h2');
  const taskDescription = document.createElement('p');
  const taskTimestamp = document.createElement('p');
  const buttonContainer = document.createElement('div');
  const completeButton = document.createElement('button');
  const removeButton = document.createElement('button');
  
  taskContainer.setAttribute('class', 'task');
  buttonContainer.setAttribute('class', 'task-buttons');
  completeButton.setAttribute('class', 'complete-task');
  removeButton.setAttribute('class', 'remove-task');
  
  taskTitle.textContent = taskObject.title;
  taskDescription.textContent = taskObject.description;
  taskTimestamp.textContent = new Date(taskObject.timestamp).toLocaleString();
  
  if (!taskObject.isCompleted) {
    completeButton.textContent = 'Complete';
  } else {
    completeButton.textContent = 'Undo';
  }
  
  removeButton.textContent = 'Remove';
  
  completeButton.addEventListener('click', () => {
    completeTask(taskObject.id);
  });
  removeButton.addEventListener('click', () => {
    removeTask(taskObject.id);
  });
  
  buttonContainer.append(completeButton, removeButton);
  
  taskContainer.append(taskTitle, taskDescription, taskTimestamp, buttonContainer);
  
  return taskContainer;
}

function createTask() {
  const taskName = document.getElementById('form-taskName').value;
  const taskDesc = document.getElementById('form-taskDescription').value;
  const timestamp = generateTimestamp();
  const isCompleted = false;
  
  const taskId = `task-${timestamp}-${Math.random().toString(36).slice(2)}`;
  
  const task = taskObject(taskId, taskName, taskDesc, timestamp, isCompleted);
  tasks.push(task);
  
  render();
  save();
}

document.addEventListener("DOMContentLoaded", () => {
  const taskForm = document.getElementById('task-form');
  const removeButton = document.getElementById('reset-task');
  const searchInput = document.getElementById('search');
  
  if (isStorageExist()) loadData();
  
  render();
  
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const taskName = document.getElementById('form-taskName').value;
    const taskDesc = document.getElementById('form-taskDescription').value;
  
    if (!taskName.trim() && !taskDesc.trim()) {
      return;
    }
    
    createTask();
    taskForm.reset();
  });
  removeButton.addEventListener("click", () => {
    removeAll();
  });
  searchInput.addEventListener('input', () => {
    const keyword = searchInput.value.trim().toLowerCase();
    searchKeyword = keyword;
    render();
  });
});

document.addEventListener(RENDER_EVENT, () => {
  const activeTask = document.getElementById('active-tasks');
  const completedTask = document.getElementById('completed-tasks');
  
  activeTask.innerHTML = "";
  completedTask.innerHTML = "";
  
  for (const task of tasks) {
    if (searchKeyword && !task.title.toLowerCase().includes(searchKeyword)) {
      continue;
    }
    
    const taskElement = generateElement(task);
    if (!task.isCompleted) {
      activeTask.append(taskElement);
    } else {
      completedTask.append(taskElement);
    }
  }
});