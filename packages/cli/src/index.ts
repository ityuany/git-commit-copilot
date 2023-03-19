import { createOrGetConfig, resetUserConfig } from "./user-config.js";
import { createCommitMessageCreator } from "commit-copilot-core";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { $, execa } from "execa";
import enquirer from "enquirer";
import ora from "ora";

interface Action {
  action: "yes" | "cancel" | "retry";
}

const excludeFromDiff = [
  "package-lock.json",
  "pnpm-lock.yaml",

  // yarn.lock, Cargo.lock, Gemfile.lock, Pipfile.lock, etc.
  "*.lock",
].map((file) => `:(exclude)${file}`);

(async () => {
  const config = await createOrGetConfig();
  const create = createCommitMessageCreator(config);

  async function commitHandler() {
    const { stdout } = await execa("git", ["diff", ...excludeFromDiff], {});
    const spinner = ora({
      text: "正在生成提交信息...",
      color: "yellow",
      spinner: "dots",
    }).start();

    const res = await create(stdout.replace(/`/g, "\\'"));
    spinner.succeed("生成提交信息成功！");
    const action = await enquirer.prompt<Action>({
      type: "select",
      message:
        "Do you confirm to use the commit suggestions provided by Copilot?",
      choices: [
        {
          name: "yes",
          message: "yes",
        },
        {
          name: "retry",
          message: "retry",
        },
        {
          name: "cancel",
          message: "cancel",
        },
      ],
      name: "action",
      hint: `\n\n${res}\n\n`,
    });

    if (action.action === "cancel") {
      process.exit(0);
    }
    if (action.action === "yes") {
      await $`git add .`;
      await $`git commit -m '${res}'`;
    }
    if (action.action === "retry") {
      commitHandler();
    }
  }

  yargs(hideBin(process.argv))
    .alias("c", "config")
    .alias("v", "version")
    .alias("h", "help")
    .scriptName("commit-copilot")
    .command(["commit", "*"], "提交代码", () => {}, commitHandler)

    .command("config", "修改配置信息", () => {}, resetUserConfig)
    .help()
    .version()
    .parse();
})();
