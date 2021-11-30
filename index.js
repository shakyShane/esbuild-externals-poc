import esbuild from "esbuild";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const isProd = true;
const outdir = "dist";
const entryNames = isProd ? "[dir]/[name]-[hash]" : '[dir]/[name]';
const routes = ["src/page1.js", "src/page2.js", "src/page3.js"];
const analyze = true;

// const CWD = process.cwd();
// const vendor = (path) => join(cwd, "node_modules", )

const builds = [
    { entry: "@lit/reactive-element", match: /@lit\/reactive-element/ },
    { entry: "node_modules/lit-html/lit-html.js", match: /^lit-html$|lit-html\.js$/ },

]
async function runAll() {
    return await Promise.all(
        builds.map(current => {
            let out = current.entry.startsWith("node_modules")
                ? current.entry
                : join("node_modules", current.entry)
            if (!out.endsWith(".js")) out += '.js';
            return esbuild.build({
                entryPoints: [current.entry],
                outfile: join(outdir, out),
                entryNames,
                bundle: true,
                minify: isProd,
                keepNames: false,
                format: "esm",
                metafile: true,
                write: true,
            }).then(build => {
                return { context: current, build };
            })
        })
    )
}

const first = await runAll();
// const second = await runAll(first);

console.log('-----FIRST------');
for (let firstpass1 of first) {
    let text = await esbuild.analyzeMetafile(firstpass1.build.metafile)
    if (analyze) console.log(text)
}

const output = await esbuild.build({
    entryPoints: routes,
    entryNames,
    outdir,
    bundle: true,
    keepNames: false,
    minify: isProd,
    format: "esm",
    target: "es2020",
    metafile: true,
    plugins: [
        {
            name: "lit-resolver",
            setup(build) {
                builds.forEach((entry, index) => {
                    const matchingOutput = first[index];
                    const outputKeys = Object.keys(matchingOutput.build.metafile.outputs);
                    const firstKey = outputKeys[0];
                    // console.log('entry.match', entry.match);
                    build.onResolve({filter: entry.match}, (args) => {
                        console.log(args.path);
                        return { path:  "/" + firstKey + "?cb-external", external: true }
                    })
                })
            }
        }
    ]
})

let text = await esbuild.analyzeMetafile(output.metafile)
if (analyze) console.log(text)

for (let [key, value] of Object.entries(output.metafile.inputs)) {
    console.log('➕ %O', key);
}
//
// for (let [key, value] of Object.entries(output.metafile.outputs)) {
//     console.log('key', key);
//     for (let [input, depValue] of Object.entries(value.inputs)) {
//         console.log("  %O (%d)", input, value.bytes);
//     }
// }

writeFileSync("metafile.json", JSON.stringify(output, null, 2))
