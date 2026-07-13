export const metadata = {
  title: "Terms of Service | LogiQuest",
  description: "Read the terms and conditions for using the LogiQuest platform.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-[var(--foreground)]">
      <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-6">Terms of Service</h1>
      <div className="space-y-6 text-[#a1a1aa] leading-relaxed text-sm">
        <p>
          Last updated: July 13, 2026.
        </p>
        <p>
          Welcome to LogiQuest. By accessing or using our interactive algorithmic workspace, you agree to comply with and be bound by the following terms.
        </p>
        
        <h2 className="text-xl font-bold text-white uppercase tracking-wide mt-8">1. User Accounts</h2>
        <p>
          When you create an account, you are responsible for maintaining the confidentiality of your credentials and credentials actions. We reserve the right to ban or restrict accounts that violate fair play (e.g. DDOS attacks, malicious scripts targeting compiler sandboxes, or leaderboard manipulation).
        </p>

        <h2 className="text-xl font-bold text-white uppercase tracking-wide mt-8">2. Code Sandboxes & Usage</h2>
        <p>
          LogiQuest provides access to online compiler execution workspaces powered by Judge0. You agree not to attempt to breach, inspect, or compromise the execution sandbox environments, nor execute code designed to disrupt the host server infrastructure.
        </p>

        <h2 className="text-xl font-bold text-white uppercase tracking-wide mt-8">3. Disclaimer of Warranties</h2>
        <p>
          This platform is provided &quot;as is&quot; for educational and portfolio demonstration purposes. While we strive for high uptime and accurate compiler execution, we make no guarantees regarding uninterrupted service or loss of coding progress data.
        </p>

        <h2 className="text-xl font-bold text-white uppercase tracking-wide mt-8">4. Changes to Terms</h2>
        <p>
          We may update these terms occasionally to reflect changes in security rules or platform features. Continued usage of the workspace indicates acceptance of the updated terms.
        </p>
      </div>
    </div>
  );
}
