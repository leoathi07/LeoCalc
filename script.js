"use strict";

/* =========================================================
   LEOCALC COMPLETE JAVASCRIPT
========================================================= */


/* =========================================================
   STATE
========================================================= */

let currentExpression = "";
let lastAnswer = 0;

let history =
    JSON.parse(localStorage.getItem("leoCalcHistory") || "[]");

let favorites =
    JSON.parse(localStorage.getItem("leoCalcFavorites") || "[]");

let notes =
    JSON.parse(localStorage.getItem("leoCalcNotes") || "[]");

let haptic =
    localStorage.getItem("leoCalcHaptic") !== "false";


/* =========================================================
   ELEMENTS
========================================================= */

const splash = document.getElementById("splashScreen");
const app = document.getElementById("app");
const loadingProgress =
    document.getElementById("loadingProgress");

const displayValue =
    document.getElementById("displayValue");

const expression =
    document.getElementById("expression");

const answer =
    document.getElementById("answer");

const toolModal =
    document.getElementById("toolModal");

const modalTitle =
    document.getElementById("modalTitle");

const modalIcon =
    document.getElementById("modalIcon");

const modalContent =
    document.getElementById("modalContent");

const toast =
    document.getElementById("toast");


/* =========================================================
   SPLASH
========================================================= */

let progress = 0;

const loadingTimer = setInterval(() => {

    progress += Math.random() * 8 + 4;

    if (progress >= 100) {
        progress = 100;
        clearInterval(loadingTimer);

        setTimeout(() => {

            splash.classList.add("hidden");
            app.classList.remove("hidden");

        }, 500);
    }

    loadingProgress.style.width = progress + "%";

}, 130);


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 1800);
}


/* =========================================================
   HAPTIC
========================================================= */

function vibrate() {

    if (
        haptic &&
        navigator.vibrate
    ) {
        navigator.vibrate(12);
    }
}


/* =========================================================
   NAVIGATION
========================================================= */

function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {
            page.classList.remove("active");
        });

    const page =
        document.getElementById(pageId);

    if (page) {
        page.classList.add("active");
    }

    document
        .querySelectorAll(".nav-button")
        .forEach(btn => {

            btn.classList.toggle(
                "active",
                btn.dataset.page === pageId
            );

        });

    closeSideMenu();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


document
    .querySelectorAll(".nav-button[data-page]")
    .forEach(button => {

        button.addEventListener("click", () => {

            vibrate();

            showPage(button.dataset.page);

        });

    });


document
    .querySelectorAll(".side-items button[data-page]")
    .forEach(button => {

        button.addEventListener("click", () => {

            showPage(button.dataset.page);

        });

    });


document
    .getElementById("openCalculator")
    .addEventListener("click", () => {

        vibrate();
        showPage("calculatorPage");

    });


/* =========================================================
   SIDE MENU
========================================================= */

const sideMenu =
    document.getElementById("sideMenu");

const menuOverlay =
    document.getElementById("menuOverlay");

function openSideMenu() {

    sideMenu.classList.add("active");
    menuOverlay.classList.add("active");

}

function closeSideMenu() {

    sideMenu.classList.remove("active");
    menuOverlay.classList.remove("active");

}

document
    .getElementById("menuBtn")
    .addEventListener("click", openSideMenu);

document
    .getElementById("closeMenu")
    .addEventListener("click", closeSideMenu);

menuOverlay.addEventListener(
    "click",
    closeSideMenu
);


/* =========================================================
   THEME
========================================================= */

function updateThemeButton() {

    const light =
        document.body.classList.contains("light");

    document
        .getElementById("darkToggle")
        .classList.toggle("active", !light);

}


document
    .getElementById("themeBtn")
    .addEventListener("click", () => {

        document.body.classList.toggle("light");

        localStorage.setItem(
            "leoCalcTheme",
            document.body.classList.contains("light")
                ? "light"
                : "dark"
        );

        updateThemeButton();

    });


document
    .getElementById("darkToggle")
    .addEventListener("click", () => {

        document.body.classList.toggle("light");

        localStorage.setItem(
            "leoCalcTheme",
            document.body.classList.contains("light")
                ? "light"
                : "dark"
        );

        updateThemeButton();

    });


if (
    localStorage.getItem("leoCalcTheme") === "light"
) {
    document.body.classList.add("light");
}

updateThemeButton();


/* =========================================================
   HAPTIC TOGGLE
========================================================= */

const hapticToggle =
    document.getElementById("hapticToggle");

hapticToggle.classList.toggle(
    "active",
    haptic
);

hapticToggle.addEventListener("click", () => {

    haptic = !haptic;

    hapticToggle.classList.toggle(
        "active",
        haptic
    );

    localStorage.setItem(
        "leoCalcHaptic",
        haptic
    );

});


/* =========================================================
   CALCULATOR TABS
========================================================= */

document
    .querySelectorAll(".calc-tab")
    .forEach(tab => {

        tab.addEventListener("click", () => {

            document
                .querySelectorAll(".calc-tab")
                .forEach(t =>
                    t.classList.remove("active")
                );

            tab.classList.add("active");

            document
                .querySelectorAll(".calc-panel")
                .forEach(panel =>
                    panel.classList.add("hidden")
                );

            const target =
                tab.dataset.tab;

            document
                .getElementById(
                    target === "scientific"
                        ? "scientificPanel"
                        : target === "engineering"
                            ? "engineeringPanel"
                            : "utilitiesPanel"
                )
                .classList.remove("hidden");

        });

    });


/* =========================================================
   CALCULATOR
========================================================= */

function updateDisplay() {

    expression.textContent =
        currentExpression || "0";

    displayValue.textContent =
        currentExpression || "0";

}


function appendValue(value) {

    currentExpression += value;

    updateDisplay();

    vibrate();

}


function clearCalculator() {

    currentExpression = "";

    updateDisplay();

}


function deleteLast() {

    currentExpression =
        currentExpression.slice(0, -1);

    updateDisplay();

}


function calculate() {

    if (!currentExpression) return;

    try {

        let expr =
            currentExpression
                .replace(/×/g, "*")
                .replace(/÷/g, "/")
                .replace(/−/g, "-");

        if (!/^[0-9+\-*/().%\s]+$/.test(expr)) {
            throw new Error("Invalid");
        }

        let result =
            Function(
                '"use strict"; return (' +
                expr +
                ')'
            )();

        if (
            typeof result !== "number" ||
            !Number.isFinite(result)
        ) {
            throw new Error("Invalid");
        }

        result =
            Math.round(result * 1e12) / 1e12;

        addHistory(
            currentExpression,
            result
        );

        lastAnswer = result;

        answer.textContent = result;

        currentExpression =
            String(result);

        updateDisplay();

        vibrate();

    } catch {

        showToast("Invalid calculation");

    }

}


document
    .querySelectorAll("#calculatorKeys button")
    .forEach(button => {

        button.addEventListener("click", () => {

            const key =
                button.dataset.key;

            if (key === "AC") {
                clearCalculator();
                return;
            }

            if (key === "DEL") {
                deleteLast();
                return;
            }

            if (key === "=") {
                calculate();
                return;
            }

            appendValue(key);

        });

    });


/* =========================================================
   SCIENTIFIC FUNCTIONS
========================================================= */

document
    .querySelectorAll(
        ".scientific-buttons button"
    )
    .forEach(button => {

        button.addEventListener("click", () => {

            const action =
                button.dataset.action;

            scientificAction(action);

        });

    });


function scientificAction(action) {

    let value =
        parseFloat(currentExpression);

    if (
        action !== "pi" &&
        action !== "e" &&
        action !== "percent" &&
        action !== "factorial" &&
        Number.isNaN(value)
    ) {
        showToast("Enter a number first");
        return;
    }


    switch (action) {

        case "sin":
            value =
                Math.sin(
                    value * Math.PI / 180
                );
            break;

        case "cos":
            value =
                Math.cos(
                    value * Math.PI / 180
                );
            break;

        case "tan":
            value =
                Math.tan(
                    value * Math.PI / 180
                );
            break;

        case "log":
            value = Math.log10(value);
            break;

        case "ln":
            value = Math.log(value);
            break;

        case "sqrt":
            value = Math.sqrt(value);
            break;

        case "square":
            value = value * value;
            break;

        case "cube":
            value = value * value * value;
            break;

        case "pi":
            value = Math.PI;
            break;

        case "e":
            value = Math.E;
            break;

        case "percent":
            value = value / 100;
            break;

        case "factorial":

            if (
                value < 0 ||
                !Number.isInteger(value) ||
                value > 170
            ) {
                showToast(
                    "Enter a valid whole number"
                );
                return;
            }

            let fact = 1;

            for (
                let i = 2;
                i <= value;
                i++
            ) {
                fact *= i;
            }

            value = fact;

            break;
    }


    if (!Number.isFinite(value)) {
        showToast("Invalid result");
        return;
    }

    value =
        Math.round(value * 1e12) / 1e12;

    addHistory(
        action + "(" + currentExpression + ")",
        value
    );

    currentExpression =
        String(value);

    lastAnswer = value;

    answer.textContent = value;

    updateDisplay();

}


/* =========================================================
   HISTORY
========================================================= */

function addHistory(
    expressionText,
    result
) {

    history.unshift({
        expression: expressionText,
        result: result,
        time: new Date().toLocaleString()
    });

    history =
        history.slice(0, 100);

    localStorage.setItem(
        "leoCalcHistory",
        JSON.stringify(history)
    );

    renderHistory();

}


function renderHistory() {

    const container =
        document.getElementById("historyList");

    if (!history.length) {

        container.innerHTML =
            '<p style="color:#77778e;padding:20px 0;">No history yet.</p>';

        return;
    }


    container.innerHTML =
        history.map(item => `

            <div class="history-item">

                <strong>
                    ${escapeHtml(item.expression)}
                    = ${escapeHtml(String(item.result))}
                </strong>

                <small>
                    ${escapeHtml(item.time)}
                </small>

            </div>

        `).join("");

}


renderHistory();


document
    .getElementById("clearHistory")
    .addEventListener("click", () => {

        history = [];

        localStorage.removeItem(
            "leoCalcHistory"
        );

        renderHistory();

        showToast("History cleared");

    });


/* =========================================================
   TOOLS
========================================================= */

const homeToolData = [

    {
        id: "resistor",
        icon: "⚡",
        title: "Resistor",
        desc: "Resistance calculator"
    },

    {
        id: "frequency",
        icon: "〰",
        title: "Frequency",
        desc: "Frequency calculator"
    },

    {
        id: "percentage",
        icon: "%",
        title: "Percentage",
        desc: "Percentage calculator"
    },

    {
        id: "interest",
        icon: "₹",
        title: "Interest",
        desc: "Simple & compound interest"
    },

    {
        id: "emi",
        icon: "🏦",
        title: "EMI",
        desc: "Loan EMI calculator"
    },

    {
        id: "bmi",
        icon: "⚖",
        title: "BMI",
        desc: "BMI calculator"
    },

    {
        id: "time",
        icon: "🕐",
        title: "Time & Date",
        desc: "Clock & stopwatch"
    },

    {
        id: "weather",
        icon: "🌤",
        title: "Weather",
        desc: "Current weather"
    },

    {
        id: "converter",
        icon: "📐",
        title: "Converter",
        desc: "Unit conversion"
    },

    {
        id: "money",
        icon: "💰",
        title: "Money",
        desc: "Money calculations"
    },

    {
        id: "statistics",
        icon: "📊",
        title: "Statistics",
        desc: "Mean, median & more"
    },

    {
        id: "number",
        icon: "🔢",
        title: "Number System",
        desc: "Binary, decimal, hex"
    },

    {
        id: "security",
        icon: "🛡",
        title: "Security",
        desc: "Password generator"
    },

    {
        id: "notes",
        icon: "📝",
        title: "Quick Notes",
        desc: "Save your notes"
    }

];


function createToolCard(tool) {

    const isFavorite =
        favorites.includes(tool.id);

    return `

        <div class="tool-card"
             data-tool-card="${tool.id}">

            <button
                class="favorite ${isFavorite ? "active" : ""}"
                data-favorite="${tool.id}">
                ${isFavorite ? "★" : "☆"}
            </button>

            <div class="tool-icon">
                ${tool.icon}
            </div>

            <h3>
                ${tool.title}
            </h3>

            <p>
                ${tool.desc}
            </p>

        </div>

    `;

}


function renderHomeTools() {

    document.getElementById(
        "homeTools"
    ).innerHTML =
        homeToolData.map(createToolCard).join("");

    attachToolEvents();

}


renderHomeTools();


document.getElementById(
    "engineeringTools"
).innerHTML =
    homeToolData
        .slice(0, 6)
        .map(createToolCard)
        .join("");


document.getElementById(
    "utilityTools"
).innerHTML =
    homeToolData
        .slice(6)
        .map(createToolCard)
        .join("");


attachToolEvents();


/* =========================================================
   FAVORITES
========================================================= */

function toggleFavorite(id) {

    if (favorites.includes(id)) {

        favorites =
            favorites.filter(
                item => item !== id
            );

        showToast("Removed from favorites");

    } else {

        favorites.push(id);

        showToast("Added to favorites");

    }

    localStorage.setItem(
        "leoCalcFavorites",
        JSON.stringify(favorites)
    );

    renderHomeTools();

    document.getElementById(
        "engineeringTools"
    ).innerHTML =
        homeToolData
            .slice(0, 6)
            .map(createToolCard)
            .join("");

    document.getElementById(
        "utilityTools"
    ).innerHTML =
        homeToolData
            .slice(6)
            .map(createToolCard)
            .join("");

    attachToolEvents();

    renderFavorites();

}


function renderFavorites() {

    const container =
        document.getElementById(
            "favoritesList"
        );

    const list =
        homeToolData.filter(
            tool =>
                favorites.includes(tool.id)
        );

    if (!list.length) {

        container.innerHTML =
            `<p style="color:#77778e;padding:20px;">
                No favorite tools yet.
            </p>`;

        return;
    }

    container.innerHTML =
        list.map(createToolCard).join("");

    attachToolEvents();

}


function attachToolEvents() {

    document
        .querySelectorAll("[data-tool-card]")
        .forEach(card => {

            card.onclick = event => {

                if (
                    event.target.closest(
                        "[data-favorite]"
                    )
                ) {
                    return;
                }

                openTool(
                    card.dataset.toolCard
                );

            };

        });


    document
        .querySelectorAll("[data-favorite]")
        .forEach(button => {

            button.onclick = event => {

                event.stopPropagation();

                toggleFavorite(
                    button.dataset.favorite
                );

            };

        });

}


renderFavorites();


/* =========================================================
   MODAL
========================================================= */

function openTool(id) {

    const tool =
        homeToolData.find(
            item => item.id === id
        );

    if (!tool) return;

    modalTitle.textContent =
        tool.title;

    modalIcon.textContent =
        tool.icon;

    modalContent.innerHTML =
        getToolHTML(id);

    toolModal.classList.remove("hidden");

    attachToolForm(id);

}


function closeModal() {

    toolModal.classList.add("hidden");

    modalContent.innerHTML = "";

}


document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        closeModal
    );


toolModal.addEventListener(
    "click",
    event => {

        if (
            event.target === toolModal
        ) {
            closeModal();
        }

    }
);


/* =========================================================
   TOOL HTML
========================================================= */

function getToolHTML(id) {

    switch (id) {

        case "resistor":

            return `
                <div class="tool-form">

                    <label>Voltage (V)</label>
                    <input id="resV" type="number">

                    <label>Current (A)</label>
                    <input id="resI" type="number">

                    <button id="resBtn">
                        Calculate Resistance
                    </button>

                    <div id="resResult"
                         class="result-box">
                    </div>

                </div>
            `;


        case "frequency":

            return `
                <div class="tool-form">

                    <label>Frequency (Hz)</label>
                    <input id="freqValue"
                           type="number">

                    <button id="freqBtn">
                        Convert Frequency
                    </button>

                    <div id="freqResult"
                         class="result-box">
                    </div>

                </div>
            `;


        case "percentage":

            return `
                <div class="tool-form">

                    <label>Value</label>
                    <input id="percentValue"
                           type="number">

                    <label>Percentage (%)</label>
                    <input id="percentRate"
                           type="number">

                    <button id="percentBtn">
                        Calculate
                    </button>

                    <div id="percentResult"
                         class="result-box">
                    </div>

                </div>
            `;


        case "interest":

            return `
                <div class="tool-form">

                    <label>Principal</label>
                    <input id="interestP"
                           type="number">

                    <label>Rate (%)</label>
                    <input id="interestR"
                           type="number">

                    <label>Time (Years)</label>
                    <input id="interestT"
                           type="number">

                    <button id="interestBtn">
                        Calculate Interest
                    </button>

                    <div id="interestResult"
                         class="result-box">
                    </div>

                </div>
            `;


        case "emi":

            return `
                <div class="tool-form">

                    <label>Loan Amount</label>
                    <input id="emiP"
                           type="number">

                    <label>Annual Interest (%)</label>
                    <input id="emiR"
                           type="number">

                    <label>Months</label>
                    <input id="emiN"
                           type="number">

                    <button id="emiBtn">
                        Calculate EMI
                    </button>

                    <div id="emiResult"
                         class="result-box">
                    </div>

                </div>
            `;


        case "bmi":

            return `
                <div class="tool-form">

                    <label>Weight (kg)</label>
                    <input id="bmiW"
                           type="number">

                    <label>Height (cm)</label>
                    <input id="bmiH"
                           type="number">

                    <button id="bmiBtn">
                        Calculate BMI
                    </button>

                    <div id="bmiResult"
                         class="result-box">
                    </div>

                </div>
            `;


        case "time":

            return `
                <div class="tool-form">

                    <div id="liveClock"
                         class="result-box"
                         style="font-size:30px;text-align:center;">
                        --
                    </div>

                    <button id="stopwatchStart">
                        Start Stopwatch
                    </button>

                    <button id="stopwatchReset">
                        Reset
                    </button>

                    <div id="stopwatch"
                         class="result-box">
                        00:00:00
                    </div>

                </div>
            `;


        case "weather":

            return `
                <div class="tool-form">

                    <button id="weatherBtn">
                        Get My Weather
                    </button>

                    <div id="weatherResult"
                         class="result-box">
                        Weather data will appear here.
                    </div>

                </div>
            `;


        case "converter":

            return `
                <div class="tool-form">

                    <label>Category</label>

                    <select id="convertType">

                        <option value="length">
                            Length
                        </option>

                        <option value="weight">
                            Weight
                        </option>

                        <option value="temperature">
                            Temperature
                        </option>

                    </select>

                    <label>Value</label>

                    <input id="convertValue"
                           type="number">

                    <label>From</label>

                    <select id="convertFrom"></select>

                    <label>To</label>

                    <select id="convertTo"></select>

                    <button id="convertBtn">
                        Convert
                    </button>

                    <div id="convertResult"
                         class="result-box">
                    </div>

                </div>
            `;


        case "money":

            return `
                <div class="tool-form">

                    <label>Amount</label>

                    <input id="moneyAmount"
                           type="number">

                    <label>Percentage</label>

                    <input id="moneyPercent"
                           type="number">

                    <button id="moneyAdd">
                        Add Percentage
                    </button>

                    <button id="moneyRemove">
                        Remove Percentage
                    </button>

                    <div id="moneyResult"
                         class="result-box">
                    </div>

                </div>
            `;


        case "statistics":

            return `
                <div class="tool-form">

                    <label>
                        Numbers separated by commas
                    </label>

                    <input id="statsInput"
                           type="text"
                           placeholder="10,20,30,40">

                    <button id="statsBtn">
                        Calculate Statistics
                    </button>

                    <div id="statsResult"
                         class="result-box">
                    </div>

                </div>
            `;


        case "number":

            return `
                <div class="tool-form">

                    <label>Decimal Number</label>

                    <input id="numberInput"
                           type="number">

                    <button id="numberBtn">
                        Convert Number System
                    </button>

                    <div id="numberResult"
                         class="result-box">
                    </div>

                </div>
            `;


        case "security":

            return `
                <div class="tool-form">

                    <label>Password Length</label>

                    <input id="passwordLength"
                           type="number"
                           min="6"
                           max="64"
                           value="16">

                    <button id="passwordBtn">
                        Generate Password
                    </button>

                    <div id="passwordResult"
                         class="result-box"
                         style="word-break:break-all;">
                    </div>

                </div>
            `;


        case "notes":

            return `
                <div class="tool-form">

                    <label>Note</label>

                    <textarea
                        id="noteText"
                        placeholder="Write your note..."></textarea>

                    <button id="saveNote">
                        Save Note
                    </button>

                    <div id="notesList"
                         class="result-box">
                    </div>

                </div>
            `;

        default:

            return `
                <div class="result-box">
                    Tool coming soon.
                </div>
            `;

    }

}


/* =========================================================
   TOOL EVENTS
========================================================= */

function attachToolForm(id) {


    if (id === "resistor") {

        document
            .getElementById("resBtn")
            .onclick = () => {

                const v =
                    Number(
                        document.getElementById(
                            "resV"
                        ).value
                    );

                const i =
                    Number(
                        document.getElementById(
                            "resI"
                        ).value
                    );

                if (!v || !i) {
                    showToast("Enter both values");
                    return;
                }

                const r = v / i;

                document.getElementById(
                    "resResult"
                ).innerHTML =
                    `Resistance = <b>${r.toFixed(4)} Ω</b>`;

            };

    }


    if (id === "frequency") {

        document
            .getElementById("freqBtn")
            .onclick = () => {

                const f =
                    Number(
                        document.getElementById(
                            "freqValue"
                        ).value
                    );

                if (!f) {
                    showToast("Enter frequency");
                    return;
                }

                document.getElementById(
                    "freqResult"
                ).innerHTML =
                    `${f} Hz<br>
                     ${(f / 1000).toFixed(4)} kHz<br>
                     ${(f / 1000000).toFixed(6)} MHz`;

            };

    }


    if (id === "percentage") {

        document
            .getElementById("percentBtn")
            .onclick = () => {

                const value =
                    Number(
                        document.getElementById(
                            "percentValue"
                        ).value
                    );

                const rate =
                    Number(
                        document.getElementById(
                            "percentRate"
                        ).value
                    );

                const result =
                    value * rate / 100;

                document.getElementById(
                    "percentResult"
                ).innerHTML =
                    `${rate}% of ${value}
                     = <b>${result}</b>`;

            };

    }


    if (id === "interest") {

        document
            .getElementById("interestBtn")
            .onclick = () => {

                const p =
                    Number(
                        document.getElementById(
                            "interestP"
                        ).value
                    );

                const r =
                    Number(
                        document.getElementById(
                            "interestR"
                        ).value
                    );

                const t =
                    Number(
                        document.getElementById(
                            "interestT"
                        ).value
                    );

                const si =
                    p * r * t / 100;

                const amount =
                    p + si;

                document.getElementById(
                    "interestResult"
                ).innerHTML =
                    `Simple Interest:
                     <b>${si.toFixed(2)}</b><br>
                     Total Amount:
                     <b>${amount.toFixed(2)}</b>`;

            };

    }


    if (id === "emi") {

        document
            .getElementById("emiBtn")
            .onclick = () => {

                const p =
                    Number(
                        document.getElementById(
                            "emiP"
                        ).value
                    );

                const annual =
                    Number(
                        document.getElementById(
                            "emiR"
                        ).value
                    );

                const n =
                    Number(
                        document.getElementById(
                            "emiN"
                        ).value
                    );

                const r =
                    annual / 12 / 100;

                if (!p || !n) {
                    showToast("Enter all values");
                    return;
                }

                let emi;

                if (r === 0) {
                    emi = p / n;
                } else {
                    emi =
                        p * r *
                        Math.pow(1 + r, n) /
                        (
                            Math.pow(1 + r, n) - 1
                        );
                }

                document.getElementById(
                    "emiResult"
                ).innerHTML =
                    `Monthly EMI:
                     <b>₹${emi.toFixed(2)}</b><br>
                     Total Payment:
                     <b>₹${(emi * n).toFixed(2)}</b>`;

            };

    }


    if (id === "bmi") {

        document
            .getElementById("bmiBtn")
            .onclick = () => {

                const weight =
                    Number(
                        document.getElementById(
                            "bmiW"
                        ).value
                    );

                const height =
                    Number(
                        document.getElementById(
                            "bmiH"
                        ).value
                    ) / 100;

                if (!weight || !height) {
                    showToast("Enter values");
                    return;
                }

                const bmi =
                    weight /
                    (height * height);

                document.getElementById(
                    "bmiResult"
                ).innerHTML =
                    `BMI =
                     <b>${bmi.toFixed(2)}</b>`;

            };

    }


    if (id === "time") {

        startClock();

        let seconds = 0;
        let timer = null;

        const display =
            document.getElementById(
                "stopwatch"
            );

        document.getElementById(
            "stopwatchStart"
        ).onclick = function () {

            if (timer) {

                clearInterval(timer);
                timer = null;

                this.textContent =
                    "Start Stopwatch";

                return;
            }

            this.textContent =
                "Pause Stopwatch";

            timer = setInterval(() => {

                seconds++;

                const h =
                    String(
                        Math.floor(
                            seconds / 3600
                        )
                    ).padStart(2, "0");

                const m =
                    String(
                        Math.floor(
                            (seconds % 3600) / 60
                        )
                    ).padStart(2, "0");

                const s =
                    String(
                        seconds % 60
                    ).padStart(2, "0");

                display.textContent =
                    `${h}:${m}:${s}`;

            }, 1000);

        };


        document.getElementById(
            "stopwatchReset"
        ).onclick = () => {

            seconds = 0;

            display.textContent =
                "00:00:00";

        };

    }


    if (id === "weather") {

        document.getElementById(
            "weatherBtn"
        ).onclick = getWeather;

    }


    if (id === "converter") {

        const type =
            document.getElementById(
                "convertType"
            );

        type.addEventListener(
            "change",
            updateConverterUnits
        );

        updateConverterUnits();

        document.getElementById(
            "convertBtn"
        ).onclick =
            performConversion;

    }


    if (id === "money") {

        const calculateMoney =
            add => {

                const amount =
                    Number(
                        document.getElementById(
                            "moneyAmount"
                        ).value
                    );

                const percent =
                    Number(
                        document.getElementById(
                            "moneyPercent"
                        ).value
                    );

                const result =
                    add
                        ? amount * (1 + percent / 100)
                        : amount * (1 - percent / 100);

                document.getElementById(
                    "moneyResult"
                ).innerHTML =
                    `Result:
                     <b>₹${result.toFixed(2)}</b>`;

            };

        document.getElementById(
            "moneyAdd"
        ).onclick =
            () => calculateMoney(true);

        document.getElementById(
            "moneyRemove"
        ).onclick =
            () => calculateMoney(false);

    }


    if (id === "statistics") {

        document.getElementById(
            "statsBtn"
        ).onclick = () => {

            const numbers =
                document.getElementById(
                    "statsInput"
                ).value
                    .split(",")
                    .map(Number)
                    .filter(
                        n => Number.isFinite(n)
                    );

            if (!numbers.length) {
                showToast("Enter numbers");
                return;
            }

            const sorted =
                [...numbers].sort(
                    (a,b) => a-b
                );

            const sum =
                numbers.reduce(
                    (a,b) => a+b,
                    0
                );

            const mean =
                sum / numbers.length;

            const mid =
                Math.floor(
                    sorted.length / 2
                );

            const median =
                sorted.length % 2
                    ? sorted[mid]
                    : (
                        sorted[mid - 1] +
                        sorted[mid]
                    ) / 2;

            const min =
                Math.min(...numbers);

            const max =
                Math.max(...numbers);

            document.getElementById(
                "statsResult"
            ).innerHTML =
                `Count: <b>${numbers.length}</b><br>
                 Sum: <b>${sum}</b><br>
                 Mean: <b>${mean.toFixed(4)}</b><br>
                 Median: <b>${median}</b><br>
                 Minimum: <b>${min}</b><br>
                 Maximum: <b>${max}</b>`;

        };

    }


    if (id === "number") {

        document.getElementById(
            "numberBtn"
        ).onclick = () => {

            const value =
                Number(
                    document.getElementById(
                        "numberInput"
                    ).value
                );

            if (
                !Number.isInteger(value) ||
                value < 0
            ) {
                showToast(
                    "Enter a positive whole number"
                );
                return;
            }

            document.getElementById(
                "numberResult"
            ).innerHTML =
                `Binary:
                 <b>${value.toString(2)}</b><br>
                 Octal:
                 <b>${value.toString(8)}</b><br>
                 Decimal:
                 <b>${value}</b><br>
                 Hexadecimal:
                 <b>${value.toString(16).toUpperCase()}</b>`;

        };

    }


    if (id === "security") {

        document.getElementById(
            "passwordBtn"
        ).onclick = () => {

            let length =
                Number(
                    document.getElementById(
                        "passwordLength"
                    ).value
                );

            length =
                Math.max(
                    6,
                    Math.min(64, length || 16)
                );

            const chars =
                "ABCDEFGHJKLMNPQRSTUVWXYZ" +
                "abcdefghijkmnopqrstuvwxyz" +
                "23456789!@#$%^&*";

            let password = "";

            for (
                let i = 0;
                i < length;
                i++
            ) {

                password +=
                    chars[
                        Math.floor(
                            Math.random() *
                            chars.length
                        )
                    ];

            }

            document.getElementById(
                "passwordResult"
            ).textContent =
                password;

        };

    }


    if (id === "notes") {

        renderNotes();

        document.getElementById(
            "saveNote"
        ).onclick = () => {

            const text =
                document.getElementById(
                    "noteText"
                ).value.trim();

            if (!text) {
                showToast("Write a note first");
                return;
            }

            notes.unshift({
                text: text,
                time: new Date().toLocaleString()
            });

            localStorage.setItem(
                "leoCalcNotes",
                JSON.stringify(notes)
            );

            document.getElementById(
                "noteText"
            ).value = "";

            renderNotes();

            showToast("Note saved");

        };

    }

}


/* =========================================================
   CLOCK
========================================================= */

let clockTimer = null;

function startClock() {

    if (clockTimer) {
        clearInterval(clockTimer);
    }

    const update = () => {

        const clock =
            document.getElementById(
                "liveClock"
            );

        if (!clock) return;

        const now = new Date();

        clock.textContent =
            now.toLocaleTimeString();

    };

    update();

    clockTimer =
        setInterval(update, 1000);

}


/* =========================================================
   WEATHER
========================================================= */

function getWeather() {

    const output =
        document.getElementById(
            "weatherResult"
        );

    output.textContent =
        "Getting your location...";


    if (!navigator.geolocation) {

        output.textContent =
            "Geolocation is not supported.";

        return;

    }


    navigator.geolocation.getCurrentPosition(

        async position => {

            const lat =
                position.coords.latitude;

            const lon =
                position.coords.longitude;

            output.textContent =
                "Getting weather...";


            try {

                const url =
                    "https://api.open-meteo.com/v1/forecast" +
                    `?latitude=${lat}` +
                    `&longitude=${lon}` +
                    "&current=temperature_2m,relative_humidity_2m,wind_speed_10m";

                const response =
                    await fetch(url);

                const data =
                    await response.json();

                const current =
                    data.current;

                output.innerHTML =
                    `Temperature:
                     <b>${current.temperature_2m}°C</b><br>
                     Humidity:
                     <b>${current.relative_humidity_2m}%</b><br>
                     Wind:
                     <b>${current.wind_speed_10m} km/h</b>`;

            } catch {

                output.textContent =
                    "Unable to load weather.";

            }

        },

        () => {

            output.textContent =
                "Location permission was denied.";

        }

    );

}


/* =========================================================
   CONVERTER
========================================================= */

function updateConverterUnits() {

    const type =
        document.getElementById(
            "convertType"
        ).value;

    const from =
        document.getElementById(
            "convertFrom"
        );

    const to =
        document.getElementById(
            "convertTo"
        );

    let units = [];

    if (type === "length") {

        units = [
            ["meter", "Meter"],
            ["kilometer", "Kilometer"],
            ["centimeter", "Centimeter"],
            ["foot", "Foot"],
            ["inch", "Inch"]
        ];

    } else if (type === "weight") {

        units = [
            ["kg", "Kilogram"],
            ["g", "Gram"],
            ["lb", "Pound"]
        ];

    } else {

        units = [
            ["celsius", "Celsius"],
            ["fahrenheit", "Fahrenheit"],
            ["kelvin", "Kelvin"]
        ];

    }

    const html =
        units.map(
            unit =>
                `<option value="${unit[0]}">
                    ${unit[1]}
                </option>`
        ).join("");

    from.innerHTML = html;
    to.innerHTML = html;

    if (units.length > 1) {
        to.selectedIndex = 1;
    }

}


function performConversion() {

    const type =
        document.getElementById(
            "convertType"
        ).value;

    const value =
        Number(
            document.getElementById(
                "convertValue"
            ).value
        );

    const from =
        document.getElementById(
            "convertFrom"
        ).value;

    const to =
        document.getElementById(
            "convertTo"
        ).value;

    let result;


    if (type === "length") {

        const meterValues = {
            meter: 1,
            kilometer: 1000,
            centimeter: 0.01,
            foot: 0.3048,
            inch: 0.0254
        };

        result =
            value *
            meterValues[from] /
            meterValues[to];

    }


    else if (type === "weight") {

        const kgValues = {
            kg: 1,
            g: 0.001,
            lb: 0.45359237
        };

        result =
            value *
            kgValues[from] /
            kgValues[to];

    }


    else {

        let celsius;

        if (from === "celsius") {
            celsius = value;
        }

        else if (from === "fahrenheit") {
            celsius =
                (value - 32) * 5 / 9;
        }

        else {
            celsius =
                value - 273.15;
        }


        if (to === "celsius") {
            result = celsius;
        }

        else if (to === "fahrenheit") {
            result =
                celsius * 9 / 5 + 32;
        }

        else {
            result =
                celsius + 273.15;
        }

    }


    document.getElementById(
        "convertResult"
    ).innerHTML =
        `<b>${result.toFixed(6)}</b> ${to}`;

}


/* =========================================================
   NOTES
========================================================= */

function renderNotes() {

    const container =
        document.getElementById(
            "notesList"
        );

    if (!container) return;

    if (!notes.length) {

        container.innerHTML =
            "No notes saved.";

        return;

    }

    container.innerHTML =
        notes.map(
            (note, index) => `

                <div style="
                    padding:10px 0;
                    border-bottom:1px solid rgba(255,255,255,.08);
                ">

                    <b>
                        ${escapeHtml(note.text)}
                    </b>

                    <br>

                    <small>
                        ${escapeHtml(note.time)}
                    </small>

                    <br>

                    <button
                        onclick="deleteNote(${index})"
                        style="
                            margin-top:7px;
                            background:transparent;
                            color:#ff8da8;
                        ">
                        Delete
                    </button>

                </div>
            `
        ).join("");

}


window.deleteNote = function(index) {

    notes.splice(index, 1);

    localStorage.setItem(
        "leoCalcNotes",
        JSON.stringify(notes)
    );

    renderNotes();

};


/* =========================================================
   SEARCH
========================================================= */

document
    .getElementById("searchInput")
    .addEventListener("input", event => {

        const query =
            event.target.value
                .toLowerCase()
                .trim();

        document
            .querySelectorAll(
                "[data-tool-card]"
            )
            .forEach(card => {

                const text =
                    card.textContent
                        .toLowerCase();

                card.style.display =
                    !query ||
                    text.includes(query)
                        ? ""
                        : "none";

            });

    });


/* =========================================================
   VOICE SEARCH
========================================================= */

document
    .getElementById("voiceBtn")
    .addEventListener("click", () => {

        const Recognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!Recognition) {

            showToast(
                "Voice search not supported"
            );

            return;

        }

        const recognition =
            new Recognition();

        recognition.lang = "en-IN";

        recognition.start();

        recognition.onresult =
            event => {

                document.getElementById(
                    "searchInput"
                ).value =
                    event.results[0][0].transcript;

                document.getElementById(
                    "searchInput"
                ).dispatchEvent(
                    new Event("input")
                );

            };

    });


/* =========================================================
   EXPORT
========================================================= */

document
    .getElementById("exportHistory")
    .addEventListener("click", () => {

        const data =
            JSON.stringify(
                history,
                null,
                2
            );

        const blob =
            new Blob(
                [data],
                {
                    type: "application/json"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const a =
            document.createElement("a");

        a.href = url;
        a.download =
            "LeoCalc-History.json";

        a.click();

        URL.revokeObjectURL(url);

        showToast("History exported");

    });


/* =========================================================
   CLEAR DATA
========================================================= */

document
    .getElementById("clearData")
    .addEventListener("click", () => {

        const ok =
            confirm(
                "Clear LeoCalc app data?"
            );

        if (!ok) return;

        localStorage.removeItem(
            "leoCalcHistory"
        );

        localStorage.removeItem(
            "leoCalcFavorites"
        );

        localStorage.removeItem(
            "leoCalcNotes"
        );

        history = [];
        favorites = [];
        notes = [];

        renderHistory();
        renderHomeTools();
        renderFavorites();

        showToast(
            "App data cleared"
        );

    });


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   INITIAL DISPLAY
========================================================= */

updateDisplay();
