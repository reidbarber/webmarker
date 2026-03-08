import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";
import { useRouter } from "next/router";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

function Head() {
  return (
    <>
      <link rel="shortcut icon" href={`${basePath}/favicon.ico`} />
    </>
  );
}

const config: DocsThemeConfig = {
  logo: <span>WebMarker</span>,
  head: <Head />,
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
  docsRepositoryBase: "https://github.com/reidbarber/webmarker/tree/main/docs",
  footer: {
    text: "Webmarker",
  },
};

export default config;
