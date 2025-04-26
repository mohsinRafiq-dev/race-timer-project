let raceStart = null;
let finishers = [];
let isOnline = navigator.onLine;
let raceInterval = null;
const pendingUploads = JSON.parse(localStorage.getItem("pendingUploads") || "[]");

let pendingUploadsToAlert = 0;

const startStopBtn = document.getElementById("startStopBtn");
const recordTimeBtn = document.getElementById("recordTimeBtn");
const uploadBtn = document.getElementById("uploadBtn");
const clearBtn = document.getElementById("clearBtn");
const exportBtn = document.getElementById("exportBtn");
const runnerInput = document.getElementById("runnerNumber");
const raceStatusDisplay = document.getElementById("raceStatus");
const connectionStatusDisplay = document.getElementById("connectionStatus");
const raceTimeDisplay = document.getElementById("raceTimeDisplay");
const finishList = document.getElementById("finishList");

function init() {
  loadLocalData();
  updateConnectionStatus();
  setupEventListeners();
}

function loadLocalData() {
  const storedStart = localStorage.getItem("raceStart");
  const storedFinishers = JSON.parse(localStorage.getItem("finishers") || "[]");

  if (storedStart) {
    raceStart = new Date(storedStart);
    updateUIForRaceStart();
    startTimer();
  }

  finishers = storedFinishers;
  updateFinishList();
}

function setupEventListeners() {
  window.addEventListener('online', handleOnlineEvent);
  window.addEventListener('offline', updateConnectionStatus);
  
  startStopBtn.addEventListener('click', toggleRace);
  recordTimeBtn.addEventListener('click', recordFinishTime);
  uploadBtn.addEventListener('click', uploadResults);
  clearBtn.addEventListener('click', clearRaceData);
  exportBtn.addEventListener('click', exportToCSV);
}

function handleOnlineEvent() {
  const wasOffline = !isOnline;
  updateConnectionStatus();
  
  if (wasOffline && pendingUploads.length > 0) {
    pendingUploadsToAlert = pendingUploads.length;
    processPendingUploads();
  }
}

function updateConnectionStatus() {
  isOnline = navigator.onLine;
  connectionStatusDisplay.textContent = isOnline ? "Online" : "Offline";
  connectionStatusDisplay.className = isOnline ? "status-online" : "status-offline";
}

function toggleRace() {
  if (!raceStart) {
    startRace();
  } else {
    stopRace();
  }
}

function startRace() {
  raceStart = new Date();
  localStorage.setItem("raceStart", raceStart.toISOString());
  updateUIForRaceStart();
  startTimer();
  
  if (isOnline) {
    clearServerData();
  }
}

function stopRace() {
  stopTimer();
  raceStart = null;
  localStorage.removeItem("raceStart");
  updateUIForRaceStop();
}

function updateUIForRaceStart() {
  startStopBtn.textContent = "Stop Race";
  recordTimeBtn.disabled = false;
  runnerInput.disabled = false;
  raceStatusDisplay.textContent = "Running";
  raceStatusDisplay.className = "status-running";
}

function updateUIForRaceStop() {
  startStopBtn.textContent = "Start Race";
  recordTimeBtn.disabled = true;
  runnerInput.disabled = true;
  raceStatusDisplay.textContent = "Not started";
  raceStatusDisplay.className = "";
  raceTimeDisplay.textContent = "00:00:00";
}

function startTimer() {
  stopTimer();
  updateRaceTimer();
  raceInterval = setInterval(updateRaceTimer, 1000);
}

function stopTimer() {
  if (raceInterval) {
    clearInterval(raceInterval);
    raceInterval = null;
  }
}

function updateRaceTimer() {
  if (raceStart) {
    const now = new Date();
    const diffMs = now - raceStart;
    const totalSeconds = Math.floor(diffMs / 1000);
    raceTimeDisplay.textContent = formatTime(totalSeconds);
  }
}

function recordFinishTime() {
  const number = runnerInput.value.trim();
  if (!number || isNaN(number)) {
    alert("Please enter a valid runner number!");
    return;
  }

  const finishTime = Math.floor((new Date() - raceStart) / 1000);
  addFinisher(parseInt(number), finishTime);
  
  runnerInput.value = "";
  runnerInput.focus();
}

function addFinisher(runnerNumber, finishTime) {
  finishers.push({ runner: runnerNumber, finishTime });
  finishers.sort((a, b) => a.finishTime - b.finishTime);
  localStorage.setItem("finishers", JSON.stringify(finishers));
  updateFinishList();
}

function updateFinishList() {
  finishList.innerHTML = "";
  finishers.forEach((f, i) => {
    const li = document.createElement("li");
    li.textContent = `#${f.runner} - ${formatTime(f.finishTime)} (Pos: ${i + 1})`;
    finishList.appendChild(li);
  });
}

async function uploadResults() {
  if (!finishers.length) {
    alert("No results to upload!");
    return;
  }

  if (!isOnline) {
    pendingUploads.push({ data: [...finishers], timestamp: Date.now() });
    localStorage.setItem("pendingUploads", JSON.stringify(pendingUploads));
    alert("Offline - results will be uploaded when connection is restored");
    return;
  }

  try {
    await Promise.all(finishers.map(uploadFinisher));
    alert("Results uploaded successfully!");
  } catch (err) {
    console.error("Upload error:", err);
    alert("Failed to upload some results. Check console for details.");
  }
}

async function uploadFinisher(finisher) {
  return fetch('/results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      runner_number: finisher.runner,
      finish_time: finisher.finishTime
    })
  });
}

async function clearServerData() {
  try {
    await fetch('/results', { method: 'DELETE' });
  } catch (err) {
    console.log("Couldn't clear server data:", err);
  }
}

async function processPendingUploads() {
  let successCount = 0;
  
  while (pendingUploads.length > 0) {
    const batch = pendingUploads[0];
    try {
      await Promise.all(batch.data.map(uploadFinisher));
      pendingUploads.shift();
      localStorage.setItem("pendingUploads", JSON.stringify(pendingUploads));
      successCount++;

      if (successCount === pendingUploadsToAlert) {
        alert("All pending results have been uploaded successfully!");
        pendingUploadsToAlert = 0; 
      }
    } catch (err) {
      console.error("Failed to upload batch:", err);
      break;
    }
  }
}

function exportToCSV() {
  if (!finishers.length) {
    alert("No results to export!");
    return;
  }
  
  let csv = "Runner Number,Finish Time,Position\n";
  finishers.forEach((f, i) => {
    csv += `${f.runner},${formatTime(f.finishTime)},${i + 1}\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `race-results-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function clearRaceData() {
  if (confirm("Are you sure you want to clear ALL race data (local and server)?")) {
    localStorage.removeItem("raceStart");
    localStorage.removeItem("finishers");
    localStorage.removeItem("pendingUploads");

    stopRace();
    finishers = [];
    finishList.innerHTML = "";
    
    if (isOnline) {
      clearServerData();
    }
  }
}

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(n) {
  return n.toString().padStart(2, "0");
}

init();