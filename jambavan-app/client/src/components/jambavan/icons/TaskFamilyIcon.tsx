import type { ComponentType } from "react";
import type { TaskCategory } from "../state/types";
import {
  AngadFoot,
  Gada,
  SquirrelStone,
  SugrivPennant,
  type RamayanaIconProps,
} from "./RamayanaIcons";

const familyIcons = {
  Squirrel: SquirrelStone,
  Angad: AngadFoot,
  Sugriv: SugrivPennant,
  HANUMAN: Gada,
} satisfies Record<TaskCategory, ComponentType<RamayanaIconProps>>;

export function TaskFamilyIcon({
  category,
  ...props
}: RamayanaIconProps & { category: TaskCategory }) {
  const Icon = familyIcons[category];
  return <Icon {...props} />;
}
