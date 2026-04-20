let processos = [];
let filaCPU = [];
let filaIO = [];
let cpuAtual = null;
let ioAtual = null;
let quantum = 4;
let quantumRestante = 0;
let timelineCPU = [];
let timelineIO = [];
let cpuUsoAcumulado = 0;
let ioUsoAcumulado = 0;
let tempo = 0;
let tempoTotal = 50;
let intervalo = null;

function gerarInputs() {
    let n = parseInt(document.getElementById("numProcessos").value);
    let div = document.getElementById("processos");
    
    // Limpa o conteúdo antes de gerar novos para não acumular
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
    // Sincroniza o número de processos para o modelo aula (4 processos)
    document.getElementById("numProcessos").value = 4;
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
    
    // Validação básica do simulador
    if (isNaN(n) || n <= 0) { alert("Número de processos inválido!"); return false; }
    if (isNaN(quantum) || quantum <= 0) { alert("O Quantum deve ser maior que zero!"); return false; }

    for (let i = 0; i < n; i++) {
        let cpu1 = getValor(`cpu1_${i}`), io1 = getValor(`io1_${i}`), 
            cpu2 = getValor(`cpu2_${i}`), io2 = getValor(`io2_${i}`);
        
        // Verifica se há campos vazios
        if ([cpu1, io1, cpu2, io2].some(v => v === null || isNaN(v))) {
            alert(`Preencha todos os campos do processo P${i}`); return false;
        }

        // NOVO: Verifica se há números negativos
        if ([cpu1, io1, cpu2, io2].some(v => v < 0)) {
            alert(`O processo P${i} contém valores negativos. Use apenas números >= 0.`);
            return false;
        }
        
        processos.push({
            pid: i, 
            bursts: [{tipo:"CPU", tempo: cpu1}, {tipo:"IO", tempo: io1}, {tipo:"CPU", tempo: cpu2}, {tipo:"IO", tempo: io2}],
            etapa: 0, 
            restante: cpu1, 
            chegada: 0, 
            inicio: null, 
            fim: null, 
            espera: 0, 
            resposta: null,
            concluido: false
        });
        filaCPU.push(processos[i]);
    }
    return true;
}

function iniciarSimulacao() {
    pararSimulacao(); // Evita loops duplos
    if (!carregarProcessos()) return;
    tempoTotal = parseInt(document.getElementById("tempoTotal").value);
    tempo = 0; cpuUsoAcumulado = 0; ioUsoAcumulado = 0; 
    timelineCPU = []; timelineIO = [];
    cpuAtual = null; ioAtual = null;
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

function pausar() { pararSimulacao(); }
function continuar() { if (intervalo === null) iniciarLoop(); }
function pararSimulacao() { clearInterval(intervalo); intervalo = null; }

function passoManual() {
    if (intervalo !== null || tempo >= tempoTotal) return;
    passoSimulacao(); 
    atualizarFilas(); 
    renderTimeline();
    document.getElementById("tempoAtual").innerText = `t = ${tempo}`;
    tempo++;
}

function passoSimulacao() {
    // 1. Contabiliza espera para quem está nas filas (CPU e Disco)
    filaCPU.forEach(p => p.espera++);
    // Opcional: filaIO.forEach(p => p.esperaIO++); // Se você quiser medir espera de disco separadamente

    // --- LÓGICA DA CPU ---
    // Se a CPU estiver livre, pega o próximo da fila
    if (!cpuAtual && filaCPU.length > 0) { 
        cpuAtual = filaCPU.shift(); 
        quantumRestante = quantum; 
    }
    
    if (cpuAtual) {
        // Registro de início e tempo de resposta
        if (cpuAtual.inicio === null) { 
            cpuAtual.inicio = tempo; 
            cpuAtual.resposta = tempo; 
        }
        
        cpuUsoAcumulado++; // Contador para o cálculo de % de utilização
        timelineCPU.push(cpuAtual.pid); // Adiciona cor na linha do tempo
        cpuAtual.restante--; 
        quantumRestante--;

        // Se o tempo de CPU atual acabou
        if (cpuAtual.restante === 0) {
            cpuAtual.etapa++; // Avança para a próxima etapa (provavelmente I/O)
            
            if (cpuAtual.etapa < cpuAtual.bursts.length) {
                // Configura o tempo da próxima etapa (I/O)
                cpuAtual.restante = cpuAtual.bursts[cpuAtual.etapa].tempo;
                filaIO.push(cpuAtual); // Move para a fila de Disco
            } else { 
                cpuAtual.fim = tempo; 
                cpuAtual.concluido = true;
            }
            cpuAtual = null;
        } 
        // Se o Quantum acabou mas o processo ainda tem tempo de CPU
        else if (quantumRestante === 0) { 
            filaCPU.push(cpuAtual); 
            cpuAtual = null; 
        }
    } else { 
        timelineCPU.push("idle"); // CPU ociosa
    }

    // --- LÓGICA DO DISCO (I/O) ---
    // Se o Disco estiver livre, pega o próximo da fila de I/O
    if (!ioAtual && filaIO.length > 0) { 
        ioAtual = filaIO.shift(); 
    }
    
    if (ioAtual) {
        ioUsoAcumulado++; // CRUCIAL: Se isso não rodar, o Disco fica em 0%
        timelineIO.push(ioAtual.pid); // Adiciona cor na linha do tempo de Disco
        ioAtual.restante--;

        // Se o tempo de Disco atual acabou
        if (ioAtual.restante === 0) {
            ioAtual.etapa++; // Avança para a próxima etapa (provavelmente volta para CPU)
            
            if (ioAtual.etapa < ioAtual.bursts.length) {
                // Configura o tempo da próxima etapa (CPU2)
                ioAtual.restante = ioAtual.bursts[ioAtual.etapa].tempo;
                filaCPU.push(ioAtual); // Volta para a fila de CPU
            } else {
                ioAtual.fim = tempo;
                ioAtual.concluido = true;
            }
            ioAtual = null;
        }
    } else { 
        timelineIO.push("idle"); // Disco ocioso (blocos cinzas)
    }
}

function mostrarResultados() {
    let turnaroundTotal = 0, esperaTotal = 0, respostaTotal = 0;
    let n = processos.length;

    processos.forEach(p => {
        let turnaround = (p.fim || tempoTotal) - p.chegada;
        turnaroundTotal += turnaround;
        esperaTotal += p.espera;
        respostaTotal += p.resposta || 0;
    });

    let utilCPU = (cpuUsoAcumulado / tempoTotal) * 100;
    let utilDisco = (ioUsoAcumulado / tempoTotal) * 100;

    atualizarResultados(
        utilCPU, 
        utilDisco, 
        esperaTotal / n, 
        turnaroundTotal / n, 
        respostaTotal / n
    );
}

function atualizarResultados(cpuUso, discoUso, espera, turnaround, resposta) {
    document.getElementById("percCPU").innerText = cpuUso.toFixed(2) + "%";
    document.getElementById("percDisco").innerText = discoUso.toFixed(2) + "%";
    document.getElementById("mediaEspera").innerText = espera.toFixed(2);
    document.getElementById("mediaTurnaround").innerText = turnaround.toFixed(2);
    document.getElementById("mediaResposta").innerText = resposta.toFixed(2);
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
        if (p === "idle") box.style.background = "#ddd";
        else { box.style.background = getCor(p); box.innerText = `P${p}`; }
        cpuDiv.appendChild(box);
    });
    
    timelineIO.forEach(p => {
        let box = document.createElement("div"); box.className = "bloco";
        if (p === "idle") box.style.background = "#ddd";
        else { box.style.background = getCor(p); box.innerText = `P${p}`; }
        ioDiv.appendChild(box);
    });
}

function atualizarFilas() {
    const elCPU = document.getElementById("filaCPU");
    const elIO = document.getElementById("filaIO");

    if (elCPU) {
        // Mostra o processo atual (se houver) + os que estão na fila
        let textoCPU = "";
        if (cpuAtual) textoCPU += `[P${cpuAtual.pid}] `; // [Em execução]
        textoCPU += filaCPU.map(p => `P${p.pid}`).join(", ");
        
        elCPU.innerText = textoCPU.trim() || "Nenhum";
    }

    if (elIO) {
        // Mostra o processo atual no disco + os que estão na fila de espera
        let textoIO = "";
        if (ioAtual) textoIO += `[P${ioAtual.pid}] `; // [No Disco]
        textoIO += filaIO.map(p => `P${p.pid}`).join(", ");
        
        elIO.innerText = textoIO.trim() || "Nenhum";
    }
}