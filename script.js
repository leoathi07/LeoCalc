/* =========================================================
   LEO CALC — COMPLETE SCRIPT.JS
   Works with:
   index.html
   style.css
   backend.js

   No Login
   LocalStorage Backend
   ========================================================= */

"use strict";

/* =========================================================
   GLOBAL STATE
   ========================================================= */

let currentPage = "home";
let currentCalculator = "scientific";
let currentExpression = "";
let currentResult = "0";

let notes = [];
let history = [];
let favorites = [];

let stopwatchInterval = null;
let stopwatchStart = 0;
let stopwatchElapsed = 0;

let editingNoteId = null;

/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function getElement(id) {
    return document.getElementById(id);
}

function safeText(value) {
    return String(value ?? "");
}

/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});

function initializeApp() {
    loadBackendData();
    setupNavigation();
    setupMenu();
    setupSearch();
    setupCalculator();
    setupTools();
    setupNotes();
    setupHistory();
    setupFavorites();
    setupSettings();
    setupGlobalButtons();
    updateDashboard();
    renderHistory();
    renderFavorites();
    renderNotes();
    applySavedSettings();

    setTimeout(() => {
        const splash = getElement("splashScreen");

        if (splash) {
            splash.classList.add("hide");

            setTimeout(() => {
                splash.remove();
            }, 700);
        }
    }, 2200);
}

/* =========================================================
   BACKEND DATA
   ========================================================= */

function loadBackendData() {
    try {
        if (window.LeoCalcBackend) {
            history = LeoCalcBackend.getHistory() || [];
            favorites = LeoCalcBackend.getFavorites() || [];
            notes = LeoCalcBackend.getNotes() || [];
        } else {
            history = JSON.parse(
                localStorage.getItem("leocalc_history") || "[]"
            );

            favorites = JSON.parse(
                localStorage.getItem("leocalc_favorites") || "[]"
            );

            notes = JSON.parse(
                localStorage.getItem("leocalc_notes") || "[]"
            );
        }
    } catch (error) {
        console.error("Backend loading error:", error);

        history = [];
        favorites = [];
        notes = [];
    }
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {
    $$(".menu-item").forEach((item) => {
        item.addEventListener("click", () => {
            const page = item.dataset.page;

            if (page) {
                navigateTo(page);
            }

            closeMenu();
        });
    });

    $$(".nav-item").forEach((item) => {
        item.addEventListener("click", () => {
            const page = item.dataset.page;

            if (page) {
                navigateTo(page);
            }
        });
    });
}

function navigateTo(pageName) {
    if (!pageName) return;

    currentPage = pageName;

    $$(".page").forEach((page) => {
        page.classList.remove("active");
    });

    const targetPage = getElement(pageName);

    if (targetPage) {
        targetPage.classList.add("active");
    }

    $$(".menu-item").forEach((item) => {
        item.classList.toggle(
            "active",
            item.dataset.page === pageName
        );
    });

    $$(".nav-item").forEach((item) => {
        item.classList.toggle(
            "active",
            item.dataset.page === pageName
        );
    });

    if (pageName === "history") {
        renderHistory();
    }

    if (pageName === "favorites") {
        renderFavorites();
    }

    if (pageName === "notes") {
        renderNotes();
    }

    if (pageName === "home") {
        updateDashboard();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

/* =========================================================
   SIDE MENU
   ========================================================= */

function setupMenu() {
    const menuButton = getElement("menuButton");
    const closeButton = getElement("closeMenu");
    const overlay = getElement("menuOverlay");

    if (menuButton) {
        menuButton.addEventListener("click", openMenu);
    }

    if (closeButton) {
        closeButton.addEventListener("click", closeMenu);
    }

    if (overlay) {
        overlay.addEventListener("click", closeMenu);
    }
}

function openMenu() {
    const menu = getElement("sideMenu");
    const overlay = getElement("menuOverlay");

    if (menu) {
        menu.classList.add("open");
    }

    if (overlay) {
        overlay.classList.add("show");
    }

    document.body.classList.add("menu-open");
}

function closeMenu() {
    const menu = getElement("sideMenu");
    const overlay = getElement("menuOverlay");

    if (menu) {
        menu.classList.remove("open");
    }

    if (overlay) {
        overlay.classList.remove("show");
    }

    document.body.classList.remove("menu-open");
}

/* =========================================================
   GLOBAL SEARCH
   ========================================================= */

function setupSearch() {
    const search = getElement("globalSearch");

    if (!search) return;

    search.addEventListener("input", () => {
        const query = search.value.trim().toLowerCase();

        if (!query) return;

        const pages = {
            calculator: [
                "calculator",
                "scientific",
                "engineering",
                "math"
            ],

            tools: [
                "tools",
                "resistor",
                "emi",
                "interest",
                "percentage",
                "bmi",
                "converter",
                "statistics"
            ],

            history: ["history"],
            favorites: ["favorite"],
            notes: ["notes", "note"],
            settings: ["settings"]
        };

        for (const [page, keywords] of Object.entries(pages)) {
            if (keywords.some((word) => query.includes(word))) {
                navigateTo(page);
                return;
            }
        }
    });

    const voiceButton = getElement("voiceSearch");

    if (voiceButton) {
        voiceButton.addEventListener("click", startVoiceSearch);
    }
}

function startVoiceSearch() {
    const Recognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!Recognition) {
        alert("Voice search is not supported in this browser.");
        return;
    }

    const recognition = new Recognition();

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
        const text =
            event.results[0][0].transcript;

        const search = getElement("globalSearch");

        if (search) {
            search.value = text;
            search.dispatchEvent(new Event("input"));
        }
    };

    recognition.onerror = (event) => {
        console.error("Voice error:", event.error);
    };

    recognition.start();
}

/* =========================================================
   CALCULATOR
   ========================================================= */

function setupCalculator() {
    $$(".calculator-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
            const type = tab.dataset.calculator;

            if (type) {
                switchCalculator(type);
            }
        });
    });

    $$(".calc-btn").forEach((button) => {
        button.addEventListener("click", () => {
            const value = button.dataset.value;

            if (value !== undefined) {
                handleCalculatorInput(value);
            }
        });
    });

    const favoriteButton =
        getElement("addFavoriteButton");

    if (favoriteButton) {
        favoriteButton.addEventListener(
            "click",
            addCurrentCalculatorFavorite
        );
    }
}

function switchCalculator(type) {
    currentCalculator = type;

    $$(".calculator-tab").forEach((tab) => {
        tab.classList.toggle(
            "active",
            tab.dataset.calculator === type
        );
    });

    const panels = [
        "scientificPanel",
        "engineeringPanel",
        "utilitiesPanel"
    ];

    panels.forEach((id) => {
        const panel = getElement(id);

        if (panel) {
            panel.classList.remove("active");
        }
    });

    const panelMap = {
        scientific: "scientificPanel",
        engineering: "engineeringPanel",
        utilities: "utilitiesPanel"
    };

    const selected =
        getElement(panelMap[type]);

    if (selected) {
        selected.classList.add("active");
    }
}

function handleCalculatorInput(value) {
    if (value === "AC" || value === "clear") {
        clearCalculator();
        return;
    }

    if (value === "DEL" || value === "delete") {
        deleteCalculatorCharacter();
        return;
    }

    if (value === "=" || value === "calculate") {
        calculateExpression();
        return;
    }

    if (value === "sqrt") {
        appendCalculatorValue("sqrt(");
        return;
    }

    if (value === "square") {
        appendCalculatorValue("^2");
        return;
    }

    if (value === "cube") {
        appendCalculatorValue("^3");
        return;
    }

    if (value === "pi") {
        appendCalculatorValue("π");
        return;
    }

    if (value === "e") {
        appendCalculatorValue("e");
        return;
    }

    if (value === "sin") {
        appendCalculatorValue("sin(");
        return;
    }

    if (value === "cos") {
        appendCalculatorValue("cos(");
        return;
    }

    if (value === "tan") {
        appendCalculatorValue("tan(");
        return;
    }

    if (value === "log") {
        appendCalculatorValue("log(");
        return;
    }

    if (value === "ln") {
        appendCalculatorValue("ln(");
        return;
    }

    if (value === "!") {
        appendCalculatorValue("!");
        return;
    }

    if (value === "%") {
        appendCalculatorValue("%");
        return;
    }

    appendCalculatorValue(value);
}

function appendCalculatorValue(value) {
    currentExpression += String(value);
    updateCalculatorDisplay();
}

function deleteCalculatorCharacter() {
    currentExpression =
        currentExpression.slice(0, -1);

    updateCalculatorDisplay();
}

function clearCalculator() {
    currentExpression = "";
    currentResult = "0";

    updateCalculatorDisplay();
}

function updateCalculatorDisplay() {
    const expression =
        getElement("calculatorExpression");

    const result =
        getElement("calculatorResult");

    if (expression) {
        expression.textContent =
            currentExpression || "0";
    }

    if (result) {
        result.textContent =
            currentResult || "0";
    }
}

function calculateExpression() {
    if (!currentExpression.trim()) return;

    try {
        const expression =
            normalizeExpression(currentExpression);

        const result =
            evaluateExpression(expression);

        if (!Number.isFinite(result)) {
            throw new Error("Invalid result");
        }

        currentResult =
            formatNumber(result);

        updateCalculatorDisplay();

        saveCalculation(
            currentExpression,
            currentResult
        );
    } catch (error) {
        console.error(error);

        currentResult = "Error";
        updateCalculatorDisplay();
    }
}

function normalizeExpression(expression) {
    let exp = expression;

    exp = exp.replaceAll("π", "Math.PI");
    exp = exp.replace(/\be\b/g, "Math.E");

    exp = exp.replace(
        /sqrt\(/g,
        "Math.sqrt("
    );

    exp = exp.replace(
        /sin\(/g,
        "Math.sin("
    );

    exp = exp.replace(
        /cos\(/g,
        "Math.cos("
    );

    exp = exp.replace(
        /tan\(/g,
        "Math.tan("
    );

    exp = exp.replace(
        /log\(/g,
        "Math.log10("
    );

    exp = exp.replace(
        /ln\(/g,
        "Math.log("
    );

    exp = exp.replace(/\^/g, "**");

    exp = convertPercent(exp);
    exp = convertFactorial(exp);

    return exp;
}

function convertPercent(expression) {
    return expression.replace(
        /(\d+(?:\.\d+)?)%/g,
        "($1/100)"
    );
}

function convertFactorial(expression) {
    return expression.replace(
        /(\d+(?:\.\d+)?)!/g,
        "factorial($1)"
    );
}

function factorial(n) {
    n = Number(n);

    if (!Number.isFinite(n) || n < 0) {
        throw new Error("Invalid factorial");
    }

    if (!Number.isInteger(n)) {
        return gamma(n + 1);
    }

    if (n > 170) {
        throw new Error("Number too large");
    }

    let result = 1;

    for (let i = 2; i <= n; i++) {
        result *= i;
    }

    return result;
}

function gamma(z) {
    const coefficients = [
        676.5203681218851,
        -1259.1392167224028,
        771.32342877765313,
        -176.61502916214059,
        12.507343278686905,
        -0.13857109526572012,
        9.984369578019572e-6,
        1.5056327351493116e-7
    ];

    if (z < 0.5) {
        return Math.PI /
            (Math.sin(Math.PI * z) *
                gamma(1 - z));
    }

    z -= 1;

    let x = 0.99999999999980993;

    for (let i = 0; i < coefficients.length; i++) {
        x +=
            coefficients[i] /
            (z + i + 1);
    }

    const t =
        z + coefficients.length - 0.5;

    return Math.sqrt(2 * Math.PI) *
        Math.pow(t, z + 0.5) *
        Math.exp(-t) *
        x;
}

function evaluateExpression(expression) {
    const allowed =
        /^[0-9+\-*/().,\s%a-zA-Z_]+$/;

    if (!allowed.test(expression)) {
        throw new Error("Invalid characters");
    }

    return Function(
        "factorial",
        `"use strict"; return (${expression})`
    )(factorial);
}

function formatNumber(number) {
    if (!Number.isFinite(number)) {
        return "Error";
    }

    if (
        Math.abs(number) >= 1e12 ||
        (
            Math.abs(number) > 0 &&
            Math.abs(number) < 1e-9
        )
    ) {
        return number.toExponential(8);
    }

    return Number(
        number.toFixed(12)
    ).toString();
}

/* =========================================================
   SAVE CALCULATION
   ========================================================= */

function saveCalculation(expression, result) {
    const item = {
        expression,
        result,
        category: "calculator",
        timestamp: Date.now()
    };

    try {
        if (window.LeoCalcBackend) {
            LeoCalcBackend.addHistory(item);
        } else {
            history.unshift(item);

            localStorage.setItem(
                "leocalc_history",
                JSON.stringify(history)
            );
        }

        loadBackendData();
        updateDashboard();
    } catch (error) {
        console.error(
            "Saving calculation failed:",
            error
        );
    }
}

function addCurrentCalculatorFavorite() {
    if (!currentExpression) {
        alert("Enter a calculation first.");
        return;
    }

    const item = {
        expression: currentExpression,
        result: currentResult,
        category: "calculator",
        timestamp: Date.now()
    };

    try {
        if (window.LeoCalcBackend) {
            if (
                !LeoCalcBackend.isFavorite(
                    currentExpression
                )
            ) {
                LeoCalcBackend.addFavorite(item);
            }
        } else {
            favorites.unshift(item);

            localStorage.setItem(
                "leocalc_favorites",
                JSON.stringify(favorites)
            );
        }

        loadBackendData();
        renderFavorites();
        updateDashboard();

        alert("Added to favorites.");
    } catch (error) {
        console.error(error);
    }
}

/* =========================================================
   TOOLS
   ========================================================= */

function setupTools() {
    $$(".tool-card").forEach((card) => {
        card.addEventListener("click", () => {
            const tool = card.dataset.tool;

            if (tool) {
                openTool(tool);
            }
        });
    });

    const closeModal =
        getElement("closeToolModal");

    if (closeModal) {
        closeModal.addEventListener(
            "click",
            closeToolModal
        );
    }

    const modal =
        getElement("toolModal");

    if (modal) {
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                closeToolModal();
            }
        });
    }
}

function openTool(tool) {
    const modal =
        getElement("toolModal");

    const title =
        getElement("toolModalTitle");

    const body =
        getElement("toolModalBody");

    if (!modal || !title || !body) return;

    const tools = {
        resistor: {
            title: "Resistor Calculator",
            body: resistorTool()
        },

        frequency: {
            title: "Frequency Calculator",
            body: frequencyTool()
        },

        percentage: {
            title: "Percentage Calculator",
            body: percentageTool()
        },

        interest: {
            title: "Simple Interest",
            body: interestTool()
        },

        emi: {
            title: "EMI Calculator",
            body: emiTool()
        },

        bmi: {
            title: "BMI Calculator",
            body: bmiTool()
        },

        converter: {
            title: "Unit Converter",
            body: converterTool()
        },

        money: {
            title: "Money Calculator",
            body: moneyTool()
        },

        statistics: {
            title: "Statistics",
            body: statisticsTool()
        },

        number: {
            title: "Number System",
            body: numberSystemTool()
        },

        security: {
            title: "Password Generator",
            body: passwordTool()
        },

        notes: {
            title: "Quick Notes",
            body: quickNoteTool()
        },

        time: {
            title: "Time & Stopwatch",
            body: timeTool()
        },

        weather: {
            title: "Weather",
            body: weatherTool()
        }
    };

    const selected = tools[tool];

    if (!selected) return;

    title.textContent = selected.title;
    body.innerHTML = selected.body;

    modal.classList.add("show");

    initializeTool(tool);
}

function closeToolModal() {
    const modal =
        getElement("toolModal");

    if (modal) {
        modal.classList.remove("show");
    }
}

function initializeTool(tool) {
    if (tool === "resistor") {
        setupResistorTool();
    }

    if (tool === "frequency") {
        setupFrequencyTool();
    }

    if (tool === "percentage") {
        setupPercentageTool();
    }

    if (tool === "interest") {
        setupInterestTool();
    }

    if (tool === "emi") {
        setupEMITool();
    }

    if (tool === "bmi") {
        setupBMITool();
    }

    if (tool === "converter") {
        setupConverterTool();
    }

    if (tool === "money") {
        setupMoneyTool();
    }

    if (tool === "statistics") {
        setupStatisticsTool();
    }

    if (tool === "number") {
        setupNumberTool();
    }

    if (tool === "security") {
        setupPasswordTool();
    }

    if (tool === "notes") {
        setupQuickNoteTool();
    }

    if (tool === "time") {
        setupTimeTool();
    }

    if (tool === "weather") {
        setupWeatherTool();
    }
}

/* =========================================================
   RESISTOR
   ========================================================= */

function resistorTool() {
    return `
        <div class="tool-form">
            <label>Band 1</label>
            <select id="resBand1">
                <option value="0">Black</option>
                <option value="1">Brown</option>
                <option value="2">Red</option>
                <option value="3">Orange</option>
                <option value="4">Yellow</option>
                <option value="5">Green</option>
                <option value="6">Blue</option>
                <option value="7">Violet</option>
                <option value="8">Grey</option>
                <option value="9">White</option>
            </select>

            <label>Band 2</label>
            <select id="resBand2">
                <option value="0">Black</option>
                <option value="1">Brown</option>
                <option value="2">Red</option>
                <option value="3">Orange</option>
                <option value="4">Yellow</option>
                <option value="5">Green</option>
                <option value="6">Blue</option>
                <option value="7">Violet</option>
                <option value="8">Grey</option>
                <option value="9">White</option>
            </select>

            <label>Multiplier</label>
            <select id="resMultiplier">
                <option value="1">×1</option>
                <option value="10">×10</option>
                <option value="100">×100</option>
                <option value="1000">×1K</option>
                <option value="10000">×10K</option>
                <option value="100000">×100K</option>
                <option value="1000000">×1M</option>
            </select>

            <button id="calculateResistor">
                Calculate
            </button>

            <div class="tool-result" id="resistorResult">
                Result: —
            </div>
        </div>
    `;
}

function setupResistorTool() {
    const button =
        getElement("calculateResistor");

    if (!button) return;

    button.addEventListener("click", () => {
        const a =
            Number(getElement("resBand1").value);

        const b =
            Number(getElement("resBand2").value);

        const multiplier =
            Number(
                getElement("resMultiplier").value
            );

        const value =
            (a * 10 + b) * multiplier;

        getElement("resistorResult").textContent =
            `Result: ${formatResistance(value)}`;
    });
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

function frequencyTool() {
    return `
        <div class="tool-form">
            <label>Wavelength (m)</label>
            <input
                id="frequencyWavelength"
                type="number"
                step="any"
                placeholder="Enter wavelength"
            >

            <button id="calculateFrequency">
                Calculate Frequency
            </button>

            <div class="tool-result" id="frequencyResult">
                Result: —
            </div>
        </div>
    `;
}

function setupFrequencyTool() {
    const button =
        getElement("calculateFrequency");

    if (!button) return;

    button.addEventListener("click", () => {
        const wavelength =
            Number(
                getElement(
                    "frequencyWavelength"
                ).value
            );

        if (!wavelength || wavelength <= 0) {
            alert("Enter a valid wavelength.");
            return;
        }

        const speedOfLight =
            299792458;

        const frequency =
            speedOfLight / wavelength;

        getElement("frequencyResult").textContent =
            `Result: ${frequency.toLocaleString()} Hz`;
    });
}

/* =========================================================
   PERCENTAGE
   ========================================================= */

function percentageTool() {
    return `
        <div class="tool-form">
            <label>Value</label>
            <input id="percentageValue"
                   type="number"
                   step="any">

            <label>Percentage (%)</label>
            <input id="percentagePercent"
                   type="number"
                   step="any">

            <button id="calculatePercentage">
                Calculate
            </button>

            <div class="tool-result"
                 id="percentageResult">
                Result: —
            </div>
        </div>
    `;
}

function setupPercentageTool() {
    const button =
        getElement("calculatePercentage");

    if (!button) return;

    button.addEventListener("click", () => {
        const value =
            Number(
                getElement("percentageValue").value
            );

        const percent =
            Number(
                getElement("percentagePercent").value
            );

        const result =
            value * percent / 100;

        getElement("percentageResult")
            .textContent =
            `Result: ${formatNumber(result)}`;
    });
}

/* =========================================================
   SIMPLE INTEREST
   ========================================================= */

function interestTool() {
    return `
        <div class="tool-form">
            <label>Principal</label>
            <input id="interestPrincipal"
                   type="number">

            <label>Rate (%)</label>
            <input id="interestRate"
                   type="number"
                   step="any">

            <label>Time (years)</label>
            <input id="interestTime"
                   type="number"
                   step="any">

            <button id="calculateInterest">
                Calculate
            </button>

            <div class="tool-result"
                 id="interestResult">
                Result: —
            </div>
        </div>
    `;
}

function setupInterestTool() {
    const button =
        getElement("calculateInterest");

    if (!button) return;

    button.addEventListener("click", () => {
        const principal =
            Number(
                getElement(
                    "interestPrincipal"
                ).value
            );

        const rate =
            Number(
                getElement(
                    "interestRate"
                ).value
            );

        const time =
            Number(
                getElement(
                    "interestTime"
                ).value
            );

        const interest =
            principal * rate * time / 100;

        const total =
            principal + interest;

        getElement("interestResult")
            .textContent =
            `Interest: ${formatNumber(interest)}
             | Total: ${formatNumber(total)}`;
    });
}

/* =========================================================
   EMI
   ========================================================= */

function emiTool() {
    return `
        <div class="tool-form">
            <label>Loan Amount</label>
            <input id="emiPrincipal"
                   type="number">

            <label>Annual Interest (%)</label>
            <input id="emiRate"
                   type="number"
                   step="any">

            <label>Tenure (months)</label>
            <input id="emiMonths"
                   type="number">

            <button id="calculateEMI">
                Calculate EMI
            </button>

            <div class="tool-result"
                 id="emiResult">
                EMI: —
            </div>
        </div>
    `;
}

function setupEMITool() {
    const button =
        getElement("calculateEMI");

    if (!button) return;

    button.addEventListener("click", () => {
        const principal =
            Number(
                getElement("emiPrincipal").value
            );

        const annualRate =
            Number(
                getElement("emiRate").value
            );

        const months =
            Number(
                getElement("emiMonths").value
            );

        if (
            principal <= 0 ||
            months <= 0
        ) {
            alert("Enter valid values.");
            return;
        }

        const monthlyRate =
            annualRate / 12 / 100;

        let emi;

        if (monthlyRate === 0) {
            emi =
                principal / months;
        } else {
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

        getElement("emiResult")
            .textContent =
            `Monthly EMI: ${formatMoney(emi)}
             | Total: ${formatMoney(total)}`;
    });
}

/* =========================================================
   BMI
   ========================================================= */

function bmiTool() {
    return `
        <div class="tool-form">
            <label>Weight (kg)</label>
            <input id="bmiWeight"
                   type="number"
                   step="any">

            <label>Height (cm)</label>
            <input id="bmiHeight"
                   type="number"
                   step="any">

            <button id="calculateBMI">
                Calculate BMI
            </button>

            <div class="tool-result"
                 id="bmiResult">
                BMI: —
            </div>
        </div>
    `;
}

function setupBMITool() {
    const button =
        getElement("calculateBMI");

    if (!button) return;

    button.addEventListener("click", () => {
        const weight =
            Number(
                getElement("bmiWeight").value
            );

        const heightCm =
            Number(
                getElement("bmiHeight").value
            );

        if (
            weight <= 0 ||
            heightCm <= 0
        ) {
            alert("Enter valid values.");
            return;
        }

        const height =
            heightCm / 100;

        const bmi =
            weight /
            (height * height);

        let category;

        if (bmi < 18.5) {
            category = "Below typical range";
        } else if (bmi < 25) {
            category = "Typical range";
        } else if (bmi < 30) {
            category = "Above typical range";
        } else {
            category = "High range";
        }

        getElement("bmiResult")
            .textContent =
            `BMI: ${bmi.toFixed(2)} — ${category}`;
    });
}

/* =========================================================
   UNIT CONVERTER
   ========================================================= */

function converterTool() {
    return `
        <div class="tool-form">
            <label>Category</label>

            <select id="converterCategory">
                <option value="length">Length</option>
                <option value="weight">Weight</option>
                <option value="temperature">
                    Temperature
                </option>
            </select>

            <label>From</label>

            <select id="converterFrom"></select>

            <label>To</label>

            <select id="converterTo"></select>

            <label>Value</label>

            <input id="converterValue"
                   type="number"
                   step="any">

            <button id="convertUnits">
                Convert
            </button>

            <div class="tool-result"
                 id="converterResult">
                Result: —
            </div>
        </div>
    `;
}

function setupConverterTool() {
    const category =
        getElement("converterCategory");

    const from =
        getElement("converterFrom");

    const to =
        getElement("converterTo");

    const button =
        getElement("convertUnits");

    const units = {
        length: ["meter", "kilometer", "centimeter", "foot"],
        weight: ["kg", "gram", "pound"],
        temperature: ["celsius", "fahrenheit", "kelvin"]
    };

    function updateUnits() {
        const list =
            units[category.value];

        from.innerHTML = "";
        to.innerHTML = "";

        list.forEach((unit) => {
            from.add(
                new Option(
                    unit.toUpperCase(),
                    unit
                )
            );

            to.add(
                new Option(
                    unit.toUpperCase(),
                    unit
                )
            );
        });
    }

    updateUnits();

    category.addEventListener(
        "change",
        updateUnits
    );

    button.addEventListener("click", () => {
        const value =
            Number(
                getElement("converterValue").value
            );

        const result =
            convertUnit(
                category.value,
                from.value,
                to.value,
                value
            );

        getElement("converterResult")
            .textContent =
            `Result: ${formatNumber(result)}`;
    });
}

function convertUnit(
    category,
    from,
    to,
    value
) {
    if (category === "length") {
        const meters = {
            meter: 1,
            kilometer: 1000,
            centimeter: 0.01,
            foot: 0.3048
        };

        return (
            value *
            meters[from] /
            meters[to]
        );
    }

    if (category === "weight") {
        const kg = {
            kg: 1,
            gram: 0.001,
            pound: 0.45359237
        };

        return (
            value *
            kg[from] /
            kg[to]
        );
    }

    if (category === "temperature") {
        let celsius;

        if (from === "celsius") {
            celsius = value;
        } else if (from === "fahrenheit") {
            celsius =
                (value - 32) * 5 / 9;
        } else {
            celsius =
                value - 273.15;
        }

        if (to === "celsius") {
            return celsius;
        }

        if (to === "fahrenheit") {
            return (
                celsius * 9 / 5 + 32
            );
        }

        return celsius + 273.15;
    }

    return value;
}

/* =========================================================
   MONEY
   ========================================================= */

function moneyTool() {
    return `
        <div class="tool-form">
            <label>Amount</label>
            <input id="moneyAmount"
                   type="number"
                   step="any">

            <label>Percentage (%)</label>
            <input id="moneyPercent"
                   type="number"
                   step="any">

            <button id="addMoneyPercent">
                Add Percentage
            </button>

            <button id="removeMoneyPercent">
                Remove Percentage
            </button>

            <div class="tool-result"
                 id="moneyResult">
                Result: —
            </div>
        </div>
    `;
}

function setupMoneyTool() {
    const amount =
        getElement("moneyAmount");

    const percent =
        getElement("moneyPercent");

    const result =
        getElement("moneyResult");

    getElement("addMoneyPercent")
        .addEventListener("click", () => {
            const a = Number(amount.value);
            const p = Number(percent.value);

            const answer =
                a + (a * p / 100);

            result.textContent =
                `Result: ${formatMoney(answer)}`;
        });

    getElement("removeMoneyPercent")
        .addEventListener("click", () => {
            const a = Number(amount.value);
            const p = Number(percent.value);

            const answer =
                a - (a * p / 100);

            result.textContent =
                `Result: ${formatMoney(answer)}`;
        });
}

function formatMoney(value) {
    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }
    ).format(value);
}

/* =========================================================
   STATISTICS
   ========================================================= */

function statisticsTool() {
    return `
        <div class="tool-form">
            <label>
                Numbers
            </label>

            <textarea
                id="statisticsInput"
                placeholder="10, 20, 30, 40"
            ></textarea>

            <button id="calculateStatistics">
                Calculate
            </button>

            <div class="tool-result"
                 id="statisticsResult">
                Result: —
            </div>
        </div>
    `;
}

function setupStatisticsTool() {
    const button =
        getElement("calculateStatistics");

    if (!button) return;

    button.addEventListener("click", () => {
        const raw =
            getElement(
                "statisticsInput"
            ).value;

        const values =
            raw
                .split(/[\s,]+/)
                .map(Number)
                .filter(Number.isFinite);

        if (!values.length) {
            alert("Enter numbers.");
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

        const median =
            sorted.length % 2
                ? sorted[
                    Math.floor(
                        sorted.length / 2
                    )
                ]
                : (
                    sorted[
                        sorted.length / 2 - 1
                    ] +
                    sorted[
                        sorted.length / 2
                    ]
                ) / 2;

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

        getElement("statisticsResult")
            .innerHTML = `
                Count: ${values.length}<br>
                Sum: ${formatNumber(sum)}<br>
                Mean: ${formatNumber(mean)}<br>
                Median: ${formatNumber(median)}<br>
                Min: ${formatNumber(sorted[0])}<br>
                Max: ${formatNumber(
                    sorted[sorted.length - 1]
                )}<br>
                Standard Deviation:
                ${formatNumber(
                    standardDeviation
                )}
            `;
    });
}

/* =========================================================
   NUMBER SYSTEM
   ========================================================= */

function numberSystemTool() {
    return `
        <div class="tool-form">
            <label>Number</label>
            <input id="numberSystemInput"
                   type="text"
                   placeholder="Enter decimal number">

            <label>From Base</label>
            <select id="numberFromBase">
                <option value="2">Binary</option>
                <option value="8">Octal</option>
                <option value="10" selected>
                    Decimal
                </option>
                <option value="16">Hexadecimal</option>
            </select>

            <label>To Base</label>
            <select id="numberToBase">
                <option value="2">Binary</option>
                <option value="8">Octal</option>
                <option value="10">Decimal</option>
                <option value="16" selected>
                    Hexadecimal
                </option>
            </select>

            <button id="convertNumberSystem">
                Convert
            </button>

            <div class="tool-result"
                 id="numberSystemResult">
                Result: —
            </div>
        </div>
    `;
}

function setupNumberTool() {
    const button =
        getElement(
            "convertNumberSystem"
        );

    if (!button) return;

    button.addEventListener("click", () => {
        const input =
            getElement(
                "numberSystemInput"
            ).value.trim();

        const from =
            Number(
                getElement(
                    "numberFromBase"
                ).value
            );

        const to =
            Number(
                getElement(
                    "numberToBase"
                ).value
            );

        try {
            const decimal =
                parseInt(input, from);

            if (Number.isNaN(decimal)) {
                throw new Error("Invalid number");
            }

            const answer =
                decimal.toString(to)
                    .toUpperCase();

            getElement(
                "numberSystemResult"
            ).textContent =
                `Result: ${answer}`;
        } catch (error) {
            getElement(
                "numberSystemResult"
            ).textContent =
                "Result: Invalid input";
        }
    });
}

/* =========================================================
   PASSWORD GENERATOR
   ========================================================= */

function passwordTool() {
    return `
        <div class="tool-form">
            <label>Password Length</label>

            <input
                id="passwordLength"
                type="number"
                min="4"
                max="64"
                value="16"
            >

            <label>
                <input
                    id="passwordNumbers"
                    type="checkbox"
                    checked
                >
                Numbers
            </label>

            <label>
                <input
                    id="passwordSymbols"
                    type="checkbox"
                    checked
                >
                Symbols
            </label>

            <button id="generatePassword">
                Generate
            </button>

            <div class="tool-result"
                 id="passwordResult">
                —
            </div>
        </div>
    `;
}

function setupPasswordTool() {
    const button =
        getElement("generatePassword");

    if (!button) return;

    button.addEventListener("click", () => {
        const length =
            Math.min(
                64,
                Math.max(
                    4,
                    Number(
                        getElement(
                            "passwordLength"
                        ).value
                    ) || 16
                )
            );

        let chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
            "abcdefghijklmnopqrstuvwxyz";

        if (
            getElement(
                "passwordNumbers"
            ).checked
        ) {
            chars += "0123456789";
        }

        if (
            getElement(
                "passwordSymbols"
            ).checked
        ) {
            chars += "!@#$%^&*";
        }

        let password = "";

        const random =
            new Uint32Array(length);

        crypto.getRandomValues(random);

        for (let i = 0; i < length; i++) {
            password +=
                chars[
                    random[i] % chars.length
                ];
        }

        getElement(
            "passwordResult"
        ).textContent = password;
    });
}

/* =========================================================
   QUICK NOTES
   ========================================================= */

function quickNoteTool() {
    return `
        <div class="tool-form">
            <input
                id="quickNoteTitle"
                type="text"
                placeholder="Note title"
            >

            <textarea
                id="quickNoteContent"
                placeholder="Write your note..."
            ></textarea>

            <button id="saveQuickNote">
                Save Note
            </button>

            <div class="tool-result"
                 id="quickNoteResult">
                —
            </div>
        </div>
    `;
}

function setupQuickNoteTool() {
    const button =
        getElement("saveQuickNote");

    if (!button) return;

    button.addEventListener("click", () => {
        const title =
            getElement(
                "quickNoteTitle"
            ).value.trim();

        const content =
            getElement(
                "quickNoteContent"
            ).value.trim();

        if (!content) {
            alert("Write something first.");
            return;
        }

        try {
            const note = {
                title:
                    title || "Untitled Note",
                content,
                mood: "default",
                color: "default",
                favorite: false,
                pinned: false,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            if (window.LeoCalcBackend) {
                LeoCalcBackend.addNote(note);
            }

            loadBackendData();
            renderNotes();
            updateDashboard();

            getElement(
                "quickNoteResult"
            ).textContent =
                "Note saved successfully.";

            getElement(
                "quickNoteTitle"
            ).value = "";

            getElement(
                "quickNoteContent"
            ).value = "";
        } catch (error) {
            console.error(error);
        }
    });
}

/* =========================================================
   NOTES PAGE
   ========================================================= */

function setupNotes() {
    const search =
        getElement("notesSearch");

    if (search) {
        search.addEventListener(
            "input",
            renderNotes
        );
    }

    const addButton =
        getElement("addNoteButton");

    if (addButton) {
        addButton.addEventListener(
            "click",
            () => {
                openNoteEditor();
            }
        );
    }
}

function renderNotes() {
    const container =
        getElement("notesList");

    if (!container) return;

    loadBackendData();

    const search =
        (
            getElement("notesSearch")?.value ||
            ""
        ).trim().toLowerCase();

    let filtered =
        notes.filter((note) => {
            const title =
                safeText(note.title)
                    .toLowerCase();

            const content =
                safeText(note.content)
                    .toLowerCase();

            return (
                !search ||
                title.includes(search) ||
                content.includes(search)
            );
        });

    if (!filtered.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Notes Yet</h3>
                <p>Create your first note.</p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        filtered.map((note) => `
            <article class="note-card"
                     data-id="${note.id || ""}">

                <div class="note-card-header">
                    <h3>
                        ${escapeHTML(
                            note.title ||
                            "Untitled Note"
                        )}
                    </h3>

                    ${
                        note.pinned
                            ? "<span>📌</span>"
                            : ""
                    }
                </div>

                <p>
                    ${escapeHTML(
                        note.content || ""
                    )}
                </p>

                <div class="note-actions">

                    <button
                        data-note-edit="${note.id}">
                        Edit
                    </button>

                    <button
                        data-note-favorite="${note.id}">
                        ${note.favorite ? "★" : "☆"}
                    </button>

                    <button
                        data-note-pin="${note.id}">
                        ${note.pinned ? "Unpin" : "Pin"}
                    </button>

                    <button
                        data-note-delete="${note.id}">
                        Delete
                    </button>

                </div>
            </article>
        `).join("");

    container
        .querySelectorAll(
            "[data-note-edit]"
        )
        .forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    openNoteEditor(
                        button.dataset.noteEdit
                    );
                }
            );
        });

    container
        .querySelectorAll(
            "[data-note-favorite]"
        )
        .forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    toggleNoteFavorite(
                        button.dataset.noteFavorite
                    );
                }
            );
        });

    container
        .querySelectorAll(
            "[data-note-pin]"
        )
        .forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    toggleNotePinned(
                        button.dataset.notePin
                    );
                }
            );
        });

    container
        .querySelectorAll(
            "[data-note-delete]"
        )
        .forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    deleteNote(
                        button.dataset.noteDelete
                    );
                }
            );
        });
}

function openNoteEditor(noteId = null) {
    const title =
        prompt(
            "Note title:",
            noteId
                ? (
                    notes.find(
                        (n) => n.id === noteId
                    )?.title || ""
                )
                : ""
        );

    if (title === null) return;

    const existing =
        noteId
            ? notes.find(
                (n) => n.id === noteId
            )
            : null;

    const content =
        prompt(
            "Note content:",
            existing?.content || ""
        );

    if (content === null) return;

    try {
        if (noteId && window.LeoCalcBackend) {
            LeoCalcBackend.updateNote(
                noteId,
                {
                    title:
                        title || "Untitled Note",
                    content,
                    updatedAt: Date.now()
                }
            );
        } else if (window.LeoCalcBackend) {
            LeoCalcBackend.addNote({
                title:
                    title || "Untitled Note",
                content,
                mood: "default",
                color: "default",
                favorite: false,
                pinned: false,
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
        }

        loadBackendData();
        renderNotes();
        updateDashboard();
    } catch (error) {
        console.error(error);
    }
}

function toggleNoteFavorite(id) {
    if (!window.LeoCalcBackend) return;

    LeoCalcBackend.toggleNoteFavorite(id);

    loadBackendData();
    renderNotes();
}

function toggleNotePinned(id) {
    if (!window.LeoCalcBackend) return;

    LeoCalcBackend.toggleNotePinned(id);

    loadBackendData();
    renderNotes();
}

function deleteNote(id) {
    if (!confirm("Delete this note?")) {
        return;
    }

    if (window.LeoCalcBackend) {
        LeoCalcBackend.deleteNote(id);
    }

    loadBackendData();
    renderNotes();
    updateDashboard();
}

/* =========================================================
   HISTORY
   ========================================================= */

function setupHistory() {
    const clearButton =
        getElement("clearHistory");

    if (clearButton) {
        clearButton.addEventListener(
            "click",
            () => {
                if (
                    !confirm(
                        "Clear calculation history?"
                    )
                ) {
                    return;
                }

                if (window.LeoCalcBackend) {
                    LeoCalcBackend.clearHistory();
                }

                loadBackendData();
                renderHistory();
                updateDashboard();
            }
        );
    }
}

function renderHistory() {
    const container =
        getElement("historyList");

    if (!container) return;

    loadBackendData();

    if (!history.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No History</h3>
                <p>Your calculations will appear here.</p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        history.map((item) => `
            <div class="history-item">

                <div>
                    <small>
                        ${formatDate(
                            item.timestamp ||
                            item.createdAt
                        )}
                    </small>

                    <strong>
                        ${escapeHTML(
                            item.expression ||
                            ""
                        )}
                    </strong>

                    <span>
                        = ${escapeHTML(
                            item.result ||
                            ""
                        )}
                    </span>
                </div>

                <button
                    data-history-delete="${item.id}">
                    ×
                </button>

            </div>
        `).join("");

    container
        .querySelectorAll(
            "[data-history-delete]"
        )
        .forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    deleteHistoryItem(
                        button.dataset
                            .historyDelete
                    );
                }
            );
        });
}

function deleteHistoryItem(id) {
    if (window.LeoCalcBackend) {
        LeoCalcBackend.deleteHistory(id);
    }

    loadBackendData();
    renderHistory();
    updateDashboard();
}

/* =========================================================
   FAVORITES
   ========================================================= */

function setupFavorites() {
    renderFavorites();
}

function renderFavorites() {
    const container =
        getElement("favoritesList");

    if (!container) return;

    loadBackendData();

    if (!favorites.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Favorites</h3>
                <p>Save useful calculations here.</p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        favorites.map((item) => `
            <div class="favorite-item">

                <div>
                    <strong>
                        ${escapeHTML(
                            item.expression ||
                            ""
                        )}
                    </strong>

                    <span>
                        = ${escapeHTML(
                            item.result ||
                            ""
                        )}
                    </span>
                </div>

                <button
                    data-favorite-remove="${item.id}">
                    ★
                </button>

            </div>
        `).join("");

    container
        .querySelectorAll(
            "[data-favorite-remove]"
        )
        .forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    removeFavorite(
                        button.dataset
                            .favoriteRemove
                    );
                }
            );
        });
}

function removeFavorite(id) {
    if (window.LeoCalcBackend) {
        LeoCalcBackend.removeFavorite(id);
    }

    loadBackendData();
    renderFavorites();
    updateDashboard();
}

/* =========================================================
   SETTINGS
   ========================================================= */

function setupSettings() {
    const darkMode =
        getElement("darkModeToggle");

    if (darkMode) {
        darkMode.addEventListener(
            "change",
            () => {
                const enabled =
                    darkMode.checked;

                document.body.classList.toggle(
                    "dark-mode",
                    enabled
                );

                if (window.LeoCalcBackend) {
                    LeoCalcBackend.updateSettings({
                        darkMode: enabled
                    });
                }
            }
        );
    }

    const haptic =
        getElement("hapticToggle");

    if (haptic) {
        haptic.addEventListener(
            "change",
            () => {
                if (window.LeoCalcBackend) {
                    LeoCalcBackend.updateSettings({
                        haptic: haptic.checked
                    });
                }
            }
        );
    }

    const exportButton =
        getElement("exportHistory");

    if (exportButton) {
        exportButton.addEventListener(
            "click",
            exportAllData
        );
    }

    const clearButton =
        getElement("clearAllData");

    if (clearButton) {
        clearButton.addEventListener(
            "click",
            clearAllApplicationData
        );
    }
}

function applySavedSettings() {
    try {
        if (!window.LeoCalcBackend) return;

        const settings =
            LeoCalcBackend.getSettings();

        const darkMode =
            getElement("darkModeToggle");

        const haptic =
            getElement("hapticToggle");

        if (darkMode) {
            darkMode.checked =
                !!settings.darkMode;
        }

        if (haptic) {
            haptic.checked =
                !!settings.haptic;
        }

        document.body.classList.toggle(
            "dark-mode",
            !!settings.darkMode
        );
    } catch (error) {
        console.error(error);
    }
}

/* =========================================================
   EXPORT / CLEAR
   ========================================================= */

function exportAllData() {
    if (!window.LeoCalcBackend) {
        alert("Backend unavailable.");
        return;
    }

    const data =
        LeoCalcBackend.exportData();

    const blob =
        new Blob(
            [
                JSON.stringify(
                    data,
                    null,
                    2
                )
            ],
            {
                type: "application/json"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const anchor =
        document.createElement("a");

    anchor.href = url;
    anchor.download =
        `LeoCalc_Backup_${Date.now()}.json`;

    document.body.appendChild(anchor);

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(url);
}

function clearAllApplicationData() {
    if (
        !confirm(
            "This will clear all LeoCalc data. Continue?"
        )
    ) {
        return;
    }

    if (window.LeoCalcBackend) {
        LeoCalcBackend.clearAllData();
    } else {
        localStorage.clear();
    }

    history = [];
    favorites = [];
    notes = [];

    clearCalculator();

    renderHistory();
    renderFavorites();
    renderNotes();
    updateDashboard();

    alert("All data cleared.");
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {
    const calculations =
        getElement("totalCalculations");

    const favoriteCount =
        getElement("totalFavorites");

    const noteCount =
        getElement("totalNotes");

    if (
        window.LeoCalcBackend &&
        typeof LeoCalcBackend.getDashboardData ===
        "function"
    ) {
        const data =
            LeoCalcBackend.getDashboardData();

        if (calculations) {
            calculations.textContent =
                data.totalCalculations ?? 0;
        }

        if (favoriteCount) {
            favoriteCount.textContent =
                data.totalFavorites ?? 0;
        }

        if (noteCount) {
            noteCount.textContent =
                data.totalNotes ?? 0;
        }

        return;
    }

    if (calculations) {
        calculations.textContent =
            history.length;
    }

    if (favoriteCount) {
        favoriteCount.textContent =
            favorites.length;
    }

    if (noteCount) {
        noteCount.textContent =
            notes.length;
    }
}

/* =========================================================
   TIME / STOPWATCH
   ========================================================= */

function timeTool() {
    return `
        <div class="tool-form">

            <div id="liveClock"
                 class="live-clock">
                00:00:00
            </div>

            <button id="startStopwatch">
                Start
            </button>

            <button id="pauseStopwatch">
                Pause
            </button>

            <button id="resetStopwatch">
                Reset
            </button>

            <div id="stopwatchDisplay"
                 class="tool-result">
                00:00:00.000
            </div>

        </div>
    `;
}

function setupTimeTool() {
    updateLiveClock();

    setInterval(
        updateLiveClock,
        1000
    );

    const start =
        getElement("startStopwatch");

    const pause =
        getElement("pauseStopwatch");

    const reset =
        getElement("resetStopwatch");

    if (start) {
        start.addEventListener(
            "click",
            startStopwatch
        );
    }

    if (pause) {
        pause.addEventListener(
            "click",
            pauseStopwatch
        );
    }

    if (reset) {
        reset.addEventListener(
            "click",
            resetStopwatch
        );
    }
}

function updateLiveClock() {
    const clock =
        getElement("liveClock");

    if (!clock) return;

    clock.textContent =
        new Date().toLocaleTimeString(
            "en-IN"
        );
}

function startStopwatch() {
    if (stopwatchInterval) return;

    stopwatchStart =
        Date.now() - stopwatchElapsed;

    stopwatchInterval =
        setInterval(
            updateStopwatch,
            10
        );
}

function pauseStopwatch() {
    if (!stopwatchInterval) return;

    clearInterval(stopwatchInterval);

    stopwatchInterval = null;

    stopwatchElapsed =
        Date.now() - stopwatchStart;

    updateStopwatch();
}

function resetStopwatch() {
    if (stopwatchInterval) {
        clearInterval(
            stopwatchInterval
        );
    }

    stopwatchInterval = null;
    stopwatchStart = 0;
    stopwatchElapsed = 0;

    updateStopwatch();
}

function updateStopwatch() {
    let elapsed =
        stopwatchElapsed;

    if (stopwatchInterval) {
        elapsed =
            Date.now() -
            stopwatchStart;
    }

    const hours =
        Math.floor(
            elapsed / 3600000
        );

    const minutes =
        Math.floor(
            (elapsed % 3600000) /
            60000
        );

    const seconds =
        Math.floor(
            (elapsed % 60000) /
            1000
        );

    const milliseconds =
        elapsed % 1000;

    const display =
        getElement(
            "stopwatchDisplay"
        );

    if (!display) return;

    display.textContent =
        `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${String(milliseconds).padStart(3, "0")}`;
}

function pad(value) {
    return String(value).padStart(2, "0");
}

/* =========================================================
   WEATHER
   ========================================================= */

function weatherTool() {
    return `
        <div class="tool-form">

            <button id="getWeather">
                Get My Weather
            </button>

            <div id="weatherResult"
                 class="tool-result">
                Weather: —
            </div>

        </div>
    `;
}

function setupWeatherTool() {
    const button =
        getElement("getWeather");

    if (!button) return;

    button.addEventListener(
        "click",
        getWeather
    );
}

function getWeather() {
    const result =
        getElement("weatherResult");

    if (!result) return;

    if (!navigator.geolocation) {
        result.textContent =
            "Geolocation is not supported.";
        return;
    }

    result.textContent =
        "Getting location...";

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            try {
                const url =
                    "https://api.open-meteo.com/v1/forecast" +
                    `?latitude=${latitude}` +
                    `&longitude=${longitude}` +
                    "&current=temperature_2m,relative_humidity_2m,wind_speed_10m";

                const response =
                    await fetch(url);

                if (!response.ok) {
                    throw new Error(
                        "Weather request failed"
                    );
                }

                const data =
                    await response.json();

                const current =
                    data.current;

                result.innerHTML = `
                    Temperature:
                    ${current.temperature_2m}°C<br>

                    Humidity:
                    ${current.relative_humidity_2m}%<br>

                    Wind:
                    ${current.wind_speed_10m} km/h
                `;
            } catch (error) {
                console.error(error);

                result.textContent =
                    "Unable to load weather.";
            }
        },
        () => {
            result.textContent =
                "Location permission denied.";
        }
    );
}

/* =========================================================
   GLOBAL BUTTONS
   ========================================================= */

function setupGlobalButtons() {
    document.addEventListener(
        "keydown",
        (event) => {
            if (
                currentPage !==
                "calculator"
            ) {
                return;
            }

            const activeTag =
                document.activeElement?.tagName;

            if (
                activeTag === "INPUT" ||
                activeTag === "TEXTAREA"
            ) {
                return;
            }

            if (
                /^[0-9+\-*/().]$/.test(
                    event.key
                )
            ) {
                appendCalculatorValue(
                    event.key
                );
            }

            if (event.key === "Enter") {
                calculateExpression();
            }

            if (
                event.key === "Backspace"
            ) {
                deleteCalculatorCharacter();
            }

            if (event.key === "Escape") {
                clearCalculator();
            }
        }
    );
}

/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatDate(timestamp) {
    if (!timestamp) {
        return "No date";
    }

    let date;

    if (
        typeof timestamp === "object" &&
        timestamp.seconds
    ) {
        date =
            new Date(
                timestamp.seconds * 1000
            );
    } else {
        date =
            new Date(timestamp);
    }

    if (Number.isNaN(date.getTime())) {
        return "No date";
    }

    return date.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}

/* =========================================================
   HAPTIC FEEDBACK
   ========================================================= */

document.addEventListener(
    "click",
    (event) => {
        const button =
            event.target.closest(
                "button"
            );

        if (!button) return;

        try {
            const settings =
                window.LeoCalcBackend
                    ? LeoCalcBackend.getSettings()
                    : {};

            if (
                settings.haptic &&
                navigator.vibrate
            ) {
                navigator.vibrate(10);
            }
        } catch (error) {
            // Ignore vibration errors
        }
    }
);

/* =========================================================
   GLOBAL ESC KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    (event) => {
        if (event.key !== "Escape") return;

        closeMenu();
        closeToolModal();
    }
);

/* =========================================================
   PREVENT FORM SUBMIT RELOAD
   ========================================================= */

document.addEventListener(
    "submit",
    (event) => {
        event.preventDefault();
    }
);

/* =========================================================
   DEBUG
   ========================================================= */

console.log(
    "LeoCalc script.js loaded successfully."
);
