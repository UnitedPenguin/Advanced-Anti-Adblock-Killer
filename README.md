# Advanced Anti-Adblock Killer

A browser script that attempts to stop websites from detecting ad-blockers. This script can and will break websites, use it only when your own ad blocker does not bypass a site!

## Description

This script uses various methods to try and disable ad-blocker detection on websites. It works by:

- Disabling pop-up alerts
- Hiding common pop-up elements and ads
- Overriding common ad-block detection function names
- Detecting and bypassing the honeypot technique
- Checking for ad element space and adjusting their display
- Checking for CSS styles applied by ad-blockers and adjusting their display
- Checking for WebSocket connections and making adjustments based on their status
- Redirecting to the Wayback Machine's cached version of the current page
- Bypassing ad-links
- Removing tracking parameters from links
- Removing potential adblocker notices
- Skipping Redirects
- Clearing local storage
- Unregistering service workers
- Deleting all cookies
- Preventing canvas fingerprinting
- Stopping autoplay videos
- Removing Facebook plugins
- Removing promoted links on Reddit

## Installation

This script is intended to be used as a userscript and requires a userscript manager like Tampermonkey or Greasemonkey.

- Install Tampermonkey (or similar) for your browser.
- Create new script, and copy Advanced Anti-Adblock Killer.js into that script.

## Limitations

This script can't block ads or detect adblock detection scripts at the network level. It can only interact with the page content (HTML, CSS, and JavaScript). For comprehensive ad-blocking and privacy protection, you should still consider using a dedicated browser extension along with this script. This script can and will break websites, use it only when your own ad blocker does not bypass a site!

## Contributing

Pull requests are welcome. 

## License

[MIT]
