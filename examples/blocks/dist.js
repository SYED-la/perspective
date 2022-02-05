const {execute, execute_throw} = require("../../scripts/script_utils.js");
const fs = require("fs");

const hashes = JSON.parse(fs.readFileSync("gists.json"));

const replacements = {
    "/node_modules/": "https://cdn.jsdelivr.net/npm/",

    // TODO jsdelivr has slightly different logic for trailing '/' that causes
    // the wasm assets to not load correctly when using aliases ..

    // "perspective/dist/umd/perspective.js": "perspective"
    "perspective/dist/umd/perspective.js": "perspective@latest",
    "perspective-viewer/dist/umd/perspective-viewer.js":
        "perspective-viewer@latest",
    "perspective-viewer-datagrid/dist/umd/perspective-viewer-datagrid.js":
        "perspective-viewer-datagrid@latest",
    "perspective-viewer-d3fc/dist/umd/perspective-viewer-d3fc.js":
        "perspective-viewer-d3fc@latest",
    "perspective-workspace/dist/umd/perspective-workspace.js":
        "perspective-workspace@latest",

    "perspective/dist/cdn/perspective.js":
        "perspective@latest/dist/cdn/perspective.js",
    "perspective-viewer/dist/cdn/perspective-viewer.js":
        "perspective-viewer@latest/dist/cdn/perspective-viewer.js",
    "perspective-viewer-datagrid/dist/cdn/perspective-viewer-datagrid.js":
        "perspective-viewer-datagrid@latest/dist/cdn/perspective-viewer-datagrid.js",
    "perspective-viewer-d3fc/dist/cdn/perspective-viewer-d3fc.js":
        "perspective-viewer-d3fc@latest/dist/cdn/perspective-viewer-d3fc.js",
};

execute`mkdir -p dist`;

for (const name of Object.keys(hashes)) {
    // Clone
    if (fs.existsSync(`dist/${name}`)) {
        execute`git -C dist/${name} reset --hard HEAD`;
        execute`git -C dist/${name} pull`;
    } else {
        execute`git clone https://gist.github.com/${hashes[name]}.git dist/${name}`;
    }

    // Copy
    if (fs.existsSync(`src/${name}`)) {
        for (const filename of fs.readdirSync(`src/${name}`)) {
            execute`mkdir -p dist/${name}`;
            if (filename.endsWith(".js") || filename.endsWith(".html")) {
                let filecontents = fs
                    .readFileSync(`src/${name}/${filename}`)
                    .toString();
                for (const pattern of Object.keys(replacements)) {
                    filecontents = filecontents.replace(
                        new RegExp(pattern, "g"),
                        replacements[pattern]
                    );
                }
                fs.writeFileSync(`dist/${name}/${filename}`, filecontents);
            } else if (filename !== ".git") {
                execute`cp src/${name}/${filename} dist/${name}/${filename}`;
            }
        }
    }

    // Assert
    execute`git -C dist/${name} status`;

    // Dist
    try {
        // execute_throw`git -C dist/${name} commit -am"Autogenerated"`;
        // execute`git -C dist/${name} push origin master`;
    } catch (e) {}
}
