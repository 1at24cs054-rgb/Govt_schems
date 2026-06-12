let allSchemesData = [];
const userId = localStorage.getItem("user_id");

document.addEventListener("DOMContentLoaded", () => {
    // Session Check
    if (!userId) {
        alert("Please login first to access the dashboard.");
        window.location.href = "login.html";
        return;
    }

    // Set Avatar Character
    const userName = localStorage.getItem("user_name") || "Farmer";
    document.getElementById("header-avatar").textContent = userName.charAt(0).toUpperCase();
    document.getElementById("header-user-name").textContent = userName;

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

    // Load All Data
    loadDashboardData();
    loadAllSchemesDatabase();
    loadChatHistory();
    initializeChatbot();
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

// Map Emojis to Schemes
function getSchemeIcon(name) {
    const icons = {
        "PM-KISAN": "💰",
        "KCC": "💳",
        "PM_KMY": "🛡️",
        "PMFBY": "🌾",
        "PMJDY": "🏦",
        "NMSA": "🌱",
        "AIF": "🏗️",
        "APY": "👵",
        "BHU_AADHAAR_ULPIN": "📍",
        "DILRMP": "🖥️",
        "ICAR": "🔬",
        "LAND_REFORMS": "🗺️",
        "NEERANCHAL": "💧",
        "PGS_India_NCOF": "🥬",
        "SNAM": "🚜",
        "WDC_PMKSY": "⛲",
        "eNAM": "🏪"
    };
    return icons[name] || "🌾";
}

// Calculate completion score
function calculateProfileScore(profile) {
    let fields = ["name", "age", "income", "land_size", "state", "district"];
    let filled = 0;
    fields.forEach(field => {
        if (profile[field] !== undefined && profile[field] !== null && profile[field] !== "" && profile[field] !== 0) {
            filled++;
        }
    });
    return Math.round((filled / fields.length) * 100);
}

async function loadDashboardData() {
    try {
        const response = await fetch(`http://127.0.0.1:8000/dashboard/${userId}`);
        if (!response.ok) throw new Error("Dashboard API error");
        
        const data = await response.json();
        
        // Render Profile
        const profile = data.profile;
        document.getElementById("farmer-title-name").textContent = profile.name || "Farmer";
        document.getElementById("farmer-name").textContent = profile.name || "-";
        document.getElementById("farmer-age").textContent = profile.age || "-";
        document.getElementById("farmer-income").textContent = profile.income ? `₹${profile.income.toLocaleString()}` : "-";
        document.getElementById("farmer-land").textContent = profile.land_size ? `${profile.land_size} Acres` : "-";
        document.getElementById("farmer-state").textContent = profile.state || "-";
        document.getElementById("farmer-district").textContent = profile.district || "-";

        // Render Stats
        const recommendations = data.recommendations;
        const totalEligible = recommendations.total_eligible || 0;
        document.getElementById("stat-eligible-count").textContent = totalEligible;
        
        // Calculate benefits listed count
        let totalBenefits = 0;
        recommendations.eligible_schemes.forEach(scheme => {
            if (scheme.benefits) totalBenefits += scheme.benefits.length;
        });
        document.getElementById("stat-benefits-count").textContent = totalBenefits || totalEligible * 3; // fallback estimate
        
        const score = calculateProfileScore(profile);
        document.getElementById("stat-profile-score").textContent = `${score}%`;

        // Render Recommendations Cards
        const recContainer = document.getElementById("recommended-schemes-container");
        recContainer.innerHTML = "";
        
        if (recommendations.eligible_schemes.length === 0) {
            recContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-sub);">
                    <p style="font-size: 16px; font-weight: 500;">No recommended schemes found.</p>
                    <p style="font-size: 13px; margin-top: 5px;">Try updating your profile details to expand matching rules.</p>
                </div>
            `;
            return;
        }

        recommendations.eligible_schemes.forEach(scheme => {
            const card = document.createElement("div");
            card.className = "scheme-item-card";
            card.innerHTML = `
                <div>
                    <span class="scheme-badge">Match</span>
                    <div class="scheme-card-icon">${getSchemeIcon(scheme.scheme_name)}</div>
                    <div class="scheme-card-info">
                        <h3>${scheme.scheme_name}</h3>
                        <p>${scheme.title}</p>
                    </div>
                </div>
                <div class="scheme-card-footer">
                    <a href="scheme.html?id=${scheme.scheme_name}" class="btn btn-secondary" style="padding: 8px 16px; font-size: 13px; width: 100%;">
                        View Details
                    </a>
                </div>
            `;
            recContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Dashboard load error:", error);
        showToast("Failed to load matching schemes. Ensure backend is running.", "error");
        document.getElementById("recommended-schemes-container").innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--danger);">
                <p>Failed to load recommended schemes. Check your API server.</p>
            </div>
        `;
    }
}

async function loadAllSchemesDatabase() {
    try {
        const response = await fetch("schemes.json");
        if (!response.ok) throw new Error("Could not load schemes database");
        
        allSchemesData = await response.json();
        renderAllSchemesList(allSchemesData);
    } catch (error) {
        console.error("Failed to load schemes list:", error);
        document.getElementById("all-schemes-container").innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--danger);">
                <p>Failed to load the full schemes database.</p>
            </div>
        `;
    }
}

function renderAllSchemesList(schemes) {
    const allContainer = document.getElementById("all-schemes-container");
    allContainer.innerHTML = "";
    
    if (schemes.length === 0) {
        allContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-sub);">
                <p>No schemes matches your search term.</p>
            </div>
        `;
        return;
    }

    schemes.forEach(scheme => {
        const card = document.createElement("div");
        card.className = "scheme-item-card";
        card.innerHTML = `
            <div>
                <div class="scheme-card-icon">${getSchemeIcon(scheme.scheme_name)}</div>
                <div class="scheme-card-info">
                    <h3>${scheme.scheme_name}</h3>
                    <p>${scheme.title}</p>
                </div>
            </div>
            <div class="scheme-card-footer">
                <a href="scheme.html?id=${scheme.scheme_name}" class="btn btn-secondary" style="padding: 8px 16px; font-size: 13px; width: 100%;">
                    View Details
                </a>
            </div>
        `;
        allContainer.appendChild(card);
    });
}

function filterAllSchemes() {
    const query = document.getElementById("search-schemes-input").value.toLowerCase().trim();
    if (!query) {
        renderAllSchemesList(allSchemesData);
        return;
    }
    
    const filtered = allSchemesData.filter(scheme => {
        return scheme.scheme_name.toLowerCase().includes(query) || 
               scheme.title.toLowerCase().includes(query) ||
               (scheme.scheme_details && scheme.scheme_details.tagline && scheme.scheme_details.tagline.toLowerCase().includes(query)) ||
               (scheme.scheme_details && scheme.scheme_details.overview && scheme.scheme_details.overview.toLowerCase().includes(query));
    });
    
    renderAllSchemesList(filtered);
}

let chatMessages = [];

function getFormattedTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function initializeChatbot() {
    const savedHistory = sessionStorage.getItem("jeevandhara_chat_history");
    if (savedHistory) {
        chatMessages = JSON.parse(savedHistory);
    } else {
        chatMessages = [
            { sender: "bot", text: "👋 Namaste Farmer", timestamp: getFormattedTime() },
            { sender: "bot", text: "How can I help you regarding government schemes, eligibility, benefits, documents, loans and subsidies?", timestamp: getFormattedTime() }
        ];
        sessionStorage.setItem("jeevandhara_chat_history", JSON.stringify(chatMessages));
    }
    renderChatMessages();
    
    // Auto-focus input if open
    const windowEl = document.getElementById("chatbot-window");
    if (windowEl && windowEl.style.display !== "none") {
        const input = document.getElementById("chatbot-input-field");
        if (input) input.focus();
    }
}

function renderChatMessages() {
    const container = document.getElementById("chatbot-messages");
    if (!container) return;
    container.innerHTML = "";
    
    chatMessages.forEach((msg, idx) => {
        const bubble = document.createElement("div");
        bubble.className = `message-bubble ${msg.sender}`;
        
        const textSpan = document.createElement("div");
        textSpan.className = "message-text";
        textSpan.textContent = msg.text;
        bubble.appendChild(textSpan);
        
        const timeSpan = document.createElement("span");
        timeSpan.className = "message-timestamp";
        timeSpan.textContent = msg.timestamp;
        bubble.appendChild(timeSpan);
        
        container.appendChild(bubble);
        
        // Render follow-up chips if it's the last message, and it's from the bot
        if (msg.sender === "bot" && msg.chips && msg.chips.length > 0 && idx === chatMessages.length - 1) {
            const chipsWrapper = document.createElement("div");
            chipsWrapper.className = "chips-wrapper";
            
            msg.chips.forEach(chipText => {
                const chip = document.createElement("button");
                chip.className = "chat-chip";
                chip.textContent = chipText;
                chip.onclick = () => sendChipQuestion(chipText);
                chipsWrapper.appendChild(chip);
            });
            container.appendChild(chipsWrapper);
        }
    });
    
    scrollToBottom();
}

function getFollowUpChips(question, answer) {
    const query = question.toLowerCase();
    const chips = [];
    
    // Based on query keywords or answer content, recommend follow ups
    if (query.includes("eligible") || query.includes("eligibility") || query.includes("who can")) {
        chips.push("Required documents?");
        chips.push("How to apply?");
        chips.push("What are the benefits?");
    } else if (query.includes("document") || query.includes("paper") || query.includes("id proof")) {
        chips.push("Who is eligible?");
        chips.push("How to apply?");
        chips.push("What are the benefits?");
    } else if (query.includes("apply") || query.includes("how to apply") || query.includes("process")) {
        chips.push("Who is eligible?");
        chips.push("Required documents?");
        chips.push("What are the benefits?");
    } else if (query.includes("benefit") || query.includes("amount") || query.includes("subsidy") || query.includes("loan")) {
        chips.push("Who is eligible?");
        chips.push("Required documents?");
        chips.push("How to apply?");
    } else {
        // Defaults
        chips.push("Who is eligible?");
        chips.push("Required documents?");
        chips.push("How to apply?");
    }
    
    return chips.slice(0, 3);
}

async function sendChipQuestion(questionText) {
    // Remove chips from the last message to avoid clicking them multiple times
    if (chatMessages.length > 0) {
        const lastMsg = chatMessages[chatMessages.length - 1];
        if (lastMsg.sender === "bot") {
            delete lastMsg.chips;
        }
    }
    await processAndSendChatMessage(questionText);
}

async function processAndSendChatMessage(questionText) {
    const timestamp = getFormattedTime();
    chatMessages.push({ sender: "user", text: questionText, timestamp });
    sessionStorage.setItem("jeevandhara_chat_history", JSON.stringify(chatMessages));
    renderChatMessages();
    
    // Add bot typing indicator
    const typingIndicator = appendTypingIndicator();
    scrollToBottom();
    
    try {
        const response = await fetch(`http://127.0.0.1:8000/ask/${userId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question: questionText
            })
        });

        if (!response.ok) throw new Error("API call failed");
        const result = await response.json();
        
        // Remove typing indicator
        typingIndicator.remove();
        
        const answer = result.answer || "Sorry, I could not understand the question.";
        const botTimestamp = getFormattedTime();
        const chips = getFollowUpChips(questionText, answer);
        
        chatMessages.push({
            sender: "bot",
            text: answer,
            timestamp: botTimestamp,
            chips: chips
        });
        sessionStorage.setItem("jeevandhara_chat_history", JSON.stringify(chatMessages));
        renderChatMessages();

        // Refresh stats
        loadChatHistory();

    } catch (error) {
        console.error("Chat error:", error);
        typingIndicator.remove();
        
        chatMessages.push({
            sender: "bot",
            text: "Connection error. Ensure the server is online to receive responses.",
            timestamp: getFormattedTime()
        });
        sessionStorage.setItem("jeevandhara_chat_history", JSON.stringify(chatMessages));
        renderChatMessages();
    }
}

async function loadChatHistory() {
    try {
        const response = await fetch(`http://127.0.0.1:8000/chat-history/${userId}`);
        if (!response.ok) throw new Error("Chat history API error");
        
        const history = await response.json();
        
        // Update Queries Count
        const countEl = document.getElementById("stat-queries-count");
        if (countEl) countEl.textContent = history.length;

    } catch (error) {
        console.error("Failed to load chat history:", error);
    }
}

function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function toggleChatWindow(isOpen) {
    const collapsed = document.getElementById("chatbot-collapsed");
    const windowEl = document.getElementById("chatbot-window");
    const input = document.getElementById("chatbot-input-field");
    
    if (isOpen) {
        collapsed.style.display = "none";
        windowEl.style.display = "flex";
        windowEl.style.animation = "zoomIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards";
        renderChatMessages();
        scrollToBottom();
        
        // Focus the input field
        setTimeout(() => {
            if (input) input.focus();
        }, 100);
    } else {
        windowEl.style.animation = "zoomOut 0.2s ease forwards";
        setTimeout(() => {
            windowEl.style.display = "none";
            collapsed.style.display = "flex";
        }, 200);
    }
}

function scrollToBottom() {
    const messages = document.getElementById("chatbot-messages");
    if (messages) messages.scrollTop = messages.scrollHeight;
}

async function sendChatMessage() {
    const input = document.getElementById("chatbot-input-field");
    if (!input) return;
    const questionText = input.value.trim();
    if (!questionText) return;

    input.value = "";
    await processAndSendChatMessage(questionText);
    
    // Maintain focus on the input field
    setTimeout(() => {
        input.focus();
    }, 50);
}

function appendTypingIndicator() {
    const container = document.getElementById("chatbot-messages");
    const indicator = document.createElement("div");
    indicator.className = "message-bubble bot typing-indicator-bubble";
    indicator.innerHTML = `
        <span class="typing-text">AI is typing</span>
        <div class="typing-indicator">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `;
    container.appendChild(indicator);
    return indicator;
}

function logout() {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    showToast("Logged out successfully.", "info");
    setTimeout(() => {
        window.location.href = "index.html";
    }, 800);
}