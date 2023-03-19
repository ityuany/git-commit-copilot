import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { UserConfig } from "commit-copilot-core";
import { decrypt, encrypt } from "./crypto.js";
import enquirer from "enquirer";
import { $ } from "execa";

const dir = path.join(os.homedir(), ".commit-copilot");
const file = path.join(dir, "config.json");

interface EnquirerResult {
  apiKey: string;
  mode: "gpt-3.5-turbo";
  lang: "cn" | "en";
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
  return res;
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

export async function resetUserConfig() {
  await $`rm -rf ${dir}`;
  await createOrGetConfig();
}
