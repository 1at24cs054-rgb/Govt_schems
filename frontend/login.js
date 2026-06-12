document.addEventListener("DOMContentLoaded", () => {
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

// Helper function to show toasts
function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "error") icon = "❌";
    
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = "fadeSlideUp 0.3s reverse forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const msgElement = document.getElementById("msg");
    const submitBtn = document.getElementById("submit-btn");

    msgElement.innerHTML = "";

    if (!username || !password) {
        showToast("Please enter both username and password.", "error");
        return;
    }

    // Set loading state on button
    submitBtn.disabled = true;
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span class="spinner"></span> <span>Signing in...</span>`;

    try {
        const response = await fetch("http://127.0.0.1:8000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const result = await response.json();

        if (result.status === "success") {
            showToast(`Welcome back, ${result.name}!`, "success");
            
            // Store user details in localStorage
            localStorage.setItem("user_id", result.user_id);
            localStorage.setItem("user_name", result.name);

            // Redirect to Dashboard
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1200);
        } else {
            showToast(result.message || "Invalid username or password.", "error");
            msgElement.innerHTML = result.message || "Invalid Credentials. Please try again.";
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
        }
    } catch (error) {
        console.error("Login error:", error);
        showToast("Cannot connect to server. Ensure backend is running.", "error");
        msgElement.innerHTML = "Server connection error. Please make sure the API is online.";
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
    }
}