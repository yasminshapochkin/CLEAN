export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8 text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Application submitted</h1>
        <p className="text-gray-500 text-base">
          Our team is reviewing your application and ID document. You&apos;ll receive
          an email once it&apos;s approved — usually within 1–2 business days.
        </p>
      </div>
    </div>
  );
}
