# Clínica Sorriso Leve

Projeto acadêmico de agendamento odontológico feito com HTML, CSS e JavaScript puro.

## Como executar
1. Baixe ou clone este repositório.
2. Abra a pasta no Visual Studio Code.
3. Abra o arquivo `index.html` no navegador. Se tiver a extensão Live Server, clique com o botão direito no arquivo e escolha **Open with Live Server**.

## Funcionalidades
- Formulário para nome, telefone, serviço, data, horário e observações.
- Horários de segunda a sexta, das 8h às 18h, com intervalo das 12h às 13h (último horário às 17h).
- Não permite agendar em fins de semana, datas passadas ou horários que já passaram.
- Valida o nome e o telefone com DDD.
- Não permite dois agendamentos no mesmo horário neste navegador.
- Lista e cancelamento dos agendamentos.
- Armazenamento local com `localStorage`.

## Importante
Este projeto é somente front-end. Os dados ficam no navegador em que foram cadastrados. Não há banco de dados, login, envio de confirmação ou sincronização entre dispositivos. Para uso real por uma clínica, será necessário criar um back-end e conectar um banco de dados, além de implementar controles de privacidade e segurança.
