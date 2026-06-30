import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

const EXTENSIONS = [
  StarterKit.configure({ underline: false }),
  Underline,
  Link,
  TiptapImage,
  Table,
  TableRow,
  TableCell,
  TableHeader,
  TaskList,
  TaskItem,
];

export function tiptapToHtml(json: unknown): string {
  if (!json || typeof json !== "object") return "";
  try {
    return generateHTML(json as Parameters<typeof generateHTML>[0], EXTENSIONS);
  } catch {
    return "";
  }
}
