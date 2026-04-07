import {
  Footer,
  FooterCopyright,
  FooterDivider,
} from "flowbite-react";

export default function SiteFooter() {
  return (
    <Footer className="mt-auto bg-gray-900 text-gray-300">
      <div className="w-full px-6 py-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand */}
          <div>
            <h2 className="text-xl font-semibold text-white">
              💻 Software Club
            </h2>
            <p className="mt-3 text-sm text-gray-400">
              Building real-world projects with MERN stack, teamwork, and
              modern engineering practices.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 text-white font-medium">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-white transition">
                📧 softwareclub@campus.org
              </li>
              <li className="hover:text-white transition">
                📍 Room 4-101, Engineering Hall
              </li>
            </ul>
          </div>

          {/* Sessions */}
          <div>
            <h3 className="mb-3 text-white font-medium">Sessions</h3>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-white transition">
                🗓 Wed — 5:00 PM
              </li>
              <li className="hover:text-white transition">
                🗓 Sat — 10:00 AM
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-3 text-white font-medium">Community</h3>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-white transition cursor-pointer">
                🔗 GitHub
              </li>
              <li className="hover:text-white transition cursor-pointer">
                💬 Discord
              </li>
              <li className="hover:text-white transition cursor-pointer">
                📢 Telegram
              </li>
            </ul>
          </div>
        </div>

        <FooterDivider className=" border-gray-700" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
          <FooterCopyright
            by="Software Club"
            year={2026}
            className="text-gray-400"
          />

          <p className="text-gray-500">
            Made with ❤️ using MERN Stack
          </p>
        </div>
      </div>
    </Footer>
  );
}