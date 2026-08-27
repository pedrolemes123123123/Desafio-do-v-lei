// ==========================================
// 1. VARIÁVEIS (Estado do Jogo)
// ==========================================
let pontos = 0;
let placarTimeA = 0;
let placarTimeB = 0;
let setsTimeA = 0;
let setsTimeB = 0;
let setsDisputados = 0;
let bolaEmJogo = true;
let bolaLevantada = false;
let rivalBolaLevantada = false;
let indiceJogadorBola = 0;
let ladoBola = "equipe";
let jogoAutomatico = null;
let toquesEquipe = 0;
let toquesRival = 0;
let passesEquipe = 0;
const CHANCE_PONTO_ATAQUE = 0.6;
const CHANCE_ERRO_JOGADA = 0.15;

const ordemJogadores = [
	"rival-4", "rival-3", "rival-2", "rival-5", "rival-6", "rival-1",
	"pos4", "pos3", "pos2", "pos5", "pos6", "pos1"
];

const posicoesBola = {
	"rival-4": { left: "17%", top: "15%", nome: "Rival 4" },
	"rival-3": { left: "50%", top: "15%", nome: "Rival 3" },
	"rival-2": { left: "83%", top: "15%", nome: "Rival 2" },
	"rival-5": { left: "17%", top: "33%", nome: "Rival 5" },
	"rival-6": { left: "50%", top: "33%", nome: "Rival 6" },
	"rival-1": { left: "83%", top: "33%", nome: "Rival 1" },
	pos4: { left: "17%", top: "69%" },
	pos3: { left: "50%", top: "69%" },
	pos2: { left: "83%", top: "69%" },
	pos5: { left: "17%", top: "87%" },
	pos6: { left: "50%", top: "87%" },
	pos1: { left: "83%", top: "87%" }
};

function moverBola(posicao, jogador) {
	const bola = document.getElementById("bola");
	const destino = posicoesBola[posicao];
	if (!bola || !destino) return;

	bola.style.left = destino.left;
	bola.style.top = destino.top;
	bola.setAttribute("aria-label", "Bola com " + jogador);
}

function nomeRival(posicao) {
	return document.getElementById("rival" + posicao).value;
}

function nomeJogador(posicao) {
	if (posicao.startsWith("rival-")) return nomeRival(posicao.split("-")[1]);
	return document.getElementById(posicao).value;
}

function adicionarToque(time) {
	const contador = time === "equipe" ? toquesEquipe : toquesRival;
	if (contador >= 3) return false;

	if (time === "equipe") toquesEquipe++;
	else toquesRival++;
	return true;
}

function jogadorErrou() {
	return Math.random() < CHANCE_ERRO_JOGADA;
}

function registrarErro(time, mensagem) {
	registrarPonto(time === "A" ? "B" : "A");
	document.getElementById("resultado").innerHTML = mensagem;
}

function possePermitida(time) {
	if ((time === "A" && ladoBola === "equipe") || (time === "B" && ladoBola === "rival")) return true;

	document.getElementById("resultado").innerHTML =
		"⚠️ A bola está com a Equipe " + (ladoBola === "equipe" ? "A" : "B") +
		". A Equipe " + time + " deve aguardar.";
	return false;
}

function passarBolaProximo() {
	const inicio = ladoBola === "equipe" ? 6 : 0;
	if (indiceJogadorBola < inicio || indiceJogadorBola >= inicio + 6) {
		indiceJogadorBola = inicio;
	}
	const posicao = ordemJogadores[indiceJogadorBola];
	const jogador = nomeJogador(posicao);
	if (ladoBola === "equipe") {
		if (jogadorErrou()) {
			registrarErro("A", "❌ A Equipe A errou o toque! Ponto para a Equipe B.");
			return;
		}
		if (passesEquipe >= 3) {
			document.getElementById("resultado").innerHTML =
				"⚠️ A Equipe A já fez 3 passes nesta jogada.";
			return;
		}
		passesEquipe++;
	} else if (!adicionarToque("rival")) {
		document.getElementById("resultado").innerHTML =
			"⚠️ A bola já passou por 3 jogadores nesta jogada. Envie-a para o outro lado.";
		return;
	} else if (jogadorErrou()) {
		registrarErro("B", "❌ A Equipe B errou o toque! Ponto para a Equipe A.");
		return;
	}
	moverBola(posicao, jogador);
	document.getElementById("resultado").innerHTML =
		"🏐 A bola passou para <b>" + jogador + "</b> (" + posicao + ").";
	indiceJogadorBola = (indiceJogadorBola + 1) % ordemJogadores.length;
}

function executarJogadaAutomatica() {
	if (!bolaEmJogo) {
		pararJogoAutomatico();
		return;
	}

	if (ladoBola === "equipe") {
		defender();
		setTimeout(levantar, 700);
		setTimeout(atacar, 1400);
	} else {
		rivalDefender();
		setTimeout(rivalLevantar, 700);
		setTimeout(rivalAtacar, 1400);
	}
}

function alternarJogoAutomatico() {
	if (jogoAutomatico) {
		pararJogoAutomatico();
		return;
	}

	if (!bolaEmJogo) return;

	const botao = document.getElementById("btn-automatico");
	botao.textContent = "⏹️ Parar jogo automático";
	document.getElementById("resultado").innerHTML =
		"▶️ Jogo automático iniciado!";
	executarJogadaAutomatica();
	jogoAutomatico = setInterval(executarJogadaAutomatica, 2200);
}

function pararJogoAutomatico() {
	if (jogoAutomatico) {
		clearInterval(jogoAutomatico);
		jogoAutomatico = null;
	}

	const botao = document.getElementById("btn-automatico");
	if (botao) botao.textContent = "▶️ Iniciar jogo automático";
}

// ==========================================
// 2. FUNÇÃO DE RODÍZIO (Lógica de Troca)
// ==========================================
function fazerRodizio() {
	if (!possePermitida("A")) return;
	const p1 = document.getElementById("pos1").value;
	const p2 = document.getElementById("pos2").value;
	const p3 = document.getElementById("pos3").value;
	const p4 = document.getElementById("pos4").value;
	const p5 = document.getElementById("pos5").value;
	const p6 = document.getElementById("pos6").value;

	document.getElementById("pos1").value = p2;
	document.getElementById("pos6").value = p1;
	document.getElementById("pos5").value = p6;
	document.getElementById("pos4").value = p5;
	document.getElementById("pos3").value = p4;
	document.getElementById("pos2").value = p3;

	bolaLevantada = false;
	moverBola("pos1", p2);
	document.getElementById("resultado").innerHTML =
		"🔄 Rodízio realizado! O novo sacador (Posição 1) é: <b>" + p2 + "</b>!";
}

// ==========================================
// 3. FUNÇÕES DE AÇÕES DAS JOGADAS (DOM)
// ==========================================
function sacar() {
	if (!possePermitida("A")) return;
	bolaLevantada = false;
	toquesEquipe = 0;
	toquesRival = 0;
	passesEquipe = 0;
	const sacador = document.getElementById("pos1").value;
	if (jogadorErrou()) {
		registrarErro("A", "❌ " + sacador + " errou o saque! Ponto para a Equipe B.");
		return;
	}
	ladoBola = "rival";
	indiceJogadorBola = 0;
	moverBola("rival-1", nomeRival(1));
	document.getElementById("resultado").innerHTML =
		"🏐 Saque da posição 1 da Equipe A realizado por <b>" + sacador +
		"</b>! A bola passou para a Equipe B. Agora a Equipe B pode defender, passar ou atacar.";
}

function defender() {
	if (!possePermitida("A")) return;
	ladoBola = "equipe";
	if (jogadorErrou()) {
		registrarErro("A", "❌ A Equipe A errou a manchete! Ponto para a Equipe B.");
		return;
	}
	if (!adicionarToque("equipe")) {
		document.getElementById("resultado").innerHTML =
			"⚠️ A Equipe A já tocou na bola 3 vezes. Envie a bola para o outro lado.";
		return;
	}
	moverBola("pos6", document.getElementById("pos6").value);
	document.getElementById("resultado").innerHTML =
		"👏 Defesa realizada com sucesso! Agora preparem o levantamento.";
}

function levantar() {
	if (!possePermitida("A")) return;
	const levantador = document.getElementById("pos3").value;
	if (jogadorErrou()) {
		registrarErro("A", "❌ " + levantador + " errou o levantamento! Ponto para a Equipe B.");
		return;
	}
	if (!adicionarToque("equipe")) {
		document.getElementById("resultado").innerHTML =
			"⚠️ A Equipe A já tocou na bola 3 vezes. Envie a bola para o outro lado.";
		return;
	}
	bolaLevantada = true;
	moverBola("pos3", levantador);
	document.getElementById("resultado").innerHTML =
		"🎯 Levantamento perfeito feito por <b>" + levantador +
		"</b> (Posição 3)! Bola pronta para o ATAQUE!";
}

function atacar() {
	if (!possePermitida("A")) return;
	if (toquesEquipe !== 2) {
		document.getElementById("resultado").innerHTML =
			"⚠️ O ataque deve ser o terceiro toque da Equipe A.";
		return;
	}

	if (!bolaLevantada) {
		document.getElementById("resultado").innerHTML =
			"⚠️ <b>Ataque não permitido!</b> É necessário realizar um <b>Levantamento</b> antes de atacar!";
		return;
	}

	bolaLevantada = false;
	adicionarToque("equipe");
	toquesRival = 0;
	passesEquipe = 0;
	pontos++;
	ladoBola = "rival";
	moverBola("rival-6", nomeRival(6));
	if (Math.random() < CHANCE_PONTO_ATAQUE) {
		document.getElementById("resultado").innerHTML =
			"🔥 Ataque potente! A bola atravessou a rede e chegou em <b>" +
				nomeRival(6) + "</b>! Ponto para a Equipe A.";
		registrarPonto("A");
	} else {
		document.getElementById("resultado").innerHTML =
			"🛡️ A Equipe B defendeu o ataque! A jogada continua sem ponto.";
	}
}

function pontoRival() {
	if (!possePermitida("B")) return;
	moverBola("rival-2", nomeRival(2));
	registrarPonto("B");
}

function rivalSacar() {
	if (!possePermitida("B")) return;
	bolaLevantada = false;
	rivalBolaLevantada = false;
	toquesEquipe = 0;
	const sacador = nomeRival(1);
	if (jogadorErrou()) {
		registrarErro("B", "❌ " + sacador + " errou o saque! Ponto para a Equipe A.");
		return;
	}
	ladoBola = "equipe";
	indiceJogadorBola = 6;
	moverBola("pos6", document.getElementById("pos6").value);
	document.getElementById("resultado").innerHTML =
		"⚔️ Saque da posição 1 da Equipe B realizado por <b>" + sacador +
		"</b>! A bola passou para a Equipe A. Agora a Equipe A pode defender, passar ou bloquear.";
}

function rivalDefender() {
	if (!possePermitida("B")) return;
	const defensor = nomeRival(5);
	ladoBola = "rival";
	if (jogadorErrou()) {
		registrarErro("B", "❌ A Equipe B errou a manchete! Ponto para a Equipe A.");
		return;
	}
	if (!adicionarToque("rival")) {
		document.getElementById("resultado").innerHTML =
			"⚠️ A Equipe B já tocou na bola 3 vezes. Deve enviar a bola para o outro lado.";
		return;
	}
	moverBola("rival-5", defensor);
	document.getElementById("resultado").innerHTML =
		"⚔️ Defesa do rival feita por <b>" + defensor + "</b>!";
}

function rivalLevantar() {
	if (!possePermitida("B")) return;
	const levantador = nomeRival(3);
	if (jogadorErrou()) {
		registrarErro("B", "❌ " + levantador + " errou o levantamento! Ponto para a Equipe A.");
		return;
	}
	if (!adicionarToque("rival")) {
		document.getElementById("resultado").innerHTML =
			"⚠️ O rival já tocou na bola 3 vezes. Deve enviar a bola para o outro lado.";
		return;
	}
	rivalBolaLevantada = true;
	moverBola("rival-3", levantador);
	document.getElementById("resultado").innerHTML =
		"⚔️ Levantamento do rival feito por <b>" + levantador + "</b>!";
}

function rivalAtacar() {
	if (!possePermitida("B")) return;
	if (toquesRival !== 2) {
		document.getElementById("resultado").innerHTML =
			"⚠️ O ataque deve ser o terceiro toque da Equipe B.";
		return;
	}

	if (!rivalBolaLevantada) {
		document.getElementById("resultado").innerHTML =
			"⚠️ A Equipe B precisa levantar a bola antes de atacar!";
		return;
	}

	rivalBolaLevantada = false;
	adicionarToque("rival");
	toquesEquipe = 0;
	ladoBola = "equipe";
	moverBola("pos6", document.getElementById("pos6").value);
	if (Math.random() < CHANCE_PONTO_ATAQUE) {
		registrarPonto("B");
	} else {
		document.getElementById("resultado").innerHTML =
			"🛡️ A Equipe A defendeu o ataque da Equipe B! A jogada continua sem ponto.";
	}
}

function rivalBloquear() {
	if (!possePermitida("B")) return;
	if (jogadorErrou()) {
		registrarErro("B", "❌ A Equipe B errou o bloqueio! Ponto para a Equipe A.");
		return;
	}
	if (toquesRival !== 2) {
		document.getElementById("resultado").innerHTML =
			"⚠️ O bloqueio deve ser o terceiro toque da Equipe B.";
		return;
	}

	const bloqueador = nomeRival(4);
	adicionarToque("rival");
	toquesEquipe = 0;
	ladoBola = "equipe";
	indiceJogadorBola = 6;
	moverBola("pos4", nomeJogador("pos4"));
	document.getElementById("resultado").innerHTML =
		"⚔️ Bloqueio do rival feito por <b>" + bloqueador +
		"</b>! A bola passou para o outro lado, na posição 4 da Equipe A.";
}

function fazerRodizioRival() {
	if (!possePermitida("B")) return;
	const nomes = [1, 2, 3, 4, 5, 6].map(nomeRival);
	const novoTime = [nomes[1], nomes[2], nomes[3], nomes[4], nomes[5], nomes[0]];
	[1, 2, 3, 4, 5, 6].forEach((posicao, indice) => {
		document.getElementById("rival" + posicao).value = novoTime[indice];
	});
	moverBola("rival-1", novoTime[0]);
	document.getElementById("resultado").innerHTML =
		"⚔️ Rodízio rival realizado! <b>" + novoTime[0] + "</b> está com a bola.";
}

function bloquear() {
	if (!possePermitida("A")) return;
	const equipeComBola = ladoBola === "equipe";
	const toquesAtuais = equipeComBola ? toquesEquipe : toquesRival;
	if (jogadorErrou()) {
		registrarErro(equipeComBola ? "A" : "B", equipeComBola
			? "❌ A Equipe A errou o bloqueio! Ponto para a Equipe B."
			: "❌ A Equipe B errou o bloqueio! Ponto para a Equipe A.");
		return;
	}
	if (toquesAtuais !== 2) {
		document.getElementById("resultado").innerHTML =
			"⚠️ O bloqueio deve ser o terceiro toque da equipe.";
		return;
	}

	const posicaoDestino = equipeComBola ? "rival-4" : "pos4";
	const jogadorDestino = nomeJogador(posicaoDestino);
	adicionarToque(equipeComBola ? "equipe" : "rival");
	ladoBola = posicaoDestino === "pos4" ? "equipe" : "rival";
	if (ladoBola === "equipe") toquesEquipe = 0;
	else toquesRival = 0;
	indiceJogadorBola = ladoBola === "equipe" ? 6 : 0;
	moverBola(posicaoDestino, jogadorDestino);
	document.getElementById("resultado").innerHTML =
		"🛡️ Bloqueio realizado! A bola passou para o outro lado e foi para <b>" + jogadorDestino +
		"</b> (Posição 4).";
}

// ==========================================
// 4. REGRAS DE NEGÓCIO E LÓGICA DA PARTIDA
// ==========================================
function registrarPonto(timeVencedor) {
	if (!bolaEmJogo) return;

	if (timeVencedor === "A") {
		placarTimeA++;
		console.log("Ponto para o Time A!");
	} else {
		placarTimeB++;
		console.log("Ponto para o Time B!");
	}

	document.getElementById("placar").innerHTML =
		"Equipe A: " + placarTimeA + " · Equipe B: " + placarTimeB +
		"<br>Sets: " + setsTimeA + " x " + setsTimeB + " (" + setsDisputados + "/7)";

	verificarFimDeSet();

	if (bolaEmJogo) {
		if (timeVencedor === "A") {
			ladoBola = "equipe";
			fazerRodizio();
			sacar();
		} else {
			ladoBola = "rival";
			rivalSacar();
		}
	}
}

function verificarFimDeSet() {
	if (placarTimeA < 25 && placarTimeB < 25) return;

	const vencedor = placarTimeA >= 25 ? "Equipe A" : "Equipe B";
	if (placarTimeA >= 25) setsTimeA++;
	else setsTimeB++;
	setsDisputados++;

	if (setsDisputados === 7) {
		bolaEmJogo = false;
		pararJogoAutomatico();
		document.getElementById("resultado").innerHTML =
			"🏆 Partida encerrada! " + vencedor + " venceu o 7º set.";
	} else {
		placarTimeA = 0;
		placarTimeB = 0;
		toquesEquipe = 0;
		toquesRival = 0;
		document.getElementById("resultado").innerHTML =
			"🏐 Fim do set! " + vencedor + " venceu. Começou o set " +
			(setsDisputados + 1) + " de 7.";
	}

	document.getElementById("placar").innerHTML =
		"Equipe A: " + placarTimeA + " · Equipe B: " + placarTimeB +
		"<br>Sets: " + setsTimeA + " x " + setsTimeB + " (" + setsDisputados + "/7)";
}
