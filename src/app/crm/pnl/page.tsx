export default function ProfitAndLossDevPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-6">
      {" "}
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 border border-gray-200 text-center">
        {" "}
        <div className="flex justify-center mb-6">
          {" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            {" "}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.69 0 3.715-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />{" "}
          </svg>{" "}
        </div>{" "}
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          {" "}
          Profit &amp; Loss{" "}
        </h1>{" "}
        <p className="text-gray-500 mb-8">
          {" "}
          Esta sección se encuentra actualmente en desarrollo.{" "}
        </p>{" "}
        <div className="space-y-3">
          {" "}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            {" "}
            <div className="w-3/5 h-full bg-gray-800 rounded-full animate-pulse" />{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <footer className="absolute bottom-6 text-gray-400 text-xs">
        {" "}
        © 2025 Diversa CRM — Actualización en progreso{" "}
      </footer>{" "}
    </main>
  );
}
