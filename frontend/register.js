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
    
    // Automatically remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = "fadeSlideUp 0.3s reverse forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

async function register() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const name = document.getElementById("name").value.trim();
    const age = parseInt(document.getElementById("age").value);
    const income = parseFloat(document.getElementById("income").value);
    const landSize = parseFloat(document.getElementById("land_size").value);
    const state = document.getElementById("state").value.trim();
    const district = document.getElementById("district").value.trim();
    const msgElement = document.getElementById("msg");
    const submitBtn = document.getElementById("submit-btn");

    msgElement.innerHTML = "";

    // Front-end validations
    if (!username || !password || !name || isNaN(age) || isNaN(income) || isNaN(landSize) || !state || !district) {
        showToast("Please fill all details correctly.", "error");
        return;
    }

    if (age <= 0 || age > 120) {
        showToast("Please enter a valid age.", "error");
        return;
    }

    if (income < 0) {
        showToast("Income cannot be negative.", "error");
        return;
    }

    if (landSize < 0) {
        showToast("Land size cannot be negative.", "error");
        return;
    }

    // Set loading state on button
    submitBtn.disabled = true;
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span class="spinner"></span> <span>Registering...</span>`;

    try {
        const response = await fetch("http://127.0.0.1:8000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password,
                name: name,
                age: age,
                income: income,
                land_size: landSize,
                state: state,
                district: district
            })
        });

        const result = await response.json();

        if (result.status === "success") {
            showToast("Registration successful!", "success");
            
            // Trigger checkmark animation and hide form panel
            document.getElementById("register-form-panel").style.display = "none";
            const successOverlay = document.getElementById("success-overlay");
            successOverlay.style.display = "block";
            
            // Perform CSS checkmark path animation trigger
            const path = successOverlay.querySelector("path");
            if (path) {
                path.style.animation = "dash 0.8s ease-in-out forwards";
            }

            // Redirect to Login Page
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1800);
        } else {
            showToast(result.message || "Registration failed. Username might already exist.", "error");
            msgElement.innerHTML = result.message || "Registration failed. Try a different username.";
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
        }
    } catch (error) {
        console.error("Registration error:", error);
        showToast("Cannot connect to server. Ensure backend is running.", "error");
        msgElement.innerHTML = "Server connection error. Please make sure the API is online.";
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
    }
}