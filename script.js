/* =========================================================
   LEO CALC — COMPLETE UPDATED SCRIPT.JS
   All-in-One Engineering Calculator
   Version 2.0
========================================================= */

"use strict";

/* =========================================================
   GLOBAL STATE
========================================================= */

let expression = "";
let answer = 0;
let angleModeValue = "DEG";

let calculationHistory =
    JSON.parse(localStorage.getItem("leoCalcHistory") || "[]");

let savedNotes =
    JSON.parse(localStorage.getItem("leoCalcNotes") || "[]");

let stopwatchInterval = null;
let stopwatchSeconds = 0;

let bigClockInterval = null;
let mainClockInterval = null;

let touchStartX = 0;

window.leoWeatherData = null;


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadTheme();

    startSplash();

    startClock();

    loadHistory();

    loadNotes();

    getWeather();

    setupKeyboard();

    setupMobileViewport();

    console.log("LeoCalc initialized successfully 🚀");
});


/* =========================================================
   SPLASH SCREEN
========================================================= */

function startSplash() {

    const splash = document.getElementById("splashScreen");
    const main = document.getElementById("mainApp");
    const progress = document.getElementById("progressBar");
    const percent = document.getElementById("loadingPercent");
    const text = document.getElementById("loadingText");

    if (!splash || !main) return;

    let value = 0;

    const messages = [
        "Initializing LeoCalc...",
        "Loading Engineering Engine...",
        "Loading Scientific Functions...",
        "Preparing Smart Tools...",
        "Connecting Weather...",
        "Almost Ready..."
    ];

    const timer = setInterval(() => {

        value += Math.floor(Math.random() * 5) + 2;

        if (value > 100) value = 100;

        if (progress) {
            progress.style.width = value + "%";
        }

        if (percent) {
            percent.textContent = value + "%";
        }

        if (text) {

            const index = Math.min(
                messages.length - 1,
                Math.floor(value / 18)
            );

            text.textContent = messages[index];
        }

        if (value >= 100) {

            clearInterval(timer);

            setTimeout(() => {

                splash.style.opacity = "0";
                splash.style.visibility = "hidden";
                main.classList.remove("hidden");

            }, 450);
        }

    }, 80);
}


/* =========================================================
   MAIN CLOCK
========================================================= */

function startClock() {

    updateClock();

    if (mainClockInterval) {
        clearInterval(mainClockInterval);
    }

    mainClockInterval =
        setInterval(updateClock, 1000);
}


function updateClock() {

    const now = new Date();

    const clock =
        document.getElementById("liveClock");

    const date =
        document.getElementById("liveDate");

    if (clock) {

        clock.textContent =
            now.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });
    }

    if (date) {

        date.textContent =
            now.toLocaleDateString(undefined, {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric"
            });
    }
}


/* =========================================================
   CALCULATOR OPEN / CLOSE
========================================================= */

function openCalculator() {

    const screen =
        document.getElementById("calculatorScreen");

    if (!screen) return;

    screen.classList.remove("hidden");

    document.body.classList.add("calculator-open");

    document.body.style.overflow = "hidden";

    updateDisplay();

    updateAnswerDisplay();

    closeMenu();
}


function closeCalculator() {

    const screen =
        document.getElementById("calculatorScreen");

    if (!screen) return;

    screen.classList.add("hidden");

    document.body.classList.remove("calculator-open");

    document.body.style.overflow = "";
}


/* =========================================================
   CALCULATOR INPUT
========================================================= */

function calcInput(value) {

    if (value === undefined || value === null) return;

    value = String(value);

    /*
       Prevent invalid duplicate decimal points
    */

    if (value === ".") {

        const parts =
            expression.split(/[+\-×÷*/()]/);

        const current =
            parts[parts.length - 1];

        if (current.includes(".")) return;

        if (!current) {
            expression += "0";
        }
    }

    /*
       Prevent duplicate operators
    */

    if (["+", "-", "×", "÷", "*", "/"].includes(value)) {

        if (!expression) {

            if (value === "-") {
                expression = "-";
            }

            updateDisplay();
            return;
        }

        const last =
            expression.slice(-1);

        if (
            ["+", "-", "×", "÷", "*", "/"].includes(last)
        ) {
            expression =
                expression.slice(0, -1);
        }
    }

    expression += value;

    updateDisplay();
}


/* =========================================================
   SCIENTIFIC FUNCTIONS
========================================================= */

function calcFunction(value) {

    if (!value) return;

    if (value === "^2") {

        if (!expression) return;

        expression += "^2";

    } else if (value === "^3") {

        if (!expression) return;

        expression += "^3";

    } else if (value === "!") {

        if (!expression) return;

        expression += "!";

    } else {

        expression += value;
    }

    updateDisplay();
}


/* =========================================================
   DISPLAY
========================================================= */

function updateDisplay() {

    const exp =
        document.getElementById("calcExpression");

    const result =
        document.getElementById("calcResult");

    if (exp) {
        exp.textContent = expression;
    }

    if (result && !expression) {
        result.textContent = "0";
    }
}


/* =========================================================
   CLEAR
========================================================= */

function clearCalc() {

    expression = "";

    const result =
        document.getElementById("calcResult");

    const exp =
        document.getElementById("calcExpression");

    if (result) {
        result.textContent = "0";
    }

    if (exp) {
        exp.textContent = "";
    }
}


/* =========================================================
   DELETE
========================================================= */

function deleteCalc() {

    if (!expression) return;

    expression =
        expression.slice(0, -1);

    updateDisplay();
}


/* =========================================================
   SIGN
========================================================= */

function toggleSign() {

    if (!expression) return;

    if (expression.startsWith("-")) {

        expression =
            expression.substring(1);

    } else {

        expression =
            "-" + expression;
    }

    updateDisplay();
}


/* =========================================================
   RANDOM
========================================================= */

function insertRandom() {

    const random =
        Math.random();

    expression +=
        random.toFixed(6);

    updateDisplay();
}


/* =========================================================
   CALCULATE
========================================================= */

function calculateResult() {

    if (!expression.trim()) return;

    const originalExpression =
        expression;

    try {

        const result =
            evaluateExpression(expression);

        if (!Number.isFinite(result)) {
            throw new Error("Invalid result");
        }

        answer = result;

        const formatted =
            formatNumber(result);

        const exp =
            document.getElementById("calcExpression");

        const resultBox =
            document.getElementById("calcResult");

        if (exp) {
            exp.textContent =
                originalExpression;
        }

        if (resultBox) {
            resultBox.textContent =
                formatted;
        }

        expression =
            formatted;

        updateAnswerDisplay();

        addHistory(
            originalExpression,
            result
        );

    } catch (error) {

        const resultBox =
            document.getElementById("calcResult");

        if (resultBox) {
            resultBox.textContent = "Error";
        }

        console.error(
            "Calculator error:",
            error
        );
    }
}


/* =========================================================
   EXPRESSION EVALUATOR
========================================================= */

function evaluateExpression(input) {

    let exp =
        String(input)
            .replaceAll("×", "*")
            .replaceAll("÷", "/")
            .replaceAll("−", "-")
            .replaceAll("π", "pi")
            .replaceAll("Ans", "ans")
            .replace(/\s+/g, "");

    if (!exp) {
        throw new Error("Empty expression");
    }


    /* -----------------------------------------
       Factorial
    ----------------------------------------- */

    let factorialSafety = 0;

    while (exp.includes("!")) {

        factorialSafety++;

        if (factorialSafety > 20) {
            throw new Error("Invalid factorial");
        }

        exp =
            exp.replace(
                /(\d+(?:\.\d+)?|\([^()]+\))!/,
                (match, value) => {

                    if (value.startsWith("(")) {

                        return "factorial(" +
                            evaluateExpression(value.slice(1, -1)) +
                            ")";

                    }

                    return "factorial(" + value + ")";
                }
            );

        if (!exp.includes("!")) break;
    }


    /* -----------------------------------------
       Power
    ----------------------------------------- */

    exp =
        exp.replaceAll("^", "**");


    /* -----------------------------------------
       Constants
    ----------------------------------------- */

    exp =
        exp.replace(
            /\bpi\b/gi,
            "Math.PI"
        );

    exp =
        exp.replace(
            /\bans\b/gi,
            "(" + Number(answer) + ")"
        );

    exp =
        exp.replace(
            /\be\b/g,
            "Math.E"
        );


    /* -----------------------------------------
       Functions
    ----------------------------------------- */

    exp =
        exp.replace(
            /\bsin\(/gi,
            "trigSin("
        );

    exp =
        exp.replace(
            /\bcos\(/gi,
            "trigCos("
        );

    exp =
        exp.replace(
            /\btan\(/gi,
            "trigTan("
        );

    exp =
        exp.replace(
            /\blog\(/gi,
            "Math.log10("
        );

    exp =
        exp.replace(
            /\bln\(/gi,
            "Math.log("
        );

    exp =
        exp.replace(
            /\bsqrt\(/gi,
            "Math.sqrt("
        );


    /* -----------------------------------------
       Security whitelist
    ----------------------------------------- */

    if (
        !/^[0-9+\-*/%().,\sA-Za-z_]+$/.test(exp)
    ) {
        throw new Error("Invalid characters");
    }


    /*
       Only approved function names
    */

    const allowedNames = [
        "Math",
        "factorial",
        "trigSin",
        "trigCos",
        "trigTan"
    ];

    const identifiers =
        exp.match(/[A-Za-z_][A-Za-z0-9_]*/g) || [];

    for (const name of identifiers) {

        if (!allowedNames.includes(name)) {
            throw new Error(
                "Unknown function"
            );
        }
    }


    const fn =
        new Function(
            "factorial",
            "trigSin",
            "trigCos",
            "trigTan",
            "return (" + exp + ");"
        );

    return fn(
        factorial,
        trigSin,
        trigCos,
        trigTan
    );
}


/* =========================================================
   ANGLE
========================================================= */

function toRadians(value) {

    if (angleModeValue === "RAD") {
        return value;
    }

    if (angleModeValue === "GRAD") {
        return value * Math.PI / 200;
    }

    return value * Math.PI / 180;
}


function trigSin(value) {
    return Math.sin(toRadians(value));
}


function trigCos(value) {
    return Math.cos(toRadians(value));
}


function trigTan(value) {
    return Math.tan(toRadians(value));
}


/* =========================================================
   FACTORIAL
========================================================= */

function factorial(n) {

    n = Number(n);

    if (
        !Number.isFinite(n) ||
        n < 0 ||
        !Number.isInteger(n)
    ) {
        throw new Error(
            "Factorial requires a non-negative integer"
        );
    }

    if (n > 170) {
        throw new Error(
            "Number too large"
        );
    }

    let result = 1;

    for (let i = 2; i <= n; i++) {
        result *= i;
    }

    return result;
}


/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatNumber(value) {

    if (!Number.isFinite(value)) {
        return "Error";
    }

    if (
        Math.abs(value) >= 1e12 ||
        (
            Math.abs(value) > 0 &&
            Math.abs(value) < 1e-8
        )
    ) {

        return value.toExponential(8);
    }

    return Number(
        value.toPrecision(12)
    ).toString();
}


/* =========================================================
   ANSWER
========================================================= */

function updateAnswerDisplay() {

    const answerBox =
        document.getElementById("answerValue");

    if (answerBox) {

        answerBox.textContent =
            formatNumber(answer);
    }
}


/* =========================================================
   ANGLE MODE
========================================================= */

function toggleAngleMode() {

    if (angleModeValue === "DEG") {

        angleModeValue = "RAD";

    } else if (angleModeValue === "RAD") {

        angleModeValue = "GRAD";

    } else {

        angleModeValue = "DEG";
    }

    const mode =
        document.getElementById("angleMode");

    if (mode) {
        mode.textContent =
            angleModeValue;
    }
}


/* =========================================================
   CALCULATOR TABS
========================================================= */

function switchCalcTab(tab, button) {

    document
        .querySelectorAll(".calcTab")
        .forEach(item => {
            item.classList.remove("active");
        });

    if (button) {
        button.classList.add("active");
    }

    document
        .querySelectorAll(".calcPanel")
        .forEach(panel => {
            panel.classList.remove("active");
        });

    const target =
        document.getElementById(
            tab + "Panel"
        );

    if (target) {
        target.classList.add("active");
    }
}


/* =========================================================
   HISTORY
========================================================= */

function addHistory(exp, result) {

    calculationHistory.unshift({
        expression: String(exp),
        result: Number(result),
        time: new Date().toLocaleString()
    });

    calculationHistory =
        calculationHistory.slice(0, 30);

    localStorage.setItem(
        "leoCalcHistory",
        JSON.stringify(calculationHistory)
    );

    renderHistory();
}


function loadHistory() {
    renderHistory();
}


function renderHistory() {

    const list =
        document.getElementById("historyList");

    if (!list) return;

    if (!calculationHistory.length) {

        list.innerHTML =
            `
            <p class="emptyHistory">
                No calculations yet.
            </p>
            `;

        return;
    }

    list.innerHTML =
        calculationHistory
            .map((item, index) => {

                return `
                <div
                    class="historyItem"
                    onclick="useHistory(${index})"
                    style="
                        padding:12px 0;
                        border-bottom:1px solid rgba(255,255,255,.07);
                        cursor:pointer;
                    "
                >

                    <div style="
                        color:rgba(255,255,255,.42);
                        font-size:10px;
                        word-break:break-word;
                    ">
                        ${escapeHTML(item.expression)}
                    </div>

                    <strong style="
                        display:block;
                        margin-top:4px;
                        font-size:15px;
                    ">
                        ${escapeHTML(
                            formatNumber(item.result)
                        )}
                    </strong>

                    <small style="
                        color:rgba(255,255,255,.25);
                        font-size:8px;
                    ">
                        ${escapeHTML(item.time || "")}
                    </small>

                </div>
                `;
            })
            .join("");
}


function useHistory(index) {

    const item =
        calculationHistory[index];

    if (!item) return;

    expression =
        String(item.result);

    const result =
        document.getElementById("calcResult");

    if (result) {
        result.textContent =
            formatNumber(item.result);
    }

    updateDisplay();
}


function clearHistory() {

    calculationHistory = [];

    localStorage.removeItem(
        "leoCalcHistory"
    );

    renderHistory();
}


/* =========================================================
   ENGINEERING TOOLS
========================================================= */

function engineeringTool(type) {

    const titles = {
        ohm: "Ohm's Law",
        power: "Electrical Power",
        resistor: "Resistor Calculator",
        frequency: "Frequency & Wavelength",
        percentage: "Percentage Calculator",
        interest: "Interest Calculator",
        emi: "EMI Calculator",
        bmi: "BMI Calculator"
    };

    const title =
        titles[type] || "Engineering Tool";

    let html = "";


    /* OHM */

    if (type === "ohm") {

        html = `
            <div class="formTool">

                <p class="toolDescription">
                    Enter any two values to calculate the third.
                </p>

                <input
                    id="ohmV"
                    class="toolInput"
                    type="number"
                    inputmode="decimal"
                    placeholder="Voltage (V)"
                >

                <input
                    id="ohmI"
                    class="toolInput"
                    type="number"
                    inputmode="decimal"
                    placeholder="Current (A)"
                >

                <input
                    id="ohmR"
                    class="toolInput"
                    type="number"
                    inputmode="decimal"
                    placeholder="Resistance (Ω)"
                >

                <button
                    class="primaryButton"
                    onclick="calculateOhm()">
                    Calculate
                </button>

                <div
                    id="ohmResult"
                    class="resultBox">
                </div>

            </div>
        `;
    }


    /* POWER */

    else if (type === "power") {

        html = `
            <div class="formTool">

                <input
                    id="powerV"
                    class="toolInput"
                    type="number"
                    inputmode="decimal"
                    placeholder="Voltage (V)"
                >

                <input
                    id="powerI"
                    class="toolInput"
                    type="number"
                    inputmode="decimal"
                    placeholder="Current (A)"
                >

                <button
                    class="primaryButton"
                    onclick="calculatePower()">
                    Calculate Power
                </button>

                <div
                    id="powerResult"
                    class="resultBox">
                </div>

            </div>
        `;
    }


    /* RESISTOR */

    else if (type === "resistor") {

        html = `
            <div class="formTool">

                <div class="toolFormula">
                    Rₛ = R₁ + R₂
                    &nbsp; | &nbsp;
                    Rₚ = R₁R₂ / (R₁ + R₂)
                </div>

                <input
                    id="res1"
                    class="toolInput"
                    type="number"
                    inputmode="decimal"
                    min="0"
                    placeholder="Resistor 1 (Ω)"
                >

                <input
                    id="res2"
                    class="toolInput"
                    type="number"
                    inputmode="decimal"
                    min="0"
                    placeholder="Resistor 2 (Ω)"
                >

                <button
                    class="primaryButton"
                    onclick="calculateResistors()">
                    Calculate
                </button>

                <div
                    id="resResult"
                    class="resultBox">
                </div>

            </div>
        `;
    }


    /* FREQUENCY */

    else if (type === "frequency") {

        html = `
            <div class="formTool">

                <input
                    id="freqValue"
                    class="toolInput"
                    type="number"
                    inputmode="decimal"
                    min="0"
                    placeholder="Frequency (Hz)"
                >

                <button
                    class="primaryButton"
                    onclick="calculateFrequency()">
                    Calculate Wavelength
                </button>

                <div
                    id="freqResult"
                    class="resultBox">
                </div>

            </div>
        `;
    }


    /* PERCENTAGE */

    else if (type === "percentage") {

        html = `
            <div class="formTool">

                <input
                    id="percentValue"
                    class="toolInput"
                    type="number"
                    inputmode="decimal"
                    placeholder="Value"
                >

                <input
                    id="percentRate"
                    class="toolInput"
                    type="number"
                    inputmode="decimal"
                    placeholder="Percentage (%)"
                >

                <button
                    class="primaryButton"
                    onclick="calculatePercentage()">
                    Calculate
                </button>

                <div
                    id="percentResult"
                    class="resultBox">
                </div>

            </div>
        `;
    }


    /* INTEREST */

    else if (type === "interest") {

        html = `
            <div class="formTool">

                <input
                    id="interestP"
                    class="toolInput"
                    type="number"
                    inputmode="decimal"
                    min="0"
                    placeholder="Principal"
                >

                <input
                    id="interestR"
                    class="toolInput"
                    type="number"
                    inputmode="decimal"
                    min="0"
                    placeholder="Rate (%)"
                >

                <input
                    id="interestT"
                    class="toolInput"
                    type="number"
                    inputmode="decimal"
                    min="0"
                    placeholder="Time (Years)"
                >

                <button
                    class="primaryButton"
                    onclick="calculateInterest()">
                    Calculate
                </button>

                <div
                    id="interestResult"
                    class="resultBox">
                </div>

            </div>
        `;
    }


    /* EMI */

    else if (type === "emi") {

        html = `
            <div class="formTool">

                <input
                    id="emiP"
                    class="toolInput"
                    type="number"
                    inputmode="decimal"
                    min="0"
                    placeholder="Loan Amount"
                >

                <input
                    id="emiR"
                    class="toolInput"
                    type="number"
                    inputmode="decimal"
                    min="0"
                    placeholder="Annual Interest (%)"
                >

                <input
                    id="emiN"
                    class="toolInput"
                    type="number"
                    inputmode="numeric"
                    min="1"
                    placeholder="Months"
                >

                <button
                    class="primaryButton"
                    onclick="calculateEMI()">
                    Calculate EMI
                </button>

                <div
                    id="emiResult"
                    class="resultBox">
                </div>

            </div>
        `;
    }


    /* BMI */

    else if (type === "bmi") {

        html = `
            <div class="formTool">

                <input
                    id="bmiWeight"
                    class="toolInput"
                    type="number"
                    inputmode="decimal"
                    min="0"
                    placeholder="Weight (kg)"
                >

                <input
                    id="bmiHeight"
                    class="toolInput"
                    type="number"
                    inputmode="decimal"
                    min="0"
                    placeholder="Height (cm)"
                >

                <button
                    class="primaryButton"
                    onclick="calculateBMI()">
                    Calculate BMI
                </button>

                <div
                    id="bmiResult"
                    class="resultBox">
                </div>

            </div>
        `;
    }

    openToolModal(title, html);
}


/* =========================================================
   OHM'S LAW
========================================================= */

function calculateOhm() {

    const vEl =
        document.getElementById("ohmV");

    const iEl =
        document.getElementById("ohmI");

    const rEl =
        document.getElementById("ohmR");

    const resultEl =
        document.getElementById("ohmResult");

    if (!vEl || !iEl || !rEl || !resultEl) return;

    const V =
        parseFloat(vEl.value);

    const I =
        parseFloat(iEl.value);

    const R =
        parseFloat(rEl.value);

    const hasV = Number.isFinite(V);
    const hasI = Number.isFinite(I);
    const hasR = Number.isFinite(R);

    let result = "";

    if (hasV && hasI && I !== 0) {

        result =
            `Resistance = ${formatNumber(V / I)} Ω`;

    } else if (hasV && hasR && R !== 0) {

        result =
            `Current = ${formatNumber(V / R)} A`;

    } else if (hasI && hasR) {

        result =
            `Voltage = ${formatNumber(I * R)} V`;

    } else {

        result =
            "Please enter any two valid values.";
    }

    resultEl.textContent = result;
}


/* =========================================================
   POWER
========================================================= */

function calculatePower() {

    const V =
        parseFloat(
            document.getElementById("powerV")?.value
        );

    const I =
        parseFloat(
            document.getElementById("powerI")?.value
        );

    const resultEl =
        document.getElementById("powerResult");

    if (!resultEl) return;

    if (
        !Number.isFinite(V) ||
        !Number.isFinite(I)
    ) {

        resultEl.textContent =
            "Please enter voltage and current.";

        return;
    }

    const result =
        V * I;

    resultEl.textContent =
        `Power = ${formatNumber(result)} W`;
}


/* =========================================================
   RESISTOR
========================================================= */

function calculateResistors() {

    const R1 =
        parseFloat(
            document.getElementById("res1")?.value
        );

    const R2 =
        parseFloat(
            document.getElementById("res2")?.value
        );

    const resultEl =
        document.getElementById("resResult");

    if (!resultEl) return;

    if (
        !Number.isFinite(R1) ||
        !Number.isFinite(R2) ||
        R1 <= 0 ||
        R2 <= 0
    ) {

        resultEl.textContent =
            "Enter two positive resistor values.";

        return;
    }

    const series =
        R1 + R2;

    const parallel =
        (R1 * R2) /
        (R1 + R2);

    resultEl.innerHTML =
        `
        <strong>Series</strong>
        <br>
        ${formatNumber(series)} Ω

        <br><br>

        <strong>Parallel</strong>
        <br>
        ${formatNumber(parallel)} Ω
        `;
}


/* =========================================================
   FREQUENCY
========================================================= */

function calculateFrequency() {

    const frequency =
        parseFloat(
            document.getElementById("freqValue")?.value
        );

    const resultEl =
        document.getElementById("freqResult");

    if (!resultEl) return;

    if (
        !Number.isFinite(frequency) ||
        frequency <= 0
    ) {

        resultEl.textContent =
            "Enter a frequency greater than 0.";

        return;
    }

    const speedOfLight =
        299792458;

    const wavelength =
        speedOfLight / frequency;

    resultEl.innerHTML =
        `
        Wavelength =
        ${formatNumber(wavelength)} m

        <br><br>

        Frequency =
        ${formatNumber(frequency)} Hz
        `;
}


/* =========================================================
   PERCENTAGE
========================================================= */

function calculatePercentage() {

    const value =
        parseFloat(
            document.getElementById("percentValue")?.value
        );

    const rate =
        parseFloat(
            document.getElementById("percentRate")?.value
        );

    const resultEl =
        document.getElementById("percentResult");

    if (!resultEl) return;

    if (
        !Number.isFinite(value) ||
        !Number.isFinite(rate)
    ) {

        resultEl.textContent =
            "Enter value and percentage.";

        return;
    }

    const amount =
        value * rate / 100;

    const total =
        value + amount;

    resultEl.innerHTML =
        `
        ${formatNumber(rate)}% of value =
        ${formatNumber(amount)}

        <br><br>

        Value + ${formatNumber(rate)}% =
        ${formatNumber(total)}
        `;
}


/* =========================================================
   INTEREST
========================================================= */

function calculateInterest() {

    const P =
        parseFloat(
            document.getElementById("interestP")?.value
        );

    const R =
        parseFloat(
            document.getElementById("interestR")?.value
        );

    const T =
        parseFloat(
            document.getElementById("interestT")?.value
        );

    const resultEl =
        document.getElementById("interestResult");

    if (!resultEl) return;

    if (
        !Number.isFinite(P) ||
        !Number.isFinite(R) ||
        !Number.isFinite(T) ||
        P < 0 ||
        R < 0 ||
        T < 0
    ) {

        resultEl.textContent =
            "Enter valid principal, rate and time.";

        return;
    }

    const SI =
        P * R * T / 100;

    const CI =
        P *
        Math.pow(
            1 + R / 100,
            T
        ) - P;

    resultEl.innerHTML =
        `
        Simple Interest =
        ${formatNumber(SI)}

        <br><br>

        Compound Interest =
        ${formatNumber(CI)}
        `;
}


/* =========================================================
   EMI
========================================================= */

function calculateEMI() {

    const P =
        parseFloat(
            document.getElementById("emiP")?.value
        );

    const annualRate =
        parseFloat(
            document.getElementById("emiR")?.value
        );

    const N =
        parseInt(
            document.getElementById("emiN")?.value,
            10
        );

    const resultEl =
        document.getElementById("emiResult");

    if (!resultEl) return;

    if (
        !Number.isFinite(P) ||
        !Number.isFinite(annualRate) ||
        !Number.isFinite(N) ||
        P <= 0 ||
        annualRate < 0 ||
        N <= 0
    ) {

        resultEl.textContent =
            "Enter valid loan amount, interest and months.";

        return;
    }

    const r =
        annualRate / 12 / 100;

    let emi;

    if (r === 0) {

        emi =
            P / N;

    } else {

        emi =
            P *
            r *
            Math.pow(1 + r, N) /
            (
                Math.pow(1 + r, N) - 1
            );
    }

    const total =
        emi * N;

    const interest =
        total - P;

    resultEl.innerHTML =
        `
        Monthly EMI =
        ₹${formatNumber(emi)}

        <br><br>

        Total Interest =
        ₹${formatNumber(interest)}

        <br><br>

        Total Payment =
        ₹${formatNumber(total)}
        `;
}


/* =========================================================
   BMI
========================================================= */

function calculateBMI() {

    const weight =
        parseFloat(
            document.getElementById("bmiWeight")?.value
        );

    const heightCm =
        parseFloat(
            document.getElementById("bmiHeight")?.value
        );

    const resultEl =
        document.getElementById("bmiResult");

    if (!resultEl) return;

    if (
        !Number.isFinite(weight) ||
        !Number.isFinite(heightCm) ||
        weight <= 0 ||
        heightCm <= 0
    ) {

        resultEl.textContent =
            "Enter valid height and weight.";

        return;
    }

    const height =
        heightCm / 100;

    const bmi =
        weight /
        (height * height);

    resultEl.innerHTML =
        `
        BMI = ${formatNumber(bmi)}

        <br><br>

        BMI is a general screening measure and
        should not be used alone to judge health.
        `;
}


/* =========================================================
   TIME TOOLS
========================================================= */

function openTimeTools() {

    const html = `

        <div class="formTool">

            <h3 style="margin-bottom:15px;">
                🕐 Time & Date
            </h3>

            <div
                id="bigTime"
                style="
                    font-size:36px;
                    font-weight:800;
                    margin-bottom:8px;
                ">
                00:00:00
            </div>

            <div
                id="bigDate"
                style="
                    color:rgba(255,255,255,.5);
                    margin-bottom:20px;
                ">
                Loading...
            </div>

            <hr style="
                border-color:rgba(255,255,255,.08);
                margin:15px 0;
            ">

            <h4>Stopwatch</h4>

            <div
                id="stopwatchDisplay"
                style="
                    font-size:28px;
                    margin:10px 0;
                ">
                00:00:00
            </div>

            <button
                class="primaryButton"
                onclick="startStopwatch()">
                Start
            </button>

            <button
                class="primaryButton"
                onclick="pauseStopwatch()">
                Pause
            </button>

            <button
                class="primaryButton"
                onclick="resetStopwatch()">
                Reset
            </button>

        </div>
    `;

    openToolModal(
        "Time & Date",
        html
    );

    updateBigTime();

    if (bigClockInterval) {
        clearInterval(bigClockInterval);
    }

    bigClockInterval =
        setInterval(
            updateBigTime,
            1000
        );
}


function updateBigTime() {

    const time =
        document.getElementById("bigTime");

    const date =
        document.getElementById("bigDate");

    if (!time && !date) return;

    const now = new Date();

    if (time) {
        time.textContent =
            now.toLocaleTimeString();
    }

    if (date) {
        date.textContent =
            now.toLocaleDateString(
                undefined,
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );
    }
}


/* =========================================================
   STOPWATCH
========================================================= */

function startStopwatch() {

    if (stopwatchInterval) return;

    stopwatchInterval =
        setInterval(() => {

            stopwatchSeconds++;

            updateStopwatch();

        }, 1000);
}


function pauseStopwatch() {

    if (stopwatchInterval) {

        clearInterval(
            stopwatchInterval
        );

        stopwatchInterval = null;
    }
}


function resetStopwatch() {

    pauseStopwatch();

    stopwatchSeconds = 0;

    updateStopwatch();
}


function updateStopwatch() {

    const box =
        document.getElementById(
            "stopwatchDisplay"
        );

    if (!box) return;

    const h =
        Math.floor(
            stopwatchSeconds / 3600
        );

    const m =
        Math.floor(
            (stopwatchSeconds % 3600) / 60
        );

    const s =
        stopwatchSeconds % 60;

    box.textContent =
        `${pad(h)}:${pad(m)}:${pad(s)}`;
}


function pad(number) {

    return String(number)
        .padStart(2, "0");
}


/* =========================================================
   WEATHER
========================================================= */

function getWeather() {

    if (!navigator.geolocation) {

        setWeather(
            "🌤️",
            "--°C",
            "Location unavailable"
        );

        return;
    }

    navigator.geolocation.getCurrentPosition(

        position => {

            fetchWeather(
                position.coords.latitude,
                position.coords.longitude
            );
        },

        () => {

            setWeather(
                "📍",
                "--°C",
                "Location permission needed"
            );
        },

        {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}


async function fetchWeather(lat, lon) {

    try {

        const url =
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset` +
            `&timezone=auto&forecast_days=5`;

        const response =
            await fetch(url);

        if (!response.ok) {
            throw new Error(
                "Weather request failed"
            );
        }

        const data =
            await response.json();

        if (!data.current) {
            throw new Error(
                "Invalid weather data"
            );
        }

        const current =
            data.current;

        const info =
            weatherDescription(
                current.weather_code
            );

        setWeather(
            info.icon,
            `${Math.round(current.temperature_2m)}°C`,
            info.text
        );

        window.leoWeatherData = data;

    } catch (error) {

        console.error(
            "Weather error:",
            error
        );

        setWeather(
            "🌤️",
            "--°C",
            "Weather unavailable"
        );
    }
}


function setWeather(
    icon,
    temp,
    condition
) {

    const iconBox =
        document.getElementById(
            "weatherIcon"
        );

    const tempBox =
        document.getElementById(
            "weatherTemp"
        );

    const conditionBox =
        document.getElementById(
            "weatherCondition"
        );

    if (iconBox) {
        iconBox.textContent = icon;
    }

    if (tempBox) {
        tempBox.textContent = temp;
    }

    if (conditionBox) {
        conditionBox.textContent =
            condition;
    }
}


function weatherDescription(code) {

    if (code === 0) {
        return {
            icon: "☀️",
            text: "Clear Sky"
        };
    }

    if ([1, 2, 3].includes(code)) {
        return {
            icon: "🌤️",
            text: "Partly Cloudy"
        };
    }

    if ([45, 48].includes(code)) {
        return {
            icon: "🌫️",
            text: "Foggy"
        };
    }

    if ([51, 53, 55, 56, 57].includes(code)) {
        return {
            icon: "🌦️",
            text: "Drizzle"
        };
    }

    if ([61, 63, 65, 66, 67].includes(code)) {
        return {
            icon: "🌧️",
            text: "Rain"
        };
    }

    if ([71, 73, 75, 77].includes(code)) {
        return {
            icon: "❄️",
            text: "Snow"
        };
    }

    if ([80, 81, 82].includes(code)) {
        return {
            icon: "🌧️",
            text: "Rain Showers"
        };
    }

    if ([95, 96, 99].includes(code)) {
        return {
            icon: "⛈️",
            text: "Thunderstorm"
        };
    }

    return {
        icon: "🌤️",
        text: "Unknown"
    };
}


/* =========================================================
   FULL WEATHER
========================================================= */

function openWeather() {

    const data =
        window.leoWeatherData;

    let html = "";

    if (!data) {

        html = `
            <div class="formTool">

                <div style="
                    text-align:center;
                    padding:25px;
                ">

                    <div style="font-size:45px;">
                        🌤️
                    </div>

                    <h3>
                        Weather Loading
                    </h3>

                    <p style="
                        margin-top:8px;
                        color:rgba(255,255,255,.45);
                    ">
                        Allow location access to load weather.
                    </p>

                    <button
                        class="primaryButton"
                        onclick="getWeather()">
                        Refresh Weather
                    </button>

                </div>

            </div>
        `;

    } else {

        const current =
            data.current;

        const daily =
            data.daily;

        const info =
            weatherDescription(
                current.weather_code
            );

        let forecast = "";

        for (
            let i = 0;
            i < daily.time.length;
            i++
        ) {

            const d =
                weatherDescription(
                    daily.weather_code[i]
                );

            forecast += `
                <div style="
                    padding:12px;
                    margin-top:8px;
                    border-radius:13px;
                    background:rgba(255,255,255,.05);
                ">

                    <strong>
                        ${escapeHTML(
                            new Date(
                                daily.time[i]
                            ).toLocaleDateString(
                                undefined,
                                {
                                    weekday:"short",
                                    day:"numeric"
                                }
                            )
                        )}
                    </strong>

                    <span style="margin-left:10px;">
                        ${d.icon}
                    </span>

                    <span style="
                        float:right;
                        color:rgba(255,255,255,.6);
                    ">
                        ${Math.round(
                            daily.temperature_2m_max[i]
                        )}° /
                        ${Math.round(
                            daily.temperature_2m_min[i]
                        )}°
                    </span>

                </div>
            `;
        }

        html = `
            <div class="formTool">

                <div style="
                    text-align:center;
                    padding:10px;
                ">

                    <div style="font-size:55px;">
                        ${info.icon}
                    </div>

                    <div style="
                        font-size:42px;
                        font-weight:800;
                    ">
                        ${Math.round(
                            current.temperature_2m
                        )}°C
                    </div>

                    <div style="
                        color:rgba(255,255,255,.5);
                    ">
                        ${escapeHTML(info.text)}
                    </div>

                </div>

                <div style="
                    display:grid;
                    grid-template-columns:1fr 1fr;
                    gap:8px;
                    margin-top:15px;
                ">

                    <div class="weatherStat">
                        💧 Humidity<br>
                        <strong>
                            ${current.relative_humidity_2m}%
                        </strong>
                    </div>

                    <div class="weatherStat">
                        🌬️ Wind<br>
                        <strong>
                            ${current.wind_speed_10m} km/h
                        </strong>
                    </div>

                    <div class="weatherStat">
                        🌡️ Feels Like<br>
                        <strong>
                            ${Math.round(
                                current.apparent_temperature
                            )}°C
                        </strong>
                    </div>

                    <div class="weatherStat">
                        📍 Coordinates<br>
                        <strong>
                            ${Number(data.latitude).toFixed(2)},
                            ${Number(data.longitude).toFixed(2)}
                        </strong>
                    </div>

                </div>

                <h3 style="margin-top:20px;">
                    5-Day Forecast
                </h3>

                ${forecast}

            </div>
        `;
    }

    openToolModal(
        "Live Weather",
        html
    );
}


/* =========================================================
   CONVERTER
========================================================= */

function openConverter() {

    const html = `

        <div class="formTool">

            <select
                id="convertCategory"
                class="toolSelect"
                onchange="changeConverter()">

                <option value="length">Length</option>
                <option value="mass">Mass</option>
                <option value="temperature">Temperature</option>
                <option value="speed">Speed</option>
                <option value="area">Area</option>
                <option value="volume">Volume</option>
                <option value="data">Data Storage</option>
                <option value="energy">Energy</option>
                <option value="power">Power</option>
                <option value="pressure">Pressure</option>

            </select>

            <input
                id="convertValue"
                class="toolInput"
                type="number"
                inputmode="decimal"
                placeholder="Enter value"
            >

            <div style="
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:8px;
            ">

                <select
                    id="fromUnit"
                    class="toolSelect">
                </select>

                <select
                    id="toUnit"
                    class="toolSelect">
                </select>

            </div>

            <button
                class="primaryButton"
                onclick="performConversion()">
                Convert
            </button>

            <div
                id="conversionResult"
                class="resultBox">
            </div>

        </div>
    `;

    openToolModal(
        "Engineering Converter",
        html
    );

    changeConverter();
}


/* =========================================================
   CONVERSION UNITS
========================================================= */

const conversionUnits = {

    length: {
        m: 1,
        km: 1000,
        cm: 0.01,
        mm: 0.001,
        mile: 1609.344,
        yard: 0.9144,
        foot: 0.3048,
        inch: 0.0254
    },

    mass: {
        kg: 1,
        g: 0.001,
        mg: 0.000001,
        lb: 0.45359237,
        oz: 0.0283495
    },

    speed: {
        "m/s": 1,
        "km/h": 0.277777778,
        mph: 0.44704,
        knot: 0.514444
    },

    area: {
        "m²": 1,
        "km²": 1000000,
        "cm²": 0.0001,
        "ft²": 0.092903
    },

    volume: {
        L: 1,
        mL: 0.001,
        "m³": 1000,
        "ft³": 28.3168,
        gallon: 3.78541
    },

    data: {
        bit: 1,
        byte: 8,
        KB: 8192,
        MB: 8388608,
        GB: 8589934592
    },

    energy: {
        J: 1,
        kJ: 1000,
        Wh: 3600,
        kWh: 3600000,
        cal: 4.184
    },

    power: {
        W: 1,
        kW: 1000,
        MW: 1000000,
        hp: 745.7
    },

    pressure: {
        Pa: 1,
        kPa: 1000,
        bar: 100000,
        atm: 101325,
        psi: 6894.76
    }
};


/* =========================================================
   CHANGE CONVERTER
========================================================= */

function changeConverter() {

    const category =
        document.getElementById(
            "convertCategory"
        )?.value;

    const from =
        document.getElementById(
            "fromUnit"
        );

    const to =
        document.getElementById(
            "toUnit"
        );

    if (!category || !from || !to) return;

    if (category === "temperature") {

        from.innerHTML = `
            <option value="°C">°C</option>
            <option value="°F">°F</option>
            <option value="K">K</option>
        `;

        to.innerHTML = `
            <option value="°C">°C</option>
            <option value="°F">°F</option>
            <option value="K">K</option>
        `;

        return;
    }

    const units =
        conversionUnits[category];

    if (!units) return;

    from.innerHTML = "";
    to.innerHTML = "";

    Object.keys(units).forEach(unit => {

        const option1 =
            document.createElement("option");

        option1.value = unit;
        option1.textContent = unit;

        const option2 =
            document.createElement("option");

        option2.value = unit;
        option2.textContent = unit;

        from.appendChild(option1);
        to.appendChild(option2);
    });
}


/* =========================================================
   PERFORM CONVERSION
========================================================= */

function performConversion() {

    const category =
        document.getElementById(
            "convertCategory"
        )?.value;

    const value =
        parseFloat(
            document.getElementById(
                "convertValue"
            )?.value
        );

    const from =
        document.getElementById(
            "fromUnit"
        )?.value;

    const to =
        document.getElementById(
            "toUnit"
        )?.value;

    const resultEl =
        document.getElementById(
            "conversionResult"
        );

    if (!resultEl) return;

    if (!Number.isFinite(value)) {

        resultEl.textContent =
            "Enter a valid value.";

        return;
    }

    let result;

    if (category === "temperature") {

        result =
            convertTemperature(
                value,
                from,
                to
            );

    } else {

        const units =
            conversionUnits[category];

        if (!units || units[from] === undefined) {

            resultEl.textContent =
                "Conversion unavailable.";

            return;
        }

        result =
            value *
            units[from] /
            units[to];
    }

    resultEl.textContent =
        `${formatNumber(result)} ${to}`;
}


/* =========================================================
   TEMPERATURE CONVERSION
========================================================= */

function convertTemperature(
    value,
    from,
    to
) {

    let celsius;

    if (from === "°C") {
        celsius = value;
    } else if (from === "°F") {
        celsius =
            (value - 32) * 5 / 9;
    } else if (from === "K") {
        celsius =
            value - 273.15;
    } else {
        throw new Error(
            "Invalid temperature unit"
        );
    }

    if (to === "°C") {
        return celsius;
    }

    if (to === "°F") {
        return celsius * 9 / 5 + 32;
    }

    if (to === "K") {
        return celsius + 273.15;
    }

    throw new Error(
        "Invalid temperature unit"
    );
}


/* =========================================================
   MONEY TOOLS
========================================================= */

function openMoneyTools() {

    const html = `

        <div class="formTool">

            <input
                id="moneyAmount"
                class="toolInput"
                type="number"
                inputmode="decimal"
                placeholder="Amount"
            >

            <input
                id="moneyGST"
                class="toolInput"
                type="number"
                inputmode="decimal"
                placeholder="GST %"
                value="18"
            >

            <button
                class="primaryButton"
                onclick="calculateGST()">
                Calculate GST
            </button>

            <div
                id="gstResult"
                class="resultBox">
            </div>

            <hr style="
                margin:20px 0;
                border-color:rgba(255,255,255,.08);
            ">

            <input
                id="discountPrice"
                class="toolInput"
                type="number"
                inputmode="decimal"
                placeholder="Original Price"
            >

            <input
                id="discountRate"
                class="toolInput"
                type="number"
                inputmode="decimal"
                placeholder="Discount %"
            >

            <button
                class="primaryButton"
                onclick="calculateDiscount()">
                Calculate Discount
            </button>

            <div
                id="discountResult"
                class="resultBox">
            </div>

        </div>
    `;

    openToolModal(
        "Money Tools",
        html
    );
}


function calculateGST() {

    const amount =
        parseFloat(
            document.getElementById(
                "moneyAmount"
            )?.value
        );

    const rate =
        parseFloat(
            document.getElementById(
                "moneyGST"
            )?.value
        );

    const resultEl =
        document.getElementById(
            "gstResult"
        );

    if (!resultEl) return;

    if (
        !Number.isFinite(amount) ||
        !Number.isFinite(rate) ||
        amount < 0 ||
        rate < 0
    ) {

        resultEl.textContent =
            "Enter valid amount and GST rate.";

        return;
    }

    const gst =
        amount * rate / 100;

    const total =
        amount + gst;

    resultEl.innerHTML =
        `
        GST = ₹${formatNumber(gst)}
        <br><br>
        Total = ₹${formatNumber(total)}
        `;
}


function calculateDiscount() {

    const price =
        parseFloat(
            document.getElementById(
                "discountPrice"
            )?.value
        );

    const rate =
        parseFloat(
            document.getElementById(
                "discountRate"
            )?.value
        );

    const resultEl =
        document.getElementById(
            "discountResult"
        );

    if (!resultEl) return;

    if (
        !Number.isFinite(price) ||
        !Number.isFinite(rate) ||
        price < 0 ||
        rate < 0
    ) {

        resultEl.textContent =
            "Enter valid price and discount.";

        return;
    }

    const discount =
        price * rate / 100;

    const finalPrice =
        price - discount;

    resultEl.innerHTML =
        `
        Discount = ₹${formatNumber(discount)}
        <br><br>
        Final Price = ₹${formatNumber(finalPrice)}
        `;
}


/* =========================================================
   STATISTICS
========================================================= */

function openStatistics() {

    const html = `

        <div class="formTool">

            <p class="toolDescription">
                Enter numbers separated by commas.
            </p>

            <textarea
                id="statsInput"
                class="toolTextarea"
                rows="5"
                placeholder="10, 20, 30, 40, 50"
            ></textarea>

            <button
                class="primaryButton"
                onclick="calculateStatistics()">
                Calculate Statistics
            </button>

            <div
                id="statsResult"
                class="resultBox">
            </div>

        </div>
    `;

    openToolModal(
        "Statistics",
        html
    );
}


function calculateStatistics() {

    const input =
        document.getElementById(
            "statsInput"
        )?.value || "";

    const nums =
        input
            .split(",")
            .map(value => Number(value.trim()))
            .filter(Number.isFinite);

    const resultEl =
        document.getElementById(
            "statsResult"
        );

    if (!resultEl) return;

    if (!nums.length) {

        resultEl.textContent =
            "Enter valid numbers separated by commas.";

        return;
    }

    const sorted =
        [...nums].sort(
            (a, b) => a - b
        );

    const sum =
        nums.reduce(
            (a, b) => a + b,
            0
        );

    const mean =
        sum / nums.length;

    const middle =
        Math.floor(
            sorted.length / 2
        );

    const median =
        sorted.length % 2
            ? sorted[middle]
            : (
                sorted[middle - 1] +
                sorted[middle]
            ) / 2;

    const variance =
        nums.reduce(
            (total, n) =>
                total +
                Math.pow(n - mean, 2),
            0
        ) / nums.length;

    const sd =
        Math.sqrt(variance);

    resultEl.innerHTML =
        `
        Count = ${nums.length}

        <br><br>

        Sum = ${formatNumber(sum)}

        <br><br>

        Mean = ${formatNumber(mean)}

        <br><br>

        Median = ${formatNumber(median)}

        <br><br>

        Variance = ${formatNumber(variance)}

        <br><br>

        Standard Deviation =
        ${formatNumber(sd)}
        `;
}


/* =========================================================
   NUMBER SYSTEM
========================================================= */

function openNumberSystem() {

    const html = `

        <div class="formTool">

            <input
                id="numberInput"
                class="toolInput"
                type="text"
                inputmode="numeric"
                placeholder="Enter decimal integer"
            >

            <button
                class="primaryButton"
                onclick="convertNumberSystem()">
                Convert
            </button>

            <div
                id="numberResult"
                class="resultBox">
            </div>

        </div>
    `;

    openToolModal(
        "Number System",
        html
    );
}


function convertNumberSystem() {

    const input =
        document.getElementById(
            "numberInput"
        )?.value.trim();

    const resultEl =
        document.getElementById(
            "numberResult"
        );

    if (!resultEl) return;

    if (!/^-?\d+$/.test(input)) {

        resultEl.textContent =
            "Enter a valid integer.";

        return;
    }

    const value =
        Number(input);

    if (!Number.isSafeInteger(value)) {

        resultEl.textContent =
            "Number is too large.";

        return;
    }

    resultEl.innerHTML =
        `
        Decimal = ${value}

        <br><br>

        Binary = ${value.toString(2)}

        <br><br>

        Octal = ${value.toString(8)}

        <br><br>

        Hexadecimal =
        ${value.toString(16).toUpperCase()}
        `;
}


/* =========================================================
   SECURITY TOOLS
========================================================= */

function openSecurity() {

    const html = `

        <div class="formTool">

            <input
                id="passwordLength"
                class="toolInput"
                type="number"
                inputmode="numeric"
                value="16"
                min="4"
                max="64"
                placeholder="Password length"
            >

            <button
                class="primaryButton"
                onclick="generatePassword()">
                Generate Secure Password
            </button>

            <div
                id="passwordResult"
                class="resultBox"
                style="word-break:break-all;">
            </div>

        </div>
    `;

    openToolModal(
        "Security Tools",
        html
    );
}


function generatePassword() {

    const length =
        parseInt(
            document.getElementById(
                "passwordLength"
            )?.value,
            10
        );

    const resultEl =
        document.getElementById(
            "passwordResult"
        );

    if (!resultEl) return;

    if (
        !Number.isInteger(length) ||
        length < 4 ||
        length > 64
    ) {

        resultEl.textContent =
            "Password length must be 4–64.";

        return;
    }

    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
        "abcdefghijklmnopqrstuvwxyz" +
        "0123456789" +
        "!@#$%^&*()_+-=[]{}";

    let password = "";

    try {

        const randomArray =
            new Uint32Array(length);

        crypto.getRandomValues(
            randomArray
        );

        randomArray.forEach(number => {

            password +=
                chars[
                    number % chars.length
                ];
        });

    } catch (error) {

        for (let i = 0; i < length; i++) {

            password +=
                chars[
                    Math.floor(
                        Math.random() *
                        chars.length
                    )
                ];
        }
    }

    resultEl.textContent =
        password;
}


/* =========================================================
   NOTES
========================================================= */

function openNotes() {

    const html = `

        <div class="formTool">

            <input
                id="noteTitle"
                class="toolInput"
                type="text"
                maxlength="100"
                placeholder="Note title"
            >

            <textarea
                id="noteContent"
                class="toolTextarea"
                rows="6"
                maxlength="5000"
                placeholder="Write your note..."
            ></textarea>

            <button
                class="primaryButton"
                onclick="saveNote()">
                Save Note
            </button>

            <div id="notesList"></div>

        </div>
    `;

    openToolModal(
        "Quick Notes",
        html
    );

    renderNotes();
}


function saveNote() {

    const title =
        document.getElementById(
            "noteTitle"
        )?.value.trim() || "";

    const content =
        document.getElementById(
            "noteContent"
        )?.value.trim() || "";

    if (!title && !content) return;

    savedNotes.unshift({

        title,
        content,

        date:
            new Date().toLocaleString()
    });

    savedNotes =
        savedNotes.slice(0, 100);

    localStorage.setItem(
        "leoCalcNotes",
        JSON.stringify(savedNotes)
    );

    const titleEl =
        document.getElementById("noteTitle");

    const contentEl =
        document.getElementById("noteContent");

    if (titleEl) titleEl.value = "";
    if (contentEl) contentEl.value = "";

    renderNotes();
}


function loadNotes() {
    renderNotes();
}


function renderNotes() {

    const list =
        document.getElementById(
            "notesList"
        );

    if (!list) return;

    if (!savedNotes.length) {

        list.innerHTML =
            `
            <p style="
                margin-top:15px;
                color:rgba(255,255,255,.3);
                text-align:center;
            ">
                No notes yet.
            </p>
            `;

        return;
    }

    list.innerHTML =
        savedNotes
            .map((note, index) => {

                return `
                    <div style="
                        margin-top:10px;
                        padding:13px;
                        border-radius:14px;
                        background:rgba(255,255,255,.05);
                    ">

                        <strong>
                            ${escapeHTML(note.title)}
                        </strong>

                        <p style="
                            margin-top:6px;
                            color:rgba(255,255,255,.55);
                            font-size:10px;
                            white-space:pre-wrap;
                        ">
                            ${escapeHTML(note.content)}
                        </p>

                        <small style="
                            display:block;
                            margin-top:7px;
                            color:rgba(255,255,255,.25);
                        ">
                            ${escapeHTML(note.date || "")}
                        </small>

                        <button
                            onclick="deleteNote(${index})"
                            style="
                                margin-top:8px;
                                padding:6px 9px;
                                border-radius:8px;
                                background:rgba(255,60,100,.1);
                                color:#ff8aaa;
                                font-size:8px;
                            ">
                            Delete
                        </button>

                    </div>
                `;
            })
            .join("");
}


function deleteNote(index) {

    if (
        index < 0 ||
        index >= savedNotes.length
    ) {
        return;
    }

    savedNotes.splice(
        index,
        1
    );

    localStorage.setItem(
        "leoCalcNotes",
        JSON.stringify(savedNotes)
    );

    renderNotes();
}


/* =========================================================
   QR
========================================================= */

function openQR() {

    const html = `

        <div class="formTool">

            <input
                id="qrText"
                class="toolInput"
                type="text"
                maxlength="2000"
                placeholder="Enter text or URL"
            >

            <button
                class="primaryButton"
                onclick="generateQR()">
                Generate QR
            </button>

            <div
                id="qrResult"
                style="
                    margin-top:20px;
                    text-align:center;
                ">
            </div>

        </div>
    `;

    openToolModal(
        "QR Generator",
        html
    );
}


function generateQR() {

    const text =
        document.getElementById(
            "qrText"
        )?.value.trim();

    const resultEl =
        document.getElementById(
            "qrResult"
        );

    if (!resultEl) return;

    if (!text) {

        resultEl.textContent =
            "Enter text or URL.";

        return;
    }

    const encoded =
        encodeURIComponent(text);

    resultEl.innerHTML =
        `
        <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encoded}"
            alt="QR Code"
            width="220"
            height="220"
            style="
                width:220px;
                height:220px;
                border-radius:12px;
                background:white;
                padding:8px;
                max-width:100%;
            "
        >
        `;
}


/* =========================================================
   TOOL MODAL
========================================================= */

function openToolModal(
    title,
    content
) {

    const modal =
        document.getElementById(
            "toolModal"
        );

    const titleBox =
        document.getElementById(
            "modalTitle"
        );

    const body =
        document.getElementById(
            "modalBody"
        );

    if (!modal || !titleBox || !body) {
        return;
    }

    titleBox.textContent =
        title;

    body.innerHTML =
        content;

    modal.classList.remove(
        "hidden"
    );

    document.body.classList.add(
        "modal-open"
    );

    setTimeout(() => {

        const firstInput =
            body.querySelector(
                "input, textarea, select"
            );

        if (firstInput) {
            firstInput.focus({
                preventScroll: true
            });
        }

    }, 100);
}


function closeToolModal() {

    const modal =
        document.getElementById(
            "toolModal"
        );

    if (modal) {

        modal.classList.add(
            "hidden"
        );
    }

    document.body.classList.remove(
        "modal-open"
    );
}


/* =========================================================
   SIDE MENU
========================================================= */

function openMenu() {

    const menu =
        document.getElementById(
            "sideMenu"
        );

    const overlay =
        document.getElementById(
            "sideOverlay"
        );

    if (menu) {
        menu.classList.add("open");
    }

    if (overlay) {
        overlay.classList.add("open");
    }

    document.body.classList.add(
        "menu-open"
    );
}


function closeMenu() {

    const menu =
        document.getElementById(
            "sideMenu"
        );

    const overlay =
        document.getElementById(
            "sideOverlay"
        );

    if (menu) {
        menu.classList.remove("open");
    }

    if (overlay) {
        overlay.classList.remove("open");
    }

    document.body.classList.remove(
        "menu-open"
    );
}


/* =========================================================
   HOME
========================================================= */

function showHome() {

    closeCalculator();

    closeToolModal();

    closeMenu();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   FAVORITES / SAVED
========================================================= */

function showFavorites() {

    openToolModal(
        "Saved",
        `
        <div style="
            text-align:center;
            padding:30px;
        ">

            <div style="
                font-size:45px;
            ">
                ⭐
            </div>

            <h3>
                LeoCalc Saved
            </h3>

            <p style="
                margin-top:8px;
                color:rgba(255,255,255,.4);
            ">
                Your saved calculations and notes
                will appear here.
            </p>

        </div>
        `
    );
}


/* =========================================================
   SEARCH
========================================================= */

function searchTools(query) {

    query =
        String(query || "")
            .toLowerCase()
            .trim();

    const cards =
        document.querySelectorAll(
            ".toolCard"
        );

    cards.forEach(card => {

        const name =
            (
                card.dataset.name || ""
            ).toLowerCase();

        card.style.display =
            !query ||
            name.includes(query)
                ? ""
                : "none";
    });
}


/* =========================================================
   VOICE SEARCH
========================================================= */

function startVoiceSearch() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        alert(
            "Voice search is not supported on this browser."
        );

        return;
    }

    const recognition =
        new SpeechRecognition();

    recognition.lang = "en-IN";

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;

    recognition.onresult =
        event => {

            const text =
                event.results[0][0].transcript;

            const input =
                document.getElementById(
                    "globalSearch"
                );

            if (input) {

                input.value = text;

                searchTools(text);
            }
        };

    recognition.onerror =
        error => {

            console.error(
                "Voice search error:",
                error
            );
        };

    try {

        recognition.start();

    } catch (error) {

        console.error(
            "Voice recognition could not start:",
            error
        );
    }
}


/* =========================================================
   THEME
========================================================= */

function toggleTheme() {

    document.body.classList.toggle(
        "lightMode"
    );

    const light =
        document.body.classList.contains(
            "lightMode"
        );

    localStorage.setItem(
        "leoCalcTheme",
        light ? "light" : "dark"
    );
}


function loadTheme() {

    const theme =
        localStorage.getItem(
            "leoCalcTheme"
        );

    if (theme === "light") {

        document.body.classList.add(
            "lightMode"
        );
    }
}


/* =========================================================
   ENGINEERING TAB
========================================================= */

function openEngineering() {

    openCalculator();

    setTimeout(() => {

        const buttons =
            document.querySelectorAll(
                ".calcTab"
            );

        const button =
            buttons[1];

        switchCalcTab(
            "engineering",
            button
        );

    }, 50);
}


/* =========================================================
   KEYBOARD SUPPORT
========================================================= */

function setupKeyboard() {

    document.addEventListener(
        "keydown",
        event => {

            const calculator =
                document.getElementById(
                    "calculatorScreen"
                );

            if (
                !calculator ||
                calculator.classList.contains("hidden")
            ) {
                return;
            }

            /*
               Don't intercept typing inside
               normal inputs/textareas.
            */

            const target =
                event.target;

            if (
                target &&
                (
                    target.tagName === "INPUT" ||
                    target.tagName === "TEXTAREA" ||
                    target.tagName === "SELECT"
                )
            ) {
                return;
            }

            const key =
                event.key;

            if (/^[0-9.]$/.test(key)) {

                calcInput(key);

            } else if (
                ["+", "-", "*", "/", "%", "(", ")"]
                    .includes(key)
            ) {

                calcInput(key);

            } else if (
                key === "Enter" ||
                key === "="
            ) {

                event.preventDefault();

                calculateResult();

            } else if (
                key === "Backspace"
            ) {

                deleteCalc();

            } else if (
                key === "Escape"
            ) {

                closeCalculator();
                closeToolModal();
                closeMenu();

            } else if (
                key.toLowerCase() === "c"
            ) {

                clearCalc();
            }
        }
    );
}


/* =========================================================
   MOBILE VIEWPORT / KEYBOARD
========================================================= */

function setupMobileViewport() {

    if (!window.visualViewport) return;

    const updateViewport =
        () => {

            const height =
                window.visualViewport.height;

            document.documentElement
                .style
                .setProperty(
                    "--visual-height",
                    `${height}px`
                );
        };

    updateViewport();

    window.visualViewport.addEventListener(
        "resize",
        updateViewport
    );

    window.visualViewport.addEventListener(
        "scroll",
        updateViewport
    );
}


/* =========================================================
   TOUCH SWIPE MENU
========================================================= */

document.addEventListener(
    "touchstart",
    event => {

        if (!event.touches.length) return;

        touchStartX =
            event.touches[0].clientX;

    },
    { passive: true }
);


document.addEventListener(
    "touchend",
    event => {

        if (!event.changedTouches.length) return;

        const touchEndX =
            event.changedTouches[0].clientX;

        const difference =
            touchEndX - touchStartX;

        if (
            difference > 80 &&
            touchStartX < 40
        ) {

            openMenu();
        }

        if (
            difference < -80
        ) {

            closeMenu();
        }

    },
    { passive: true }
);


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


/* =========================================================
   MODAL CLEANUP
========================================================= */

window.addEventListener(
    "resize",
    () => {

        /*
           Stopwatch display is updated when
           modal becomes visible again.
        */

        updateStopwatch();
    }
);


/* =========================================================
   GLOBAL ERROR PROTECTION
========================================================= */

window.addEventListener(
    "error",
    event => {

        console.error(
            "LeoCalc error:",
            event.error || event.message
        );
    }
);


/* =========================================================
   FINAL
========================================================= */

console.log(
    "%cLeoCalc v2.0 Ready 🚀",
    "font-weight:bold;"
);
