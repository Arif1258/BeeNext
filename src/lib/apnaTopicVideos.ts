export interface ApnaTopicVideo {
  title: string;
  videoTitle: string;
  url: string;
  videoId: string;
}

export const APNA_TOPIC_VIDEOS: Record<string, ApnaTopicVideo> = {
  sorting: {
    title: "Sorting",
    videoTitle: "Sorting Algorithms | Bubble Sort, Selection Sort & Insertion Sort | DSA Series by Shradha Ma'am",
    url: "https://www.youtube.com/watch?v=1jCFUv-Xlqo",
    videoId: "1jCFUv-Xlqo",
  },
  arrays: {
    title: "Arrays",
    videoTitle: "Arrays Introduction | Java Complete Placement Course | Lecture 10",
    url: "https://www.youtube.com/watch?v=NTHVTY6w2Co",
    videoId: "NTHVTY6w2Co",
  },
  hashing: {
    title: "Hashing",
    videoTitle: "Hashing in Java | One Shot | 5 Best Questions",
    url: "https://www.youtube.com/watch?v=rTRcntABSZ4",
    videoId: "rTRcntABSZ4",
  },
  "binary-search": {
    title: "Binary Search",
    videoTitle: "Binary Search Algorithm - Iterative and Recursive Method | [Theory + Code] with Example",
    url: "https://www.youtube.com/watch?v=TbbSJrY5GqQ",
    videoId: "TbbSJrY5GqQ",
  },
  "strings-basic-and-medium": {
    title: "Strings (Basic and Medium)",
    videoTitle: "Strings | Lecture 12 | Java Placement Series",
    url: "https://www.youtube.com/watch?v=vCRD36bG8xQ",
    videoId: "vCRD36bG8xQ",
  },
  recursion: {
    title: "Recursion",
    videoTitle: "Recursion in One Shot | Theory + Question Practice + Code | Level 1 - Easy",
    url: "https://www.youtube.com/watch?v=5Boqfjissv0",
    videoId: "5Boqfjissv0",
  },
  "linked-list": {
    title: "Linked-List",
    videoTitle: "Introduction to Linked List | Data Structures & Algorithms | Java Placement Course",
    url: "https://www.youtube.com/watch?v=oAja8-Ulz6o",
    videoId: "oAja8-Ulz6o",
  },
  "bit-manipulation": {
    title: "Bit Manipulation",
    videoTitle: "Bit Manipulation | Java Placement Course | Lecture 15",
    url: "https://www.youtube.com/watch?v=OSoO8eCEEC8",
    videoId: "OSoO8eCEEC8",
  },
  "greedy-algorithms": {
    title: "Greedy Algorithms",
    videoTitle: "Greedy Algorithm - Introduction | C++ Placement Course Lecture 33.1",
    url: "https://www.youtube.com/watch?v=bDPtZO_Skyc",
    videoId: "bDPtZO_Skyc",
  },
  "sliding-window-2-pointer": {
    title: "Sliding Window / 2 Pointer",
    videoTitle: "Hashing - Sliding Window Technique | C++ Placement Course",
    url: "https://www.youtube.com/watch?v=y-ua1zS9wU0",
    videoId: "y-ua1zS9wU0",
  },
  "stack-queues": {
    title: "Stack / Queues",
    videoTitle: "Stack Data Structure in One Video | Java Placement Course",
    url: "https://www.youtube.com/watch?v=7m1DMYAbdiY",
    videoId: "7m1DMYAbdiY",
  },
  "binary-trees": {
    title: "Binary Trees",
    videoTitle: "Binary Tree in Data Structures | All about Binary Tree | DSA Course",
    url: "https://www.youtube.com/watch?v=-DzowlcaUmE",
    videoId: "-DzowlcaUmE",
  },
  "binary-search-trees": {
    title: "Binary Search Trees",
    videoTitle: "Binary Search Trees | BST in One Video | Java Placement Course | Data Structures & Algorithms",
    url: "https://www.youtube.com/watch?v=qAeitQWjNNg",
    videoId: "qAeitQWjNNg",
  },
  heaps: {
    title: "Heaps",
    videoTitle: "HeapsSort | C++ Placement Course | Lecture 31.2",
    url: "https://www.youtube.com/watch?v=MMTQz-G8e-I",
    videoId: "MMTQz-G8e-I",
  },
  graphs: {
    title: "Graphs",
    videoTitle: "Graph Data Structure | Tutorial for Graphs in Data Structures",
    url: "https://www.youtube.com/watch?v=59fUtYYz7ZU",
    videoId: "59fUtYYz7ZU",
  },
  "dynamic-programming": {
    title: "Dynamic Programming",
    videoTitle: "Complete Dynamic Programming | DP Series - Lecture 1",
    url: "https://www.youtube.com/watch?v=uBA8DkCBdco",
    videoId: "uBA8DkCBdco",
  },
  tries: {
    title: "Tries",
    videoTitle: "Trie Data Structure | Java DSA Course",
    url: "https://www.youtube.com/watch?v=m9zawMC6QAI",
    videoId: "m9zawMC6QAI",
  },
  "strings-advanced-algo": {
    title: "Strings (Advanced Algo)",
    videoTitle: "String Hashing - String Algorithms | C++ Placement Course | Lecture 39.1",
    url: "https://www.youtube.com/watch?v=JEOj8U54Cek",
    videoId: "JEOj8U54Cek",
  },
  maths: {
    title: "Maths",
    videoTitle: "Maths for DSA - One Shot | Euclid's Algorithm | Sieve of Eratosthenes | Modular Arithmetics",
    url: "https://www.youtube.com/watch?v=Y4KdgqV1IqA",
    videoId: "Y4KdgqV1IqA",
  },
};

export function getApnaTopicVideo(slugOrTitle?: string): ApnaTopicVideo | null {
  if (!slugOrTitle) return null;
  const normalized = slugOrTitle.toLowerCase().trim();
  if (APNA_TOPIC_VIDEOS[normalized]) return APNA_TOPIC_VIDEOS[normalized];
  if (normalized === "sorting-techniques") return APNA_TOPIC_VIDEOS["sorting"];
  for (const [k, v] of Object.entries(APNA_TOPIC_VIDEOS)) {
    if (v.title.toLowerCase() === normalized || k === normalized) return v;
  }
  return null;
}
