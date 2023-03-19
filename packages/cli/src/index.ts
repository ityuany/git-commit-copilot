import { createOrGetConfig } from "./user-config.js";
import { createCommitMessageCreator } from "commit-copilot-core";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { $ } from "execa";
import enquirer from "enquirer";

interface Action {
  action: "yes" | "cancel" | "retry";
}

(async () => {
  const config = await createOrGetConfig();
  const create = createCommitMessageCreator(config);
  async function commitHandler() {
    const { stdout } = await $`git diff`;
    const res = await create(stdout);
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
    .command(["$0", "commit"], "提交代码", () => {}, commitHandler)
    .command(
      "config",
      "修改配置信息",
      () => {},
      () => {
        console.log("修改配置信息");
      }
    )

    .help()
    .version()
    .parse();
})();
