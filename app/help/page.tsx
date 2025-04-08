'use client';

export default function Help() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Help & Support</h1>
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="p-4 border border-gray-200 rounded-md bg-white">
          <p className="text-center text-gray-500">Help and support functionality coming soon</p>
        </div>
      </main>
    </div>
  );
} 