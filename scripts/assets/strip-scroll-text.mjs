// Removes the baked marquee and editorial text meshes from the scroll-scene GLB.
// The scene now renders original STRYDE typography at runtime instead.
// Usage: node scripts/assets/strip-scroll-text.mjs public/models/ShirtScrolling.glb
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, KHRDracoMeshCompression } from "@gltf-transform/extensions";
import { prune } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";

const file = process.argv[2];
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "draco3d.decoder": await draco3d.createDecoderModule(),
    "draco3d.encoder": await draco3d.createEncoderModule(),
  });

const doc = await io.read(file);
const removed = [];
for (const node of doc.getRoot().listNodes()) {
  if (/^(Texts|Marquee)/.test(node.getName())) {
    removed.push(node.getName());
    node.dispose();
  }
}
await doc.transform(prune());
doc
  .createExtension(KHRDracoMeshCompression)
  .setRequired(true)
  .setEncoderOptions({ method: KHRDracoMeshCompression.EncoderMethod.EDGEBREAKER });
await io.write(file, doc);
console.log(`removed ${removed.length} nodes; remaining:`, doc.getRoot().listNodes().map((n) => n.getName()));
