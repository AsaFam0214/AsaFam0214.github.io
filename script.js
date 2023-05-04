let period = 4;
let interval = 1;

let counting = false;
let start;
let phase = 0;

function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
}

function updatePeriod() {
    updatePeriodDisplay(1000 * period);
    document.querySelector(".period").textContent = "/" + String(period);
    document.cookie = `period=${period}; max-age=31536000`
}

function updateInterval() {
    updateIntervalDisplay(1000 * interval);
    document.querySelector(".interval").textContent = "/" + String(interval);
    document.cookie = `interval=${interval}; max-age=31536000`
}

function updateRing(rate, isPeriod) {
    const path = document.querySelector("#ring");
    const angle1 = (Math.PI / 2) + Math.PI * rate;
    const angle2 = angle1 + Math.PI * rate;
    const density = isPeriod ? 5 : 2;
    const radius = 240 - density;
    const x1 = radius * Math.cos(angle1) + 240;
    const y1 = -radius * Math.sin(angle1) + 240;
    const x2 = radius * Math.cos(angle2) + 240;
    const y2 = -radius * Math.sin(angle2) + 240;
    const pathStr = `M 240 ${density} A ${radius} ${radius} 0 0 0 ${x1} ${y1} A ${radius} ${radius} 0 0 0 ${x2} ${y2}`;
    path.setAttribute("d", pathStr);
    path.setAttribute("stroke", isPeriod ? "#302060" : "#606060");
    path.setAttribute("stroke-width", 2 * density);
}

function updatePeriodDisplay(ms) {
    const curInt = document.querySelector(".period-cur-int");
    const curDec = document.querySelector(".period-cur-dec");

    curInt.textContent = String(Math.trunc(ms * 0.001)).padStart(3, " ");
    curDec.textContent = "." + String(Math.trunc(Math.trunc(ms % 1000) / 10)).padStart(2, "0");
}

function updateIntervalDisplay(ms) {
    const curInt = document.querySelector(".interval-cur-int");
    const curDec = document.querySelector(".interval-cur-dec");

    curInt.textContent = String(Math.trunc(ms * 0.001)).padStart(3, " ");
    curDec.textContent = "." + String(Math.trunc(Math.trunc(ms % 1000) / 10)).padStart(2, "0");
}

function onPeriodEnd() {
    updatePeriodDisplay(0);
}

function onIntervalEnd() {
    updateIntervalDisplay(1000 * interval);
}

function updateAnimation(timestamp) {
    if (start === undefined) {
        start = timestamp;
    }

    const elapsed = timestamp - start;

    if (elapsed < 1000 * period) {
        phase = 0;
        const cur = 1000 * period - elapsed;
        updatePeriodDisplay(cur);
        updateRing(cur / (1000 * period), true);
    }
    else if (elapsed < 1000 * (period + interval)) {
        if (phase == 0) {
            onPeriodEnd();
            phase = 1;
        }

        const cur = elapsed - 1000 * period;
        updateIntervalDisplay(cur);
        updateRing(cur / (1000 * interval), false);
    }
    else {
        if (phase == 1) {
            onIntervalEnd();
            phase = 2;
        }

        start += 1000 * (period + interval);
        updateRing(0, "#302060");
    }

    if (counting) {
        window.requestAnimationFrame(updateAnimation);
    }
}

function startCount() {
    start = undefined;
    counting = true;
    window.requestAnimationFrame(updateAnimation);
}

function stopCount() {
    counting = false;
}

document.querySelector(".timer").addEventListener("click", e => {
    if (counting) {
        stopCount();
    } else {
        startCount();
    }
});

document.querySelector("#period-inc").addEventListener("click", e => {
    period = clamp(period + 1, 1, 99);
    start = undefined;
    updatePeriod();
});

document.querySelector("#period-dec").addEventListener("click", e => {
    period = clamp(period - 1, 1, 99);
    start = undefined;
    updatePeriod();
});

document.querySelector("#interval-inc").addEventListener("click", e => {
    interval = clamp(interval + 1, 1, 99);
    start = undefined;
    updateInterval();
});

document.querySelector("#interval-dec").addEventListener("click", e => {
    interval = clamp(interval - 1, 1, 99);
    start = undefined;
    updateInterval();
});

function applyParameter() {
    const cookies = document.cookie.split("; ");
    for(let i = 0; i < cookies.length; ++i) {
        const cookie = cookies[i].split("=");
        switch(cookie[0]) {
            case "period":
                period = Number(cookie[1]);
                break;
            case "interval":
                interval = Number(cookie[1]);
                break;
        }
    }

    const params = new URLSearchParams(location.search);
    if(params.get("p")) {
        period = clamp(Number(params.get("p")), 1, 99);   
    }
    if(params.get("i")) {
        interval = clamp(Number(params.get("i")), 1, 99);
    }
    
    updatePeriod();
    updateInterval();
    updateRing(1, true)
}

applyParameter();