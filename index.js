import esbuild from "esbuild";
import { writeFileSync } from "node:fs";

const builds = [
    { entry: "@lit/reactive-element", as: "reactive-element.js", match: /lit\/reactive-element/ },
    { entry: "lit-html", as: "lit-html.js", match: /lit-html/ },
    { entry: "lit-element", as: "lit-element.js", match: /lit-element/ },
]

const others = await Promise.all(
    builds.map(build => {
        const others = builds.filter(other => other !== build);
        return esbuild.build({
            entryPoints: [build.entry],
            outfile: "dist/" + build.as,
            bundle: true,
            keepNames: true,
            format: "esm",
            metafile: true,
            external: others.map(other => other.entry),
            plugins: [
                {
                    name: "externals",
                    setup(build) {
                        for (let other of others) {
                            build.onResolve({filter: other.match}, args => {
                                return { path: "/dist/" + other.as, external: true }
                            })
                        }
                    }
                }
            ]
        })
    })
)

const output = await esbuild.build({
    entryPoints: ["src/page1.js", "src/page2.js"],
    outdir: "dist",
    bundle: true,
    keepNames: true,
    format: "esm",
    target: "es2020",
    metafile: true,
    external: builds.map(x => x.entry),
    plugins: [
        {
            name: "lit-resolver",
            setup(build) {
                for (let vendor of builds) {
                    build.onResolve({filter: vendor.match}, args => {
                        return { path: "/dist/" + vendor.as, external: true }
                    })
                }
            }
        }
    ]
})

for (let [key, value] of Object.entries(output.metafile.outputs)) {
    console.log(key);
    for (let [input, value] of Object.entries(output.metafile.inputs)) {
        console.log(" %O (%d)", input, value.bytes);
    }
}


writeFileSync("metafile.json", JSON.stringify(output, null, 2))
