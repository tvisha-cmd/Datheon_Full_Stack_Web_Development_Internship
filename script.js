const root = document.documentElement;
const themebtn = document.getElementById("theme-btn");

function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    themebtn.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
    localStorage.setItem("theme", theme);
}

const savedTheme = localStorage.getItem("theme");
const computerPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
setTheme(savedTheme || (computerPrefersDark ? "dark" : "light"));

themebtn.addEventListener("click", () => {
    const currentTheme = root.getAttribute("data-theme");
    setTheme(currentTheme === "dark" ? "light" : "dark");
});

const menuBtn = document.getElementById("menu-btn");
const nav = document.getElementById("nav");
menuBtn.addEventListener("click", function() {
    nav.classList.toggle("open");
});

nav.querySelectorAll("a").forEach(function(link) {
    link.addEventListener("click", function() {
        nav.classList.remove("open");
    });
});

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");
const modalTech = document.getElementById("modal-tech");
const modalLink = document.getElementById("modal-link");

function openModal(article) {
    const paragraphs = article.querySelectorAll("p");
    modalTitle.textContent = article.querySelector("h2").textContent;
    modalDesc.textContent = paragraphs[0].textContent;
    modalTech.textContent = paragraphs[1].textContent;
    modalLink.href = article.querySelector("a").href;
    modal.classList.add("open");
}

function closeModal() {
    modal.classList.remove("open");
}

document.querySelectorAll(".article").forEach(function(article) {
    article.addEventListener("click", function(event) {
        if (event.target.closest("a")) return;
        openModal(article);
    });
});

document.getElementById("modal-close").addEventListener("click", closeModal);
modal.addEventListener("click", function(event) {
    if (event.target === modal) {
        closeModal();
    }
});
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeModal();
    }});