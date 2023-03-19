import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { UserConfig } from "commit-copilot-core";
import { decrypt, encrypt } from "./crypto.js";
import enquirer from "enquirer";

const prompt = {
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

const dir = path.join(os.homedir(), ".commit-copilot");
const file = path.join(dir, "config.json");

interface EnquirerResult {
  apiKey: string;
  mode: "gpt-3.5-turbo";
  lang: string;
}

async function createUserConfig() {
  const res = await enquirer.prompt<EnquirerResult>([
    {
      type: "input",
      name: "apiKey",
      message: "请输入 openai 的 apiKey！",
    },
    {
      type: "select",
      name: "mode",
      message: "请选择模型",
      choices: [
        {
          name: "gpt-3.5-turbo",
          message: "gpt-3.5-turbo",
          value: "gpt-3.5-turbo",
        },
        {
          name: "gpt-4",
          message: "gpt-4",
          value: "gpt-4",
        },
      ],
    },
    {
      type: "select",
      name: "lang",
      message: "请选择语言",
      choices: [
        {
          name: "cn",
          //   value: "中文",
          message: "中文",
        },
        {
          name: "en",
          //   value: "英文",
          message: "英文",
        },
      ],
    },
  ]);
  return {
    ...res,
    prompt: prompt[res.lang],
  };
}

export async function createOrGetConfig() {
  let userConfig: UserConfig;
  if (fs.existsSync(file)) {
    const content = JSON.parse(fs.readFileSync(file, "utf-8"));
    userConfig ??= decrypt(content) as UserConfig;
  } else {
    fs.mkdirSync(dir, {});
    const res = await createUserConfig();
    fs.writeFileSync(file, encrypt(res), "utf-8");
    userConfig ??= res;
  }
  return userConfig;
}
