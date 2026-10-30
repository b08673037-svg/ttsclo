import { useSearchParams } from "react-router-dom";

export default function SearchResults() {
  const [params] = useSearchParams();
  const query = params.get("q") || "";

  return (
    <div className="page">
      <h1>Search Results</h1>
      <p>
        {query
          ? `Showing results for "${query}"`
          : "No search query provided."}
      </p>
    </div>
  );
}