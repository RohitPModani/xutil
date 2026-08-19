import { useEffect, useState, useMemo, useCallback } from "react";
import SectionCard from "../../components/SectionCard";
import ClearButton from "../../components/ClearButton";
import ErrorBox from "../../components/ErrorBox";
import CopyButton from "../../components/CopyButton";
import SEODescription from "../../components/SEODescription";
import { PageSEO } from "../../components/PageSEO";
import seoDescriptions from "../../data/seoDescriptions";
import { updateToolUsage } from "../../utils/toolUsage";
import { REGEX_CATEGORIES } from "../../data/regexConstants"; // Suggested to move constants to separate file
import ToolHeader from "../../components/ToolHeader";

type RegexItem = {
  pattern: string;
  description: string;
};

type RegexCategory = {
  name: string;
  items: RegexItem[];
};

const CategorySection = ({ category }: { category: RegexCategory }) => (
  <div className="mb-6">
    <h4 className="section-subtitle mb-2">{category.name}</h4>
    <div className="result-box grid grid-cols-1 md:grid-cols-2 gap-4">
      {category.items.map((item) => (
        <div
          key={item.pattern}
          className="inner-result flex justify-between items-center p-3 rounded-md"
        >
          <div>
            <code className="font-mono text-sm">{item.pattern}</code>
            <p className="text-sm text-dim dark:text-faint">
              {item.description}
            </p>
          </div>
          <CopyButton text={item.pattern} aria-label={`Copy ${item.pattern}`} />
        </div>
      ))}
    </div>
  </div>
);

function RegexCheatsheet() {
  const seo = seoDescriptions.regexCheatsheet;

  const [filter, setFilter] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    updateToolUsage("regex_cheatsheet");
  }, []);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedFilter(filter);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [filter]);

  const filterItems = useCallback((items: RegexItem[], filterValue: string) => {
    const lowerFilter = filterValue.toLowerCase();
    return items.filter(
      (item) =>
        item.pattern.toLowerCase().includes(lowerFilter) ||
        item.description.toLowerCase().includes(lowerFilter)
    );
  }, []);

  const filteredCategories = useMemo(() => {
    return REGEX_CATEGORIES.map((category) => ({
      ...category,
      items: filterItems([...category.items], debouncedFilter),
    })).filter((category) => category.items.length > 0);
  }, [debouncedFilter, filterItems]);

  const handleClear = useCallback(() => {
    setFilter("");
    setError(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClear();
      }
    },
    [handleClear]
  );

  return (
    <>
      <PageSEO title={seo.seo} description={seo.body} />
      <div className="py-6 sm:py-8">
        <ToolHeader title={seo.title} />

        <SectionCard className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Regex Cheatsheet</h3>
            <ClearButton
              onClick={handleClear}
              disabled={!filter}
              aria-label="Clear filter"
            />
          </div>
          <hr className="line-break" />
          <div className="mb-4">
            <label htmlFor="filter" className="form-label">
              Filter Patterns:
            </label>
            <input
              id="filter"
              type="text"
              className="input-field"
              placeholder="e.g., digit, lookahead, \\d"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Filter regex patterns"
            />
          </div>

          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <CategorySection key={category.name} category={category} />
            ))
          ) : (
            <p className="text-dim dark:text-faint">
              No patterns match your filter.
            </p>
          )}

          <ErrorBox message={error} aria-live="polite" />
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
}

export default RegexCheatsheet;
