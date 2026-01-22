import * as readline from "node:readline";

export async function prompt(message, _default = '') {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(message, (x) => {
      rl.close();
      x = x === undefined ? '' : x.trim();
      resolve(x === '' ? _default : x);
    });
  });
}

export function askPassword(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    process.stdout.write(question);

    let password = '';

    const onData = (chunk) => {
      // Handle multi-byte UTF-8 sequences properly
      const str = chunk.toString('utf8');

      for (let i = 0; i < str.length; i++) {
        const char = str[i];

        if (char === '\r' || char === '\n') { // Enter key
          process.stdin.removeListener('data', onData);
          rl.close();
          process.stdout.write('\n');
          resolve(password);
          return;
        } else if (char === '\u007F' || char === '\b') { // Backspace
          password = password.slice(0, -1);
        } else if (char !== '\u0000') { // Ignore null bytes/control chars
          password += char;
        }
      }
    };

    process.stdin.on('data', onData);
    process.stdin.setRawMode(true);
    process.stdin.resume();
  });
}

export function generateRandomPassword(length = 32) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}
