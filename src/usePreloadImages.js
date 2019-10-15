import { useLayoutEffect } from "react";
import projectImages from "./info-box/projectImages";

/**
 * This avoids the visual bug where an image loads while the infobox,
 * this way all the images are already loaded.
 *
 * NOTE: Might not be feasible with more projects.
 */

export default function usePreloadImages() {
  useLayoutEffect(() => {
    Object.values(projectImages).forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, []);
}
