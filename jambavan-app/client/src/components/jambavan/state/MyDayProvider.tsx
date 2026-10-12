// Kept out of the main store so no other view can read it (§11 IA-10). Only MyDayView and the TaskCard
// "Add to My day" control use useMyDay().
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PersonalScheduleStatus, PersonalPlan } from "./types";
import { plannerToday, emptyPersonalPlan } from "./seed";
import { useJambavan } from "./JambavanProvider";
import { isCurrentUser } from "./identity";

function useMyDayStore() {
  const { tasks, setNotice } = useJambavan();
  const [personalPlans, setPersonalPlans] = useState<
    Record<string, PersonalPlan>
  >({
    [plannerToday]: {
      ...emptyPersonalPlan(plannerToday),
      top3: [{ id: 1, title: "Review today's top priorities", done: false }],
      scheduleBlocks: [
        {
          id: 2,
          start: "09:00",
          end: "10:00",
          title: "Academy focus block",
          category: "Work",
          status: "Planned",
        },
      ],
    },
  });
  const [myDayDate, setMyDayDate] = useState(plannerToday);
  const [top3Draft, setTop3Draft] = useState("");
  const [scheduleDraft, setScheduleDraft] = useState({
    start: "09:00",
    end: "10:00",
    title: "",
    category: "Work",
    status: "Planned" as PersonalScheduleStatus,
  });
  const [actionableDraft, setActionableDraft] = useState({
    title: "",
    notes: "",
    due: myDayDate,
    priority: "Medium" as "High" | "Medium" | "Low",
  });
  const [reviewDraft, setReviewDraft] = useState({
    completed: "",
    pending: "",
    tomorrowPriority: "",
  });
  const myDayPlan = useMemo(
    () => personalPlans[myDayDate] || emptyPersonalPlan(myDayDate),
    [personalPlans, myDayDate]
  );
  const myDayDateLabel = new Date(`${myDayDate}T12:00:00`).toLocaleDateString(
    "en-IN",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );
  const updateMyDay = (updater: (plan: PersonalPlan) => PersonalPlan) =>
    setPersonalPlans(current => ({
      ...current,
      [myDayDate]: updater(current[myDayDate] || emptyPersonalPlan(myDayDate)),
    }));
  const addTop3 = () => {
    const title = top3Draft.trim();
    if (!title || myDayPlan.top3.length >= 3) return;
    updateMyDay(plan => ({
      ...plan,
      top3: [...plan.top3, { id: Date.now(), title, done: false }],
    }));
    setTop3Draft("");
  };
  // F19 (D5): "Edit" fills the form and marks the block; "Save block" replaces it in place (same id); "Cancel" leaves
  // the list untouched. The block is never removed before the user saves.
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const emptyScheduleDraft = () => ({
    start: "09:00",
    end: "10:00",
    title: "",
    category: "Work",
    status: "Planned" as PersonalScheduleStatus,
  });
  const addScheduleBlock = () => {
    if (!scheduleDraft.title.trim()) return;
    if (editingBlockId !== null) {
      const id = editingBlockId;
      updateMyDay(plan => ({
        ...plan,
        scheduleBlocks: plan.scheduleBlocks.map(item =>
          item.id === id
            ? { ...scheduleDraft, id, title: scheduleDraft.title.trim() }
            : item
        ),
      }));
    } else {
      updateMyDay(plan => ({
        ...plan,
        scheduleBlocks: [
          ...plan.scheduleBlocks,
          {
            ...scheduleDraft,
            id: Date.now(),
            title: scheduleDraft.title.trim(),
          },
        ],
      }));
    }
    setEditingBlockId(null);
    setScheduleDraft(emptyScheduleDraft());
  };
  const cancelScheduleEdit = () => {
    setEditingBlockId(null);
    setScheduleDraft(emptyScheduleDraft());
  };
  // F20 (D6): the review fields show the draft only; the draft is loaded from the saved plan when the date changes
  // or the view mounts, so a saved answer can be cleared and saved as "".
  const reviewFor = (date: string) =>
    personalPlans[date]?.review || {
      completed: "",
      pending: "",
      tomorrowPriority: "",
    };
  const loadReviewDraft = () => setReviewDraft(reviewFor(myDayDate));
  /** Changing the date (picker or "Today") cancels a block edit and loads that date's review. */
  const changeMyDayDate = (date: string) => {
    setMyDayDate(date);
    setActionableDraft(current => ({ ...current, due: date }));
    setReviewDraft(reviewFor(date));
    cancelScheduleEdit();
  };
  const addPersonalActionable = () => {
    if (!actionableDraft.title.trim()) return;
    updateMyDay(plan => ({
      ...plan,
      actionables: [
        ...plan.actionables,
        {
          ...actionableDraft,
          id: Date.now(),
          title: actionableDraft.title.trim(),
          notes: actionableDraft.notes.trim(),
          done: false,
        },
      ],
    }));
    setActionableDraft({
      title: "",
      notes: "",
      due: myDayDate,
      priority: "Medium",
    });
  };
  const addTaskToMyDay = (taskId: number) => {
    const task = tasks.find(item => item.id === taskId);
    if (!task || !isCurrentUser(task.assignee)) {
      setNotice("Only academy tasks assigned to you can be added to My day.");
      return;
    }
    updateMyDay(plan =>
      plan.linkedTaskIds.includes(taskId)
        ? plan
        : { ...plan, linkedTaskIds: [...plan.linkedTaskIds, taskId] }
    );
    setNotice(
      `${task.title} was added to your private My day plan. The academy task was not changed.`
    );
  };
  const removeLinkedTask = (taskId: number) =>
    updateMyDay(plan => ({
      ...plan,
      linkedTaskIds: plan.linkedTaskIds.filter(id => id !== taskId),
    }));
  const toggleTop3 = (id: number) =>
    updateMyDay(plan => ({
      ...plan,
      top3: plan.top3.map(item =>
        item.id === id ? { ...item, done: !item.done } : item
      ),
    }));
  const toggleActionable = (id: number) =>
    updateMyDay(plan => ({
      ...plan,
      actionables: plan.actionables.map(item =>
        item.id === id ? { ...item, done: !item.done } : item
      ),
    }));
  const updateScheduleStatus = (id: number, status: PersonalScheduleStatus) =>
    updateMyDay(plan => ({
      ...plan,
      scheduleBlocks: plan.scheduleBlocks.map(item =>
        item.id === id ? { ...item, status } : item
      ),
    }));
  const editScheduleBlock = (id: number) => {
    const block = myDayPlan.scheduleBlocks.find(item => item.id === id);
    if (!block) return;
    setScheduleDraft({
      start: block.start,
      end: block.end,
      title: block.title,
      category: block.category,
      status: block.status,
    });
    setEditingBlockId(id);
  };
  const deleteScheduleBlock = (id: number) => {
    if (editingBlockId === id) cancelScheduleEdit();
    updateMyDay(plan => ({
      ...plan,
      scheduleBlocks: plan.scheduleBlocks.filter(item => item.id !== id),
    }));
  };
  const deleteActionable = (id: number) =>
    updateMyDay(plan => ({
      ...plan,
      actionables: plan.actionables.filter(item => item.id !== id),
    }));
  const saveDayReview = () => {
    updateMyDay(plan => ({ ...plan, review: reviewDraft }));
    setNotice("Your private end-of-day review was saved.");
  };

  return {
    personalPlans,
    setPersonalPlans,
    myDayDate,
    setMyDayDate,
    top3Draft,
    setTop3Draft,
    scheduleDraft,
    setScheduleDraft,
    actionableDraft,
    setActionableDraft,
    reviewDraft,
    setReviewDraft,
    myDayPlan,
    myDayDateLabel,
    updateMyDay,
    addTop3,
    addScheduleBlock,
    addPersonalActionable,
    addTaskToMyDay,
    removeLinkedTask,
    toggleTop3,
    toggleActionable,
    updateScheduleStatus,
    editScheduleBlock,
    editingBlockId,
    cancelScheduleEdit,
    loadReviewDraft,
    changeMyDayDate,
    deleteScheduleBlock,
    deleteActionable,
    saveDayReview,
  };
}

export type MyDayStore = ReturnType<typeof useMyDayStore>;
const MyDayContext = createContext<MyDayStore | null>(null);

export function MyDayProvider({ children }: { children: ReactNode }) {
  const store = useMyDayStore();
  return (
    <MyDayContext.Provider value={store}>{children}</MyDayContext.Provider>
  );
}

export function useMyDay(): MyDayStore {
  const store = useContext(MyDayContext);
  if (!store) throw new Error("useMyDay must be used inside <MyDayProvider>");
  return store;
}
