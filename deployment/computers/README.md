# Serviços de computador do OpenBot

O OpenDots compila o serviço de computador e o supervisor a partir da revisão `b6932d31a8d6e7896c15139dfc27a6c6911deb27` do CopilotKit/OpenBot (MIT). O BuildKit baixa o código-fonte pelo contexto Git fixado; ele não é resolvido a partir de uma branch variável nem de uma imagem `latest`.

O serviço de computador permanece inalterado. O supervisor mantém sua implementação restrita de verificação, parada, redefinição e listagem, além das verificações de propriedade dos recursos. A imagem omite a CLI SPIRE não utilizada e aplica uma alteração que falha de forma segura ao construir o ambiente dos processos filhos: cada computador recebe `HMAC-SHA256(COMPUTER_TOKEN, "opendots-computer:" + dotId)` em vez do token mestre. A aplicação usa a mesma derivação. Nenhum token do supervisor, chave de modelo ou token mestre de computador é encaminhado a um computador.

Se a versão upstream fixada mudar, a alteração impede a compilação. Para atualizar, revise em conjunto os contratos da API, o comportamento de propriedade/volumes e esta alteração. Na próxima solicitação de verificação após a mudança do token mestre, o supervisor fixado substitui os contêineres gerenciados pela nova credencial e mantém os volumes. Não exclua os volumes de perfil ou espaço de trabalho durante atualizações normais.

Consulte [configuração do computador](../../docs/COMPUTERS.md). A licença MIT do OpenBot está incluída em [LICENSE.openbot](LICENSE.openbot).
