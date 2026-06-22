/**
 * Generates a URL-friendly slug from a string.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars
    .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with single dash
    .replace(/^-+|-+$/g, ""); // Remove dashes from start/end
}

/**
 * Centeralized Robust Language Detector
 */
export function detectLanguage(src: string): string {
  if (!src) return "javascript";
  const clean = src.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "").trim(); 
  
  if (clean.includes("#include") || clean.includes("using namespace std;")) return "cpp";
  
  if (
    (clean.includes("def ") && !clean.includes("function ")) || 
    (clean.includes("import ") && !clean.includes("from '") && !clean.includes("from \"") && !clean.includes("require(")) ||
    clean.includes("print(") // Added print as a strong Python indicator
  ) {
      return "python";
  }
  
  if (clean.includes("public class ") && clean.includes("static void main")) return "java";
  
  return "javascript"; 
}
