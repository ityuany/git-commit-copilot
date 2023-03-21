import { OpenAIApi, Configuration, ChatCompletionRequestMessage } from "openai";

export interface UserConfig {
  apiKey: string;
  mode: "gpt-3.5-turbo" | "gpt-4";
  lang: "cn" | "en";
}

export const prompt = {
  cn: `
    现在开始，假装你是一个高级程序员。
    你精通 git ，你接下来的主要工作就是根据用户传输给你的 git diff 信息 使用中文推荐给用户一段 commit message！
    内容尽可能的详细，以 标准的 git message 格式给用户。区分清楚 subject 和 description , description 以列表形式组织。
    请直接返回 commit message 信息，不要说多余的话
    `,
  en: `
    Starting now, pretend that you are a senior programmer.
    You are proficient in git. Your main task is to use the English language to recommend a commit message to users based on the git diff information transmitted by them!
    The content should be as detailed as possible and presented in standard git message format. Clearly distinguish between subject and description, with the description organized in list form.
    Please return only the commit message information directly without any extra words.
    `,
};

export function createCommitMessageCreator(config: UserConfig) {
  const configuration = new Configuration({
    apiKey: config.apiKey,
  });
  const openai = new OpenAIApi(configuration);

  return async function create(diffMessage: string) {
    const GPT35TurboMessage: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: prompt[config.lang],
      },
      {
        role: "user",
        content: diffMessage,
      },
    ];

    const completion = await openai.createChatCompletion({
      model: config.mode,
      temperature: 0,
      messages: GPT35TurboMessage,
    });
    return completion.data.choices[0].message.content;
  };
}
