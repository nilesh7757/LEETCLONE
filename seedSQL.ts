import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sqlProblems = [
  {
    title: "Big Countries",
    slug: "big-countries",
    difficulty: "Easy",
    category: "SQL",
    type: "SQL",
    description: `
      <h2>Problem Statement</h2>
      <p>A country is <strong>big</strong> if it has an area of at least 3 million km² or a population of at least 25 million.</p>
      <p>Write a solution to find the name, population, and area of the big countries.</p>
      <p>Return the result table in any order.</p>
    `,
    initialSchema: "CREATE TABLE World (name VARCHAR(255), continent VARCHAR(255), area INT, population INT, gdp BIGINT);",
    initialData: `
      INSERT INTO World VALUES ('Afghanistan', 'Asia', 652230, 25500100, 20343000000);
      INSERT INTO World VALUES ('Albania', 'Europe', 28748, 2831741, 12960000000);
      INSERT INTO World VALUES ('Algeria', 'Africa', 2381741, 37100000, 188681000000);
      INSERT INTO World VALUES ('Andorra', 'Europe', 468, 78115, 3712000000);
      INSERT INTO World VALUES ('Angola', 'Africa', 1246700, 20609294, 100990000000);
    `,
    referenceSolution: "SELECT name, population, area FROM World WHERE area >= 3000000 OR population >= 25000000;",
    testSets: [
      {
        input: "",
        expectedOutput: "| name | population | area |\n| Afghanistan | 25500100 | 652230 |\n| Algeria | 37100000 | 2381741 |",
        isExample: true
      }
    ]
  },
  {
    title: "Combine Two Tables",
    slug: "combine-two-tables",
    difficulty: "Easy",
    category: "SQL",
    type: "SQL",
    description: `
      <h2>Problem Statement</h2>
      <p>Write a solution to report the first name, last name, city, and state of each person in the <strong>Person</strong> table.</p>
      <p>If the address of a personId is not present in the <strong>Address</strong> table, report null instead.</p>
    `,
    initialSchema: "CREATE TABLE Person (personId INT, firstName VARCHAR(255), lastName VARCHAR(255)); CREATE TABLE Address (addressId INT, personId INT, city VARCHAR(255), state VARCHAR(255));",
    initialData: "INSERT INTO Person VALUES (1, 'Wang', 'Allen'); INSERT INTO Person VALUES (2, 'Alice', 'Bob'); INSERT INTO Address VALUES (1, 2, 'New York City', 'New York');",
    referenceSolution: "SELECT firstName, lastName, city, state FROM Person p LEFT JOIN Address a ON p.personId = a.personId;",
    testSets: [
      {
        input: "",
        expectedOutput: "| firstName | lastName | city | state |\n| Wang | Allen | null | null |\n| Alice | Bob | New York City | New York |",
        isExample: true
      }
    ]
  },
  {
    title: "Employees Earning More Than Their Managers",
    slug: "employees-earning-more-than-managers",
    difficulty: "Easy",
    category: "SQL",
    type: "SQL",
    description: `
      <h2>Problem Statement</h2>
      <p>Write a solution to find the employees who earn more than their managers.</p>
    `,
    initialSchema: "CREATE TABLE Employee (id INT, name VARCHAR(255), salary INT, managerId INT);",
    initialData: "INSERT INTO Employee VALUES (1, 'Joe', 70000, 3); INSERT INTO Employee VALUES (2, 'Henry', 80000, 4); INSERT INTO Employee VALUES (3, 'Sam', 60000, NULL); INSERT INTO Employee VALUES (4, 'Max', 90000, NULL);",
    referenceSolution: "SELECT e1.name AS Employee FROM Employee e1 JOIN Employee e2 ON e1.managerId = e2.id WHERE e1.salary > e2.salary;",
    testSets: [
      {
        input: "",
        expectedOutput: "| Employee |\n| Joe |",
        isExample: true
      }
    ]
  },
  {
    title: "Duplicate Emails",
    slug: "duplicate-emails",
    difficulty: "Easy",
    category: "SQL",
    type: "SQL",
    description: `
      <h2>Problem Statement</h2>
      <p>Write a solution to report all the duplicate emails. Note that it's guaranteed that the email field is not NULL.</p>
    `,
    initialSchema: "CREATE TABLE Person_Email (id INT, email VARCHAR(255));",
    initialData: "INSERT INTO Person_Email VALUES (1, 'a@b.com'); INSERT INTO Person_Email VALUES (2, 'c@d.com'); INSERT INTO Person_Email VALUES (3, 'a@b.com');",
    referenceSolution: "SELECT email FROM Person_Email GROUP BY email HAVING COUNT(email) > 1;",
    testSets: [
      {
        input: "",
        expectedOutput: "| email |\n| a@b.com |",
        isExample: true
      }
    ]
  },
  {
    title: "Customers Who Never Order",
    slug: "customers-who-never-order",
    difficulty: "Easy",
    category: "SQL",
    type: "SQL",
    description: `
      <h2>Problem Statement</h2>
      <p>Write a solution to find all customers who never order anything.</p>
    `,
    initialSchema: "CREATE TABLE Customers (id INT, name VARCHAR(255)); CREATE TABLE Orders (id INT, customerId INT);",
    initialData: "INSERT INTO Customers VALUES (1, 'Joe'); INSERT INTO Customers VALUES (2, 'Henry'); INSERT INTO Customers VALUES (3, 'Sam'); INSERT INTO Customers VALUES (4, 'Max'); INSERT INTO Orders VALUES (1, 3); INSERT INTO Orders VALUES (2, 1);",
    referenceSolution: "SELECT name AS Customers FROM Customers WHERE id NOT IN (SELECT customerId FROM Orders);",
    testSets: [
      {
        input: "",
        expectedOutput: "| Customers |\n| Henry |\n| Max |",
        isExample: true
      }
    ]
  },
  {
    title: "Rising Temperature",
    slug: "rising-temperature",
    difficulty: "Easy",
    category: "SQL",
    type: "SQL",
    description: `
      <h2>Problem Statement</h2>
      <p>Write a solution to find all dates' Id with higher temperatures compared to its previous dates (yesterday).</p>
    `,
    initialSchema: "CREATE TABLE Weather (id INT, recordDate DATE, temperature INT);",
    initialData: "INSERT INTO Weather VALUES (1, '2015-01-01', 10); INSERT INTO Weather VALUES (2, '2015-01-02', 25); INSERT INTO Weather VALUES (3, '2015-01-03', 20); INSERT INTO Weather VALUES (4, '2015-01-04', 30);",
    referenceSolution: "SELECT w1.id FROM Weather w1 JOIN Weather w2 ON w1.recordDate = DATE(w2.recordDate, '+1 day') WHERE w1.temperature > w2.temperature;",
    testSets: [
      {
        input: "",
        expectedOutput: "| id |\n| 2 |\n| 4 |",
        isExample: true
      }
    ]
  },
  {
    title: "Nth Highest Salary",
    slug: "nth-highest-salary",
    difficulty: "Medium",
    category: "SQL",
    type: "SQL",
    description: `
      <h2>Problem Statement</h2>
      <p>Write a solution to find the <strong>n-th</strong> highest salary from the Employee table. If there is no nth highest salary, return null.</p>
      <p>For this problem, assume n = 2.</p>
    `,
    initialSchema: "CREATE TABLE Employee_Salary (id INT, salary INT);",
    initialData: "INSERT INTO Employee_Salary VALUES (1, 100); INSERT INTO Employee_Salary VALUES (2, 200); INSERT INTO Employee_Salary VALUES (3, 300);",
    referenceSolution: "SELECT DISTINCT salary FROM Employee_Salary ORDER BY salary DESC LIMIT 1 OFFSET 1;",
    testSets: [
      {
        input: "",
        expectedOutput: "| salary |\n| 200 |",
        isExample: true
      }
    ]
  },
  {
    title: "Rank Scores",
    slug: "rank-scores",
    difficulty: "Medium",
    category: "SQL",
    type: "SQL",
    description: `
      <h2>Problem Statement</h2>
      <p>Write a solution to find the rank of the scores.</p>
    `,
    initialSchema: "CREATE TABLE Scores (id INT, score DECIMAL(3,2));",
    initialData: "INSERT INTO Scores VALUES (1, 3.50); INSERT INTO Scores VALUES (2, 3.65); INSERT INTO Scores VALUES (3, 4.00); INSERT INTO Scores VALUES (4, 3.85); INSERT INTO Scores VALUES (5, 4.00); INSERT INTO Scores VALUES (6, 3.65);",
    referenceSolution: "SELECT score, DENSE_RANK() OVER(ORDER BY score DESC) as rank FROM Scores;",
    testSets: [
      {
        input: "",
        expectedOutput: "| score | rank |\n| 4.00 | 1 |\n| 4.00 | 1 |\n| 3.85 | 2 |\n| 3.65 | 3 |\n| 3.65 | 3 |\n| 3.50 | 4 |",
        isExample: true
      }
    ]
  },
  {
    title: "Department Highest Salary",
    slug: "department-highest-salary",
    difficulty: "Medium",
    category: "SQL",
    type: "SQL",
    description: `
      <h2>Problem Statement</h2>
      <p>Write a solution to find employees who have the highest salary in each of the departments.</p>
    `,
    initialSchema: "CREATE TABLE Department (id INT, name VARCHAR(255)); CREATE TABLE Employee_Dept (id INT, name VARCHAR(255), salary INT, departmentId INT);",
    initialData: "INSERT INTO Department VALUES (1, 'IT'); INSERT INTO Department VALUES (2, 'Sales'); INSERT INTO Employee_Dept VALUES (1, 'Joe', 70000, 1); INSERT INTO Employee_Dept VALUES (2, 'Jim', 90000, 1); INSERT INTO Employee_Dept VALUES (3, 'Henry', 80000, 2); INSERT INTO Employee_Dept VALUES (4, 'Sam', 60000, 2); INSERT INTO Employee_Dept VALUES (5, 'Max', 90000, 1);",
    referenceSolution: "SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary FROM Employee_Dept e JOIN Department d ON e.departmentId = d.id WHERE (e.departmentId, e.salary) IN (SELECT departmentId, MAX(salary) FROM Employee_Dept GROUP BY departmentId);",
    testSets: [
      {
        input: "",
        expectedOutput: "| Department | Employee | Salary |\n| IT | Jim | 90000 |\n| IT | Max | 90000 |\n| Sales | Henry | 80000 |",
        isExample: true
      }
    ]
  },
  {
    title: "Swap Salary",
    slug: "swap-salary",
    difficulty: "Easy",
    category: "SQL",
    type: "SQL",
    description: `
      <h2>Problem Statement</h2>
      <p>Write a solution to swap all 'f' and 'm' values.</p>
    `,
    initialSchema: "CREATE TABLE Salary (id INT, name VARCHAR(255), sex CHAR(1), salary INT);",
    initialData: "INSERT INTO Salary VALUES (1, 'A', 'm', 2500); INSERT INTO Salary VALUES (2, 'B', 'f', 1500); INSERT INTO Salary VALUES (3, 'C', 'm', 5500); INSERT INTO Salary VALUES (4, 'D', 'f', 500);",
    referenceSolution: "SELECT id, name, CASE WHEN sex = 'm' THEN 'f' ELSE 'm' END AS sex, salary FROM Salary;",
    testSets: [
      {
        input: "",
        expectedOutput: "| id | name | sex | salary |\n| 1 | A | f | 2500 |\n| 2 | B | m | 1500 |\n| 3 | C | f | 5500 |\n| 4 | D | m | 500 |",
        isExample: true
      }
    ]
  }
];

async function main() {
  console.log("Adding SQL problems...");
  
  for (const prob of sqlProblems) {
    const cleanDescription = prob.description
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      .trim();

    await prisma.problem.upsert({
      where: { slug: prob.slug },
      update: {
        type: prob.type as any,
        description: cleanDescription,
        initialSchema: prob.initialSchema,
        initialData: prob.initialData,
        referenceSolution: prob.referenceSolution,
        testSets: prob.testSets as any,
        category: prob.category,
        difficulty: prob.difficulty
      },
      create: {
        ...prob,
        description: cleanDescription,
        type: prob.type as any,
        testSets: prob.testSets as any,
      },
    });
    console.log(`- ${prob.title} (${prob.difficulty})`);
  }

  console.log("SQL seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });