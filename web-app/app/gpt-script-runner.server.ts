import type { ChildProcess } from "child_process";
import { spawn } from "child_process";
import path from "path";

function runPythonScript(scriptPath: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const pythonProcess: ChildProcess = spawn("python", [scriptPath, ...args]);

    let outputData: string = "";
    let errorData: string = "";

    pythonProcess.stdout?.on("data", (data) => {
      outputData += data;
    });

    pythonProcess.stderr?.on("data", (data) => {
      errorData += data;
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(`Python script exited with code ${code}\n${errorData}`)
        );
      } else {
        if (typeof outputData === "string") {
          // https://stackoverflow.com/questions/25245716/remove-all-ansi-colors-styles-from-strings
          const strippedANSI = outputData.replace(
            /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
            ""
          );
          resolve(strippedANSI);
        }
      }
    });
  });
}

export async function runGPT(prompt: string) {
  const scriptPath = path.join(__dirname, "../../gpt-integration/run-gpt.py");
  const args = [prompt];

  try {
    const outputData = await runPythonScript(scriptPath, args);
    return outputData;
  } catch (error) {
    console.error(error);
  }
}
