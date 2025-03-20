"use client";

import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:8000/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setFilename(response.data.filename);
      setExtractedText(response.data.text);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const askQuery = async () => {
    if (!filename || !query.trim()) {
      alert("Upload a document first and enter a question.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/ask-query", {
        filename,
        query,
      });

      setAnswer(response.data.answer);
    } catch (error) {
      console.error("Error querying document", error);
      alert("Failed to retrieve answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">AI Document Analyzer</h1>

      {/* File Upload */}
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="mb-4"
      />
      <button
        onClick={uploadFile}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Uploading..." : "Upload PDF"}
      </button>

      {filename && (
        <div className="mt-4 p-4 border">
          <h2 className="text-lg font-semibold">Extracted Text:</h2>
          <p className="text-gray-600">
            {extractedText?.slice(0, 500)}...
          </p>{" "}
          {/* Show preview */}
        </div>
      )}

      {/* Query Input */}
      <div className="mt-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question..."
          className="w-full p-2 border rounded"
        />
        <button
          onClick={askQuery}
          disabled={loading}
          className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
        >
          {loading ? "Processing..." : "Ask Question"}
        </button>
      </div>

      {/* Answer Display */}
      {answer && (
        <div className="mt-4 p-4 border">
          <h2 className="text-lg font-semibold">AI Answer:</h2>
          <p className="text-gray-700">{answer}</p>
        </div>
      )}
    </div>
  );
}
