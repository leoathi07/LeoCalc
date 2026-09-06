/* =========================================================
   LEO CALC — COMPLETE SCRIPT.JS
   No Login
   Local Backend
   Mobile Friendly
   ========================================================= */

"use strict";


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let expression = "";
let currentResult = "0";
let currentPage = "home";
let currentTool = null;

let currentSettings = {
    darkMode: true,
    haptic: true
};


/* =========================================================
   SHORTCUTS
   ========================================================= */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => document.querySelectorAll(selector);


/* =========================================================
   SAFE BACKEND FALLBACK
   ========================================================= */

const DB = window.LeoCalcBackend || {

    getHistory() {
        return JSON.parse(
            localStorage.getItem("leocalc_history") || "[]"
        );
    },

    addHistory(item) {
        const data = this.getHistory();

        data.unshift({
            ...item,
            id: Date.now(),
            date: new Date().toISOString()
        });

        localStorage.setItem(
            "leocalc_history",
            JSON.stringify(data.slice(0, 500))
        );
    },

    clearHistory() {
        localStorage.removeItem("leocalc_history");
    },

    getFavorites() {
        return JSON.parse(
            localStorage.getItem("leocalc_favorites") || "[]"
        );
    },

    addFavorite(item) {
        const data = this.getFavorites();

        data.unshift({
            ...item,
            id: Date.now()
        });

        localStorage.setItem(
            "leocalc_favorites",
            JSON.stringify(data)
        );
    },

    removeFavorite(id) {
        const data = this.getFavorites()
            .filter(item => String(item.id) !== String(id));

        localStorage.setItem(
            "leocalc_favorites",
            JSON.stringify(data)
        );
    },

    getNotes() {
        return JSON.parse(
            localStorage.getItem("leocalc_notes") || "[]"
        );
    },

    addNote(note) {
        const data = this.getNotes();

        data.unshift({
            ...note,
            id: Date.now(),
            createdAt: new Date().toISOString()
        });

        localStorage.setItem(
            "leocalc_notes",
            JSON.stringify(data)
        );
    },

    deleteNote(id) {
        const data = this.getNotes()
            .filter(note => String(note.id) !== String(id));

        localStorage.setItem(
            "leocalc_notes",
            JSON.stringify(data)
        );
    },

    getSettings() {
        return JSON.parse(
            localStorage.getItem("leocalc_settings") ||
            '{"darkMode":true,"haptic":true}'
        );
    },

    updateSettings(settings) {
        localStorage.setItem(
            "leocalc_settings",
            JSON.stringify(settings)
        );
    },

    getStats() {
        return {
            calculations: this.getHistory().length,
            favorites: this.getFavorites().length,
            notes: this.getNotes().length
        };
    },

    clearAllData() {
        [
            "leocalc_history",
            "leocalc_favorites",
            "leocalc_notes",
            "leocalc_settings",
            "leocalc_stats"
        ].forEach(key => localStorage.removeItem(key));
    }
};


/* =========================================================
   INIT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeSettings();
    initializeSplash();
    initializeNavigation();
    initializeMenu();
    initializeCalculator();
    initializeTools();
    initializeNotes();
    initializeHistory();
    initializeFavorites();
    initializeSettingsControls();
    initializeGlobalButtons();

    updateDashboard();
    renderHistory();
    renderFavorites();
    renderNotes();

});


/* =========================================================
   SPLASH SCREEN
   ========================================================= */

function initializeSplash() {

    const splash = $("#splashScreen");
    const app = $("#app");
    const loadingBar = $("#loadingBar");
    const loadingText = $("#loadingText");

    if (!splash || !app) return;

    app.classList.add("app-hidden");

    let progress = 0;

    const timer = setInterval(() => {

        progress += Math.random() * 7 + 4;

        if (progress >= 100) {

            progress = 100;

            clearInterval(timer);

            if (loadingBar) {
                loadingBar.style.width = "100%";
            }

            if (loadingText) {
                loadingText.textContent = "Ready";
            }

            setTimeout(() => {

                splash.classList.add("hide");

                app.classList.remove("app-hidden");

                setTimeout(() => {
                    splash.remove();
                }, 700);

            }, 450);

            return;
        }

        if (loadingBar) {
            loadingBar.style.width = `${progress}%`;
        }

    }, 120);

}


/* =========================================================
   SETTINGS
   ========================================================= */

function initializeSettings() {

    try {
        currentSettings = {
            ...currentSettings,
            ...(DB.getSettings() || {})
        };
    } catch {
        currentSettings = {
            darkMode: true,
            haptic: true
        };
    }

    applySettings();
}


function applySettings() {

    document.documentElement.dataset.theme =
        currentSettings.darkMode ? "dark" : "light";

    document.body.classList.toggle(
        "light-mode",
        !currentSettings.darkMode
    );
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function initializeNavigation() {

    document.addEventListener("click", (event) => {

        const target = event.target.closest(
            "[data-page]"
        );

        if (!target) return;

        const page = target.dataset.page;

        if (!page) return;

        navigateTo(page);

    });

}


function navigateTo(page) {

    const pageElement = document.getElementById(page);

    if (!pageElement) return;

    currentPage = page;

    $$(".page").forEach(section => {
        section.classList.remove("active-page");
    });

    pageElement.classList.add("active-page");

    $$(".nav-item").forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.page === page
        );

    });

    $$(".menu-item").forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.page === page
        );

    });

    closeMenu();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (page === "history") {
        renderHistory();
    }

    if (page === "favorites") {
        renderFavorites();
    }

    if (page === "notes") {
        renderNotes();
    }

    if (page === "home") {
        updateDashboard();
    }

}


/* =========================================================
   SIDE MENU
   ========================================================= */

function initializeMenu() {

    const menuButton = $("#menuButton");
    const closeButton = $("#closeMenu");
    const overlay = $("#menuOverlay");

    if (menuButton) {
        menuButton.addEventListener(
            "click",
            openMenu
        );
    }

    if (closeButton) {
        closeButton.addEventListener(
            "click",
            closeMenu
        );
    }

    if (overlay) {
        overlay.addEventListener(
            "click",
            closeMenu
        );
    }

}


function openMenu() {

    $("#sideMenu")?.classList.add("active");
    $("#menuOverlay")?.classList.add("active");

}


function closeMenu() {

    $("#sideMenu")?.classList.remove("active");
    $("#menuOverlay")?.classList.remove("active");

}


/* =========================================================
   CALCULATOR
   ========================================================= */

function initializeCalculator() {

    $$(".calculator-tab").forEach(tab => {

        tab.addEventListener("click", () => {

            const target = tab.dataset.tab;

            $$(".calculator-tab").forEach(item => {
                item.classList.remove("active");
            });

            tab.classList.add("active");

            $$(".calculator-panel").forEach(panel => {
                panel.classList.remove("active");
            });

            const panel =
                document.getElementById(
                    `${target}Panel`
                );

            if (panel) {
                panel.classList.add("active");
            }

        });

    });


    $$(".calc-btn").forEach(button => {

        button.addEventListener("click", () => {

            haptic();

            const action = button.dataset.action;
            const value = button.dataset.value;

            if (action === "clear") {
                clearCalculator();
                return;
            }

            if (action === "backspace") {
                backspaceCalculator();
                return;
            }

            if (action === "calculate") {
                calculateExpression();
                return;
            }

            if (value !== undefined) {
                addCalculatorValue(value);
            }

        });

    });

}


/* =========================================================
   CALCULATOR INPUT
   ========================================================= */

function addCalculatorValue(value) {

    if (currentResult !== "0" &&
        expression === currentResult) {

        expression = "";
    }

    if (value === "π") {
        expression += "pi";
    }

    else if (value === "^2") {
        expression += "^2";
    }

    else if (value === "^3") {
        expression += "^3";
    }

    else if (value === "e") {
        expression += "e";
    }

    else {
        expression += value;
    }

    updateCalculatorDisplay();

}


function clearCalculator() {

    expression = "";
    currentResult = "0";

    updateCalculatorDisplay();

}


function backspaceCalculator() {

    expression = expression.slice(0, -1);

    if (!expression) {
        currentResult = "0";
    }

    updateCalculatorDisplay();

}


function updateCalculatorDisplay() {

    const expressionElement =
        $("#calculatorExpression");

    const resultElement =
        $("#calculatorResult");

    if (expressionElement) {
        expressionElement.textContent =
            expression || "";
    }

    if (resultElement) {
        resultElement.textContent =
            currentResult || "0";
    }

}


/* =========================================================
   CALCULATOR ENGINE
   ========================================================= */

function calculateExpression() {

    if (!expression.trim()) return;

    try {

        const originalExpression = expression;

        let exp = expression
            .replace(/π/g, "Math.PI")
            .replace(/\bpi\b/gi, "Math.PI")
            .replace(/\be\b/g, "Math.E")
            .replace(/sqrt\(/gi, "Math.sqrt(")
            .replace(/sin\(/gi, "Math.sin(toRad(")
            .replace(/cos\(/gi, "Math.cos(toRad(")
            .replace(/tan\(/gi, "Math.tan(toRad(")
            .replace(/log\(/gi, "Math.log10(")
            .replace(/ln\(/gi, "Math.log(");

        exp = convertPowers(exp);

        exp = exp.replace(
            /(\d+(?:\.\d+)?)%/g,
            "($1/100)"
        );

        /*
         * Only calculator-generated characters are accepted.
         * This prevents arbitrary JavaScript from being evaluated.
         */
        if (!/^[0-9+\-*/().,\s_a-zA-Z]+$/.test(exp)) {
            throw new Error("Invalid expression");
        }

        const result = Function(
            `"use strict";
             const toRad = x => x * Math.PI / 180;
             return (${exp});`
        )();

        if (
            typeof result !== "number" ||
            !Number.isFinite(result)
        ) {
            throw new Error("Invalid result");
        }

        currentResult = formatNumber(result);

        DB.addHistory({
            expression: originalExpression,
            result: currentResult,
            category: "Calculator"
        });

        updateCalculatorDisplay();
        updateDashboard();

    }

    catch (error) {

        currentResult = "Error";

        updateCalculatorDisplay();

        setTimeout(() => {

            currentResult = "0";
            updateCalculatorDisplay();

        }, 1200);

    }

}


function convertPowers(exp) {

    /*
     * Converts simple:
     * 2^3
     * 5^2
     */

    return exp.replace(
        /(\([^()]+\)|\d+(?:\.\d+)?)\^(\([^()]+\)|\d+(?:\.\d+)?)/g,
        "Math.pow($1,$2)"
    );

}


function formatNumber(number) {

    if (Number.isInteger(number)) {
        return String(number);
    }

    return Number(
        number.toFixed(10)
    ).toString();

}


/* =========================================================
   TOOLS
   ========================================================= */

function initializeTools() {

    $$(".tool-card").forEach(card => {

        card.addEventListener("click", () => {

            haptic();

            openTool(
                card.dataset.tool
            );

        });

    });

    $("#closeToolModal")?.addEventListener(
        "click",
        closeToolModal
    );

    $(".modal-backdrop")?.addEventListener(
        "click",
        closeToolModal
    );

}


/* =========================================================
   OPEN TOOL
   ========================================================= */

function openTool(tool) {

    const modal = $("#toolModal");
    const title = $("#toolModalTitle");
    const body = $("#toolModalBody");

    if (!modal || !title || !body) return;

    currentTool = tool;

    const data = getToolContent(tool);

    title.textContent = data.title;
    body.innerHTML = data.html;

    modal.classList.add("active");

    attachToolEvents(tool);

}


function closeToolModal() {

    $("#toolModal")?.classList.remove("active");

    currentTool = null;

}


/* =========================================================
   TOOL CONTENT
   ========================================================= */

function getToolContent(tool) {

    const tools = {

        percentage: {
            title: "Percentage Calculator",

            html: `
                <label>Value</label>
                <input id="percentValue"
                       type="number"
                       inputmode="decimal"
                       placeholder="Enter value">

                <label>Percentage (%)</label>
                <input id="percentRate"
                       type="number"
                       inputmode="decimal"
                       placeholder="Enter percentage">

                <button id="calculatePercentage">
                    Calculate
                </button>

                <div id="percentageResult"
                     class="tool-result">
                    Enter values and calculate.
                </div>
            `
        },


        interest: {
            title: "Simple Interest",

            html: `
                <label>Principal</label>
                <input id="interestPrincipal"
                       type="number"
                       inputmode="decimal"
                       placeholder="Principal amount">

                <label>Rate (%)</label>
                <input id="interestRate"
                       type="number"
                       inputmode="decimal"
                       placeholder="Interest rate">

                <label>Time (years)</label>
                <input id="interestTime"
                       type="number"
                       inputmode="decimal"
                       placeholder="Years">

                <button id="calculateInterest">
                    Calculate
                </button>

                <div id="interestResult"
                     class="tool-result">
                    Enter values and calculate.
                </div>
            `
        },


        emi: {
            title: "EMI Calculator",

            html: `
                <label>Loan Amount</label>
                <input id="emiPrincipal"
                       type="number"
                       inputmode="decimal"
                       placeholder="Loan amount">

                <label>Annual Interest Rate (%)</label>
                <input id="emiRate"
                       type="number"
                       inputmode="decimal"
                       placeholder="Annual rate">

                <label>Loan Period (Years)</label>
                <input id="emiYears"
                       type="number"
                       inputmode="decimal"
                       placeholder="Years">

                <button id="calculateEMI">
                    Calculate EMI
                </button>

                <div id="emiResult"
                     class="tool-result">
                    Enter loan details.
                </div>
            `
        },


        bmi: {
            title: "BMI Calculator",

            html: `
                <label>Weight (kg)</label>
                <input id="bmiWeight"
                       type="number"
                       inputmode="decimal"
                       placeholder="Weight">

                <label>Height (cm)</label>
                <input id="bmiHeight"
                       type="number"
                       inputmode="decimal"
                       placeholder="Height">

                <button id="calculateBMI">
                    Calculate BMI
                </button>

                <div id="bmiResult"
                     class="tool-result">
                    Enter your measurements.
                </div>
            `
        },


        resistor: {
            title: "Resistor Calculator",

            html: `
                <label>Resistance</label>
                <input id="resistanceValue"
                       type="number"
                       inputmode="decimal"
                       placeholder="Resistance">

                <select id="resistanceUnit">
                    <option value="ohm">Ω Ohm</option>
                    <option value="kohm">kΩ Kilo Ohm</option>
                    <option value="Mohm">MΩ Mega Ohm</option>
                </select>

                <label>Current (A)</label>
                <input id="resistanceCurrent"
                       type="number"
                       inputmode="decimal"
                       placeholder="Current">

                <button id="calculateResistor">
                    Calculate
                </button>

                <div id="resistorResult"
                     class="tool-result">
                    Enter resistance and current.
                </div>
            `
        },


        frequency: {
            title: "Frequency Calculator",

            html: `
                <label>Time Period (seconds)</label>
                <input id="frequencyTime"
                       type="number"
                       inputmode="decimal"
                       placeholder="Time period">

                <button id="calculateFrequency">
                    Calculate Frequency
                </button>

                <div id="frequencyResult"
                     class="tool-result">
                    Frequency = 1 / Time Period
                </div>
            `
        },


        converter: {
            title: "Unit Converter",

            html: `
                <label>Conversion Type</label>

                <select id="converterType">
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

                <label>From</label>

                <select id="converterFrom">
                </select>

                <label>To</label>

                <select id="converterTo">
                </select>

                <label>Value</label>

                <input id="converterValue"
                       type="number"
                       inputmode="decimal"
                       placeholder="Enter value">

                <button id="convertUnit">
                    Convert
                </button>

                <div id="converterResult"
                     class="tool-result">
                    Enter a value.
                </div>
            `
        },


        money: {
            title: "Money Calculator",

            html: `
                <label>Amount</label>

                <input id="moneyAmount"
                       type="number"
                       inputmode="decimal"
                       placeholder="Amount">

                <label>Percentage (%)</label>

                <input id="moneyPercentage"
                       type="number"
                       inputmode="decimal"
                       placeholder="Percentage">

                <button id="moneyAdd">
                    Add Percentage
                </button>

                <button id="moneyRemove">
                    Remove Percentage
                </button>

                <div id="moneyResult"
                     class="tool-result">
                    Enter amount and percentage.
                </div>
            `
        },


        statistics: {
            title: "Statistics Calculator",

            html: `
                <label>Numbers</label>

                <textarea
                    id="statisticsNumbers"
                    placeholder="Example: 10, 20, 30, 40"></textarea>

                <button id="calculateStatistics">
                    Calculate Statistics
                </button>

                <div id="statisticsResult"
                     class="tool-result">
                    Enter numbers separated by commas.
                </div>
            `
        },


        numberSystem: {
            title: "Number System Converter",

            html: `
                <label>Number</label>

                <input id="numberSystemValue"
                       type="text"
                       inputmode="text"
                       placeholder="Enter number">

                <label>From</label>

                <select id="numberSystemFrom">
                    <option value="2">Binary</option>
                    <option value="8">Octal</option>
                    <option value="10" selected>Decimal</option>
                    <option value="16">Hexadecimal</option>
                </select>

                <label>To</label>

                <select id="numberSystemTo">
                    <option value="2">Binary</option>
                    <option value="8">Octal</option>
                    <option value="10">Decimal</option>
                    <option value="16" selected>Hexadecimal</option>
                </select>

                <button id="convertNumberSystem">
                    Convert
                </button>

                <div id="numberSystemResult"
                     class="tool-result">
                    Enter a number.
                </div>
            `
        },


        password: {
            title: "Password Generator",

            html: `
                <label>Password Length</label>

                <input id="passwordLength"
                       type="number"
                       min="4"
                       max="64"
                       value="16">

                <button id="generatePassword">
                    Generate Password
                </button>

                <div id="passwordResult"
                     class="tool-result">
                    Click generate.
                </div>
            `
        }

    };

    return tools[tool] || {
        title: "Tool",
        html: `
            <div class="tool-result">
                Tool not available.
            </div>
        `
    };

}


/* =========================================================
   TOOL EVENTS
   ========================================================= */

function attachToolEvents(tool) {

    if (tool === "percentage") {
        $("#calculatePercentage")?.addEventListener(
            "click",
            calculatePercentage
        );
    }

    if (tool === "interest") {
        $("#calculateInterest")?.addEventListener(
            "click",
            calculateInterest
        );
    }

    if (tool === "emi") {
        $("#calculateEMI")?.addEventListener(
            "click",
            calculateEMI
        );
    }

    if (tool === "bmi") {
        $("#calculateBMI")?.addEventListener(
            "click",
            calculateBMI
        );
    }

    if (tool === "resistor") {
        $("#calculateResistor")?.addEventListener(
            "click",
            calculateResistor
        );
    }

    if (tool === "frequency") {
        $("#calculateFrequency")?.addEventListener(
            "click",
            calculateFrequency
        );
    }

    if (tool === "converter") {

        setupConverter();

        $("#converterType")?.addEventListener(
            "change",
            setupConverter
        );

        $("#convertUnit")?.addEventListener(
            "click",
            convertUnit
        );
    }

    if (tool === "money") {

        $("#moneyAdd")?.addEventListener(
            "click",
            () => calculateMoney("add")
        );

        $("#moneyRemove")?.addEventListener(
            "click",
            () => calculateMoney("remove")
        );
    }

    if (tool === "statistics") {
        $("#calculateStatistics")?.addEventListener(
            "click",
            calculateStatistics
        );
    }

    if (tool === "numberSystem") {
        $("#convertNumberSystem")?.addEventListener(
            "click",
            convertNumberSystem
        );
    }

    if (tool === "password") {
        $("#generatePassword")?.addEventListener(
            "click",
            generatePassword
        );
    }

}


/* =========================================================
   PERCENTAGE
   ========================================================= */

function calculatePercentage() {

    const value =
        Number($("#percentValue")?.value);

    const rate =
        Number($("#percentRate")?.value);

    const output =
        $("#percentageResult");

    if (!Number.isFinite(value) ||
        !Number.isFinite(rate)) {

        output.textContent =
            "Please enter valid values.";

        return;
    }

    const result = value * rate / 100;

    output.innerHTML =
        `<strong>${formatNumber(result)}</strong>`;

    saveToolHistory(
        `${rate}% of ${value}`,
        formatNumber(result),
        "Percentage"
    );

}


/* =========================================================
   SIMPLE INTEREST
   ========================================================= */

function calculateInterest() {

    const principal =
        Number($("#interestPrincipal")?.value);

    const rate =
        Number($("#interestRate")?.value);

    const time =
        Number($("#interestTime")?.value);

    const output =
        $("#interestResult");

    if (
        !Number.isFinite(principal) ||
        !Number.isFinite(rate) ||
        !Number.isFinite(time)
    ) {
        output.textContent =
            "Please enter valid values.";
        return;
    }

    const interest =
        principal * rate * time / 100;

    const total =
        principal + interest;

    output.innerHTML = `
        Interest:
        <strong>${formatNumber(interest)}</strong>
        <br>
        Total:
        <strong>${formatNumber(total)}</strong>
    `;

    saveToolHistory(
        `SI: ${principal}, ${rate}%, ${time} years`,
        formatNumber(interest),
        "Interest"
    );

}


/* =========================================================
   EMI
   ========================================================= */

function calculateEMI() {

    const principal =
        Number($("#emiPrincipal")?.value);

    const annualRate =
        Number($("#emiRate")?.value);

    const years =
        Number($("#emiYears")?.value);

    const output =
        $("#emiResult");

    if (
        !Number.isFinite(principal) ||
        !Number.isFinite(annualRate) ||
        !Number.isFinite(years) ||
        principal <= 0 ||
        years <= 0
    ) {
        output.textContent =
            "Please enter valid loan details.";
        return;
    }

    const months = years * 12;

    const monthlyRate =
        annualRate / 12 / 100;

    let emi;

    if (monthlyRate === 0) {

        emi = principal / months;

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

    const totalPayment =
        emi * months;

    const totalInterest =
        totalPayment - principal;

    output.innerHTML = `
        Monthly EMI:
        <strong>${formatNumber(emi)}</strong>
        <br>
        Total Interest:
        <strong>${formatNumber(totalInterest)}</strong>
        <br>
        Total Payment:
        <strong>${formatNumber(totalPayment)}</strong>
    `;

    saveToolHistory(
        `EMI ${principal}`,
        formatNumber(emi),
        "EMI"
    );

}


/* =========================================================
   BMI
   ========================================================= */

function calculateBMI() {

    const weight =
        Number($("#bmiWeight")?.value);

    const heightCm =
        Number($("#bmiHeight")?.value);

    const output =
        $("#bmiResult");

    if (
        !Number.isFinite(weight) ||
        !Number.isFinite(heightCm) ||
        weight <= 0 ||
        heightCm <= 0
    ) {
        output.textContent =
            "Please enter valid values.";
        return;
    }

    const height =
        heightCm / 100;

    const bmi =
        weight / (height * height);

    let category = "Calculated";

    if (bmi < 18.5) {
        category = "Below standard range";
    } else if (bmi < 25) {
        category = "Standard range";
    } else if (bmi < 30) {
        category = "Above standard range";
    } else {
        category = "High range";
    }

    output.innerHTML = `
        BMI:
        <strong>${bmi.toFixed(2)}</strong>
        <br>
        Category:
        <strong>${category}</strong>
    `;

}


/* =========================================================
   RESISTOR
   ========================================================= */

function calculateResistor() {

    let resistance =
        Number($("#resistanceValue")?.value);

    const unit =
        $("#resistanceUnit")?.value;

    const current =
        Number($("#resistanceCurrent")?.value);

    const output =
        $("#resistorResult");

    if (
        !Number.isFinite(resistance) ||
        !Number.isFinite(current)
    ) {
        output.textContent =
            "Please enter valid values.";
        return;
    }

    if (unit === "kohm") {
        resistance *= 1000;
    }

    if (unit === "Mohm") {
        resistance *= 1000000;
    }

    const voltage =
        resistance * current;

    const power =
        voltage * current;

    output.innerHTML = `
        Resistance:
        <strong>${formatNumber(resistance)} Ω</strong>
        <br>
        Voltage:
        <strong>${formatNumber(voltage)} V</strong>
        <br>
        Power:
        <strong>${formatNumber(power)} W</strong>
    `;

}


/* =========================================================
   FREQUENCY
   ========================================================= */

function calculateFrequency() {

    const time =
        Number($("#frequencyTime")?.value);

    const output =
        $("#frequencyResult");

    if (
        !Number.isFinite(time) ||
        time <= 0
    ) {
        output.textContent =
            "Enter a valid time period.";
        return;
    }

    const frequency = 1 / time;

    output.innerHTML = `
        Frequency:
        <strong>${formatNumber(frequency)} Hz</strong>
    `;

    saveToolHistory(
        `Frequency: T=${time}`,
        `${formatNumber(frequency)} Hz`,
        "Frequency"
    );

}


/* =========================================================
   CONVERTER
   ========================================================= */

function setupConverter() {

    const type =
        $("#converterType")?.value;

    const from =
        $("#converterFrom");

    const to =
        $("#converterTo");

    if (!from || !to) return;

    const units = {

        length: [
            ["m", "Meter"],
            ["km", "Kilometer"],
            ["cm", "Centimeter"],
            ["mm", "Millimeter"],
            ["ft", "Feet"],
            ["in", "Inch"]
        ],

        weight: [
            ["kg", "Kilogram"],
            ["g", "Gram"],
            ["mg", "Milligram"],
            ["lb", "Pound"]
        ],

        temperature: [
            ["c", "Celsius"],
            ["f", "Fahrenheit"],
            ["k", "Kelvin"]
        ]

    };

    const list =
        units[type] || units.length;

    from.innerHTML = "";
    to.innerHTML = "";

    list.forEach(([value, label]) => {

        from.innerHTML +=
            `<option value="${value}">
                ${label}
             </option>`;

        to.innerHTML +=
            `<option value="${value}">
                ${label}
             </option>`;

    });

    if (list.length > 1) {
        to.selectedIndex = 1;
    }

}


function convertUnit() {

    const type =
        $("#converterType")?.value;

    const from =
        $("#converterFrom")?.value;

    const to =
        $("#converterTo")?.value;

    const value =
        Number($("#converterValue")?.value);

    const output =
        $("#converterResult");

    if (!Number.isFinite(value)) {

        output.textContent =
            "Please enter a valid value.";

        return;
    }

    let result;

    if (type === "length") {

        const meter = {
            m: 1,
            km: 1000,
            cm: .01,
            mm: .001,
            ft: .3048,
            in: .0254
        };

        result =
            value *
            meter[from] /
            meter[to];

    }

    else if (type === "weight") {

        const kg = {
            kg: 1,
            g: .001,
            mg: .000001,
            lb: .45359237
        };

        result =
            value *
            kg[from] /
            kg[to];

    }

    else {

        result =
            convertTemperature(
                value,
                from,
                to
            );

    }

    output.innerHTML =
        `<strong>${formatNumber(result)}</strong>`;

    saveToolHistory(
        `${value} ${from} → ${to}`,
        formatNumber(result),
        "Converter"
    );

}


function convertTemperature(value, from, to) {

    if (from === to) return value;

    let celsius;

    if (from === "c") {
        celsius = value;
    }

    else if (from === "f") {
        celsius =
            (value - 32) * 5 / 9;
    }

    else {
        celsius =
            value - 273.15;
    }

    if (to === "c") {
        return celsius;
    }

    if (to === "f") {
        return celsius * 9 / 5 + 32;
    }

    return celsius + 273.15;

}


/* =========================================================
   MONEY
   ========================================================= */

function calculateMoney(mode) {

    const amount =
        Number($("#moneyAmount")?.value);

    const percentage =
        Number($("#moneyPercentage")?.value);

    const output =
        $("#moneyResult");

    if (
        !Number.isFinite(amount) ||
        !Number.isFinite(percentage)
    ) {
        output.textContent =
            "Please enter valid values.";
        return;
    }

    const change =
        amount * percentage / 100;

    const result =
        mode === "add"
            ? amount + change
            : amount - change;

    output.innerHTML = `
        Original:
        <strong>${formatNumber(amount)}</strong>
        <br>
        Change:
        <strong>${formatNumber(change)}</strong>
        <br>
        Result:
        <strong>${formatNumber(result)}</strong>
    `;

}


/* =========================================================
   STATISTICS
   ========================================================= */

function calculateStatistics() {

    const text =
        $("#statisticsNumbers")?.value || "";

    const output =
        $("#statisticsResult");

    const numbers =
        text
            .split(/[,;\s]+/)
            .map(Number)
            .filter(Number.isFinite);

    if (!numbers.length) {

        output.textContent =
            "Enter valid numbers.";

        return;
    }

    const sorted =
        [...numbers].sort((a, b) => a - b);

    const sum =
        numbers.reduce(
            (total, value) => total + value,
            0
        );

    const mean =
        sum / numbers.length;

    const median =
        sorted.length % 2
            ? sorted[Math.floor(sorted.length / 2)]
            : (
                sorted[sorted.length / 2 - 1] +
                sorted[sorted.length / 2]
            ) / 2;

    const min =
        Math.min(...numbers);

    const max =
        Math.max(...numbers);

    output.innerHTML = `
        Count:
        <strong>${numbers.length}</strong>
        <br>
        Sum:
        <strong>${formatNumber(sum)}</strong>
        <br>
        Mean:
        <strong>${formatNumber(mean)}</strong>
        <br>
        Median:
        <strong>${formatNumber(median)}</strong>
        <br>
        Minimum:
        <strong>${formatNumber(min)}</strong>
        <br>
        Maximum:
        <strong>${formatNumber(max)}</strong>
    `;

}


/* =========================================================
   NUMBER SYSTEM
   ========================================================= */

function convertNumberSystem() {

    const value =
        ($("#numberSystemValue")?.value || "")
        .trim();

    const from =
        Number($("#numberSystemFrom")?.value);

    const to =
        Number($("#numberSystemTo")?.value);

    const output =
        $("#numberSystemResult");

    if (!value) {

        output.textContent =
            "Enter a number.";

        return;
    }

    try {

        const decimal =
            parseInt(value, from);

        if (
            Number.isNaN(decimal) ||
            !isValidNumberForBase(value, from)
        ) {
            throw new Error();
        }

        const result =
            decimal.toString(to).toUpperCase();

        output.innerHTML = `
            Result:
            <strong>${result}</strong>
        `;

    }

    catch {

        output.textContent =
            "Invalid number for selected base.";

    }

}


function isValidNumberForBase(value, base) {

    const patterns = {
        2: /^[01]+$/,
        8: /^[0-7]+$/,
        10: /^[0-9]+$/,
        16: /^[0-9a-fA-F]+$/
    };

    return patterns[base]
        ? patterns[base].test(value)
        : false;

}


/* =========================================================
   PASSWORD GENERATOR
   ========================================================= */

function generatePassword() {

    const lengthInput =
        Number($("#passwordLength")?.value);

    const output =
        $("#passwordResult");

    let length =
        Math.floor(lengthInput);

    if (!Number.isFinite(length)) {
        length = 16;
    }

    length =
        Math.max(
            4,
            Math.min(64, length)
        );

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ" +
        "abcdefghijkmnopqrstuvwxyz" +
        "23456789" +
        "!@#$%^&*";

    let password = "";

    const randomArray =
        new Uint32Array(length);

    crypto.getRandomValues(randomArray);

    randomArray.forEach(number => {

        password +=
            characters[
                number % characters.length
            ];

    });

    output.innerHTML = `
        <div style="
            word-break:break-all;
            font-size:18px;
            font-weight:800;
        ">
            ${escapeHTML(password)}
        </div>

        <button id="copyGeneratedPassword">
            Copy Password
        </button>
    `;

    $("#copyGeneratedPassword")
        ?.addEventListener(
            "click",
            async () => {

                try {

                    await navigator.clipboard.writeText(
                        password
                    );

                    $("#copyGeneratedPassword")
                        .textContent =
                        "Copied ✓";

                }

                catch {

                    $("#copyGeneratedPassword")
                        .textContent =
                        "Copy unavailable";

                }

            }
        );

}


/* =========================================================
   TOOL HISTORY
   ========================================================= */

function saveToolHistory(
    calculation,
    result,
    category
) {

    DB.addHistory({
        expression: calculation,
        result,
        category
    });

    updateDashboard();

}


/* =========================================================
   HISTORY
   ========================================================= */

function initializeHistory() {

    $("#clearHistory")?.addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "Clear all calculation history?"
                );

            if (!confirmed) return;

            if (DB.clearHistory) {
                DB.clearHistory();
            }

            renderHistory();
            updateDashboard();

        }
    );

}


function renderHistory() {

    const container =
        $("#historyList");

    if (!container) return;

    const history =
        DB.getHistory() || [];

    if (!history.length) {

        container.innerHTML = `
            <div class="empty-state">
                <span>🕘</span>
                <h3>No History</h3>
                <p>
                    Your calculations will appear here.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        history.map(item => {

            const expression =
                escapeHTML(
                    item.expression || "Calculation"
                );

            const result =
                escapeHTML(
                    String(item.result ?? "")
                );

            const date =
                formatDate(
                    item.date ||
                    item.createdAt ||
                    item.timestamp
                );

            return `
                <div class="history-card">

                    <div class="history-expression">
                        ${expression}
                    </div>

                    <div class="history-result">
                        = ${result}
                    </div>

                    <small>
                        ${escapeHTML(
                            item.category || "Calculator"
                        )}
                        ${date ? " • " + date : ""}
                    </small>

                </div>
            `;

        }).join("");

}


/* =========================================================
   FAVORITES
   ========================================================= */

function initializeFavorites() {
    renderFavorites();
}


function renderFavorites() {

    const container =
        $("#favoritesList");

    if (!container) return;

    const favorites =
        DB.getFavorites() || [];

    if (!favorites.length) {

        container.innerHTML = `
            <div class="empty-state">
                <span>⭐</span>
                <h3>No Favorites</h3>
                <p>
                    Your saved calculations
                    will appear here.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        favorites.map(item => {

            return `
                <div class="history-card">

                    <div class="history-expression">
                        ${escapeHTML(
                            item.expression || ""
                        )}
                    </div>

                    <div class="history-result">
                        = ${escapeHTML(
                            String(item.result ?? "")
                        )}
                    </div>

                    <div class="note-actions">

                        <button
                            data-remove-favorite="${item.id}">
                            Remove
                        </button>

                    </div>

                </div>
            `;

        }).join("");

    container
        .querySelectorAll(
            "[data-remove-favorite]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    DB.removeFavorite(
                        button.dataset.removeFavorite
                    );

                    renderFavorites();
                    updateDashboard();

                }
            );

        });

}


/* =========================================================
   NOTES
   ========================================================= */

function initializeNotes() {

    $("#addNoteButton")?.addEventListener(
        "click",
        createNote
    );

    $("#notesSearch")?.addEventListener(
        "input",
        renderNotes
    );

}


function createNote() {

    const title =
        prompt("Note title:");

    if (title === null) return;

    const cleanTitle =
        title.trim();

    if (!cleanTitle) return;

    const content =
        prompt("Write your note:");

    if (content === null) return;

    DB.addNote({
        title: cleanTitle,
        content: content.trim(),
        favorite: false,
        pinned: false
    });

    renderNotes();
    updateDashboard();

}


function renderNotes() {

    const container =
        $("#notesList");

    if (!container) return;

    const search =
        ($("#notesSearch")?.value || "")
        .trim()
        .toLowerCase();

    const notes =
        (DB.getNotes() || [])
        .filter(note => {

            if (!search) return true;

            return (
                String(note.title || "")
                    .toLowerCase()
                    .includes(search) ||

                String(note.content || "")
                    .toLowerCase()
                    .includes(search)
            );

        });

    if (!notes.length) {

        container.innerHTML = `
            <div class="empty-state">
                <span>📝</span>
                <h3>No Notes</h3>
                <p>Create your first note.</p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        notes.map(note => {

            return `
                <article class="note-card">

                    <h3>
                        ${escapeHTML(
                            note.title || "Untitled"
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            note.content || ""
                        )}
                    </p>

                    <div class="note-actions">

                        <button
                            data-delete-note="${note.id}">
                            Delete
                        </button>

                    </div>

                </article>
            `;

        }).join("");

    container
        .querySelectorAll(
            "[data-delete-note]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    DB.deleteNote(
                        button.dataset.deleteNote
                    );

                    renderNotes();
                    updateDashboard();

                }
            );

        });

}


/* =========================================================
   SETTINGS CONTROLS
   ========================================================= */

function initializeSettingsControls() {

    const darkMode =
        $("#darkModeToggle");

    const hapticToggle =
        $("#hapticToggle");

    if (darkMode) {

        darkMode.checked =
            !!currentSettings.darkMode;

        darkMode.addEventListener(
            "change",
            () => {

                currentSettings.darkMode =
                    darkMode.checked;

                DB.updateSettings(
                    currentSettings
                );

                applySettings();

            }
        );

    }

    if (hapticToggle) {

        hapticToggle.checked =
            !!currentSettings.haptic;

        hapticToggle.addEventListener(
            "change",
            () => {

                currentSettings.haptic =
                    hapticToggle.checked;

                DB.updateSettings(
                    currentSettings
                );

            }
        );

    }

}


/* =========================================================
   EXPORT DATA
   ========================================================= */

function initializeGlobalButtons() {

    $("#exportHistory")?.addEventListener(
        "click",
        exportData
    );

    $("#clearAllData")?.addEventListener(
        "click",
        clearAllData
    );

    $("#globalSearchButton")?.addEventListener(
        "click",
        () => {

            const query =
                prompt(
                    "What do you want to search?"
                );

            if (!query) return;

            const q =
                query.toLowerCase();

            const history =
                DB.getHistory() || [];

            const matches =
                history.filter(item =>
                    String(item.expression || "")
                        .toLowerCase()
                        .includes(q)
                );

            navigateTo("history");

            const container =
                $("#historyList");

            if (!container) return;

            if (!matches.length) {

                container.innerHTML = `
                    <div class="empty-state">
                        <span>🔎</span>
                        <h3>No Results</h3>
                        <p>
                            Nothing matched "${escapeHTML(query)}"
                        </p>
                    </div>
                `;

                return;
            }

            container.innerHTML =
                matches.map(item => `
                    <div class="history-card">

                        <div class="history-expression">
                            ${escapeHTML(
                                item.expression || ""
                            )}
                        </div>

                        <div class="history-result">
                            = ${escapeHTML(
                                String(item.result ?? "")
                            )}
                        </div>

                    </div>
                `).join("");

        }
    );

}


function exportData() {

    const data = {

        exportedAt:
            new Date().toISOString(),

        history:
            DB.getHistory(),

        favorites:
            DB.getFavorites(),

        notes:
            DB.getNotes(),

        settings:
            DB.getSettings()

    };

    const blob =
        new Blob(
            [JSON.stringify(data, null, 2)],
            {
                type: "application/json"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        `LeoCalc_Backup_${Date.now()}.json`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

}


/* =========================================================
   CLEAR ALL DATA
   ========================================================= */

function clearAllData() {

    const confirmed =
        confirm(
            "This will delete history, favorites and notes. Continue?"
        );

    if (!confirmed) return;

    DB.clearAllData();

    currentSettings = {
        darkMode: true,
        haptic: true
    };

    DB.updateSettings(
        currentSettings
    );

    renderHistory();
    renderFavorites();
    renderNotes();
    updateDashboard();

    applySettings();

    alert("LeoCalc data cleared.");

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    const stats =
        DB.getStats
            ? DB.getStats()
            : {
                calculations:
                    DB.getHistory().length,

                favorites:
                    DB.getFavorites().length,

                notes:
                    DB.getNotes().length
            };

    const calculations =
        $("#totalCalculations");

    const favorites =
        $("#totalFavorites");

    const notes =
        $("#totalNotes");

    if (calculations) {
        calculations.textContent =
            stats.calculations || 0;
    }

    if (favorites) {
        favorites.textContent =
            stats.favorites || 0;
    }

    if (notes) {
        notes.textContent =
            stats.notes || 0;
    }

}


/* =========================================================
   HAPTIC
   ========================================================= */

function haptic() {

    if (!currentSettings.haptic) return;

    if (
        "vibrate" in navigator
    ) {
        navigator.vibrate(8);
    }

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   DATE
   ========================================================= */

function formatDate(value) {

    if (!value) return "";

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    return date.toLocaleString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   KEYBOARD SUPPORT
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeMenu();
            closeToolModal();

        }

        if (
            event.key === "Enter" &&
            currentPage === "calculator"
        ) {

            calculateExpression();

        }

        if (
            event.key === "Backspace" &&
            currentPage === "calculator"
        ) {

            if (
                document.activeElement?.tagName !==
                "INPUT"
            ) {
                backspaceCalculator();
            }

        }

    }
);


/* =========================================================
   PREVENT DOUBLE TAP ZOOM
========================================================= */

let lastTouchEnd = 0;

document.addEventListener(
    "touchend",
    event => {

        const now =
            Date.now();

        if (
            now - lastTouchEnd <= 300
        ) {
            event.preventDefault();
        }

        lastTouchEnd = now;

    },
    {
        passive: false
    }
);


/* =========================================================
   END
========================================================= */
