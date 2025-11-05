import { deepStrictEqual } from "assert";
import { readdirSync } from "fs";
import { join } from "path";


const TEST_DIR_PATH = import.meta.dirname;


function printAssertionError(err, message) {
    process.stdout.write(`\x1b[31m${message}\x1b[0m\n`);
    console.log("\x1b[2mActual:\x1b[0m");
    console.log(err.actual);
    console.log("\x1b[2mExpected:\x1b[0m");
    console.log(err.expected);

    process.exit(1);
}


global.assertEqual = function(actual, expected, message) {
    try {
        deepStrictEqual(actual, expected);
    } catch(err) {
        printAssertionError(err, message);
    }
}


readdirSync(TEST_DIR_PATH, {
    withFileTypes: true
})
    .filter(dirent => dirent.isFile())
    .filter(dirent => /\.test\.js$/.test(dirent.name))
    .forEach(async dirent => {
        process.stdout.write(`\x1b[0m\x1b[2m${dirent.name}\x1b[0m `);

        await import(join(TEST_DIR_PATH, dirent.name));

        process.stdout.write("\x1b[32m✔\x1b[0m");
    });