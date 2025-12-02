import { exec } from "child_process";

function runCmd(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) return reject(stderr || error.message);
      resolve(stdout);
    });
  });
}

export async function suricataStatus() {
  return await runCmd("sudo systemctl status suricata --no-pager");
}

// export async function suricataStart() {
//   return await runCmd("sudo systemctl start suricata");
// }

// export async function suricataStop() {
//   return await runCmd("sudo systemctl stop suricata");
// }

export async function suricataRestart() {
  return await runCmd("sudo systemctl restart suricata");
}
