import { PrismaClient, ProblemType, ResourceType } from "@prisma/client";

const prisma = new PrismaClient();

const problemData = {
  title: "Accounts Merge",
  slug: "accounts-merge",
  difficulty: "Medium",
  category: "Graphs",
  pattern: "Disjoint Set Union",
  description: `
<h1>Accounts Merge</h1>
<p>Given a list of accounts where each element <code>accounts[i]</code> is a list of strings, where the first element is a name, and the rest of the elements are emails representing that account.</p>

<p>Now, we would like to merge these accounts. Two accounts definitely belong to the same person if there is some common email to both accounts. Note that even if two accounts have the same name, they may belong to different people as people could have the same name. A person can have any number of accounts initially, but all of their accounts definitely have the same name.</p>

<p>After merging the accounts, return the accounts in the following format: the first element of each account is the name, and the rest of the elements are emails in <strong>sorted order</strong> (lexicographically). The accounts themselves should be sorted lexicographically by name. If the names are equal, sort the accounts lexicographically by their first sorted email.</p>

<h2>Input Format</h2>
<ul>
  <li>The first line contains a single integer <code>n</code> representing the number of accounts.</li>
  <li>The next <code>n</code> lines each describe an account. Each line starts with a string representing the account name, followed by an integer <code>m</code> (the number of emails), followed by <code>m</code> space-separated email strings.</li>
</ul>

<h2>Output Format</h2>
<ul>
  <li>Print each merged account on a new line. The line must consist of the name, followed by the count of its unique emails, followed by the space-separated sorted emails.</li>
</ul>

<h2>Constraints:</h2>
<ul>
  <li><code>1 &le; n &le; 1000</code></li>
  <li><code>1 &le; m &le; 10</code></li>
  <li><code>1 &le; accounts[i][j].length &le; 30</code></li>
  <li>Names consist of only English letters.</li>
</ul>
  `.trim(),
  testSets: [
    {
      input: "4\nJohn 2 johnsmith@mail.com john_newyork@mail.com\nJohn 2 johnsmith@mail.com john00@mail.com\nMary 1 mary@mail.com\nJohn 1 johnnybravo@mail.com",
      expectedOutput: "John 3 john00@mail.com john_newyork@mail.com johnsmith@mail.com\nJohn 1 johnnybravo@mail.com\nMary 1 mary@mail.com",
      isExample: true
    },
    {
      input: "3\nGabe 3 gabe1@mail.com gabe2@mail.com gabe3@mail.com\nGabe 2 gabe2@mail.com gabe4@mail.com\nGabe 1 gabe4@mail.com",
      expectedOutput: "Gabe 4 gabe1@mail.com gabe2@mail.com gabe3@mail.com gabe4@mail.com",
      isExample: true
    },
    {
      input: "2\nAlex 1 alex1@mail.com\nAlex 1 alex2@mail.com",
      expectedOutput: "Alex 1 alex1@mail.com\nAlex 1 alex2@mail.com",
      isExample: false
    },
    {
      input: "5\nKevin 2 kevin@mail.com kev@mail.com\nKev 1 kev_temp@mail.com\nKevin 1 kevin@mail.com\nBob 1 bob@mail.com\nBob 1 bob_work@mail.com",
      expectedOutput: "Bob 1 bob@mail.com\nBob 1 bob_work@mail.com\nKev 1 kev_temp@mail.com\nKevin 2 kev@mail.com kevin@mail.com",
      isExample: false
    }
  ],
  referenceSolution: `
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>
#include <set>

using namespace std;

class DSU {
public:
    vector<int> parent;
    DSU(int n) {
        parent.resize(n);
        for(int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int i) {
        if(parent[i] == i) return i;
        return parent[i] = find(parent[i]);
    }
    void union_sets(int i, int j) {
        int root_i = find(i);
        int root_j = find(j);
        if(root_i != root_j) {
            parent[root_i] = root_j;
        }
    }
};

struct Account {
    string name;
    vector<string> emails;
};

bool compareAccounts(const Account& a, const Account& b) {
    if (a.name != b.name) return a.name < b.name;
    if (a.emails.empty()) return true;
    if (b.emails.empty()) return false;
    return a.emails[0] < b.emails[0];
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (cin >> n) {
        vector<string> names(n);
        unordered_map<string, int> emailToId;
        DSU dsu(n);

        for (int i = 0; i < n; i++) {
            cin >> names[i];
            int m;
            cin >> m;
            for (int j = 0; j < m; j++) {
                string email;
                cin >> email;
                if (emailToId.find(email) == emailToId.end()) {
                    emailToId[email] = i;
                } else {
                    dsu.union_sets(i, emailToId[email]);
                }
            }
        }

        unordered_map<int, set<string>> mergedEmails;
        for (auto const& [email, id] : emailToId) {
            int root = dsu.find(id);
            mergedEmails[root].insert(email);
        }

        vector<Account> result;
        for (auto const& [root, emailSet] : mergedEmails) {
            Account acc;
            acc.name = names[root];
            acc.emails = vector<string>(emailSet.begin(), emailSet.end());
            result.push_back(acc);
        }

        sort(result.begin(), result.end(), compareAccounts);

        for (const auto& acc : result) {
            cout << acc.name << " " << acc.emails.size();
            for (const auto& email : acc.emails) {
                cout << " " << email;
            }
            cout << "\n";
        }
    }
    return 0;
}
  `.trim(),
  editorial: `This problem can be modeled as finding connected components in a graph where each account represents a node, and an edge exists between two nodes if they share at least one email. Disjoint Set Union (DSU) is highly suited to merge these accounts efficiently.

### Algorithm
1. **Map Emails to Account IDs:** Iterate through all accounts. For each email, if we have never seen it before, map it to the current account's index. If we have seen it before, union the current account index with the index where the email was first seen.
2. **Find Roots and Group Emails:** Create a map grouping emails under their respective component's root ID. 
3. **Format & Sort Output:** For each root, collect all grouped emails, sort them lexicographically, and associate them with the account name. Finally, sort the accounts lexicographically by name and tie-break by their first email to guarantee a deterministic output.`,
  hints: [
    "Two accounts should be merged if they share at least one common email. Can we model this grouping using Disjoint Set Union (DSU)?",
    "Create a map from each unique email to the index of the first account containing it. If you encounter an email that is already mapped, union the current account index with the mapped index.",
    "After unioning all elements, group all emails by their representative parent index, sort the emails lexicographically, and sort the final accounts list deterministically."
  ],
  companies: ["Google", "Amazon", "Flexport"]
};

async function main() {
  console.log("📚 Upserting Learning Resources for Accounts Merge...");

  const res1Id = "striver-accounts-merge";
  const res1 = await prisma.learningResource.upsert({
    where: { id: res1Id },
    update: {
      title: "Accounts Merge using DSU",
      url: "https://takeuforward.org/data-structure/accounts-merge-dsu-g-50/",
      type: ResourceType.WEBSITE,
      topic: "Graphs",
      creator: "Striver (takeUforward)",
      description: "Step-by-step guide explaining how to merge accounts using the Disjoint Set Union (DSU) data structure.",
      isPublic: true,
    },
    create: {
      id: res1Id,
      title: "Accounts Merge using DSU",
      url: "https://takeuforward.org/data-structure/accounts-merge-dsu-g-50/",
      type: ResourceType.WEBSITE,
      topic: "Graphs",
      creator: "Striver (takeUforward)",
      description: "Step-by-step guide explaining how to merge accounts using the Disjoint Set Union (DSU) data structure.",
      isPublic: true,
    }
  });
  console.log("   ✅ Striver resource ready.");

  const res2Id = "neetcode-accounts-merge";
  const res2 = await prisma.learningResource.upsert({
    where: { id: res2Id },
    update: {
      title: "Accounts Merge - LeetCode 721 - Python",
      url: "https://www.youtube.com/watch?v=FMwpt_aQHCw",
      type: ResourceType.VIDEO,
      topic: "Graphs",
      creator: "NeetCode",
      description: "A detailed video explanation of the Accounts Merge problem using DSU and Graph traversal.",
      isPublic: true,
    },
    create: {
      id: res2Id,
      title: "Accounts Merge - LeetCode 721 - Python",
      url: "https://www.youtube.com/watch?v=FMwpt_aQHCw",
      type: ResourceType.VIDEO,
      topic: "Graphs",
      creator: "NeetCode",
      description: "A detailed video explanation of the Accounts Merge problem using DSU and Graph traversal.",
      isPublic: true,
    }
  });
  console.log("   ✅ NeetCode resource ready.");

  console.log("📝 Upserting Accounts Merge problem...");
  const created = await prisma.problem.upsert({
    where: { slug: problemData.slug },
    update: {
      title: problemData.title,
      difficulty: problemData.difficulty,
      category: problemData.category,
      pattern: problemData.pattern,
      description: problemData.description,
      testSets: problemData.testSets,
      referenceSolution: problemData.referenceSolution,
      editorial: problemData.editorial,
      hints: problemData.hints,
      companies: problemData.companies,
      isPublic: true,
      isVerified: true,
      source: "SYSTEM",
      resources: {
        connect: [
          { id: res1.id },
          { id: res2.id }
        ]
      }
    },
    create: {
      title: problemData.title,
      slug: problemData.slug,
      difficulty: problemData.difficulty,
      category: problemData.category,
      pattern: problemData.pattern,
      description: problemData.description,
      testSets: problemData.testSets,
      referenceSolution: problemData.referenceSolution,
      editorial: problemData.editorial,
      hints: problemData.hints,
      companies: problemData.companies,
      isPublic: true,
      isVerified: true,
      source: "SYSTEM",
      resources: {
        connect: [
          { id: res1.id },
          { id: res2.id }
        ]
      }
    }
  });

  console.log(`🎉 Seeded successfully! Problem ID: ${created.id}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
