import { useEffect, useState } from "react";

export default function Holidays() {
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/shahmeemaryam/data-smart-office/25854a80cd799e3b3a7d67d6f1f6b2f63fecfcee/holidays.json")
      .then((res) => res.json())
      .then((data) => setHolidays(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6">
      <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
        Public Holidays
      </h2>

      <div className="space-y-3">
        {holidays.map((h) => (
          <div
            key={h.id}
            className="border-b border-gray-200 dark:border-zinc-700 pb-2"
          >
            <p className="text-gray-800 dark:text-white font-medium">
              {h.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {h.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}