import BackToHome from "../components/BackToHome";

function NotFound() {
    return (
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="text-center">
          <BackToHome/>
        </div>
        <div className="p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
          <p className="text-gray-600">Oops! The page you’re looking for doesn’t exist.</p>
          <p> You can raise any new requests on Github under Issues section</p>
        </div>
      </div>
    );
  }
  
  export default NotFound;
  