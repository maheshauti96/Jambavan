// IA-6 (C3): the topbar search was a dead button. It now opens a ⌘K / Ctrl+K command palette that searches task
// titles (archived ones included, with a badge), people and MOM titles, and offers "Create task" and "Go to My day".
// My day content is never a search source (IA-10): this file does not read the My day store.
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { Search, X } from "lucide-react";
import { useJambavan } from "../state/JambavanProvider";
import { LegacyModal } from "../primitives/LegacyModal";

type Result = {
  id: string;
  group: "Tasks" | "People" | "MOMs" | "Commands";
  label: string;
  detail?: string;
  badge?: string;
  run: () => void;
};

const focusLater = (id: string) =>
  window.setTimeout(() => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({
      block: "center",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
    el.focus({ preventScroll: true });
  }, 60);

export const personAnchor = (name: string) =>
  `person-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

export function CommandSearch() {
  const {
    showSearch,
    setShowSearch,
    tasks,
    profiles,
    showRemoved,
    momList,
    setActiveView,
    setDepartmentFilter,
    setStatusFilter,
    setCategoryFilter,
    setArchiveFilter,
    setProjectFilter,
    setMomDepartmentFilter,
    openCreateTask,
  } = useJambavan();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  // ⌘K / Ctrl+K opens the palette from anywhere.
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setShowSearch]);
  useEffect(() => {
    if (showSearch) {
      setQuery("");
      setActive(0);
    }
  }, [showSearch]);
  const close = () => setShowSearch(false);
  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    const match = (text: string) => !q || text.toLowerCase().includes(q);
    const out: Result[] = [];
    tasks
      .filter(task => match(task.title))
      .slice(0, 8)
      .forEach(task =>
        out.push({
          id: `task-${task.id}`,
          group: "Tasks",
          label: task.title,
          detail: `${task.department} · ${task.due}`,
          badge: task.archived ? "Archived" : undefined,
          run: () => {
            setActiveView("feed");
            setDepartmentFilter("All departments");
            setStatusFilter("All work");
            setCategoryFilter("All categories");
            setProjectFilter(null);
            setArchiveFilter(task.archived ? "Archived tasks" : "Active tasks");
            focusLater(`task-${task.id}-title`);
          },
        })
      );
    profiles
      .filter(
        person =>
          (showRemoved || person.access !== "Removed") && match(person.name)
      )
      .slice(0, 6)
      .forEach(person =>
        out.push({
          id: `person-${person.name}`,
          group: "People",
          label: person.name,
          detail: `${person.position} · ${person.department}`,
          badge: person.access === "Removed" ? "Removed" : undefined,
          run: () => {
            setActiveView("people");
            focusLater(personAnchor(person.name));
          },
        })
      );
    momList
      .filter(mom => match(mom.title))
      .slice(0, 5)
      .forEach(mom =>
        out.push({
          id: `mom-${mom.id}`,
          group: "MOMs",
          label: mom.title,
          detail: `${mom.department} · ${mom.date}`,
          run: () => {
            setMomDepartmentFilter(mom.department);
            setActiveView("momDirectory");
          },
        })
      );
    if (match("create task new task"))
      out.push({
        id: "cmd-create",
        group: "Commands",
        label: "Create task",
        run: () => window.setTimeout(openCreateTask, 30),
      });
    if (match("go to my day"))
      out.push({
        id: "cmd-myday",
        group: "Commands",
        label: "Go to My day",
        run: () => setActiveView("myDay"),
      });
    return out;
  }, [
    query,
    tasks,
    profiles,
    showRemoved,
    momList,
    setActiveView,
    setDepartmentFilter,
    setStatusFilter,
    setCategoryFilter,
    setArchiveFilter,
    setProjectFilter,
    setMomDepartmentFilter,
    openCreateTask,
  ]);
  const choose = (result: Result | undefined) => {
    if (!result) return;
    close();
    result.run();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(index => Math.min(results.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(index => Math.max(0, index - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(results[active]);
    }
  };
  useEffect(() => {
    setActive(0);
  }, [query]);
  useEffect(() => {
    document
      .getElementById(`cmd-option-${active}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);
  if (!showSearch) return null;
  let lastGroup = "";
  return (
    <LegacyModal onClose={close} className="task-modal command-modal">
      <div className="modal-head">
        <div>
          <h2>Search JAMBAVAN</h2>
        </div>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={close}
        >
          <X size={18} />
        </button>
      </div>
      <div className="command-input">
        <Search size={18} aria-hidden="true" />
        <input
          autoFocus
          role="combobox"
          aria-expanded="true"
          aria-controls="command-results"
          aria-autocomplete="list"
          aria-activedescendant={
            results[active] ? `cmd-option-${active}` : undefined
          }
          aria-label="Search tasks, people and MOMs"
          placeholder="Search tasks, people, MOMs..."
          value={query}
          onChange={event => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
      <div id="command-results" role="listbox" aria-label="Results">
        {results.length === 0 && (
          <p className="command-empty">
            No tasks, people or MOMs match "{query}".
          </p>
        )}
        {results.map((result, index) => {
          const header =
            result.group !== lastGroup ? (
              <div
                className="command-group"
                role="presentation"
                key={`g-${result.group}`}
              >
                {result.group}
              </div>
            ) : null;
          lastGroup = result.group;
          return [
            header,
            <div
              key={result.id}
              id={`cmd-option-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(result)}
            >
              <span>
                {result.label}
                {result.detail && <small> · {result.detail}</small>}
              </span>
              {result.badge && (
                <span className="command-badge">{result.badge}</span>
              )}
            </div>,
          ];
        })}
      </div>
    </LegacyModal>
  );
}
