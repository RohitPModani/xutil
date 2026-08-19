import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import FrequentlyUsedTools from '../components/FrequentlyUsedTools';
import { PageSEO } from '../components/PageSEO';
import seoDescriptions from '../data/seoDescriptions';
import { toolSignatures, ToolSignature } from '../data/toolSignatures';

interface Tool {
  name: string;
  path: string;
}

interface Category {
  title: string;
  items: Tool[];
}

/*
  Grouped the way someone looks for a tool, not the way the code is filed.
  "Converters" and "General Converters" told you nothing about which one held
  the timestamp tool, so the groups now say what is inside them.
*/
const categories: Category[] = [
  {
    title: 'Encode & decode',
    items: [
      { name: 'GUID Generator', path: '/guid' },
      { name: 'ULID Generator', path: '/ulid' },
      { name: 'Password Generator', path: '/password' },
      { name: 'Morse Code Parser', path: '/morse' },
      { name: 'Hash Generator', path: '/hash' },
      { name: 'Base Encoder / Decoder', path: '/base' },
      { name: 'ROT13 / Caesar Cipher', path: '/cipher' },
      { name: 'JWT Decoder', path: '/jwt' },
      { name: 'URL Encoder / Decoder', path: '/eurl' },
      { name: 'HTML Entities', path: '/html' },
    ],
  },
  {
    title: 'Data formats',
    items: [
      { name: 'XML ⇄ JSON', path: '/xml_json' },
      { name: 'YAML ⇄ JSON', path: '/yaml_json' },
      { name: 'CSV ⇄ JSON', path: '/csv_json' },
      { name: 'JSON to TypeScript', path: '/json_ts' },
      { name: 'JSON to Python Dataclass', path: '/json_python' },
      { name: 'JSON to Pydantic Model', path: '/json_pydantic' },
      { name: 'Base Number', path: '/base_number' },
      { name: 'Text ⇄ Base Number', path: '/text_base' },
      { name: 'Unix ⇄ UTC', path: '/unix_utc' },
      { name: 'Timezone', path: '/timezone' },
      { name: 'Cron Converter', path: '/cron' },
    ],
  },
  {
    title: 'Units & measures',
    items: [
      { name: 'Angle', path: '/angle' },
      { name: 'Area', path: '/area' },
      { name: 'Bits / Bytes', path: '/bit_byte' },
      { name: 'Energy', path: '/energy' },
      { name: 'Frequency', path: '/frequency' },
      { name: 'Fuel Economy', path: '/fuel_economy' },
      { name: 'Length', path: '/length' },
      { name: 'Power', path: '/power' },
      { name: 'Pressure', path: '/pressure' },
      { name: 'Speed', path: '/speed' },
      { name: 'Temperature', path: '/temperature' },
      { name: 'Time Unit', path: '/time' },
      { name: 'Volume', path: '/volume' },
      { name: 'Weight', path: '/weight' },
    ],
  },
  {
    title: 'Text & code',
    items: [
      { name: 'Lorem Ipsum Generator', path: '/lorem' },
      { name: 'Slug Generator', path: '/slug' },
      { name: 'Text Compare', path: '/text_compare' },
      { name: 'URL Parser', path: '/url_parser' },
      { name: 'JSON Formatter & Validator', path: '/json_validator' },
      { name: 'Text Case Converter', path: '/text_case' },
      { name: 'Markdown Previewer', path: '/markdown' },
      { name: 'Whitespace / Line Break Remover', path: '/line_break_whitespace_remover' },
      { name: 'Duplicate Line Remover', path: '/duplicate_line_remover' },
      { name: 'String Counter', path: '/string_counter' },
      { name: 'Regex Tester', path: '/regex' },
      { name: 'Regex Cheatsheet', path: '/regex_cheatsheet' },
    ],
  },
  {
    title: 'Word play',
    items: [
      { name: 'Palindrome Checker', path: '/palindrome' },
      { name: 'String Reverser / Rotator', path: '/string_reverser_rotator' },
      { name: 'Roman Numeral Converter', path: '/roman_numeral' },
      { name: 'NATO Phonetic Alphabet', path: '/nato_phonetic' },
      { name: 'Pig Latin Converter', path: '/pig_latin' },
      { name: 'Numeronym Generator', path: '/numeronym' },
      { name: 'Leetspeak Translator', path: '/leetspeak' },
      { name: 'Word Frequency Counter', path: '/word_frequency_counter' },
    ],
  },
  {
    title: 'Images & colour',
    items: [
      { name: 'QR Code Generator', path: '/qr_code' },
      { name: 'Barcode Generator', path: '/barcode_generator' },
      { name: 'Barcode / QR Reader', path: '/barcode_reader' },
      { name: 'Color Picker', path: '/color_picker' },
      { name: 'Favicon Generator', path: '/favicon' },
      { name: 'Image Compressor', path: '/image_compressor' },
      { name: 'Gradient Generator', path: '/gradient_generator' },
      { name: 'Box Shadow Generator', path: '/box_shadow_generator' },
    ],
  },
];

const TOTAL_TOOLS = categories.reduce((n, c) => n + c.items.length, 0);

const fuseOptions = {
  keys: [
    { name: 'name', weight: 2 },
    // Searching "base64" should find the Base Encoder even though its name
    // never says "64" - the signature does.
    { name: 'searchText', weight: 1 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 1,
  shouldSort: true,
};

/** `jwt → header · payload`. Source and result keep their colours everywhere. */
function Signature({ sig }: { sig: ToolSignature }) {
  return (
    <span className="sig" aria-hidden="true">
      {sig.in && <span className="sig-in">{sig.in}</span>}
      <span className="sig-arrow">{sig.dir === 'both' ? '⇄' : '→'}</span>
      <span className="sig-out">{sig.out}</span>
    </span>
  );
}

/** Same sentence a screen reader gets, since the arrows mean nothing aloud. */
function describe(name: string, sig?: ToolSignature) {
  if (!sig) return name;
  const verb = sig.dir === 'both' ? 'converts between' : 'produces';
  return sig.in
    ? `${name}. ${verb} ${sig.in} and ${sig.out}`
    : `${name}. Produces ${sig.out}`;
}

function ToolRow({
  tool,
  active,
  onEnter,
  onClick,
}: {
  tool: Tool;
  active: boolean;
  onEnter: () => void;
  onClick: () => void;
}) {
  const sig = toolSignatures[tool.path];
  return (
    <Link
      to={tool.path}
      id={tool.name.replace(/\s+/g, '-').toLowerCase()}
      data-active={active}
      onMouseEnter={onEnter}
      onClick={onClick}
      aria-label={describe(tool.name, sig)}
      className="tool-row scroll-below-header"
    >
      <span className="tool-row-name">{tool.name}</span>
      {sig && <Signature sig={sig} />}
    </Link>
  );
}

function Home() {
  const { searchQuery, setSearchQuery, updateSearchResults, focusSearch } =
    useOutletContext<{
      searchQuery: string;
      setSearchQuery: (value: string) => void;
      updateSearchResults: (hasResults: boolean) => void;
      focusSearch: () => void;
    }>();

  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const movedByKey = useRef(false);

  useEffect(() => {
    document.title = 'XUtil | Developer Tools';
  }, []);

  // Coming back from a tool on mobile, return to where you were in the list.
  useEffect(() => {
    let toolName: string | null = null;
    try {
      toolName = sessionStorage.getItem('lastClickedTool');
    } catch {
      return;
    }
    if (!toolName || window.innerWidth >= 768) return;

    const el = document.getElementById(
      toolName.replace(/\s+/g, '-').toLowerCase()
    );
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    try {
      sessionStorage.removeItem('lastClickedTool');
    } catch {
      // Nothing to clean up if storage is unavailable.
    }
  }, []);

  const searchIndex = useMemo(
    () =>
      categories.flatMap((group) =>
        group.items.map((item) => {
          const sig = toolSignatures[item.path];
          return {
            ...item,
            groupTitle: group.title,
            searchText: sig ? `${sig.in ?? ''} ${sig.out}` : '',
          };
        })
      ),
    []
  );

  const fuse = useMemo(() => new Fuse(searchIndex, fuseOptions), [searchIndex]);

  const { visible, matches } = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) {
      return { visible: categories, matches: null as Tool[] | null };
    }

    const found = fuse.search(query).map((r) => r.item);
    const byGroup = new Map<string, Tool[]>();
    found.forEach((item) => {
      const list = byGroup.get(item.groupTitle) ?? [];
      list.push({ name: item.name, path: item.path });
      byGroup.set(item.groupTitle, list);
    });

    const groups = categories
      .filter((c) => byGroup.has(c.title))
      .map((c) => ({ ...c, items: byGroup.get(c.title) as Tool[] }));

    return { visible: groups, matches: found };
  }, [searchQuery, fuse]);

  const isSearching = searchQuery.trim().length > 0;
  const flat = useMemo(() => visible.flatMap((c) => c.items), [visible]);
  const isEmpty = isSearching && flat.length === 0;

  useEffect(() => {
    updateSearchResults(!isEmpty);
  }, [isEmpty, updateSearchResults]);

  useEffect(() => {
    setActiveIndex(0);
  }, [searchQuery]);

  // Arrow keys walk the results and Enter opens one, so a search can be
  // completed without ever reaching for the mouse.
  useEffect(() => {
    if (!isSearching) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchQuery('');
        focusSearch();
        return;
      }
      if (flat.length === 0) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        movedByKey.current = true;
        setActiveIndex((i) => {
          const next = e.key === 'ArrowDown' ? i + 1 : i - 1;
          return (next + flat.length) % flat.length;
        });
      } else if (e.key === 'Enter') {
        const target = flat[activeIndex];
        if (target) {
          e.preventDefault();
          navigate(target.path);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSearching, flat, activeIndex, navigate, setSearchQuery, focusSearch]);

  // Keep the highlighted row on screen while arrowing.
  useEffect(() => {
    if (!isSearching || !movedByKey.current) return;
    movedByKey.current = false;
    listRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, isSearching]);

  const rememberTool = useCallback((name: string) => {
    try {
      sessionStorage.setItem('lastClickedTool', name);
    } catch {
      // Non-essential.
    }
  }, []);

  let cursor = -1;

  return (
    <>
      <PageSEO
        title="XUtil | Developer Tools"
        description={seoDescriptions.home?.seo ?? 'Fast, private developer tools.'}
      />

      <div className={isSearching ? 'py-5' : 'py-8 sm:py-10'}>
        {!isSearching && (
          <>
            <p className="label">Developer utilities</p>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
              {TOTAL_TOOLS} tools. Nothing you type leaves this tab.
            </h1>
            <p className="mt-2 text-sm text-dim max-w-xl">
              Every tool runs in your browser. Search above, or press{' '}
              <kbd className="font-mono text-xs text-ink">⌘K</kbd> from
              anywhere.
            </p>
          </>
        )}
      </div>

      {!isSearching && <FrequentlyUsedTools />}

      {isEmpty ? (
        <div className="py-16 text-center">
          <p className="font-mono text-sm text-faint">
            No tool matches “{searchQuery}”.
          </p>
          <p className="mt-3 text-sm text-dim">
            Try a shorter word, or the format you want — like{' '}
            <span className="font-mono text-source">base64</span> or{' '}
            <span className="font-mono text-result">cron</span>.
          </p>
          <a
            href="https://github.com/RohitPModani/xutil/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="button-quiet mt-6"
          >
            Request this tool
          </a>
        </div>
      ) : (
        <div ref={listRef} className="space-y-10 pb-4">
          {isSearching && (
            <p className="label" role="status" aria-live="polite">
              {matches?.length} {matches?.length === 1 ? 'match' : 'matches'}
              <span className="ml-2 normal-case tracking-normal text-faint">
                ↑↓ to move · ↵ to open · esc to clear
              </span>
            </p>
          )}

          {visible.map((category) => (
            <section key={category.title}>
              <div className="flex items-baseline justify-between gap-4 pb-2 mb-2 border-b border-line">
                <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-ink">
                  {category.title}
                </h2>
                <span className="font-mono text-xs text-faint tabular-nums shrink-0">
                  {category.items.length}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-x-10 xl:gap-x-14">
                {category.items.map((tool) => {
                  cursor += 1;
                  return (
                    <ToolRow
                      key={tool.path}
                      tool={tool}
                      active={isSearching && cursor === activeIndex}
                      onEnter={((index) => () =>
                        isSearching && setActiveIndex(index))(cursor)}
                      onClick={() => rememberTool(tool.name)}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

export default Home;
