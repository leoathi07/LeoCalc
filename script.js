/* =========================================================
   LeoCalc - Complete JavaScript
   All-in-One Engineering Calculator
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    startSplash();
    startClock();
    loadHistory();
    loadNotes();
    getWeather();
});


/* =========================================================
   GLOBAL VARIABLES
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

let countdownInterval = null;


/* =========================================================
   SPLASH SCREEN
========================================================= */

function startSplash() {

    const splash =
        document.getElementById("splashScreen");

    const main =
        document.getElementById("mainApp");

    const progress =
        document.getElementById("progressBar");

    const percent =
        document.getElementById("loadingPercent");

    const text =
        document.getElementById("loadingText");

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

        if (value > 100) {
            value = 100;
        }

        if (progress) {
            progress.style.width = value + "%";
        }

        if (percent) {
            percent.textContent = value + "%";
        }

        if (text) {

            const index =
                Math.min(
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
   CLOCK
========================================================= */

function startClock() {

    updateClock();

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
            now.toLocaleTimeString(
                undefined,
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            );
    }

    if (date) {

        date.textContent =
            now.toLocaleDateString(
                undefined,
                {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );
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

    document.body.style.overflow = "hidden";

    updateAnswerDisplay();
}


function closeCalculator() {

    const screen =
        document.getElementById("calculatorScreen");

    if (!screen) return;

    screen.classList.add("hidden");

    document.body.style.overflow = "";
}


/* =========================================================
   CALCULATOR INPUT
========================================================= */

function calcInput(value) {

    expression += value;

    updateDisplay();
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

    updateDisplay();
}


function updateDisplay() {

    const exp =
        document.getElementById("calcExpression");

    const result =
        document.getElementById("calcResult");

    if (exp) {
        exp.textContent = expression;
    }

    if (result) {

        if (!expression) {
            result.textContent = "0";
        }
    }
}


/* =========================================================
   CLEAR / DELETE
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


function deleteCalc() {

    expression =
        expression.slice(0, -1);

    updateDisplay();
}


/* =========================================================
   SIGN
========================================================= */

function toggleSign() {

    if (!expression) return;

    expression =
        expression.startsWith("-")
            ? expression.substring(1)
            : "-" + expression;

    updateDisplay();
}


/* =========================================================
   RANDOM
========================================================= */

function insertRandom() {

    expression +=
        Math.random().toFixed(6);

    updateDisplay();
}


/* =========================================================
   CALCULATOR ENGINE
========================================================= */

function calculateResult() {

    if (!expression) return;

    try {

        const originalExpression =
            expression;

        const result =
            evaluateExpression(expression);

        if (!Number.isFinite(result)) {
            throw new Error("Invalid result");
        }

        answer = result;

        expression =
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
                formatNumber(result);
        }

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
    }
}


/* =========================================================
   SAFE EXPRESSION EVALUATOR
========================================================= */

function evaluateExpression(input) {

    let exp =
        input
            .replaceAll("×", "*")
            .replaceAll("÷", "/")
            .replaceAll("−", "-")
            .replaceAll("π", "pi")
            .replaceAll("Ans", "ans")
            .replaceAll(" ", "");

    /*
       Factorial
    */

    exp =
        exp.replace(
            /(\d+(?:\.\d+)?)!/g,
            "factorial($1)"
        );


    /*
       Power
    */

    exp =
        exp.replaceAll("^", "**");


    /*
       Constants
    */

    exp =
        exp.replace(
            /\bpi\b/g,
            "Math.PI"
        );

    exp =
        exp.replace(
            /\bans\b/gi,
            "(" + answer + ")"
        );

    exp =
        exp.replace(
            /\be\b/g,
            "Math.E"
        );


    /*
       Functions
    */

    exp =
        exp.replace(
            /\bsin\(/g,
            "trigSin("
        );

    exp =
        exp.replace(
            /\bcos\(/g,
            "trigCos("
        );

    exp =
        exp.replace(
            /\btan\(/g,
            "trigTan("
        );

    exp =
        exp.replace(
            /\blog\(/g,
            "Math.log10("
        );

    exp =
        exp.replace(
            /\bln\(/g,
            "Math.log("
        );

    exp =
        exp.replace(
            /\bsqrt\(/g,
            "Math.sqrt("
        );


    /*
       Security whitelist
    */

    if (
        !/^[0-9+\-*/%().,\sA-Za-z_]+$/.test(exp)
    ) {
        throw new Error("Invalid characters");
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
   TRIG FUNCTIONS
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

    if (n < 0 || !Number.isInteger(n)) {
        throw new Error("Invalid factorial");
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


/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatNumber(value) {

    if (!Number.isFinite(value)) {
        return "Error";
    }

    if (Math.abs(value) >= 1e12 ||
        (Math.abs(value) > 0 &&
         Math.abs(value) < 1e-8)) {

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
        expression: exp,
        result: result,
        time: new Date().toLocaleTimeString()
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

    if (calculationHistory.length === 0) {

        list.innerHTML =
            `<p class="emptyHistory">
                No calculations yet.
            </p>`;

        return;
    }

    list.innerHTML =
        calculationHistory
            .map((item, index) => {

                return `
                <div style="
                    padding:10px 0;
                    border-bottom:1px solid rgba(255,255,255,.06);
                    cursor:pointer;
                "
                onclick="useHistory(${index})">

                    <div style="
                        color:rgba(255,255,255,.4);
                        font-size:9px;
                    ">
                        ${escapeHTML(item.expression)}
                    </div>

                    <strong style="
                        display:block;
                        margin-top:3px;
                        font-size:14px;
                    ">
                        ${escapeHTML(
                            formatNumber(item.result)
                        )}
                    </strong>

                    <small style="
                        color:rgba(255,255,255,.25);
                        font-size:7px;
                    ">
                        ${item.time}
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

                <p>Enter any two values.</p>

                <input id="ohmV"
                    type="number"
                    placeholder="Voltage (V)">

                <input id="ohmI"
                    type="number"
                    placeholder="Current (A)">

                <input id="ohmR"
                    type="number"
                    placeholder="Resistance (Ω)">

                <button
                    class="primaryButton"
                    onclick="calculateOhm()">
                    Calculate
                </button>

                <div id="ohmResult"
                    class="resultBox">
                </div>

            </div>
        `;
    }


    /* POWER */

    else if (type === "power") {

        html = `
            <div class="formTool">

                <input id="powerV"
                    type="number"
                    placeholder="Voltage (V)">

                <input id="powerI"
                    type="number"
                    placeholder="Current (A)">

                <button
                    class="primaryButton"
                    onclick="calculatePower()">
                    Calculate Power
                </button>

                <div id="powerResult"
                    class="resultBox">
                </div>

            </div>
        `;
    }


    /* RESISTOR */

    else if (type === "resistor") {

        html = `
            <div class="formTool">

                <input id="res1"
                    type="number"
                    placeholder="Resistor 1 (Ω)">

                <input id="res2"
                    type="number"
                    placeholder="Resistor 2 (Ω)">

                <button
                    class="primaryButton"
                    onclick="calculateResistors()">
                    Calculate
                </button>

                <div id="resResult"
                    class="resultBox">
                </div>

            </div>
        `;
    }


    /* FREQUENCY */

    else if (type === "frequency") {

        html = `
            <div class="formTool">

                <input id="freqValue"
                    type="number"
                    placeholder="Frequency (Hz)">

                <button
                    class="primaryButton"
                    onclick="calculateFrequency()">
                    Calculate Wavelength
                </button>

                <div id="freqResult"
                    class="resultBox">
                </div>

            </div>
        `;
    }


    /* PERCENTAGE */

    else if (type === "percentage") {

        html = `
            <div class="formTool">

                <input id="percentValue"
                    type="number"
                    placeholder="Value">

                <input id="percentRate"
                    type="number"
                    placeholder="Percentage (%)">

                <button
                    class="primaryButton"
                    onclick="calculatePercentage()">
                    Calculate
                </button>

                <div id="percentResult"
                    class="resultBox">
                </div>

            </div>
        `;
    }


    /* INTEREST */

    else if (type === "interest") {

        html = `
            <div class="formTool">

                <input id="interestP"
                    type="number"
                    placeholder="Principal">

                <input id="interestR"
                    type="number"
                    placeholder="Rate (%)">

                <input id="interestT"
                    type="number"
                    placeholder="Time (Years)">

                <button
                    class="primaryButton"
                    onclick="calculateInterest()">
                    Calculate
                </button>

                <div id="interestResult"
                    class="resultBox">
                </div>

            </div>
        `;
    }


    /* EMI */

    else if (type === "emi") {

        html = `
            <div class="formTool">

                <input id="emiP"
                    type="number"
                    placeholder="Loan Amount">

                <input id="emiR"
                    type="number"
                    placeholder="Annual Interest (%)">

                <input id="emiN"
                    type="number"
                    placeholder="Months">

                <button
                    class="primaryButton"
                    onclick="calculateEMI()">
                    Calculate EMI
                </button>

                <div id="emiResult"
                    class="resultBox">
                </div>

            </div>
        `;
    }


    /* BMI */

    else if (type === "bmi") {

        html = `
            <div class="formTool">

                <input id="bmiWeight"
                    type="number"
                    placeholder="Weight (kg)">

                <input id="bmiHeight"
                    type="number"
                    placeholder="Height (cm)">

                <button
                    class="primaryButton"
                    onclick="calculateBMI()">
                    Calculate BMI
                </button>

                <div id="bmiResult"
                    class="resultBox">
                </div>

            </div>
        `;
    }


    openToolModal(
        title,
        html
    );
}


/* =========================================================
   OHM
========================================================= */

function calculateOhm() {

    const V =
        Number(document.getElementById("ohmV").value);

    const I =
        Number(document.getElementById("ohmI").value);

    const R =
        Number(document.getElementById("ohmR").value);

    let result = "";

    if (V && I) {

        result =
            `Resistance = ${formatNumber(V / I)} Ω`;

    } else if (V && R) {

        result =
            `Current = ${formatNumber(V / R)} A`;

    } else if (I && R) {

        result =
            `Voltage = ${formatNumber(I * R)} V`;

    } else {

        result =
            "Enter any two values.";
    }

    document.getElementById(
        "ohmResult"
    ).textContent = result;
}


/* =========================================================
   POWER
========================================================= */

function calculatePower() {

    const V =
        Number(document.getElementById("powerV").value);

    const I =
        Number(document.getElementById("powerI").value);

    const result =
        V * I;

    document.getElementById(
        "powerResult"
    ).textContent =
        `Power = ${formatNumber(result)} W`;
}


/* =========================================================
   RESISTORS
========================================================= */

function calculateResistors() {

    const R1 =
        Number(document.getElementById("res1").value);

    const R2 =
        Number(document.getElementById("res2").value);

    if (!R1 || !R2) return;

    const series =
        R1 + R2;

    const parallel =
        (R1 * R2) / (R1 + R2);

    document.getElementById(
        "resResult"
    ).innerHTML =
        `
        Series = ${formatNumber(series)} Ω<br><br>
        Parallel = ${formatNumber(parallel)} Ω
        `;
}


/* =========================================================
   FREQUENCY
========================================================= */

function calculateFrequency() {

    const frequency =
        Number(
            document.getElementById("freqValue").value
        );

    if (!frequency || frequency <= 0) return;

    const speedOfLight =
        299792458;

    const wavelength =
        speedOfLight / frequency;

    document.getElementById(
        "freqResult"
    ).innerHTML =
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
        Number(
            document.getElementById("percentValue").value
        );

    const rate =
        Number(
            document.getElementById("percentRate").value
        );

    const amount =
        value * rate / 100;

    const total =
        value + amount;

    document.getElementById(
        "percentResult"
    ).innerHTML =
        `
        ${rate}% of value =
        ${formatNumber(amount)}
        <br><br>
        Value + ${rate}% =
        ${formatNumber(total)}
        `;
}


/* =========================================================
   INTEREST
========================================================= */

function calculateInterest() {

    const P =
        Number(
            document.getElementById("interestP").value
        );

    const R =
        Number(
            document.getElementById("interestR").value
        );

    const T =
        Number(
            document.getElementById("interestT").value
        );

    const SI =
        P * R * T / 100;

    const CI =
        P * Math.pow(
            1 + R / 100,
            T
        ) - P;

    document.getElementById(
        "interestResult"
    ).innerHTML =
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
        Number(
            document.getElementById("emiP").value
        );

    const annualRate =
        Number(
            document.getElementById("emiR").value
        );

    const N =
        Number(
            document.getElementById("emiN").value
        );

    const r =
        annualRate / 12 / 100;

    let emi;

    if (r === 0) {

        emi = P / N;

    } else {

        emi =
            P *
            r *
            Math.pow(1 + r, N) /
            (Math.pow(1 + r, N) - 1);
    }

    document.getElementById(
        "emiResult"
    ).innerHTML =
        `
        Monthly EMI =
        ₹${formatNumber(emi)}
        <br><br>
        Total Payment =
        ₹${formatNumber(emi * N)}
        `;
}


/* =========================================================
   BMI
========================================================= */

function calculateBMI() {

    const weight =
        Number(
            document.getElementById("bmiWeight").value
        );

    const height =
        Number(
            document.getElementById("bmiHeight").value
        ) / 100;

    if (!weight || !height) return;

    const bmi =
        weight / (height * height);

    let status;

    if (bmi < 18.5) {
        status = "Underweight";
    } else if (bmi < 25) {
        status = "Normal";
    } else if (bmi < 30) {
        status = "Overweight";
    } else {
        status = "Obesity";
    }

    document.getElementById(
        "bmiResult"
    ).innerHTML =
        `
        BMI = ${formatNumber(bmi)}
        <br><br>
        Status = ${status}
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

            <div id="bigTime"
                style="
                font-size:36px;
                font-weight:800;
                margin-bottom:8px;
            ">
                00:00:00
            </div>

            <div id="bigDate"
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

            <div id="stopwatchDisplay"
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

    clearInterval(
        stopwatchInterval
    );

    stopwatchInterval = null;
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
   Open-Meteo - No API Key
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

            const lat =
                position.coords.latitude;

            const lon =
                position.coords.longitude;

            fetchWeather(
                lat,
                lon
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
            timeout: 10000
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
            throw new Error("Weather error");
        }

        const data =
            await response.json();

        const current =
            data.current;

        const weatherCode =
            current.weather_code;

        const weatherInfo =
            weatherDescription(weatherCode);

        setWeather(
            weatherInfo.icon,
            `${Math.round(current.temperature_2m)}°C`,
            weatherInfo.text
        );

        window.leoWeatherData = data;

    } catch (error) {

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
                        Please allow location access.
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
                        ${new Date(
                            daily.time[i]
                        ).toLocaleDateString(
                            undefined,
                            {
                                weekday:"short",
                                day:"numeric"
                            }
                        )}
                    </strong>

                    <span style="
                        margin-left:10px;
                    ">
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

                    <div style="
                        font-size:55px;
                    ">
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
                        ${info.text}
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
                            ${current.wind_speed_10m}
                            km/h
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
                        📍 Location<br>
                        <strong>
                            ${data.latitude.toFixed(2)},
                            ${data.longitude.toFixed(2)}
                        </strong>
                    </div>

                </div>

                <h3 style="
                    margin-top:20px;
                ">
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

            <select id="convertCategory"
                onchange="changeConverter()">

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
                    Data Storage
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

            <input
                id="convertValue"
                type="number"
                placeholder="Enter value"
            >

            <div style="
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:8px;
            ">

                <select id="fromUnit"></select>

                <select id="toUnit"></select>

            </div>

            <button
                class="primaryButton"
                onclick="performConversion()">
                Convert
            </button>

            <div id="conversionResult"
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


function changeConverter() {

    const category =
        document.getElementById(
            "convertCategory"
        ).value;

    const from =
        document.getElementById(
            "fromUnit"
        );

    const to =
        document.getElementById(
            "toUnit"
        );

    if (
        category === "temperature"
    ) {

        from.innerHTML =
            `
            <option>°C</option>
            <option>°F</option>
            <option>K</option>
            `;

        to.innerHTML =
            `
            <option>°C</option>
            <option>°F</option>
            <option>K</option>
            `;

        return;
    }

    const units =
        conversionUnits[category];

    from.innerHTML = "";
    to.innerHTML = "";

    Object.keys(units)
        .forEach(unit => {

            from.innerHTML +=
                `<option>${unit}</option>`;

            to.innerHTML +=
                `<option>${unit}</option>`;
        });
}


function performConversion() {

    const category =
        document.getElementById(
            "convertCategory"
        ).value;

    const value =
        Number(
            document.getElementById(
                "convertValue"
            ).value
        );

    const from =
        document.getElementById(
            "fromUnit"
        ).value;

    const to =
        document.getElementById(
            "toUnit"
        ).value;

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

        result =
            value *
            units[from] /
            units[to];
    }

    document.getElementById(
        "conversionResult"
    ).textContent =
        `${formatNumber(result)} ${to}`;
}


function convertTemperature(
    value,
    from,
    to
) {

    let celsius;

    if (from === "°C") {
        celsius = value;
    }

    if (from === "°F") {
        celsius =
            (value - 32) * 5 / 9;
    }

    if (from === "K") {
        celsius =
            value - 273.15;
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
}


/* =========================================================
   MONEY TOOLS
========================================================= */

function openMoneyTools() {

    const html = `

        <div class="formTool">

            <input
                id="moneyAmount"
                type="number"
                placeholder="Amount"
            >

            <input
                id="moneyGST"
                type="number"
                placeholder="GST %"
                value="18"
            >

            <button
                class="primaryButton"
                onclick="calculateGST()">
                Calculate GST
            </button>

            <div id="gstResult"
                class="resultBox">
            </div>


            <hr style="
                margin:20px 0;
                border-color:rgba(255,255,255,.08);
            ">


            <input
                id="discountPrice"
                type="number"
                placeholder="Original Price"
            >

            <input
                id="discountRate"
                type="number"
                placeholder="Discount %"
            >

            <button
                class="primaryButton"
                onclick="calculateDiscount()">
                Calculate Discount
            </button>

            <div id="discountResult"
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
        Number(
            document.getElementById(
                "moneyAmount"
            ).value
        );

    const rate =
        Number(
            document.getElementById(
                "moneyGST"
            ).value
        );

    const gst =
        amount * rate / 100;

    const total =
        amount + gst;

    document.getElementById(
        "gstResult"
    ).innerHTML =
        `
        GST = ₹${formatNumber(gst)}
        <br><br>
        Total = ₹${formatNumber(total)}
        `;
}


function calculateDiscount() {

    const price =
        Number(
            document.getElementById(
                "discountPrice"
            ).value
        );

    const rate =
        Number(
            document.getElementById(
                "discountRate"
            ).value
        );

    const discount =
        price * rate / 100;

    const finalPrice =
        price - discount;

    document.getElementById(
        "discountResult"
    ).innerHTML =
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

            <p style="
                color:rgba(255,255,255,.5);
                margin-bottom:10px;
            ">
                Enter numbers separated by commas.
            </p>

            <textarea
                id="statsInput"
                rows="5"
                placeholder="10, 20, 30, 40, 50"
                style="
                width:100%;
                padding:12px;
                border-radius:12px;
                background:rgba(255,255,255,.06);
                color:white;
                border:1px solid rgba(255,255,255,.08);
            "></textarea>

            <button
                class="primaryButton"
                onclick="calculateStatistics()">
                Calculate Statistics
            </button>

            <div id="statsResult"
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
        ).value;

    const nums =
        input
            .split(",")
            .map(Number)
            .filter(Number.isFinite);

    if (!nums.length) return;

    const sorted =
        [...nums].sort(
            (a,b) => a-b
        );

    const sum =
        nums.reduce(
            (a,b) => a+b,
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
            : (sorted[middle - 1] +
               sorted[middle]) / 2;

    const variance =
        nums.reduce(
            (total, n) =>
                total +
                Math.pow(n - mean, 2),
            0
        ) / nums.length;

    const sd =
        Math.sqrt(variance);

    document.getElementById(
        "statsResult"
    ).innerHTML =
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
                type="text"
                placeholder="Enter decimal number"
            >

            <button
                class="primaryButton"
                onclick="convertNumberSystem()">
                Convert
            </button>

            <div id="numberResult"
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

    const value =
        Number(
            document.getElementById(
                "numberInput"
            ).value
        );

    if (!Number.isInteger(value)) {

        document.getElementById(
            "numberResult"
        ).textContent =
            "Enter an integer.";

        return;
    }

    document.getElementById(
        "numberResult"
    ).innerHTML =
        `
        Decimal = ${value}
        <br><br>
        Binary = ${value.toString(2)}
        <br><br>
        Octal = ${value.toString(8)}
        <br><br>
        Hexadecimal = ${value.toString(16).toUpperCase()}
        `;
}


/* =========================================================
   SECURITY
========================================================= */

function openSecurity() {

    const html = `

        <div class="formTool">

            <input
                id="passwordLength"
                type="number"
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

            <div id="passwordResult"
                class="resultBox"
                style="
                    word-break:break-all;
                ">
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
        Number(
            document.getElementById(
                "passwordLength"
            ).value
        );

    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
        "abcdefghijklmnopqrstuvwxyz" +
        "0123456789" +
        "!@#$%^&*()_+-=[]{}";

    let password = "";

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

    document.getElementById(
        "passwordResult"
    ).textContent =
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
                type="text"
                placeholder="Note title"
            >

            <textarea
                id="noteContent"
                rows="6"
                placeholder="Write your note..."
                style="
                width:100%;
                padding:12px;
                border-radius:12px;
                background:rgba(255,255,255,.06);
                color:white;
                border:1px solid rgba(255,255,255,.08);
            "></textarea>

            <button
                class="primaryButton"
                onclick="saveNote()">
                Save Note
            </button>

            <div id="notesList">
            </div>

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
        ).value.trim();

    const content =
        document.getElementById(
            "noteContent"
        ).value.trim();

    if (!title && !content) return;

    savedNotes.unshift({
        title,
        content,
        date:
            new Date().toLocaleString()
    });

    localStorage.setItem(
        "leoCalcNotes",
        JSON.stringify(savedNotes)
    );

    document.getElementById(
        "noteTitle"
    ).value = "";

    document.getElementById(
        "noteContent"
    ).value = "";

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
                            ${note.date}
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
   QR TOOLS
========================================================= */

function openQR() {

    const html = `

        <div class="formTool">

            <input
                id="qrText"
                type="text"
                placeholder="Enter text or URL"
            >

            <button
                class="primaryButton"
                onclick="generateQR()">
                Generate QR
            </button>

            <div id="qrResult"
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
        ).value.trim();

    if (!text) return;

    const encoded =
        encodeURIComponent(text);

    document.getElementById(
        "qrResult"
    ).innerHTML =
        `
        <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encoded}"
            alt="QR Code"
            style="
                width:220px;
                height:220px;
                border-radius:12px;
                background:white;
                padding:8px;
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
}


/* =========================================================
   HOME
========================================================= */

function showHome() {

    closeCalculator();

    closeToolModal();

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
        query.toLowerCase().trim();

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
            !query || name.includes(query)
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

    recognition.start();

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
   PLACEHOLDER TOOL FUNCTIONS
========================================================= */

function openEngineering() {

    openCalculator();

    setTimeout(() => {

        const button =
            document.querySelectorAll(
                ".calcTab"
            )[1];

        switchCalcTab(
            "engineering",
            button
        );

    }, 50);
}


/* =========================================================
   KEYBOARD SUPPORT
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            document
                .getElementById("calculatorScreen")
                ?.classList.contains("hidden")
        ) {
            return;
        }

        const key =
            event.key;

        if (
            /^[0-9.]$/.test(key)
        ) {

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


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   RESTORE THEME
========================================================= */

loadTheme();


/* =========================================================
   MOBILE SWIPE MENU
========================================================= */

let touchStartX = 0;

document.addEventListener(
    "touchstart",
    event => {

        touchStartX =
            event.touches[0].clientX;
    },
    { passive: true }
);


document.addEventListener(
    "touchend",
    event => {

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
   FINAL
========================================================= */

console.log(
    "LeoCalc initialized successfully 🚀"
);
