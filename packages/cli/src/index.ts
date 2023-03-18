import { createOrGetConfig } from "./user-config.js";
import { createCommitMessageCreator } from "commit-copilot-core";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { $ } from "execa";

(async () => {
  const config = await createOrGetConfig();
  const create = createCommitMessageCreator(config);
  yargs(hideBin(process.argv))
    .alias("c", "config")
    .alias("v", "version")
    .alias("h", "help")
    .scriptName("skeleton")
    .command(
      ["$0", "commit"],
      "提交代码",
      () => {},
      async () => {
        const { stdout } = await $`git diff`;
        const res = await create(stdout);
        await $`git add .`;
        await $`git commit -m '${res}'`;
      }
    )
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
