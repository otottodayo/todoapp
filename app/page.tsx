"use client";

import { useState, useRef, useEffect } from "react";

type Task = {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
};

type Filter = "all" | "active" | "done";

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  // LocalStorageから読み込み
  useEffect(() => {
    const saved = localStorage.getItem("todo-tasks");
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  // LocalStorageへ保存
  useEffect(() => {
    localStorage.setItem("todo-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    const text = input.trim();
    if (!text) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      done: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
    setInput("");
    inputRef.current?.focus();
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const removeTask = (id: string) => {
    setRemovingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 200);
  };

  const filtered = tasks.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  const activeCount = tasks.filter((t) => !t.done).length;
  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <main className="min-h-screen flex items-start justify-center pt-16 px-4 pb-16">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-stone-800">
            やること
          </h1>
          {tasks.length > 0 && (
            <p className="mt-1 text-sm text-stone-400">
              {activeCount > 0
                ? `残り ${activeCount} 件`
                : "すべて完了しました！"}
              {doneCount > 0 && ` · 完了 ${doneCount} 件`}
            </p>
          )}
        </div>

        {/* 入力欄 */}
        <div className="flex gap-2 mb-6">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="タスクを入力…"
            className="flex-1 px-4 py-3 rounded-xl bg-white border border-stone-200 text-stone-800 placeholder-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 transition"
          />
          <button
            onClick={addTask}
            disabled={!input.trim()}
            className="px-5 py-3 rounded-xl bg-stone-800 text-white text-sm font-medium hover:bg-stone-700 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            追加
          </button>
        </div>

        {/* フィルター */}
        {tasks.length > 0 && (
          <div className="flex gap-1 mb-4 p-1 bg-stone-100 rounded-xl">
            {(
              [
                { key: "all", label: "すべて" },
                { key: "active", label: "未完了" },
                { key: "done", label: "完了" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === key
                    ? "bg-white text-stone-800 shadow-sm"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* タスクリスト */}
        <ul className="space-y-2">
          {filtered.length === 0 && (
            <li className="text-center py-12 text-stone-300 text-sm select-none">
              {tasks.length === 0
                ? "タスクを追加してみましょう"
                : "該当するタスクがありません"}
            </li>
          )}
          {filtered.map((task) => (
            <li
              key={task.id}
              className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white border border-stone-100 shadow-sm ${
                removingIds.has(task.id) ? "task-exit" : "task-enter"
              }`}
            >
              {/* チェックボックス */}
              <button
                onClick={() => toggleTask(task.id)}
                aria-label={task.done ? "未完了にする" : "完了にする"}
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  task.done
                    ? "bg-emerald-400 border-emerald-400 text-white"
                    : "border-stone-300 hover:border-stone-400"
                }`}
              >
                {task.done && <CheckIcon />}
              </button>

              {/* テキスト */}
              <span
                className={`flex-1 text-sm leading-snug transition-all ${
                  task.done
                    ? "line-through text-stone-300"
                    : "text-stone-700"
                }`}
              >
                {task.text}
              </span>

              {/* 削除ボタン */}
              <button
                onClick={() => removeTask(task.id)}
                aria-label="削除"
                className="flex-shrink-0 text-stone-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>

        {/* 完了済みをまとめて削除 */}
        {doneCount > 0 && (
          <button
            onClick={() => {
              const doneIds = tasks.filter((t) => t.done).map((t) => t.id);
              setRemovingIds(new Set(doneIds));
              setTimeout(() => {
                setTasks((prev) => prev.filter((t) => !t.done));
                setRemovingIds(new Set());
              }, 200);
            }}
            className="mt-4 w-full py-2.5 rounded-xl text-xs text-stone-400 hover:text-red-400 hover:bg-red-50 border border-dashed border-stone-200 hover:border-red-200 transition-all"
          >
            完了済みをすべて削除 ({doneCount}件)
          </button>
        )}
      </div>
    </main>
  );
}
