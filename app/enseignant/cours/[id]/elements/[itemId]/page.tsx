import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { saveItem } from "../../../../actions";
import { ItemForm } from "@/components/teacher-forms";
import { itemLabel } from "@/components/ui";
import { requireTeacher } from "@/lib/auth";
import { one } from "@/lib/db";
import { getEditableCourse } from "@/lib/teaching";

type Props = { params: Promise<{ id: string; itemId: string }> };

export const metadata: Metadata = { title: "Modifier l'élément" };

export default async function EditItemPage({ params }: Props) {
  const user = await requireTeacher();
  const { id, itemId } = await params;
  const course = getEditableCourse(Number(id), user);
  if (!course) notFound();
  const item = one<{ id: number; kind: string; title: string; minutes: number; content: string; video_url: string | null; module_title: string }>(
    `SELECT i.id, i.kind, i.title, i.minutes, i.content, i.video_url, m.title AS module_title
     FROM items i JOIN modules m ON m.id = i.module_id WHERE i.id = ? AND m.course_id = ?`,
    Number(itemId),
    course.id,
  );
  if (!item) notFound();

  return (
    <div className="container-page max-w-4xl py-12">
      <Link href={`/enseignant/cours/${course.id}`} className="text-sm text-ink-soft hover:underline">← {course.title}</Link>
      <p className="eyebrow mt-6">{itemLabel(item.kind)} · {item.module_title}</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">{item.title}</h1>
      <div className="mt-8">
        <ItemForm action={saveItem.bind(null, item.id)} item={item} />
      </div>
      <Link href={`/cours/${course.slug}/apprendre/${item.id}`} className="btn-ghost mt-6">Voir l&apos;aperçu élève →</Link>
    </div>
  );
}
