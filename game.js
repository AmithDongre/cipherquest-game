// ═══════════════════════════════════════════════════════════════════
//  CipherQuest: The IT Odyssey  —  game.js
//  Option B: Difficulty with Bonus Points
//  90-Question Bank  ·  3 Tiers  ·  4 Worlds  ·  Firebase Sync
// ═══════════════════════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
  getDatabase, ref, set, get, onValue, remove
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

// ─── FIREBASE CONFIG ─────────────────────────────────────────────
// ⚠  Replace ALL placeholder values with your actual Firebase project config
// Get config from: Firebase Console → Project Settings → Your Apps → SDK setup
const firebaseConfig = {
  apiKey:            "AIzaSyCsbAIShtFvEHpWpqQT1VnBJrStjKrBSlI",
  authDomain:        "cipherquest-itfest.firebaseapp.com",
  databaseURL:       "https://cipherquest-itfest-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "cipherquest-itfest",
  storageBucket:     "cipherquest-itfest.firebasestorage.app",
  messagingSenderId: "919144731797",
  appId:             "1:919144731797:web:8c49bcf39dcf6e8715379c"
};

// ─── DIFFICULTY CONFIG — flat equal points, same max for everyone ──
const DIFFICULTY = {
  rookie: {
    label: "🌱 Rookie",
    multiplier: 1,
    hintCost: 10,
    maxHintsPerQuestion: 2,
    completionBonus: 0,
    description: "20 pts/question · 2 hints"
  },
  pro: {
    label: "⚔️ Pro",
    multiplier: 1,
    hintCost: 10,
    maxHintsPerQuestion: 2,
    completionBonus: 0,
    description: "20 pts/question · 2 hints"
  },
  legend: {
    label: "👑 Legend",
    multiplier: 1,
    hintCost: 10,
    maxHintsPerQuestion: 2,
    completionBonus: 0,
    description: "20 pts/question · 2 hints"
  }
};

// ─── BONUS ROUND CONFIG ───────────────────────────────────────────
// After completing Phase 1, teams can attempt bonus questions from a
// harder tier. Rookie → Pro questions, Pro → Legend questions, Legend → Elite questions (brand new tier).
const BONUS_CONFIG = {
  rookie: { fromDiff: 'pro',    label: '⚔️ Pro Bonus Round',    regularPts: 20, bossPts: 30, hintCost: 10 },
  pro:    { fromDiff: 'legend', label: '👑 Legend Bonus Round',  regularPts: 20, bossPts: 30, hintCost: 10 },
  legend: { fromDiff: 'elite',  label: '🌟 Elite Bonus Round',   regularPts: 20, bossPts: 30, hintCost: 10 },
};




// Points per question — depends on phase and question type
function calcPts(base) {
  if (state.phase === 2) {
    const bc = BONUS_CONFIG[state.difficulty];
    // base is POINTS_REGULAR(20) or POINTS_BOSS(30) — map to bonus values
    return base === POINTS_BOSS ? bc.bossPts : bc.regularPts;
  }
  return base; // Phase 1: flat points, no multiplier
}

// Current hint cost (differs in bonus round)
function currentHintCost() {
  if (state.phase === 2) return BONUS_CONFIG[state.difficulty].hintCost;
  return DIFFICULTY[state.difficulty].hintCost;
}

// Max possible score for phase 1 (same for all modes: 26×20 + 4×30 = 640)
const PHASE1_MAX = 26 * 20 + 4 * 30; // 640

// Max possible score for phase 2 bonus round
function phase2Max(difficulty) {
  const bc = BONUS_CONFIG[difficulty];
  return 26 * bc.regularPts + 4 * bc.bossPts;
}

// Maximum possible total score (used for leaderboard %)
function calcMaxScore(difficulty) {
  return PHASE1_MAX + phase2Max(difficulty);
}

const WORLDS = [
  { id: 0, name: "Binary Jungle",  emoji: "🌿", color: "#2d6a4f", glow: "#52b788" },
  { id: 1, name: "Network Nebula", emoji: "🌌", color: "#3a0ca3", glow: "#7b2ff7" },
  { id: 2, name: "Code Citadel",   emoji: "⚙️", color: "#023e8a", glow: "#0096c7" },
  { id: 3, name: "AI Realm",       emoji: "🤖", color: "#6d0000", glow: "#e63946" }
];

const POINTS_REGULAR = 20;
const POINTS_BOSS    = 30;

// ═══════════════════════════════════════════════════════════════════
//  QUESTION BANK  —  30 per difficulty  (8 / 8 / 8 / 6 per world)
//  Each entry: { q, opts[], ans (0-indexed), hint, boss }
//  boss:true questions are picked as Q4 of each world
// ═══════════════════════════════════════════════════════════════════
const QUESTION_BANK = {

  // ╔═══════════════════════════════════════════════════════╗
  // ║  ROOKIE  —  Applied intermediate for BCA/MCA/Eng     ║
  // ╚═══════════════════════════════════════════════════════╝
  rookie: [
    // ── World 0: Binary Jungle (CS Fundamentals) ─────────────
    { world:0, q:"What is the output of `print(0b1010 | 0b1100)` in Python?",
      opts:["10","12","14","8"],
      ans:2, hints:["The | operator is bitwise OR — a result bit is 1 if it is 1 in EITHER input.","0b1010 = 10, 0b1100 = 12. Align the bits and OR each column: 1110 in binary equals what decimal?"], boss:false },

    { world:0, q:"Which BST traversal visits nodes in ascending sorted order?",
      opts:["Pre-order (Root → Left → Right)",
            "Post-order (Left → Right → Root)",
            "In-order (Left → Root → Right)",
            "Level-order (breadth-first)"],
      ans:2, hints:["In a BST, the left subtree is always smaller than the root and the right is always larger.","Following Left → Root → Right means you always visit the smallest reachable value before the root — what ordering does that produce?"], boss:false },

    { world:0, q:"What is the worst-case time complexity of QuickSort?",
      opts:["O(n log n)","O(n²)","O(n)","O(log n)"],
      ans:1, hints:["The worst case occurs when the pivot consistently creates highly unequal partitions.","Choosing the smallest or largest element as pivot on an already-sorted array triggers this — one partition has 0 elements, the other has n-1."], boss:false },

    { world:0, q:"What data structure should you use to implement BFS (Breadth-First Search)?",
      opts:["Stack — for LIFO traversal order",
            "Priority Queue — for weighted traversal",
            "Queue — for FIFO traversal order",
            "Heap — for minimum cost traversal"],
      ans:2, hints:["BFS explores all nodes at depth d before exploring any node at depth d+1.","The structure that processes items in the order they were added (FIFO) guarantees level-by-level exploration."], boss:true },

    { world:0, q:"In two's complement, what is the 8-bit binary representation of -1?",
      opts:["10000001","01111111","11111111","11111110"],
      ans:2, hints:["To negate a number in two's complement: flip all bits, then add 1.","Start with 00000001 (which is +1). Flip all bits → 11111110. Add 1 → ?"], boss:false },

    { world:0, q:"What is the space complexity of recursive Merge Sort?",
      opts:["O(1) — it sorts in-place","O(log n) — only the recursion stack","O(n) — auxiliary arrays plus recursion stack","O(n²) — one copy per recursive call"],
      ans:2, hints:["Merge Sort cannot sort in-place — it needs extra space to hold the two halves being merged.","The merge step creates a temporary array of size proportional to the input — what does that make the dominant space cost?"], boss:false },

    { world:0, q:"Which condition causes a hash table's lookup to degrade to O(n) worst case?",
      opts:["When the load factor equals exactly 0.75",
            "When all keys hash to the same bucket",
            "When the table size is a prime number",
            "When keys are inserted in sorted order"],
      ans:1, hints:["With separate chaining, the worst case is when all n elements end up in a single linked list.","If the hash function sends every key to the same slot, what does searching that slot cost?"], boss:false },

    { world:0, q:"What is the result of the expression `3 << 2` (left shift by 2)?",
      opts:["6","9","12","16"],
      ans:2, hints:["A left shift by k positions is equivalent to multiplying by 2^k.","3 × 2² = 3 × 4 = ?"], boss:false },

    // ── World 1: Network Nebula (Networking & Security) ───────
    { world:1, q:"What is the correct sequence of messages in the TCP 3-way handshake?",
      opts:["SYN → ACK → SYN-ACK",
            "SYN → SYN-ACK → ACK",
            "ACK → SYN → SYN-ACK",
            "SYN-ACK → SYN → ACK"],
      ans:1, hints:["The client initiates, the server acknowledges AND responds in one combined message, then the client confirms.","Think: client says 'hello', server says 'hello + confirm', client says 'confirmed'."], boss:false },

    { world:1, q:"Which OSI layer does a router operate at?",
      opts:["Layer 1 — Physical",
            "Layer 2 — Data Link",
            "Layer 3 — Network",
            "Layer 4 — Transport"],
      ans:2, hints:["Routers make forwarding decisions based on IP addresses — not MAC addresses.","IP addresses live at this layer — the same one a router inspects to decide where to send a packet."], boss:false },

    { world:1, q:"What does ARP (Address Resolution Protocol) do?",
      opts:["Dynamically assigns IP addresses to devices on the network",
            "Maps an IP address to the corresponding MAC (hardware) address",
            "Encrypts packets before transmission over a local network",
            "Resolves domain names to IP addresses for routing"],
      ans:1, hints:["Your device knows the destination IP but needs the physical hardware address to actually send the Ethernet frame.","ARP broadcasts: 'Who has this IP? Tell me your MAC address.'"], boss:true },

    { world:1, q:"What is the key difference between TCP and UDP?",
      opts:["TCP is faster than UDP for all types of traffic",
            "TCP works only on LANs; UDP works across the internet",
            "TCP guarantees ordered, reliable delivery; UDP does not",
            "UDP uses IP addressing; TCP uses MAC addressing"],
      ans:2, hints:["One protocol confirms every packet arrived and retransmits lost ones; the other sends and forgets.","Live video calls prefer speed over guaranteed delivery — which protocol fits that, and which is the other?"], boss:false },

    { world:1, q:"What happens when a packet's TTL (Time To Live) field reaches 0?",
      opts:["The packet is automatically retransmitted by the original sender",
            "The packet is discarded and an ICMP error message is sent back to the sender",
            "The packet is forwarded to the default gateway as a fallback",
            "The TTL is reset to 64 by the next router in the path"],
      ans:1, hints:["TTL prevents packets from looping forever in a network — when it expires, the router must act.","The router drops the packet and sends a control message back to the source — what protocol handles that notification?"], boss:false },

    { world:1, q:"What does NAT (Network Address Translation) primarily enable?",
      opts:["Encrypting all traffic between a client and a web server",
            "Multiple devices on a private network sharing one public IP address",
            "Resolving domain names to IP addresses for internet routing",
            "Distributing incoming traffic across multiple backend servers"],
      ans:1, hints:["Your home router has one public IP but lets every device in the house reach the internet simultaneously.","It rewrites private addresses (192.168.x.x) to the single public address before traffic leaves the local network."], boss:false },

    { world:1, q:"You are designing a live video streaming app. Which transport protocol should you use and why?",
      opts:["TCP — retransmission keeps the stream high quality",
            "ICMP — it is designed for real-time media delivery",
            "UDP — low latency matters more than guaranteed delivery",
            "HTTP — it natively handles streaming content"],
      ans:2, hints:["For live video, a retransmitted packet from 2 seconds ago is useless — you'd rather skip it and move on.","The protocol that sacrifices reliability for speed is the right choice here."], boss:false },

    { world:1, q:"How many usable host addresses does a /28 subnet provide?",
      opts:["28 usable hosts",
            "16 usable hosts",
            "14 usable hosts",
            "30 usable hosts"],
      ans:2, hints:["A /28 mask leaves 4 bits for the host portion — calculate 2^4 first, then subtract the two reserved addresses.","2^4 = 16 total addresses. Network address and broadcast address are reserved — how many remain?"], boss:false },

    // ── World 2: Code Citadel (Programming & Algorithms) ─────
    { world:2, q:"What is the output of `[x**2 for x in range(5) if x % 2 == 0]` in Python?",
      opts:["[0, 4, 16]","[1, 9, 25]","[0, 1, 4, 9, 16]","[4, 16]"],
      ans:0, hints:["The `if x % 2 == 0` part filters to only even numbers in range(5).","Even numbers in range(5) are 0, 2, and 4. Square each of those."], boss:false },

    { world:2, q:"What is a closure in programming?",
      opts:["A function that calls itself recursively until a base case",
            "A function that retains access to its enclosing scope's variables after the outer function has returned",
            "A design pattern that prevents subclasses from overriding parent methods",
            "A block of code that catches and handles runtime exceptions"],
      ans:1, hints:["The inner function 'closes over' variables from the outer function's scope.","Even after the outer function finishes executing, the inner function still remembers and can use those captured variables."], boss:false },

    { world:2, q:"What does `===` check in JavaScript compared to `==`?",
      opts:["=== checks value only; == checks value and type",
            "=== checks both value and type strictly; == coerces types before comparing",
            "=== is for objects; == is for primitive values",
            "They are identical — === is an alias for == in modern JavaScript"],
      ans:1, hints:["JavaScript's == will convert types to make a comparison work — '5' == 5 is true.","The triple equals never converts types — both sides must match exactly in value AND type."], boss:false },

    { world:2, q:"What is a foreign key constraint in a relational database?",
      opts:["A hashed primary key for faster lookup in large tables",
            "A column whose value must match a primary key in another table, enforcing referential integrity",
            "An index auto-created on every column used in JOIN queries",
            "A constraint that prevents NULL values from being inserted"],
      ans:1, hints:["It creates a relationship between two tables — a value must exist in one table before it can be referenced in another.","You cannot insert an order for a customer_id that doesn't exist in the customers table — what constraint enforces that?"], boss:false },

    { world:2, q:"What is the output of the following Python code?\ndef f(x, lst=[]):\n    lst.append(x)\n    return lst\nprint(f(1))\nprint(f(2))",
      opts:["[1]  then  [2]",
            "[1]  then  [1, 2]",
            "[1]  then  [2, 1]",
            "TypeError — mutable default argument not allowed"],
      ans:1, hints:["Python evaluates default argument values once when the function is defined — not each time it is called.","The same list object is reused on every call. After f(1) it contains [1], so what does f(2) append to?"], boss:true },

    { world:2, q:"Which Git command creates a new branch AND switches to it in one step?",
      opts:["git branch new-feature",
            "git checkout -b new-feature",
            "git merge new-feature",
            "git stash new-feature"],
      ans:1, hints:["You need a single command that does two things: creates the branch and moves HEAD to it.","The -b flag triggers creation — without it, checkout only switches to an existing branch."], boss:false },

    { world:2, q:"What does the REST architectural constraint 'stateless' mean?",
      opts:["The server caches all session data to speed up repeated requests",
            "Each HTTP request must be self-contained; the server stores no client session state between requests",
            "REST APIs cannot store any data — they only read from databases",
            "The client must not maintain any local state between API calls"],
      ans:1, hints:["Every single request stands alone — the server cannot rely on remembering anything from previous requests.","This constraint makes REST services easy to scale horizontally — any server instance can handle any request without shared session state."], boss:false },

    { world:2, q:"Which HTTP method is idempotent AND is used to fully replace an existing resource?",
      opts:["POST — creates a new resource each time",
            "PATCH — partially modifies an existing resource",
            "PUT — fully replaces an existing resource idempotently",
            "DELETE — removes and recreates the resource"],
      ans:2, hints:["Idempotent means calling it once or ten times produces the same server state.","POST is NOT idempotent (creates a new resource each call). PUT replaces the entire resource — calling it repeatedly with the same body always yields the same result."], boss:false },

    // ── World 3: AI Realm (AI & Emerging Tech) ────────────────
    { world:3, q:"What is the key difference between supervised and unsupervised learning?",
      opts:["Supervised uses GPUs; unsupervised uses CPUs",
            "Supervised trains on labelled data to predict outputs; unsupervised finds patterns in unlabelled data",
            "Supervised only works for classification; unsupervised only for regression",
            "Supervised always requires more data than unsupervised"],
      ans:1, hints:["One approach needs human-labelled examples with the correct answer attached; the other gets raw data and discovers structure on its own.","Training a spam filter (labelled spam/not-spam) versus clustering customers by behaviour — which approach is which?"], boss:false },

    { world:3, q:"What is a confusion matrix used for?",
      opts:["Measuring the computational complexity of a model's training algorithm",
            "Showing correct and incorrect predictions per class to evaluate a classifier",
            "Measuring correlation between input features and the target variable",
            "Testing a model's ability to generalise across multiple datasets"],
      ans:1, hints:["It's a grid that cross-references predicted labels against actual labels.","From it you can directly read off true positives, false positives, true negatives, and false negatives."], boss:false },

    { world:3, q:"What is the vanishing gradient problem in deep neural networks?",
      opts:["Gradients become too large and cause numerical overflow during backpropagation",
            "Gradients shrink exponentially through many layers, causing early layers to stop learning",
            "The learning rate decays to zero too quickly, preventing convergence",
            "Batch normalisation removes gradient information before it reaches the input layer"],
      ans:1, hints:["In very deep networks, the gradient signal used to update early layers gets multiplied by many small numbers as it travels backwards.","Multiplying many values less than 1 together repeatedly produces a value near zero — what does a near-zero gradient do to learning in that layer?"], boss:false },

    { world:3, q:"What best describes overfitting in a machine learning model?",
      opts:["The model performs well on training data but poorly on unseen test data",
            "The model is too simple to capture the patterns in the training data",
            "The model converges too slowly because the learning rate is set too high",
            "The model's predictions are consistently biased in the same direction"],
      ans:0, hints:["The model has memorised the training data rather than learning general patterns.","It knows the exact exam answers from practice papers but fails completely when it sees genuinely new questions."], boss:true },

    { world:3, q:"What does k-fold cross-validation achieve?",
      opts:["Trains k separate models and picks the one with the highest training accuracy",
            "Splits data into k parts, trains k times each using a different part as validation",
            "Reduces the dataset to k samples to speed up training on large datasets",
            "Applies k different regularisation strengths and picks the best result"],
      ans:1, hints:["It's a technique to get a more reliable estimate of how well a model generalises to unseen data.","With k=5: the data is split into 5 equal parts, the model is trained 5 times — each time one different part is the validation set."], boss:false },

    { world:3, q:"What is one-hot encoding used for in machine learning?",
      opts:["Normalising numerical features to the range [0, 1]",
            "Converting categorical variables into binary vectors for use in ML models",
            "Encrypting training data to prevent model inversion attacks",
            "Compressing high-dimensional embeddings into lower-dimensional space"],
      ans:1, hints:["ML models work with numbers — but categories like 'Red', 'Blue', 'Green' aren't numbers.","Each category gets its own binary column. For a given row, exactly one column is 1 and all others are 0."], boss:false },

  // ╔═══════════════════════════════════════════════════════╗
  // ║  PRO  —  Intermediate-Advanced for competitive teams ║
  // ╚═══════════════════════════════════════════════════════╝
  ],
  pro: [
    // ── World 0: Binary Jungle ────────────────────────────────
    { world:0, q:"What is the amortized time complexity of a single insertion into a dynamic array?",
      opts:["O(n)",
            "O(log n)",
            "O(1)",
            "O(n log n)"],
      ans:2, hints:["A single expensive operation spread across many cheap ones can look very affordable on average.","The array doubles in size occasionally — that cost is absorbed across all the insertions that follow."], boss:false },

    { world:0, q:"In an AVL tree, what is the maximum allowed height difference between subtrees of any node?",
      opts:["0",
            "1",
            "2",
            "log n"],
      ans:1, hints:["Every node in an AVL tree stores the difference between its left and right subtree heights.","If this difference exceeds the threshold at any node, a rotation immediately corrects it."], boss:false },

    { world:0, q:"Which algorithmic technique does Floyd-Warshall use for all-pairs shortest paths?",
      opts:["Greedy","Divide and Conquer","Backtracking","Dynamic Programming"],
      ans:3, hints:["This algorithm's name hints at its approach — it builds optimal solutions from smaller, already-solved subproblems.","It fills a matrix iteratively, asking at each step: can I do better by going through this intermediate node?"], boss:false },

    { world:0, q:"What is the key difference between preemptive and non-preemptive OS scheduling?",
      opts:["Preemptive allows the CPU to be forcibly taken from a running process; non-preemptive does not",
            "Non-preemptive scheduling always achieves lower average waiting time than preemptive",
            "Preemptive scheduling only works correctly on single-core processor systems",
            "Non-preemptive scheduling inherently prevents all forms of process deadlock"],
      ans:0, hints:["One model requires a process to willingly give up the CPU; the other lets the OS take it away forcibly.","What happens when a critical system task arrives while a lower-priority process is running?"], boss:true },

    { world:0, q:"What does Amdahl's Law calculate in the context of parallel computing?",
      opts:["The total memory bandwidth available across all parallel processing cores",
            "The maximum theoretical speedup limited by the sequential fraction of a program",
            "The optimal CPU cache hit ratio required for maximum parallel efficiency",
            "The minimum network latency achievable when distributing computation across nodes"],
      ans:1, hints:["No matter how many processors you add, one part of your program will always be the bottleneck.","The serial portion of your code sets an absolute ceiling on how much parallel hardware can help."], boss:false },

    { world:0, q:"What specific problem does consistent hashing solve in distributed systems?",
      opts:["It prevents deadlocks by enforcing a global ordering on distributed lock acquisition",
            "It minimises key remapping when nodes are added or removed from a cluster",
            "It encrypts messages between nodes using a shared consistent key derivation",
            "It detects memory leaks by hashing object references to a central registry"],
      ans:1, hints:["Standard hashing breaks when you add or remove a server — almost everything has to move.","This technique places both servers and data on a circular space so changes only affect neighbours."], boss:false },

    { world:0, q:"Which BST traversal order visits all nodes in ascending sorted sequence?",
      opts:["Preorder","Postorder","Level-order","Inorder"],
      ans:3, hints:["In a BST, smaller values are always to the left — which traversal follows that natural direction?","Visit everything smaller first, then the node itself, then everything larger."], boss:false },

    { world:0, q:"What is the space complexity of Merge Sort?",
      opts:["O(1)",
            "O(log n)",
            "O(n)",
            "O(n log n)"],
      ans:2, hints:["When merging two sorted halves, you can't merge them in-place — you need somewhere to put the result.","QuickSort can sort in-place; this algorithm cannot — it needs a temporary workspace."], boss:false },

    // ── World 1: Network Nebula ───────────────────────────────
    { world:1, q:"What is the primary purpose of BGP (Border Gateway Protocol)?",
      opts:["Dynamically assigning IP addresses to hosts joining an autonomous system",
            "Exchanging routing information between autonomous systems across the internet",
            "Encrypting data packets end-to-end between two internet-connected hosts",
            "Load balancing outbound traffic across multiple links within a data centre"],
      ans:1, hints:["Without this protocol, traffic between different ISPs would have no way to find its destination.","It's called a path-vector protocol — each route advertisement carries the full list of networks it passed through."], boss:false },

    { world:1, q:"What is ARP poisoning used to accomplish by an attacker?",
      opts:["Corrupting DNS cache entries to redirect users to malicious web servers",
            "Flooding a network switch with fake MAC addresses to cause packet flooding",
            "Mapping the attacker's MAC to a legitimate IP to intercept traffic via MITM",
            "Cracking password hashes captured from authentication handshake packets"],
      ans:2, hints:["Devices maintain a local table mapping IP addresses to hardware addresses — this attack corrupts that table.","The protocol being exploited has no authentication — anyone can send a fake reply."], boss:false },

    { world:1, q:"Which best describes a 'reflected' XSS (Cross-Site Scripting) attack?",
      opts:["Malicious script is stored permanently in the server's database for later execution",
            "Script injected into a URL parameter is returned and executed in the victim's browser",
            "Script is triggered only during a file upload and runs on the server filesystem",
            "Script is injected into a server-side template and executes with server privileges"],
      ans:1, hints:["The payload never gets stored anywhere — it travels in a link and is executed on arrival.","The server is just a mirror — it reflects the attacker's input straight back to the victim's browser."], boss:false },

    { world:1, q:"What is certificate pinning and why is it used in mobile applications?",
      opts:["Automatically rotating SSL certificates on a fixed schedule to limit exposure window",
            "Hardcoding expected server certificates in the client to detect MITM even with rogue CAs",
            "Physically attaching hardware security keys to server certificates in a data centre",
            "Caching DNS responses alongside their certificates to speed up TLS handshakes"],
      ans:1, hints:["The app refuses to trust any certificate it wasn't specifically told to trust in advance.","Even if a certificate authority signs a valid cert, this mechanism will reject it if it's unexpected."], boss:true },

    { world:1, q:"What metric does OSPF use when running Dijkstra's algorithm to find best paths?",
      opts:["Hop count","Bandwidth-based cost","Latency","Packet loss percentage"],
      ans:1, hints:["OSPF doesn't care how many hops a route takes — it cares about something more meaningful.","A 1Gbps link and a 1Mbps link might have the same hop count but very different costs in OSPF."], boss:false },

    { world:1, q:"What is the purpose of a DMZ in enterprise network architecture?",
      opts:["To block all inbound external traffic at the network perimeter firewall",
            "To host internet-facing services in an isolated zone separate from the internal network",
            "To accelerate firewall rule processing by offloading it to a dedicated segment",
            "To store private encryption keys in a physically separated network zone"],
      ans:1, hints:["Web-facing services live here — close enough to the internet to serve traffic, isolated enough to protect internal systems.","It's a buffer zone — if an attacker compromises something here, they still can't reach the internal network directly."], boss:false },

    { world:1, q:"What is SSRF (Server-Side Request Forgery)?",
      opts:["An injection attack that appends malicious SQL into server-side database queries",
            "An attack that tricks a server into making HTTP requests to internal or unintended targets",
            "A reflected scripting attack where payloads are injected through server-side forms",
            "An attack that forges session cookies to impersonate an authenticated server session"],
      ans:1, hints:["The attacker never touches internal systems directly — they convince the server to do it for them.","Cloud metadata endpoints like 169.254.169.254 are a common target — the server fetches them on the attacker's behalf."], boss:false },

    { world:1, q:"Which cryptographic property ensures a sender cannot deny having sent a message?",
      opts:["Confidentiality","Integrity","Non-repudiation","Authentication"],
      ans:2, hints:["A handwritten signature on paper has this property — digital signatures replicate it cryptographically.","If you used your private key to sign something, you can't later claim you didn't."], boss:false },

    // ── World 2: Code Citadel ─────────────────────────────────
    { world:2, q:"What is the fundamental difference between a deep copy and a shallow copy?",
      opts:["Deep copy only duplicates the top-level reference, leaving nested objects shared",
            "Shallow copy recursively clones all nested objects creating a fully independent graph",
            "Deep copy recursively duplicates all nested objects so no references are shared",
            "They are identical in behaviour when the object contains only primitive field types"],
      ans:2, hints:["If you modify a nested object in one copy and the other copy changes too — that tells you which type you made.","One copy is fully independent; the other shares references to nested objects with the original."], boss:false },

    { world:2, q:"What problem does the Observer design pattern primarily solve?",
      opts:["Object creation without specifying concrete classes",
            "Automatic notification of dependents when subject state changes",
            "Managing a pool of reusable resources across multiple clients",
            "Synchronising shared access between concurrent threads"],
      ans:1, hints:["This pattern is the foundation of every event listener system you've ever used.","One object changes — many others find out automatically without being directly called."], boss:false },

    { world:2, q:"What does the ACID property 'Isolation' guarantee in concurrent transactions?",
      opts:["Data is synchronously replicated to multiple servers before a commit completes",
            "Committed data is persisted to durable storage and survives a system crash",
            "Concurrent transactions execute without reading each other's uncommitted changes",
            "If a transaction fails at any step, all its changes are completely rolled back"],
      ans:2, hints:["Without this property, one transaction could read data that another transaction hasn't committed yet.","It's about parallel transactions appearing independent — as if they run one at a time."], boss:false },

    { world:2, q:"What is tail-call optimisation (TCO) and why does it matter?",
      opts:["Inlining a final function call by replacing the call with the function's body directly",
            "Caching the return value of the last call so repeated invocations avoid recomputation",
            "Reusing the current stack frame for a tail-recursive call to prevent stack overflow",
            "Unrolling the last iteration of a loop to reduce branch prediction misses"],
      ans:2, hints:["If the last thing a function does is call itself, there's no reason to keep the current stack frame.","Languages that mandate this let you write recursive loops without fear of running out of stack space."], boss:true },

    { world:2, q:"What is the time complexity of Dijkstra's algorithm using a binary min-heap?",
      opts:["O(V²)",
            "O(E log V)",
            "O(V log E)",
            "O(VE)"],
      ans:1, hints:["The bottleneck is how efficiently you can find and update the minimum-cost node.","Each of the E edges triggers one priority queue operation costing O(log V)."], boss:false },

    { world:2, q:"What is a closure in programming languages?",
      opts:["A syntax construct that marks the end of a block scope in curly-brace languages",
            "A function bundled with references to its surrounding lexical scope's variables",
            "An interface implementation technique that seals a class from further extension",
            "A garbage collection mechanism that reclaims memory from unreachable objects"],
      ans:1, hints:["A function that outlives the scope where it was born, yet still remembers that scope's variables.","JavaScript's async callbacks and Python's decorators both depend on this behaviour."], boss:false },

    { world:2, q:"What does 'idempotent' mean in the context of REST API design?",
      opts:["The API always returns a JSON-formatted response regardless of request outcome",
            "Sending the same request multiple times always produces the same server-side result",
            "The API requires a valid JWT bearer token on every request for authorisation",
            "Responses are always served from an intermediate cache on repeated requests"],
      ans:1, hints:["Accidentally sending a request twice should be safe for some HTTP methods — not others.","Deleting something twice has the same outcome as deleting it once — that's this property."], boss:false },

    { world:2, q:"What is memoization, and which paradigm uses it most extensively?",
      opts:["Pre-allocating heap memory for objects; used heavily in object-oriented programming",
            "Caching a function's output for previously seen inputs; central to dynamic programming",
            "Memory-mapping files into virtual address space; used in systems programming",
            "Lazily evaluating expressions only when first needed; used in functional programming"],
      ans:1, hints:["Why solve the same subproblem twice? Store the answer the first time.","Fibonacci without this is O(2^n); with it, O(n) — the savings are dramatic."], boss:false },

    // ── World 3: AI Realm ─────────────────────────────────────
    { world:3, q:"What is the vanishing gradient problem in deep neural networks?",
      opts:["GPU memory becoming exhausted when training very large models on limited hardware",
            "Gradients shrinking exponentially during backpropagation, starving early layers of updates",
            "The model overfitting rapidly on small datasets due to excessive parameter capacity",
            "The loss function diverging to infinity due to an excessively high learning rate"],
      ans:1, hints:["When you multiply a number less than 1 by itself many times, what happens to it?","The layers closest to the input receive a gradient signal so small it's practically zero."], boss:false },

    { world:3, q:"What is the purpose of the attention mechanism in the Transformer architecture?",
      opts:["Reducing total parameter count by sharing weights across all positions in the sequence",
            "Allowing the model to dynamically weight and focus on relevant parts of the input",
            "Speeding up training by skipping the computation of less important network layers",
            "Normalising activations across a batch to stabilise and accelerate the training process"],
      ans:1, hints:["The 2017 paper that changed NLP forever named this mechanism in its title.","It lets the model ask: 'given what I'm generating now, which input tokens matter most?'"], boss:false },

    { world:3, q:"What is Reinforcement Learning from Human Feedback (RLHF)?",
      opts:["Training robotic agents using sensor feedback gathered from physical environments",
            "Fine-tuning language models using human preference rankings as a reward signal",
            "Assigning random reward values during training to encourage diverse exploration",
            "A supervised image classification technique using human-annotated bounding boxes"],
      ans:1, hints:["Humans rank model outputs — that ranking signal is turned into a reward function.","It's the main technique used to turn a raw language model into a useful, aligned assistant."], boss:false },

    { world:3, q:"What is quantization in the context of deploying large language models?",
      opts:["Counting the total number of trainable parameters in a model's weight matrices",
            "Reducing numerical precision of weights from FP32 to INT8 to shrink model size",
            "Distributing a single model's layers across multiple GPU devices for inference",
            "Compressing the training dataset by removing redundant or duplicate text samples"],
      ans:1, hints:["Representing weights with fewer bits saves memory and speeds up inference.","FP32 uses 32 bits per weight — this process reduces that to 16, 8, or even 4 bits."], boss:true },

    { world:3, q:"What does 'fine-tuning' a pre-trained model mean in practice?",
      opts:["Manually adjusting hyperparameters like learning rate and batch size before training",
            "Continuing training on domain-specific data to adapt the model to a new task",
            "Pruning neurons whose activation magnitude falls below a defined threshold value",
            "Scaling up model size with additional layers to improve benchmark performance"],
      ans:1, hints:["The model already knows language — you just need to teach it your specific domain.","Starting from a pre-trained checkpoint instead of random weights cuts training cost dramatically."], boss:false },

    { world:3, q:"What does 'hallucination' mean when describing LLM behaviour?",
      opts:["The model becomes confused and loops when given an unusually long input prompt",
            "The model confidently generates factually incorrect or entirely fabricated information",
            "The model stops generating mid-response because it runs out of context window space",
            "The model produces highly repetitive text by sampling the same token repeatedly"],
      ans:1, hints:["The model generates with total confidence even when it has no reliable knowledge.","It's the AI equivalent of a student who makes up a plausible-sounding answer rather than saying 'I don't know'."], boss:false },


  // ╔═══════════════════════════════════════════════════════╗
  // ║  LEGEND  —  Expert-level, deep technical knowledge  ║
  // ╚═══════════════════════════════════════════════════════╝
  ],
  legend: [
    // ── World 0: Binary Jungle ────────────────────────────────
    { world:0, q:"What is the proven lower bound time complexity for all comparison-based sorting algorithms?",
      opts:["O(n)",
            "O(n log n)",
            "O(log n)",
            "O(n√n)"],
      ans:1, hints:["n elements can be arranged in n! different orders — any sorting algorithm must distinguish all of them.","A decision tree with n! leaves needs at least log₂(n!) levels — that's where this bound comes from."], boss:false },

    { world:0, q:"What is the Byzantine Generals Problem in distributed computing?",
      opts:["How to optimally allocate memory across heterogeneous multi-core processors",
            "How distributed nodes reach consensus when some participants may send conflicting messages",
            "How to colour a distributed graph with minimum colours avoiding adjacent conflicts",
            "How to detect and recover from circular deadlocks across distributed processes"],
      ans:1, hints:["The problem asks: how do you reach agreement when some of your communicators are actively lying?","Consensus is achievable only if fewer than one-third of participants are sending false information."], boss:false },

    { world:0, q:"What is a Bloom filter and what is its fundamental trade-off?",
      opts:["A self-balancing BST variant using probabilistic rotations; trade-off is high insertion cost",
            "A cache eviction algorithm that probabilistically evicts cold entries; trade-off is miss rate",
            "A space-efficient probabilistic set membership structure; trade-off is possible false positives",
            "A probabilistic sorting algorithm using hash buckets; trade-off is O(n²) worst case"],
      ans:2, hints:["This structure uses a bit array and multiple hash functions — it's probabilistic, not exact.","A negative result is always trustworthy; a positive result might be lying."], boss:false },

    { world:0, q:"What does the CAP theorem state about distributed data systems?",
      opts:["Any well-designed distributed system can simultaneously guarantee Consistency, Availability, and Partition tolerance",
            "A distributed system can guarantee at most two of Consistency, Availability, and Partition tolerance",
            "Partition tolerance is an optional property that only matters when the network is unreliable",
            "Eventual consistency is a formal proof that all three CAP properties can be simultaneously satisfied"],
      ans:1, hints:["This theorem says you can only guarantee two out of three desirable properties simultaneously.","Network partitions are inevitable — so the real choice is between consistency and availability when they occur."], boss:true },

    { world:0, q:"What is copy-on-write (COW) and where is it commonly applied?",
      opts:["All writes are immediately mirrored to a backup replica; used in RAID storage arrays",
            "A physical copy is deferred until the first write occurs; used in fork() and databases",
            "Memory is eagerly duplicated on every assignment statement; used in Java string interning",
            "All writes are logged to a write-ahead log before applying; used in LSM-tree databases"],
      ans:1, hints:["Two parties share a resource as long as neither modifies it — only a write triggers actual duplication.","Linux's fork() syscall relies on this to spawn processes cheaply without copying all parent memory upfront."], boss:false },

    { world:0, q:"What is the precise difference between a mutex and a semaphore?",
      opts:["They are functionally identical; the difference is only naming convention by platform",
            "A mutex is binary and owned by the locking thread; a semaphore is a general counter with no ownership",
            "A semaphore is always binary and used for mutual exclusion; a mutex can hold any count",
            "A mutex allows multiple threads to enter simultaneously; a semaphore allows only one"],
      ans:1, hints:["One is strictly binary and tied to the thread that acquired it; the other can count above 1 and has no owner.","A thread that didn't lock a mutex can't unlock it — that ownership rule is what makes them different."], boss:false },

    { world:0, q:"What does the Liskov Substitution Principle (LSP) formally state?",
      opts:["A class should have only one reason to change",
            "Subtypes must be behaviourally substitutable for their base types without breaking correctness",
            "Clients should not depend on interfaces containing methods they do not use",
            "High-level modules should depend on abstractions rather than concrete implementations"],
      ans:1, hints:["The 'L' in SOLID — it constrains how subclasses must behave relative to their parent.","Any code that works with the base type must continue working when handed a subtype instead."], boss:false },

    { world:0, q:"What is Software Transactional Memory (STM) and how does it handle conflicts?",
      opts:["A type of RAM physically optimised for low-latency transactional database workloads",
            "A concurrency mechanism applying database-style atomic transactions to memory; conflicts cause rollback",
            "A garbage collection strategy that reclaims transactional objects using reference counting",
            "A technique for memory-mapping database files into virtual address space for direct access"],
      ans:1, hints:["Threads assume no conflict will happen, do their work, then try to commit — conflict means retry.","It's optimistic: proceed first, resolve conflicts after — not pessimistic locking up front."], boss:false },

    // ── World 1: Network Nebula ───────────────────────────────
    { world:1, q:"What is HSTS (HTTP Strict Transport Security) and which attack does it prevent?",
      opts:["A header that rate-limits HTTP requests to prevent volumetric DDoS attacks on web servers",
            "A header forcing browsers to always use HTTPS for a domain, preventing SSL stripping attacks",
            "A mechanism that encrypts HTTP cookie values before they are transmitted to the client",
            "A server-side directive that sanitises HTTP input parameters to prevent SQL injection"],
      ans:1, hints:["Once a browser sees this header, it will refuse to visit the site over plain HTTP for a set duration.","It closes a specific window where an interceptor can silently downgrade an HTTPS connection to HTTP."], boss:false },

    { world:1, q:"What was the most significant security improvement TLS 1.3 introduced over TLS 1.2?",
      opts:["It introduced the certificate transparency log system to detect misissued certificates",
            "It removed static RSA key exchange and weak cipher suites, reducing handshake to 1-RTT",
            "It added Perfect Forward Secrecy for the very first time in any TLS specification version",
            "It replaced all symmetric encryption with asymmetric algorithms for improved key security"],
      ans:1, hints:["TLS 1.3 removed all the cipher suites that decades of cryptanalysis had weakened.","The handshake was redesigned to be faster — cutting a full round-trip out compared to TLS 1.2."], boss:false },

    { world:1, q:"What is Perfect Forward Secrecy (PFS) and how does it protect previously recorded sessions?",
      opts:["A protocol guarantee that ensures zero packets are dropped or reordered during transmission",
            "Use of ephemeral DHE/ECDHE keys per session so past sessions cannot be decrypted if long-term key leaks",
            "A mutual TLS requirement where both client and server must present valid certificates",
            "An automated process that rotates the server's long-term certificate every 24 hours"],
      ans:1, hints:["Each session uses a throwaway key pair that's deleted immediately after — historical sessions can't be decrypted later.","Static RSA key exchange doesn't have this property; ephemeral Diffie-Hellman variants do."], boss:false },

    { world:1, q:"What is BGP hijacking and what technique does an attacker use to execute it?",
      opts:["Crashing BGP routers by exploiting a buffer overflow in the BGP session state machine",
            "Forging TCP SYN packets to establish unauthorised BGP peer sessions with target routers",
            "Announcing more-specific IP prefixes not owned by the attacker's AS to attract victim traffic",
            "Brute-forcing the MD5 authentication password used to secure BGP peer sessions"],
      ans:2, hints:["BGP has no built-in way to verify that an AS actually owns the prefix it's announcing.","Announcing a more-specific prefix than the legitimate owner is enough to attract global traffic."], boss:true },

    { world:1, q:"What class of attack are Spectre and Meltdown, and what hardware feature do they exploit?",
      opts:["Firmware-level code injection attacks that exploit unsigned bootloader validation vulnerabilities",
            "Network-layer timing attacks that exploit predictable TCP sequence number generation patterns",
            "CPU side-channel attacks exploiting speculative execution and cache timing to leak secrets",
            "SQL injection attacks delivered via hardware device drivers to the operating system kernel"],
      ans:2, hints:["These vulnerabilities live in the CPU hardware itself, not in any software.","The processor executes instructions it might not need — and leaves measurable traces in the cache."], boss:false },

    { world:1, q:"What is the confused deputy problem in computer security?",
      opts:["A social engineering attack where an attacker impersonates a trusted administrator",
            "A privileged program being tricked into misusing its own authority on behalf of a less-privileged caller",
            "A DNS resolver being silently redirected to return attacker-controlled IP addresses",
            "A certificate authority being deceived into issuing certificates for domains it cannot verify"],
      ans:1, hints:["A highly trusted program is weaponised by a less trusted one — the trusted program becomes the attacker's proxy.","CSRF is a classic example: the browser's credentials are used to make requests the user never intended."], boss:false },

    { world:1, q:"What is the STRIDE threat modelling framework used for in security engineering?",
      opts:["Calculating a numerical CVSS score to rank the severity of discovered vulnerabilities",
            "Systematically categorising threats as Spoofing, Tampering, Repudiation, Info Disclosure, DoS, Elevation",
            "Analysing pcap network captures to identify malicious traffic patterns and attack signatures",
            "Structuring penetration testing engagements by defining scope, rules and reporting methodology"],
      ans:1, hints:["This Microsoft-developed framework gives threat modellers a checklist of six distinct attack categories.","Each letter of the acronym maps to one threat type — the last one involves gaining permissions you shouldn't have."], boss:false },

    { world:1, q:"What is a timing side-channel attack in cryptography?",
      opts:["Exploiting NTP clock drift between servers to forge future-dated authentication timestamps",
            "Inferring secret key bits by measuring statistical differences in cryptographic operation timing",
            "Injecting precise timing delays into compiled cryptographic code via a compiler backdoor",
            "Replaying previously captured authentication tokens that contain predictable timestamp fields"],
      ans:1, hints:["The cryptographic algorithm is theoretically sound — the vulnerability is in how it's coded.","A comparison function that exits early on the first mismatch leaks information through timing differences."], boss:false },

    // ── World 2: Code Citadel ─────────────────────────────────
    { world:2, q:"What is the precise difference between covariance and contravariance in generic type systems?",
      opts:["They are equivalent concepts; the distinction only matters in dynamically typed languages",
            "Covariance preserves subtype direction (List<Dog> as List<Animal>); contravariance reverses it (Consumer<Animal> as Consumer<Dog>)",
            "Covariance applies exclusively to method parameter types; contravariance to return types only",
            "Both concepts only apply in languages that have explicit variance annotation syntax like Kotlin"],
      ans:1, hints:["If you can use a List<Dog> where a List<Animal> is expected, the type parameter is varying in one direction.","Producers can use 'out'; Consumers can use 'in' — the direction of substitution reverses for consumers."], boss:false },

    { world:2, q:"What fundamental limit does the Halting Problem prove about computation?",
      opts:["Every recursive program will eventually terminate if given sufficient stack memory to execute",
            "No general algorithm can determine for all possible programs whether they will halt or run forever",
            "Turing machines cannot simulate arbitrary recursive functions beyond primitive recursion",
            "Programs that contain infinite loops consume only polynomial time before the OS terminates them"],
      ans:1, hints:["Turing proved this using a self-referential paradox — assuming a solution exists creates a contradiction.","The result is absolute: no algorithm, no matter how clever, can solve this for all possible programs."], boss:false },

    { world:2, q:"What is lock-free programming and what CPU primitive does it fundamentally rely on?",
      opts:["Eliminating all shared mutable state by passing immutable messages between isolated actors",
            "Using atomic Compare-And-Swap operations to guarantee system-wide progress without blocking threads",
            "Serialising all shared-memory access through a single global lock to prevent race conditions",
            "Removing all shared memory by distributing state exclusively through an actor-model framework"],
      ans:1, hints:["Every thread makes forward progress — no thread can be starved by another holding a lock indefinitely.","The CPU instruction at the core of this — compare-and-swap — does two things atomically in one operation."], boss:false },

    { world:2, q:"In type theory, what is a monad and why is it useful in functional programming?",
      opts:["A recursive algebraic data type that can reference itself through an indirection pointer",
            "A referentially transparent pure function guaranteed to produce no observable side effects",
            "A composable abstraction for sequencing computations that carry context such as errors or state",
            "An immutable persistent data structure designed for safe concurrent reads without locking"],
      ans:2, hints:["It's a pattern for chaining operations where each step might fail, have side effects, or carry state.","The two essential operations: wrap a value in the context, and chain a context-aware function onto it."], boss:true },

    { world:2, q:"What is the role of a GC root in a tracing garbage collector?",
      opts:["It identifies the single largest heap-allocated object as the starting point for collection",
            "It serves as the allocator's entry point for carving new objects out of heap memory regions",
            "It is the set of directly reachable references (stack, statics) from which live object tracing begins",
            "It marks the final object scheduled for collection in the current garbage collection cycle"],
      ans:2, hints:["The GC needs a starting point — something it always knows is alive — to begin tracing reachability.","Stack variables, static fields, and registers serve as these anchors; everything else must be reachable from them."], boss:false },

    { world:2, q:"What is the architectural difference between horizontal and vertical scaling?",
      opts:["Horizontal scaling increases frontend server count; vertical scaling increases backend server count",
            "Horizontal scaling adds more machines to a pool; vertical scaling adds resources to existing machines",
            "Vertical scaling is always the more cost-effective option at any scale of operation",
            "Horizontal scaling never requires any data partitioning or sharding strategy to implement"],
      ans:1, hints:["One approach hits a physical ceiling — you can only put so much RAM and CPU in one box.","The other approach adds more boxes — it's theoretically unlimited but requires rethinking data distribution."], boss:false },

    { world:2, q:"What is the CQRS (Command Query Responsibility Segregation) architectural pattern?",
      opts:["A caching strategy that routes read and write requests to separate cache tier instances",
            "An architecture that separates write operations (commands) from read operations (queries) into distinct models",
            "A database normalisation technique that eliminates update anomalies by separating write concerns",
            "A load balancing algorithm that routes commands to primary nodes and queries to replica nodes"],
      ans:1, hints:["The write path and read path are completely decoupled — each can be optimised and scaled independently.","Commands mutate state; queries only read it — this pattern formalises that distinction into the architecture."], boss:false },

    { world:2, q:"What is an event loop and why is Node.js non-blocking despite being single-threaded?",
      opts:["A multi-threaded scheduler embedded in the OS kernel that multiplexes JavaScript callbacks",
            "A single-thread mechanism that delegates I/O to async OS APIs and resumes callbacks on completion",
            "A polling loop that synchronously checks each I/O source in sequence on every iteration",
            "A thread pool manager inside the V8 engine that assigns each callback to a worker thread"],
      ans:1, hints:["The thread never sits idle waiting for disk or network — it delegates and moves on immediately.","I/O is handed to the OS; the single thread picks up the result later via the callback queue."], boss:false },

    // ── World 3: AI Realm ─────────────────────────────────────
    { world:3, q:"What is the KV cache in Transformer inference and why is it critical for performance?",
      opts:["A cache storing quantised model weights in GPU VRAM for faster weight loading between requests",
            "A cache storing key and value projections from prior tokens to avoid recomputation per new token",
            "A database cache storing tokenised training examples for efficient mini-batch retrieval",
            "A gradient cache accumulating backpropagation values across micro-batches during training"],
      ans:1, hints:["Without this, generating token N would require recomputing attention over all N-1 previous tokens.","It stores intermediate results from earlier decoding steps so each new token only needs one forward pass."], boss:false },

    { world:3, q:"What is speculative decoding and how does it accelerate LLM inference?",
      opts:["Randomly sampling multiple candidate tokens and selecting the one with highest log-probability",
            "Using a small draft model to propose multiple tokens that a large model verifies in one parallel pass",
            "Applying INT4 quantisation dynamically during inference to reduce per-token generation time",
            "Sharding the model across multiple GPUs so each device generates a different token simultaneously"],
      ans:1, hints:["A cheap model does the guessing; an expensive model does the verifying — but verification is parallel.","If the draft model's k tokens are mostly right, the large model can accept them all in a single forward pass."], boss:false },

    { world:3, q:"What is PEFT and what does LoRA specifically do to achieve parameter efficiency?",
      opts:["Fine-tuning only the final classification layer; LoRA adds skip connections between frozen layers",
            "Training a small parameter subset; LoRA injects trainable low-rank matrices A×B to approximate weight updates",
            "Training with a reduced learning rate schedule; LoRA adds L2 regularisation to frozen weight matrices",
            "Applying quantisation-aware fine-tuning; LoRA applies INT8 precision to all adapter weight matrices"],
      ans:1, hints:["The insight: you don't need to update all billions of parameters — the effective update lives in a low-dimensional subspace.","LoRA injects two small trainable matrices into each layer; their product approximates the full weight change."], boss:false },

    { world:3, q:"What is Constitutional AI (CAI) and which organisation developed it?",
      opts:["A binding legal framework governing AI deployment in high-risk sectors; developed by the European Union",
            "An alignment technique where a model self-critiques outputs against guiding principles; developed by Anthropic",
            "A hardware safety certification standard for AI accelerator chips; developed by NIST",
            "A mechanistic interpretability technique for understanding model internals; developed by DeepMind"],
      ans:1, hints:["Instead of human labellers judging every output, a written set of principles guides the model's self-critique.","It was developed by the AI safety company whose name is an anagram of 'Anthropic' — because it is Anthropic."], boss:true },

    { world:3, q:"What is FlashAttention and what specific bottleneck does it address?",
      opts:["A faster sub-word tokeniser that reduces vocabulary lookup time during the prefill phase",
            "An IO-aware attention algorithm tiling computation in SRAM to drastically cut memory bandwidth usage",
            "A post-training quantisation method that accelerates attention score computation to INT8 precision",
            "A dedicated silicon co-processor that offloads the attention matrix multiplication from the GPU"],
      ans:1, hints:["The standard attention algorithm is bottlenecked by memory bandwidth, not arithmetic operations.","By tiling computation and keeping data in fast SRAM rather than slow HBM, this avoids the bandwidth wall."], boss:false },

    { world:3, q:"What are 'emergent capabilities' in large language models?",
      opts:["Behaviours that are explicitly trained for and appear predictably across all model sizes",
            "Capabilities that appear abruptly beyond a critical scale threshold and are absent in smaller models",
            "Hallucinations and confabulations that emerge specifically after supervised fine-tuning",
            "Creative and stochastic behaviours that vary with the model's temperature sampling parameter"],
      ans:1, hints:["These abilities aren't gradual improvements — they appear abruptly at a certain scale threshold.","Chain-of-thought reasoning and multi-step arithmetic suddenly appeared in large models — no one designed them in."], boss:false },

  ],

  // ╔═══════════════════════════════════════════════════════╗
  // ║  ELITE  —  Expert tier, used ONLY for Legend Phase 2  ║
  // ╚═══════════════════════════════════════════════════════╝
  elite: [
    // ── World 0: Binary Jungle (Systems & Advanced Algorithms) ──
    { world:0, q:"What is the amortised time complexity of a single push into a dynamic array that doubles in size on overflow?",
      opts:["O(n) — because occasional resizes cost O(n)",
            "O(log n) — due to the logarithmic doubling strategy",
            "O(1) amortised — resize costs are spread across all insertions",
            "O(n²) — because copying increases cost each time"],
      ans:2, hints:["Occasional O(n) resizes happen exponentially rarely — between each resize, the array absorbs that cost across all future cheap inserts.","If you do n pushes total and the total work is proportional to n, the per-operation average is constant."], boss:false },

    { world:0, q:"Which algorithm correctly finds shortest paths in a graph with negative edge weights (no negative cycles)?",
      opts:["Dijkstra with a Fibonacci heap for O(E + V log V)",
            "Bellman-Ford with O(V × E) by relaxing all edges V-1 times",
            "A* search with an admissible heuristic that handles negatives",
            "Floyd-Warshall restricted to positive weights only"],
      ans:1, hints:["Dijkstra's greedy assumption breaks with negative edges — it can't revise a 'finalised' shortest path.","This algorithm relaxes every edge V-1 times and can also detect negative cycles — what is it?"], boss:false },

    { world:0, q:"What is cache thrashing and when does it occur?",
      opts:["The CPU cache flushes to RAM on every clock cycle causing a stall",
            "Frequent cache misses because the working set exceeds cache size, causing constant eviction and reload",
            "A deadlock where two threads each wait for the other's cache line indefinitely",
            "Write-back bottleneck where cache writes are slower than cache reads"],
      ans:1, hints:["It happens when the data actively used doesn't fit in the available cache.","The processor evicts lines it needs again immediately — creating a cycle of misses with almost no hits."], boss:false },

    { world:0, q:"What does the CAP theorem state about distributed systems?",
      opts:["A distributed system can achieve Consistency, Availability, and Partition tolerance simultaneously",
            "A distributed system can guarantee at most two of: Consistency, Availability, Partition tolerance",
            "CAP applies only to relational databases — NoSQL systems are exempt",
            "Partition tolerance is optional when network uptime exceeds 99.9%"],
      ans:1, hints:["Network partitions are a real-world inevitability — when one occurs, you must choose between the other two properties.","No distributed system can be perfectly consistent, always available, AND fault-tolerant simultaneously — pick two."], boss:true },

    { world:0, q:"What is a Bloom filter and what is its key trade-off?",
      opts:["An exact membership set using O(1) space per stored element",
            "A probabilistic membership structure that allows false positives but never false negatives",
            "A sorted set with O(log n) insert and O(1) lookup using bit arrays",
            "A lock-free concurrent hash map for multi-threaded lookups"],
      ans:1, hints:["It can definitively say 'not in the set' — but can only say 'probably in the set', never 'definitely in the set'.","The trade-off is space efficiency at the cost of occasional false positives — it never fails to report an element that IS there."], boss:false },

    { world:0, q:"What is the difference between a process and a thread at the OS level?",
      opts:["Processes share the same address space; threads each have isolated memory",
            "Threads share the process address space; processes have isolated memory and resources",
            "The OS scheduler treats processes and threads identically — there is no difference",
            "Threads cannot perform I/O operations; only processes can make system calls"],
      ans:1, hints:["One is a heavyweight execution unit with its own memory space; the other is lighter and lives inside the first.","Multiple threads communicate directly via shared memory — why is that easier than inter-process communication?"], boss:false },

    { world:0, q:"For a greedy algorithm to guarantee an optimal solution, which two properties must hold?",
      opts:["Overlapping subproblems and memoizability (same as dynamic programming)",
            "The greedy choice property and optimal substructure",
            "Polynomial-time solvability (P class) and monotone objective function",
            "DAG graph structure and non-negative edge weights"],
      ans:1, hints:["Not every problem can be solved greedily — there must be a mathematical guarantee.","Two conditions: making the locally best choice never rules out a globally optimal solution (greedy choice), and optimal subproblem solutions compose into a global optimum (optimal substructure)."], boss:false },

    { world:0, q:"In a B-tree of order m, what is the maximum number of keys a single node can hold?",
      opts:["m keys","m − 1 keys","2m keys","m + 1 keys"],
      ans:1, hints:["B-tree order defines the maximum number of children, not keys — keys and children are related by one.","If a node can have at most m children, it holds exactly one fewer key than that."], boss:false },

    // ── World 1: Network Nebula (Advanced Security & Protocols) ──
    { world:1, q:"What is a timing side-channel attack?",
      opts:["A flood attack that exhausts server resources with high-rate requests",
            "An attack that infers secret information by measuring how long cryptographic operations take",
            "A man-in-the-middle attack that introduces delays to disrupt session synchronisation",
            "A replay attack reusing captured auth tokens within a valid time window"],
      ans:1, hints:["The attack doesn't break the math of cryptography — it exploits physical implementation details.","If decryption takes slightly different amounts of time depending on secret key bits, that timing difference leaks information."], boss:false },

    { world:1, q:"What does Perfect Forward Secrecy (PFS) guarantee?",
      opts:["Past session traffic cannot be decrypted even if the server's long-term private key is later compromised",
            "Every individual packet is encrypted with a unique key so packet loss doesn't affect decryption",
            "Authentication is verified forward-in-time to prevent pre-authentication attacks",
            "The session key is derived from the server certificate so it is always recoverable"],
      ans:0, hints:["The key insight is ephemeral session keys that are generated fresh and never stored long-term.","Even if an attacker records today's encrypted traffic and later steals the server's private key, they still cannot decrypt past sessions."], boss:false },

    { world:1, q:"In TLS 1.3, what is the security trade-off of the 0-RTT resumption feature?",
      opts:["Eliminates the handshake entirely; forward secrecy is permanently broken for resumed sessions",
            "Allows data to be sent on the first message using a cached session key; vulnerable to replay attacks",
            "Reduces key size from 256-bit to 128-bit; slightly weaker encryption for faster resumption",
            "Compresses the certificate chain; revocation checking is disabled for resumed sessions"],
      ans:1, hints:["0-RTT means the client sends application data immediately without waiting for a round-trip handshake.","If an attacker captures that first message containing application data, what could they do with it?"], boss:false },

    { world:1, q:"What is BGP (Border Gateway Protocol) and what problem does it solve?",
      opts:["A link-state protocol inside a single ISP's network for fast internal convergence",
            "The inter-domain routing protocol that exchanges reachability information between autonomous systems",
            "A distance-vector protocol replacing OSPF in modern data centre fabric networks",
            "A protocol that dynamically assigns IP addresses to enterprise devices"],
      ans:1, hints:["This is the routing protocol that holds the entire internet together at the highest level.","Each ISP is an autonomous system — this protocol decides how traffic flows between them globally."], boss:true },

    { world:1, q:"What is certificate pinning and why is it used in mobile apps?",
      opts:["Storing the server's expected certificate or public key in the client to block MITM attacks",
            "Permanently revoking a certificate by attaching it to a certificate revocation list",
            "Binding a TLS certificate to a specific IP to prevent hostname-based spoofing",
            "Caching expired certificates in the client to extend their validity period"],
      ans:0, hints:["The client refuses to accept a server certificate that doesn't match the value it was built with.","Even if an attacker presents a certificate signed by a trusted CA, pinning detects the unexpected mismatch."], boss:false },

    { world:1, q:"What is DNS cache poisoning and how does DNSSEC mitigate it?",
      opts:["Flooding DNS servers with queries; DNSSEC rate-limits to prevent exhaustion",
            "Injecting forged DNS records into a resolver's cache; DNSSEC uses cryptographic signatures to verify record authenticity",
            "Intercepting DNS queries in transit; DNSSEC encrypts all DNS traffic end-to-end like HTTPS",
            "Corrupting zone files on authoritative servers; DNSSEC maintains redundant zone replicas"],
      ans:1, hints:["The attack makes a recursive resolver cache a malicious IP as the address for a legitimate domain.","DNSSEC adds digital signatures to DNS records — a resolver can verify the record hasn't been tampered with."], boss:false },

    { world:1, q:"What is a VLAN (Virtual LAN) and why is it used?",
      opts:["A virtual IP range used by cloud providers for multi-tenant network isolation",
            "A logical network segment that isolates broadcast domains within a physical switch infrastructure",
            "A VPN tunnel between two geographically separated offices over the public internet",
            "A protocol for automatically assigning IP addresses across enterprise networks"],
      ans:1, hints:["A single physical switch can behave as multiple isolated switches using this technology.","Finance and HR on the same physical switch can be isolated from each other in separate broadcast domains — without separate hardware."], boss:false },

    { world:1, q:"What is the difference between IDS and IPS in network security?",
      opts:["IDS encrypts traffic; IPS decrypts and inspects it before forwarding",
            "IDS detects and alerts on suspicious activity; IPS detects AND actively blocks or drops malicious traffic",
            "IPS is a newer term that has fully replaced IDS in modern network architectures",
            "IDS operates at Layer 7; IPS operates only at Layer 3 of the OSI model"],
      ans:1, hints:["The D stands for Detection; the P stands for Prevention — the names literally describe the difference.","An IDS is passive — it watches and alerts. An IPS is inline and can take action."], boss:false },

    // ── World 2: Code Citadel (Advanced Arch & Distributed Systems) ──
    { world:2, q:"What is the difference between optimistic and pessimistic concurrency control in databases?",
      opts:["Optimistic locks rows immediately; pessimistic checks for conflicts only at commit",
            "Pessimistic locks rows upfront preventing conflicts; optimistic allows progress and detects conflicts only at commit",
            "Optimistic is for reads only; pessimistic is for writes only",
            "There is no practical difference — both produce identical transaction throughput"],
      ans:1, hints:["One assumes conflicts are rare and only checks at the end — the other assumes conflicts are likely and prevents them upfront.","Optimistic concurrency suits read-heavy workloads; pessimistic suits high-contention write-heavy scenarios."], boss:false },

    { world:2, q:"What is the difference between a mutex and a semaphore?",
      opts:["A mutex can be released by any thread; a semaphore can only be released by its acquirer",
            "A mutex is a binary lock owned by the acquiring thread; a semaphore is a counter controlling concurrent access by multiple threads",
            "Semaphores are OS kernel constructs only; mutexes are userspace-only",
            "A mutex prevents deadlocks by design; semaphores always risk deadlock"],
      ans:1, hints:["One is strictly binary (locked/unlocked) and is owned — the other is a counter used for signalling or limiting concurrent access.","A car park with 10 spaces uses a semaphore (count of 10) — it doesn't care which thread takes which spot, just that no more than 10 enter."], boss:false },

    { world:2, q:"What are the four Coffman conditions required for a deadlock to occur?",
      opts:["Starvation, hold-and-wait, circular wait, preemption",
            "Mutual exclusion, hold-and-wait, no preemption, circular wait",
            "Shared memory, busy-waiting, priority inversion, lock contention",
            "Data dependency, cache coherence failure, write-after-read, read-after-write"],
      ans:1, hints:["All four must hold simultaneously — breaking any single one prevents deadlock.","Think: resources can't be shared (mutual exclusion), threads hold and wait for more (hold-and-wait), nothing is taken by force (no preemption), and threads form a cycle of waiting (circular wait)."], boss:true },

    { world:2, q:"What is the purpose of a load balancer, and what is the key difference between L4 and L7 load balancing?",
      opts:["Load balancers assign static IPs; L4 balances by CPU load; L7 balances by memory",
            "Load balancers distribute traffic across servers; L4 routes by TCP/IP info; L7 routes by HTTP content",
            "L4 load balancing is deprecated; all modern load balancers operate at L7 only",
            "Load balancers provide TLS; L4 uses SSL; L7 uses TLS 1.3 exclusively"],
      ans:1, hints:["The layer number indicates which OSI layer the balancer inspects to make its routing decision.","An L7 balancer can route /api to one server pool and /static to another — L4 can't do that because it never reads HTTP."], boss:false },

    { world:2, q:"What is the SOLID principle of Dependency Inversion?",
      opts:["High-level modules should depend directly on low-level concrete implementations for tight integration",
            "High-level modules should not depend on low-level modules; both should depend on abstractions",
            "All dependencies must be injected at runtime using a DI framework",
            "Each module should have at most one dependency to minimise coupling"],
      ans:1, hints:["It's about the direction of the dependency arrow — which layer defines the interfaces?","Your business logic shouldn't know about your specific database driver — it should depend on an abstract repository interface that the driver implements."], boss:false },

    { world:2, q:"What is event sourcing as an architectural pattern?",
      opts:["An observer pattern where UI components subscribe to DOM events for reactive updates",
            "Storing application state as a sequence of immutable events rather than only the current state snapshot",
            "A pub/sub messaging architecture where producers push to consumer queues asynchronously",
            "Caching external API responses as events for offline-first application support"],
      ans:1, hints:["Instead of storing 'current balance = $500', you store every transaction that produced that balance.","You can replay the entire event log to reconstruct any past state — audit trails and time-travel debugging come for free."], boss:false },

    { world:2, q:"What is memoization, and how does it differ from tabulation (bottom-up DP)?",
      opts:["Memoization fills a table bottom-up from small to large; tabulation is top-down with recursion",
            "Memoization is top-down recursion with result caching; tabulation fills a table iteratively bottom-up",
            "They are the same technique with different names in different communities",
            "Memoization always uses less memory than tabulation because it only stores the final answer"],
      ans:1, hints:["One starts with the full problem, breaks it recursively, and caches results; the other starts with the smallest subproblems and builds up iteratively.","Memoization is lazy — it only computes subproblems that are actually needed during recursion."], boss:false },

    { world:2, q:"What is CQRS (Command Query Responsibility Segregation)?",
      opts:["A caching strategy routing reads and writes to separate cache tiers",
            "An architecture separating write operations (commands) from read operations (queries) into distinct models",
            "A database normalisation technique eliminating update anomalies in write-heavy schemas",
            "A load-balancing algorithm routing commands to primary nodes and queries to replicas"],
      ans:1, hints:["The write path and read path are completely decoupled — each can be optimised and scaled independently.","Commands mutate state; queries only read state — this pattern formalises that distinction into separate models."], boss:false },

    // ── World 3: AI Realm (Expert AI/ML) ──────────────────────
    { world:3, q:"What is the difference between RLHF and Constitutional AI (CAI) as alignment techniques?",
      opts:["RLHF uses a reward model trained on human preferences; CAI uses AI self-critique guided by written principles to reduce dependence on human labellers",
            "RLHF is fully unsupervised; CAI requires human labels for every training example",
            "CAI was developed by OpenAI; RLHF was developed by Anthropic for Claude specifically",
            "RLHF is stronger because it uses human judgement directly on every output"],
      ans:0, hints:["Both aim to align AI behaviour — but one uses human raters to score outputs while the other tries to reduce that dependence.","CAI writes a set of principles (a 'constitution') and has the model critique its own outputs against them — reducing labeller cost."], boss:false },

    { world:3, q:"What are the roles of Query (Q), Key (K), and Value (V) matrices in Transformer self-attention?",
      opts:["K stores positions; Q stores token identity; V stores precomputed attention weights",
            "Q is the 'question' from the current token; K is what other tokens 'advertise'; V is the content retrieved when Q and K match",
            "K and Q compute cosine similarity for retrieval; V is the output after layer normalisation",
            "Q is trained during fine-tuning; K and V are frozen from pretraining"],
      ans:1, hints:["Think of it as a soft database lookup: Q is the search query, K is the index of each entry, V is the content to retrieve.","The dot product of Q and Kᵀ gives attention scores — high-scoring (V) items contribute more to the output."], boss:false },

    { world:3, q:"What is the O(n²) complexity problem with standard Transformer attention and how does sparse attention address it?",
      opts:["Standard attention is O(n) in memory; sparse reduces this to O(log n) using fixed patterns",
            "Standard attention is O(n²) in sequence length because every token attends to every other; sparse attention limits each token to a subset of others",
            "Sparse attention solves the vanishing gradient problem by skipping alternate attention layers",
            "Standard attention is O(n³); sparse attention parallelises across GPU cores to reduce wall-clock time"],
      ans:1, hints:["In full attention, a sequence of n tokens requires computing n × n attention scores — that grows quadratically.","Long-document models can't afford this — so they restrict each token to attending to nearby tokens or a small fixed set of global tokens."], boss:false },

    { world:3, q:"What causes hallucination in LLMs, and why can't the model simply 'look up' the correct answer?",
      opts:["Hallucination is caused by vanishing gradients corrupting factual weights during deep training",
            "The model predicts statistically likely next tokens — there is no separate factual lookup mechanism to verify correctness",
            "Hallucination is a fine-tuning artefact; base pretrained models do not hallucinate",
            "Hallucination is a prompt injection vulnerability triggered by adversarial inputs"],
      ans:1, hints:["The model is a next-token predictor — it generates what sounds likely given context, not what it has 'verified' against a ground-truth source.","It confidently produces text because the token sequence is probable, even when the underlying claim is factually wrong."], boss:true },

    { world:3, q:"What is the KV cache in Transformer inference and why is it critical for performance?",
      opts:["A cache of quantised model weights in GPU VRAM to avoid re-loading weights between requests",
            "A cache storing key and value projections from prior tokens so each new token only needs one forward pass",
            "A database cache of tokenised training examples for efficient mini-batch retrieval",
            "A gradient accumulation cache for micro-batch backpropagation during fine-tuning"],
      ans:1, hints:["Without it, generating token N would require recomputing attention over all N-1 previous tokens — that's O(n²) total work.","By caching the K and V projections computed in earlier steps, each new token only needs to compute its own Q and attend to the cached K/V."], boss:false },

    { world:3, q:"What is LoRA (Low-Rank Adaptation) and why does it enable parameter-efficient fine-tuning?",
      opts:["Fine-tuning only the final classification layer while freezing all transformer blocks",
            "Injecting two small trainable low-rank matrices A and B per layer so only A×B (not the full weight update) is trained",
            "Training with a reduced learning rate; LoRA adds L2 regularisation to frozen weight matrices",
            "Applying INT8 quantisation-aware fine-tuning to all adapter weight matrices"],
      ans:1, hints:["The insight: the effective update to model weights during fine-tuning lives in a low-dimensional subspace.","Instead of updating a huge W matrix directly, you add a low-rank correction: W + A×B, training only A and B — orders of magnitude fewer parameters."], boss:false },

  ]
};

// ═══════════════════════════════════════════════════════════════════
//  GAME STATE
// ═══════════════════════════════════════════════════════════════════
let state = {
  teamName:      "",
  difficulty:    "pro",
  phase:         1,          // 1 = main game, 2 = bonus round
  score:         POINTS_REGULAR,
  hintsUsed:     0,
  startTime:     null,
  currentWorld:  null,
  currentQ:      null,
  worldProgress: [0, 0, 0, 0],
  worldUnlocked: [true, false, false, false],
  worldComplete:  [false, false, false, false],
  worldQuestions: [],
  questionHintsUsed: 0,
  sessionId:     null,
  soundEnabled:  true,
  cooldownTimer: null,
  fbDb:          null,
  fbConnected:   false,
  prevScreen:    null,
};

// ═══════════════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════════════
function init() {
  buildStarfield();
  injectDifficultySelector();
  initFirebase();
  document.getElementById("feedbackNextBtn").addEventListener("click", onFeedbackNext);
  document.getElementById("soundToggle").addEventListener("click", toggleSound);
  window.addEventListener("offline", () => document.getElementById("offlineBanner").style.display = "flex");
  window.addEventListener("online",  () => document.getElementById("offlineBanner").style.display = "none");
}

// ─── Inject difficulty selector into landing card ─────────────────
function injectDifficultySelector() {
  const rulesGrid = document.querySelector(".rules-grid");
  if (!rulesGrid) return;

  const diffLabels = {
    rookie: 'Easier Questions',
    pro:    'Harder Questions',
    legend: 'Expert Questions',
  };

  const html = `
    <div class="difficulty-selector" id="difficultySelectorWrap">
      <div class="diff-label">⚔️ Choose Your Difficulty</div>
      <div class="diff-options">
        ${Object.entries(DIFFICULTY).map(([key, cfg]) => `
          <label class="diff-option ${key === 'pro' ? 'selected' : ''}" data-diff="${key}">
            <input type="radio" name="difficulty" value="${key}" ${key==='pro'?'checked':''} style="display:none">
            <span class="diff-icon">${cfg.label.split(' ')[0]}</span>
            <span class="diff-name">${cfg.label.split(' ').slice(1).join(' ')}</span>
            <span class="diff-level-tag">${diffLabels[key]}</span>
            <span class="diff-desc">${cfg.description}</span>
          </label>
        `).join('')}
      </div>
      <div class="pts-table">
        <div class="pts-table-title">💰 All modes: 20 pts regular · 30 pts boss — perfectly equal!</div>
        <div class="pts-row equal-note">Same max score (640 pts) for every team · Harder mode = harder questions only</div>
      </div>
      <div class="diff-warning-rookie" id="rookieWarning" style="display:none"></div>
    </div>`;
  rulesGrid.insertAdjacentHTML("afterend", html);

  document.querySelectorAll(".diff-option").forEach(el => {
    el.addEventListener("click", () => {
      document.querySelectorAll(".diff-option").forEach(d => d.classList.remove("selected"));
      el.classList.add("selected");
      el.querySelector("input").checked = true;
      state.difficulty = el.dataset.diff;
    });
  });
}

// ─── Firebase ─────────────────────────────────────────────────────
let _lbUnsubscribe = null;   // holds the onValue unsubscribe fn to avoid duplicate listeners
let _lbCache = [];           // latest scores from Firebase, always fresh

function initFirebase() {
  try {
    if (firebaseConfig.apiKey === "YOUR_API_KEY") throw new Error("not configured");
    const app = initializeApp(firebaseConfig);
    state.fbDb = getDatabase(app);

    // Connection state listener
    onValue(ref(state.fbDb, ".info/connected"), snap => {
      state.fbConnected = !!snap.val();
      updateConnUI(state.fbConnected);
      if (state.fbConnected && state.teamName) syncScoreToFirebase();
    });

    // ONE persistent real-time listener on scores — fires immediately then on every change
    _lbUnsubscribe = onValue(ref(state.fbDb, "scores"), snap => {
      const data = snap.val() || {};
      _lbCache = Object.values(data).sort((a, b) => b.score - a.score || (a.elapsedSeconds||0) - (b.elapsedSeconds||0));
      // Mark as connected the moment we get any data response (even empty)
      state.fbConnected = true;
      updateConnUI(true);
      // Always re-render leaderboard if it's open
      if (document.getElementById("screen-host")?.classList.contains("active")) {
        renderLbDOM(_lbCache);
      }
    }, err => {
      console.warn("Scores listener error:", err);
    });

  } catch(e) {
    updateConnUI(false);
  }
}

function updateConnUI(connected) {
  const dot = document.getElementById("connDot");
  const txt = document.getElementById("connTxt");
  if (!dot) return;
  dot.className = "conn-dot " + (connected ? "ok" : "err");
  txt.className = "conn-txt " + (connected ? "ok" : "err");
  txt.textContent = connected ? "Connected to server ✓" : "Offline mode — scores saved locally";
}

// ═══════════════════════════════════════════════════════════════════
//  SCREEN MANAGEMENT
// ═══════════════════════════════════════════════════════════════════
function showScreen(id, prev) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) {
    target.classList.add("active");
    if (prev !== undefined) state.prevScreen = prev;
  }
}

// ═══════════════════════════════════════════════════════════════════
//  GAME START
// ═══════════════════════════════════════════════════════════════════
window.startGame = function() {
  const nameInput = document.getElementById("teamNameInput");
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.classList.add("shake");
    setTimeout(() => nameInput.classList.remove("shake"), 500);
    showToast("⚠️ Please enter your team name!", "warn");
    return;
  }

  state.teamName   = name;
  state.difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || "pro";
  state.score      = POINTS_REGULAR;  // starting bonus = 1 regular question's worth (20 pts) — ensures hint deductions always work
  state.hintsUsed  = 0;
  state.startTime  = Date.now();
  state.worldProgress = [0,0,0,0];
  state.worldUnlocked = [true,false,false,false];
  state.worldComplete  = [false,false,false,false];
  state.worldTotals   = [8,8,8,6];   // default; overwritten by selectQuestionsForGame
  state.totalQuestions = 30;
  state.sessionId  = name.toLowerCase().replace(/\s+/g,'_') + "_" + Date.now();

  selectQuestionsForGame();
  renderHub();
  showScreen("screen-hub");
  showToast(`⚡ Quest started on ${DIFFICULTY[state.difficulty].label}!`, "info");
  playSound("start");
  setTimeout(() => startMusic(), 900);  // let start fanfare finish first
};

// ─── Use ALL questions from bank per world, boss question placed last ─
function selectQuestionsForGame() {
  const diff = state.difficulty;
  const pool = QUESTION_BANK[diff];
  state.worldQuestions = WORLDS.map((_, wi) => {
    const worldPool = pool.filter(q => q.world === wi);
    const regular   = shuffle(worldPool.filter(q => !q.boss));
    const bosses    = shuffle(worldPool.filter(q =>  q.boss));
    // Place all regulars first, boss question(s) at the end
    return [...regular, ...bosses];
  });
  // Pre-compute per-world totals for easy access
  state.worldTotals = state.worldQuestions.map(qs => qs.length);
  // Total questions = sum of all worlds
  state.totalQuestions = state.worldTotals.reduce((a, b) => a + b, 0);
}

// ═══════════════════════════════════════════════════════════════════
//  HUB
// ═══════════════════════════════════════════════════════════════════
function renderHub() {
  document.getElementById("hubTeamName").textContent = state.teamName;
  const totalAnswered = state.worldProgress.reduce((a,b) => a+b, 0);
  const total = state.totalQuestions || 30;
  const phaseLabel = state.phase === 2 ? ` · 🔥 ${BONUS_CONFIG[state.difficulty].label}` : '';
  document.getElementById("hubProgress").textContent = `Progress: ${totalAnswered}/${total} Questions${phaseLabel}`;
  document.getElementById("hubScore").textContent     = `${state.score} pts`;

  const grid = document.getElementById("portalsGrid");
  const modeLabel = state.phase === 2 ? BONUS_CONFIG[state.difficulty].label : DIFFICULTY[state.difficulty].label;
  grid.innerHTML = WORLDS.map((w, i) => {
    const done     = state.worldComplete[i];
    const locked   = !state.worldUnlocked[i];
    const progress = state.worldProgress[i];
    const worldTotal = state.worldTotals?.[i] || 8;
    const cls      = locked ? "portal locked" : (done ? "portal complete" : (state.phase === 2 ? "portal active bonus-portal" : "portal active"));
    return `
      <div class="${cls}" onclick="${locked ? '' : `enterWorld(${i})`}" style="--world-glow:${w.glow}">
        <div class="portal-icon">${done ? '✅' : (locked ? '🔒' : w.emoji)}</div>
        <div class="portal-name">${w.name}</div>
        <div class="portal-progress">${progress}/${worldTotal} ${done ? '· COMPLETE' : (locked ? '· LOCKED' : '')}</div>
        ${!locked && !done ? `<div class="portal-diff-badge">${modeLabel}</div>` : ''}
      </div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════════════
//  WORLD VIEW
// ═══════════════════════════════════════════════════════════════════
window.enterWorld = function(worldIdx) {
  state.currentWorld = worldIdx;
  renderWorldNodes(worldIdx);
  showScreen(`screen-world-${worldIdx}`, "screen-hub");
  updateWorldScore(worldIdx);
  spawnParticles(worldIdx);
};

window.returnToHub = function() {
  renderHub();
  showScreen("screen-hub");
};

function renderWorldNodes(wi) {
  const questions  = state.worldQuestions[wi];
  const count      = questions.length;           // 6 or 8
  const progress   = state.worldProgress[wi];
  const container  = document.getElementById(`worldNodes${wi}`);
  const svg        = document.getElementById(`worldPath${wi}`);

  // ── Generate a winding snake path scaled for 'count' nodes ────────
  // Grid: 2 columns, rows = ceil(count/2), nodes alternate left/right
  const cols   = 2;
  const rows   = Math.ceil(count / cols);
  const padX   = 120, padY = 60;
  const colW   = 560;                    // available width between columns
  const rowH   = Math.min(90, (600 - padY * 2) / (rows - 1 || 1));

  const positions = [];
  for (let r = 0; r < rows; r++) {
    const goLeft = r % 2 === 0;         // snake: alternate direction each row
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + (goLeft ? c : (cols - 1 - c));
      if (idx >= count) continue;
      const x = padX + (goLeft ? c : (cols - 1 - c)) * colW;
      const y = padY + r * rowH;
      positions[idx] = { x, y };
    }
  }

  // ── Build smooth SVG path through nodes ───────────────────────────
  let pathD = `M${positions[0].x},${positions[0].y}`;
  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i-1];
    const curr = positions[i];
    const cx   = (prev.x + curr.x) / 2;
    const cy   = (prev.y + curr.y) / 2;
    pathD += ` Q${cx},${prev.y} ${curr.x},${curr.y}`;
  }

  svg.innerHTML = `
    <defs>
      <filter id="glow${wi}">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <path d="${pathD}" stroke="rgba(255,255,255,0.22)" stroke-width="3"
          fill="none" stroke-dasharray="8,4"/>
    ${positions.slice(0, progress).map(p =>
      `<circle cx="${p.x}" cy="${p.y}" r="26"
        fill="rgba(0,200,100,0.25)" stroke="#52b788" stroke-width="2"
        filter="url(#glow${wi})"/>`
    ).join('')}
    ${progress < count ? `
    <circle cx="${positions[progress].x}" cy="${positions[progress].y}" r="30"
      fill="rgba(255,215,0,0.18)" stroke="gold" stroke-width="2.5"
      filter="url(#glow${wi})">
      <animate attributeName="r" values="28;34;28" dur="1.5s" repeatCount="indefinite"/>
    </circle>` : ''}`;

  // ── Node elements ─────────────────────────────────────────────────
  container.innerHTML = positions.map((p, i) => {
    const answered = i < progress;
    const active   = i === progress;
    const locked   = i > progress;
    const q        = questions[i];
    const isBoss   = q?.boss;
    return `
      <div class="world-node ${answered?'answered':''} ${active?'active':''} ${locked?'locked':''} ${isBoss?'boss':''}"
           style="left:${p.x - 28}px; top:${p.y - 28}px"
           onclick="${active ? `openQuestion(${wi},${i})` : ''}"
           title="${isBoss ? '👑 BOSS QUESTION' : `Question ${i+1}`}">
        <div class="node-num">${answered ? '✓' : (locked ? '🔒' : (isBoss ? '👑' : i+1))}</div>
        <div class="node-pts">${calcPts(isBoss ? POINTS_BOSS : POINTS_REGULAR)} pts</div>
      </div>`;
  }).join('');
}

function updateWorldScore(wi) {
  const el = document.getElementById(`worldScore${wi}`);
  if (el) el.textContent = `${state.score} pts`;
}

// ═══════════════════════════════════════════════════════════════════
//  QUESTION SCREEN
// ═══════════════════════════════════════════════════════════════════
window.openQuestion = function(worldIdx, questionIdx) {
  const q = state.worldQuestions[worldIdx][questionIdx];
  if (!q) return;

  state.currentQ = { worldIdx, questionIdx };
  state.questionHintsUsed = 0;

  const diff  = DIFFICULTY[state.difficulty];
  const world = WORLDS[worldIdx];
  const totalAnswered = state.worldProgress.reduce((a,b)=>a+b,0);
  const grandTotal    = state.totalQuestions || 30;

  // Header
  document.getElementById("qWorldBadge").textContent = `${world.emoji} ${world.name}`;
  document.getElementById("qScore").textContent       = `${state.score} pts`;
  document.getElementById("qNumber").textContent      = `Question ${totalAnswered+1} of ${grandTotal}`;
  document.getElementById("qProgressFill").style.width = `${(totalAnswered/grandTotal)*100}%`;

  // Question text
  document.getElementById("qText").textContent = q.q;

  // Remove any stale banners before adding
  document.querySelectorAll(".boss-banner, .mult-banner").forEach(b => b.remove());

  // Phase/difficulty banner
  const effRegular = calcPts(POINTS_REGULAR);
  const effBoss    = calcPts(POINTS_BOSS);
  const bannerLabel = state.phase === 2 ? BONUS_CONFIG[state.difficulty].label : diff.label;
  document.getElementById("qNumber").insertAdjacentHTML("afterend",
    `<div class="mult-banner ${state.difficulty} ${state.phase === 2 ? 'bonus-phase' : ''}">
       ${bannerLabel} &nbsp;·&nbsp; ${q.boss ? effBoss : effRegular} pts this question
     </div>`);

  if (q.boss) document.getElementById("qText").insertAdjacentHTML("beforebegin",
    `<div class="boss-banner">👑 BOSS QUESTION — ${effBoss} pts</div>`);

  // Hint area
  const hintCost   = currentHintCost();
  const hintsAvail = diff.maxHintsPerQuestion - state.questionHintsUsed;
  document.getElementById("hintsLeft").textContent = hintsAvail;
  const costEl = document.getElementById("hintCostDisplay");
  if (costEl) costEl.textContent = `${hintCost} pts`;
  document.getElementById("hintTextBox").innerHTML = "";
  document.getElementById("hintTextBox").style.display = "none";
  document.getElementById("hintBtn").disabled = (hintsAvail <= 0);
  document.getElementById("hintBtn").textContent = `Use Hint (−${hintCost})`;

  // Options — shuffle order every render so correct answer is never predictable
  const labels = ["A","B","C","D"];
  const shuffled = q.opts
    .map((text, i) => ({ text, correct: i === q.ans }))
    .sort(() => Math.random() - 0.5);
  state.currentShuffled = shuffled;   // store so selectAnswer can check

  const grid = document.getElementById("optionsGrid");
  grid.innerHTML = shuffled.map((opt, i) => `
    <button class="option-btn" onclick="selectAnswer(${i})">
      <span class="option-label">${labels[i]}</span>
      <span class="option-text">${escHtml(opt.text)}</span>
    </button>`).join('');

  // Background theme
  document.getElementById("questionBg").className = `question-bg world-bg-${worldIdx}`;
  document.getElementById("cooldownOverlay").style.display = "none";

  showScreen("screen-question", `screen-world-${worldIdx}`);
};

window.returnToWorld = function() {
  const wi = state.currentQ?.worldIdx ?? state.currentWorld ?? 0;
  renderWorldNodes(wi);
  showScreen(`screen-world-${wi}`, "screen-hub");
};

// ─── Hint ─────────────────────────────────────────────────────────
window.useHint = function() {
  const diff     = DIFFICULTY[state.difficulty];
  const hintCost = currentHintCost();
  if (state.questionHintsUsed >= diff.maxHintsPerQuestion) return;

  const q        = state.worldQuestions[state.currentQ.worldIdx][state.currentQ.questionIdx];
  const hintIdx  = state.questionHintsUsed;
  const hints    = q.hints || [q.hint];

  state.questionHintsUsed++;
  state.hintsUsed++;
  state.score = Math.max(0, state.score - hintCost);

  const revealed = hints.slice(0, state.questionHintsUsed);
  document.getElementById("hintTextBox").innerHTML = revealed.map((h, i) =>
    `<div class="hint-line hint-level-${i+1}">
       <span class="hint-num">Hint ${i+1}</span> ${h}
     </div>`
  ).join('');
  document.getElementById("hintTextBox").style.display = "block";

  document.getElementById("hintsLeft").textContent = diff.maxHintsPerQuestion - state.questionHintsUsed;
  document.getElementById("hintBtn").disabled = (state.questionHintsUsed >= diff.maxHintsPerQuestion);
  document.getElementById("hintBtn").textContent =
    state.questionHintsUsed < diff.maxHintsPerQuestion
      ? `Next Hint (−${hintCost})`
      : "No hints left";
  document.getElementById("qScore").textContent = `${state.score} pts`;
  syncScoreToFirebase();
  playSound("hint");
};

// ─── Answer selection ─────────────────────────────────────────────
window.selectAnswer = function(optIdx) {
  const { worldIdx, questionIdx } = state.currentQ;
  const q        = state.worldQuestions[worldIdx][questionIdx];
  const shuffled = state.currentShuffled;
  const correct  = shuffled[optIdx].correct;
  const basePts  = q.boss ? POINTS_BOSS : POINTS_REGULAR;
  const pts      = calcPts(basePts);

  // Disable all buttons immediately
  document.querySelectorAll(".option-btn").forEach(btn => btn.disabled = true);

  if (correct) {
    // Correct — highlight the chosen button green
    document.querySelectorAll(".option-btn").forEach((btn, i) => {
      if (i === optIdx) btn.classList.add("correct");
    });
    state.score += pts;
    state.worldProgress[worldIdx]++;
    playSound("correct");
    syncScoreToFirebase();
    const worldTotal = state.worldTotals?.[worldIdx] ?? 8;
    const worldDone  = state.worldProgress[worldIdx] >= worldTotal;
    setTimeout(() => showFeedback(true, pts, worldIdx, questionIdx, worldDone), 400);
  } else {
    // Wrong — only highlight the chosen button red, correct answer stays hidden
    document.querySelectorAll(".option-btn").forEach((btn, i) => {
      if (i === optIdx) btn.classList.add("wrong");
    });
    playSound("wrong");
    startCooldown(() => {
      document.querySelectorAll(".option-btn").forEach(btn => {
        btn.disabled = false;
        btn.classList.remove("correct","wrong");
      });
    });
  }
};

// ─── 10-second cooldown ───────────────────────────────────────────
function startCooldown(onComplete) {
  const overlay = document.getElementById("cooldownOverlay");
  const circle  = document.getElementById("cooldownCircle");
  const numEl   = document.getElementById("cooldownNum");
  const total   = 239; // circumference of r=38 circle
  overlay.style.display = "flex";

  let remaining = 10;
  numEl.textContent = remaining;
  circle.style.strokeDashoffset = "0";

  state.cooldownTimer = setInterval(() => {
    remaining--;
    numEl.textContent = remaining;
    circle.style.strokeDashoffset = `${total * (1 - remaining/10)}`;
    if (remaining <= 0) {
      clearInterval(state.cooldownTimer);
      overlay.style.display = "none";
      onComplete();
    }
  }, 1000);
}

// ─── Feedback overlay ─────────────────────────────────────────────
function showFeedback(correct, pts, worldIdx, questionIdx, worldDone = false) {

  document.getElementById("feedbackIcon").textContent  = correct ? "🎉" : "💀";
  document.getElementById("feedbackTitle").textContent = correct ? "Correct!" : "Wrong!";
  document.getElementById("feedbackPoints").textContent = correct ? `+${pts} pts` : "";
  document.getElementById("feedbackSub").textContent   = correct
    ? (worldDone ? `🌟 World Complete! On to the next realm!` : "Keep going!")
    : "Try again after the cooldown.";

  document.getElementById("feedbackOverlay").style.display = "flex";
  document.getElementById("feedbackCard").className = `feedback-card ${correct ? 'correct' : 'wrong'}`;

  // Store what to do on "Continue"
  document.getElementById("feedbackNextBtn")._action = () => {
    document.getElementById("feedbackOverlay").style.display = "none";
    if (worldDone) {
      state.worldComplete[worldIdx] = true;
      if (worldIdx + 1 < 4) {
        state.worldUnlocked[worldIdx + 1] = true;
      }
      syncScoreToFirebase();

      const allDone = state.worldComplete.every(Boolean);
      if (allDone) {
        if (state.phase === 1) {
          showBonusOffer();   // offer bonus round instead of immediate victory
        } else {
          showVictory();      // phase 2 complete — real victory
        }
      } else {
        renderHub();
        showScreen("screen-hub");
        showToast(`🌟 ${WORLDS[worldIdx].name} conquered! Next world unlocked.`, "success");
      }
    } else {
      returnToWorld();
    }
  };
}

function onFeedbackNext() {
  const fn = document.getElementById("feedbackNextBtn")._action;
  if (fn) fn();
}

// ═══════════════════════════════════════════════════════════════════
//  BONUS ROUND
// ═══════════════════════════════════════════════════════════════════
function showBonusOffer() {
  const bc      = BONUS_CONFIG[state.difficulty];
  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  const mins    = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs    = String(elapsed % 60).padStart(2, '0');

  document.getElementById("bonusTeamName").textContent    = state.teamName;
  document.getElementById("bonusPhase1Score").textContent = state.score;
  document.getElementById("bonusPhase1Time").textContent  = `${mins}:${secs}`;
  document.getElementById("bonusRoundLabel").textContent  = bc.label;
  document.getElementById("bonusMaxExtra").textContent    = phase2Max(state.difficulty);

  syncScoreToFirebase();
  showScreen("screen-bonus");
}

window.acceptBonus = function() {
  const bc = BONUS_CONFIG[state.difficulty];
  state.phase = 2;

  // Load bonus questions from the next difficulty tier
  const pool = QUESTION_BANK[bc.fromDiff];
  // For legend (elite), shuffle all legend questions fresh so they get different ones
  state.worldQuestions = WORLDS.map((_, wi) => {
    const worldPool = pool.filter(q => q.world === wi);
    const regular   = shuffle(worldPool.filter(q => !q.boss));
    const bosses    = shuffle(worldPool.filter(q =>  q.boss));
    return [...regular, ...bosses];
  });
  state.worldTotals    = state.worldQuestions.map(qs => qs.length);
  state.totalQuestions = state.worldTotals.reduce((a, b) => a + b, 0);

  // Reset world progress for bonus round
  state.worldProgress = [0, 0, 0, 0];
  state.worldUnlocked = [true, false, false, false];
  state.worldComplete  = [false, false, false, false];

  renderHub();
  showScreen("screen-hub");
  showToast(`🔥 ${bc.label} started! Harder questions — same points. Prove yourself!`, "success");
  playSound("start");
  startMusic();
};

window.declineBonus = function() {
  showVictory();
};


function showVictory() {
  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  const mins    = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs    = String(elapsed % 60).padStart(2, '0');

  document.getElementById("winTeamName").textContent = state.teamName;
  document.getElementById("winScore").textContent    = state.score;
  document.getElementById("winHints").textContent    = state.hintsUsed;
  document.getElementById("winTime").textContent     = `${mins}:${secs}`;
  document.getElementById("winTitle").textContent    = state.phase === 2 ? "FULL QUEST COMPLETE! 🔥" : "QUEST COMPLETE!";
  document.getElementById("winPhaseTag").textContent = state.phase === 2
    ? `Phase 1 + ${BONUS_CONFIG[state.difficulty].label} ✓`
    : `Phase 1 · ${DIFFICULTY[state.difficulty].label}`;

  launchConfetti();
  stopMusic();
  playSound("victory");
  syncScoreToFirebase(true);
  showScreen("screen-win");
}

// ═══════════════════════════════════════════════════════════════════
//  HOST LEADERBOARD
// ═══════════════════════════════════════════════════════════════════
window.showHostScreen = function() {
  state.prevScreen = document.querySelector(".screen.active")?.id;
  renderLeaderboard();
  showScreen("screen-host");
};

window.backFromHost = function() {
  const prev = state.prevScreen || "screen-landing";
  showScreen(prev);
  if (prev === "screen-hub") renderHub();
};

function renderLeaderboard() {
  if (state.fbDb) {
    // Always render from cache — the persistent listener keeps it live.
    // Cache starts as [] so this correctly shows "No teams yet" before anyone plays.
    renderLbDOM(_lbCache);
  } else {
    renderLbDOM(getLocalScores());
  }
}

function renderLbDOM(teams) {
  const medals = ["🥇","🥈","🥉"];
  const raceLanes = document.getElementById("raceLanes");
  const lbTable   = document.getElementById("leaderboardTable");

  function fmtTime(secs) {
    if (!secs) return '—';
    const m = String(Math.floor(secs / 60)).padStart(2,'0');
    const s = String(secs % 60).padStart(2,'0');
    return `${m}:${s}`;
  }

  raceLanes.innerHTML = teams.slice(0, 8).map((t, i) => {
    const maxQ = t.phase === 2 ? 60 : 30;
    return `
    <div class="race-lane">
      <div class="race-name">${medals[i]||`#${i+1}`} ${escHtml(t.name)}</div>
      <div class="race-bar-wrap">
        <div class="race-bar" style="width:${Math.min(100, (t.progress||0)/maxQ*100)}%;
          background:${WORLDS[(Math.floor((t.progress||1)/8))]?.glow || '#52b788'}">
          ${t.progress||0}/${maxQ}
        </div>
      </div>
      <div class="race-score">${t.score} pts</div>
    </div>`;
  }).join('') || '<div style="padding:20px;color:#aaa">No teams yet…</div>';

  lbTable.innerHTML = teams.map((t, i) => {
    const maxQ     = t.phase === 2 ? 60 : 30;
    const phaseTag = t.phase === 2 ? '<span class="lb-bonus-tag">🔥 BONUS</span>' : '';
    const timeStr  = fmtTime(t.elapsedSeconds);
    return `
    <div class="lb-row ${i < 3 ? 'top-'+i : ''}">
      <div class="lb-rank">${medals[i] || i+1}</div>
      <div class="lb-team">${escHtml(t.name)}${phaseTag}<span class="lb-diff"> · ${DIFFICULTY[t.difficulty||'pro']?.label||''}</span></div>
      <div class="lb-prog">${t.progress||0}/${maxQ}</div>
      <div class="lb-score"><span class="lb-pct">${t.score} pts</span></div>
      <div class="lb-time">${timeStr}</div>
      <div class="lb-status">${t.complete ? '✅ Done' : '⏳ Playing'}</div>
    </div>`;
  }).join('') || '<div style="padding:20px;color:#aaa">Waiting for teams…</div>';
}

window.clearAllData = function() {
  if (!confirm("Reset ALL scores? This cannot be undone.")) return;
  if (state.fbDb) remove(ref(state.fbDb, "scores"));
  localStorage.removeItem("cq_scores");
  showToast("🗑️ All data cleared.", "warn");
  renderLeaderboard();
};

// ═══════════════════════════════════════════════════════════════════
//  FIREBASE SYNC + LOCAL FALLBACK
// ═══════════════════════════════════════════════════════════════════
function syncScoreToFirebase(final = false) {
  if (!state.teamName) return;
  const totalProgress  = state.worldProgress.reduce((a,b)=>a+b,0);
  const elapsedSeconds = state.startTime ? Math.floor((Date.now() - state.startTime) / 1000) : 0;
  const payload = {
    name:           state.teamName,
    score:          state.score,
    progress:       totalProgress,
    difficulty:     state.difficulty,
    phase:          state.phase,
    elapsedSeconds: elapsedSeconds,
    complete:       state.worldComplete.every(Boolean),
    updatedAt:      Date.now()
  };

  // Local storage fallback — sort by score desc, then time asc
  const scores = getLocalScores();
  const idx = scores.findIndex(s => s.name === state.teamName);
  if (idx >= 0) scores[idx] = payload; else scores.push(payload);
  scores.sort((a,b) => b.score - a.score || (a.elapsedSeconds||0) - (b.elapsedSeconds||0));
  localStorage.setItem("cq_scores", JSON.stringify(scores));

  if (state.fbDb && state.fbConnected) {
    set(ref(state.fbDb, `scores/${state.sessionId}`), payload).catch(() => {});
  }
}

function getLocalScores() {
  try { return JSON.parse(localStorage.getItem("cq_scores") || "[]"); }
  catch { return []; }
}

// ═══════════════════════════════════════════════════════════════════
//  RESET
// ═══════════════════════════════════════════════════════════════════
window.resetGame = function() {
  stopMusic();
  state = { ...state,
    teamName:"", score:POINTS_REGULAR, hintsUsed:0, startTime:null,
    phase: 1,
    currentWorld:null, currentQ:null,
    worldProgress:[0,0,0,0], worldUnlocked:[true,false,false,false],
    worldComplete:[false,false,false,false], worldQuestions:[],
    worldTotals:[8,8,8,6], totalQuestions:30,
    questionHintsUsed:0, sessionId:null
  };
  document.getElementById("teamNameInput").value = "";
  showScreen("screen-landing");
};

// ═══════════════════════════════════════════════════════════════════
//  VISUAL EFFECTS
// ═══════════════════════════════════════════════════════════════════
function buildStarfield() {
  const sf = document.getElementById("starfield");
  if (!sf) return;
  for (let i = 0; i < 120; i++) {
    const s = document.createElement("div");
    s.className = "star";
    s.style.cssText = `
      left:${Math.random()*100}vw; top:${Math.random()*100}vh;
      width:${1+Math.random()*2}px; height:${1+Math.random()*2}px;
      opacity:${0.3+Math.random()*0.7};
      animation-delay:${Math.random()*4}s;
      animation-duration:${2+Math.random()*4}s`;
    sf.appendChild(s);
  }
}

function spawnParticles(worldIdx) {
  const ids = ["jungleParticles","nebulaParticles","citadelParticles","realmParticles"];
  const container = document.getElementById(ids[worldIdx]);
  if (!container) return;
  container.innerHTML = "";
  for (let i = 0; i < 20; i++) {
    const p = document.createElement("div");
    p.className = "ambient-particle";
    p.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;
      animation-delay:${Math.random()*5}s;animation-duration:${4+Math.random()*6}s`;
    container.appendChild(p);
  }
}

function launchConfetti() {
  const c = document.getElementById("confettiContainer");
  if (!c) return;
  c.innerHTML = "";
  const colors = ["#FFD700","#FF6B6B","#4ECDC4","#A8E6CF","#FFE66D","#FF8B94","#A8D8EA"];
  for (let i = 0; i < 80; i++) {
    const p = document.createElement("div");
    p.className = "confetti-piece";
    p.style.cssText = `
      left:${Math.random()*100}%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-delay:${Math.random()*2}s;
      animation-duration:${2+Math.random()*3}s;
      width:${6+Math.random()*8}px; height:${6+Math.random()*8}px;
      border-radius:${Math.random()>0.5?'50%':'2px'}`;
    c.appendChild(p);
  }
}

// ─── Toasts ───────────────────────────────────────────────────────
function showToast(msg, type = "info") {
  const wrap = document.getElementById("toastContainer");
  const t = document.createElement("div");
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => t.classList.add("show"), 10);
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 400); }, 3500);
}

// ═══════════════════════════════════════════════════════════════════
//  SOUND ENGINE  —  5 World Themes + SFX  (Web Audio API)
// ═══════════════════════════════════════════════════════════════════
let audioCtx     = null;
let musicNodes   = [];
let musicRunning = false;
let musicLoop    = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// ── Primitive builders ────────────────────────────────────────────
function pad(ctx, freq, startT, dur, vol, dest, detunes = [0, 3]) {
  detunes.forEach(detune => {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.connect(env); env.connect(dest || ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq + detune, startT);
    env.gain.setValueAtTime(0, startT);
    env.gain.linearRampToValueAtTime(vol, startT + 0.4);
    env.gain.setValueAtTime(vol, startT + dur - 0.5);
    env.gain.exponentialRampToValueAtTime(0.0001, startT + dur);
    osc.start(startT); osc.stop(startT + dur + 0.05);
    musicNodes.push(osc);
  });
}

function pulse(ctx, freq, startT, dur, vol, type, dest) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.connect(env); env.connect(dest || ctx.destination);
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, startT);
  env.gain.setValueAtTime(0, startT);
  env.gain.linearRampToValueAtTime(vol, startT + 0.03);
  env.gain.exponentialRampToValueAtTime(0.0001, startT + dur);
  osc.start(startT); osc.stop(startT + dur + 0.02);
  musicNodes.push(osc);
}

// ── Master bus helper ─────────────────────────────────────────────
function makeMaster(ctx, vol, delayTime, delayFeedback) {
  const master = ctx.createGain();
  master.gain.value = vol;
  master.connect(ctx.destination);
  musicNodes.push(master);

  if (delayTime > 0) {
    const delay = ctx.createDelay(1.0);
    const dGain = ctx.createGain();
    delay.delayTime.value  = delayTime;
    dGain.gain.value       = delayFeedback;
    delay.connect(dGain); dGain.connect(delay);
    delay.connect(master);
    musicNodes.push(delay, dGain);
    return { master, send: delay };  // route instruments → send → delay → master
  }
  return { master, send: master };
}

// ─────────────────────────────────────────────────────────────────
//  THEME DEFINITIONS
//  Each returns { loop: number (seconds), schedule: fn(ctx, t, bus) }
// ─────────────────────────────────────────────────────────────────

// HUB / LANDING — calm Am→F→C→G ambient (original theme)
function themeHub(ctx, t, bus) {
  const BPM = 72, beat = 60/BPM, bar = beat*4, loop = bar*4;
  const chords = [
    [220,261.6,329.6], [174.6,220,261.6],
    [130.8,164.8,196], [146.8,196,246.9]
  ];
  chords.forEach((ch,i) => ch.forEach(f => pad(ctx, f, t+i*bar, bar+0.3, 0.042, bus.send)));
  const bass = [110,87.3,65.4,73.4];
  bass.forEach((f,i) => [0, beat*2].forEach(off => pulse(ctx, f, t+i*bar+off, beat*1.6, 0.11, 'sine', bus.send)));
  const mel = [
    {f:440,b:0},{f:523.3,b:0.5},{f:587.3,b:1},{f:659.3,b:1.5},
    {f:587.3,b:2},{f:523.3,b:2.5},{f:440,b:3},{f:392,b:3.5},
    {f:349.2,b:4},{f:392,b:4.5},{f:440,b:5},{f:523.3,b:5.5},
    {f:587.3,b:6},{f:523.3,b:6.5},{f:440,b:7},{f:392,b:7.5},
    {f:523.3,b:8},{f:587.3,b:8.5},{f:659.3,b:9},{f:783.9,b:9.5},
    {f:659.3,b:10},{f:587.3,b:10.5},{f:523.3,b:11},{f:440,b:11.5},
    {f:392,b:12},{f:440,b:12.5},{f:392,b:13},{f:349.2,b:13.5},
    {f:330,b:14},{f:293.7,b:14.5},{f:261.6,b:15},{f:220,b:15.5},
  ];
  mel.forEach(({f,b}) => pulse(ctx, f, t+b*beat, beat*0.85, 0.065, 'triangle', bus.send));
  for (let i=0;i<16;i++) pulse(ctx, 1760, t+i*beat*0.5, 0.25, 0.016, 'triangle', bus.send);
  return loop;
}


// ── Music controls ────────────────────────────────────────────────
function startMusic() {
  if (musicRunning) return;
  if (!state.soundEnabled) return;
  musicRunning = true;
  scheduleLoop();
}

function stopMusic() {
  musicRunning = false;
  if (musicLoop) { clearTimeout(musicLoop); musicLoop = null; }
  musicNodes.forEach(n => { try { n.stop(); } catch(e){} });
  musicNodes = [];
}

function scheduleLoop() {
  if (!musicRunning || !state.soundEnabled) return;
  const ctx = getAudioCtx();
  const t   = ctx.currentTime + 0.05;
  const bus = makeMaster(ctx, 0.55, 0.25, 0.18);
  const loop = themeHub(ctx, t, bus);

  musicLoop = setTimeout(() => {
    musicNodes = musicNodes.filter(n => { try { n.playbackState; return true; } catch(e){ return false; } });
    scheduleLoop();
  }, (loop - 0.15) * 1000);
}

// ── Sound Effects — original simple 5 ────────────────────────────
function playSound(type) {
  if (!state.soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    const g   = ctx.createGain();
    g.connect(ctx.destination);
    const osc = ctx.createOscillator();
    osc.connect(g);
    const patterns = {
      correct: [{f:523,t:0},{f:659,t:0.1},{f:784,t:0.2}],
      wrong:   [{f:200,t:0},{f:150,t:0.1}],
      hint:    [{f:400,t:0}],
      start:   [{f:440,t:0},{f:550,t:0.15},{f:660,t:0.3}],
      victory: [{f:523,t:0},{f:659,t:0.1},{f:784,t:0.2},{f:1047,t:0.35}]
    };
    const seq = patterns[type] || [];
    seq.forEach(({f,t}) => {
      osc.frequency.setValueAtTime(f, ctx.currentTime + t);
    });
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.65);
  } catch(e) {}
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  document.querySelector(".sound-icon").textContent = state.soundEnabled ? "🔊" : "🔇";
  if (state.soundEnabled) {
    getAudioCtx();
    startMusic();
  } else {
    stopMusic();
  }
}

// ─── Utils ────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function escHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ─── Boot ──────────────────────────────────────────────────────────
init();
