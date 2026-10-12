#!/usr/bin/env python3
"""Increment 0 (§16): mechanically split the 1226-line Home.tsx into modules with identical behaviour.

Every line of code is copied verbatim from the baseline file; only wrappers (imports, component
signatures, context destructuring and export keywords) are generated. Run once from anywhere:
    python3 gen_inc0.py
"""
import os
import re

ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "..", "jambavan-app")
ROOT = os.path.abspath(ROOT)
SRC = os.path.join(os.path.dirname(__file__), "..", "baseline-5f248af", "Home.tsx")
OUT = os.path.join(ROOT, "client", "src", "components", "jambavan")
L = open(SRC, encoding="utf-8").read().split("\n")


def lines(a, b):
    """1-based inclusive line range from the baseline Home.tsx."""
    return L[a - 1:b]


def write(rel, text):
    path = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text.rstrip("\n") + "\n")


def uses(text, names):
    return [n for n in names if re.search(r"(?<![\w$])(?:(?<=\.\.\.)|(?<!\.))" + re.escape(n) + r"(?![\w$])", text)]


# ---------- names ----------
lucide = [x.strip().rstrip(",") for x in lines(2, 60) if x.strip()]

type_lines = lines(63, 68) + [""] + lines(72, 107) + [""] + lines(112, 146)
type_src = "\n".join(re.sub(r"^type ", "export type ", l) for l in type_lines)
type_names = re.findall(r"^export type (\w+)", type_src, re.M)

seed_lines = lines(69, 70) + [""] + lines(109, 110) + [""] + lines(161, 374)
seed_src = "\n".join(re.sub(r"^(const|type) ", r"export \1 ", l) for l in seed_lines)
seed_names = re.findall(r"^export (?:const|type) (\w+)", seed_src, re.M)
seed_values = [n for n in seed_names if n != "AccessRole"]

HEADER = "// Moved verbatim from pages/Home.tsx (checkpoint 5f248af) in increment 0 (§13). Do not change behaviour here.\n"

# ---------- state/types.ts ----------
write("state/types.ts", HEADER + "\n" + type_src)

# ---------- state/seed.ts ----------
seed_types = uses(seed_src, type_names)
write("state/seed.ts", HEADER + f'import type {{ {", ".join(seed_types)} }} from "./types";\n\n' + seed_src)

# ---------- state/format.ts ----------
fmt = "\n".join(lines(402, 413))
fmt = re.sub(r"^function ", "export function ", fmt, flags=re.M)
write("state/format.ts", HEADER + 'import type { Status } from "./types";\n\n' + fmt)

# ---------- state/dependencies.ts ----------
dep = "\n".join(lines(148, 159)).replace("function findBlockingDependency", "export function findBlockingDependency")
cycle_body = "\n".join(lines(768, 778))
assert cycle_body.lstrip().startswith("const dependencyWouldCycle = (candidateId: number, editingId: number | null) => {"), cycle_body[:80]
cycle = (
    "// Today's dependencyWouldCycle (Home.tsx:768–778), made pure: the body is unchanged, `tasks` is now a parameter.\n"
    "export function wouldCycle(tasks: Task[], candidateId: number, editingId: number | null): boolean {\n"
    + "\n".join(l[2:] for l in lines(769, 777))
    + "\n}"
)
write("state/dependencies.ts", HEADER + 'import type { Task } from "./types";\n\n' + dep + "\n\n" + cycle)

# ---------- state/exports.ts ----------
csv = lines(636, 641)
pdf = lines(642, 669)
assert csv[0].strip().startswith("const downloadCsv"), csv[0]
assert pdf[0].strip().startswith("const downloadPdf"), pdf[0]
assert csv[-2].strip() == "setNotice(`${filename} downloaded.`);" and pdf[-2].strip() == "setNotice(`${filename} downloaded.`);"


def unindent(block):
    return "\n".join(l[2:] if l.startswith("  ") else l for l in block)


exports_src = (
    HEADER
    + "// The store wraps these and shows the same \"{filename} downloaded.\" notice afterwards.\n"
    + "export " + unindent(csv[:-2] + csv[-1:]).replace("const downloadCsv = (filename: string, rows: string[][]) =>", "const downloadCsvFile = (filename: string, rows: string[][]) =>")
    + "\nexport " + unindent(pdf[:-2] + pdf[-1:]).replace("const downloadPdf = (filename: string, title: string, rows: string[][]) =>", "const downloadPdfFile = (filename: string, title: string, rows: string[][]) =>")
)
assert "downloadCsvFile" in exports_src and "downloadPdfFile" in exports_src
write("state/exports.ts", exports_src)

# ---------- art/Avatar.tsx ----------
avatar = "\n".join(lines(387, 400)) + "\n\n" + "\n".join(lines(422, 425))
avatar = avatar.replace("function Avatar(", "export function Avatar(")
write("art/Avatar.tsx", HEADER + "\n" + avatar)

# ---------- task/StatusIcon.tsx (defined but never rendered today: finding A9) ----------
si = "\n".join(lines(415, 420)).replace("function StatusIcon", "export function StatusIcon")
write("task/StatusIcon.tsx", HEADER + 'import { AlertCircle, CheckCircle2, Circle, Clock3 } from "lucide-react";\nimport type { Status } from "../state/types";\n\n' + si)

# ---------- views/TrendChart.tsx ----------
tc = "\n".join(lines(427, 430)).replace("function TrendChart", "export function TrendChart")
write("views/TrendChart.tsx", HEADER + 'import { BarChart3 } from "lucide-react";\n\n' + tc)

# ---------- layout/navItems.ts ----------
nav = "\n".join(lines(376, 385)).replace("const navItems", "export const navItems")
nav_icons = uses(nav, lucide)
write("layout/navItems.ts", HEADER + f'import {{ {", ".join(nav_icons)} }} from "lucide-react";\nimport type {{ ViewKey }} from "../state/types";\n\n' + nav)

# ---------- store ----------
body = lines(482, 507) + lines(514, 566) + lines(605, 1066)
body_src = "\n".join(body)
# exports.ts wrappers: the store keeps the names downloadCsv / downloadPdf and the trailing notice.
csv_src = "\n".join(csv)
pdf_src = "\n".join(pdf)
assert csv_src in body_src and pdf_src in body_src
body_src = body_src.replace(csv_src, "  const downloadCsv = (filename: string, rows: string[][]) => {\n    downloadCsvFile(filename, rows);\n    setNotice(`${filename} downloaded.`);\n  };")
body_src = body_src.replace(pdf_src, "  const downloadPdf = (filename: string, title: string, rows: string[][]) => {\n    downloadPdfFile(filename, title, rows);\n    setNotice(`${filename} downloaded.`);\n  };")
cycle_src = "\n".join(lines(768, 778))
assert cycle_src in body_src
body_src = body_src.replace(cycle_src, "  const dependencyWouldCycle = (candidateId: number, editingId: number | null) => wouldCycle(tasks, candidateId, editingId);")
store_names = []
for m in re.finditer(r"^  const (?:\[(\w+), (\w+)\]|(\w+))\s*[=:]", body_src, re.M):
    store_names += [g for g in m.groups() if g]
assert store_names[0] == "activeView", store_names[:3]
store_names_set = set(store_names)
helpers = ["initials", "statusLabel", "findBlockingDependency"]
store_imports = (
    'import { useEffect, useMemo, useState } from "react";\n'
    f'import type {{ {", ".join(uses(body_src, type_names))} }} from "./types";\n'
    f'import {{ {", ".join(n for n in uses(body_src, seed_values))} }} from "./seed";\n'
    f'import {{ {", ".join(uses(body_src, ["initials", "statusLabel"]))} }} from "./format";\n'
    + ('import type { AccessRole } from "./seed";\n' if uses(body_src, ["AccessRole"]) else "")
    + 'import { findBlockingDependency, wouldCycle } from "./dependencies";\n'
    'import { downloadCsvFile, downloadPdfFile } from "./exports";\n'
)
store_src = (
    "// All useState + handlers from pages/Home.tsx (checkpoint 5f248af), moved line by line in increment 0 (§13.2).\n"
    "// Same names, same initial values, same handler bodies. My Day state lives in MyDayProvider (§11 IA-10).\n"
    + store_imports
    + "\nexport function useJambavanStore() {\n"
    + body_src
    + "\n\n  return {\n"
    + "".join(f"    {n},\n" for n in store_names)
    + "  };\n}\n\nexport type JambavanStore = ReturnType<typeof useJambavanStore>;\n"
)
write("state/useJambavanStore.ts", store_src)

write("state/JambavanProvider.tsx", '''import { createContext, useContext, type ReactNode } from "react";
import { useJambavanStore, type JambavanStore } from "./useJambavanStore";

// Exposes the store through context so views do not take 20 props (§13.2).
const JambavanContext = createContext<JambavanStore | null>(null);

export function JambavanProvider({ children }: { children: ReactNode }) {
  const store = useJambavanStore();
  return <JambavanContext.Provider value={store}>{children}</JambavanContext.Provider>;
}

export function useJambavan(): JambavanStore {
  const store = useContext(JambavanContext);
  if (!store) throw new Error("useJambavan must be used inside <JambavanProvider>");
  return store;
}
''')

# ---------- MyDayProvider ----------
myday_body = lines(508, 513) + lines(567, 604)
myday_src_body = "\n".join(myday_body)
myday_names = []
for m in re.finditer(r"^  const (?:\[(\w+), (\w+)\]|(\w+))\s*[=:]", myday_src_body, re.M):
    myday_names += [g for g in m.groups() if g]
assert myday_names[0] == "personalPlans"
myday_from_store = [n for n in uses(myday_src_body, store_names) if n not in myday_names]
myday_src = (
    "// My Day state and handlers, moved verbatim from pages/Home.tsx (Home.tsx:508–513, 567–604) in increment 0.\n"
    "// Kept out of the main store so no other view can read it (§11 IA-10). Only MyDayView and the TaskCard\n"
    "// \"Add to My Day\" control use useMyDay().\n"
    'import { createContext, useContext, useMemo, useState, type ReactNode } from "react";\n'
    f'import type {{ {", ".join(uses(myday_src_body, type_names))} }} from "./types";\n'
    f'import {{ {", ".join(uses(myday_src_body, seed_values))} }} from "./seed";\n'
    'import { useJambavan } from "./JambavanProvider";\n\n'
    "function useMyDayStore() {\n"
    f'  const {{ {", ".join(myday_from_store)} }} = useJambavan();\n'
    + myday_src_body
    + "\n\n  return {\n"
    + "".join(f"    {n},\n" for n in myday_names)
    + "  };\n}\n\n"
    "export type MyDayStore = ReturnType<typeof useMyDayStore>;\n"
    "const MyDayContext = createContext<MyDayStore | null>(null);\n\n"
    "export function MyDayProvider({ children }: { children: ReactNode }) {\n"
    "  const store = useMyDayStore();\n"
    "  return <MyDayContext.Provider value={store}>{children}</MyDayContext.Provider>;\n"
    "}\n\n"
    "export function useMyDay(): MyDayStore {\n"
    "  const store = useContext(MyDayContext);\n"
    '  if (!store) throw new Error("useMyDay must be used inside <MyDayProvider>");\n'
    "  return store;\n"
    "}\n"
)
write("state/MyDayProvider.tsx", myday_src)

# ---------- generic component writer ----------
shared = {
    "Avatar": "../art/Avatar",
    "TaskCard": "../task/TaskCard",
    "TrendChart": "../views/TrendChart",
    "navItems": "../layout/navItems",
}


def component(rel, name, jsx_lines, extra_store=None, myday=False, comment=""):
    src = "\n".join(jsx_lines)
    imps = []
    icons = uses(src, lucide)
    if icons:
        imps.append(f'import {{ {", ".join(icons)} }} from "lucide-react";')
    tnames = uses(src, type_names)
    if tnames:
        imps.append(f'import type {{ {", ".join(tnames)} }} from "../state/types";')
    snames = [n for n in uses(src, seed_values)]
    snames = [n for n in snames if n not in store_names_set]
    if snames:
        imps.append(f'import {{ {", ".join(snames)} }} from "../state/seed";')
    if uses(src, ["AccessRole"]):
        imps.append('import type { AccessRole } from "../state/seed";')
    fnames = uses(src, ["initials", "statusLabel"])
    if fnames:
        imps.append(f'import {{ {", ".join(fnames)} }} from "../state/format";')
    if uses(src, ["findBlockingDependency"]):
        imps.append('import { findBlockingDependency } from "../state/dependencies";')
    for comp, path in shared.items():
        if path.endswith("/" + name):
            continue
        if uses(src, [comp]):
            imps.append(f'import {{ {comp} }} from "{path}";')
    my = [n for n in uses(src, myday_names)] if myday else []
    st = [n for n in uses(src, store_names) if n not in my]
    imps.append('import { useJambavan } from "../state/JambavanProvider";')
    if my:
        imps.append('import { useMyDay } from "../state/MyDayProvider";')
    out = HEADER + (comment and comment + "\n") + "\n".join(imps) + "\n\n" + f"export function {name}() {{\n"
    out += f'  const {{ {", ".join(st)} }} = useJambavan();\n'
    if my:
        out += f'  const {{ {", ".join(my)} }} = useMyDay();\n'
    out += "  return (\n    <>\n" + src + "\n    </>\n  );\n}\n"
    write(rel, out)


# ---------- TaskCard ----------
tc_lines = lines(432, 479)
tc_src = "\n".join(tc_lines)
# The "Add to My Day" control reads the private My Day store itself (§11 IA-10), so views never touch it.
assert tc_src.count("onAddToMyDay") == 3, tc_src.count("onAddToMyDay")
tc_src = tc_src.replace(" onAddToMyDay,", "").replace(" onAddToMyDay: (taskId: number) => void;", "")
tc_src = tc_src.replace("onClick={() => onAddToMyDay(task.id)}", "onClick={() => addTaskToMyDay(task.id)}")
assert "onAddToMyDay" not in tc_src
tc_src = tc_src.replace("function TaskCard(", "export function TaskCard(")
tc_src = tc_src.replace('  const [journalDraft, setJournalDraft] = useState("");', '  const { addTaskToMyDay } = useMyDay();\n  const [journalDraft, setJournalDraft] = useState("");', 1)
tc_imps = [
    'import { useState } from "react";',
    f'import {{ {", ".join(uses(tc_src, lucide))} }} from "lucide-react";',
    f'import type {{ {", ".join(uses(tc_src, type_names))} }} from "../state/types";',
    'import { blockerReasons } from "../state/seed";',
    'import { initials } from "../state/format";',
    'import { Avatar } from "../art/Avatar";',
    'import { useMyDay } from "../state/MyDayProvider";',
]
write("task/TaskCard.tsx", HEADER + "\n".join(tc_imps) + "\n\n" + tc_src)

# ---------- layout ----------
component("layout/Sidebar.tsx", "Sidebar", lines(1070, 1108))
component("layout/Topbar.tsx", "Topbar", lines(1111, 1115))
component("layout/PageHeader.tsx", "PageHeader", lines(1118, 1122))
component("layout/Toast.tsx", "Toast", lines(1203, 1203))

# ---------- views (each keeps its own activeView condition, verbatim) ----------
views = [
    ("MyDayView", 1125, 1136, True),
    ("FeedView", 1138, 1162, False),
    ("DepartmentView", 1164, 1168, False),
    ("MomDirectoryView", 1170, 1174, False),
    ("DashboardView", 1176, 1187, False),
    ("GuideView", 1189, 1189, False),
    ("EventPlannerView", 1190, 1190, False),
    ("CalendarView", 1191, 1191, False),
    ("ProjectsView", 1193, 1193, False),
    ("RoleMatrixView", 1195, 1195, False),
    ("AuditLogView", 1196, 1196, False),
    ("MyProfileView", 1197, 1197, False),
    ("PeopleView", 1198, 1198, False),
]
for name, a, b, my in views:
    jsx = lines(a, b)
    jsx = [l.replace(" onAddToMyDay={addTaskToMyDay}", "") for l in jsx]
    component(f"views/{name}.tsx", name, jsx, myday=my)

# ---------- modals (legacy markup, each keeps its own show… condition, verbatim) ----------
modals = [
    ("modals/AccessDialog.tsx", "AccessDialog", 1205),
    ("modals/ProfileDialog.tsx", "ProfileDialog", 1207),
    ("modals/FeedbackDialog.tsx", "FeedbackDialog", 1209),
    ("modals/EventDialog.tsx", "EventDialog", 1211),
    ("modals/CalendarDialog.tsx", "CalendarDialog", 1212),
    ("modals/NoticeDialog.tsx", "NoticeDialog", 1214),
    ("task/TaskDialog.tsx", "TaskDialog", 1216),
    ("task/HandoverDialog.tsx", "HandoverDialog", 1218),
    ("modals/MomDialog.tsx", "MomDialog", 1220),
    ("task/AttachmentDialog.tsx", "AttachmentDialog", 1222),
]
for rel, name, n in modals:
    component(rel, name, lines(n, n))

# ---------- AppShell ----------
shell = [
    lines(1069, 1069)[0][:0] + "    <div className=\"jambavan-app\">",
    "      <Sidebar />",
    "",
    lines(1110, 1110)[0],
    "        <Topbar />",
    "",
    lines(1117, 1117)[0],
    "          <PageHeader />",
    "",
    "",
] + [f"          <{v[0]} />" for v in views] + [
    lines(1199, 1199)[0],
    lines(1200, 1200)[0],
    lines(1201, 1201)[0],
    "",
    "      <Toast />",
    "",
] + [f"      <{m[1]} />" for m in modals] + [
    lines(1224, 1224)[0],
]
assert lines(1068, 1068)[0].strip() == "return (" and lines(1225, 1225)[0].strip() == ");"
assert lines(1224, 1224)[0].strip() == "</div>" and lines(1199, 1199)[0].strip() == "</div>" and lines(1201, 1201)[0].strip() == "</main>"
imps = ['import { Sidebar } from "./Sidebar";', 'import { Topbar } from "./Topbar";', 'import { PageHeader } from "./PageHeader";', 'import { Toast } from "./Toast";']
imps += [f'import {{ {v[0]} }} from "../views/{v[0]}";' for v in views]
imps += [f'import {{ {m[1]} }} from "../{m[0][:-4]}";' for m in modals]
write("layout/AppShell.tsx", "// The page skeleton from pages/Home.tsx (Home.tsx:1068–1225), with each region extracted into a component.\n" + "\n".join(imps) + "\n\nexport function AppShell() {\n  return (\n" + "\n".join(shell) + "\n  );\n}\n")

# ---------- Home.tsx: composition root ----------
home = '''import { AppShell } from "@/components/jambavan/layout/AppShell";
import { JambavanProvider } from "@/components/jambavan/state/JambavanProvider";
import { MyDayProvider } from "@/components/jambavan/state/MyDayProvider";

// Composition root (§13.1). State lives in useJambavanStore (JambavanProvider); the private My Day planner has its
// own provider so no other view can read it (§11 IA-10).
export default function Home() {
  return (
    <JambavanProvider>
      <MyDayProvider>
        <AppShell />
      </MyDayProvider>
    </JambavanProvider>
  );
}
'''
with open(os.path.join(ROOT, "client", "src", "pages", "Home.tsx"), "w", encoding="utf-8") as f:
    f.write(home)

print("store names:", len(store_names), "myday names:", len(myday_names))
