/* =========================================================
   LEO CALC — COMPLETE JAVASCRIPT
   ========================================================= */

"use strict";


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let expression = "";
let answer = 0;
let angleModeValue = "DEG";

let history =
    JSON.parse(localStorage.getItem("leoCalcHistory") || "[]");

let notes =
    JSON.parse(localStorage.getItem("leoCalcNotes") || "[]");

let favorites =
    JSON.parse(localStorage.getItem("leoCalcFavorites") || "[]");

let stopwatchInterval = null;
let stopwatchSeconds = 0;

let clockInterval = null;


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadLogo();

    startSplash();

    startClock();

    renderHistory();

    renderFavorites();

    document.addEventListener("keydown", handleKeyboard);

});


/* =========================================================
   LOGO UPLOAD
   ========================================================= */

const logoUpload =
    document.getElementById("logoUpload");

if (logoUpload) {

    logoUpload.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {

            alert("Please select an image file.");

            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {

            const imageData = event.target.result;

            localStorage.setItem(
                "leoCalcLogo",
                imageData
            );

            applyLogo(imageData);

        };

        reader.readAsDataURL(file);

    });
}


/* =========================================================
   LOAD LOGO
   ========================================================= */

function loadLogo() {

    const savedLogo =
        localStorage.getItem("leoCalcLogo");

    if (savedLogo) {

        applyLogo(savedLogo);

    }
}


function applyLogo(src) {

    const ids = [
        "splashLogo",
        "headerLogo",
        "menuLogo"
    ];

    ids.forEach(id => {

        const img =
            document.getElementById(id);

        if (img) {

            img.src = src;

            img.style.display = "block";
        }

    });


    const placeholders = [
        "logoPlaceholder",
        "headerLC",
        "menuLC"
    ];

    placeholders.forEach(id => {

        const el =
            document.getElementById(id);

        if (el) {
            el.style.display = "none";
        }

    });

}


/* =========================================================
   SPLASH
   ========================================================= */

function startSplash() {

    const splash =
        document.getElementById("splashScreen");

    const progress =
        document.getElementById("loadingProgress");

    const percent =
        document.getElementById("loadingPercent");

    const text =
        document.getElementById("loadingText");

    const main =
        document.getElementById("mainApp");

    if (!splash) return;

    let value = 0;

    const messages = [
        "INITIALIZING...",
        "LOADING ENGINE...",
        "PREPARING TOOLS...",
        "LOADING CALCULATOR...",
        "FINALIZING..."
    ];

    const timer =
        setInterval(() => {

            value += 2;

            if (value > 100) {
                value = 100;
            }

            if (progress) {
                progress.style.width =
                    value + "%";
            }

            if (percent) {
                percent.textContent =
                    value + "%";
            }

            if (text) {

                const index =
                    Math.min(
                        Math.floor(value / 20),
                        messages.length - 1
                    );

                text.textContent =
                    messages[index];
            }

            if (value >= 100) {

                clearInterval(timer);

                setTimeout(() => {

                    splash.classList.add("hide");

                    if (main) {
                        main.classList.remove("hidden");
                    }

                }, 500);
            }

        }, 35);
}


/* =========================================================
   CLOCK
   ========================================================= */

function startClock() {

    updateClock();

    if (clockInterval) {
        clearInterval(clockInterval);
    }

    clockInterval =
        setInterval(updateClock, 1000);
}

function updateClock() {

    const now = new Date();

    const time =
        now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

    const date =
        now.toLocaleDateString([], {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

    const clock =
        document.getElementById("liveClock");

    const dateEl =
        document.getElementById("liveDate");

    if (clock) clock.textContent = time;
    if (dateEl) dateEl.textContent = date;
}


/* =========================================================
   PAGE NAVIGATION
   ========================================================= */

function hidePages() {

    document
        .querySelectorAll(".page")
        .forEach(page => {
            page.classList.add("hidden");
        });
}


function showHome() {

    hidePages();

    document
        .getElementById("homePage")
        ?.classList.remove("hidden");

    closeToolModal();

    updateBottomNav(0);

    window.scrollTo(0,0);
}


function openCalculator() {

    hidePages();

    document
        .getElementById("calculatorPage")
        ?.classList.remove("hidden");

    updateBottomNav(1);

    window.scrollTo(0,0);

    updateCalculatorDisplay();
}


function showFavorites() {

    hidePages();

    document
        .getElementById("favoritesPage")
        ?.classList.remove("hidden");

    renderFavorites();

    updateBottomNav(2);
}


function updateBottomNav(index) {

    document
        .querySelectorAll(".bottomNav button")
        .forEach((button, i) => {

            button.classList.toggle(
                "active",
                i === index
            );

        });
}


/* =========================================================
   CALCULATOR
   ========================================================= */

function calcInput(value) {

    expression += value;

    updateCalculatorDisplay();
}


function calcFunction(value) {

    if (value === "^2") {

        expression += "^2";

    } else if (value === "^3") {

        expression += "^3";

    } else if (value === "!") {

        expression += "!";

    } else {

        expression += value;

    }

    updateCalculatorDisplay();
}


function insertConstant(value) {

    if (value === "pi") {

        expression += "π";

    } else {

        expression += "e";

    }

    updateCalculatorDisplay();
}


function clearCalc() {

    expression = "";

    updateCalculatorDisplay();

    const result =
        document.getElementById("calcResult");

    if (result) {
        result.textContent = "0";
    }
}


function deleteCalc() {

    expression =
        expression.slice(0,-1);

    updateCalculatorDisplay();
}


function toggleSign() {

    if (!expression) {

        expression = "-";

    } else {

        expression =
            expression.startsWith("-")
                ? expression.slice(1)
                : "-" + expression;
    }

    updateCalculatorDisplay();
}


function insertRandom() {

    expression +=
        Math.random().toFixed(6);

    updateCalculatorDisplay();
}


function updateCalculatorDisplay() {

    const exp =
        document.getElementById("calcExpression");

    if (exp) {
        exp.textContent =
            expression || "0";
    }

    const ans =
        document.getElementById("answerValue");

    if (ans) {
        ans.textContent =
            formatNumber(answer);
    }
}


/* =========================================================
   ANGLE MODE
   ========================================================= */

document.addEventListener("click", event => {

    if (event.target.id === "angleMode") {

        if (angleModeValue === "DEG") {
            angleModeValue = "RAD";
        } else if (angleModeValue === "RAD") {
            angleModeValue = "GRAD";
        } else {
            angleModeValue = "DEG";
        }

        event.target.textContent =
            angleModeValue;
    }

});


/* =========================================================
   CALCULATOR EVALUATION
   ========================================================= */

function calculateResult() {

    if (!expression) return;

    try {

        const result =
            evaluateExpression(expression);

        if (!Number.isFinite(result)) {
            throw new Error("Invalid result");
        }

        answer = result;

        const resultEl =
            document.getElementById("calcResult");

        if (resultEl) {

            resultEl.textContent =
                formatNumber(result);
        }

        addHistory(
            expression,
            result
        );

        expression =
            String(
                Number(
                    result.toPrecision(14)
                )
            );

        updateCalculatorDisplay();

    } catch (error) {

        const resultEl =
            document.getElementById("calcResult");

        if (resultEl) {
            resultEl.textContent = "Error";
        }
    }
}


function evaluateExpression(input) {

    let exp = input;

    exp =
        exp
            .replaceAll("×","*")
            .replaceAll("÷","/")
            .replaceAll("−","-")
            .replaceAll("π","Math.PI")
            .replace(/\bAns\b/g,"answer");

    exp =
        exp.replace(/\^/g,"**");

    exp =
        exp.replace(/\be\b/g,"Math.E");

    /* percentage */

    exp =
        exp.replace(
            /(\d+(?:\.\d+)?)%/g,
            "($1/100)"
        );

    /* factorial */

    exp =
        replaceFactorials(exp);

    /* functions */

    exp =
        exp.replace(
            /sqrt\(/g,
            "Math.sqrt("
        );

    exp =
        exp.replace(
            /log\(/g,
            "Math.log10("
        );

    exp =
        exp.replace(
            /ln\(/g,
            "Math.log("
        );

    exp =
        exp.replace(
            /sin\(/g,
            "trigSin("
        );

    exp =
        exp.replace(
            /cos\(/g,
            "trigCos("
        );

    exp =
        exp.replace(
            /tan\(/g,
            "trigTan("
        );


    /* safe characters */

    if (
        !/^[0-9+\-*/().,\sA-Za-z_]+$/.test(exp)
    ) {

        throw new Error("Invalid expression");
    }


    const fn =
        new Function(
            "answer",
            "trigSin",
            "trigCos",
            "trigTan",
            `"use strict"; return (${exp});`
        );

    return fn(
        answer,
        trigSin,
        trigCos,
        trigTan
    );
}


function replaceFactorials(exp) {

    const regex =
        /(\d+(?:\.\d+)?)!/;

    while (regex.test(exp)) {

        exp =
            exp.replace(
                regex,
                (_, value) =>
                    `factorial(${value})`
            );
    }

    return exp;
}


function factorial(n) {

    if (
        !Number.isInteger(n) ||
        n < 0 ||
        n > 170
    ) {
        throw new Error("Invalid factorial");
    }

    let result = 1;

    for (let i = 2; i <= n; i++) {
        result *= i;
    }

    return result;
}


/* =========================================================
   TRIG
   ========================================================= */

function toRadians(value) {

    if (angleModeValue === "DEG") {
        return value * Math.PI / 180;
    }

    if (angleModeValue === "GRAD") {
        return value * Math.PI / 200;
    }

    return value;
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


function formatNumber(value) {

    if (!Number.isFinite(value)) {
        return "Error";
    }

    if (Math.abs(value) >= 1e12) {
        return value.toExponential(8);
    }

    return Number(
        value.toPrecision(12)
    ).toString();
}


/* =========================================================
   HISTORY
   ========================================================= */

function addHistory(exp, result) {

    history.unshift({

        expression: exp,

        result: result,

        time: new Date().toLocaleString()

    });

    history =
        history.slice(0,30);

    localStorage.setItem(
        "leoCalcHistory",
        JSON.stringify(history)
    );

    renderHistory();
}


function renderHistory() {

    const list =
        document.getElementById("historyList");

    if (!list) return;

    if (!history.length) {

        list.innerHTML =
            `<p style="color:#777d95;font-size:11px;">
                No calculations yet.
             </p>`;

        return;
    }

    list.innerHTML =
        history.map((item,index) => `

            <div class="historyItem">

                <div>

                    <div class="historyExpression">
                        ${escapeHTML(item.expression)}
                    </div>

                    <div class="historyResult">
                        = ${escapeHTML(
                            formatNumber(item.result)
                        )}
                    </div>

                </div>

                <button onclick="useHistory(${index})">
                    Use
                </button>

            </div>

        `).join("");
}


function useHistory(index) {

    if (!history[index]) return;

    expression =
        String(history[index].result);

    answer =
        Number(history[index].result);

    updateCalculatorDisplay();
}


function clearHistory() {

    history = [];

    localStorage.removeItem(
        "leoCalcHistory"
    );

    renderHistory();
}


/* =========================================================
   CALCULATOR TABS
   ========================================================= */

function switchCalcTab(tab, button) {

    document
        .querySelectorAll(".calcTabs button")
        .forEach(btn =>
            btn.classList.remove("active")
        );

    button.classList.add("active");

    document
        .getElementById("scientificPanel")
        ?.classList.add("hidden");

    document
        .getElementById("engineeringPanel")
        ?.classList.add("hidden");

    document
        .getElementById("utilitiesPanel")
        ?.classList.add("hidden");

    const panel =
        document.getElementById(
            tab + "Panel"
        );

    if (panel) {
        panel.classList.remove("hidden");
    }
}


function openEngineering() {

    openCalculator();

    const button =
        document.querySelectorAll(
            ".calcTabs button"
        )[1];

    switchCalcTab(
        "engineering",
        button
    );
}


/* =========================================================
   ENGINEERING TOOLS
   ========================================================= */

function engineeringTool(type) {

    switch(type) {

        case "ohm":
            openOhm();
            break;

        case "power":
            openPower();
            break;

        case "resistor":
            openResistor();
            break;

        case "frequency":
            openFrequency();
            break;

        case "percentage":
            openPercentage();
            break;

        case "interest":
            openInterest();
            break;

        case "emi":
            openEMI();
            break;

        case "bmi":
            openBMI();
            break;
    }
}


/* =========================================================
   OHM
   ========================================================= */

function openOhm() {

    openModal(
        "Ohm's Law",
        `

        <div class="formGroup">
            <label>Voltage (V)</label>
            <input id="ohmV" type="number" placeholder="Optional">
        </div>

        <div class="formGroup">
            <label>Current (A)</label>
            <input id="ohmI" type="number" placeholder="Optional">
        </div>

        <div class="formGroup">
            <label>Resistance (Ω)</label>
            <input id="ohmR" type="number" placeholder="Optional">
        </div>

        <button class="actionButton"
                onclick="calculateOhm()">
            Calculate
        </button>

        <div id="ohmResult"></div>
        `
    );
}


function calculateOhm() {

    const V =
        parseFloat(document.getElementById("ohmV").value);

    const I =
        parseFloat(document.getElementById("ohmI").value);

    const R =
        parseFloat(document.getElementById("ohmR").value);

    let result = "";

    if (Number.isFinite(V) && Number.isFinite(I) && I !== 0) {

        result =
            `Resistance = ${formatNumber(V/I)} Ω`;

    } else if (
        Number.isFinite(V) &&
        Number.isFinite(R) &&
        R !== 0
    ) {

        result =
            `Current = ${formatNumber(V/R)} A`;

    } else if (
        Number.isFinite(I) &&
        Number.isFinite(R)
    ) {

        result =
            `Voltage = ${formatNumber(I*R)} V`;

    } else {

        result =
            "Enter any two values.";
    }

    document.getElementById("ohmResult").innerHTML =
        `<div class="resultBox">${result}</div>`;
}


/* =========================================================
   POWER
   ========================================================= */

function openPower() {

    openModal(
        "Electrical Power",
        `

        <div class="formGroup">
            <label>Voltage (V)</label>
            <input id="powerV" type="number">
        </div>

        <div class="formGroup">
            <label>Current (A)</label>
            <input id="powerI" type="number">
        </div>

        <button class="actionButton"
                onclick="calculatePower()">
            Calculate P = V × I
        </button>

        <div id="powerResult"></div>
        `
    );
}


function calculatePower() {

    const V =
        parseFloat(document.getElementById("powerV").value);

    const I =
        parseFloat(document.getElementById("powerI").value);

    if (!Number.isFinite(V) || !Number.isFinite(I)) {

        document.getElementById("powerResult").innerHTML =
            `<div class="resultBox">
                Enter valid values.
             </div>`;

        return;
    }

    document.getElementById("powerResult").innerHTML =
        `<div class="resultBox">
            Power = <b>${formatNumber(V*I)} W</b>
         </div>`;
}


/* =========================================================
   RESISTOR
   ========================================================= */

function openResistor() {

    openModal(
        "Resistor Calculator",
        `

        <div class="formGroup">
            <label>R1 (Ω)</label>
            <input id="r1" type="number">
        </div>

        <div class="formGroup">
            <label>R2 (Ω)</label>
            <input id="r2" type="number">
        </div>

        <button class="actionButton"
                onclick="calculateResistor()">
            Calculate
        </button>

        <div id="resistorResult"></div>
        `
    );
}


function calculateResistor() {

    const r1 =
        parseFloat(document.getElementById("r1").value);

    const r2 =
        parseFloat(document.getElementById("r2").value);

    if (
        !Number.isFinite(r1) ||
        !Number.isFinite(r2)
    ) {

        document.getElementById("resistorResult").innerHTML =
            `<div class="resultBox">
                Enter valid resistance values.
             </div>`;

        return;
    }

    const series = r1 + r2;

    const parallel =
        r1 + r2 === 0
            ? 0
            : (r1*r2)/(r1+r2);

    document.getElementById("resistorResult").innerHTML =
        `
        <div class="resultBox">

            Series:
            <b>${formatNumber(series)} Ω</b>
            <br>

            Parallel:
            <b>${formatNumber(parallel)} Ω</b>

        </div>
        `;
}


/* =========================================================
   FREQUENCY
   ========================================================= */

function openFrequency() {

    openModal(
        "Frequency Calculator",
        `

        <div class="formGroup">
            <label>Frequency (Hz)</label>
            <input id="frequencyHz" type="number">
        </div>

        <button class="actionButton"
                onclick="calculateFrequency()">
            Calculate
        </button>

        <div id="frequencyResult"></div>
        `
    );
}


function calculateFrequency() {

    const f =
        parseFloat(
            document.getElementById("frequencyHz").value
        );

    if (!Number.isFinite(f) || f <= 0) {

        document.getElementById("frequencyResult").innerHTML =
            `<div class="resultBox">
                Enter a valid frequency.
             </div>`;

        return;
    }

    const period = 1/f;

    document.getElementById("frequencyResult").innerHTML =
        `
        <div class="resultBox">

            Period:
            <b>${formatNumber(period)} s</b>

            <br>

            Angular Frequency:
            <b>${formatNumber(2*Math.PI*f)} rad/s</b>

        </div>
        `;
}


/* =========================================================
   PERCENTAGE
   ========================================================= */

function openPercentage() {

    openModal(
        "Percentage",
        `

        <div class="formGroup">
            <label>Value</label>
            <input id="percentValue" type="number">
        </div>

        <div class="formGroup">
            <label>Percentage (%)</label>
            <input id="percentRate" type="number">
        </div>

        <button class="actionButton"
                onclick="calculatePercentage()">
            Calculate
        </button>

        <div id="percentResult"></div>
        `
    );
}


function calculatePercentage() {

    const value =
        parseFloat(
            document.getElementById("percentValue").value
        );

    const rate =
        parseFloat(
            document.getElementById("percentRate").value
        );

    if (
        !Number.isFinite(value) ||
        !Number.isFinite(rate)
    ) return;

    const result =
        value * rate / 100;

    document.getElementById("percentResult").innerHTML =
        `
        <div class="resultBox">
            ${rate}% of ${value} =
            <b>${formatNumber(result)}</b>
        </div>
        `;
}


/* =========================================================
   INTEREST
   ========================================================= */

function openInterest() {

    openModal(
        "Simple Interest",
        `

        <div class="formGroup">
            <label>Principal</label>
            <input id="interestP" type="number">
        </div>

        <div class="formGroup">
            <label>Rate (%)</label>
            <input id="interestR" type="number">
        </div>

        <div class="formGroup">
            <label>Time (Years)</label>
            <input id="interestT" type="number">
        </div>

        <button class="actionButton"
                onclick="calculateInterest()">
            Calculate
        </button>

        <div id="interestResult"></div>
        `
    );
}


function calculateInterest() {

    const P =
        parseFloat(
            document.getElementById("interestP").value
        );

    const R =
        parseFloat(
            document.getElementById("interestR").value
        );

    const T =
        parseFloat(
            document.getElementById("interestT").value
        );

    if (
        !Number.isFinite(P) ||
        !Number.isFinite(R) ||
        !Number.isFinite(T)
    ) return;

    const interest =
        P*R*T/100;

    const total =
        P+interest;

    document.getElementById("interestResult").innerHTML =
        `
        <div class="resultBox">

            Interest:
            <b>${formatNumber(interest)}</b>

            <br>

            Total:
            <b>${formatNumber(total)}</b>

        </div>
        `;
}


/* =========================================================
   EMI
   ========================================================= */

function openEMI() {

    openModal(
        "EMI Calculator",
        `

        <div class="formGroup">
            <label>Loan Amount (₹)</label>
            <input id="emiP" type="number">
        </div>

        <div class="formGroup">
            <label>Annual Interest (%)</label>
            <input id="emiRate" type="number">
        </div>

        <div class="formGroup">
            <label>Tenure (Months)</label>
            <input id="emiMonths" type="number">
        </div>

        <button class="actionButton"
                onclick="calculateEMI()">
            Calculate EMI
        </button>

        <div id="emiResult"></div>
        `
    );
}


function calculateEMI() {

    const P =
        parseFloat(
            document.getElementById("emiP").value
        );

    const annual =
        parseFloat(
            document.getElementById("emiRate").value
        );

    const n =
        parseInt(
            document.getElementById("emiMonths").value
        );

    if (
        !Number.isFinite(P) ||
        !Number.isFinite(annual) ||
        !Number.isInteger(n) ||
        n <= 0
    ) {

        document.getElementById("emiResult").innerHTML =
            `<div class="resultBox">
                Enter valid loan details.
             </div>`;

        return;
    }

    const r =
        annual / 12 / 100;

    let emi;

    if (r === 0) {

        emi = P/n;

    } else {

        emi =
            P*r*
            Math.pow(1+r,n) /
            (Math.pow(1+r,n)-1);
    }

    const total =
        emi*n;

    const interest =
        total-P;

    document.getElementById("emiResult").innerHTML =
        `
        <div class="resultBox">

            Monthly EMI:
            <b>₹${formatNumber(emi)}</b>

            <br>

            Total Payment:
            <b>₹${formatNumber(total)}</b>

            <br>

            Total Interest:
            <b>₹${formatNumber(interest)}</b>

        </div>
        `;
}


/* =========================================================
   BMI
   ========================================================= */

function openBMI() {

    openModal(
        "BMI Calculator",
        `

        <div class="formGroup">
            <label>Weight (kg)</label>
            <input id="bmiWeight" type="number">
        </div>

        <div class="formGroup">
            <label>Height (cm)</label>
            <input id="bmiHeight" type="number">
        </div>

        <button class="actionButton"
                onclick="calculateBMI()">
            Calculate BMI
        </button>

        <div id="bmiResult"></div>
        `
    );
}


function calculateBMI() {

    const weight =
        parseFloat(
            document.getElementById("bmiWeight").value
        );

    const height =
        parseFloat(
            document.getElementById("bmiHeight").value
        );

    if (
        !Number.isFinite(weight) ||
        !Number.isFinite(height) ||
        height <= 0
    ) return;

    const meters =
        height/100;

    const bmi =
        weight/(meters*meters);

    let category;

    if (bmi < 18.5) {
        category = "Below standard range";
    } else if (bmi < 25) {
        category = "Standard range";
    } else if (bmi < 30) {
        category = "Above standard range";
    } else {
        category = "High range";
    }

    document.getElementById("bmiResult").innerHTML =
        `
        <div class="resultBox">

            BMI:
            <b>${formatNumber(bmi)}</b>

            <br>

            ${category}

        </div>
        `;
}


/* =========================================================
   TIME & DATE
   ========================================================= */

function openTimeDate() {

    openModal(
        "Time & Date",
        `

        <div class="bigTime" id="bigTime">
            --
        </div>

        <div class="bigDate" id="bigDate">
            --
        </div>

        <hr style="
            border:0;
            border-top:1px solid rgba(255,255,255,.08);
        ">

        <div class="stopwatch"
             id="stopwatch">
            00:00:00
        </div>

        <div class="buttonRow">

            <button onclick="startStopwatch()">
                Start
            </button>

            <button onclick="pauseStopwatch()">
                Pause
            </button>

            <button onclick="resetStopwatch()">
                Reset
            </button>

        </div>
        `
    );

    updateBigTime();
}


function updateBigTime() {

    const now = new Date();

    const time =
        now.toLocaleTimeString();

    const date =
        now.toLocaleDateString(
            [],
            {
                weekday:"long",
                year:"numeric",
                month:"long",
                day:"numeric"
            }
        );

    const t =
        document.getElementById("bigTime");

    const d =
        document.getElementById("bigDate");

    if (t) t.textContent = time;
    if (d) d.textContent = date;
}


setInterval(
    updateBigTime,
    1000
);


/* =========================================================
   STOPWATCH
   ========================================================= */

function startStopwatch() {

    if (stopwatchInterval) return;

    stopwatchInterval =
        setInterval(() => {

            stopwatchSeconds++;

            renderStopwatch();

        },1000);
}


function pauseStopwatch() {

    clearInterval(stopwatchInterval);

    stopwatchInterval = null;
}


function resetStopwatch() {

    pauseStopwatch();

    stopwatchSeconds = 0;

    renderStopwatch();
}


function renderStopwatch() {

    const h =
        Math.floor(stopwatchSeconds/3600);

    const m =
        Math.floor(
            (stopwatchSeconds%3600)/60
        );

    const s =
        stopwatchSeconds%60;

    const el =
        document.getElementById("stopwatch");

    if (!el) return;

    el.textContent =
        `${String(h).padStart(2,"0")}:
         ${String(m).padStart(2,"0")}:
         ${String(s).padStart(2,"0")}`;
}


/* =========================================================
   WEATHER
   ========================================================= */

function openWeather() {

    openModal(
        "Weather",
        `

        <div class="weatherMain">

            <div id="weatherStatus">
                Getting your location...
            </div>

            <div id="weatherContent"></div>

        </div>
        `
    );

    getWeather();
}


function getWeather() {

    if (!navigator.geolocation) {

        setWeatherStatus(
            "Geolocation is not supported."
        );

        return;
    }

    navigator.geolocation.getCurrentPosition(

        async position => {

            const lat =
                position.coords.latitude;

            const lon =
                position.coords.longitude;

            try {

                const url =
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`;

                const response =
                    await fetch(url);

                const data =
                    await response.json();

                const current =
                    data.current;

                const content =
                    document.getElementById(
                        "weatherContent"
                    );

                if (content) {

                    content.innerHTML =
                        `
                        <div class="weatherTemp">
                            ${Math.round(
                                current.temperature_2m
                            )}°C
                        </div>

                        <div class="weatherInfo">

                            Humidity:
                            ${current.relative_humidity_2m}%

                            <br>

                            Wind:
                            ${current.wind_speed_10m} km/h

                        </div>
                        `;
                }

                setWeatherStatus(
                    "Current weather"
                );

            } catch(error) {

                setWeatherStatus(
                    "Unable to load weather."
                );
            }

        },

        () => {

            setWeatherStatus(
                "Location permission was denied."
            );

        }
    );
}


function setWeatherStatus(text) {

    const el =
        document.getElementById(
            "weatherStatus"
        );

    if (el) {
        el.textContent = text;
    }
}


/* =========================================================
   CONVERTER
   ========================================================= */

function openConverter() {

    openModal(
        "Engineering Converter",
        `

        <div class="formGroup">
            <label>Category</label>

            <select id="converterCategory"
                    onchange="updateConverterUnits()">

                <option value="length">
                    Length
                </option>

                <option value="mass">
                    Mass
                </option>

                <option value="temperature">
                    Temperature
                </option>

                <option value="speed">
                    Speed
                </option>

                <option value="area">
                    Area
                </option>

                <option value="volume">
                    Volume
                </option>

                <option value="data">
                    Data
                </option>

                <option value="energy">
                    Energy
                </option>

                <option value="power">
                    Power
                </option>

                <option value="pressure">
                    Pressure
                </option>

            </select>
        </div>

        <div class="formGroup">
            <label>From</label>

            <select id="converterFrom"></select>
        </div>

        <div class="formGroup">
            <label>To</label>

            <select id="converterTo"></select>
        </div>

        <div class="formGroup">
            <label>Value</label>

            <input
                id="converterValue"
                type="number"
            >
        </div>

        <button class="actionButton"
                onclick="calculateConversion()">
            Convert
        </button>

        <div id="converterResult"></div>
        `
    );

    updateConverterUnits();
}


const converterUnits = {

    length: {
        meter: 1,
        kilometer: 1000,
        centimeter: .01,
        millimeter: .001,
        foot: .3048,
        inch: .0254
    },

    mass: {
        kilogram: 1,
        gram: .001,
        milligram: .000001,
        pound: .453592
    },

    speed: {
        "m/s": 1,
        "km/h": 1/3.6,
        mph: .44704
    },

    area: {
        "m²": 1,
        "km²": 1000000,
        "cm²": .0001,
        "ft²": .092903
    },

    volume: {
        "m³": 1,
        liter: .001,
        milliliter: .000001
    },

    data: {
        byte: 1,
        KB: 1024,
        MB: 1024**2,
        GB: 1024**3
    },

    energy: {
        joule: 1,
        kilojoule: 1000,
        calorie: 4.184,
        kWh: 3600000
    },

    power: {
        watt: 1,
        kilowatt: 1000,
        megawatt: 1000000,
        horsepower: 745.7
    },

    pressure: {
        pascal: 1,
        kilopascal: 1000,
        bar: 100000,
        atm: 101325,
        psi: 6894.76
    }
};


function updateConverterUnits() {

    const category =
        document.getElementById(
            "converterCategory"
        )?.value;

    const from =
        document.getElementById(
            "converterFrom"
        );

    const to =
        document.getElementById(
            "converterTo"
        );

    if (!from || !to) return;

    if (category === "temperature") {

        from.innerHTML =
            `
            <option>Celsius</option>
            <option>Fahrenheit</option>
            <option>Kelvin</option>
            `;

        to.innerHTML =
            `
            <option>Celsius</option>
            <option>Fahrenheit</option>
            <option>Kelvin</option>
            `;

        return;
    }

    const units =
        converterUnits[category];

    if (!units) return;

    const options =
        Object.keys(units)
            .map(unit =>
                `<option>${unit}</option>`
            )
            .join("");

    from.innerHTML = options;
    to.innerHTML = options;
}


function calculateConversion() {

    const category =
        document.getElementById(
            "converterCategory"
        ).value;

    const value =
        parseFloat(
            document.getElementById(
                "converterValue"
            ).value
        );

    const from =
        document.getElementById(
            "converterFrom"
        ).value;

    const to =
        document.getElementById(
            "converterTo"
        ).value;

    if (!Number.isFinite(value)) {

        document.getElementById(
            "converterResult"
        ).innerHTML =
            `<div class="resultBox">
                Enter a valid value.
             </div>`;

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
            converterUnits[category];

        result =
            value *
            units[from] /
            units[to];
    }

    document.getElementById(
        "converterResult"
    ).innerHTML =
        `
        <div class="resultBox">

            ${value} ${from}
            =
            <b>${formatNumber(result)}
            ${to}</b>

        </div>
        `;
}


function convertTemperature(
    value,
    from,
    to
) {

    let celsius;

    if (from === "Celsius") {
        celsius = value;
    } else if (from === "Fahrenheit") {
        celsius = (value-32)*5/9;
    } else {
        celsius = value-273.15;
    }

    if (to === "Celsius") {
        return celsius;
    }

    if (to === "Fahrenheit") {
        return celsius*9/5+32;
    }

    return celsius+273.15;
}


/* =========================================================
   MONEY
   ========================================================= */

function openMoneyTools() {

    openModal(
        "Money Tools",
        `

        <div class="formGroup">
            <label>Tool</label>

            <select id="moneyType">

                <option value="gst">
                    GST
                </option>

                <option value="discount">
                    Discount
                </option>

            </select>
        </div>

        <div class="formGroup">
            <label>Amount</label>
            <input id="moneyAmount" type="number">
        </div>

        <div class="formGroup">
            <label>Rate (%)</label>
            <input id="moneyRate" type="number">
        </div>

        <button class="actionButton"
                onclick="calculateMoney()">
            Calculate
        </button>

        <div id="moneyResult"></div>

        `
    );
}


function calculateMoney() {

    const type =
        document.getElementById(
            "moneyType"
        ).value;

    const amount =
        parseFloat(
            document.getElementById(
                "moneyAmount"
            ).value
        );

    const rate =
        parseFloat(
            document.getElementById(
                "moneyRate"
            ).value
        );

    if (
        !Number.isFinite(amount) ||
        !Number.isFinite(rate)
    ) return;

    let result;

    if (type === "gst") {

        const tax =
            amount*rate/100;

        result =
            `
            GST = ₹${formatNumber(tax)}
            <br>
            Total = ₹${formatNumber(amount+tax)}
            `;

    } else {

        const discount =
            amount*rate/100;

        result =
            `
            Discount = ₹${formatNumber(discount)}
            <br>
            Final Price = ₹${formatNumber(amount-discount)}
            `;
    }

    document.getElementById(
        "moneyResult"
    ).innerHTML =
        `<div class="resultBox">${result}</div>`;
}


/* =========================================================
   STATISTICS
   ========================================================= */

function openStatistics() {

    openModal(
        "Statistics",
        `

        <div class="formGroup">

            <label>
                Numbers separated by comma
            </label>

            <textarea
                id="statsInput"
                rows="4"
                placeholder="10, 20, 30, 40"
            ></textarea>

        </div>

        <button class="actionButton"
                onclick="calculateStatistics()">
            Calculate
        </button>

        <div id="statsResult"></div>

        `
    );
}


function calculateStatistics() {

    const raw =
        document.getElementById(
            "statsInput"
        ).value;

    const numbers =
        raw
            .split(",")
            .map(Number)
            .filter(Number.isFinite);

    if (!numbers.length) return;

    const sorted =
        [...numbers].sort((a,b)=>a-b);

    const sum =
        numbers.reduce(
            (a,b)=>a+b,
            0
        );

    const mean =
        sum/numbers.length;

    let median;

    const middle =
        Math.floor(sorted.length/2);

    if (sorted.length%2) {

        median =
            sorted[middle];

    } else {

        median =
            (
                sorted[middle-1] +
                sorted[middle]
            ) / 2;
    }

    const variance =
        numbers.reduce(
            (total,n) =>
                total +
                Math.pow(n-mean,2),
            0
        ) / numbers.length;

    const sd =
        Math.sqrt(variance);

    document.getElementById(
        "statsResult"
    ).innerHTML =
        `
        <div class="resultBox">

            Count:
            <b>${numbers.length}</b>

            <br>

            Sum:
            <b>${formatNumber(sum)}</b>

            <br>

            Mean:
            <b>${formatNumber(mean)}</b>

            <br>

            Median:
            <b>${formatNumber(median)}</b>

            <br>

            Variance:
            <b>${formatNumber(variance)}</b>

            <br>

            Standard Deviation:
            <b>${formatNumber(sd)}</b>

        </div>
        `;
}


/* =========================================================
   NUMBER SYSTEM
   ========================================================= */

function openNumberSystem() {

    openModal(
        "Number System",
        `

        <div class="formGroup">
            <label>Decimal Integer</label>

            <input
                id="numberInput"
                type="number"
                step="1"
            >
        </div>

        <button class="actionButton"
                onclick="convertNumberSystem()">
            Convert
        </button>

        <div id="numberResult"></div>

        `
    );
}


function convertNumberSystem() {

    const number =
        Number(
            document.getElementById(
                "numberInput"
            ).value
        );

    if (
        !Number.isInteger(number)
    ) return;

    document.getElementById(
        "numberResult"
    ).innerHTML =
        `
        <div class="resultBox">

            Binary:
            <b>${number.toString(2)}</b>

            <br>

            Octal:
            <b>${number.toString(8)}</b>

            <br>

            Hexadecimal:
            <b>${number.toString(16).toUpperCase()}</b>

        </div>
        `;
}


/* =========================================================
   SECURITY
   ========================================================= */

function openSecurity() {

    openModal(
        "Password Generator",
        `

        <div class="passwordOutput"
             id="passwordOutput">
            Click Generate
        </div>

        <div class="formGroup">

            <label>Password Length</label>

            <input
                id="passwordLength"
                type="number"
                min="6"
                max="64"
                value="16"
            >

        </div>

        <button class="actionButton"
                onclick="generatePassword()">
            Generate Password
        </button>

        `
    );
}


function generatePassword() {

    let length =
        parseInt(
            document.getElementById(
                "passwordLength"
            ).value
        );

    if (!Number.isInteger(length)) {
        length = 16;
    }

    length =
        Math.min(
            64,
            Math.max(6,length)
        );

    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
        "abcdefghijklmnopqrstuvwxyz" +
        "0123456789" +
        "!@#$%^&*";

    let password = "";

    const random =
        new Uint32Array(length);

    crypto.getRandomValues(random);

    for (let i=0;i<length;i++) {

        password +=
            chars[
                random[i] % chars.length
            ];
    }

    document.getElementById(
        "passwordOutput"
    ).textContent =
        password;
}


/* =========================================================
   NOTES
   ========================================================= */

function openNotes() {

    openModal(
        "Quick Notes",
        `

        <div class="formGroup">
            <label>Title</label>

            <input
                id="noteTitle"
                placeholder="Note title"
            >
        </div>

        <div class="formGroup">
            <label>Note</label>

            <textarea
                id="noteContent"
                rows="5"
                placeholder="Write something..."
            ></textarea>
        </div>

        <button class="actionButton"
                onclick="saveNote()">
            Save Note
        </button>

        <div style="margin-top:20px">
            ${renderNotesHTML()}
        </div>

        `
    );
}


function saveNote() {

    const title =
        document.getElementById(
            "noteTitle"
        ).value.trim();

    const content =
        document.getElementById(
            "noteContent"
        ).value.trim();

    if (!title && !content) return;

    notes.unshift({

        id: Date.now(),

        title,

        content,

        date: new Date().toLocaleString()

    });

    localStorage.setItem(
        "leoCalcNotes",
        JSON.stringify(notes)
    );

    openNotes();
}


function renderNotesHTML() {

    if (!notes.length) {

        return `
            <p style="color:#777d95;font-size:11px">
                No notes yet.
            </p>
        `;
    }

    return notes.map(note => `

        <div class="note">

            <h4>
                ${escapeHTML(note.title || "Untitled")}
            </h4>

            <p>
                ${escapeHTML(note.content)}
            </p>

            <button onclick="deleteNote(${note.id})">
                Delete
            </button>

        </div>

    `).join("");
}


function deleteNote(id) {

    notes =
        notes.filter(
            note => note.id !== id
        );

    localStorage.setItem(
        "leoCalcNotes",
        JSON.stringify(notes)
    );

    openNotes();
}


/* =========================================================
   QR GENERATOR
   ========================================================= */

function openQR() {

    openModal(
        "QR Generator",
        `

        <div class="formGroup">

            <label>Text / URL</label>

            <textarea
                id="qrText"
                rows="4"
                placeholder="Enter text or URL"
            ></textarea>

        </div>

        <button class="actionButton"
                onclick="generateQR()">
            Generate QR
        </button>

        <div id="qrResult"></div>

        `
    );
}


function generateQR() {

    const text =
        document.getElementById(
            "qrText"
        ).value.trim();

    if (!text) return;

    const encoded =
        encodeURIComponent(text);

    const url =
        `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}`;

    document.getElementById(
        "qrResult"
    ).innerHTML =
        `
        <img
            class="qrImage"
            src="${url}"
            alt="QR Code"
        >
        `;
}


/* =========================================================
   MODAL
   ========================================================= */

function openModal(title, body) {

    const modal =
        document.getElementById(
            "toolModal"
        );

    const titleEl =
        document.getElementById(
            "modalTitle"
        );

    const bodyEl =
        document.getElementById(
            "modalBody"
        );

    if (!modal) return;

    titleEl.textContent = title;

    bodyEl.innerHTML = body;

    modal.classList.add("show");

    document.body.style.overflow = "hidden";
}


function closeToolModal() {

    const modal =
        document.getElementById(
            "toolModal"
        );

    if (modal) {
        modal.classList.remove("show");
    }

    document.body.style.overflow = "";
}


document
    .getElementById("toolModal")
    ?.addEventListener(
        "click",
        event => {

            if (
                event.target.id === "toolModal"
            ) {
                closeToolModal();
            }

        }
    );


/* =========================================================
   SIDE MENU
   ========================================================= */

function openMenu() {

    document
        .getElementById("sideMenu")
        ?.classList.add("show");

    document
        .getElementById("menuOverlay")
        ?.classList.add("show");
}


function closeMenu() {

    document
        .getElementById("sideMenu")
        ?.classList.remove("show");

    document
        .getElementById("menuOverlay")
        ?.classList.remove("show");
}


/* =========================================================
   SEARCH
   ========================================================= */

function searchTools(value) {

    const query =
        value.trim().toLowerCase();

    document
        .querySelectorAll(".toolCard")
        .forEach(card => {

            const name =
                card.dataset.name
                    .toLowerCase();

            card.style.display =
                !query ||
                name.includes(query)
                    ? "flex"
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
            "Voice search is not supported in this browser."
        );

        return;
    }

    const recognition =
        new SpeechRecognition();

    recognition.lang = "en-IN";

    recognition.start();

    recognition.onresult =
        event => {

            const text =
                event.results[0][0].transcript;

            const input =
                document.getElementById(
                    "searchInput"
                );

            input.value = text;

            searchTools(text);
        };
}


/* =========================================================
   FAVORITES
   ========================================================= */

function renderFavorites() {

    const list =
        document.getElementById(
            "favoritesList"
        );

    if (!list) return;

    if (!favorites.length) {

        list.innerHTML =
            `
            <div class="favoriteItem">
                <h3>No Favorites Yet</h3>
                <p style="
                    color:#777d95;
                    margin-top:5px;
                    font-size:11px;
                ">
                    Favorite tools will appear here.
                </p>
            </div>
            `;

        return;
    }

    list.innerHTML =
        favorites.map(item => `

            <div class="favoriteItem">

                <h3>
                    ${escapeHTML(item.name)}
                </h3>

                <button
                    class="smallButton"
                    onclick="removeFavorite('${item.name}')"
                >
                    Remove
                </button>

            </div>

        `).join("");
}


function addFavorite(name) {

    if (
        !favorites.some(
            item => item.name === name
        )
    ) {

        favorites.push({
            name
        });

        localStorage.setItem(
            "leoCalcFavorites",
            JSON.stringify(favorites)
        );
    }

    renderFavorites();
}


function removeFavorite(name) {

    favorites =
        favorites.filter(
            item => item.name !== name
        );

    localStorage.setItem(
        "leoCalcFavorites",
        JSON.stringify(favorites)
    );

    renderFavorites();
}


/* =========================================================
   THEME
   ========================================================= */

function toggleTheme() {

    document.body.classList.toggle(
        "lightMode"
    );

    localStorage.setItem(
        "leoCalcTheme",
        document.body.classList.contains(
            "lightMode"
        )
            ? "light"
            : "dark"
    );
}


if (
    localStorage.getItem(
        "leoCalcTheme"
    ) === "light"
) {

    document.body.classList.add(
        "lightMode"
    );
}


/* =========================================================
   KEYBOARD
   ========================================================= */

function handleKeyboard(event) {

    const page =
        document.getElementById(
            "calculatorPage"
        );

    if (
        !page ||
        page.classList.contains("hidden")
    ) return;

    const key = event.key;

    if (/^[0-9.]$/.test(key)) {

        calcInput(key);

    } else if (
        ["+","-","*","/","(",")","%"].includes(key)
    ) {

        const converted =
            key === "*"
                ? "×"
                : key === "/"
                    ? "÷"
                    : key;

        calcInput(converted);

    } else if (key === "Enter" || key === "=") {

        calculateResult();

    } else if (key === "Backspace") {

        deleteCalc();

    } else if (key === "Escape") {

        clearCalc();
    }
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
}


/* =========================================================
   ESC KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            closeToolModal();
            closeMenu();

        }

    }
);


/* =========================================================
   CONSOLE
   ========================================================= */

console.log(
    "%cLeoCalc loaded successfully ⚡",
    "font-size:18px;font-weight:bold;"
);
