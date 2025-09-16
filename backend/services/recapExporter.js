import fs from "fs";
import path from "path";
import modeLoader from "../modeLoader.js";

const OUTPUT_DIR = path.join(process.cwd(), "outputs", "Recaps");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

export class RecapExporter {
  constructor() {
    this.branding = modeLoader.get("branding");
  }

  /**
   * Export a recap package for SUC Weekly
   * @param {Array<Object>} highlights
   * @param {Object} recap
   * @returns {Object} recap package
   */
  exportWeekly(highlights, recap) {
    const pkg = {
      ts: Date.now(),
      branding: {
        title: this.branding.labels?.recapTitle || "SUC Weekly Recap",
        colors: this.branding.colors,
        fonts: this.branding.fonts
      },
      highlights: highlights || [],
      recap: recap || {}
    };

    const filePath = path.join(
      OUTPUT_DIR,
      `suc_weekly_${pkg.ts}.json`
    );
    fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2));

    return pkg;
  }
}

// Singleton export
export default new RecapExporter();
