# Demonstrações gravadas

Gravadas no app local OpenDots em 29 de setembro de 2026. As gravações usam um projeto Intelligence dedicado chamado `opendots`, um modelo `gpt-5.4-mini` ao vivo e conteúdo de exemplo em um espaço separado chamado Launch studio. Nenhum dado de cliente ou credencial é exibido.

| Gravação                                     | Fluxo                                                                               | Duração    | Enquadramento |
| -------------------------------------------- | ----------------------------------------------------------------------------------- | ---------- | ------- |
| [Chat com páginas](chat-to-space.mp4)                    | Peça ao Scout para navegar, revisar um rascunho, aprová-lo e abrir a página salva | 23 segundos | 150%    |
| [Chat com especialista](specialist-chat.mp4)              | Continue o planejamento de lançamento com Scout e receba uma resposta ao vivo    | 13 segundos | 150%    |
| [Espaços e chat sobre páginas](spaces-page-chat.mp4)      | Abra um espaço e uma página, pergunte sobre o resumo e continue com Scout         | 19 segundos | 135%    |
| [Chat com o computador](computer-chat.mp4)                | Navegue por um site, salve anotações e confira o arquivo pelo chat                | 34 segundos | 150%    |

As gravações mostram os avatares atualizados e a navegação separada para Dots, espaços e conversas recentes. As configurações de acesso aos espaços preservam permissões existentes. A demonstração do computador usa o Scout, com acesso ao navegador, arquivos e terminal habilitado no próprio contêiner.

O README incorpora versões GIF compactas. As versões MP4 estão disponíveis para reprodução e reutilização. São demonstrações gravadas da tela. O vídeo principal omite quatro segundos sem atividade e roda a 1,2×; os demais rodam a 1,25×. Pausas entre trechos também foram removidas. As edições mostram o fluxo de trabalho, não medem a latência do modelo. Nenhuma resposta do assistente ou resultado de ferramenta foi inventado ou substituído. Cada vídeo foi recortado ao redor dos componentes ativos e ampliado conforme indicado em relação à captura original de 1280 pixels de largura; os GIFs usam o mesmo enquadramento. As capturas têm quatro quadros por segundo e servem para mostrar fluxos, não desempenho de animação. Não têm áudio.

As falas entre aspas reproduzem os prompts originais usados nas gravações. Elas foram mantidas no idioma original para corresponder exatamente ao conteúdo dos vídeos.

## Vídeo principal: do chat ao espaço

[Chat to Space](chat-to-space.mp4) follows one live natural-language request:

> Visit https://www.copilotkit.ai in your computer. Draft “Launch in three steps”: one goal and three milestones, under 80 words. Show it for my approval before saving in Launch studio.

Scout abre o site no computador OpenBot existente. O CopilotKit `useRenderTool` exibe o navegador na conversa, e `useHumanInTheLoop` apresenta o rascunho com as opções **Aprovar e salvar** e **Recusar**. A gravação mostra a aprovação, a confirmação da página salva e a página concluída no espaço. A página também continuou disponível após recarregar o app.

A aprovação usa uma rota autenticada pelo proprietário, verifica o acesso atual do Dot ao espaço e evita duplicar salvamentos pela Thread e chamada da ferramenta. Ao reconectar, recupera uma aprovação existente antes de solicitar uma nova decisão. Essa ferramenta de revisão exclusiva da Web não fica disponível no Slack.

## Demonstração do computador pelo chat

[Computer chat](computer-chat.mp4) (34 segundos) usa o chat e as ferramentas de servidor existentes do CopilotKit (`useAgent` / `useCopilotKit`). O computador OpenBot é provisionado antes da gravação. Apenas estas duas mensagens em linguagem natural conduzem o fluxo:

1. “Open https://www.copilotkit.ai in your computer and tell me what it offers in two short bullets.”
2. “Save those notes as copilotkit-notes.md on your computer. Use your terminal to verify the file, then tell me where it is and how many words it contains.”

Scout navega, resume a página, grava o arquivo e executa uma verificação no terminal. A resposta real informa `/workspace/copilotkit-notes.md` e 41 palavras; um comando independente no contêiner confirmou esses dados. Esta gravação não mostra navegação manual, edição de arquivos nem comandos digitados no terminal. O CopilotKit `useRenderTool` e `CopilotChatToolCallsView` exibem o computador diretamente na conversa: um cartão do navegador ao vivo, a confirmação do arquivo e a saída do terminal. O painel lateral permanece fechado. Resultados de ferramentas e respostas não são roteirizados.

A gravação final foi feita após corrigir a rede entre o host e o supervisor e documentar a recuperação de snapshots após reiniciar o computador. Tentativas anteriores com falha não aparecem no vídeo. As pausas de gravação entre as duas solicitações no chat foram removidas; o clipe revisado acelera a captura para 1,25× sem alterar a sequência.

## O que foi verificado

- A credencial fornecida para o modelo autenticou com sucesso.
- Um projeto Intelligence hospedado e uma chave de runtime com escopo de projeto foram provisionados pela CLI do CopilotKit.
- O chat do especialista recebeu uma resposta real do modelo.
- O assistente da página recebeu o contexto do documento salvo e retornou marcos relevantes.
- O resumo de lançamento continuou salvo após recarregar o navegador.
- A conversa da página e a resposta do modelo foram carregadas novamente do Intelligence após atualizar o navegador.

- O provisionamento ao vivo do computador OpenBot, a navegação no navegador, a criação do arquivo e a execução no terminal foram concluídos com sucesso.
- Um arquivo salvo no espaço de trabalho manteve o mesmo conteúdo após parar e iniciar o serviço (verificado separadamente da gravação).
- O trabalho no navegador foi retomado após a reinicialização usando um novo snapshot.

O Slack não aparece na demonstração. A delegação de execução por voz e o comportamento completo de interrupção ainda precisam de verificações ao vivo específicas.

## Teste da interface de chamada de voz

[Chamada de voz](voice-call.mp4) (15 segundos) é uma captura sem áudio de uma chamada WebRTC real no navegador usando `gpt-realtime-2.1`. Ela mostra a conexão, o tempo decorrido, legendas separadas para usuário e Dot, controles para silenciar microfone e áudio, minimizar/ampliar, encerrar e o registro salvo. O microfone foi silenciado durante a sequência dos controles; a fala e as respostas visíveis vieram da sessão real. A captura usa duas imagens por segundo; o tempo de espera foi removido e a reprodução foi acelerada para 1,25×. O clipe não mede latência nem contém áudio gravado.

Verificações ao vivo em 30 de setembro de 2026 confirmaram áudio bidirecional em um teste anterior do microfone, legendas ao vivo, controles funcionais, encerramento correto no provedor e transcrição salva sem erro na chamada. A confirmação final e o resumo do assistente continuaram disponíveis após recarregar a mesma Thread Intelligence. Uma interação real separada no servidor verificou o agente Intelligence compatível com Node usado para sincronizar confirmações e execução; a delegação por voz `ask_compute` não aparece neste clipe.

Ao encerrar uma chamada, o envio do microfone para imediatamente e a reprodução é pausada; depois, a conexão WebRTC é liberada após a solicitação de encerramento ao servidor. Legendas e callbacks de uma sessão encerrada não podem atualizar chamadas futuras. As chaves permanecem no servidor e não aparecem nas gravações.

## Gravar novamente

Use um espaço de exemplo e um especialista separados. Verifique a conexão do modelo e do Intelligence antes de gravar. Não inclua Configurações, arquivos de ambiente, páginas de credenciais nem janelas sem relação na captura. Grave o app real, revise cada trecho e atualize a data e o escopo das verificações ao substituir os arquivos. Nunca substitua respostas ausentes ou com falha por conteúdo roteirizado.
