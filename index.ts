import { Command } from "commander";
import app from "./package.json";
import init from "./commands/init";

const program = new Command();

program
  .name("guwa")
  .description("REST API that simplifies WhatsApp integration")
  .version(app.version);

program
  .command("init")
  .description("Init GUWA configuration file")
  .action(init);

program.parse();
