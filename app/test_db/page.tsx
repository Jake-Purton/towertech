'use client';

import { useEffect, useState } from "react";

interface Table {
    table_name: string;
}

interface Record {
    [key: string]: any;
}

const TestDbPage = () => {
    const [tables, setTables] = useState<Table[]>([]);
    const [records, setRecords] = useState<Record[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await fetch("/api/get_tables");
                const data = await response.json();
                if (response.ok) {
                    setTables(data.tables);
                } else {
                    setError(data.error);
                }
            } catch (err) {
                setError("Failed to fetch tables.");
            }
        };

        fetchTables();
    }, []);

    const fetchRecords = async (tableName: string) => {
        try {
            console.log(`Fetching records for table: ${tableName}`);
            const response = await fetch(`/api/get_table_records?table=${tableName}`);
            const text = await response.text(); // Read the response as text
            console.log("Response text:", text); // Log the response text
            const data = JSON.parse(text); // Parse the text as JSON
            if (response.ok) {
                setRecords(data.records);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Failed to fetch records: " + err.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-white sm:p-20">
            <h1 className="text-4xl font-bold text-orange-600 drop-shadow-md mb-4">Database Tables</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <ul className="list-disc pl-5 mb-4">
                {tables.map((table, index) => (
                    <li
                        key={index}
                        onClick={() => fetchRecords(table.table_name)}
                        className="cursor-pointer text-orange-500 hover:underline"
                    >
                        {table.table_name}
                    </li>
                ))}
            </ul>
            {records.length > 0 && (
                <table className="min-w-[50%] max-w-[75%] divide-y divide-gray-600 rounded-lg overflow-hidden border border-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            {Object.keys(records[0]).map((key) => (
                                <th key={key} className="px-4 py-2 border-b border-gray-600 bg-gray-800 text-left text-sm font-medium text-orange-500">
                                    {key}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-600">
                        {records.map((record, index) => (
                            <tr key={index} className="hover:bg-gray-700">
                                {Object.values(record).map((value, idx) => (
                                    <td key={idx} className="px-4 py-2 border-b border-gray-600 text-sm text-orange-500">
                                        {value}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TestDbPage;
