import { parse } from "https://deno.land/std@0.205.0/flags/mod.ts";
import ansicolors from "https://esm.sh/ansi-colors@4.1.3";

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

  console.debug(
    `Executing command: \n  ${formatStringCommand(main, options?.args)}`,
  );

  return command;
}

function formatStringCommand(command: string, args: string[] = []) {
  const prompt = ansicolors.greenBright("$");
  const cmd = ansicolors.greenBright.bold(command);
  const opts = ansicolors.white(args.join(" "));

  return ansicolors.bgBlack(`${prompt} ${cmd} ${opts}`);
}

function getUrlOutput(deployOutput: string) {
  const lines = deployOutput.split("\n").toReversed();
  const url = lines[0].replace(" - ", "url=");

  return url;
}

const options = getOptions();
const args = ["deploy", "--project=toriexperiments", "--include=main.ts"];

if (options.production) {
  args.push("--production");
}

const output = executeCommand("deployctl", { args });
const url = getUrlOutput(output);

console.info(url);
