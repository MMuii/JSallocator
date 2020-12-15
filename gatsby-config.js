module.exports = {
  siteMetadata: {
    title: `JSallocator`,
    description: `JSallocator is a visualization of a really simple first-fit memory allocator.`,
    author: `@mmui`,
  },
  pathPrefix: "/JSallocator",
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
      },
    },
    `gatsby-plugin-sass`,
  ],
}
