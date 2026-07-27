const fs = require('fs');
const path = require('path');

console.log("=== EMPIRICAL TEST SUITE: WebGL / Canvas Fallback Inspection ===");

// 1. Inspect ShaderBackground.tsx
const shaderBgPath = path.join(__dirname, '../../components/ShaderBackground.tsx');
const shaderBgCode = fs.readFileSync(shaderBgPath, 'utf8');

console.log("\n--- Analyzing ShaderBackground.tsx ---");

// Check event listener position vs early return
const addResizeIdx = shaderBgCode.indexOf('window.addEventListener("resize", syncSize)');
const earlyReturnGlIdx = shaderBgCode.indexOf('if (!gl) return');
const cleanupReturnIdx = shaderBgCode.indexOf('return () => {');

console.log("window.addEventListener('resize') line offset:", addResizeIdx);
console.log("if (!gl) return offset:", earlyReturnGlIdx);
console.log("return () => { cleanup } offset:", cleanupReturnIdx);

if (addResizeIdx < earlyReturnGlIdx && earlyReturnGlIdx < cleanupReturnIdx) {
  console.log("BUG CONFIRMED (ShaderBackground): Event listener is added BEFORE 'if (!gl) return;'. When WebGL is unavailable, cleanup function is NEVER returned, causing an event listener leak on window!");
} else {
  console.log("ShaderBackground cleanup logic OK.");
}

// Check CSS classes
if (shaderBgCode.includes('w-vw') || shaderBgCode.includes('h-vh')) {
  console.log("BUG CONFIRMED (ShaderBackground): Uses invalid Tailwind classes 'w-vw h-vh' instead of 'w-screen h-screen' or 'w-full h-full'.");
}

// 2. Inspect ThreeDigitalTwinCanvas.tsx
const threeCanvasPath = path.join(__dirname, '../../components/ThreeDigitalTwinCanvas.tsx');
const threeCanvasCode = fs.readFileSync(threeCanvasPath, 'utf8');

console.log("\n--- Analyzing ThreeDigitalTwinCanvas.tsx ---");

const hasTryCatch = /try\s*\{[\s\S]*new THREE\.WebGLRenderer[\s\S]*\}\s*catch/.test(threeCanvasCode);
const hasFallbackState = threeCanvasCode.includes('hasError') || threeCanvasCode.includes('webGlSupported') || threeCanvasCode.includes('fallback');
const hasContextLostHandler = threeCanvasCode.includes('webglcontextlost');

console.log("Has try-catch around WebGLRenderer:", hasTryCatch);
console.log("Has fallback UI state when WebGL fails:", hasFallbackState);
console.log("Has webglcontextlost event listener:", hasContextLostHandler);

if (!hasTryCatch || !hasFallbackState) {
  console.log("BUG CONFIRMED (ThreeDigitalTwinCanvas): Lacks try/catch block around new THREE.WebGLRenderer and does not provide a fallback UI if WebGL is unsupported or context creation fails.");
}

if (!hasContextLostHandler) {
  console.log("BUG CONFIRMED (ThreeDigitalTwinCanvas): Does not handle 'webglcontextlost' events to gracefully prevent console spam or recover when GPU context is lost.");
}
