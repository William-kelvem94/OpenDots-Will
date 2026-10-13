import type { CopilotKitIntelligence } from '@copilotkit/runtime/v2';
import type { WorkspaceStore } from './workspace.js';

type Selector = NonNullable<
  ConstructorParameters<
    typeof CopilotKitIntelligence
  >[0]['getLearningContainerId']
>;

/** Called before execution, including before a new channel thread reaches DotAgent. */
export function learningSelector(
  workspace: WorkspaceStore,
  channelDotId?: string,
): Selector {
  return ({ surface, user, agentId, input }) => {
    if (user?.id !== workspace.ownerId)
      throw new Error('O aprendizado da conversa exige o proprietário do espaço de trabalho.');
    if (surface === 'channel') {
      if (agentId !== channelDotId)
        throw new Error(
          'O aprendizado da conversa exige o Dot configurado para o Slack.',
        );
      if (
        !workspace
          .conversations()
          .some((thread) => thread.id === input.threadId)
      )
        workspace.bindThread(input.threadId, agentId, 'Slack conversation');
    }
    return (
      workspace.requireThread(input.threadId, agentId).learningContainerId ??
      null
    );
  };
}
