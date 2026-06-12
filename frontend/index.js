// Check if user is already logged in
document.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
        window.location.href = "dashboard.html";
        return;
    }
    
    // Theme switching logic
    const themeBtn = document.getElementById("theme-btn");
    const currentTheme = localStorage.getItem("theme") || "light";
    
    if (currentTheme === "dark") {
        document.body.classList.add("dark-mode");
        themeBtn.textContent = "☀️";
    } else {
        document.body.classList.remove("dark-mode");
        themeBtn.textContent = "🌙";
    }
    
    themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
        localStorage.setItem("theme", theme);
        themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
    });
});
