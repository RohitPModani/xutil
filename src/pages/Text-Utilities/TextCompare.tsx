import { useEffect, useState } from 'react';
import BackToHome from '../../components/BackToHome';
import ClearButton from '../../components/ClearButton';
import CopyButton from '../../components/CopyButton';
import SectionCard from '../../components/SectionCard';
import AutoTextarea from '../../hooks/useAutoSizeTextArea';
import SEODescription from '../../components/SEODescription';
import { PageSEO } from '../../components/PageSEO';
import seoDescriptions from '../../data/seoDescriptions';
import * as Diff from 'diff';
import LoadingButton from '../../components/LoadingButton';
import { updateToolUsage } from '../../utils/toolUsage';

interface DiffLine {
  type: 'added' | 'removed' | 'common';
  text: string; // Raw text for common lines or fallback
  html?: string; // HTML for lines with word-level highlighting
  lineNumber: number;
}

const TextCompare: React.FC = () => {
  const seo = seoDescriptions.textCompare;
  const [text1, setText1] = useState<string>('');
  const [text2, setText2] = useState<string>('');
  const [diffLines, setDiffLines] = useState<{ left: DiffLine; right: DiffLine }[]>([]);
  const [removals, setRemovals] = useState<number>(0);
  const [additions, setAdditions] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    updateToolUsage('text_compare');
  }, []);

  const compareTexts = (): void => {
  
    if (!text1.trim() || !text2.trim()) {
      setDiffLines([
        {
          left: { type: 'common', text: 'Please enter text in both fields.', lineNumber: 1 },
          right: { type: 'common', text: 'Please enter text in both fields.', lineNumber: 1 },
        },
      ]);
      setRemovals(0);
      setAdditions(0);
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Split texts into lines while preserving all whitespace and empty lines
      const lines1 = text1.split('\n');
      const lines2 = text2.split('\n');
      
      // Remove the last empty line if it exists (artifact of split)
      if (lines1[lines1.length - 1] === '') lines1.pop();
      if (lines2[lines2.length - 1] === '') lines2.pop();
  
      const maxLines = Math.max(lines1.length, lines2.length);
      const lines: { left: DiffLine; right: DiffLine }[] = [];
      let removalCount = 0;
      let additionCount = 0;
  
      for (let i = 0; i < maxLines; i++) {
        const line1 = lines1[i] ?? '';
        const line2 = lines2[i] ?? '';
  
        if (line1 === line2) {
          // Lines are identical
          lines.push({
            left: { type: 'common', text: line1, html: line1, lineNumber: i + 1 },
            right: { type: 'common', text: line2, html: line2, lineNumber: i + 1 },
          });
        } else {
          // Lines are different - do word-level comparison
          const wordDiff = Diff.diffWordsWithSpace(line1, line2);

          const leftHtml = wordDiff
            .map((part) => {
              if (part.removed) {
                return `<span class="bg-red-300 dark:bg-red-400 dark:text-zinc-900 whitespace-pre-wrap">${part.value}</span>`;
              }
              return part.added ? '' : part.value;
            })
            .join('');

          const rightHtml = wordDiff
            .map((part) => {
              if (part.added) {
                return `<span class="bg-green-300 dark:bg-green-400 dark:text-zinc-900 whitespace-pre-wrap">${part.value}</span>`;
              }
              return part.removed ? '' : part.value;
            })
            .join('');
  
          lines.push({
            left: { 
              type: line1 ? 'removed' : 'common', 
              text: line1, 
              html: leftHtml, 
              lineNumber: i + 1 
            },
            right: { 
              type: line2 ? 'added' : 'common', 
              text: line2, 
              html: rightHtml, 
              lineNumber: i + 1 
            },
          });
  
          if (line1 && !line2) removalCount++;
          if (line2 && !line1) additionCount++;
          if (line1 && line2) {
            removalCount += wordDiff.filter(part => part.removed).length;
            additionCount += wordDiff.filter(part => part.added).length;
          }
        }
      }
  
      setDiffLines(lines);
      setRemovals(removalCount);
      setAdditions(additionCount);
    } catch (error) {
      setDiffLines([
        {
          left: { type: 'common', text: 'Error during comparison', lineNumber: 1 },
          right: { type: 'common', text: 'Error during comparison', lineNumber: 1 },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearTexts = (): void => {
    setText1('');
    setText2('');
    setDiffLines([]);
    setRemovals(0);
    setAdditions(0);
    setIsLoading(false);
  };

  const lineCount1 = text1.split('\n').length - (text1.endsWith('\n') ? 0 : 1);
  const lineCount2 = text2.split('\n').length - (text2.endsWith('\n') ? 0 : 1);

  return (
    <>
      <PageSEO title={seo.seo} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-row items-center justify-start gap-3 mb-4">
          <BackToHome />
        </div>
        <h2 className="text-2xl font-bold mb-6">{seo.title}</h2>

        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Text Compare</h3>
            <div className="flex gap-2">
              <LoadingButton onClick={compareTexts} isLoading={isLoading} disabled={!text1 || !text2}>
                Compare
              </LoadingButton>
              <ClearButton onClick={clearTexts} disabled={!text1 && !text2} />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="text1" className="form-label mb-0">
                  Text 1:
                </label>
                <CopyButton text={text1} />
              </div>
              <AutoTextarea
                id="text1"
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                className="input-field"
                placeholder="Enter first text to compare"
              />
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="text2" className="form-label mb-0">
                  Text 2:
                </label>
                <CopyButton text={text2} />
              </div>
              <AutoTextarea
                id="text2"
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                className="input-field"
                placeholder="Enter second text to compare"
              />
            </div>
          </div>
          {diffLines.length > 0 && (
            <div className="space-y-4">
              <label className="form-label mb-0">Differences:</label>
              <div className="flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300 mb-2">
                <div className="flex gap-4">
                  <span className="flex items-center">
                    <span className="w-4 h-4 bg-red-500 rounded-full mr-1"></span>
                    {removals} removal{removals !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center">
                    {lineCount1} line{lineCount1 !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex gap-4">
                  <span className="flex items-center">
                    {lineCount2} line{lineCount2 !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center">
                    <span className="w-4 h-4 bg-green-500 rounded-full mr-1"></span>
                    {additions} addition{additions !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm font-mono">
                  <tbody>
                    {diffLines.map((line, index) => (
                      <tr key={index} className="dark:bg-zinc-800">
                        <td className="w-12 text-right pr-2 border р border-gray-300 dark:border-gray-700">
                          {line.left.lineNumber}
                        </td>
                        <td
                          className={`w-1/2 p-1 text-sm sm:text-base ${
                            line.left.type === 'removed'
                              ? 'bg-red-100 dark:bg-red-200 dark:text-zinc-900'
                              : line.left.type === 'added'
                              ? 'bg-green-100 dark:bg-green-200 dark:text-zinc-900'
                              : ''
                          }`}
                          dangerouslySetInnerHTML={{ __html: line.left.html || line.left.text }}
                        />
                        <td className="w-12 text-right pr-2 border-r border-gray-300 dark:border-gray-700">
                          {line.right.lineNumber}
                        </td>
                        <td
                          className={`w-1/2 p-1 text-sm sm:text-base ${
                            line.right.type === 'added'
                              ? 'bg-green-100 dark:bg-green-200 dark:text-zinc-900'
                              : line.right.type === 'removed'
                              ? 'bg-red-100 dark:bg-red-200 dark:text-zinc-900'
                              : ''
                          }`}
                          dangerouslySetInnerHTML={{ __html: line.right.html || line.right.text }}
                        />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
};

export default TextCompare;