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
  apiKey: "AIzaSyCsbAIShtFvEHpWpqQT1VnBJrStjKrBSlI",
  authDomain: "cipherquest-itfest.firebaseapp.com",
  databaseURL: "https://cipherquest-itfest-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cipherquest-itfest",
  storageBucket: "cipherquest-itfest.firebasestorage.app",
  messagingSenderId: "919144731797",
  appId: "1:919144731797:web:8c49bcf39dcf6e8715379c"
};

// ─── DIFFICULTY CONFIG (Option B) ────────────────────────────────
const DIFFICULTY = {
  rookie: {
    label: "🌱 Rookie",
    multiplier: 1,
    hintCost: 10,
    maxHintsPerQuestion: 2,
    completionBonus: 0,
    description: "×1 pts · 2 hints · No bonus"
  },
  pro: {
    label: "⚔️ Pro",
    multiplier: 1.5,
    hintCost: 15,
    maxHintsPerQuestion: 2,
    completionBonus: 45,
    description: "×1.5 pts · 2 hints · +45 bonus"
  },
  legend: {
    label: "👑 Legend",
    multiplier: 2,
    hintCost: 20,
    maxHintsPerQuestion: 2,
    completionBonus: 100,
    description: "×2 pts · 2 hints · +100 bonus"
  }
};

// Apply difficulty multiplier and round to nearest integer
function calcPts(base) {
  const mult = DIFFICULTY[state.difficulty]?.multiplier ?? 1;
  return Math.round(base * mult);
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
  // ║  ROOKIE  —  Solid fundamentals for BCA/MCA/Eng       ║
  // ╚═══════════════════════════════════════════════════════╝
  rookie: [
    // ── World 0: Binary Jungle (CS Fundamentals) ─────────────
    { world:0, q:"An algorithm runs in O(n²). The input size doubles from 10 to 20 elements. By what factor does the runtime increase?",
      opts:["2× — it doubles",
            "3× — it triples",
            "4× — it quadruples",
            "10× — it grows linearly with the difference"],
      ans:2, hints:["Substitute both input sizes into n² and compare the two results.","10² = 100 and 20² = 400 — what is 400 divided by 100?"], boss:false },

    { world:0, q:"What is the decimal value of the hexadecimal number 0xFF?",
      opts:["15",
            "16",
            "255",
            "256"],
      ans:2, hints:["In hex, F represents the value 15 — now apply positional notation like you would in decimal.","FF means (15 × 16¹) + (15 × 16⁰) — work that out step by step."], boss:false },

    { world:0, q:"You push 5, then 10, then 15 onto a stack. You then call pop() twice. What value is now on top of the stack?",
      opts:["15",
            "10",
            "5",
            "The stack is empty"],
      ans:2, hints:["Trace each operation in order — push all three values, then remove the top one twice.","After two pops, which of the three original values is still sitting in the stack?"], boss:false },

    { world:0, q:"What is the result of bitwise AND between 0b1010 and 0b1100?",
      opts:["0b1110",
            "0b1000",
            "0b0110",
            "0b0010"],
      ans:1, hints:["Write both numbers in binary columns and ask: where are both columns lit up simultaneously?","Only the bit position that is 1 in both inputs survives — every other position becomes 0."], boss:true },

    { world:0, q:"In a min-heap, where is the smallest element always located?",
      opts:["Last leaf node at the deepest level of the tree",
            "Right child of the root, following heap insertion order",
            "Root node",
            "Leftmost leaf in the bottom row of the heap"],
      ans:2, hints:["In this tree structure, every parent is guaranteed to be smaller than both its children.","The property is enforced from root to leaves — so the smallest value can only be in one place."], boss:false },

    { world:0, q:"Which statement correctly describes RAM compared to a hard disk?",
      opts:["RAM permanently stores the OS even when powered off",
            "RAM is volatile — it loses all data the moment power is removed",
            "RAM is slower than a hard disk for reading sequential data",
            "RAM stores data magnetically on spinning platters"],
      ans:1, hints:["The key word separating these two storage types is 'volatile' — only one of them is.","Every time you shut down without saving your work, you lose what was in RAM — that reveals something about its nature."], boss:false },

    { world:0, q:"Which of the following is NOT a characteristic of an abstract class in OOP?",
      opts:["Can have constructors that subclasses call via super()",
            "Cannot be instantiated directly with the new keyword",
            "Can contain both abstract and fully implemented concrete methods",
            "Cannot declare or use instance variables of any type"],
      ans:3, hints:["The question asks what is NOT true — one of those four statements is wrong about abstract classes.","Abstract classes are almost identical to regular classes in what they can contain — only one specific action is forbidden."], boss:false },

    { world:0, q:"A screen pixel stores Red, Green, and Blue values each using 1 byte. How many unique colors can that one pixel represent?",
      opts:["512",
            "65,536",
            "16,777,216",
            "4,294,967,296"],
      ans:2, hints:["Each channel independently stores a value from 0 to 255 — that's 256 possibilities per channel.","You have three independent channels, each with 256 options — multiply them, don't add."], boss:false },

    // ── World 1: Network Nebula (Networking & Security) ───────
    { world:1, q:"A network switch receives a frame whose destination MAC address is not in its forwarding table. What does it do?",
      opts:["Drops the frame silently and logs an error",
            "Sends the frame only to the default gateway",
            "Floods the frame out of every port except the one it arrived on",
            "Queries a DNS server to resolve the destination address"],
      ans:2, hints:["The switch cannot make a smart decision without knowing where the destination lives — so it takes a 'broadcast and hope' approach.","This is called unknown unicast flooding — the switch acts like a hub just for that one frame."], boss:false },

    { world:1, q:"What is the maximum number of usable host addresses in a /24 subnet?",
      opts:["256 addresses",
            "255 addresses",
            "254 addresses",
            "252 addresses"],
      ans:2, hints:["A /24 subnet has 8 bits for hosts — calculate 2^8 first, then remember two addresses are always off-limits.","One reserved address names the network itself; the other is used to reach every device simultaneously."], boss:false },

    { world:1, q:"Your DNS resolver has no cached entry for 'api.example.com'. What is the FIRST external server it contacts to begin resolving the name?",
      opts:["The authoritative nameserver for example.com",
            "A root nameserver",
            "The .com TLD nameserver",
            "Your ISP's mail server"],
      ans:1, hints:["Name resolution is a chain — you always start at the very top of the DNS hierarchy before working your way down.","There are only 13 sets of these in the world, labelled A through M, and every resolver knows them by default."], boss:false },

    { world:1, q:"What type of attack passively captures network packets between two systems?",
      opts:["Phishing","Packet Sniffing","DDoS","SQL Injection"],
      ans:1, hints:["The attacker doesn't send anything or change anything — they only observe.","Tools like Wireshark perform this legitimately; attackers misuse the same capability."], boss:true },

    { world:1, q:"Which of the following is a symmetric encryption algorithm?",
      opts:["RSA","ECC","AES","DSA"],
      ans:2, hints:["One of these four algorithms uses a single shared secret for both directions — the others use key pairs.","If both sender and receiver must exchange a secret key beforehand, that's the one you want."], boss:false },

    { world:1, q:"What does a firewall primarily do?",
      opts:["Speeds up network traffic by caching frequently visited destinations",
            "Filters incoming and outgoing traffic based on pre-defined security rules",
            "Assigns dynamic IP addresses to devices joining the network",
            "Resolves domain names to IP addresses for connected clients"],
      ans:1, hints:["This device sits at a network boundary and makes decisions about every packet that tries to cross.","It operates based on pre-configured rules — not content inspection, just traffic policy."], boss:false },

    { world:1, q:"A firewall rule blocks all traffic on port 443. A user tries to open an HTTPS website. What happens?",
      opts:["The browser falls back to HTTP on port 80 automatically",
            "The browser retries on port 8080 after a timeout",
            "The connection fails — the browser cannot complete the TLS handshake",
            "The page loads but images are stripped out for security"],
      ans:2, hints:["HTTPS has one designated port — there is no automatic fallback to a different one.","The browser cannot negotiate encryption without reaching that specific port, so the attempt simply fails."], boss:false },

    { world:1, q:"A user at a coffee shop connects via an encrypted tunnel that hides ALL their traffic from the café router and makes them appear to be inside their company's office network. Which technology is this?",
      opts:["NAT (Network Address Translation)",
            "A web proxy server",
            "VPN (Virtual Private Network)",
            "HTTPS encryption alone"],
      ans:2, hints:["This technology wraps every packet — not just browser traffic — inside an encrypted tunnel.","Unlike a proxy, this solution also assigns the user a private internal IP, making them virtually 'present' on the corporate LAN."], boss:false },

    // ── World 2: Code Citadel (Programming & Algorithms) ─────
    { world:2, q:"What does this Python expression evaluate to: bool(0) == bool([])?",
      opts:["True",
            "False",
            "TypeError — bool() cannot accept a list",
            "None"],
      ans:0, hints:["Python has a concept of 'falsy' values — evaluate each side of the == separately first.","bool(0) gives False, and an empty list is also falsy in Python — compare the two results."], boss:false },

    { world:2, q:"After ONE complete pass of Bubble Sort over the array [5, 3, 8, 1, 9, 2], what is guaranteed to be true?",
      opts:["The entire array is sorted",
            "The smallest element is at index 0",
            "The largest element is in its final position at the end",
            "The array is split into two independently sorted halves"],
      ans:2, hints:["Bubble Sort repeatedly compares adjacent elements — trace what happens to the largest value as it gets swapped rightward.","The 'bubble' that gives the algorithm its name is the largest value rising to the top — or in array terms, sinking to the end."], boss:false },

    { world:2, q:"In SQL, which clause filters rows BEFORE grouping?",
      opts:["HAVING","FILTER","WHERE","GROUP BY"],
      ans:2, hints:["SQL executes clauses in a specific order — this filtering clause runs before grouping happens.","HAVING filters groups; this clause filters individual rows before they're ever grouped."], boss:false },

    { world:2, q:"What design pattern ensures a class has only one instance with a global access point?",
      opts:["Factory","Observer","Decorator","Singleton"],
      ans:3, hints:["This pattern's entire purpose is enforcing a strict limit on object creation.","The number that defines this pattern is literally embedded in its name."], boss:true },

    { world:2, q:"What does the 'final' keyword do in Java when applied to a variable?",
      opts:["Makes it static",
            "Makes it thread-safe",
            "Makes it immutable",
            "Moves it to heap memory"],
      ans:2, hints:["Other languages use 'const' or 'val' for this — Java has its own keyword.","After the first assignment, any attempt to reassign throws a compile error."], boss:false },

    { world:2, q:"What is the output of 5 // 2 in Python?",
      opts:["2.5",
            "2",
            "3",
            "2.0"],
      ans:1, hints:["Python has two division operators — one gives you the exact decimal, the other always rounds down.","5 ÷ 2 is mathematically 2.5 — what whole number is immediately below that?"], boss:false },

    { world:2, q:"An API returns HTTP 403 when you try to delete a record you can clearly read. What is the most likely explanation?",
      opts:["The server cannot find the record at that endpoint URL",
            "Your request body contains malformed or invalid JSON",
            "You are authenticated but lack the required permission for that action",
            "The server is overloaded and has temporarily rate-limited your account"],
      ans:2, hints:["HTTP 403 and 401 are easy to confuse — 401 means 'I don't know who you are', while 403 means something subtly different.","The server already knows your identity — it just refuses to allow this specific action for your role."], boss:false },

    { world:2, q:"What does Python print when you run: print(0.1 + 0.2 == 0.3)?",
      opts:["True",
            "False",
            "0.30000000000000004",
            "ArithmeticError"],
      ans:1, hints:["Computers store decimals in binary floating-point — and not every decimal fraction has an exact binary representation.","0.1 and 0.2 are both stored with tiny rounding errors; when added, the result is not exactly 0.3."], boss:false },

    // ── World 3: AI Realm (AI & Emerging Tech) ────────────────
    { world:3, q:"What does the activation function do in a neural network layer?",
      opts:["Initializes weight values before training begins using random distributions",
            "Loads and preprocesses training data into mini-batches for each epoch",
            "Introduces non-linearity so the network can learn complex, non-linear patterns",
            "Reduces overfitting by randomly zeroing out neuron outputs during training"],
      ans:2, hints:["Without this, stacking 100 layers is mathematically equivalent to stacking just one.","ReLU, Sigmoid, and Tanh are all examples — what property do they all introduce?"], boss:false },

    { world:3, q:"Which technique prevents overfitting by randomly disabling neurons during training?",
      opts:["Batch Normalization","Data Augmentation","Dropout","Weight Initialization"],
      ans:2, hints:["During each training step, some neurons are randomly silenced — forcing others to compensate.","The technique's name is completely literal about what happens to certain neurons."], boss:false },

    { world:3, q:"What does 'RAG' stand for in modern AI system design?",
      opts:["Recursive Attention Graph",
            "Retrieval-Augmented Generation",
            "Random Activation Gate",
            "Reinforced Auto-Generative"],
      ans:1, hints:["This technique lets an AI look something up before answering, rather than relying on memory alone.","The acronym's three letters stand for: Retrieval, Augmented, Generation."], boss:false },

    { world:3, q:"Which metric best evaluates a binary classifier on a heavily imbalanced dataset?",
      opts:["Accuracy",
            "Mean Squared Error",
            "F1 Score",
            "R-Squared"],
      ans:2, hints:["When one class appears 95% of the time, a model that always guesses that class looks 95% accurate — this metric exposes the lie.","It's the harmonic mean of two other metrics: one about false positives, one about false negatives."], boss:true },

    { world:3, q:"What is 'transfer learning' in machine learning?",
      opts:["Moving trained model weights between different hardware accelerators",
            "Reusing a model trained on one task as a starting point for a related task",
            "Passing gradient updates between layers during the backpropagation step",
            "Converting a model from one framework format such as PyTorch to TensorFlow"],
      ans:1, hints:["Why train from zero when someone already did the hard part? This technique builds on existing work.","A model trained on millions of web pages can be adapted for medical diagnosis using this."], boss:false },

    { world:3, q:"A language model's 'temperature' is set to 0. What is the most accurate description of its output behaviour?",
      opts:["The model refuses to generate any response at all",
            "The model always picks the highest-probability next token, making output fully deterministic",
            "The model generates more creative and surprising responses than usual",
            "The model runs faster by skipping unlikely token calculations"],
      ans:1, hints:["Think of temperature like a randomness dial — turning it all the way to zero removes all randomness.","At this setting, given identical input, the model will produce exactly the same output every single time."], boss:false },


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

  ]
};

// ═══════════════════════════════════════════════════════════════════
//  GAME STATE
// ═══════════════════════════════════════════════════════════════════
let state = {
  teamName:      "",
  difficulty:    "pro",
  score:         0,
  hintsUsed:     0,
  startTime:     null,
  currentWorld:  null,
  currentQ:      null,   // {worldIdx, questionIdx}
  worldProgress: [0, 0, 0, 0],   // answered count per world
  worldUnlocked: [true, false, false, false],
  worldComplete:  [false, false, false, false],
  worldQuestions: [],            // [world][4] selected questions
  questionHintsUsed: 0,          // hints used on current question



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

  // Effective points table per difficulty
  const ptRows = Object.entries(DIFFICULTY).map(([key, cfg]) => {
    const reg  = Math.round(POINTS_REGULAR * cfg.multiplier);
    const boss = Math.round(POINTS_BOSS    * cfg.multiplier);
    return `<div class="pts-row ${key}">
      <span>${cfg.label}</span>
      <span>${reg} / ${boss} pts</span>
    </div>`;
  }).join('');

  const html = `
    <div class="difficulty-selector" id="difficultySelectorWrap">
      <div class="diff-label">⚔️ Choose Your Difficulty</div>
      <div class="diff-options">
        ${Object.entries(DIFFICULTY).map(([key, cfg]) => `
          <label class="diff-option ${key === 'pro' ? 'selected' : ''}" data-diff="${key}">
            <input type="radio" name="difficulty" value="${key}" ${key==='pro'?'checked':''} style="display:none">
            <span class="diff-icon">${cfg.label.split(' ')[0]}</span>
            <span class="diff-name">${cfg.label.split(' ').slice(1).join(' ')}</span>
            <span class="diff-multiplier">×${cfg.multiplier}</span>
            <span class="diff-desc">${cfg.description}</span>
          </label>
        `).join('')}
      </div>
      <div class="pts-table">
        <div class="pts-table-title">💰 Points per correct answer (Regular / Boss)</div>
        ${ptRows}
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
function initFirebase() {
  try {
    if (firebaseConfig.apiKey === "YOUR_API_KEY") throw new Error("not configured");
    const app = initializeApp(firebaseConfig);
    state.fbDb = getDatabase(app);
    const connRef = ref(state.fbDb, ".info/connected");
    onValue(connRef, snap => {
      state.fbConnected = !!snap.val();
      updateConnUI(state.fbConnected);
      if (state.fbConnected && state.teamName) syncScoreToFirebase();
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
  // Give a full regular question's worth of points upfront so both hints cost real pts from Q1
  // (each hint = half of regular pts, so 2 hints exactly wipes the starting bonus back to 0)
  const _startDiff = DIFFICULTY[state.difficulty];
  const _startBonus = Math.round(POINTS_REGULAR * _startDiff.multiplier);
  state.score      = _startBonus;
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
  document.getElementById("hubProgress").textContent = `Progress: ${totalAnswered}/${total} Questions`;
  document.getElementById("hubScore").textContent     = `${state.score} pts`;

  const grid = document.getElementById("portalsGrid");
  grid.innerHTML = WORLDS.map((w, i) => {
    const done     = state.worldComplete[i];
    const locked   = !state.worldUnlocked[i];
    const progress = state.worldProgress[i];
    const worldTotal = state.worldTotals?.[i] || 8;
    const cls      = locked ? "portal locked" : (done ? "portal complete" : "portal active");
    return `
      <div class="${cls}" onclick="${locked ? '' : `enterWorld(${i})`}" style="--world-glow:${w.glow}">
        <div class="portal-icon">${done ? '✅' : (locked ? '🔒' : w.emoji)}</div>
        <div class="portal-name">${w.name}</div>
        <div class="portal-progress">${progress}/${worldTotal} ${done ? '· COMPLETE' : (locked ? '· LOCKED' : '')}</div>
        ${!locked && !done ? `<div class="portal-diff-badge">${DIFFICULTY[state.difficulty].label}</div>` : ''}
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
  changeTheme('world' + worldIdx);
};

window.returnToHub = function() {
  renderHub();
  showScreen("screen-hub");
  changeTheme('hub');
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

  // Multiplier banner — always visible so teams know what they're earning
  const effRegular = calcPts(POINTS_REGULAR);
  const effBoss    = calcPts(POINTS_BOSS);
  document.getElementById("qNumber").insertAdjacentHTML("afterend",
    `<div class="mult-banner ${state.difficulty}">
       ${diff.label} &nbsp;·&nbsp; ×${diff.multiplier} multiplier
       &nbsp;·&nbsp; ${q.boss ? effBoss : effRegular} pts this question
     </div>`);

  if (q.boss) document.getElementById("qText").insertAdjacentHTML("beforebegin",
    `<div class="boss-banner">👑 BOSS QUESTION — ${effBoss} pts</div>`);

  // Hint area
  const hintsAvail = diff.maxHintsPerQuestion - state.questionHintsUsed;
  document.getElementById("hintsLeft").textContent = hintsAvail;
  const costEl = document.getElementById("hintCostDisplay");
  if (costEl) costEl.textContent = `${diff.hintCost} pts`;
  document.getElementById("hintTextBox").innerHTML = "";
  document.getElementById("hintTextBox").style.display = "none";
  document.getElementById("hintBtn").disabled = (hintsAvail <= 0);
  document.getElementById("hintBtn").textContent = `Use Hint (−${diff.hintCost})`;

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
  const diff = DIFFICULTY[state.difficulty];
  if (state.questionHintsUsed >= diff.maxHintsPerQuestion) return;

  const q        = state.worldQuestions[state.currentQ.worldIdx][state.currentQ.questionIdx];
  const hintIdx  = state.questionHintsUsed;   // 0-based index of the hint to reveal next
  const hints    = q.hints || [q.hint];        // fallback to legacy single hint
  const hintCost = diff.hintCost;

  state.questionHintsUsed++;
  state.hintsUsed++;
  state.score = Math.max(0, state.score - hintCost);

  // Show ALL hints revealed so far, stacked — so teams can re-read earlier ones
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

  // Highlight buttons — mark the correct one regardless of which was clicked
  document.querySelectorAll(".option-btn").forEach((btn, i) => {
    btn.disabled = true;
    if (shuffled[i].correct)          btn.classList.add("correct");
    if (i === optIdx && !correct)     btn.classList.add("wrong");
  });

  if (correct) {
    state.score += pts;
    state.worldProgress[worldIdx]++;
    playSound("correct");
    syncScoreToFirebase();
    const worldTotal = state.worldTotals?.[worldIdx] ?? 8;
    const worldDone  = state.worldProgress[worldIdx] >= worldTotal;
    // Show full question value in feedback (advance + remaining = full pts)
    setTimeout(() => showFeedback(true, pts, worldIdx, questionIdx, worldDone), 400);
  } else {
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
    ? (worldDone ? `World complete! +${DIFFICULTY[state.difficulty].completionBonus} bonus` : "Keep going!")
    : "Try again after the cooldown.";

  document.getElementById("feedbackOverlay").style.display = "flex";
  document.getElementById("feedbackCard").className = `feedback-card ${correct ? 'correct' : 'wrong'}`;

  // Store what to do on "Continue"
  document.getElementById("feedbackNextBtn")._action = () => {
    document.getElementById("feedbackOverlay").style.display = "none";
    if (worldDone) {
      state.score += DIFFICULTY[state.difficulty].completionBonus;
      state.worldComplete[worldIdx] = true;
      if (worldIdx + 1 < 4) {
        state.worldUnlocked[worldIdx + 1] = true;
      }
      syncScoreToFirebase();

      const allDone = state.worldComplete.every(Boolean);
      if (allDone) {
        showVictory();
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
//  VICTORY
// ═══════════════════════════════════════════════════════════════════
function showVictory() {
  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  const mins    = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs    = String(elapsed % 60).padStart(2, '0');

  document.getElementById("winTeamName").textContent = state.teamName;
  document.getElementById("winScore").textContent    = state.score;
  document.getElementById("winHints").textContent    = state.hintsUsed;
  document.getElementById("winTime").textContent     = `${mins}:${secs}`;

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
  if (state.fbDb && state.fbConnected) {
    onValue(ref(state.fbDb, "scores"), snap => {
      const data = snap.val() || {};
      const teams = Object.values(data).sort((a,b) => b.score - a.score || (a.timeTaken||0) - (b.timeTaken||0));
      renderLbDOM(teams);
    });
  } else {
    const local = getLocalScores();
    renderLbDOM(local);
  }
}

function fmtTime(sec) {
  if (!sec && sec !== 0) return '—';
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function renderLbDOM(teams) {
  const medals = ["🥇","🥈","🥉"];
  const raceLanes = document.getElementById("raceLanes");
  const lbTable   = document.getElementById("leaderboardTable");

  raceLanes.innerHTML = teams.slice(0, 8).map((t, i) => `
    <div class="race-lane">
      <div class="race-name">${medals[i]||`#${i+1}`} ${escHtml(t.name)}</div>
      <div class="race-bar-wrap">
        <div class="race-bar" style="width:${Math.min(100, (t.progress||0)/30*100)}%;
          background:${WORLDS[(Math.floor((t.progress||1)/8))]?.glow || '#52b788'}">
          ${t.progress||0}/30
        </div>
      </div>
      <div class="race-score">${t.score} pts</div>
      <div class="race-time">⏱ ${fmtTime(t.timeTaken)}</div>
    </div>`).join('') || '<div style="padding:20px;color:#aaa">No teams yet…</div>';

  lbTable.innerHTML = teams.map((t, i) => `
    <div class="lb-row ${i < 3 ? 'top-'+i : ''}">
      <div class="lb-rank">${medals[i] || i+1}</div>
      <div class="lb-team">${escHtml(t.name)}<span class="lb-diff"> · ${DIFFICULTY[t.difficulty||'pro']?.label||''}</span></div>
      <div class="lb-prog">${t.progress||0}/30 questions</div>
      <div class="lb-score">${t.score} pts</div>
      <div class="lb-time">⏱ ${fmtTime(t.timeTaken)}</div>
      <div class="lb-status">${t.complete ? '✅ Done' : '⏳ Playing'}</div>
    </div>`).join('') || '<div style="padding:20px;color:#aaa">Waiting for teams…</div>';
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
  const totalProgress = state.worldProgress.reduce((a,b)=>a+b,0);
  const isComplete = state.worldComplete.every(Boolean);
  const elapsedSec = state.startTime ? Math.floor((Date.now() - state.startTime) / 1000) : 0;
  const payload = {
    name:       state.teamName,
    score:      state.score,
    progress:   totalProgress,
    difficulty: state.difficulty,
    complete:   isComplete,
    timeTaken:  elapsedSec,   // always live; locked at finish so host sees final time
    updatedAt:  Date.now()
  };

  // Local storage fallback
  const scores = getLocalScores();
  const idx = scores.findIndex(s => s.name === state.teamName);
  if (idx >= 0) scores[idx] = payload; else scores.push(payload);
  scores.sort((a,b) => b.score - a.score || (a.timeTaken||0) - (b.timeTaken||0));
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
  currentThemeId = 'hub';
  state = { ...state,
    teamName:"", score:0, hintsUsed:0, startTime:null,
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
//  SOUND ENGINE  —  Per-world themes  (Web Audio API)
// ═══════════════════════════════════════════════════════════════════
let audioCtx     = null;
let musicNodes   = [];
let musicRunning = false;
let musicLoop    = null;
let currentThemeId = 'hub';

// ── Per-world music themes ────────────────────────────────────────
const MUSIC_THEMES = {

  // Landing / Hub — calm Am → F → C → G, BPM 72
  hub: {
    bpm:72, melType:'triangle', masterVol:0.55, padVol:0.045, bassVol:0.12, shimmer:true,
    chords:[[220,261.6,329.6],[174.6,220,261.6],[130.8,164.8,196],[146.8,196,246.9]],
    bassRoots:[110,87.3,65.4,73.4],
    melody:[
      {f:440,b:0},{f:523.3,b:0.5},{f:587.3,b:1},{f:659.3,b:1.5},
      {f:587.3,b:2},{f:523.3,b:2.5},{f:440,b:3},{f:392,b:3.5},
      {f:349.2,b:4},{f:392,b:4.5},{f:440,b:5},{f:523.3,b:5.5},
      {f:587.3,b:6},{f:523.3,b:6.5},{f:440,b:7},{f:392,b:7.5},
      {f:523.3,b:8},{f:587.3,b:8.5},{f:659.3,b:9},{f:783.9,b:9.5},
      {f:659.3,b:10},{f:587.3,b:10.5},{f:523.3,b:11},{f:440,b:11.5},
      {f:392,b:12},{f:440,b:12.5},{f:392,b:13},{f:349.2,b:13.5},
      {f:330,b:14},{f:293.7,b:14.5},{f:261.6,b:15},{f:220,b:15.5},
    ],
  },

  // 🌿 Binary Jungle — warm, earthy, C major, BPM 76
  world0: {
    bpm:76, melType:'triangle', masterVol:0.52, padVol:0.042, bassVol:0.11, shimmer:true,
    chords:[[130.8,164.8,196],[196,246.9,293.7],[220,261.6,329.6],[174.6,220,261.6]],
    bassRoots:[65.4,98.0,110.0,87.3],
    melody:[
      // C major pentatonic: C(261.6) D(293.7) E(329.6) G(392) A(440)
      {f:261.6,b:0},{f:329.6,b:0.5},{f:392,b:1},{f:440,b:1.5},
      {f:392,b:2},{f:329.6,b:2.5},{f:261.6,b:3},{f:293.7,b:3.5},
      {f:392,b:4},{f:440,b:4.5},{f:493.9,b:5},{f:440,b:5.5},
      {f:392,b:6},{f:329.6,b:6.5},{f:293.7,b:7},{f:261.6,b:7.5},
      {f:440,b:8},{f:523.3,b:8.5},{f:587.3,b:9},{f:523.3,b:9.5},
      {f:440,b:10},{f:392,b:10.5},{f:329.6,b:11},{f:261.6,b:11.5},
      {f:349.2,b:12},{f:392,b:12.5},{f:440,b:13},{f:392,b:13.5},
      {f:329.6,b:14},{f:293.7,b:14.5},{f:261.6,b:15},{f:293.7,b:15.5},
    ],
  },

  // 🌌 Network Nebula — spacey, slow, D minor, BPM 60
  world1: {
    bpm:60, melType:'sine', masterVol:0.48, padVol:0.032, bassVol:0.085, shimmer:false,
    chords:[[146.8,174.6,220],[116.5,146.8,174.6],[174.6,220,261.6],[130.8,164.8,196]],
    bassRoots:[73.4,58.3,87.3,65.4],
    melody:[
      // Very sparse — one note every 2 beats. D minor: D F A C
      {f:293.7,b:0},{f:349.2,b:2},{f:440,b:4},{f:523.3,b:6},
      {f:440,b:8},{f:587.3,b:10},{f:523.3,b:12},{f:349.2,b:14},
    ],
  },

  // ⚙️ Code Citadel — mechanical, E minor, BPM 90, square wave
  world2: {
    bpm:90, melType:'square', masterVol:0.44, padVol:0.028, bassVol:0.09, shimmer:false,
    chords:[[164.8,196,246.9],[130.8,164.8,196],[196,246.9,293.7],[146.8,185.0,220]],
    bassRoots:[82.4,65.4,98.0,73.4],
    melody:[
      // E minor pentatonic: E(329.6) G(392) A(440) B(493.9) D(587.3)
      {f:329.6,b:0},{f:392,b:0.5},{f:440,b:1},{f:329.6,b:1.5},
      {f:493.9,b:2},{f:440,b:2.5},{f:392,b:3},{f:493.9,b:3.5},
      {f:392,b:4},{f:493.9,b:4.5},{f:587.3,b:5},{f:493.9,b:5.5},
      {f:440,b:6},{f:392,b:6.5},{f:329.6,b:7},{f:392,b:7.5},
      {f:659.3,b:8},{f:587.3,b:8.5},{f:493.9,b:9},{f:440,b:9.5},
      {f:392,b:10},{f:329.6,b:10.5},{f:392,b:11},{f:440,b:11.5},
      {f:493.9,b:12},{f:587.3,b:12.5},{f:659.3,b:13},{f:587.3,b:13.5},
      {f:493.9,b:14},{f:440,b:14.5},{f:392,b:15},{f:329.6,b:15.5},
    ],
  },

  // 🤖 AI Realm — futuristic, F minor, BPM 95
  world3: {
    bpm:95, melType:'triangle', masterVol:0.46, padVol:0.030, bassVol:0.085, shimmer:true,
    chords:[[174.6,207.7,261.6],[138.6,174.6,207.7],[207.7,261.6,311.1],[155.6,196.0,233.1]],
    bassRoots:[87.3,69.3,103.8,77.8],
    melody:[
      // F minor pentatonic: F(349.2) Ab(415.3) Bb(466.2) C(523.3) Eb(622.3)
      {f:349.2,b:0},{f:415.3,b:0.5},{f:466.2,b:1},{f:523.3,b:1.5},
      {f:622.3,b:2},{f:523.3,b:2.5},{f:466.2,b:3},{f:523.3,b:3.5},
      {f:466.2,b:4},{f:415.3,b:4.5},{f:349.2,b:5},{f:415.3,b:5.5},
      {f:466.2,b:6},{f:523.3,b:6.5},{f:466.2,b:7},{f:415.3,b:7.5},
      {f:523.3,b:8},{f:622.3,b:8.5},{f:659.3,b:9},{f:622.3,b:9.5},
      {f:523.3,b:10},{f:466.2,b:10.5},{f:523.3,b:11},{f:622.3,b:11.5},
      {f:466.2,b:12},{f:523.3,b:12.5},{f:466.2,b:13},{f:415.3,b:13.5},
      {f:349.2,b:14},{f:415.3,b:14.5},{f:349.2,b:15},{f:311.1,b:15.5},
    ],
  },
};

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// ── Primitive builders ────────────────────────────────────────────
function note(ctx, freq, startT, dur, vol, type = 'sine') {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.connect(env); env.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startT);
  env.gain.setValueAtTime(0, startT);
  env.gain.linearRampToValueAtTime(vol, startT + Math.min(0.08, dur * 0.3));
  env.gain.setValueAtTime(vol, startT + dur * 0.6);
  env.gain.exponentialRampToValueAtTime(0.0001, startT + dur);
  osc.start(startT);
  osc.stop(startT + dur + 0.02);
  return osc;
}

function pad(ctx, freq, startT, dur, vol, dest) {
  // Soft pad: two slightly detuned sines for warmth
  [0, 3].forEach(detune => {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.connect(env); env.connect(dest || ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq + detune, startT);
    env.gain.setValueAtTime(0, startT);
    env.gain.linearRampToValueAtTime(vol, startT + 0.4);
    env.gain.setValueAtTime(vol, startT + dur - 0.5);
    env.gain.exponentialRampToValueAtTime(0.0001, startT + dur);
    osc.start(startT);
    osc.stop(startT + dur + 0.05);
    musicNodes.push(osc);
  });
}

// ── Background Music ──────────────────────────────────────────────
// Calm ambient loop: Am → F → C → G  (pentatonic melody over pads)
// BPM ~72 → beat = 0.833s, bar = 3.33s, 4-bar loop = 13.33s

function startMusic() {
  if (musicRunning || !state.soundEnabled) return;
  musicRunning = true;
  scheduleLoop();
}

function stopMusic() {
  musicRunning = false;
  if (musicLoop) { clearTimeout(musicLoop); musicLoop = null; }
  musicNodes.forEach(n => { try { n.stop(); } catch(e){} });
  musicNodes = [];
}

function changeTheme(themeId) {
  if (currentThemeId === themeId && musicRunning) return;
  currentThemeId = themeId;
  if (!state.soundEnabled) return;
  stopMusic();
  setTimeout(() => { if (state.soundEnabled) startMusic(); }, 300);
}

function scheduleLoop() {
  if (!musicRunning || !state.soundEnabled) return;
  const theme = MUSIC_THEMES[currentThemeId] || MUSIC_THEMES.hub;
  const ctx   = getAudioCtx();
  const t     = ctx.currentTime + 0.05;
  const beat  = 60 / theme.bpm;
  const bar   = beat * 4;
  const loop  = bar * 4;

  // Master chain with echo delay
  const delay  = ctx.createDelay(0.5);
  const dGain  = ctx.createGain();
  const master = ctx.createGain();
  delay.delayTime.value = beat * 0.75;
  dGain.gain.value = 0.18;
  master.gain.value = theme.masterVol;
  delay.connect(dGain); dGain.connect(delay);
  delay.connect(master); master.connect(ctx.destination);
  musicNodes.push(delay, dGain, master);

  // Chord pads
  theme.chords.forEach((chord, i) => {
    chord.forEach(f => pad(ctx, f, t + i * bar, bar + 0.3, theme.padVol, master));
  });

  // Bass (two pulses per bar)
  theme.bassRoots.forEach((f, i) => {
    [0, beat * 2].forEach(offset => {
      const bn = ctx.createOscillator();
      const bg = ctx.createGain();
      bn.connect(bg); bg.connect(master);
      bn.type = 'sine';
      bn.frequency.setValueAtTime(f, t + i * bar + offset);
      bg.gain.setValueAtTime(0, t + i * bar + offset);
      bg.gain.linearRampToValueAtTime(theme.bassVol, t + i * bar + offset + 0.05);
      bg.gain.exponentialRampToValueAtTime(0.0001, t + i * bar + offset + beat * 1.6);
      bn.start(t + i * bar + offset);
      bn.stop(t + i * bar + offset + beat * 1.7);
      musicNodes.push(bn);
    });
  });

  // Melody
  const melVol = theme.melType === 'square' ? 0.038 : 0.07;
  theme.melody.forEach(({f, b}) => {
    const mn = ctx.createOscillator();
    const mg = ctx.createGain();
    mn.connect(mg); mg.connect(master);
    mn.type = theme.melType;
    mn.frequency.setValueAtTime(f, t + b * beat);
    mg.gain.setValueAtTime(0, t + b * beat);
    mg.gain.linearRampToValueAtTime(melVol, t + b * beat + 0.04);
    mg.gain.exponentialRampToValueAtTime(0.0001, t + b * beat + beat * 0.85);
    mn.start(t + b * beat);
    mn.stop(t + b * beat + beat);
    musicNodes.push(mn);
  });

  // High shimmer — only for bright themes (hub, jungle, AI)
  if (theme.shimmer) {
    for (let i = 0; i < 16; i++) {
      const sn = ctx.createOscillator();
      const sg = ctx.createGain();
      sn.connect(sg); sg.connect(master);
      sn.type = 'triangle';
      sn.frequency.setValueAtTime(1760, t + i * beat * 0.5);
      sg.gain.setValueAtTime(0, t + i * beat * 0.5);
      sg.gain.linearRampToValueAtTime(0.018, t + i * beat * 0.5 + 0.02);
      sg.gain.exponentialRampToValueAtTime(0.0001, t + i * beat * 0.5 + 0.25);
      sn.start(t + i * beat * 0.5);
      sn.stop(t + i * beat * 0.5 + 0.3);
      musicNodes.push(sn);
    }
  }

  // Schedule next loop ~0.15s before this one ends to prevent gaps
  musicLoop = setTimeout(() => {
    musicNodes = musicNodes.filter(n => {
      try { n.playbackState; return true; } catch(e) { return false; }
    });
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
