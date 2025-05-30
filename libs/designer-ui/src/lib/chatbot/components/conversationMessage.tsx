import { useAzureCopilotButton, useExternalLink, useFeedbackMessage } from '../feedbackHelper';
import { AssistantError } from './assistantError';
import { AssistantGreeting } from './assistantGreeting';
import { AssistantReplyWithFlow } from './assistantReplyWithFlow';
import { ChatBubble } from './chatBubble';
import { ConnectionsSetupMessage } from './connectionsSetupMessage';
import { ConversationItemType } from './conversationItem';
import type { ConversationItem, UserQueryItem, AssistantReplyItem } from './conversationItem';
import { OperationsNeedingAttentionMessage } from './operationsNeedAttentionMessage';
import { useRef } from 'react';
import Markdown from 'react-markdown';
import { ToolReply } from './toolReply';
import { AgentHeader } from './agentHeader';

type ConversationMessageProps = {
  item: ConversationItem;
};

export const ConversationMessage = ({ item }: ConversationMessageProps) => {
  switch (item.type) {
    case ConversationItemType.Query:
      return <UserMessage item={item} />;
    case ConversationItemType.Greeting:
      return <AssistantGreeting item={item} />;
    case ConversationItemType.Reply:
      return <AssistantReply item={item} />;
    case ConversationItemType.ReplyError:
      return <AssistantError item={item} />;
    case ConversationItemType.ReplyWithFlow:
      return <AssistantReplyWithFlow item={item} />;
    case ConversationItemType.ConnectionsSetup:
      return <ConnectionsSetupMessage item={item} />;
    case ConversationItemType.OperationsNeedingAttention:
      return <OperationsNeedingAttentionMessage item={item} />;
    case ConversationItemType.Tool:
      return <ToolReply item={item} />;
    case ConversationItemType.AgentHeader:
      return <AgentHeader item={item} />;
    default:
      return null;
  }
};

const UserMessage = ({ item }: { item: UserQueryItem }) => {
  const { id, text, date, dataScrollTarget } = item;
  return (
    <div data-scroll-target={dataScrollTarget} style={{ alignSelf: 'flex-end' }}>
      <ChatBubble key={id} isUserMessage={true} isAIGenerated={false} date={date}>
        {text}
      </ChatBubble>
    </div>
  );
};

const AssistantReply = ({ item }: { item: AssistantReplyItem }) => {
  const { id, text, hideFooter, date, additionalDocURL, azureButtonCallback, role, className, dataScrollTarget } = item;
  const azureCopilotButton = useAzureCopilotButton(azureButtonCallback);
  const additionalDocSection = useExternalLink(additionalDocURL ?? undefined);
  const { feedbackMessage, onMessageReactionClicked, reaction } = useFeedbackMessage(item);
  const textRef = useRef<HTMLDivElement | null>(null);
  return (
    <div data-scroll-target={dataScrollTarget}>
      <ChatBubble
        key={id}
        isUserMessage={false}
        isAIGenerated={true}
        date={date}
        className={className}
        selectedReaction={reaction}
        onThumbsReactionClicked={(reaction) => onMessageReactionClicked(reaction)}
        disabled={false} //TODO: add isBlockingOperationInProgress}
        additionalLinksSection={additionalDocURL ? additionalDocSection : undefined}
        additionalFooterActions={hideFooter ? [] : azureButtonCallback ? [azureCopilotButton] : []}
        hideFooter={hideFooter}
        textRef={textRef}
        role={role}
      >
        <div ref={textRef}>
          <Markdown>{text}</Markdown>
        </div>
      </ChatBubble>
      {feedbackMessage}
    </div>
  );
};
