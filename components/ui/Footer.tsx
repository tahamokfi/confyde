export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Confyde. All rights reserved.
        </div>
        <div className="text-sm text-gray-500">
          <a href="/privacy" className="hover:text-blue-600 mr-4">Privacy Policy</a>
          <a href="/terms" className="hover:text-blue-600">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
} 