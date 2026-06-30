import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Thanh Tùng's Brain",
    pageTitleSuffix: " · Brain",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "vercel",
    },
    locale: "vi-VN",
    baseUrl: "www.thanhtung0209.com/brain",
    ignorePatterns: ["private", "templates", ".obsidian", ".smart-env", "*.base"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Schibsted Grotesk",
        body: "Source Sans Pro",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#f1fafa",
          lightgray: "#d9ebea",
          gray: "#90aaa8",
          darkgray: "#385654",
          dark: "#102725",
          secondary: "#087f82",
          tertiary: "#c44f7d",
          highlight: "rgba(8, 127, 130, 0.12)",
          textHighlight: "#fff23688",
        },
        darkMode: {
          light: "#071716",
          lightgray: "#18302e",
          gray: "#66817f",
          darkgray: "#c7dcda",
          dark: "#eef9f8",
          secondary: "#4bc3c5",
          tertiary: "#ef88ad",
          highlight: "rgba(75, 195, 197, 0.15)",
          textHighlight: "#b3aa0288",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // The main blog already provides social previews; keep Brain builds quick.
    ],
  },
}

export default config
