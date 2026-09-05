/* =========================================================
   LEO CALC — COMPLETE SCRIPT.JS
   Premium Engineering Calculator
   ========================================================= */

"use strict";

/* =========================================================
   GLOBAL STATE
   ========================================================= */

let expression = "";
let history = JSON.parse(localStorage.getItem("leoCalcHistory") || "[]");
let favorites = JSON.parse(localStorage.getItem("leoCalcFavorites") || "[]");

let stopwatchInterval = null;
let stopwatchStart = 0;
let stopwatchElapsed = 0;
let stopwatchRunning = false;


/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (id) => document.getElementById(id);

const splashScreen = $("splashScreen");
const app = $("app");

const expressionDisplay = $("expressionDisplay");
const resultDisplay = $("resultDisplay");

const toolModal = $("toolModal");
const modalTitle = $("modalTitle");
const modalSubtitle = $("modalSubtitle");
const modalBody = $("modalBody");

const sideMenu = $("sideMenu");
const menuOverlay = $("menuOverlay");


/* =========================================================
   SPLASH SCREEN
   ========================================================= */

window.addEventListener("load", () => {

    setTimeout(() => {

        if (splashScreen) {
            splashScreen.classList.add("hidden");
        }

        if (app) {
            app.classList.remove("hidden");
        }

    }, 2200);

    renderHistory();
    renderFavorites();
    loadSettings();

});


/* =========================================================
   HAPTIC
   ========================================================= */

function haptic() {

    const enabled =
        localStorage.getItem("leoCalcHaptic") !== "false";

    if (
        enabled &&
        navigator.vibrate
    ) {
        navigator.vibrate(8);
    }
}


/* =========================================================
   PAGE NAVIGATION
   ========================================================= */

function showPage(pageName) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const page = $(`${pageName}Page`);

    if (page) {
        page.classList.add("active");
    }

    document.querySelectorAll(".bottom-item").forEach(item => {
        item.classList.remove("active");

        if (item.dataset.page === pageName) {
            item.classList.add("active");
        }
    });

    closeMenu();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (pageName === "history") {
        renderHistory();
    }

    if (pageName === "favorites") {
        renderFavorites();
    }
}


/* =========================================================
   MENU
   ========================================================= */

function openMenu() {

    sideMenu?.classList.add("open");
    menuOverlay?.classList.remove("hidden");

}

function closeMenu() {

    sideMenu?.classList.remove("open");
    menuOverlay?.classList.add("hidden");

}

$("menuBtn")?.addEventListener("click", () => {

    haptic();
    openMenu();

});

$("closeMenuBtn")?.addEventListener("click", () => {

    haptic();
    closeMenu();

});

menuOverlay?.addEventListener("click", closeMenu);


/* =========================================================
   PAGE BUTTONS
   ========================================================= */

document.addEventListener("click", (event) => {

    const pageButton =
        event.target.closest("[data-page]");

    if (!pageButton) return;

    const page =
        pageButton.dataset.page;

    if (page) {
        haptic();
        showPage(page);
    }

});


/* =========================================================
   OPEN CALCULATOR
   ========================================================= */

$("openCalculatorBtn")?.addEventListener(
    "click",
    () => {

        haptic();
        showPage("calculator");

    }
);


/* =========================================================
   TABS
   ========================================================= */

document.querySelectorAll(".tab").forEach(tab => {

    tab.addEventListener("click", () => {

        haptic();

        const target =
            tab.dataset.tab;

        document.querySelectorAll(".tab").forEach(t => {
            t.classList.remove("active");
        });

        tab.classList.add("active");

        document.querySelectorAll(".tab-content").forEach(content => {
            content.classList.remove("active");
        });

        const targetSection =
            $(`${target}Tab`);

        if (targetSection) {
            targetSection.classList.add("active");
        }

    });

});


/* =========================================================
   SCIENTIFIC CALCULATOR
   ========================================================= */

document.addEventListener("click", (event) => {

    const button =
        event.target.closest(
            ".calc-buttons button, .scientific-extra button"
        );

    if (!button) return;

    haptic();

    const value =
        button.dataset.value;

    const action =
        button.dataset.action;

    if (value !== undefined) {

        addToExpression(value);
        return;

    }

    if (action === "clear") {

        clearCalculator();
        return;

    }

    if (action === "delete") {

        deleteLast();
        return;

    }

    if (action === "calculate") {

        calculate();
        return;

    }

});


function addToExpression(value) {

    if (
        value === "π"
    ) {
        expression += "PI";
    }

    else {
        expression += value;
    }

    updateDisplay();

}


function updateDisplay() {

    if (expressionDisplay) {
        expressionDisplay.textContent =
            expression || "";
    }

    if (
        resultDisplay &&
        expression === ""
    ) {
        resultDisplay.textContent = "0";
    }

}


function clearCalculator() {

    expression = "";

    if (expressionDisplay) {
        expressionDisplay.textContent = "";
    }

    if (resultDisplay) {
        resultDisplay.textContent = "0";
    }

}


function deleteLast() {

    if (!expression) return;

    expression =
        expression.slice(0, -1);

    updateDisplay();

}


/* =========================================================
   SAFE CALCULATOR ENGINE
   ========================================================= */

function calculate() {

    if (!expression) return;

    try {

        const original =
            expression;

        let exp =
            expression
                .replace(/PI/g, "Math.PI")
                .replace(/\be\b/g, "Math.E")
                .replace(/sqrt\(/g, "Math.sqrt(")
                .replace(/sin\(/g, "Math.sin(toRad(")
                .replace(/cos\(/g, "Math.cos(toRad(")
                .replace(/tan\(/g, "Math.tan(toRad(")
                .replace(/log\(/g, "Math.log10(")
                .replace(/ln\(/g, "Math.log(");

        exp =
            exp.replace(
                /(\d+(?:\.\d+)?)\^2/g,
                "Math.pow($1,2)"
            );

        exp =
            exp.replace(
                /(\d+(?:\.\d+)?)\^3/g,
                "Math.pow($1,3)"
            );

        exp =
            exp.replace(
                /(\d+(?:\.\d+)?)!/g,
                "factorial($1)"
            );

        exp =
            exp.replace(
                /(\d+(?:\.\d+)?)\^(\d+(?:\.\d+)?)/g,
                "Math.pow($1,$2)"
            );

        exp =
            exp.replace(
                /×/g,
                "*"
            );

        const allowed =
            /^[0-9+\-*/().,\sA-Za-z_]+$/;

        if (!allowed.test(exp)) {
            throw new Error("Invalid");
        }

        const result =
            Function(
                "toRad",
                "factorial",
                `"use strict"; return (${exp})`
            )(toRad, factorial);

        if (
            typeof result !== "number" ||
            !Number.isFinite(result)
        ) {
            throw new Error("Invalid result");
        }

        const formatted =
            formatNumber(result);

        resultDisplay.textContent =
            formatted;

        addHistory(
            original,
            formatted
        );

        expression =
            String(result);

        expressionDisplay.textContent =
            original;

    }

    catch (error) {

        resultDisplay.textContent =
            "Error";

    }

}


function toRad(degrees) {

    return degrees * Math.PI / 180;

}


function factorial(n) {

    n = Number(n);

    if (
        !Number.isInteger(n) ||
        n < 0 ||
        n > 170
    ) {
        throw new Error("Invalid factorial");
    }

    let result = 1;

    for (
        let i = 2;
        i <= n;
        i++
    ) {
        result *= i;
    }

    return result;

}


function formatNumber(number) {

    if (
        Math.abs(number) >= 1e12 ||
        (
            Math.abs(number) > 0 &&
            Math.abs(number) < 1e-8
        )
    ) {
        return number.toExponential(8);
    }

    return Number(
        number.toFixed(10)
    ).toString();

}


/* =========================================================
   KEYBOARD SUPPORT
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key;

        if (
            /^[0-9+\-*/().]$/.test(key)
        ) {

            addToExpression(key);

        }

        else if (key === "Enter") {

            calculate();

        }

        else if (key === "Backspace") {

            deleteLast();

        }

        else if (key === "Escape") {

            clearCalculator();

        }

    }
);


/* =========================================================
   HISTORY
   ========================================================= */

function addHistory(
    calcExpression,
    result
) {

    history.unshift({

        expression: calcExpression,
        result: result,

        date:
            new Date().toLocaleString()

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
        $("historyList");

    if (!container) return;

    if (!history.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🕘</div>
                <strong>No History</strong>
                <p>Your calculations will appear here.</p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        history.map(item => `

            <div class="history-item">

                <div class="history-expression">
                    ${escapeHTML(item.expression)}
                </div>

                <div class="history-result">
                    = ${escapeHTML(item.result)}
                </div>

                <div class="history-time">
                    ${escapeHTML(item.date)}
                </div>

            </div>

        `).join("");

}


$("clearHistoryBtn")?.addEventListener(
    "click",
    () => {

        haptic();

        if (
            !confirm(
                "Clear calculation history?"
            )
        ) return;

        history = [];

        localStorage.removeItem(
            "leoCalcHistory"
        );

        renderHistory();

    }
);


/* =========================================================
   FAVORITES
   ========================================================= */

function toggleFavorite(
    tool
) {

    const index =
        favorites.indexOf(tool);

    if (index === -1) {

        favorites.push(tool);

    }

    else {

        favorites.splice(index, 1);

    }

    localStorage.setItem(
        "leoCalcFavorites",
        JSON.stringify(favorites)
    );

    renderFavorites();

}


function renderFavorites() {

    const container =
        $("favoritesList");

    if (!container) return;

    if (!favorites.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⭐</div>
                <strong>No Favorites</strong>
                <p>Your favorite tools will appear here.</p>
            </div>
        `;

        return;

    }

    container.innerHTML =
        favorites.map(tool => {

            const info =
                TOOL_DATA[tool];

            if (!info) return "";

            return `

                <button
                    class="favorite-item"
                    data-tool="${tool}">

                    <div class="favorite-icon">
                        ${info.icon}
                    </div>

                    <div>
                        <strong>${info.title}</strong>
                        <small>${info.subtitle}</small>
                    </div>

                </button>

            `;

        }).join("");

}


/* =========================================================
   TOOL DATA
   ========================================================= */

const TOOL_DATA = {

    resistor: {
        title: "Resistor Calculator",
        subtitle: "Calculate resistance from color bands",
        icon: "Ω"
    },

    frequency: {
        title: "Frequency Calculator",
        subtitle: "Calculate frequency and period",
        icon: "ƒ"
    },

    percentage: {
        title: "Percentage Calculator",
        subtitle: "Calculate percentage values",
        icon: "%"
    },

    interest: {
        title: "Interest Calculator",
        subtitle: "Simple and compound interest",
        icon: "📈"
    },

    emi: {
        title: "EMI Calculator",
        subtitle: "Calculate monthly loan EMI",
        icon: "₹"
    },

    bmi: {
        title: "BMI Calculator",
        subtitle: "Calculate BMI",
        icon: "⚖️"
    },

    time: {
        title: "Time & Date",
        subtitle: "Live clock and stopwatch",
        icon: "🕐"
    },

    weather: {
        title: "Live Weather",
        subtitle: "Current weather",
        icon: "🌤️"
    },

    converter: {
        title: "Unit Converter",
        subtitle: "Convert common units",
        icon: "🔄"
    },

    money: {
        title: "Money Tools",
        subtitle: "Quick money calculations",
        icon: "💰"
    },

    statistics: {
        title: "Statistics",
        subtitle: "Mean, median and more",
        icon: "📊"
    },

    number: {
        title: "Number System",
        subtitle: "Binary, decimal and hexadecimal",
        icon: "🔢"
    },

    security: {
        title: "Security",
        subtitle: "Generate secure passwords",
        icon: "🔐"
    },

    notes: {
        title: "Quick Notes",
        subtitle: "Save simple notes",
        icon: "📝"
    }

};


/* =========================================================
   TOOL OPENING
   ========================================================= */

document.addEventListener("click", event => {

    const button =
        event.target.closest("[data-tool]");

    if (!button) return;

    const tool =
        button.dataset.tool;

    if (!TOOL_DATA[tool]) return;

    haptic();

    openTool(tool);

});


function openTool(tool) {

    const data =
        TOOL_DATA[tool];

    if (!data) return;

    modalTitle.textContent =
        data.title;

    modalSubtitle.textContent =
        data.subtitle;

    modalBody.innerHTML =
        getToolHTML(tool);

    toolModal.classList.remove("hidden");

    initializeTool(tool);

}


$("closeModalBtn")?.addEventListener(
    "click",
    closeModal
);

toolModal?.addEventListener(
    "click",
    event => {

        if (
            event.target === toolModal
        ) {
            closeModal();
        }

    }
);


function closeModal() {

    toolModal?.classList.add("hidden");

    stopStopwatch();

}


/* =========================================================
   TOOL HTML
   ========================================================= */

function getToolHTML(tool) {

    switch (tool) {

        case "resistor":
            return resistorHTML();

        case "frequency":
            return frequencyHTML();

        case "percentage":
            return percentageHTML();

        case "interest":
            return interestHTML();

        case "emi":
            return emiHTML();

        case "bmi":
            return bmiHTML();

        case "time":
            return timeHTML();

        case "weather":
            return weatherHTML();

        case "converter":
            return converterHTML();

        case "money":
            return moneyHTML();

        case "statistics":
            return statisticsHTML();

        case "number":
            return numberHTML();

        case "security":
            return securityHTML();

        case "notes":
            return notesHTML();

        default:
            return "<p>Tool unavailable.</p>";

    }

}


/* =========================================================
   RESISTOR
   ========================================================= */

function resistorHTML() {

    return `

        <div class="form-group">
            <label>Band 1</label>

            <select id="r1" class="form-control">
                <option value="0">Black - 0</option>
                <option value="1">Brown - 1</option>
                <option value="2">Red - 2</option>
                <option value="3">Orange - 3</option>
                <option value="4">Yellow - 4</option>
                <option value="5">Green - 5</option>
                <option value="6">Blue - 6</option>
                <option value="7">Violet - 7</option>
                <option value="8">Grey - 8</option>
                <option value="9">White - 9</option>
            </select>
        </div>

        <div class="form-group">
            <label>Band 2</label>

            <select id="r2" class="form-control">
                <option value="0">Black - 0</option>
                <option value="1">Brown - 1</option>
                <option value="2">Red - 2</option>
                <option value="3">Orange - 3</option>
                <option value="4">Yellow - 4</option>
                <option value="5">Green - 5</option>
                <option value="6">Blue - 6</option>
                <option value="7">Violet - 7</option>
                <option value="8">Grey - 8</option>
                <option value="9">White - 9</option>
            </select>
        </div>

        <div class="form-group">
            <label>Multiplier</label>

            <select id="rm" class="form-control">
                <option value="1">×1 Ω</option>
                <option value="10">×10 Ω</option>
                <option value="100">×100 Ω</option>
                <option value="1000">×1 kΩ</option>
                <option value="10000">×10 kΩ</option>
                <option value="100000">×100 kΩ</option>
                <option value="1000000">×1 MΩ</option>
                <option value="10000000">×10 MΩ</option>
            </select>
        </div>

        <button
            class="primary-btn full-btn"
            id="calculateResistor">
            Calculate Resistance
        </button>

        <div id="resistorResult"></div>

    `;

}


function initializeResistor() {

    $("calculateResistor")?.addEventListener(
        "click",
        () => {

            const a =
                Number($("r1").value);

            const b =
                Number($("r2").value);

            const multiplier =
                Number($("rm").value);

            const resistance =
                ((a * 10) + b) * multiplier;

            $("resistorResult").innerHTML = `
                <div class="result-box">
                    <h3>Resistance</h3>
                    <div class="result-value">
                        ${formatResistance(resistance)}
                    </div>
                    <div class="result-note">
                        Calculated from the selected bands.
                    </div>
                </div>
            `;

        }
    );

}


function formatResistance(value) {

    if (value >= 1000000) {
        return `${value / 1000000} MΩ`;
    }

    if (value >= 1000) {
        return `${value / 1000} kΩ`;
    }

    return `${value} Ω`;

}


/* =========================================================
   FREQUENCY
   ========================================================= */

function frequencyHTML() {

    return `

        <div class="form-group">
            <label>Period (seconds)</label>

            <input
                id="periodInput"
                class="form-control"
                type="number"
                step="any"
                placeholder="Example: 0.02">
        </div>

        <button
            class="primary-btn full-btn"
            id="calculateFrequency">
            Calculate Frequency
        </button>

        <div id="frequencyResult"></div>

    `;

}


function initializeFrequency() {

    $("calculateFrequency")?.addEventListener(
        "click",
        () => {

            const period =
                Number($("periodInput").value);

            if (
                !period ||
                period <= 0
            ) {
                showResult(
                    "frequencyResult",
                    "Enter a valid period."
                );
                return;
            }

            const frequency =
                1 / period;

            showResult(
                "frequencyResult",
                `${formatNumber(frequency)} Hz`
            );

        }
    );

}


/* =========================================================
   PERCENTAGE
   ========================================================= */

function percentageHTML() {

    return `

        <div class="form-group">
            <label>Value</label>

            <input
                id="percentValue"
                class="form-control"
                type="number"
                step="any"
                placeholder="Example: 500">
        </div>

        <div class="form-group">
            <label>Percentage</label>

            <input
                id="percentRate"
                class="form-control"
                type="number"
                step="any"
                placeholder="Example: 18">
        </div>

        <button
            class="primary-btn full-btn"
            id="calculatePercentage">
            Calculate
        </button>

        <div id="percentageResult"></div>

    `;

}


function initializePercentage() {

    $("calculatePercentage")?.addEventListener(
        "click",
        () => {

            const value =
                Number($("percentValue").value);

            const rate =
                Number($("percentRate").value);

            if (
                !Number.isFinite(value) ||
                !Number.isFinite(rate)
            ) {
                showResult(
                    "percentageResult",
                    "Enter valid values."
                );
                return;
            }

            const result =
                value * rate / 100;

            showResult(
                "percentageResult",
                formatNumber(result)
            );

        }
    );

}


/* =========================================================
   INTEREST
   ========================================================= */

function interestHTML() {

    return `

        <div class="form-group">
            <label>Principal</label>

            <input
                id="interestPrincipal"
                class="form-control"
                type="number"
                placeholder="10000">
        </div>

        <div class="form-group">
            <label>Annual Rate (%)</label>

            <input
                id="interestRate"
                class="form-control"
                type="number"
                step="any"
                placeholder="7.5">
        </div>

        <div class="form-group">
            <label>Time (years)</label>

            <input
                id="interestYears"
                class="form-control"
                type="number"
                step="any"
                placeholder="5">
        </div>

        <button
            class="primary-btn full-btn"
            id="calculateInterest">
            Calculate Interest
        </button>

        <div id="interestResult"></div>

    `;

}


function initializeInterest() {

    $("calculateInterest")?.addEventListener(
        "click",
        () => {

            const p =
                Number($("interestPrincipal").value);

            const r =
                Number($("interestRate").value);

            const t =
                Number($("interestYears").value);

            if (
                p <= 0 ||
                r < 0 ||
                t <= 0
            ) {

                showResult(
                    "interestResult",
                    "Enter valid values."
                );

                return;
            }

            const simpleInterest =
                p * r * t / 100;

            const total =
                p + simpleInterest;

            $("interestResult").innerHTML = `
                <div class="result-box">
                    <h3>Simple Interest</h3>

                    <div class="result-value">
                        ${formatNumber(simpleInterest)}
                    </div>

                    <div class="result-note">
                        Total Amount:
                        ${formatNumber(total)}
                    </div>
                </div>
            `;

        }
    );

}


/* =========================================================
   EMI
   ========================================================= */

function emiHTML() {

    return `

        <div class="form-group">
            <label>Loan Amount</label>

            <input
                id="loanAmount"
                class="form-control"
                type="number"
                placeholder="500000">
        </div>

        <div class="form-group">
            <label>Annual Interest (%)</label>

            <input
                id="loanRate"
                class="form-control"
                type="number"
                step="any"
                placeholder="8.5">
        </div>

        <div class="form-group">
            <label>Tenure (months)</label>

            <input
                id="loanMonths"
                class="form-control"
                type="number"
                placeholder="60">
        </div>

        <button
            class="primary-btn full-btn"
            id="calculateEMI">
            Calculate EMI
        </button>

        <div id="emiResult"></div>

    `;

}


function initializeEMI() {

    $("calculateEMI")?.addEventListener(
        "click",
        () => {

            const principal =
                Number($("loanAmount").value);

            const annualRate =
                Number($("loanRate").value);

            const months =
                Number($("loanMonths").value);

            if (
                principal <= 0 ||
                annualRate < 0 ||
                months <= 0
            ) {

                showResult(
                    "emiResult",
                    "Enter valid values."
                );

                return;
            }

            const monthlyRate =
                annualRate / 12 / 100;

            let emi;

            if (monthlyRate === 0) {

                emi =
                    principal / months;

            }

            else {

                emi =
                    principal *
                    monthlyRate *
                    Math.pow(
                        1 + monthlyRate,
                        months
                    ) /
                    (
                        Math.pow(
                            1 + monthlyRate,
                            months
                        ) - 1
                    );

            }

            const total =
                emi * months;

            const interest =
                total - principal;

            $("emiResult").innerHTML = `
                <div class="result-box">

                    <h3>Monthly EMI</h3>

                    <div class="result-value">
                        ₹${formatNumber(emi)}
                    </div>

                    <div class="result-note">
                        Total Payment:
                        ₹${formatNumber(total)}
                        <br><br>
                        Total Interest:
                        ₹${formatNumber(interest)}
                    </div>

                </div>
            `;

        }
    );

}


/* =========================================================
   BMI
   ========================================================= */

function bmiHTML() {

    return `

        <div class="form-row">

            <div class="form-group">
                <label>Height (cm)</label>

                <input
                    id="bmiHeight"
                    class="form-control"
                    type="number"
                    placeholder="170">
            </div>

            <div class="form-group">
                <label>Weight (kg)</label>

                <input
                    id="bmiWeight"
                    class="form-control"
                    type="number"
                    placeholder="65">
            </div>

        </div>

        <button
            class="primary-btn full-btn"
            id="calculateBMI">
            Calculate BMI
        </button>

        <div id="bmiResult"></div>

    `;

}


function initializeBMI() {

    $("calculateBMI")?.addEventListener(
        "click",
        () => {

            const height =
                Number($("bmiHeight").value);

            const weight =
                Number($("bmiWeight").value);

            if (
                height <= 0 ||
                weight <= 0
            ) {

                showResult(
                    "bmiResult",
                    "Enter valid values."
                );

                return;
            }

            const meters =
                height / 100;

            const bmi =
                weight /
                (meters * meters);

            let category;

            if (bmi < 18.5) {
                category = "Below the usual adult range";
            }

            else if (bmi < 25) {
                category = "Usual adult range";
            }

            else if (bmi < 30) {
                category = "Above the usual adult range";
            }

            else {
                category = "Higher adult range";
            }

            $("bmiResult").innerHTML = `
                <div class="result-box">
                    <h3>BMI</h3>

                    <div class="result-value">
                        ${formatNumber(bmi)}
                    </div>

                    <div class="result-note">
                        ${category}
                    </div>
                </div>
            `;

        }
    );

}


/* =========================================================
   TIME & DATE
   ========================================================= */

function timeHTML() {

    return `

        <div class="weather-card">

            <div id="liveDate">
                Loading date...
            </div>

            <div
                id="liveClock"
                class="weather-temp">
                00:00:00
            </div>

        </div>

        <div class="stopwatch">

            <div
                id="stopwatchDisplay"
                class="stopwatch-time">
                00:00.00
            </div>

            <div class="stopwatch-controls">

                <button id="stopwatchStart">
                    Start
                </button>

                <button id="stopwatchReset">
                    Reset
                </button>

            </div>

        </div>

    `;

}


function initializeTime() {

    updateClock();

    window._leoClock =
        setInterval(
            updateClock,
            1000
        );

    $("stopwatchStart")?.addEventListener(
        "click",
        toggleStopwatch
    );

    $("stopwatchReset")?.addEventListener(
        "click",
        resetStopwatch
    );

}


function updateClock() {

    const now =
        new Date();

    const time =
        now.toLocaleTimeString();

    const date =
        now.toLocaleDateString(
            undefined,
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

    if ($("liveClock")) {
        $("liveClock").textContent =
            time;
    }

    if ($("liveDate")) {
        $("liveDate").textContent =
            date;
    }

}


/* =========================================================
   STOPWATCH
   ========================================================= */

function toggleStopwatch() {

    haptic();

    if (stopwatchRunning) {

        stopwatchElapsed +=
            Date.now() -
            stopwatchStart;

        stopwatchRunning = false;

        clearInterval(
            stopwatchInterval
        );

        $("stopwatchStart").textContent =
            "Start";

    }

    else {

        stopwatchStart =
            Date.now();

        stopwatchRunning = true;

        stopwatchInterval =
            setInterval(
                updateStopwatch,
                30
            );

        $("stopwatchStart").textContent =
            "Pause";

    }

}


function updateStopwatch() {

    let elapsed =
        stopwatchElapsed;

    if (stopwatchRunning) {

        elapsed +=
            Date.now() -
            stopwatchStart;

    }

    const minutes =
        Math.floor(
            elapsed / 60000
        );

    const seconds =
        Math.floor(
            (elapsed % 60000) / 1000
        );

    const hundredths =
        Math.floor(
            (elapsed % 1000) / 10
        );

    const output =
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}.` +
        `${String(hundredths).padStart(2, "0")}`;

    if ($("stopwatchDisplay")) {
        $("stopwatchDisplay").textContent =
            output;
    }

}


function resetStopwatch() {

    stopwatchRunning = false;
    stopwatchElapsed = 0;

    clearInterval(
        stopwatchInterval
    );

    stopwatchInterval = null;

    if ($("stopwatchStart")) {
        $("stopwatchStart").textContent =
            "Start";
    }

    updateStopwatch();

}


function stopStopwatch() {

    clearInterval(
        stopwatchInterval
    );

    stopwatchInterval = null;

}


/* =========================================================
   WEATHER
   ========================================================= */

function weatherHTML() {

    return `

        <div id="weatherContainer">

            <div class="weather-card">

                <div style="font-size:40px">
                    🌤️
                </div>

                <div>
                    Getting your weather...
                </div>

            </div>

        </div>

        <button
            class="primary-btn full-btn"
            id="refreshWeather">
            Refresh Weather
        </button>

    `;

}


function initializeWeather() {

    loadWeather();

    $("refreshWeather")?.addEventListener(
        "click",
        loadWeather
    );

}


function loadWeather() {

    const container =
        $("weatherContainer");

    if (!container) return;

    if (!navigator.geolocation) {

        container.innerHTML = `
            <div class="result-box">
                Location is not supported by this browser.
            </div>
        `;

        return;
    }

    navigator.geolocation.getCurrentPosition(

        async position => {

            const lat =
                position.coords.latitude;

            const lon =
                position.coords.longitude;

            try {

                const response =
                    await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
                    );

                if (!response.ok) {
                    throw new Error("Weather error");
                }

                const data =
                    await response.json();

                const current =
                    data.current;

                const weather =
                    weatherDescription(
                        current.weather_code
                    );

                container.innerHTML = `

                    <div class="weather-card">

                        <div style="font-size:42px">
                            ${weather.icon}
                        </div>

                        <div class="weather-temp">
                            ${current.temperature_2m}°
                        </div>

                        <div class="weather-location">
                            ${weather.text}
                        </div>

                        <div class="weather-details">

                            <div class="weather-detail">
                                <strong>
                                    ${current.relative_humidity_2m}%
                                </strong>
                                <small>Humidity</small>
                            </div>

                            <div class="weather-detail">
                                <strong>
                                    ${current.wind_speed_10m}
                                    km/h
                                </strong>
                                <small>Wind</small>
                            </div>

                        </div>

                    </div>

                `;

            }

            catch {

                container.innerHTML = `
                    <div class="result-box">
                        Unable to load weather.
                    </div>
                `;

            }

        },

        () => {

            container.innerHTML = `
                <div class="result-box">
                    Location permission is required for live weather.
                </div>
            `;

        }

    );

}


function weatherDescription(code) {

    const map = {

        0: {
            icon: "☀️",
            text: "Clear sky"
        },

        1: {
            icon: "🌤️",
            text: "Mainly clear"
        },

        2: {
            icon: "⛅",
            text: "Partly cloudy"
        },

        3: {
            icon: "☁️",
            text: "Overcast"
        },

        45: {
            icon: "🌫️",
            text: "Fog"
        },

        48: {
            icon: "🌫️",
            text: "Rime fog"
        },

        51: {
            icon: "🌦️",
            text: "Light drizzle"
        },

        61: {
            icon: "🌧️",
            text: "Rain"
        },

        63: {
            icon: "🌧️",
            text: "Moderate rain"
        },

        65: {
            icon: "🌧️",
            text: "Heavy rain"
        },

        80: {
            icon: "🌦️",
            text: "Rain showers"
        },

        95: {
            icon: "⛈️",
            text: "Thunderstorm"
        }

    };

    return (
        map[code] ||
        {
            icon: "🌤️",
            text: "Current weather"
        }
    );

}


/* =========================================================
   CONVERTER
   ========================================================= */

function converterHTML() {

    return `

        <div class="form-group">

            <label>Category</label>

            <select
                id="conversionType"
                class="form-control">

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

        </div>

        <div class="form-row">

            <div class="form-group">

                <label>From</label>

                <select
                    id="fromUnit"
                    class="form-control">
                </select>

            </div>

            <div class="form-group">

                <label>To</label>

                <select
                    id="toUnit"
                    class="form-control">
                </select>

            </div>

        </div>

        <div class="form-group">

            <label>Value</label>

            <input
                id="conversionValue"
                class="form-control"
                type="number"
                step="any"
                placeholder="Enter value">

        </div>

        <button
            class="primary-btn full-btn"
            id="convertBtn">
            Convert
        </button>

        <div id="conversionResult"></div>

    `;

}


const conversionUnits = {

    length: {
        meter: 1,
        kilometer: 1000,
        centimeter: 0.01,
        millimeter: 0.001,
        mile: 1609.344,
        yard: 0.9144,
        foot: 0.3048,
        inch: 0.0254
    },

    weight: {
        kilogram: 1,
        gram: 0.001,
        milligram: 0.000001,
        pound: 0.45359237,
        ounce: 0.0283495231
    }

};


function initializeConverter() {

    const type =
        $("conversionType");

    const from =
        $("fromUnit");

    const to =
        $("toUnit");

    function updateUnits() {

        const selected =
            type.value;

        let units;

        if (
            selected ===
            "temperature"
        ) {

            units = [
                "Celsius",
                "Fahrenheit",
                "Kelvin"
            ];

        }

        else {

            units =
                Object.keys(
                    conversionUnits[selected]
                );

        }

        from.innerHTML =
            units.map(
                unit =>
                    `<option value="${unit}">
                        ${capitalize(unit)}
                    </option>`
            ).join("");

        to.innerHTML =
            units.map(
                unit =>
                    `<option value="${unit}">
                        ${capitalize(unit)}
                    </option>`
            ).join("");

    }

    type.addEventListener(
        "change",
        updateUnits
    );

    updateUnits();

    $("convertBtn")?.addEventListener(
        "click",
        () => {

            const value =
                Number(
                    $("conversionValue").value
                );

            const selected =
                type.value;

            if (!Number.isFinite(value)) {

                showResult(
                    "conversionResult",
                    "Enter a valid number."
                );

                return;
            }

            let result;

            if (
                selected ===
                "temperature"
            ) {

                result =
                    convertTemperature(
                        value,
                        from.value,
                        to.value
                    );

            }

            else {

                const base =
                    value *
                    conversionUnits[selected][
                        from.value
                    ];

                result =
                    base /
                    conversionUnits[selected][
                        to.value
                    ];

            }

            showResult(
                "conversionResult",
                formatNumber(result)
            );

        }
    );

}


function convertTemperature(
    value,
    from,
    to
) {

    let celsius;

    if (from === "Celsius") {
        celsius = value;
    }

    else if (
        from === "Fahrenheit"
    ) {
        celsius =
            (value - 32) * 5 / 9;
    }

    else {
        celsius =
            value - 273.15;
    }

    if (to === "Celsius") {
        return celsius;
    }

    if (to === "Fahrenheit") {
        return celsius * 9 / 5 + 32;
    }

    return celsius + 273.15;

}


/* =========================================================
   MONEY TOOLS
   ========================================================= */

function moneyHTML() {

    return `

        <div class="form-group">
            <label>Amount</label>

            <input
                id="moneyAmount"
                class="form-control"
                type="number"
                step="any"
                placeholder="1000">
        </div>

        <div class="form-group">
            <label>Percentage</label>

            <input
                id="moneyPercent"
                class="form-control"
                type="number"
                step="any"
                placeholder="18">
        </div>

        <div class="form-row">

            <button
                class="primary-btn"
                id="addMoneyPercent">
                Add %
            </button>

            <button
                class="primary-btn"
                id="removeMoneyPercent">
                Remove %
            </button>

        </div>

        <div id="moneyResult"></div>

    `;

}


function initializeMoney() {

    $("addMoneyPercent")?.addEventListener(
        "click",
        () => {

            moneyCalculation(true);

        }
    );

    $("removeMoneyPercent")?.addEventListener(
        "click",
        () => {

            moneyCalculation(false);

        }
    );

}


function moneyCalculation(add) {

    const amount =
        Number($("moneyAmount").value);

    const percentage =
        Number($("moneyPercent").value);

    if (
        !Number.isFinite(amount) ||
        !Number.isFinite(percentage)
    ) {

        showResult(
            "moneyResult",
            "Enter valid values."
        );

        return;

    }

    const change =
        amount * percentage / 100;

    const result =
        add
            ? amount + change
            : amount - change;

    showResult(
        "moneyResult",
        `₹${formatNumber(result)}`
    );

}


/* =========================================================
   STATISTICS
   ========================================================= */

function statisticsHTML() {

    return `

        <div class="form-group">

            <label>
                Enter numbers separated by commas
            </label>

            <textarea
                id="statisticsInput"
                class="form-control notes-area"
                placeholder="10, 20, 30, 40, 50"></textarea>

        </div>

        <button
            class="primary-btn full-btn"
            id="calculateStatistics">
            Calculate Statistics
        </button>

        <div id="statisticsResult"></div>

    `;

}


function initializeStatistics() {

    $("calculateStatistics")?.addEventListener(
        "click",
        () => {

            const values =
                $("statisticsInput")
                    .value
                    .split(",")
                    .map(Number)
                    .filter(Number.isFinite);

            if (!values.length) {

                showResult(
                    "statisticsResult",
                    "Enter valid numbers."
                );

                return;

            }

            const sorted =
                [...values].sort(
                    (a, b) => a - b
                );

            const sum =
                values.reduce(
                    (a, b) => a + b,
                    0
                );

            const mean =
                sum / values.length;

            let median;

            const middle =
                Math.floor(
                    sorted.length / 2
                );

            if (
                sorted.length % 2
            ) {
                median =
                    sorted[middle];
            }

            else {
                median =
                    (
                        sorted[middle - 1] +
                        sorted[middle]
                    ) / 2;
            }

            const min =
                sorted[0];

            const max =
                sorted[sorted.length - 1];

            const variance =
                values.reduce(
                    (total, value) =>
                        total +
                        Math.pow(
                            value - mean,
                            2
                        ),
                    0
                ) / values.length;

            const standardDeviation =
                Math.sqrt(variance);

            $("statisticsResult").innerHTML = `

                <div class="result-box">

                    <h3>Statistics</h3>

                    <div class="number-result">

                        <div>
                            <span>Count</span>
                            <strong>
                                ${values.length}
                            </strong>
                        </div>

                        <div>
                            <span>Sum</span>
                            <strong>
                                ${formatNumber(sum)}
                            </strong>
                        </div>

                        <div>
                            <span>Mean</span>
                            <strong>
                                ${formatNumber(mean)}
                            </strong>
                        </div>

                        <div>
                            <span>Median</span>
                            <strong>
                                ${formatNumber(median)}
                            </strong>
                        </div>

                        <div>
                            <span>Minimum</span>
                            <strong>
                                ${formatNumber(min)}
                            </strong>
                        </div>

                        <div>
                            <span>Maximum</span>
                            <strong>
                                ${formatNumber(max)}
                            </strong>
                        </div>

                        <div>
                            <span>Standard Deviation</span>
                            <strong>
                                ${formatNumber(standardDeviation)}
                            </strong>
                        </div>

                    </div>

                </div>

            `;

        }
    );

}


/* =========================================================
   NUMBER SYSTEM
   ========================================================= */

function numberHTML() {

    return `

        <div class="form-group">

            <label>Decimal Number</label>

            <input
                id="numberInput"
                class="form-control"
                type="number"
                placeholder="255">

        </div>

        <button
            class="primary-btn full-btn"
            id="convertNumber">
            Convert
        </button>

        <div id="numberResult"></div>

    `;

}


function initializeNumber() {

    $("convertNumber")?.addEventListener(
        "click",
        () => {

            const value =
                Number(
                    $("numberInput").value
                );

            if (
                !Number.isInteger(value) ||
                value < 0
            ) {

                showResult(
                    "numberResult",
                    "Enter a positive whole number."
                );

                return;

            }

            $("numberResult").innerHTML = `

                <div class="number-result">

                    <div>
                        <span>Decimal</span>
                        <strong>${value}</strong>
                    </div>

                    <div>
                        <span>Binary</span>
                        <strong>
                            ${value.toString(2)}
                        </strong>
                    </div>

                    <div>
                        <span>Octal</span>
                        <strong>
                            ${value.toString(8)}
                        </strong>
                    </div>

                    <div>
                        <span>Hexadecimal</span>
                        <strong>
                            ${value.toString(16).toUpperCase()}
                        </strong>
                    </div>

                </div>

            `;

        }
    );

}


/* =========================================================
   SECURITY / PASSWORD
   ========================================================= */

function securityHTML() {

    return `

        <div class="form-group">

            <label>Password Length</label>

            <input
                id="passwordLength"
                class="form-control"
                type="number"
                min="4"
                max="64"
                value="16">

        </div>

        <button
            class="primary-btn full-btn"
            id="generatePassword">
            Generate Password
        </button>

        <div id="passwordResult"></div>

    `;

}


function initializeSecurity() {

    $("generatePassword")?.addEventListener(
        "click",
        generatePassword
    );

}


function generatePassword() {

    let length =
        Number(
            $("passwordLength").value
        );

    length =
        Math.min(
            64,
            Math.max(
                4,
                length || 16
            )
        );

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ" +
        "abcdefghijkmnopqrstuvwxyz" +
        "23456789" +
        "!@#$%^&*";

    let password = "";

    if (
        window.crypto &&
        crypto.getRandomValues
    ) {

        const values =
            new Uint32Array(length);

        crypto.getRandomValues(values);

        for (
            let i = 0;
            i < length;
            i++
        ) {

            password +=
                chars[
                    values[i] % chars.length
                ];

        }

    }

    else {

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

    }

    $("passwordResult").innerHTML = `

        <div class="result-box">

            <h3>Generated Password</h3>

            <div
                class="result-value"
                style="
                    font-size:18px;
                    overflow-wrap:anywhere;
                    font-family:monospace;
                ">
                ${escapeHTML(password)}
            </div>

            <button
                class="primary-btn full-btn"
                id="copyPassword">
                Copy
            </button>

        </div>

    `;

    $("copyPassword")?.addEventListener(
        "click",
        async () => {

            try {

                await navigator.clipboard.writeText(
                    password
                );

                $("copyPassword").textContent =
                    "Copied ✓";

            }

            catch {

                $("copyPassword").textContent =
                    "Copy failed";

            }

        }
    );

}


/* =========================================================
   NOTES
   ========================================================= */

function notesHTML() {

    const saved =
        localStorage.getItem(
            "leoCalcNotes"
        ) || "";

    return `

        <div class="form-group">

            <label>Your Note</label>

            <textarea
                id="notesInput"
                class="form-control notes-area"
                placeholder="Write your note here...">${escapeHTML(saved)}</textarea>

        </div>

        <button
            class="primary-btn full-btn"
            id="saveNote">
            Save Note
        </button>

        <div id="notesStatus"></div>

    `;

}


function initializeNotes() {

    $("saveNote")?.addEventListener(
        "click",
        () => {

            const note =
                $("notesInput").value;

            localStorage.setItem(
                "leoCalcNotes",
                note
            );

            $("notesStatus").innerHTML = `

                <div class="result-box">

                    <h3>Saved ✓</h3>

                    <div class="result-note">
                        Your note has been saved
                        on this device.
                    </div>

                </div>

            `;

        }
    );

}


/* =========================================================
   TOOL INITIALIZER
   ========================================================= */

function initializeTool(tool) {

    switch (tool) {

        case "resistor":
            initializeResistor();
            break;

        case "frequency":
            initializeFrequency();
            break;

        case "percentage":
            initializePercentage();
            break;

        case "interest":
            initializeInterest();
            break;

        case "emi":
            initializeEMI();
            break;

        case "bmi":
            initializeBMI();
            break;

        case "time":
            initializeTime();
            break;

        case "weather":
            initializeWeather();
            break;

        case "converter":
            initializeConverter();
            break;

        case "money":
            initializeMoney();
            break;

        case "statistics":
            initializeStatistics();
            break;

        case "number":
            initializeNumber();
            break;

        case "security":
            initializeSecurity();
            break;

        case "notes":
            initializeNotes();
            break;

    }

}


/* =========================================================
   SEARCH
   ========================================================= */

$("searchBtn")?.addEventListener(
    "click",
    () => {

        haptic();

        $("searchPanel")
            ?.classList.toggle("hidden");

        $("searchInput")?.focus();

    }
);


$("searchInput")?.addEventListener(
    "input",
    event => {

        const query =
            event.target.value
                .trim()
                .toLowerCase();

        const container =
            $("searchResults");

        if (!container) return;

        if (!query) {

            container.innerHTML = "";
            return;

        }

        const results =
            Object.entries(
                TOOL_DATA
            ).filter(
                ([key, data]) =>
                    key.includes(query) ||
                    data.title
                        .toLowerCase()
                        .includes(query) ||
                    data.subtitle
                        .toLowerCase()
                        .includes(query)
            );

        if (!results.length) {

            container.innerHTML = `
                <div class="empty-state">
                    No tools found.
                </div>
            `;

            return;
        }

        container.innerHTML =
            results.map(
                ([key, data]) => `

                    <button
                        class="search-result"
                        data-tool="${key}">

                        <div class="search-result-icon">
                            ${data.icon}
                        </div>

                        <div>
                            <strong>
                                ${data.title}
                            </strong>

                            <small>
                                ${data.subtitle}
                            </small>
                        </div>

                    </button>

                `
            ).join("");

    }
);


/* =========================================================
   VOICE SEARCH
   ========================================================= */

$("voiceSearchBtn")?.addEventListener(
    "click",
    () => {

        haptic();

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {

            alert(
                "Voice search is not supported in this browser."
            );

            return;

        }

        const recognition =
            new SpeechRecognition();

        recognition.lang =
            "en-IN";

        recognition.interimResults =
            false;

        recognition.start();

        recognition.onresult =
            event => {

                const text =
                    event.results[0][0].transcript;

                $("searchInput").value =
                    text;

                $("searchInput").dispatchEvent(
                    new Event("input")
                );

            };

    }
);


/* =========================================================
   SETTINGS
   ========================================================= */

function loadSettings() {

    const dark =
        localStorage.getItem(
            "leoCalcDarkMode"
        );

    const hapticSetting =
        localStorage.getItem(
            "leoCalcHaptic"
        );

    if ($("darkModeToggle")) {

        $("darkModeToggle").checked =
            dark !== "false";

    }

    if ($("hapticToggle")) {

        $("hapticToggle").checked =
            hapticSetting !== "false";

    }

}


$("darkModeToggle")?.addEventListener(
    "change",
    event => {

        localStorage.setItem(
            "leoCalcDarkMode",
            event.target.checked
        );

        document.body.classList.toggle(
            "light-mode",
            !event.target.checked
        );

    }
);


$("hapticToggle")?.addEventListener(
    "change",
    event => {

        localStorage.setItem(
            "leoCalcHaptic",
            event.target.checked
        );

    }
);


/* =========================================================
   EXPORT HISTORY
   ========================================================= */

$("exportHistoryBtn")?.addEventListener(
    "click",
    () => {

        if (!history.length) {

            alert(
                "No history to export."
            );

            return;

        }

        const content =
            history.map(
                item =>
                    `${item.date}\n` +
                    `${item.expression} = ${item.result}\n`
            ).join("\n");

        const blob =
            new Blob(
                [content],
                {
                    type: "text/plain"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "LeoCalc-History.txt";

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);

    }
);


/* =========================================================
   CLEAR ALL DATA
   ========================================================= */

$("clearDataBtn")?.addEventListener(
    "click",
    () => {

        haptic();

        if (
            !confirm(
                "Clear all LeoCalc saved data?"
            )
        ) return;

        localStorage.removeItem(
            "leoCalcHistory"
        );

        localStorage.removeItem(
            "leoCalcFavorites"
        );

        localStorage.removeItem(
            "leoCalcNotes"
        );

        localStorage.removeItem(
            "leoCalcDarkMode"
        );

        localStorage.removeItem(
            "leoCalcHaptic"
        );

        history = [];
        favorites = [];

        renderHistory();
        renderFavorites();

        alert(
            "LeoCalc data cleared."
        );

    }
);


/* =========================================================
   FAVORITE HELPER
   ========================================================= */

function addFavoriteButton(
    tool
) {

    const data =
        TOOL_DATA[tool];

    if (!data) return "";

    const active =
        favorites.includes(tool);

    return `

        <button
            class="favorite-toggle"
            data-favorite="${tool}">

            ${active ? "★" : "☆"}

        </button>

    `;

}


document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-favorite]"
            );

        if (!button) return;

        haptic();

        toggleFavorite(
            button.dataset.favorite
        );

    }
);


/* =========================================================
   COMMON RESULT
   ========================================================= */

function showResult(
    elementId,
    value
) {

    const element =
        $(elementId);

    if (!element) return;

    element.innerHTML = `

        <div class="result-box">

            <h3>Result</h3>

            <div class="result-value">
                ${escapeHTML(String(value))}
            </div>

        </div>

    `;

}


/* =========================================================
   CAPITALIZE
   ========================================================= */

function capitalize(text) {

    return text
        .charAt(0)
        .toUpperCase() +
        text.slice(1);

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   PREVENT MODAL BACKGROUND SCROLL
   ========================================================= */

const observer =
    new MutationObserver(
        () => {

            if (
                toolModal &&
                !toolModal.classList.contains(
                    "hidden"
                )
            ) {

                document.body.style.overflow =
                    "hidden";

            }

            else {

                document.body.style.overflow =
                    "";

            }

        }
    );


if (toolModal) {

    observer.observe(
        toolModal,
        {
            attributes: true,
            attributeFilter: [
                "class"
            ]
        }
    );

}


/* =========================================================
   CLEANUP
   ========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        if (window._leoClock) {
            clearInterval(
                window._leoClock
            );
        }

        stopStopwatch();

    }
);


/* =========================================================
   INITIAL READY
   ========================================================= */

console.log(
    "LeoCalc v1.0 loaded successfully."
);
