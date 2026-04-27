import {
  Footer,
  FooterCopyright,
  FooterDivider,
} from 'flowbite-react'

export default function SiteFooter() {
  return (
    <Footer className="mt-auto border-t border-[var(--line)] bg-[#111b2f] text-[var(--ink-soft)]">
      <div className="w-full px-6 py-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--ink)]">Software Club</h2>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Building real-world projects with MERN stack, teamwork, and modern engineering
              practices.
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-medium text-[var(--ink)]">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="transition hover:text-[var(--ink)]">softwareclub@campus.org</li>
              <li className="transition hover:text-[var(--ink)]">Room 4-101, Engineering Hall</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-medium text-[var(--ink)]">Sessions</h3>
            <ul className="space-y-2 text-sm">
              <li className="transition hover:text-[var(--ink)]">Wed - 5:00 PM</li>
              <li className="transition hover:text-[var(--ink)]">Sat - 10:00 AM</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-medium text-[var(--ink)]">Community</h3>
            <ul className="space-y-2 text-sm">
              <li className="cursor-pointer transition hover:text-[var(--ink)]">GitHub</li>
              <li className="cursor-pointer transition hover:text-[var(--ink)]">Discord</li>
              <li className="cursor-pointer transition hover:text-[var(--ink)]">Telegram</li>
            </ul>
          </div>
        </div>

        <FooterDivider className="border-[var(--line)]" />

        <div className="flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
          <FooterCopyright by="Software Club" year={2026} className="text-[var(--muted)]" />
          <p className="text-[var(--muted)]">Made with love using MERN Stack</p>
        </div>
      </div>
    </Footer>
  )
}
