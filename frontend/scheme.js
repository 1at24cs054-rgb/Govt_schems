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

    // Load Scheme Details
    loadSchemeDetails();
});

async function loadSchemeDetails() {
    // 1. Get query parameter 'id'
    const urlParams = new URLSearchParams(window.location.search);
    const schemeId = urlParams.get("id");

    if (!schemeId) {
        renderErrorState("No scheme specified. Please navigate back to the dashboard.");
        return;
    }

    try {
        // 2. Fetch schemes.json
        const response = await fetch("schemes.json");
        if (!response.ok) throw new Error("Failed to load schemes database");
        
        const schemes = await response.json();
        
        // 3. Find matching scheme
        const scheme = schemes.find(s => s.scheme_name.toLowerCase() === schemeId.toLowerCase());
        
        if (!scheme) {
            renderErrorState(`Scheme "${schemeId}" not found in our database.`);
            return;
        }

        // 4. Inject metadata
        document.title = `${scheme.scheme_name} Details - Jeevandhara`;
        document.getElementById("scheme-title").textContent = scheme.title;
        document.getElementById("scheme-dept").textContent = scheme.scheme_details.department || "Ministry of Agriculture & Farmers Welfare";
        document.getElementById("scheme-tagline").textContent = scheme.scheme_details.tagline || "Government of India Initiative";
        document.getElementById("scheme-year").textContent = `Launch Year: ${scheme.scheme_details.launch_year || "-"}`;
        document.getElementById("scheme-implementor").textContent = `Implemented By: ${scheme.scheme_details.implemented_by || "-"}`;
        document.getElementById("scheme-web-link").href = scheme.website || "#";

        // 5. Inject Overview
        document.getElementById("scheme-overview").textContent = scheme.scheme_details.overview || "No overview available.";

        // 6. Inject Money Benefits Info
        const moneyContainer = document.getElementById("scheme-benefits-money");
        moneyContainer.innerHTML = "";
        
        const moneyBenefits = scheme.scheme_details.money_benefits;
        if (moneyBenefits && typeof moneyBenefits === "object" && Object.keys(moneyBenefits).length > 0) {
            let moneyHTML = `<div style="background-color: var(--primary-light); color: var(--primary); padding: 16px; border-radius: var(--radius-md); border-left: 4px solid var(--primary); margin-bottom: 15px;">`;
            moneyHTML += `<h4 style="margin-bottom: 6px; font-weight: 700;">💰 Financial Support Details</h4>`;
            moneyHTML += `<ul style="list-style: none; padding-left: 0;">`;
            for (const [key, value] of Object.entries(moneyBenefits)) {
                const cleanKey = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                moneyHTML += `<li style="margin-bottom: 4px; font-size: 14px;"><strong>${cleanKey}:</strong> ${value}</li>`;
            }
            moneyHTML += `</ul></div>`;
            moneyContainer.innerHTML = moneyHTML;
        }

        // 7. Inject Benefits List
        const benefitsList = document.getElementById("scheme-benefits-list");
        benefitsList.innerHTML = "";
        const benefits = scheme.scheme_details.benefits || [];
        benefits.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            benefitsList.appendChild(li);
        });

        // 8. Inject Eligibility Badges & List
        const badgesContainer = document.getElementById("scheme-eligibility-limits");
        badgesContainer.innerHTML = "";

        const details = scheme.scheme_details;
        
        // Age limit badge
        if (details.age_limit && typeof details.age_limit === "object") {
            const min = details.age_limit.minimum_age;
            const max = details.age_limit.maximum_age;
            let text = "Age: ";
            if (min && max) text += `${min} - ${max} Years`;
            else if (min) text += `Min ${min} Years`;
            else if (max) text += `Max ${max} Years`;
            else text += "All Ages";

            const badge = document.createElement("div");
            badge.style = "background: var(--bg-app); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 6px 12px; font-size: 13px; font-weight: 600;";
            badge.innerHTML = `⏳ ${text}`;
            badgesContainer.appendChild(badge);
        }

        // Land limit badge
        if (details.land_limit) {
            let text = "Land: ";
            if (typeof details.land_limit === "object") {
                text += details.land_limit.maximum_land_holding || "Restricted";
            } else {
                text += details.land_limit;
            }
            const badge = document.createElement("div");
            badge.style = "background: var(--bg-app); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 6px 12px; font-size: 13px; font-weight: 600;";
            badge.innerHTML = `🌾 ${text}`;
            badgesContainer.appendChild(badge);
        }

        // Income limit badge
        if (details.income_limit) {
            let text = "Income: ";
            if (typeof details.income_limit === "object") {
                text += details.income_limit.amount ? `Max ₹${details.income_limit.amount.toLocaleString()}` : "Restricted";
            } else {
                text += details.income_limit;
            }
            const badge = document.createElement("div");
            badge.style = "background: var(--bg-app); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 6px 12px; font-size: 13px; font-weight: 600;";
            badge.innerHTML = `₹ ${text}`;
            badgesContainer.appendChild(badge);
        }

        // Eligibility List
        const eligibilityList = document.getElementById("scheme-eligibility-list");
        eligibilityList.innerHTML = "";
        const eligibility = details.eligibility || [];
        eligibility.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            eligibilityList.appendChild(li);
        });

        // 9. Inject Documents List
        const docsList = document.getElementById("scheme-documents-list");
        docsList.innerHTML = "";
        const docs = details.documents_required || [];
        
        if (docs.length === 0) {
            docsList.innerHTML = `<li style="grid-column: 1/-1; color: var(--text-sub);">No documents checklist specified. Contact nearest bank or KVK.</li>`;
        } else {
            docs.forEach(item => {
                const li = document.createElement("li");
                li.textContent = item;
                docsList.appendChild(li);
            });
        }

        // 10. Inject Process steps
        const processList = document.getElementById("scheme-process-list");
        processList.innerHTML = "";
        const processSteps = details.application_process || [];
        processSteps.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            processList.appendChild(li);
        });

        // 11. Inject Dates
        document.getElementById("scheme-dates").textContent = details.important_dates || "Ongoing registration. No immediate deadlines announced.";

        // 12. Inject FAQs (with accordions)
        const faqContainer = document.getElementById("scheme-faq-container");
        faqContainer.innerHTML = "";
        
        const faqs = details.faqs || [
            {
                "question": "Where can I apply for this scheme?",
                "answer": `You can apply online by visiting the official website at ${scheme.website || 'the government portal'} or contacting your local district agricultural office.`
            },
            {
                "question": "Which government department implements this program?",
                "answer": `${details.implemented_by || 'The central government'} manages and coordinates this scheme across participating states.`
            }
        ];

        faqs.forEach((item, index) => {
            const faqItem = document.createElement("div");
            faqItem.className = "faq-item";
            faqItem.innerHTML = `
                <button class="faq-question-btn" onclick="toggleFaq(${index})">
                    <span>${escapeHTML(item.question)}</span>
                    <span class="faq-chevron">▼</span>
                </button>
                <div class="faq-answer-panel" id="faq-answer-${index}">
                    <p>${escapeHTML(item.answer)}</p>
                </div>
            `;
            faqContainer.appendChild(faqItem);
        });

    } catch (error) {
        console.error("Error loading scheme details:", error);
        renderErrorState("An error occurred while loading the scheme details. Ensure local json database is correct.");
    }
}

function toggleFaq(index) {
    const faqItems = document.querySelectorAll(".faq-item");
    const targetItem = faqItems[index];
    
    // Toggle active class
    const isActive = targetItem.classList.contains("active");
    
    // Close all FAQs first
    faqItems.forEach(item => item.classList.remove("active"));
    
    if (!isActive) {
        targetItem.classList.add("active");
    }
}

function renderErrorState(message) {
    document.title = "Scheme Error - Jeevandhara";
    document.getElementById("scheme-title").textContent = "Error Loading Scheme";
    document.getElementById("scheme-tagline").textContent = "";
    document.getElementById("scheme-dept").textContent = "Jeevandhara Portal";
    
    const container = document.querySelector(".scheme-detail-container");
    container.innerHTML = `
        <div style="background-color: var(--bg-card); border: 1px solid var(--border); padding: 40px; text-align: center; border-radius: var(--radius-lg); margin-top: 30px;">
            <span style="font-size: 48px; display: block; margin-bottom: 20px;">⚠️</span>
            <h3 style="margin-bottom: 12px; color: var(--danger); font-size: 20px;">Unable to Display Details</h3>
            <p style="color: var(--text-sub); margin-bottom: 30px;">${message}</p>
            <a href="dashboard.html" class="btn btn-primary">
                Return to Dashboard
            </a>
        </div>
    `;
}

function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
