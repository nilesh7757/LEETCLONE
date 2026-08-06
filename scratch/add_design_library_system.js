const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Design Library Management System - LLD</h1>

<p>A Library Management System organizes and manages cataloging, issuing, returning, and tracking books in a library. It serves both library members (who search and borrow books) and librarians (who manage inventory and memberships).</p>

<p>Your task is to design the <strong>Low-Level Design (LLD)</strong> of a Library Management System with a strict focus on <strong>Object-Oriented Programming (OOP) Principles</strong>: Encapsulation, Inheritance, and Runtime Polymorphism.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>System Requirements:</h3>

<h4>1. Functional Requirements:</h4>
<ul>
  <li><strong>Catalog Management:</strong> Members and librarians should be able to search books by title, author, subject, or publication date.</li>
  <li><strong>Book Issuing & Reservation:</strong> Members can check out books (maximum 5 books at a time for up to 10 days) and reserve books currently checked out.</li>
  <li><strong>Fine Management:</strong> Automatically calculate fines for books returned past the due date.</li>
  <li><strong>Membership Management:</strong> Librarians should be able to add members, block/unblock members, and track membership statuses.</li>
</ul>

<h4>2. OOPs Focus Areas:</h4>
<ul>
  <li><strong>Encapsulation:</strong> Ensure all states (such as barcode, account credentials, fine logs) are private and exposed only through controlled public APIs.</li>
  <li><strong>Inheritance:</strong> Model common account attributes (e.g., id, password, status, profile) in an abstract base class <code>Account</code>, extended by <code>Member</code> and <code>Librarian</code>.</li>
  <li><strong>Runtime Polymorphism:</strong> Implement search strategies using a <code>Search</code> interface, dynamically resolved at runtime depending on search parameters.</li>
</ul>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>UML Class Diagram:</h3>
<svg width="500" height="260" viewBox="0 0 500 260" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <defs>
    <!-- Arrowhead markers -->
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94a3b8" />
    </marker>
    <!-- Generalization triangle marker -->
    <marker id="generalization" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 8 5 L 0 10 z" fill="#0f172a" stroke="#94a3b8" stroke-width="1.5" />
    </marker>
  </defs>

  <!-- Class: Book -->
  <rect x="20" y="20" width="120" height="80" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
  <text x="80" y="38" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">Book</text>
  <line x1="20" y1="46" x2="140" y2="46" stroke="#334155" />
  <text x="26" y="58" font-size="8" fill="#94a3b8">- isbn: String</text>
  <text x="26" y="70" font-size="8" fill="#94a3b8">- title: String</text>
  <text x="26" y="82" font-size="8" fill="#94a3b8">- author: String</text>

  <!-- Class: BookLending -->
  <rect x="20" y="140" width="120" height="90" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
  <text x="80" y="158" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">BookLending</text>
  <line x1="20" y1="166" x2="140" y2="166" stroke="#334155" />
  <text x="26" y="178" font-size="8" fill="#94a3b8">- creationDate: Date</text>
  <text x="26" y="190" font-size="8" fill="#94a3b8">- dueDate: Date</text>
  <line x1="20" y1="198" x2="140" y2="198" stroke="#334155" />
  <text x="26" y="210" font-size="8" fill="#94a3b8">+ lendBook(b, m)</text>

  <!-- Class: Account (Abstract) -->
  <rect x="190" y="20" width="130" height="80" rx="6" fill="#1e293b" stroke="#a855f7" stroke-width="1.5" />
  <text x="255" y="38" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">Account &lt;&lt;Abstract&gt;&gt;</text>
  <line x1="190" y1="46" x2="320" y2="46" stroke="#334155" />
  <text x="196" y="58" font-size="8" fill="#94a3b8">- id: String</text>
  <text x="196" y="70" font-size="8" fill="#94a3b8">- status: AccountStatus</text>
  <line x1="190" y1="76" x2="320" y2="76" stroke="#334155" />
  <text x="196" y="88" font-size="8" fill="#94a3b8">+ resetPassword()</text>

  <!-- Class: Member -->
  <rect x="160" y="140" width="90" height="90" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
  <text x="205" y="158" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">Member</text>
  <line x1="160" y1="166" x2="250" y2="166" stroke="#334155" />
  <text x="166" y="178" font-size="8" fill="#94a3b8">- checkedOut: int</text>
  <line x1="160" y1="186" x2="250" y2="186" stroke="#334155" />
  <text x="166" y="198" font-size="8" fill="#94a3b8">+ checkoutBook()</text>
  <text x="166" y="210" font-size="8" fill="#94a3b8">+ returnBook()</text>

  <!-- Class: Librarian -->
  <rect x="270" y="140" width="90" height="90" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
  <text x="315" y="158" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">Librarian</text>
  <line x1="270" y1="166" x2="360" y2="166" stroke="#334155" />
  <text x="276" y="178" font-size="8" fill="#94a3b8">- accessLevel: int</text>
  <line x1="270" y1="186" x2="360" y2="186" stroke="#334155" />
  <text x="276" y="198" font-size="8" fill="#94a3b8">+ addBookItem()</text>
  <text x="276" y="210" font-size="8" fill="#94a3b8">+ blockMember()</text>

  <!-- Class: Catalog -->
  <rect x="380" y="20" width="100" height="80" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
  <text x="430" y="38" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">Catalog</text>
  <line x1="380" y1="46" x2="480" y2="46" stroke="#334155" />
  <text x="386" y="58" font-size="8" fill="#94a3b8">- booksMap: Map</text>
  <line x1="380" y1="66" x2="480" y2="66" stroke="#334155" />
  <text x="386" y="78" font-size="8" fill="#94a3b8">+ search(query)</text>

  <!-- Generalization (Inheritance): Member -> Account -->
  <path d="M 205 140 L 205 115 L 245 115 L 245 110" fill="none" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#generalization)" />
  <!-- Generalization (Inheritance): Librarian -> Account -->
  <path d="M 315 140 L 315 115 L 265 115 L 265 110" fill="none" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#generalization)" />

  <!-- Associations -->
  <!-- Catalog -> Book -->
  <path d="M 380 60 L 140 60" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,2" marker-end="url(#arrow)" />
  <!-- BookLending -> Book -->
  <path d="M 80 140 L 80 110" stroke="#94a3b8" stroke-width="1" marker-end="url(#arrow)" />
</svg>
`.trim();

const javaReferenceSolution = `
import java.util.*;

enum AccountStatus {
    ACTIVE, CLOSED, CANCELED, BLACKLISTED
}

enum BookStatus {
    AVAILABLE, LOANED, RESERVED, LOST
}

// 1. Encapsulation: Book, Profile details are fully encapsulated.
class Book {
    private final String isbn;
    private final String title;
    private final String author;
    private BookStatus status;

    public Book(String isbn, String title, String author) {
        this.isbn = isbn;
        this.title = title;
        this.author = author;
        this.status = BookStatus.AVAILABLE;
    }

    public String getIsbn() { return isbn; }
    public String getTitle() { return title; }
    public String getAuthor() { return author; }
    public BookStatus getStatus() { return status; }
    public void setStatus(BookStatus status) { this.status = status; }
}

// 2. Inheritance: Member and Librarian inherit from Abstract Account
abstract class Account {
    private final String id;
    private final String password;
    private AccountStatus status;

    public Account(String id, String password) {
        this.id = id;
        this.password = password;
        this.status = AccountStatus.ACTIVE;
    }

    public String getId() { return id; }
    public AccountStatus getStatus() { return status; }
    public void setStatus(AccountStatus status) { this.status = status; }

    public abstract void showMenu(); // Runtime polymorphism interface hook
}

class Member extends Account {
    private int totalBooksCheckedOut;
    private final List<Book> checkedOutBooks;

    public Member(String id, String password) {
        super(id, password);
        this.totalBooksCheckedOut = 0;
        this.checkedOutBooks = new ArrayList<>();
    }

    public int getTotalBooksCheckedOut() { return totalBooksCheckedOut; }
    public List<Book> getCheckedOutBooks() { return checkedOutBooks; }

    public void checkoutBook(Book book) {
        if (totalBooksCheckedOut >= 5) {
            System.out.println("Limit reached: Cannot checkout more than 5 books.");
            return;
        }
        if (book.getStatus() != BookStatus.AVAILABLE) {
            System.out.println("Book is currently unavailable.");
            return;
        }
        book.setStatus(BookStatus.LOANED);
        checkedOutBooks.add(book);
        totalBooksCheckedOut++;
        System.out.println("Book " + book.getTitle() + " successfully checked out.");
    }

    public void returnBook(Book book) {
        if (checkedOutBooks.remove(book)) {
            book.setStatus(BookStatus.AVAILABLE);
            totalBooksCheckedOut--;
            System.out.println("Book " + book.getTitle() + " successfully returned.");
        }
    }

    // 3. Runtime Polymorphism: Overriding showMenu()
    @Override
    public void showMenu() {
        System.out.println("Member Menu: Search Books, Checkout Book, Return Book");
    }
}

class Librarian extends Account {
    public Librarian(String id, String password) {
        super(id, password);
    }

    public void addBookItem(Catalog catalog, Book book) {
        catalog.addBook(book);
        System.out.println("Librarian added book: " + book.getTitle());
    }

    public void blockMember(Member member) {
        member.setStatus(AccountStatus.BLACKLISTED);
        System.out.println("Member " + member.getId() + " has been blacklisted.");
    }

    @Override
    public void showMenu() {
        System.out.println("Librarian Menu: Add Book, Block Member, Track Fines");
    }
}

// 4. Runtime Polymorphism via Strategy Interface
interface SearchStrategy {
    List<Book> search(List<Book> inventory, String query);
}

class SearchByTitle implements SearchStrategy {
    @Override
    public List<Book> search(List<Book> inventory, String query) {
        List<Book> result = new ArrayList<>();
        for (Book b : inventory) {
            if (b.getTitle().toLowerCase().contains(query.toLowerCase())) {
                result.add(b);
            }
        }
        return result;
    }
}

class SearchByAuthor implements SearchStrategy {
    @Override
    public List<Book> search(List<Book> inventory, String query) {
        List<Book> result = new ArrayList<>();
        for (Book b : inventory) {
            if (b.getAuthor().toLowerCase().contains(query.toLowerCase())) {
                result.add(b);
            }
        }
        return result;
    }
}

class Catalog {
    private final List<Book> books;
    private SearchStrategy searchStrategy;

    public Catalog() {
        this.books = new ArrayList<>();
        this.searchStrategy = new SearchByTitle(); // Default Strategy
    }

    public void addBook(Book book) {
        books.add(book);
    }

    // Set search strategy dynamically at runtime (Polymorphism)
    public void setSearchStrategy(SearchStrategy searchStrategy) {
        this.searchStrategy = searchStrategy;
    }

    public List<Book> searchBooks(String query) {
        return searchStrategy.search(books, query);
    }
}
`.trim();

async function main() {
  console.log("Upserting Library Management System LLD problem in database...");
  const result = await prisma.problem.upsert({
    where: { slug: "design-library-management-system" },
    update: {
      title: "Design Library Management System",
      difficulty: "Medium",
      category: "System Design",
      description: htmlDescription,
      referenceSolution: javaReferenceSolution,
      testSets: [],
      type: "SYSTEM_DESIGN"
    },
    create: {
      slug: "design-library-management-system",
      title: "Design Library Management System",
      difficulty: "Medium",
      category: "System Design",
      description: htmlDescription,
      referenceSolution: javaReferenceSolution,
      testSets: [],
      type: "SYSTEM_DESIGN"
    }
  });

  console.log("🎉 Successfully created/updated 'Design Library Management System'!");
  console.log("Slug:", result.slug);
  console.log("Type:", result.type);
}

main()
  .catch(e => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
