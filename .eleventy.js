const date = require("nunjucks-date");
const dotenv = require("dotenv").config();
const CleanCSS = require("clean-css");
const UglifyJS = require("uglify-es");
const htmlmin = require("html-minifier");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");

module.exports = function(eleventyConfig) {

  // Eleventy Navigation https://www.11ty.dev/docs/plugins/navigation/
  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  // Merge data instead of overriding
  // https://www.11ty.dev/docs/data-deep-merge/
  eleventyConfig.setDataDeepMerge(true);

  // Output readable dates
  eleventyConfig.addFilter("readableDateTime", function(dateObj) {
    return new Date(dateObj).toLocaleString([],{
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      timeZoneName: "short",
    });
  });

  // Output the date only for comparing days
  eleventyConfig.addFilter("getDate", function(dateObj) {
    return new Date(dateObj).toLocaleString([],{
      year: "numeric",
      month: "numeric",
      day: "numeric"
    });
  });

  // Output ISO 8601 dates for use in HTML datetime attribute
  eleventyConfig.addFilter("isoDateTime", function(dateObj) {
    return new Date(dateObj).toISOString([]);
  });

  // Get upcoming events
  eleventyConfig.addFilter("upcomingEvents", function(events) {
    return events.filter(event => {
      return new Date(event.date) > new Date();
    });
  });

  // Get the next event
  eleventyConfig.addFilter("nextEvent", function(events) {
    const upcomingEvents = function(events) {
      return events.filter(event => {
        return new Date(event.date) > new Date();
      });
    }
    const filteredEvents = upcomingEvents(events)
    return filteredEvents.length > 0 ? filteredEvents[0].data.event : null
  });

  // Get past events
  eleventyConfig.addFilter("pastEvents", function(events) {
    return events.filter(event => {
      return new Date(event.date) < new Date();
    });
  });

  // Minify CSS
  eleventyConfig.addFilter("cssmin", function(code) {
    return new CleanCSS({}).minify(code).styles;
  });

  // Minify JS
  eleventyConfig.addFilter("jsmin", function(code) {
    let minified = UglifyJS.minify(code);
    if (minified.error) {
      console.log("UglifyJS error: ", minified.error);
      return code;
    }
    return minified.code;
  });

  // Minify HTML output
  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    if (outputPath.indexOf(".html") > -1) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }
    return content;
  });

  // Don't process folders with static assets e.g. images
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("static/img");
  eleventyConfig.addPassthroughCopy("_includes/assets/");

  /* Markdown Plugins */
  let markdownIt = require("markdown-it");
  let markdownItAnchor = require("markdown-it-anchor");
  let options = {
    html: true,
    breaks: true,
    linkify: true
  };
  let opts = {
    permalink: false
  };

  eleventyConfig.setLibrary("md", markdownIt(options)
    .use(markdownItAnchor, opts)
  );

  return {
    templateFormats: ["md", "njk", "html", "liquid"],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about it.
    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for URLs (it does not affect your file structure)
    pathPrefix: "/",

    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};
