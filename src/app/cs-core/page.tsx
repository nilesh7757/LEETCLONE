"use client";

import Link from "next/link";
import { BookOpen, Monitor, Database, Network, Box, PlayCircle, Search, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CS_DOMAINS = [
  {
    id: "os",
    title: "Operating Systems",
    icon: <Monitor className="w-6 h-6 text-blue-500" />,
    description: "Learn how the machine breathes. Processes, Threads, Memory, and Concurrency.",
    resources: [
      { name: "Gate Smashers OS Playlist", url: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p", type: "video" },
      { name: "OSTEP Book (Skim for details)", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/", type: "book" }
    ],
    topics: [
      { id: "process-vs-thread", title: "Process vs Thread" },
      { id: "deadlocks", title: "Deadlocks & Bankers Algorithm" },
      { id: "virtual-memory", title: "Virtual Memory & Paging" },
      { id: "cpu-scheduling", title: "CPU Scheduling Algorithms" }
    ]
  },
  {
    id: "dbms",
    title: "Database Management Systems",
    icon: <Database className="w-6 h-6 text-green-500" />,
    description: "Store, retrieve, and safeguard data. ACID, Normalization, and Transactions.",
    resources: [
      { name: "Gate Smashers DBMS Playlist", url: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y", type: "video" }
    ],
    topics: [
      { id: "acid-properties", title: "ACID Properties" },
      { id: "normalization", title: "Normalization (1NF to BCNF)" },
      { id: "indexing-b-trees", title: "Indexing & B/B+ Trees" },
      { id: "transaction-isolation", title: "Transaction Isolation Levels" }
    ]
  },
  {
    id: "cn",
    title: "Computer Networks",
    icon: <Network className="w-6 h-6 text-purple-500" />,
    description: "How the world connects. OSI, TCP/IP, and Network Protocols.",
    resources: [
      { name: "Gate Smashers CN Playlist", url: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_", type: "video" }
    ],
    topics: [
      { id: "osi-model", title: "OSI vs TCP/IP Model" },
      { id: "tcp-vs-udp", title: "TCP vs UDP" },
      { id: "dns-dhcp", title: "DNS and DHCP" },
      { id: "routing-protocols", title: "Routing Protocols (OSPF, BGP)" }
    ]
  },
  {
    id: "oops",
    title: "Object-Oriented Programming",
    icon: <Box className="w-6 h-6 text-orange-500" />,
    description: "Structure your code perfectly. Encapsulation, Polymorphism, and Inheritance.",
    resources: [
      { name: "CodeBeauty OOPS", url: "https://www.youtube.com/watch?v=pTB0EiLXUC8", type: "video" }
    ],
    topics: [
      { id: "polymorphism", title: "Polymorphism (Compile vs Run time)" },
      { id: "abstraction", title: "Abstraction vs Encapsulation" },
      { id: "inheritance", title: "Inheritance Types & Diamond Problem" },
      { id: "solid-principles", title: "SOLID Principles" }
    ]
  }
];

export default function CsCoreDashboard() {
  const [customTopic, setCustomTopic] = useState("");
  const [isRecommending, setIsRecommending] = useState(false);
  const router = useRouter();

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;
    const slug = customTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    router.push(`/cs-core/custom-${slug}?title=${encodeURIComponent(customTopic.trim())}`);
  };

  const handleRecommend = async () => {
    setIsRecommending(true);
    try {
      const res = await fetch("/api/cs-core/recommend", { method: "POST" });
      const data = await res.json();
      if (data.topic) {
        const slug = data.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        router.push(`/cs-core/custom-${slug}?title=${encodeURIComponent(data.topic)}`);
      }
    } catch (err) {
      console.error(err);
      setIsRecommending(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="space-y-6">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
            CS Core Interactive Labs
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Master OS, DBMS, CN, and OOPS using the Feynman Technique. 
            Review the top recommended resources, then step into the Interactive Labs where our AI will relentlessly grill your understanding to guarantee that 10+ LPA package.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center max-w-2xl pt-4">
            <form onSubmit={handleCustomSubmit} className="relative flex-1 w-full group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              </div>
              <input 
                type="text" 
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Or enter ANY custom topic (e.g. 'Kafka')..." 
                className="w-full pl-12 pr-16 py-4 bg-gray-900/50 border border-gray-800 focus:border-purple-500/50 rounded-2xl text-white outline-none transition-all shadow-inner focus:ring-4 focus:ring-purple-500/10"
              />
              <button 
                type="submit"
                disabled={!customTopic.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-purple-600/20 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <button 
              onClick={handleRecommend}
              disabled={isRecommending}
              className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/40 hover:to-blue-600/40 border border-purple-500/30 rounded-2xl text-purple-300 font-bold transition-all shadow-lg whitespace-nowrap"
            >
              {isRecommending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {isRecommending ? "Scanning..." : "Suggest Topic"}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CS_DOMAINS.map((domain) => (
            <div key={domain.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex flex-col space-y-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-800 rounded-xl">
                  {domain.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{domain.title}</h2>
                  <p className="text-sm text-gray-400">{domain.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider">Top Resources</h3>
                <div className="flex flex-col space-y-2">
                  {domain.resources.map((res, idx) => (
                    <a 
                      key={idx} 
                      href={res.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white hover:underline bg-gray-800/50 p-2 rounded-lg transition-colors"
                    >
                      {res.type === 'video' ? <PlayCircle className="w-4 h-4 text-pink-500" /> : <BookOpen className="w-4 h-4 text-blue-400" />}
                      <span>{res.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="space-y-3 flex-1">
                <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider">Interactive Labs (Feynman Grilling)</h3>
                <div className="grid grid-cols-1 gap-2">
                  {domain.topics.map((topic) => (
                    <Link 
                      key={topic.id} 
                      href={`/cs-core/${topic.id}?title=${encodeURIComponent(topic.title)}`}
                    >
                      <div className="flex items-center justify-between p-3 bg-gray-800/80 hover:bg-purple-900/30 border border-transparent hover:border-purple-500/50 rounded-xl cursor-pointer transition-all group">
                        <span className="text-sm font-medium text-gray-200 group-hover:text-purple-300">
                          {topic.title}
                        </span>
                        <span className="text-xs font-bold text-purple-500 bg-purple-500/10 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                          Start Lab ⚡
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
