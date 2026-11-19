# Task 2: Dynamic Task Manager and Productivity Tracker

A task management app built with HTML, CSS and vanilla JavaScript. It supports full CRUD (Create, Read, Update, Delete), and tasks are saved in the browser's `localStorage`, so they are still there after a page reload. It needs no server.

**Live demo:** https://tvisha-cmd.github.io/Datheon_Full_Stack_Web_Development_Internship/Task%20-%202/

## Features
- Add tasks with a category (Work, Personal, Study) and an optional due date
- Edit a task's text in place (Enter to save, Escape to cancel)
- Delete tasks, or clear all completed tasks at once
- Mark tasks as complete, with a strike-through and fade animation
- Filter by status: All, Active, Completed
- Search tasks by text
- Drag and drop to reorder tasks
- Overdue tasks are highlighted in red
- Live counter of tasks left
- Data is saved automatically in `localStorage`
- Responsive layout for phones and computers

## How it works
- The `tasks` array in `script.js` holds all the data.
- Every action (add, edit, delete, complete, reorder) updates the array, saves it with `saveToLocalStorage()`, and redraws the list with `render()`.
- On page load, `loadFromLocalStorage()` reads the saved tasks back in.

## Project structure
- `index.html`: page structure (form, filters, task list)
- `style.css`: layout, colors, animations and responsive design
- `script.js`: task logic, filtering, search, drag and drop, and localStorage

## Run locally
Download the files and open `index.html` in your browser. No installation or build step is needed.

## Built with
HTML5, CSS3 (Flexbox, transitions, keyframe animations), JavaScript (ES6+, DOM manipulation, localStorage API)
