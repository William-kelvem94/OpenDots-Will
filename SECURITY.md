# Segurança

O OpenDots é um modelo de aplicação em desenvolvimento, não um serviço hospedado. O protótipo local tem um único proprietário; o acesso a espaços, o mapeamento de identidades do Slack e a delegação por voz precisam de controles adicionais antes do uso conectado por várias pessoas. Este agente autônomo não passou por uma auditoria de segurança.

## Limites previstos

- Execute o desenvolvimento local em loopback.
- Proteja implantações remotas com autenticação e HTTPS.
- Mantenha o serviço de navegador isolado do host da aplicação e das redes privadas. Não exponha sua porta publicamente.
- Mantenha no servidor as credenciais do Intelligence, do modelo, de voz e do navegador. Nunca inclua arquivos `.env` nem bancos de dados locais em commits.
- Trate textos de páginas, conteúdo enviado e respostas do modelo como dados não confiáveis, não como autorização para alterar permissões.
- Autorize no servidor cada operação em espaços, Dots e Threads. Associe explicitamente as identidades do Slack; nunca considere um nome de exibição ou ID de usuário enviado pelo cliente como prova de identidade.
- Sessões de voz devem usar credenciais temporárias e com escopo limitado, e encaminhar ações de execução pelas mesmas permissões usadas em texto e Slack.
- A navegação de pesquisa é somente leitura. Ferramentas de páginas podem editar documentos locais no espaço do Dot que as executa; essas gravações usam verificações de revisão. Gravações externas exigem um fluxo separado de autorização e revisão.

Tarefas recorrentes exigem que o servidor esteja disponível. Uma execução de exemplo não comprova que um provedor ou implantação real seja seguro ou esteja configurado corretamente. Revise os resultados antes de usá-los em decisões importantes.

## Relatos

Use o recurso privado de relato de vulnerabilidades do repositório, quando disponível. Caso contrário, abra uma issue pedindo um canal privado de comunicação, sem incluir detalhes do exploit, credenciais, URLs privadas ou dados pessoais.

Não publique dados sensíveis para reprodução em uma issue pública. No momento, este projeto não garante um prazo de resposta nem oferece recompensa por bugs.
