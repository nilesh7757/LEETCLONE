// src/lib/starterCode.ts

export const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "csharp", label: "C#" },
    { value: "go", label: "Go" },
    { value: "ruby", label: "Ruby" },
    { value: "swift", label: "Swift" },
    { value: "rust", label: "Rust" },
    { value: "php", label: "PHP" },
];

export const getStarterCode = (language: string) => {
    const templates: Record<string, string> = {
        javascript: `// Read input (example: single line, space-separated numbers)
// const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(' ').map(Number);
// console.log(input);

// Write your solution below
`,
        python: `import sys

# Read input (example: single line, space-separated numbers)
# input = sys.stdin.readline
# line = list(map(int, input().split()))
# print(line)

# Write your solution below
`,
        java: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        // Read input (example: single line, space-separated numbers)
        // String[] line = br.readLine().split(" ");
        // int[] numbers = new int[line.length];
        // for (int i = 0; i < line.length; i++) {
        //     numbers[i] = Integer.parseInt(line[i]);
        // }
        // System.out.println(Arrays.toString(numbers));

        // Write your solution below

        br.close();
    }
}
`,
        cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Write your solution below

    return 0;
}
`,
        csharp: `using System;
using System.Collections.Generic;
using System.Linq;

public class Program
{
    public static void Main(string[] args)
    {
        // Read input
        // string line = Console.ReadLine();
        // int[] nums = line.Split(' ').Select(int.Parse).ToArray();
        // Console.WriteLine(string.Join(" ", nums));

        // Write your solution below
    }
}
`,
        go: `package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
    // "strconv"
)

func main() {
    // scanner := bufio.NewScanner(os.Stdin)
    // scanner.Scan()
    // line := scanner.Text()
    // parts := strings.Fields(line)
    // fmt.Println(parts)

    // Write your solution below
}
`,
        ruby: `# Read input
# input = gets.chomp.split.map(&:to_i)
# puts input.join(" ")

# Write your solution below
`,
        swift: `import Foundation

// Read input
// if let line = readLine() {
//     let nums = line.split(separator: " ").compactMap { Int($0) }
//     print(nums)
// }

// Write your solution below
`,
        rust: `use std::io::{self, BufRead};

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();

    // if let Some(Ok(line)) = lines.next() {
    //     let nums: Vec<i32> = line.split_whitespace()
    //         .map(|s| s.parse().unwrap())
    //         .collect();
    //     println!("{:?}", nums);
    // }

    // Write your solution below
}
`,
        php: `<?php
// $input = fgets(STDIN);
// $nums = array_map('intval', explode(' ', trim($input)));
// echo implode(" ", $nums);

// Write your solution below
`
    };

    return templates[language] || "";
};
