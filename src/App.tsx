import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';

function App() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-600">Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
