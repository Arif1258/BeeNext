/**
 * Helper to retrieve the official book cover image path for any book or topic.
 */
export function getBookImage(slug?: string, productType?: string): string {
  const s = (slug || "").toLowerCase();
  if (s.includes("full-dsa") || s.includes("complete")) {
    return "/images/purchase/full-dsa-book/fullDSA1.jpg";
  }
  if (s.includes("oops")) {
    return "/images/purchase/oops/oops1.jpg";
  }
  if (s.includes("network") || s === "cn") {
    return "/images/purchase/computer-networks/CN-1.jpg";
  }
  if (s.includes("operating") || s === "os") {
    return "/images/purchase/operating-systems/OS-1.jpg";
  }
  if (s.includes("dbms")) {
    return "/images/purchase/dbms/DBMS-1.jpg";
  }
  if (s.includes("sql")) {
    return "/images/purchase/sql/sql-1.jpg";
  }
  if (s.includes("mongo")) {
    return "/images/purchase/mongodb/mongodb1.jpg";
  }
  if (s.includes("hr-interview") || s.includes("hr")) {
    return "/images/purchase/hr-interview/hr-1.jpg";
  }
  return "/images/purchase/topic-wise/topicwise-1.jpg";
}
