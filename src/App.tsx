import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import type {
  Conversation,
  ConversationMessage,
} from "../node_modules/@aws-amplify/data-schema/dist/esm/ai/ConversationType";
import {
  Authenticator,
  Button,
  Flex,
  Heading,
  Text,
  TextField,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

const client = generateClient<Schema>();

function App() {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentUserMessage, setCurrentUserMessage] = useState<string>("");
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState<string>("");
  const [currentRecipePrompt, setCurrentRecipePrompt] = useState<string>("");
  const [currentRecipe, setCurrentRecipe] = useState<string>("");

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  const handleCreateConversation = async () => {
    const { data: conversation, errors } =
      await client.conversations.pirateChat.create();
    setConversation(conversation);
    console.log(conversation, errors);

    if (!conversation) {
      console.log("No conversation created");
      return;
    }

    conversation.onMessage((message) => {
      console.log("Assistant message received:", message);
      setMessages([...messages, message]);
      setCurrentAssistantMessage(message.content[0].text ?? "");
    });
  };

  const handleSendMessage = async () => {
    if (!conversation) {
      console.log("Create a conversation first");
      return;
    }

    const { data: message, errors } = await conversation.sendMessage({
      content: [{ text: currentUserMessage }],
    });
    console.log(message, errors);
    if (message) {
      setMessages([...messages, message]);
    }
  };

  const handleGenerateRecipe = async () => {
    const { data, errors } = await client.generations.generateRecipe({
      description: currentRecipePrompt
    });

    console.log(data, errors);
    setCurrentRecipe(JSON.stringify(data, null, 2) ?? "");
  };

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <>
          <Flex alignContent={"flex-start"}>
            <Heading>User: {user?.username}</Heading>
            <Button onClick={signOut}>Sign out</Button>
          </Flex>

          <Flex paddingTop={24}>
            <Heading level={1}>Conversation</Heading>
            <Button
              alignContent={"flex-end"}
              padding={10}
              size="small"
              onClick={handleCreateConversation}
            >
              new conversation
            </Button>
          </Flex>

          <Heading level={6}>
            {" "}
            Current conversation: {conversation?.id ?? "none"}
          </Heading>

          <Text paddingTop={24}>
            Assistant response: {currentAssistantMessage}
          </Text>

          <Flex paddingTop={24}>
            <TextField
              labelHidden={true}
              label="messages"
              onChange={(e) => setCurrentUserMessage(e.target.value)}
            ></TextField>
            <Button size="small" onClick={handleSendMessage}>
              Send
            </Button>
          </Flex>

          <Heading paddingTop={24} level={1}>
            Generation
          </Heading>
          <TextField
            label="prompt"
            value={currentRecipePrompt}
            onChange={(e) => setCurrentRecipePrompt(e.target.value)}
          ></TextField>
          <Button size="small" onClick={handleGenerateRecipe}>
            Generate
          </Button>
          <Text>{currentRecipe}</Text>
          </>
      )}
    </Authenticator>
  );
}

export default App;
