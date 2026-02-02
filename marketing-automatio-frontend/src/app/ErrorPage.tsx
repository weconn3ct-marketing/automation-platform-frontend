import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export const ErrorPage = () => {
  const error = useRouteError();

  let title = "Something went wrong";
  let message = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = error.data?.message ?? "This page could not be loaded.";
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600 mb-8">{message}</p>
        <button
          className="px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold"
          onClick={() => window.location.assign("/")}
        >
          Go home
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
