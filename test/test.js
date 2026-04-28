import { deepStrictEqual } from "assert";
import { readdirSync } from "fs";
import { join } from "path";


const TEST_DIR_PATH = import.meta.dirname;


process.on("exit", () => {
    process.stdout.write("\n");
});


function printAssertionError(err, message) {
    process.stdout.write(`\x1b[31m${message}\x1b[0m\n`);

    !("expected" in err)
        && console.error(err);

    process.exit(1);
}

function normalizeStringifiedTree(obj) {
    if(typeof(obj) !== "string") return obj;

    return obj.replace(/\s{2,}/g, " ");
}


global.assertEqual = function(actual, expected, message) {
    try {
        deepStrictEqual(
            normalizeStringifiedTree(actual),
            normalizeStringifiedTree(expected)
        );
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