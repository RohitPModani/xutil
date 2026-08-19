import { Link } from "react-router-dom";
import BackToHome from "../components/BackToHome";
import { PageSEO } from "../components/PageSEO";

function NotFound() {
  return (
    <>
      <PageSEO
        title="Page not found | XUtil"
        description="That page does not exist. Browse the full list of developer tools."
      />
      <div className="py-6 sm:py-8">
        <BackToHome />

        <div className="py-20 text-center">
          <p className="label">Error 404</p>
          <h1 className="mt-3 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
            That page does not exist.
          </h1>
          <p className="mt-3 text-sm text-dim">
            The tool may have moved, or the address has a typo in it.
          </p>
          <Link to="/" className="button-primary mt-8">
            Browse all tools
          </Link>
        </div>
      </div>
    </>
  );
}

export default NotFound;
