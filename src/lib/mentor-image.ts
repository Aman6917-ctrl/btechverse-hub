import { getApiBase } from "@/lib/api-base";

/** Use proxy for LinkedIn images so they load on live site (LinkedIn blocks direct hotlink). */
export function getMentorImageUrl(imageUrl: string): string {
  if (!imageUrl) return "";
  if (/licdn\.com/i.test(imageUrl)) {
    return `${getApiBase()}/api/mentor-image?url=${encodeURIComponent(imageUrl)}`;
  }
  return imageUrl;
}
