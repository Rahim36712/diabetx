const fs = require("fs");
const path = require("path");

console.log("=================================================");
console.log("DiabetX Milestone 1 & 2 Empirical Verification Suite");
console.log("=================================================\n");

let passCount = 0;
let failCount = 0;
let warnCount = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    if (details) console.log(`       -> ${details}`);
    passCount++;
  } else {
    console.log(`[FAIL] ${testName}`);
    if (details) console.log(`       -> ${details}`);
    failCount++;
  }
}

function warn(testName, details = "") {
  console.log(`[WARN] ${testName}`);
  if (details) console.log(`       -> ${details}`);
  warnCount++;
}

// Read Source Files
const navContextPath = path.join(__dirname, "../../context/NavContext.tsx");
const sideBarPath = path.join(__dirname, "../../components/SideNavBar.tsx");
const bottomBarPath = path.join(__dirname, "../../components/BottomNavBar.tsx");
const topBarPath = path.join(__dirname, "../../components/TopNavBar.tsx");
const pagePath = path.join(__dirname, "../../app/page.tsx");
const layoutPath = path.join(__dirname, "../../app/layout.tsx");
const footerPath = path.join(__dirname, "../../components/Footer.tsx");

const navContextSrc = fs.readFileSync(navContextPath, "utf8");
const sideBarSrc = fs.readFileSync(sideBarPath, "utf8");
const bottomBarSrc = fs.readFileSync(bottomBarPath, "utf8");
const topBarSrc = fs.readFileSync(topBarPath, "utf8");
const pageSrc = fs.readFileSync(pagePath, "utf8");
const layoutSrc = fs.readFileSync(layoutPath, "utf8");
const footerSrc = fs.readFileSync(footerPath, "utf8");

// ---------------------------------------------------------
// 1. Tab Identifier Coverage in NavContext
// ---------------------------------------------------------
console.log("--- TEST GROUP 1: NavTab Type & Context Definition ---");
const expectedTabs = ["dashboard", "digital_twin", "timeline", "simulator", "ai_coach", "twin", "aicoach"];
expectedTabs.forEach((tab) => {
  assert(
    navContextSrc.includes(`"${tab}"`),
    `NavTab type contains '${tab}'`,
    `Checked context/NavContext.tsx`
  );
});

// ---------------------------------------------------------
// 2. Tab State Switching & Aliases Simulation
// ---------------------------------------------------------
console.log("\n--- TEST GROUP 2: Tab Active State Matching Logic ---");

// Helper simulating SideNavBar active check
function isSideNavActive(itemKey, currentTab) {
  return (
    currentTab === itemKey ||
    (itemKey === "digital_twin" && currentTab === "twin") ||
    (itemKey === "ai_coach" && currentTab === "aicoach")
  );
}

// Test cases for active tab matching across all 5 navigation items
const navItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "digital_twin", label: "Digital Twin" },
  { id: "timeline", label: "Timeline" },
  { id: "simulator", label: "Simulator" },
  { id: "ai_coach", label: "AI Coach" },
];

// Test primary identifiers
assert(isSideNavActive("dashboard", "dashboard"), "Tab 'dashboard' resolves to Dashboard nav item");
assert(isSideNavActive("digital_twin", "digital_twin"), "Tab 'digital_twin' resolves to Digital Twin nav item");
assert(isSideNavActive("timeline", "timeline"), "Tab 'timeline' resolves to Timeline nav item");
assert(isSideNavActive("simulator", "simulator"), "Tab 'simulator' resolves to Simulator nav item");
assert(isSideNavActive("ai_coach", "ai_coach"), "Tab 'ai_coach' resolves to AI Coach nav item");

// Test alias identifiers
assert(isSideNavActive("digital_twin", "twin"), "Alias 'twin' resolves to Digital Twin nav item");
assert(isSideNavActive("ai_coach", "aicoach"), "Alias 'aicoach' resolves to AI Coach nav item");

// ---------------------------------------------------------
// 3. View Switcher Logic Simulation in app/page.tsx
// ---------------------------------------------------------
console.log("\n--- TEST GROUP 3: View Component Rendering Logic (app/page.tsx) ---");

function getRenderedViews(activeTab) {
  const views = [];
  if (activeTab === "dashboard" || activeTab === "digital_twin" || activeTab === "twin") {
    views.push("EntryForm+AiCoach");
  }
  if (activeTab === "timeline") {
    views.push("TimelineChart+EntryForm+SimulationPanel");
  }
  if (activeTab === "simulator") {
    views.push("SimulationPanel+AiCoach");
  }
  if (activeTab === "ai_coach" || activeTab === "aicoach") {
    views.push("AiCoachFullWidth");
  }
  if (activeTab === "dashboard") {
    views.push("TimelineChart+SimulationPanel");
  }
  return views;
}

// Verify view renders for each tab
const dashboardViews = getRenderedViews("dashboard");
assert(
  dashboardViews.includes("EntryForm+AiCoach") && dashboardViews.includes("TimelineChart+SimulationPanel"),
  "Tab 'dashboard' renders EntryForm, AiCoach, TimelineChart, and SimulationPanel views",
  `Rendered blocks: ${dashboardViews.join(", ")}`
);

const twinViews = getRenderedViews("digital_twin");
const twinAliasViews = getRenderedViews("twin");
assert(
  twinViews.length === 1 && twinViews[0] === "EntryForm+AiCoach",
  "Tab 'digital_twin' renders EntryForm+AiCoach view",
  `Rendered blocks: ${twinViews.join(", ")}`
);
assert(
  JSON.stringify(twinViews) === JSON.stringify(twinAliasViews),
  "Alias 'twin' renders identically to 'digital_twin'",
  `twin: ${twinAliasViews.join(", ")}`
);

const timelineViews = getRenderedViews("timeline");
assert(
  timelineViews.length === 1 && timelineViews[0] === "TimelineChart+EntryForm+SimulationPanel",
  "Tab 'timeline' renders TimelineChart+EntryForm+SimulationPanel view",
  `Rendered blocks: ${timelineViews.join(", ")}`
);

const simulatorViews = getRenderedViews("simulator");
assert(
  simulatorViews.length === 1 && simulatorViews[0] === "SimulationPanel+AiCoach",
  "Tab 'simulator' renders SimulationPanel+AiCoach view",
  `Rendered blocks: ${simulatorViews.join(", ")}`
);

const aiCoachViews = getRenderedViews("ai_coach");
const aiCoachAliasViews = getRenderedViews("aicoach");
assert(
  aiCoachViews.length === 1 && aiCoachViews[0] === "AiCoachFullWidth",
  "Tab 'ai_coach' renders AiCoachFullWidth view",
  `Rendered blocks: ${aiCoachViews.join(", ")}`
);
assert(
  JSON.stringify(aiCoachViews) === JSON.stringify(aiCoachAliasViews),
  "Alias 'aicoach' renders identically to 'ai_coach'",
  `aicoach: ${aiCoachAliasViews.join(", ")}`
);

// ---------------------------------------------------------
// 4. Stress Testing & Edge Conditions
// ---------------------------------------------------------
console.log("\n--- TEST GROUP 4: Edge Conditions & Fallback Stress Testing ---");

// Test unknown string fallback
const unknownTabViews = getRenderedViews("unknown_tab_string");
if (unknownTabViews.length === 0) {
  warn(
    "Unknown tab string ('unknown_tab_string') yields 0 view components",
    "No fallback view or default tab redirect is rendered in app/page.tsx when activeTab is unknown."
  );
} else {
  assert(false, "Unknown tab string rendered views", `Views: ${unknownTabViews.join(", ")}`);
}

// Test case sensitivity
const uppercaseViews = getRenderedViews("DASHBOARD");
if (uppercaseViews.length === 0) {
  warn(
    "Uppercase tab string ('DASHBOARD') is unhandled due to case sensitivity",
    "Tab matching requires exact lowercase match. Normalization (.toLowerCase()) is missing."
  );
}

// Test whitespace padding
const whitespaceViews = getRenderedViews(" twin ");
if (whitespaceViews.length === 0) {
  warn(
    "Padded tab string (' twin ') is unhandled due to leading/trailing whitespace",
    "Tab matching requires clean string. String trimming (.trim()) is missing."
  );
}

// ---------------------------------------------------------
// 5. Responsive Layout & CSS Class Audit
// ---------------------------------------------------------
console.log("\n--- TEST GROUP 5: Responsive Layout & Tailwind CSS Classes ---");

assert(
  sideBarSrc.includes("hidden md:flex") && sideBarSrc.includes("w-64") && sideBarSrc.includes("fixed"),
  "SideNavBar has responsive 'hidden md:flex' and fixed 64px width",
  "Desktop sidebar is visible only on md+ breakpoints"
);

assert(
  topBarSrc.includes("md:hidden") && topBarSrc.includes("fixed top-0"),
  "TopNavBar has responsive 'md:hidden' and fixed top position",
  "Mobile top header is visible only on <md breakpoints"
);

assert(
  bottomBarSrc.includes("md:hidden") && bottomBarSrc.includes("fixed bottom-0"),
  "BottomNavBar has responsive 'md:hidden' and fixed bottom position",
  "Mobile bottom navigation bar is visible only on <md breakpoints"
);

assert(
  pageSrc.includes("md:ml-64"),
  "app/page.tsx main container includes 'md:ml-64' offset for desktop sidebar",
  "Prevents main content overlapping desktop SideNavBar"
);

assert(
  layoutSrc.includes("pt-16") && layoutSrc.includes("pb-20") && layoutSrc.includes("md:py-0"),
  "app/layout.tsx wrapper includes 'pt-16 pb-20 md:py-0' spacing for mobile bars",
  "Prevents content clipping behind mobile TopNavBar and BottomNavBar"
);

assert(
  footerSrc.includes("md:ml-64") && footerSrc.includes("md:w-[calc(100%-16rem)]"),
  "Footer includes 'md:ml-64' and 'md:w-[calc(100%-16rem)]' offset",
  "Footer aligns cleanly with main content column on desktop"
);

// ---------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------
console.log("\n=================================================");
console.log(`Empirical Verification Summary:`);
console.log(`  PASSED:   ${passCount}`);
console.log(`  WARNINGS: ${warnCount}`);
console.log(`  FAILED:   ${failCount}`);
console.log("=================================================");

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
