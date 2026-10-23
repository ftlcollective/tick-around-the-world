# World Clock

The live date and time in cities around the world, and in your own location.
Built with HTML, CSS and JavaScript, with [moment.js](https://momentjs.com/) and moment-timezone.

## Features

- Three cities on the homepage, each in a different time zone (Los Angeles, Paris, Sydney)
- A select with 21 cities, grouped by region, plus **My current location**
- Every clock ticks live, including the city you choose
- A link back to the homepage when you are looking at one city
- "My current location" uses your device's time zone, so it never asks for permission
- Extras: day and night colours, the UTC offset, how far ahead or behind you a city is,
  and whether it is Today, Tomorrow or Yesterday there
- Every city has its own link you can share, like `/#Asia/Tokyo`, and the back button works

## Run it locally

Open `index.html` in your browser. There is nothing to install or build.
It needs an internet connection to load moment.js and the fonts.

## Deploy on Netlify

1. Log in to Netlify with GitHub
2. Add new site, then Import an existing project, then pick this repository
3. Leave the build command empty and set the publish directory to `.`
4. Deploy

## Credits

Coded by [Tasneem Mahomed](https://github.com/ftlcollective).
Flag artwork by [Twemoji](https://github.com/twitter/twemoji) (CC-BY 4.0), delivered with
[country-flag-emoji-polyfill](https://github.com/talkjs/country-flag-emoji-polyfill) (MIT).
