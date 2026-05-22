let processos = [];
let filaCPU = [];
let filaIO = [];

let cpuAtual = null;
let ioAtual = null;

let quantum =4 ;
let quantumRestante = 0;

let timelineCPU = [];
let timelineIO = [];

let cpuUsoAcumulado = 0;
let ioUsoAcumulado = 0;

let tempo = 0;
let tempoTotal = 50;
let intervalo = null;

let algoritmoAtual = "rr";

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gerarValoresAleatorios() {

    document.getElementById("numProcessos").value = random(3, 6);
    document.getElementById("quantum").value = random(1, 5);
    document.getElementById("tempoTotal").value = random(10, 30);
}

function gerarInputs() {

    let n = parseInt(document.getElementById("numProcessos").value);
    let quantum = parseInt(document.getElementById("quantum").value);
    let tempoTotal = parseInt(document.getElementById("tempoTotal").value);

    // validação
    if (isNaN(n) || n <= 0) {
        alert("Erro: o número de processos deve ser maior que 0!");
        return;
    }

    if (isNaN(quantum) || quantum <= 0) {
        alert("Erro: o quantum deve ser maior que 0!");
        return;
    }

    if (isNaN(tempoTotal) || tempoTotal <= 0) {
        alert("Erro: o tempo total deve ser maior que 0!");
        return;
    }

    let div = document.getElementById("processos");
    div.innerHTML = "";

    for (let i = 0; i < n; i++) {
        div.innerHTML += `
        <div class="processo-card">
            <h4>P${i}</h4>
            <div class="input-row">CPU1 <input id="cpu1_${i}" type="number" min="0" value="0"></div>
            <div class="input-row">IO1 <input id="io1_${i}" type="number" min="0" value="0"></div>
            <div class="input-row">CPU2 <input id="cpu2_${i}" type="number" min="0" value="0"></div>
            <div class="input-row">IO2 <input id="io2_${i}" type="number" min="0" value="0"></div>
        </div>`;
    }
}

function carregarModelo() {

    // gera parâmetros aleatórios primeiro
    gerarValoresAleatorios();

    let n = parseInt(document.getElementById("numProcessos").value);

    gerarInputs();

    for (let i = 0; i < n; i++) {

        let cpu1 = random(1, 10);
        let io1  = random(1, 10);
        let cpu2 = random(1, 10);
        let io2  = random(1, 10);

        document.getElementById(`cpu1_${i}`).value = cpu1;
        document.getElementById(`io1_${i}`).value = io1;
        document.getElementById(`cpu2_${i}`).value = cpu2;
        document.getElementById(`io2_${i}`).value = io2;

        // se existir esses campos (evita erro)
        let prioridade = document.getElementById(`prioridade_${i}`);
        let fila = document.getElementById(`fila_${i}`);

        if (prioridade) {
            prioridade.value = random(1, 5);
        }

        if (fila) {
            fila.value = random(1, 3);
        }
    }
}

function getValor(id) {

    let v = document.getElementById(id)?.value;

    return (v === "" || v === undefined)
        ? null
        : parseInt(v);
}

function carregarProcessos() {

    processos = [];
    filaCPU = [];
    filaIO = [];

    let n = parseInt(document.getElementById("numProcessos").value);

    quantum = parseInt(document.getElementById("quantum").value);

    algoritmoAtual = document.getElementById("algoritmo").value;

    if (isNaN(n) || n <= 0) {

        alert("Número de processos inválido!");
        return false;
    }

    if (isNaN(quantum) || quantum <= 0) {

        alert("O Quantum deve ser maior que zero!");
        return false;
    }

    for (let i = 0; i < n; i++) {

        let cpu1 = getValor(`cpu1_${i}`);
        let io1 = getValor(`io1_${i}`);
        let cpu2 = getValor(`cpu2_${i}`);
        let io2 = getValor(`io2_${i}`);

        let prioridade = getValor(`prioridade_${i}`);
        let fila = getValor(`fila_${i}`);

        if ([cpu1, io1, cpu2, io2].some(v => v === null || isNaN(v))) {

            alert(`Preencha todos os campos do processo P${i}`);
            return false;
        }

        if ([cpu1, io1, cpu2, io2].some(v => v < 0)) {

            alert(`O processo P${i} possui valores negativos.`);
            return false;
        }

        let processo = {

            pid: i,

            bursts: [
                { tipo: "CPU", tempo: cpu1 },
                { tipo: "IO", tempo: io1 },
                { tipo: "CPU", tempo: cpu2 },
                { tipo: "IO", tempo: io2 }
            ],

            etapa: 0,

            restante: cpu1,

            chegada: 0,

            inicio: null,

            fim: null,

            espera: 0,

            resposta: null,

            concluido: false,

            prioridade: prioridade,

            fila: fila,

            cpuTotal: cpu1 + cpu2
        };

        processos.push(processo);
        filaCPU.push(processo);
    }

    ordenarFilaCPU();

    return true;
}

function ordenarFilaCPU() {

    if (algoritmoAtual === "fcfs") {

        filaCPU.sort((a, b) => a.chegada - b.chegada);
    }

    else if (algoritmoAtual === "sjf") {

        filaCPU.sort((a, b) => a.cpuTotal - b.cpuTotal);
    }

    else if (algoritmoAtual === "prioridade") {

        filaCPU.sort((a, b) => a.prioridade - b.prioridade);
    }

    else if (algoritmoAtual === "multinivel") {

        filaCPU.sort((a, b) => a.fila - b.fila);
    }
}

function iniciarSimulacao() {

    pararSimulacao();

    if (!carregarProcessos()) {
        return;
    }

    tempoTotal = parseInt(document.getElementById("tempoTotal").value);

    tempo = 0;

    cpuUsoAcumulado = 0;
    ioUsoAcumulado = 0;

    timelineCPU = [];
    timelineIO = [];

    cpuAtual = null;
    ioAtual = null;

    iniciarLoop();
}

function iniciarLoop() {

    let velocidade = parseInt(document.getElementById("velocidade").value);

    intervalo = setInterval(() => {

        if (tempo >= tempoTotal) {

            pararSimulacao();
            mostrarResultados();

            return;
        }

        passoSimulacao();

        atualizarFilas();

        renderTimeline();

        document.getElementById("tempoAtual").innerText = `t = ${tempo}`;

        tempo++;

    }, velocidade);
}

function pausar() {

    pararSimulacao();
}

function continuar() {

    if (intervalo === null) {

        iniciarLoop();
    }
}

function pararSimulacao() {

    clearInterval(intervalo);

    intervalo = null;
}

function passoManual() {

    if (intervalo !== null || tempo >= tempoTotal) {
        return;
    }

    passoSimulacao();

    atualizarFilas();

    renderTimeline();

    document.getElementById("tempoAtual").innerText = `t = ${tempo}`;

    tempo++;
}

function passoSimulacao() {

    filaCPU.forEach(p => p.espera++);

    ordenarFilaCPU();

    if (!cpuAtual && filaCPU.length > 0) {

        cpuAtual = filaCPU.shift();

        quantumRestante = quantum;
    }

    if (cpuAtual) {

        if (cpuAtual.inicio === null) {

            cpuAtual.inicio = tempo;

            cpuAtual.resposta = tempo;
        }

        cpuUsoAcumulado++;

        timelineCPU.push(cpuAtual.pid);

        cpuAtual.restante--;

        if (algoritmoAtual === "rr" || algoritmoAtual === "multinivel") {

            quantumRestante--;
        }

        if (cpuAtual.restante === 0) {

            cpuAtual.etapa++;

            if (cpuAtual.etapa < cpuAtual.bursts.length) {

                cpuAtual.restante =
                    cpuAtual.bursts[cpuAtual.etapa].tempo;

                filaIO.push(cpuAtual);

            } else {

                cpuAtual.fim = tempo;

                cpuAtual.concluido = true;
            }

            cpuAtual = null;
        }

        else if (
            (algoritmoAtual === "rr" || algoritmoAtual === "multinivel")
            &&
            quantumRestante === 0
        ) {

            filaCPU.push(cpuAtual);

            cpuAtual = null;
        }

    } else {

        timelineCPU.push("idle");
    }

    if (!ioAtual && filaIO.length > 0) {

        ioAtual = filaIO.shift();
    }

    if (ioAtual) {

        ioUsoAcumulado++;

        timelineIO.push(ioAtual.pid);

        ioAtual.restante--;

        if (ioAtual.restante === 0) {

            ioAtual.etapa++;

            if (ioAtual.etapa < ioAtual.bursts.length) {

                ioAtual.restante =
                    ioAtual.bursts[ioAtual.etapa].tempo;

                filaCPU.push(ioAtual);

            } else {

                ioAtual.fim = tempo;

                ioAtual.concluido = true;
            }

            ioAtual = null;
        }

    } else {

        timelineIO.push("idle");
    }
}

function mostrarResultados() {

    let turnaroundTotal = 0;
    let esperaTotal = 0;
    let respostaTotal = 0;

    let n = processos.length;

    processos.forEach(p => {

        let turnaround =
            (p.fim || tempoTotal) - p.chegada;

        turnaroundTotal += turnaround;

        esperaTotal += p.espera;

        respostaTotal += p.resposta || 0;
    });

    let utilCPU =
        (cpuUsoAcumulado / tempoTotal) * 100;

    let utilDisco =
        (ioUsoAcumulado / tempoTotal) * 100;

    atualizarResultados(
        utilCPU,
        utilDisco,
        esperaTotal / n,
        turnaroundTotal / n,
        respostaTotal / n
    );
}

function atualizarResultados(cpuUso, discoUso, espera, turnaround, resposta) {

    document.getElementById("percCPU").innerText =
        cpuUso.toFixed(2) + "%";

    document.getElementById("percDisco").innerText =
        discoUso.toFixed(2) + "%";

    document.getElementById("mediaEspera").innerText =
        espera.toFixed(2);

    document.getElementById("mediaTurnaround").innerText =
        turnaround.toFixed(2);

    document.getElementById("mediaResposta").innerText =
        resposta.toFixed(2);
}

function getCor(pid) {

    const cores = [
        "#00cec9",
        "#f1c40f",
        "#2ecc71",
        "#e67e22",
        "#9b59b6",
        "#e74c3c"
    ];

    return cores[pid % cores.length];
}

function renderTimeline() {

    const cpuDiv =
        document.getElementById("cpuTimeline");

    const ioDiv =
        document.getElementById("ioTimeline");

    cpuDiv.innerHTML = "";
    ioDiv.innerHTML = "";

    timelineCPU.forEach(p => {

        let box = document.createElement("div");

        box.className = "bloco";

        if (p === "idle") {

            box.style.background = "#ddd";

        } else {

            box.style.background = getCor(p);

            box.innerText = `P${p}`;
        }

        cpuDiv.appendChild(box);
    });

    timelineIO.forEach(p => {

        let box = document.createElement("div");

        box.className = "bloco";

        if (p === "idle") {

            box.style.background = "#ddd";

        } else {

            box.style.background = getCor(p);

            box.innerText = `P${p}`;
        }

        ioDiv.appendChild(box);
    });
}

function atualizarFilas() {

    const elCPU =
        document.getElementById("filaCPU");

    const elIO =
        document.getElementById("filaIO");

    if (elCPU) {

        let textoCPU = "";

        if (cpuAtual) {

            textoCPU += `[P${cpuAtual.pid}] `;
        }

        textoCPU +=
            filaCPU.map(p => `P${p.pid}`).join(", ");

        elCPU.innerText =
            textoCPU.trim() || "Nenhum";
    }

    if (elIO) {

        let textoIO = "";

        if (ioAtual) {

            textoIO += `[P${ioAtual.pid}] `;
        }

        textoIO +=
            filaIO.map(p => `P${p.pid}`).join(", ");

        elIO.innerText =
            textoIO.trim() || "Nenhum";
    }
}

function resetarInterface() {

    const ids = [
        "percCPU",
        "percDisco",
        "mediaEspera",
        "mediaTurnaround",
        "mediaResposta"
    ];

    ids.forEach(id => {

        let el = document.getElementById(id);

        if (el) {

            if (id === "percCPU" || id === "percDisco") {

                el.innerText = "0.00%";

            } else {

                el.innerText = "0.00";
            }
        }
    });

    if (document.getElementById("cpuTimeline")) {

        document.getElementById("cpuTimeline").innerHTML = "";
    }

    if (document.getElementById("ioTimeline")) {

        document.getElementById("ioTimeline").innerHTML = "";
    }

    if (document.getElementById("tempoAtual")) {

        document.getElementById("tempoAtual").innerText = "t = 0";
    }

    if (document.getElementById("filaCPU")) {

        document.getElementById("filaCPU").innerText = "Nenhum";
    }

    if (document.getElementById("filaIO")) {

        document.getElementById("filaIO").innerText = "Nenhum";
    }
}

window.addEventListener("load", () => {

    resetarInterface();

    setTimeout(resetarInterface, 100);
});