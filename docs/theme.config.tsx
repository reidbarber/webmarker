import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";
import { useRouter } from "next/router";

const config: DocsThemeConfig = {
  logo: <span>WebMarker</span>,
  head: (
    <>
      <link rel="shortcut icon" href="favicon.ico" />
    </>
  ),
  useNextSeoProps() {
    const { pathname } = useRouter();
    if (pathname !== "/") {
      return {
        titleTemplate: "%s – WebMarker",
      };
    } else {
      return {
        title: "WebMarker",
        description: "Mark web pages for use with vision-language models.",
      };
    }
  },
  project: {
    link: "https://github.com/reidbarber/webmarker",
  },
  docsRepositoryBase: "https://github.com/reidbarber/webmarker",
  footer: {
    text: "Webmarker",
  },
};

export default config;
