import { parse } from "https://deno.land/std@0.205.0/flags/mod.ts";

/**
 * Custom error class for subprocess errors.
 *
 * Thrown when there is a non-zero exit code from a subprocess.
 */
class SubprocessError extends Error {
  /**
   * Constructs a new `SubprocessError`.
   *
   * @param name - The name of the command that was executed
   * @param output - The stderr output from the failed command
   * @param args - Optional arguments passed to the command
   */
  constructor(name: string, output: Uint8Array, args?: string[]) {
    super(`There was an error executing the command ${name}.`, {
      cause: {
        args,
        output: new TextDecoder().decode(output),
      },
    });
  }
}

/**
 * Executes the given command synchronously using `Deno.Command`,
 * throwing a `SubprocessError` if the exit code is non-zero.
 *
 * @param main - The command to execute.
 * @param options - Optional options to pass to `Deno.Command`.
 * @returns The stdout output of the command as a string.
 * @throws - {@link SubprocessError}
 */
function executeCommand(main: string, options?: Deno.CommandOptions) {
  const command = initExecuteCommand(main, options);

  const { code, stdout, stderr } = command.outputSync();

  if (code !== 0) {
    throw new SubprocessError(main, stderr, options?.args);
  }

  return new TextDecoder().decode(stdout).trim();
}

function getOptions() {
  const options = parse(Deno.args);

  if (typeof options.production !== "boolean") {
    options.production = false;
  }

  return options as { production: boolean; _: unknown[] };
}

function initExecuteCommand(main: string, options?: Deno.CommandOptions) {
  const command = new Deno.Command(main, options);

  return command;
}

function getUrlOutput(deployOutput: string) {
  const lines = deployOutput.split("\n");
  const url = lines[lines.indexOf("View at:") + 1].replace(" - ", "");

  return url;
}

const options = getOptions();
const args = [
  "deploy",
  "--project=toriexperiments",
  "--include=main.ts",
];

if (options.production) {
  args.push("--production");
}

args.push("main.ts");

const output = executeCommand("deployctl", { args });
const url = getUrlOutput(output);

console.info(output);

Deno.writeTextFileSync("./output.txt", `url=${url}`);
