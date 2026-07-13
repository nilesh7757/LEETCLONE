#include <iostream>
#include <vector>
#include <unordered_set>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    unordered_set<int> s(nums.begin(), nums.end());
    int longest = 0;

    for (int num : s) {
        // Only start counting if num is the beginning of a sequence
        if (s.find(num - 1) == s.end()) {
            int current = num;
            int streak = 1;
            while (s.find(current + 1) != s.end()) {
                current++;
                streak++;
            }
            longest = max(longest, streak);
        }
    }

    cout << longest << "\n";
    return 0;
}
