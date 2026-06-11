function logout() {
    localStorage.removeItem("user_id");
    window.location.href = "login.html";
}

loadDashboard();

async function loadDashboard() {

    const user_id = localStorage.getItem("user_id");

    if (!user_id) {
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }

    try {

        const response = await fetch(
            `http://127.0.0.1:8000/dashboard/${user_id}`
        );

        const data = await response.json();

        console.log(data);

        // Profile + Stats

        document.getElementById("stats").innerHTML = `
            <div class="stats-grid">

                <div class="stat-card">
                    <h3>${data.profile.name}</h3>
                    <p>Name</p>
                </div>

                <div class="stat-card">
                    <h3>${data.profile.age}</h3>
                    <p>Age</p>
                </div>

                <div class="stat-card">
                    <h3>Rupes.${data.profile.income}</h3>
                    <p>Income</p>
                </div>

                <div class="stat-card">
                    <h3>${data.profile.land_size}</h3>
                    <p>Acres</p>
                </div>

            </div>
        `;

        // Schemes

        let schemesHTML = "";

        data.recommendations.eligible_schemes.forEach(
            (scheme) => {

                schemesHTML += `
                    <div class="scheme-card">

                        <h3>
                            ${scheme.scheme_name}
                        </h3>

                        <p>
                            ${scheme.title}
                        </p>

                    </div>
                `;
            }
        );

        document.getElementById("schemes").innerHTML =
            schemesHTML;

    }
    catch(error) {

        console.error(error);

        document.getElementById("schemes").innerHTML =
            "<p>Failed to load dashboard.</p>";
    }
}

async function askAI() {

    const user_id =
        localStorage.getItem("user_id");

    const question =
        document.getElementById("question").value;

    if (!question) {
        alert("Enter a question");
        return;
    }

    document.getElementById("answer").innerHTML =
        "<div class='answer-card'>Loading...</div>";

    const response = await fetch(
        `http://127.0.0.1:8000/ask/${user_id}`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
                question: question
            })
        }
    );

    const result =
        await response.json();

    document.getElementById("answer").innerHTML = `
        <div class="answer-card">

            <h3>AI Response</h3>

            <p>
                ${result.answer}
            </p>

        </div>
    `;
}