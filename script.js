
// Seleciona os elementos da página
const form = document.querySelector("#form-agendamento");
const campoData = document.querySelector("#data");
const campoHorario = document.querySelector("#horario");
const lista = document.querySelector("#lista-agendamentos");
const mensagem = document.querySelector("#mensagem");

// Chave de armazenamento
const STORAGE_KEY = "sorrisoLeveAgendamentos";

// Horários disponíveis
const horariosDisponiveis = [
  "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00", "17:00"
];

// Retorna a data atual
function dataLocalISO() {
  const agora = new Date();
  const fuso = agora.getTimezoneOffset();

  return new Date(
    agora.getTime() - fuso * 60000
  ).toISOString().slice(0, 10);
}

// Define a data mínima
campoData.min = dataLocalISO();

// Verifica se a data e o horário já passaram
function jaPassou(data, horario) {
  return new Date(`${data}T${horario}:00`) <= new Date();
}

// Busca os agendamentos salvos
function obterAgendamentos() {
  return JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );
}

// Atualiza os horários disponíveis
function atualizarHorarios() {

  const dataSelecionada = campoData.value;

  campoHorario.innerHTML =
    '<option value="">Selecione um horário</option>';

  if (!dataSelecionada) return;

  if (dataSelecionada < dataLocalISO()) {
    campoHorario.innerHTML =
      '<option value="">Escolha uma data a partir de hoje</option>';
    return;
  }

  // Verifica o dia da semana
  const dia = new Date(
    `${dataSelecionada}T12:00:00`
  ).getDay();

  if (dia === 0 || dia === 6) {
    campoHorario.innerHTML =
      '<option value="">A clínica não atende aos fins de semana</option>';
    return;
  }

  // Busca os horários já agendados naquela data
  const ocupados = obterAgendamentos()
    .filter(item => item.data === dataSelecionada)
    .map(item => item.horario);

  // Exibe somente os horários livres
  horariosDisponiveis
    .filter(horario => !ocupados.includes(horario))
    .filter(horario => !jaPassou(dataSelecionada, horario))
    .forEach(horario => {

      const option = document.createElement("option");

      option.value = horario;
      option.textContent = horario;

      campoHorario.appendChild(option);
    });

  // Verifica se ainda existem horários disponíveis
  if (campoHorario.options.length === 1) {
    campoHorario.innerHTML =
      '<option value="">Não há horários disponíveis</option>';
  }
}

// Formata a data
function formatarData(data) {
  return new Date(
    `${data}T12:00:00`
  ).toLocaleDateString("pt-BR");
}

// Exibe os agendamentos realizados
function renderizarAgendamentos() {

  const agendamentos = obterAgendamentos().sort((a, b) =>
    `${a.data}${a.horario}`.localeCompare(
      `${b.data}${b.horario}`
    )
  );

  lista.innerHTML = "";

  if (agendamentos.length === 0) {
    lista.innerHTML =
      '<p class="vazio">Nenhum agendamento por enquanto.</p>';
    return;
  }

  agendamentos.forEach(item => {

    const card = document.createElement("article");
    card.className = "agendamento-item";

    const detalhes = document.createElement("div");

    const nome = document.createElement("strong");
    nome.textContent = item.nome;

    const info = document.createElement("small");

    info.textContent =
      `${item.servico} • ${formatarData(item.data)} às ${item.horario} • ${item.telefone}`;

    detalhes.append(nome, info);

    // Exibe as observações, quando preenchidas
    if (item.observacoes) {
      const obs = document.createElement("small");
      obs.textContent = `Observações: ${item.observacoes}`;
      detalhes.append(obs);
    }

    // Botão para cancelar o agendamento
    const remover = document.createElement("button");

    remover.className = "remover";
    remover.type = "button";
    remover.textContent = "Cancelar";

    remover.addEventListener("click", () => {

      const atualizados = obterAgendamentos()
        .filter(registro => registro.id !== item.id);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(atualizados)
      );

      // Atualiza a lista
      renderizarAgendamentos();

      // Libera novamente o horário
      atualizarHorarios();

    });

    card.append(detalhes, remover);

    lista.appendChild(card);

  });
}

// Limpa o aviso do telefone enquanto o usuário corrige
form.elements.telefone.addEventListener("input", event => {
  event.target.setCustomValidity("");
});

// Atualiza os horários quando a data muda
campoData.addEventListener("change", atualizarHorarios);

// Evento de confirmação do agendamento
form.addEventListener("submit", event => {

  event.preventDefault();

  mensagem.textContent = "";

  // Remove espaços sobrando antes de validar
  const campoNome = form.elements.nome;
  const campoTelefone = form.elements.telefone;
  campoNome.value = campoNome.value.trim();
  campoTelefone.value = campoTelefone.value.trim();

  // O telefone precisa ter DDD + número (10 ou 11 dígitos)
  const digitos = campoTelefone.value.replace(/\D/g, "");
  const formatoValido = /^[\d\s()+-]+$/.test(campoTelefone.value);

  campoTelefone.setCustomValidity(
    formatoValido && (digitos.length === 10 || digitos.length === 11)
      ? ""
      : "Informe o telefone com DDD. Ex.: (85) 91234-5678"
  );

  if (!form.reportValidity()) return;

  // Guarda a data escolhida antes de limpar o formulário
  const dataSelecionada = campoData.value;

  const dados = new FormData(form);

  const novoAgendamento = {

    id: Date.now() + Math.random(),

    nome: (dados.get("nome") || "").trim(),

    telefone: (dados.get("telefone") || "").trim(),

    servico: dados.get("servico"),

    data: dados.get("data"),

    horario: dados.get("horario"),

    observacoes: (dados.get("observacoes") || "").trim()

  };

  // Impede agendamentos nos fins de semana
  const diaSemana = new Date(
    `${novoAgendamento.data}T12:00:00`
  ).getDay();

  if (diaSemana === 0 || diaSemana === 6) {

    mensagem.textContent =
      "Selecione um dia de segunda a sexta-feira.";

    return;
  }

  // Impede horários que já passaram (a página pode ter ficado aberta)
  if (jaPassou(novoAgendamento.data, novoAgendamento.horario)) {

    atualizarHorarios();

    mensagem.textContent =
      "Esse horário já passou. Escolha outro.";

    return;
  }

  // Verifica se o horário já está ocupado
  const agendamentos = obterAgendamentos();

  const horarioOcupado = agendamentos.some(item =>
    item.data === novoAgendamento.data &&
    item.horario === novoAgendamento.horario
  );

  if (horarioOcupado) {

    mensagem.textContent =
      "Esse horário já está ocupado. Escolha outro.";

    atualizarHorarios();

    return;
  }

  // Salva o novo agendamento
  agendamentos.push(novoAgendamento);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(agendamentos)
  );

  // Limpa os campos do formulário
  form.reset();

  // Mantém a data anteriormente selecionada
  campoData.value = dataSelecionada;

  // Atualiza os horários imediatamente
  atualizarHorarios();

  // Atualiza a lista de consultas
  renderizarAgendamentos();

  // Exibe mensagem de confirmação
  mensagem.textContent =
    "Agendamento realizado com sucesso!";

});

// Carrega os dados ao abrir o site
renderizarAgendamentos();
atualizarHorarios();
