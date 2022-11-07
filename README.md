# Next.js + TypeScript + Tailwind Starter

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) and [this starter](https://github.com/dalbitresb12/next-typescript-tailwind-starter).

This starter includes some settings I use with all my Next.js projects, including:

- TypeScript (**with strict mode enabled**)
- Tailwind CSS with PostCSS and Autoprefixer
- ESLint with my usual set of rules preconfigured, extending `eslint:recommended`, `plugin:react/recommended`, `plugin:react/jsx-runtime`, `plugin:@typescript-eslint/recommended` (only in TypeScript files), `next/core-web-vitals` and `prettier` (to turn off rules that conflict or are unnecessary with Prettier)
- Stylelint with the standard configuration (`stylelint-config-standard`), `stylelint-config-prettier` to turn off rules that conflict or are unnecessary with Prettier and some custom rules to lint Tailwind CSS directives
- Environment variables for some settings in `next.config.js`
- Project files stored in `src/` instead of the root folder
- `.vscode/settings.json` for disabling VS Code built-in CSS validator and using the TypeScript SDK from `node_modules`
- Extension recommendations for VS Code: ESLint, Prettier, Stylelint and Tailwind CSS

## Getting Started

You can quickly initialize a new repository in GitHub using the "Use this template" button on the top of the page.

Alternatively, create a new project with `create-next-app` using this starter:

```sh
yarn create next-app -e https://github.com/dalbitresb12/next-typescript-tailwind-starter
```

Then, run the development server:

```sh
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `src/pages/api/hello.js`.

The `src/pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
