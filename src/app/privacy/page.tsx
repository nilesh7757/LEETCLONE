export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-[var(--foreground)]">
      <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-6">Privacy Policy</h1>
      <div className="space-y-6 text-[#a1a1aa] leading-relaxed text-sm">
        <p>
          Last updated: July 13, 2026.
        </p>
        <p>
          At LogiQuest, we take privacy and data security seriously. This policy explains what information we collect, how it is used, and how we keep it secure.
        </p>
        <h2 className="text-xl font-bold text-white uppercase tracking-wide mt-8">1. Information We Collect</h2>
        <p>
          We only collect information necessary to provide core features (interactive coding, profile scoring, Streaks, leaderboards, and AI evaluations). This includes:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Account Details:</strong> Display name, email address, password hashes, or Google OAuth profile information when you register.</li>
          <li><strong>Coding Submissions:</strong> Code text, programming language choices, and runtime metrics for code evaluations.</li>
          <li><strong>Activity Logs:</strong> Streak histories, arcade points, and multiplayer match logs.</li>
        </ul>

        <h2 className="text-xl font-bold text-white uppercase tracking-wide mt-8">2. How We Use Information</h2>
        <p>
          Your information is solely used to:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Manage user accounts and session authentication.</li>
          <li>Provide real-time compiler feedback and AI Code Coach insights.</li>
          <li>Calculate rankings on the global developer leaderboard.</li>
        </ul>

        <h2 className="text-xl font-bold text-white uppercase tracking-wide mt-8">3. Data Integrity & Security</h2>
        <p>
          All runtime code execution occurs in highly secured, isolated sandboxes. We do not sell or share your data with external advertisers. Data is encrypted in transit and stored safely in our relational databases.
        </p>
        <p>
          If you have any questions or would like to request data deletion, contact us at <strong>nileshmori7757@gmail.com</strong>.
        </p>
      </div>
    </div>
  );
}
