import { useEffect, useState } from "react";
import BackToHome from "../../components/BackToHome";
import ErrorBox from "../../components/ErrorBox";
import LoadingButton from "../../components/LoadingButton";
import SectionCard from "../../components/SectionCard";
import CopyButton from "../../components/CopyButton";
import AutoTextarea from "../../hooks/useAutoSizeTextArea";
import ClearButton from "../../components/ClearButton";
import SEODescription from "../../components/SEODescription";
import { PageSEO } from "../../components/PageSEO";
import BuyMeCoffee from "../../components/BuyMeCoffee";
import { updateToolUsage } from "../../utils/toolUsage";
import seoDescriptions from "../../data/seoDescriptions";

function RegexTester() {
    const seo = seoDescriptions.regexTester;
    const [regexInput, setRegexInput] = useState("");
    const [testString, setTestString] = useState("");
    const [isValidRegex, setIsValidRegex] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [matches, setMatches] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        updateToolUsage("regex");
    }, []);

    const handleTestRegex = () => {
        setIsLoading(true);
        setError(null);
        setMatches([]);
        try {
            const regex = new RegExp(regexInput, 'g');
            const matchResults = Array.from(testString.matchAll(regex)).map((m) => m[0]);
            if (matchResults.length > 0) {
                setMatches(matchResults);
                setIsValidRegex(true);
            } else {
                setIsValidRegex(false);
            }
        } catch (err: any) {
            setError("Invalid Regex: " + err.message);
            setIsValidRegex(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setRegexInput("");
        setTestString("");
        setIsValidRegex(null);
        setError(null);
        setMatches([]);
    };

    return (
        <>
            <PageSEO title={seo.seo} description={seo.body} />
            <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 section">
                <div className="flex justify-between items-center mb-4">
                    <BackToHome />
                    <BuyMeCoffee variant="inline" />
                </div>
                <h2 className="text-3xl font-bold mb-6">{seo.title}</h2>

                <SectionCard>
                    <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">Regex Tester</h3>
                        <ClearButton onClick={handleClear} disabled={!regexInput && !testString} />
                    </div>
                    <div className="flex flex-col gap-2 mb-4">
                        <label className="form-label mb-0">Regex:</label>
                        <AutoTextarea
                        className="input-field w-full"
                        placeholder="e.g. [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                        value={regexInput}
                        onChange={(e) => setRegexInput(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2 mb-4">
                        <label className="form-label mb-0">Test String:</label>
                        <AutoTextarea
                        className="input-field w-full"
                        placeholder="e.g. user@example.com, test@domain.org"
                        value={testString}
                        onChange={(e) => setTestString(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-row items-center justify-between mb-4">
                        <LoadingButton isLoading={isLoading} onClick={handleTestRegex}>Test Regex</LoadingButton>
                    </div>
                    <div className="result-box mt-1">
                        <div className="flex justify-between items-center">
                            <label className="form-label sm:text-base">Matches</label>
                            {matches.length > 0 && (
                                <CopyButton text={matches.join(", ")} className="mb-1" />
                            )}
                        </div>
                        {isValidRegex && matches.length > 0 && (
                            <div className="scrollbox mt-2">
                            <div className="inner-result">
                                <ul className="list-disc pl-5">
                                    {matches.map((match, index) => (
                                        <li key={index}>{match}</li>
                                    ))}
                                </ul>
                            </div>
                            </div>
                        )}
                    </div>
                    {error && (
                    <div aria-live="polite">
                        <ErrorBox message={error} />
                    </div>
                    )}
                    </div>
                </SectionCard>
                <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
            </div>
        </>
    );
}

export default RegexTester;