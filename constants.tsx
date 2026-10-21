
import { Act, Level } from './types';

export const INITIAL_FILESYSTEM = {
  'clue.txt': 'SYSTEM_PASS: PHP_ROCKS_2024\nKeep it secret, keep it safe.',
  'secret.txt': 'The archive access code is: ALPHA-99. Do not lose this handle!',
  'log_01.txt': 'ERROR: Unauthorized access detected.\nINFO: Port 80 stable.\nWARNING: Disk space low.',
  'archive_log.txt': '2024-10-01: System online.\n2024-10-02: User "Admin" logged in.\n2024-10-03: Unexpected reboot.\nCODE: XJ-772',
  'security_events.txt': 'Event 1: Door opened\nEvent 2: Login failure',
  'corrupted_log.txt': 'RECOVERY_TOKEN: SERVER_FIXED_FINAL\nAll systems nominal.'
};

export const LEVELS: Level[] = [
  {
    id: 1,
    act: Act.TRAINING,
    title: "The Simple Read",
    mission: "Welcome to the Server Room! Someone locked the main terminal. We need the password hidden in 'clue.txt'.",
    driverInstructions: "Use readfile() to display the contents of clue.txt.",
    navigatorClue: "The navigator says: 'readfile()' is the fastest way to echo a file's content directly.",
    hint: "Try: readfile('clue.txt');",
    starterCode: "<?php\n// Type your code here\n",
    targetFiles: { ...INITIAL_FILESYSTEM },
    successMessage: "Password found! PHP_ROCKS_2024 accepted.",
    clue: "PHP_ROCKS_2024",
    validationRules: [
      {
        type: 'function_call',
        message: "You must use the readfile() function.",
        check: (code) => /readfile\s*\(\s*['"]clue\.txt['"]\s*\)/.test(code)
      }
    ]
  },
  {
    id: 2,
    act: Act.TRAINING,
    title: "Handle with Care",
    mission: "Basic reading is fine, but we need more control. Let's use file handles to read 'secret.txt'.",
    driverInstructions: "Open 'secret.txt' with fopen(), read it with fread(), and don't forget to fclose() it.",
    navigatorClue: "First you get a handle, then you read the bytes, then you release the handle. Order matters!",
    hint: "$f = fopen('secret.txt', 'r'); echo fread($f, 100); fclose($f);",
    starterCode: "<?php\n$filename = 'secret.txt';\n",
    targetFiles: { ...INITIAL_FILESYSTEM },
    successMessage: "Access code ALPHA-99 retrieved! You're getting the hang of handles.",
    clue: "ALPHA-99",
    validationRules: [
      {
        type: 'order',
        message: "Logical error: You must fopen before fread, and fclose at the end.",
        check: (code) => {
          const fo = code.indexOf('fopen');
          const fr = code.indexOf('fread');
          const fc = code.indexOf('fclose');
          return fo !== -1 && fr !== -1 && fc !== -1 && fo < fr && fr < fc;
        }
      },
      {
        type: 'parameter',
        message: "Use 'r' mode for reading in fopen().",
        check: (code) => /fopen\s*\(\s*.*,\s*['"]r['"]\s*\)/.test(code)
      }
    ]
  },
  {
    id: 3,
    act: Act.TRAINING,
    title: "Create Evidence",
    mission: "We need to log our progress. Let's create a new file named 'evidence.txt'.",
    driverInstructions: "Use fopen() with the correct mode ('w') to create 'evidence.txt'.",
    navigatorClue: "Mode 'w' creates the file if it doesn't exist. It also wipes it if it does!",
    hint: "$file = fopen('evidence.txt', 'w'); fclose($file);",
    starterCode: "<?php\n// Create evidence.txt\n",
    targetFiles: { ...INITIAL_FILESYSTEM },
    successMessage: "New file 'evidence.txt' successfully initialized.",
    validationRules: [
      {
        type: 'parameter',
        message: "Use 'w' mode to create or overwrite a file.",
        check: (code) => /fopen\s*\(\s*['"]evidence\.txt['"]\s*,\s*['"]w['"]\s*\)/.test(code)
      },
      {
        type: 'function_call',
        message: "Remember to close the file handle with fclose().",
        check: (code) => /fclose/.test(code)
      }
    ]
  },
  {
    id: 4,
    act: Act.TRAINING,
    title: "Writing Data",
    mission: "Empty files are useless. Let's record some text into 'evidence.txt'.",
    driverInstructions: "Open 'evidence.txt' in 'w' mode and write 'INTRUDER_FOUND' into it using fwrite().",
    navigatorClue: "fwrite() takes two main arguments: the handle and the string content.",
    hint: "$f = fopen('evidence.txt', 'w'); fwrite($f, 'INTRUDER_FOUND'); fclose($f);",
    starterCode: "<?php\n$f = fopen('evidence.txt', 'w');\n// Write data here\n",
    targetFiles: { ...INITIAL_FILESYSTEM },
    successMessage: "Evidence recorded. INTRUDER_FOUND successfully saved.",
    clue: "INTRUDER_FOUND",
    validationRules: [
      {
        type: 'function_call',
        message: "Use fwrite() to save the string.",
        check: (code) => /fwrite\s*\(\s*\$f\s*,\s*['"]INTRUDER_FOUND['"]\s*\)/.test(code)
      }
    ]
  },
  {
    id: 5,
    act: Act.TRAINING,
    title: "Line by Line",
    mission: "The 'log_01.txt' is huge. We only need the first line to check the status.",
    driverInstructions: "Use fgets() to read just the first line of 'log_01.txt'.",
    navigatorClue: "fgets() reads until it hits a newline character. Perfect for headers.",
    hint: "$h = fopen('log_01.txt', 'r'); echo fgets($h); fclose($h);",
    starterCode: "<?php\n$h = fopen('log_01.txt', 'r');\n",
    targetFiles: { ...INITIAL_FILESYSTEM },
    successMessage: "First line read: ERROR detected. Status check: FAILURE-01.",
    clue: "FAILURE-01",
    validationRules: [
      {
        type: 'function_call',
        message: "You must use fgets() to read a single line.",
        check: (code) => /fgets/.test(code)
      }
    ]
  },
  {
    id: 6,
    act: Act.TRAINING,
    title: "The End of File",
    mission: "We need the 'CODE' hidden at the very bottom of 'archive_log.txt'.",
    driverInstructions: "Use a while loop with !feof() to read through 'archive_log.txt' line by line until the end.",
    navigatorClue: "A while loop checking feof($handle) will run until there's nothing left to read.",
    hint: "$f = fopen('archive_log.txt', 'r'); while(!feof($f)) { echo fgets($f); } fclose($f);",
    starterCode: "<?php\n$f = fopen('archive_log.txt', 'r');\n// Start loop here\n",
    targetFiles: { ...INITIAL_FILESYSTEM },
    successMessage: "Archive Code XJ-772 found! Act 1 Training Complete!",
    clue: "XJ-772",
    validationRules: [
      {
        type: 'function_call',
        message: "You must use feof() to check for the end of the file.",
        check: (code) => /feof/.test(code)
      },
      {
        type: 'order',
        message: "You need a while loop for continuous reading.",
        check: (code) => /while/.test(code)
      }
    ]
  },
  {
    id: 7,
    act: Act.SECURITY_ARCHIVE,
    title: "Append Records",
    mission: "We found more events! Append 'Event 3: Camera Offline' to 'security_events.txt'.",
    driverInstructions: "Open 'security_events.txt' using 'a' mode (append) and use fwrite().",
    navigatorClue: "Remember, 'a' stands for append. It adds text to the end without deleting what's there!",
    hint: "$f = fopen('security_events.txt', 'a'); fwrite($f, '\\nEvent 3: Camera Offline'); fclose($f);",
    starterCode: "<?php\n",
    targetFiles: { ...INITIAL_FILESYSTEM },
    successMessage: "Security log updated. INCIDENT_RECORD_B2 saved.",
    clue: "INCIDENT_RECORD_B2",
    validationRules: [
      {
        type: 'parameter',
        message: "Use 'a' mode to append data.",
        check: (code) => /fopen\s*\(\s*['"]security_events\.txt['"]\s*,\s*['"]a['"]\s*\)/.test(code)
      }
    ]
  },
  {
    id: 8,
    act: Act.SERVER_BREACH,
    title: "The Final Recovery",
    mission: "The server is failing! Read 'corrupted_log.txt' to find the RECOVERY_TOKEN and save the day.",
    driverInstructions: "Read the entire 'corrupted_log.txt' and echo it to the console.",
    navigatorClue: "You know all the tools now. Use whichever method you prefer to get the data!",
    hint: "readfile('corrupted_log.txt');",
    starterCode: "<?php\n",
    targetFiles: { ...INITIAL_FILESYSTEM },
    successMessage: "TOKEN: SERVER_FIXED_FINAL. Server restored! You've escaped!",
    clue: "SERVER_FIXED_FINAL",
    validationRules: [
      {
        type: 'output',
        message: "The contents of corrupted_log.txt must be displayed.",
        check: (code, fs) => true // Handled by output simulation
      }
    ]
  }
];
