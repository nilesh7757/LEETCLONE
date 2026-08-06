const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Design Ludo - Low Level Design (LLD)</h1>

<p>Ludo is a classic board game for 2 to 4 players. Players race their four tokens from start to finish according to the rolls of a single die.</p>

<p>Your task is to design the <strong>Low-Level Design (LLD)</strong> of Ludo. You need to model the classes, establish their relationships, and implement the core gameplay mechanics (rolling dice, moving tokens, safe-zone protection, token capturing, and turn-based coordination).</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>System Requirements:</h3>

<h4>1. Functional Requirements:</h4>
<ul>
  <li>Support <strong>2 to 4 players</strong>, each having a distinct color (Red, Green, Yellow, Blue) and 4 tokens.</li>
  <li>A player must roll a <code>6</code> to move a token out of the "Home Yard" and onto the active track.</li>
  <li>Tokens move along a shared active track, a colored home path, and finally enter the "Home Triangle" (destination).</li>
  <li>If a token lands on a cell occupied by an opponent's token, the opponent's token is <strong>captured</strong> and sent back to their Home Yard (unless the cell is a designated <strong>Safe Zone</strong>).</li>
  <li>A player gets an extra roll if they roll a <code>6</code> or capture an opponent's token.</li>
  <li>Win Condition: The first player to get all 4 tokens into the Home Triangle wins.</li>
</ul>

<h4>2. Non-Functional Requirements:</h4>
<ul>
  <li><strong>Extensibility:</strong> Easy to add custom rules (e.g., blockades, custom board sizes, multiple dice).</li>
  <li><strong>Thread-safety:</strong> (Optional but good) Ensure state changes are serialized.</li>
</ul>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>UML Class Diagram:</h3>
<svg width="500" height="260" viewBox="0 0 500 260" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <defs>
    <!-- Arrowhead markers -->
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94a3b8" />
    </marker>
  </defs>

  <!-- Class: Game -->
  <rect x="20" y="20" width="130" height="90" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
  <text x="85" y="38" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">Game</text>
  <line x1="20" y1="46" x2="150" y2="46" stroke="#334155" />
  <text x="26" y="60" font-size="9" fill="#94a3b8">- board: Board</text>
  <text x="26" y="72" font-size="9" fill="#94a3b8">- players: List&lt;Player&gt;</text>
  <line x1="20" y1="80" x2="150" y2="80" stroke="#334155" />
  <text x="26" y="94" font-size="9" fill="#94a3b8">+ startGame()</text>

  <!-- Class: Player -->
  <rect x="185" y="20" width="130" height="90" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
  <text x="250" y="38" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">Player</text>
  <line x1="185" y1="46" x2="315" y2="46" stroke="#334155" />
  <text x="191" y="60" font-size="9" fill="#94a3b8">- color: Color</text>
  <text x="191" y="72" font-size="9" fill="#94a3b8">- tokens: Token[4]</text>
  <line x1="185" y1="80" x2="315" y2="80" stroke="#334155" />
  <text x="191" y="94" font-size="9" fill="#94a3b8">+ chooseToken()</text>

  <!-- Class: Token -->
  <rect x="350" y="20" width="130" height="90" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
  <text x="415" y="38" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">Token</text>
  <line x1="350" y1="46" x2="480" y2="46" stroke="#334155" />
  <text x="356" y="60" font-size="9" fill="#94a3b8">- id: int</text>
  <text x="356" y="72" font-size="9" fill="#94a3b8">- state: TokenState</text>
  <line x1="350" y1="80" x2="480" y2="80" stroke="#334155" />
  <text x="356" y="94" font-size="9" fill="#94a3b8">+ move(steps: int)</text>

  <!-- Class: Board -->
  <rect x="20" y="150" width="130" height="90" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
  <text x="85" y="168" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">Board</text>
  <line x1="20" y1="176" x2="150" y2="176" stroke="#334155" />
  <text x="26" y="190" font-size="9" fill="#94a3b8">- cells: Cell[52]</text>
  <text x="26" y="202" font-size="9" fill="#94a3b8">- homeGates: Map</text>
  <line x1="20" y1="210" x2="150" y2="210" stroke="#334155" />
  <text x="26" y="224" font-size="9" fill="#94a3b8">+ moveToken(t, roll)</text>

  <!-- Class: Cell -->
  <rect x="185" y="150" width="130" height="90" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
  <text x="250" y="168" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">Cell</text>
  <line x1="185" y1="176" x2="315" y2="176" stroke="#334155" />
  <text x="191" y="190" font-size="9" fill="#94a3b8">- id: int</text>
  <text x="191" y="202" font-size="9" fill="#94a3b8">- isSafe: boolean</text>
  <line x1="185" y1="210" x2="315" y2="210" stroke="#334155" />
  <text x="191" y="224" font-size="9" fill="#94a3b8">+ addToken(t)</text>

  <!-- Class: Dice -->
  <rect x="350" y="150" width="130" height="70" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
  <text x="415" y="168" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">Dice</text>
  <line x1="350" y1="176" x2="480" y2="176" stroke="#334155" />
  <text x="356" y="190" font-size="9" fill="#94a3b8">- faces: int</text>
  <line x1="350" y1="198" x2="480" y2="198" stroke="#334155" />
  <text x="356" y="210" font-size="9" fill="#94a3b8">+ roll(): int</text>

  <!-- Connections -->
  <!-- Game -> Player -->
  <path d="M 150 65 L 185 65" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrow)" />
  <!-- Player -> Token -->
  <path d="M 315 65 L 350 65" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrow)" />
  <!-- Game -> Board -->
  <path d="M 85 110 L 85 150" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrow)" />
  <!-- Board -> Cell -->
  <path d="M 150 195 L 185 195" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrow)" />
</svg>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Design Patterns Used:</h3>
<ul>
  <li><strong>Singleton Pattern:</strong> Used for the <code>Dice</code> manager to ensure global unified random distributions.</li>
  <li><strong>State Pattern:</strong> Used to manage game flow (e.g., <code>ROLLING_DICE</code>, <code>MOVING_TOKEN</code>, <code>GAME_OVER</code>).</li>
  <li><strong>Strategy Pattern:</strong> (Optional) For configuring path movement strategies depending on color gates.</li>
</ul>
`.trim();

const javaReferenceSolution = `
import java.util.*;

enum Color {
    RED, GREEN, YELLOW, BLUE
}

enum TokenState {
    HOME_YARD, ACTIVE, HOME_RUN, COMPLETED
}

class Dice {
    private static Dice instance;
    private final Random random;

    private Dice() {
        this.random = new Random();
    }

    public static synchronized Dice getInstance() {
        if (instance == null) {
            instance = new Dice();
        }
        return instance;
    }

    public int roll() {
        return random.nextInt(6) + 1; // 1 to 6
    }
}

class Token {
    private final int id;
    private final Color color;
    private TokenState state;
    private int position; // index on board/path

    public Token(int id, Color color) {
        this.id = id;
        this.color = color;
        this.state = TokenState.HOME_YARD;
        this.position = -1; // -1 represents home yard
    }

    public int getId() { return id; }
    public Color getColor() { return color; }
    public TokenState getState() { return state; }
    public void setState(TokenState state) { this.state = state; }
    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }
}

class Player {
    private final String id;
    private final String name;
    private final Color color;
    private final List<Token> tokens;

    public Player(String id, String name, Color color) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.tokens = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            tokens.add(new Token(i + 1, color));
        }
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public Color getColor() { return color; }
    public List<Token> getTokens() { return tokens; }

    public boolean hasFinished() {
        for (Token t : tokens) {
            if (t.getState() != TokenState.COMPLETED) return false;
        }
        return true;
    }
}

class Cell {
    private final int id;
    private final boolean isSafe;
    private final List<Token> presentTokens;

    public Cell(int id, boolean isSafe) {
        this.id = id;
        this.isSafe = isSafe;
        this.presentTokens = new ArrayList<>();
    }

    public int getId() { return id; }
    public boolean isSafe() { return isSafe; }
    public List<Token> getPresentTokens() { return presentTokens; }

    public synchronized void addToken(Token token) {
        presentTokens.add(token);
    }

    public synchronized void removeToken(Token token) {
        presentTokens.remove(token);
    }
}

class Board {
    private final Map<Integer, Cell> cells;
    private final Map<Color, Integer> startingPoints;
    private final Map<Color, Integer> homeEntryPoints;

    public Board() {
        this.cells = new HashMap<>();
        this.startingPoints = new HashMap<>();
        this.homeEntryPoints = new HashMap<>();
        initializeBoard();
    }

    private void initializeBoard() {
        // 52 normal tracks
        for (int i = 0; i < 52; i++) {
            boolean isSafe = (i == 0 || i == 8 || i == 13 || i == 21 || i == 26 || i == 34 || i == 39 || i == 47);
            cells.put(i, new Cell(i, isSafe));
        }
        // Set starting points for colors
        startingPoints.put(Color.RED, 0);
        startingPoints.put(Color.GREEN, 13);
        startingPoints.put(Color.YELLOW, 26);
        startingPoints.put(Color.BLUE, 39);

        // Home entry points before going to home run
        homeEntryPoints.put(Color.RED, 50);
        homeEntryPoints.put(Color.GREEN, 11);
        homeEntryPoints.put(Color.YELLOW, 24);
        homeEntryPoints.put(Color.BLUE, 37);
    }

    public int getStartingPoint(Color color) {
        return startingPoints.get(color);
    }

    public boolean moveToken(Token token, int roll) {
        if (token.getState() == TokenState.HOME_YARD) {
            if (roll == 6) {
                token.setState(TokenState.ACTIVE);
                int start = startingPoints.get(token.getColor());
                token.setPosition(start);
                cells.get(start).addToken(token);
                return true;
            }
            return false;
        }

        if (token.getState() == TokenState.ACTIVE) {
            int currentPos = token.getPosition();
            cells.get(currentPos).removeToken(token);
            
            // Check boundary movements & home runs
            int newPos = (currentPos + roll) % 52;
            token.setPosition(newPos);
            
            Cell destCell = cells.get(newPos);
            // Handle Capture Logic
            if (!destCell.isSafe() && !destCell.getPresentTokens().isEmpty()) {
                Token occupyingToken = destCell.getPresentTokens().get(0);
                if (occupyingToken.getColor() != token.getColor()) {
                    // Capture!
                    destCell.removeToken(occupyingToken);
                    occupyingToken.setState(TokenState.HOME_YARD);
                    occupyingToken.setPosition(-1);
                    System.out.println("Captured " + occupyingToken.getColor() + "'s Token!");
                }
            }
            destCell.addToken(token);
            return true;
        }
        return false;
    }
}

class GameManager {
    private final List<Player> players;
    private final Board board;
    private int currentPlayerIndex;
    private boolean isGameOver;

    public GameManager(List<Player> players) {
        this.players = players;
        this.board = new Board();
        this.currentPlayerIndex = 0;
        this.isGameOver = false;
    }

    public void playTurn() {
        if (isGameOver) return;

        Player currentPlayer = players.get(currentPlayerIndex);
        Dice dice = Dice.getInstance();
        int roll = dice.roll();
        System.out.println(currentPlayer.getName() + " rolled: " + roll);

        // Find a moveable token
        Token moveableToken = null;
        for (Token t : currentPlayer.getTokens()) {
            if (t.getState() == TokenState.ACTIVE || (t.getState() == TokenState.HOME_YARD && roll == 6)) {
                moveableToken = t;
                break;
            }
        }

        if (moveableToken != null) {
            boolean success = board.moveToken(moveableToken, roll);
            if (success) {
                System.out.println("Moved token " + moveableToken.getId() + " to position " + moveableToken.getPosition());
            }
        }

        if (currentPlayer.hasFinished()) {
            isGameOver = true;
            System.out.println("🎉 " + currentPlayer.getName() + " has won the game!");
            return;
        }

        // Change Turn (unless 6 is rolled)
        if (roll != 6) {
            currentPlayerIndex = (currentPlayerIndex + 1) % players.size();
        } else {
            System.out.println("Six rolled! " + currentPlayer.getName() + " gets another turn.");
        }
    }
}
`.trim();

async function main() {
  console.log("Upserting Ludo LLD problem in database...");
  const result = await prisma.problem.upsert({
    where: { slug: "design-ludo" },
    update: {
      title: "Design Ludo",
      difficulty: "Medium",
      category: "System Design",
      description: htmlDescription,
      referenceSolution: javaReferenceSolution,
      testSets: [],
      type: "SYSTEM_DESIGN"
    },
    create: {
      slug: "design-ludo",
      title: "Design Ludo",
      difficulty: "Medium",
      category: "System Design",
      description: htmlDescription,
      referenceSolution: javaReferenceSolution,
      testSets: [],
      type: "SYSTEM_DESIGN"
    }
  });

  console.log("🎉 Successfully created/updated 'Design Ludo'!");
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
