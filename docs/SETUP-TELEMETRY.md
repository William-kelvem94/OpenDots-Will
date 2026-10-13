# Telemetria da configuração no navegador

O OpenDots rastreia o fluxo de configuração existente no navegador por meio do contrato de ingestão CopilotKit do servidor. Esta é a distribuição Web; o OpenDots não tem instalador nativo, instalação de engine, pré-requisito do Windows, assistente de download de imagem nem seletor de modelo/harness. Esses eventos de desktop não se aplicam.

Por padrão, a telemetria está ativada. Definir `DO_NOT_TRACK=true|1` ou `COPILOTKIT_TELEMETRY_DISABLED=true|1` desativa o emissor de configuração e o runtime. Reinicie o servidor após alterar o ambiente. A desativação exclui a linha de rastreamento de configuração, incluindo a fila pendente e a identidade de instalação alternativa. Isso não altera o proprietário, as conversas nem as configurações da aplicação. Uma taxa de amostragem igual a zero também suprime os eventos de configuração.

| Evento                          | Propriedades permitidas                                                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `oss.runtime.setup_step_viewed` | `kind=step_viewed`, step: `setup_required`, `ready`, `settings`                                                      |
| `oss.runtime.setup_failed`      | `kind=setup_failed`, step enum, error class: `configuration_missing`, `assistant_run_failed`, `channel_start_failed` |
| `oss.runtime.setup_activated`   | `kind=activated`                                                                                                     |
| `oss.runtime.setup_abandoned`   | `kind=setup_abandoned`, last step enum                                                                               |

`ready` significa que as configurações obrigatórias do servidor existem. A ativação exige uma mensagem do assistente com texto transmitido não vazio e um evento AG-UI `RUN_FINISHED` bem-sucedido, sem erro, cancelamento ou timeout. Ela é registrada uma vez por instalação e continua deduplicada após reinicializações do servidor. Mensagens de usuário, respostas parciais, execuções apenas de ferramentas e configurações prontas não ativam a instalação. Conversas gerenciadas pelo servidor, incluindo Slack quando configurado, compartilham essa ativação.

A rota autenticada `/api/setup-telemetry` aceita apenas objetos estritos de visualização de etapa e abandono. Ela rejeita chaves desconhecidas, etapas inválidas, propriedades arbitrárias, ativações ou falhas falsificadas pelo cliente e estados de prontidão incompatíveis com o servidor. Continuam valendo as proteções existentes para token do proprietário, origem, solicitações entre sites, tipo de conteúdo e tamanho do corpo. A tela de configurações não revela valores das variáveis de ambiente.

Os metadados identificam OpenDots, `opendots_distribution=web`, a versão numérica `opendots_version=0.1.0`, `runtime_env=node`, a plataforma do servidor (`macos|windows|linux|other`), a arquitetura (`aarch64|x86_64|other`) e um `installation_id` aleatório e persistente. A plataforma identifica o servidor, inclusive seu contêiner; o sistema operacional do navegador não é inferido. Os eventos de configuração não incluem prompts, respostas, erros brutos, chaves, URLs, caminhos de arquivos, nomes de modelos, e-mails, IDs do proprietário, user agents do navegador nem identificadores derivados da máquina.

Se `CPK_TELEMETRY_ID` estiver definido e não estiver vazio, ele terá prioridade como cabeçalho de ingestão e `telemetryId` do runtime, preservando a identidade de projeto/conta criada pela CLI. Caso contrário, ambos usam o UUID aleatório e persistente da instalação. Esse UUID continua como metadado separado mesmo quando a identidade da CLI está presente. Remover a variável da CLI restaura a identidade alternativa da instalação. O runtime recebe os metadados correspondentes por `telemetryProperties`; não é adicionado SDK PostHog, chave pública de captura nem evento de cadastro separado.

Os eventos são persistidos no banco SQLite existente antes do envio. A fila comporta até 256 eventos e descarta os mais antigos se exceder esse limite. IDs de evento UUID e timestamps em segundos Unix são mantidos durante reenvios e novas tentativas. O envio começa com a inicialização do servidor, tenta novamente a cada 15 segundos e preserva eventos após falhas de rede ou HTTP. Cada ciclo tem limite de dois segundos e timeout de 1,5 segundo por solicitação; portanto, o envio no encerramento termina em aproximadamente 3,5 segundos e deixa os eventos restantes para a próxima inicialização. Os diagnósticos usam categorias limitadas e nunca incluem detalhes de exceções de transporte.

O evento `pagehide` do navegador envia, como melhor esforço, um evento autenticado de abandono com keepalive. Um abandono aceito limpa a etapa rastreada; se necessário, o encerramento ou reinício recupera o abandono de uma etapa persistida e não concluída. Uma aba fechada, um navegador encerrado à força, um servidor inacessível ou uma solicitação com falha entre navegador e servidor pode perder um evento antes de chegar ao SQLite. O abandono recuperado descreve a última etapa de configuração observada para a instalação; não mede de forma definitiva o fechamento de abas, sobretudo quando há várias abas abertas. Uma confirmação HTTP de ingestão, por si só, não comprova o recebimento pelo PostHog.

Os testes de regressão locais cobrem reenvio offline após reabrir bancos, estabilidade dos IDs/identidades de eventos, unidades de timestamp, limites da fila, ambas as variáveis e valores de desativação, prioridade entre identidade alternativa e CLI, recuperação de abandono, deduplicação de ativação, sucesso do agente e falhas de inicialização, restrição ao papel de assistente, supressão em timeout/cancelamento, encerramento limitado, rejeição de esquemas e rotas autenticadas protegidas por origem. Os testes interceptam transportes ou injetam um registrador local; não enviam eventos de validação para produção:

```sh
DO_NOT_TRACK=1 npm exec vitest run tests/setup-telemetry.test.ts tests/dot-agent-channel.test.ts tests/telemetry.test.ts tests/app.test.ts
npm run typecheck
```

O envio em produção e a atribuição no PostHog são separados dessas verificações locais; consulte [TELEMETRY.md](TELEMETRY.md) para validação ao vivo e relatórios.
