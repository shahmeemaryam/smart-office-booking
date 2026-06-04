export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* stacked on mobile, 3 columns on desktop */}
        <div className="flex flex-col md:flex-row md:justify-between gap-6">
          <div>
            <h3 className="text-white font-bold text-lg mb-2">SmartOffice</h3>
            <p className="text-sm text-gray-400">
              Manage your workspace bookings with ease.
            </p>
          </div>
          
        </div>
        <div className="border-t border-gray-700 mt-6 pt-4 text-center text-xs text-gray-500">
          © 2025 SmartOffice. All rights reserved.
        </div>
      </div>
    </footer>
  );
}