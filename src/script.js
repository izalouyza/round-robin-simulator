let processos = [];
let filaCPU = [];
let filaIO = [];
let cpuAtual = null;
let ioAtual = null;
let quantum = 4;
let quantumRestante = 0;
let timelineCPU = [];
let timelineIO = [];
let cpuUso = 0;
let ioUso = 0;
let tempo = 0;
let tempoTotal = 50;
let intervalo = null;

function gerarInputs() {
    let n = parseInt(document.getElementById("numProcessos").value);
    let div = document.getElementById("processos");
    div.innerHTML = "";
    for (let i = 0; i < n; i++) {
        div.innerHTML += `
        <div class="processo-card">
            <h4>P${i}</h4>
            CPU1 <input id="cpu1_${i}" type="number">
            IO1 <input id="io1_${i}" type="number">
            CPU2 <input id="cpu2_${i}" type="number">
            IO2 <input id="io2_${i}" type="number">
        </div>`;
    }
}

function carregarModelo() {
    gerarInputs();
    const dados = [[3,10,3,12], [4,12,6,8], [7,8,8,10], [6,14,2,10]];
    dados.forEach((d, i) => {
        document.getElementById(`cpu1_${i}`).value = d[0];
        document.getElementById(`io1_${i}`).value = d[1];
        document.getElementById(`cpu2_${i}`).value = d[2];
        document.getElementById(`io2_${i}`).value = d[3];
    });
}

function getValor(id) {
    let v = document.getElementById(id)?.value;
    return (v === "" || v === undefined) ? null : parseInt(v);
}

function carregarProcessos() {
    processos = []; filaCPU = []; filaIO = [];
    let n = parseInt(document.getElementById("numProcessos").value);
    quantum = parseInt(document.getElementById("quantum").value);
    if (isNaN(n) || n <= 0) { alert("Número de processos inválido!"); return false; }

    for (let i = 0; i < n; i++) {
        let cpu1 = getValor(`cpu1_${i}`), io1 = getValor(`io1_${i}`), 
            cpu2 = getValor(`cpu2_${i}`), io2 = getValor(`io2_${i}`);
        if ([cpu1, io1, cpu2, io2].some(v => v === null || isNaN(v))) {
            alert(`Preencha todos os valores do processo P${i}`); return false;
        }
        processos.push({
            pid: i, bursts: [{tipo:"CPU", tempo: cpu1}, {tipo:"IO", tempo: io1}, {tipo:"CPU", tempo: cpu2}, {tipo:"IO", tempo: io2}],
            etapa: 0, restante: cpu1, chegada: 0, inicio: null, fim: null, espera: 0, resposta: null
        });
        filaCPU.push(processos[i]);
    }
    return true;
}

function iniciarSimulacao() {
    if (!carregarProcessos()) return;
    tempoTotal = parseInt(document.getElementById("tempoTotal").value);
    tempo = 0; cpuUso = 0; ioUso = 0; timelineCPU = []; timelineIO = [];
    cpuAtual = null; ioAtual = null;
    iniciarLoop();
}

function iniciarLoop() {
    let velocidade = parseInt(document.getElementById("velocidade").value);
    intervalo = setInterval(() => {
        if (tempo >= tempoTotal) { pararSimulacao(); mostrarResultados(); return; }
        passoSimulacao(); atualizarFilas(); renderTimeline();
        document.getElementById("tempoAtual").innerText = `t = ${tempo}`;
        tempo++;
    }, velocidade);
}

function pausar() { pararSimulacao(); }
function continuar() { if (intervalo === null) iniciarLoop(); }
function pararSimulacao() { clearInterval(intervalo); intervalo = null; }

function passoManual() {
    if (intervalo !== null || tempo >= tempoTotal) return;
    passoSimulacao(); atualizarFilas(); renderTimeline();
    document.getElementById("tempoAtual").innerText = `t = ${tempo}`;
    tempo++;
}

function passoSimulacao() {
    filaCPU.forEach(p => p.espera++);
    if (!cpuAtual && filaCPU.length > 0) { cpuAtual = filaCPU.shift(); quantumRestante = quantum; }
    if (cpuAtual) {
        if (cpuAtual.inicio === null) { cpuAtual.inicio = tempo; cpuAtual.resposta = tempo; }
        cpuUso++; timelineCPU.push(cpuAtual.pid);
        cpuAtual.restante--; quantumRestante--;
        if (cpuAtual.restante === 0) {
            cpuAtual.etapa++;
            if (cpuAtual.etapa < cpuAtual.bursts.length) {
                cpuAtual.restante = cpuAtual.bursts[cpuAtual.etapa].tempo;
                filaIO.push(cpuAtual);
            } else { cpuAtual.fim = tempo; }
            cpuAtual = null;
        } else if (quantumRestante === 0) { filaCPU.push(cpuAtual); cpuAtual = null; }
    } else { timelineCPU.push("idle"); }

    if (!ioAtual && filaIO.length > 0) { ioAtual = filaIO.shift(); }
    if (ioAtual) {
        ioUso++; timelineIO.push(ioAtual.pid);
        ioAtual.restante--;
        if (ioAtual.restante === 0) {
            ioAtual.etapa++;
            if (ioAtual.etapa < ioAtual.bursts.length) {
                ioAtual.restante = ioAtual.bursts[ioAtual.etapa].tempo;
                filaCPU.push(ioAtual);
            }
            ioAtual = null;
        }
    } else { timelineIO.push("idle"); }
}

function getCor(pid) {
    const cores = ["#00cec9", "#f1c40f", "#2ecc71", "#e67e22"];
    return cores[pid % cores.length];
}

function renderTimeline() {
    const cpuDiv = document.getElementById("cpuTimeline"), ioDiv = document.getElementById("ioTimeline");
    cpuDiv.innerHTML = ""; ioDiv.innerHTML = "";
    timelineCPU.forEach(p => {
        let box = document.createElement("div"); box.className = "bloco";
        if (p === "idle") box.style.background = "#ccc";
        else { box.style.background = getCor(p); box.innerText = `P${p}`; }
        cpuDiv.appendChild(box);
    });
    timelineIO.forEach(p => {
        let box = document.createElement("div"); box.className = "bloco";
        if (p === "idle") box.style.background = "#ccc";
        else { box.style.background = getCor(p); box.innerText = `P${p}`; }
        ioDiv.appendChild(box);
    });
}

function atualizarFilas() {
    document.getElementById("filaCPU").innerText = filaCPU.map(p => `P${p.pid}`).join(", ");
    document.getElementById("filaIO").innerText = filaIO.map(p => `P${p.pid}`).join(", ");
}

function mostrarResultados() {
    let totalEspera = 0, totalTurnaround = 0, totalResposta = 0;
    processos.forEach(p => {
        totalEspera += p.espera;
        totalTurnaround += ((p.fim || tempo) + 1) - p.chegada;
        totalResposta += (p.resposta || 0);
    });
    let n = processos.length;
    document.getElementById("resultados").innerHTML = `
        CPU: ${(cpuUso/tempoTotal*100).toFixed(2)}% | Disco: ${(ioUso/tempoTotal*100).toFixed(2)}% <br><br>
        Espera média: ${(totalEspera/n).toFixed(2)} | Turnaround médio: ${(totalTurnaround/n).toFixed(2)} | Resposta média: ${(totalResposta/n).toFixed(2)}`;
}