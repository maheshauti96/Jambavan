// Static-markup tests for the increment 1 primitives (react-dom/server in Node; no renderer dependency, §15).
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Avatar } from "../art/Avatar";
import { PersonAvatar } from "../art/PersonAvatar";
import { RamSetuProgress } from "../progress/RamSetuProgress";
import { initialTasksWithCategories as seed } from "../state/seed";
import { FamilyBadge, PriorityBadge, SourceBadge, StatusBadge } from "./Badge";
import { Button, IconButton } from "./Button";
import { EmptyState } from "./EmptyState";
import { Field, Input, ToggleButton } from "./Field";
import { InlineError } from "./InlineError";

const html = (node: React.ReactElement) => renderToStaticMarkup(node);
const task = (id: number) => seed.find(t => t.id === id)!;

describe("RamSetuProgress (§10.2, AC-7.2)", () => {
  it("is a labelled image with the % as text", () => {
    const out = html(<RamSetuProgress value={72} label="October Launch" />);
    expect(out).toContain('role="img"');
    expect(out).toContain(
      'aria-label="October Launch: 72% complete, 14 of 20 Setu stones placed. Approaching Lanka."'
    );
    expect(out).toContain(">72%<");
    expect(out).toContain("Approaching Lanka");
  });

  it("shows before → after and marks only the newly placed stones", () => {
    const out = html(
      <RamSetuProgress value={50} from={34} label="October Launch" />
    );
    expect(out).toContain("34% → 50%");
    expect(out.match(/jb-setu-fresh/g)?.length).toBe(10 - 7);
    expect(out).toContain(
      'aria-label="October Launch: 50% complete, 10 of 20 Setu stones placed. Halfway across the ocean."'
    );
  });

  it("draws the deck only at exactly 100%", () => {
    expect(html(<RamSetuProgress value={99} label="J" />)).not.toContain(
      "Q160 24 278 42"
    );
    expect(html(<RamSetuProgress value={100} label="J" />)).toContain(
      "Q160 24 278 42"
    );
  });
});

describe("PersonAvatar and the legacy Avatar (F11)", () => {
  it("renders initials with the person's name as the accessible name and no image", () => {
    const out = html(
      <PersonAvatar name="Neha Kapoor" department="Admissions" />
    );
    expect(out).toContain('aria-label="Neha Kapoor"');
    expect(out).toContain(">NK<");
    expect(out).not.toContain("<img");
  });

  it("is hidden from assistive tech when decorative", () => {
    expect(html(<PersonAvatar name="Neha Kapoor" decorative />)).toContain(
      'aria-hidden="true"'
    );
  });

  it("keeps stored initials such as YO", () => {
    expect(html(<PersonAvatar name="You" initials="YO" />)).toContain(">YO<");
  });

  it("legacy Avatar never points at /manus-storage", () => {
    const out = html(<Avatar text="AM" name="Arjun Mehta" tone="saffron" />);
    expect(out).not.toContain("<img");
    expect(out).toContain(">AM<");
  });

  it("no source file references /manus-storage", () => {
    const root = path.resolve(__dirname, "../../..");
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (
          /\.(tsx?|css)$/.test(entry) &&
          !entry.endsWith(".test.tsx") &&
          readFileSync(full, "utf8").includes("manus-storage")
        )
          hits.push(full);
      }
    };
    walk(root);
    expect(hits).toEqual([]);
  });
});

describe("Badges (§3.5)", () => {
  it("StatusBadge shows every status in words (F7)", () => {
    expect(html(<StatusBadge value="blocked" />)).toContain("Blocked");
    expect(html(<StatusBadge value="todo" />)).toContain("Not started");
    expect(html(<StatusBadge value="progress" />)).toContain("In progress");
    expect(html(<StatusBadge value="done" />)).toContain("Completed");
  });

  it("SourceBadge uses sourceLabel (F13)", () => {
    expect(html(<SourceBadge task={task(1)} />)).toContain("MOM task");
    expect(
      html(
        <SourceBadge
          task={{
            ...task(3),
            source: "Event plan · Annual Parent Orientation",
          }}
        />
      )
    ).toContain("Event task");
    expect(html(<SourceBadge task={task(7)} suffix="year-long" />)).toContain(
      "HANUMAN mission · year-long"
    );
  });

  it("FamilyBadge shows the emblem and the name", () => {
    const out = html(<FamilyBadge category="Angad" />);
    expect(out).toContain("Angad");
    expect(out).toContain('data-icon="AngadFoot"');
  });

  it("PriorityBadge is a labelled outline chip", () => {
    const out = html(<PriorityBadge value="Medium" />);
    expect(out).toContain('aria-label="Priority: Medium"');
    expect(out).toContain("rounded-jb-sm");
  });
});

describe("Buttons and fields (§3.5)", () => {
  it("IconButton carries its aria-label and hides the icon", () => {
    const out = html(
      <IconButton aria-label="Edit task: Finalize" icon={<svg />} />
    );
    expect(out).toContain('aria-label="Edit task: Finalize"');
    expect(out).toContain('aria-hidden="true"');
    expect(out).toContain('type="button"');
  });

  it("Button sizes keep a 44 px default", () => {
    expect(html(<Button>Go</Button>)).toContain("min-h-11");
  });

  it("Field wires label, hint, error, aria-describedby and aria-invalid", () => {
    const out = html(
      <Field
        id="title"
        label="Mission title"
        hint="Keep it short."
        error="Give your mission a title to start it."
        required
      >
        {control => <Input {...control} />}
      </Field>
    );
    expect(out).toContain('for="title"');
    expect(out).toContain('id="title"');
    expect(out).toContain('aria-describedby="title-error title-hint"');
    expect(out).toContain('aria-invalid="true"');
    expect(out).toContain('required=""');
    expect(out).toContain("Give your mission a title to start it.");
  });

  it("ToggleButton exposes aria-pressed", () => {
    expect(html(<ToggleButton pressed>Seen</ToggleButton>)).toContain(
      'aria-pressed="true"'
    );
    expect(
      html(<ToggleButton pressed={false}>Mark seen</ToggleButton>)
    ).toContain('aria-pressed="false"');
  });

  it("InlineError is an alert; EmptyState has a display heading", () => {
    expect(
      html(
        <InlineError title="The mission could not be completed. Please try again." />
      )
    ).toContain('role="alert"');
    expect(html(<EmptyState title="No missions here yet" />)).toContain("<h3");
  });
});
