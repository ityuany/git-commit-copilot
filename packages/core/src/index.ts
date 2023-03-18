import { OpenAIApi, Configuration, ChatCompletionRequestMessage } from "openai";

export interface UserConfig {
  apiKey: string;
  mode: "gpt-3.5-turbo";
  prompt: string;
}

export function createCommitMessageCreator(config: UserConfig) {
  const configuration = new Configuration({
    apiKey: config.apiKey,
  });
  const openai = new OpenAIApi(configuration);

  return async function create(diffMessage: string) {
    const GPT35TurboMessage: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: config.prompt,
      },
      {
        role: "user",
        content: diffMessage,
      },
    ];
    const completion = await openai.createChatCompletion({
      model: config.mode,
      messages: GPT35TurboMessage,
    });
    return completion.data.choices[0].message.content;
  };
}
