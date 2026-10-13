# Conexões

As conexões oferecem a um Dot ferramentas de servidores [MCP](https://modelcontextprotocol.io) remotos: e-mail, calendários, rastreadores de issues, notas ou serviços próprios. Cada conexão pertence a um Dot.

## Adicionar uma conexão

1. Abra as configurações de um Dot (**Editar especialista**).
2. Em **Conexões**, informe um nome, o endpoint Streamable HTTP do servidor (por exemplo, `https://example.com/mcp`) e, se desejar, um token bearer.
3. Selecione **Conectar**. O OpenDots lista e salva as ferramentas do servidor.

Use **Atualizar** quando o servidor adicionar ou alterar ferramentas. Suas escolhas para as ferramentas existentes serão mantidas.

## Aprovações

Todas as ferramentas começam ativadas. Uma ferramenta que o servidor identifica como somente leitura (`readOnlyHint`) é executada diretamente. Todas as demais começam com **Perguntar antes** ativado.

Quando um Dot chama uma ferramenta com **Perguntar antes**, ela não é executada. O servidor armazena a conexão, a ferramenta e os argumentos exatos; o Dot exibe um cartão de aprovação no chat com um resumo e esses argumentos. A ação só é executada quando você seleciona **Aprovar e executar**, por uma rota do servidor exclusiva do proprietário. Essa rota usa a solicitação armazenada, nunca os argumentos enviados junto com a aprovação, e só prossegue se o Dot da conversa ainda tiver aquela ferramenta ativada. As solicitações expiram após uma hora. Cada aprovação é executada no máximo uma vez. Ao reabrir a conversa, o resultado salvo é exibido ou a verificação continua enquanto a ação estiver em andamento. Um resultado salvo só é exibido para a aprovação que o gerou.

A indicação de somente leitura vem do servidor e não é uma garantia. Ative **Perguntar antes** para qualquer ferramenta em que não confie plenamente e desative as ferramentas de que o Dot não precisa.

Os cartões de aprovação aparecem apenas no app Web. Pelo Slack ou em tarefas agendadas, uma ferramenta com **Perguntar antes** instrui o Dot a pedir que você continue no app Web.

Alterar as conexões ou configurações de ferramentas de um Dot interrompe a interação em andamento.

## Notas de segurança

- Os tokens são armazenados no banco SQLite do servidor e nunca são enviados ao navegador. Proteja `DATABASE_PATH` como você protege `.env`.
- Os resultados das ferramentas são enviados ao modelo como dados não confiáveis.
- Os endpoints devem usar `http` ou `https` e não podem incluir credenciais na URL. Endereços locais são permitidos; você pode executar servidores MCP na mesma máquina. Adicione apenas servidores confiáveis.
- Servidores que aceitam somente OAuth ainda não são compatíveis. Use um servidor que aceite token bearer ou coloque à frente dele um proxy autenticado por token.
