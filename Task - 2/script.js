// ---------- 1. DATA (the "state") ----------
// Every task is an object like:
// { id: "123", text: "Study", category: "Study", due: "2026-12-01", completed: false }
let tasks = loadFromLocalStorage();
let currentFilter = "all";   // "all", "active" or "completed"
let searchText = "";
let editingId = null;        // the id of the task being edited, if any
let draggedId = null;        // the id of the task being dragged, if any

// ---------- 2. FIND THE ELEMENTS ----------
const form = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const categorySelect = document.getElementById("category-select");
const dueDateInput = document.getElementById("due-date");
const searchInput = document.getElementById("search-input");
const filterButtons = document.querySelectorAll(".filter-btn");
const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");
const taskCount = document.getElementById("task-count");
const clearCompletedBtn = document.getElementById("clear-completed");

// ---------- 3. SAVE AND LOAD (localStorage) ----------
function saveToLocalStorage() {
  localStorage.setItem("tasks", JSON.stringify(tasks));   // turn the array into text
}

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];                // turn the text back into an array
  } catch (error) {
    return [];                                            // if something is broken, start empty
  }
}

// ---------- 4. CREATE: add a task ----------
form.addEventListener("submit", function (event) {
  event.preventDefault();                                 // stop the page from reloading

  const text = taskInput.value.trim();
  if (text === "") return;

  const newTask = {
    id: Date.now().toString() + Math.random().toString(16).slice(2),
    text: text,
    category: categorySelect.value,
    due: dueDateInput.value,                              // empty string if no date chosen
    completed: false
  };

  tasks.push(newTask);
  saveToLocalStorage();
  render();

  form.reset();                                           // clear the form
  taskInput.focus();
});

// ---------- 5. UPDATE: complete, edit ----------
function toggleTask(id) {
  const task = tasks.find(function (t) { return t.id === id; });
  task.completed = !task.completed;                       // true becomes false, false becomes true
  saveToLocalStorage();
  render();
}

function saveEdit(id, newText) {
  const text = newText.trim();
  if (text !== "") {
    const task = tasks.find(function (t) { return t.id === id; });
    task.text = text;
    saveToLocalStorage();
  }
  editingId = null;
  render();
}

// ---------- 6. DELETE ----------
function deleteTask(id) {
  tasks = tasks.filter(function (t) { return t.id !== id; });   // keep everything except this task
  saveToLocalStorage();
  render();
}

clearCompletedBtn.addEventListener("click", function () {
  tasks = tasks.filter(function (t) { return !t.completed; });
  saveToLocalStorage();
  render();
});

// ---------- 7. FILTERS AND SEARCH ----------
filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    currentFilter = button.dataset.filter;                // reads data-filter="..." from the HTML

    filterButtons.forEach(function (b) { b.classList.remove("active"); });
    button.classList.add("active");

    render();
  });
});

searchInput.addEventListener("input", function () {
  searchText = searchInput.value.toLowerCase();
  render();
});

function getVisibleTasks() {
  return tasks.filter(function (task) {
    // filter by status
    if (currentFilter === "active" && task.completed) return false;
    if (currentFilter === "completed" && !task.completed) return false;

    // filter by search text
    if (searchText !== "" && !task.text.toLowerCase().includes(searchText)) return false;

    return true;
  });
}

// ---------- 8. DRAG AND DROP (reorder) ----------
function moveTask(fromId, toId) {
  const fromIndex = tasks.findIndex(function (t) { return t.id === fromId; });
  const toIndex = tasks.findIndex(function (t) { return t.id === toId; });
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;

  const moved = tasks.splice(fromIndex, 1)[0];            // take the task out
  tasks.splice(toIndex, 0, moved);                        // put it in the new spot
  saveToLocalStorage();
  render();
}

// ---------- 9. SHOW THE TASKS ON THE PAGE ----------
function formatDate(dateString) {
  // "2026-12-01" becomes a readable date
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = "task-item" + (task.completed ? " completed" : "");

  // checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.addEventListener("change", function () { toggleTask(task.id); });

  // the middle part: text and details
  const info = document.createElement("div");
  info.className = "task-info";

  if (editingId === task.id) {
    // EDIT MODE: show a text box instead of the text
    const editBox = document.createElement("input");
    editBox.type = "text";
    editBox.className = "edit-input";
    editBox.value = task.text;
    editBox.addEventListener("keydown", function (event) {
      if (event.key === "Enter") saveEdit(task.id, editBox.value);
      if (event.key === "Escape") { editingId = null; render(); }
    });
    info.appendChild(editBox);
    setTimeout(function () { editBox.focus(); }, 0);
  } else {
    // NORMAL MODE: show the text
    const text = document.createElement("div");
    text.className = "task-text";
    text.textContent = task.text;                         // textContent is safe: it never runs HTML
    info.appendChild(text);
  }

  // category badge and due date
  const meta = document.createElement("div");
  meta.className = "task-meta";

  const badge = document.createElement("span");
  badge.className = "badge " + task.category;
  badge.textContent = task.category;
  meta.appendChild(badge);

  if (task.due) {
    const due = document.createElement("span");
    due.textContent = "Due " + formatDate(task.due);
    if (!task.completed && task.due < todayString()) {
      due.className = "overdue";
      due.textContent += " (overdue)";
    }
    meta.appendChild(due);
  }
  info.appendChild(meta);

  // edit and delete buttons
  const actions = document.createElement("div");
  actions.className = "task-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "edit-btn";
  editBtn.textContent = editingId === task.id ? "Save" : "Edit";
  editBtn.addEventListener("click", function () {
    if (editingId === task.id) {
      const box = info.querySelector(".edit-input");
      saveEdit(task.id, box.value);
    } else {
      editingId = task.id;
      render();
    }
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", function () { deleteTask(task.id); });

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  // drag and drop events
  li.draggable = editingId !== task.id;
  li.addEventListener("dragstart", function (event) {
    draggedId = task.id;
    li.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
  });
  li.addEventListener("dragend", function () {
    draggedId = null;
    li.classList.remove("dragging");
  });
  li.addEventListener("dragover", function (event) {
    event.preventDefault();                               // needed to allow dropping here
  });
  li.addEventListener("drop", function (event) {
    event.preventDefault();
    if (draggedId) moveTask(draggedId, task.id);
  });

  li.appendChild(checkbox);
  li.appendChild(info);
  li.appendChild(actions);
  return li;
}

function render() {
  taskList.innerHTML = "";                                // clear the list, then rebuild it

  const visibleTasks = getVisibleTasks();
  visibleTasks.forEach(function (task) {
    taskList.appendChild(createTaskElement(task));
  });

  // the "empty" message
  if (visibleTasks.length === 0) {
    emptyMessage.style.display = "block";
    emptyMessage.textContent = tasks.length === 0
      ? "No tasks yet. Add one above!"
      : "No tasks match this filter.";
  } else {
    emptyMessage.style.display = "none";
  }

  // the counter
  const activeCount = tasks.filter(function (t) { return !t.completed; }).length;
  taskCount.textContent = activeCount + (activeCount === 1 ? " task left" : " tasks left");
}

// ---------- 10. START ----------
render();