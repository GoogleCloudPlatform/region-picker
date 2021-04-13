# How to Contribute

We'd love to accept your patches and contributions to this project. There are
just a few small guidelines you need to follow.

## Contributor License Agreement

Contributions to this project must be accompanied by a Contributor License
Agreement (CLA). You (or your employer) retain the copyright to your
contribution; this simply gives us permission to use and redistribute your
contributions as part of the project. Head over to
<https://cla.developers.google.com/> to see your current agreements on file or
to sign a new one.

You generally only need to submit a CLA once, so if you've already submitted one
(even if it was for a different project), you probably don't need to do it
again.

## Code Reviews

All submissions, including submissions by project members, require review. We
use GitHub pull requests for this purpose. Consult
[GitHub Help](https://help.github.com/articles/about-pull-requests/) for more
information on using pull requests.

## Community Guidelines

This project follows
[Google's Open Source Community Guidelines](https://opensource.google/conduct/).

## Development principles

In order to minimize maintenance burden and issues, keep this code simple:
- Do not add a build step (notably: no TypeScript)
- Do not use any framework or web component. Only vanilla HTML / JS / CSS. 
- Do not load third party resources (JS from a CDN, image from another origin...)
- Do not use npm (because of the above requirements, but also for development simplicity)

All graphics must be in `.svg` format, except if they are pictures, in which case they should be `.webp`.

## Performances

Any change should ensure there are no regression in Lighthouse scores (Performance, Accesibility, Best Practices and SEO). If submitting a Pull Request, please attach the Lighthouse scores.
