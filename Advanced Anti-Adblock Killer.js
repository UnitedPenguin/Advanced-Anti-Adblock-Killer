// ==UserScript==
// @name         Advanced Anti-Adblock Killer
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Attempts to stop websites from detecting ad-blockers
// @author       UnitedPenguin 
// @match        *://*/*
// @grant        GM_addStyle
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// ==/UserScript==

(function() {
    'use strict';

    // Override the window.alert function to disable pop-up alerts
    window.alert = function() {};

    // Hide common pop-up elements and ads
    GM_addStyle(`
        .popup-adblock,
        .modal-adblock,
        .overlay-adblock,
        .adblocker-notice,
        .adblock-notice,
        .adblockerwarning,
        .ad-block-notice,
        .popup-ad,
        .banner-ad,
        .video-ad,
        #popup-adblock,
        #modal-adblock,
        #overlay-adblock,
        #adblocker-notice,
        #adblock-notice,
        #adblockerwarning,
        #ad-block-notice,
        #popup-ad,
        #banner-ad,
        #video-ad {
            display: none !important;
            visibility: hidden !important;
        }
    `);

    // Regular expression to match common ad-block detection function names
    const regex = /ad.?block/i;

    // Override functions that match the regular expression
    for (const prop in window) {
        if (Object.prototype.hasOwnProperty.call(window, prop) && regex.test(prop)) {
            window[prop] = function() {
                return false;
            };
        }
    }

    // Detect the honeypot technique by creating a fake ad script
    const fakeAdScript = document.createElement('script');
    fakeAdScript.src = window.location.origin + '/fake-ad.js';
    document.body.appendChild(fakeAdScript);

    // Check for ad element space
    const adElements = document.querySelectorAll('div[id*="ad"], div[class*="ad"]');
    adElements.forEach(function(adElement) {
        if (adElement.clientHeight === 0) {
            adElement.style.display = 'block';
            adElement.innerHTML = '<div style="width: 300px; height: 250px;"></div>';
        }
    });

    // Check for CSS styles applied by ad-blockers
    const css = document.createElement('style');
    css.innerHTML = 'div[id*="ad"], div[class*="ad"] { visibility: visible !important; display: block !important; }';
    document.head.appendChild(css);

    // Check for WebSocket connections
    const ws = new WebSocket('wss://' + window.location.hostname);
    ws.onclose = function() {
        // If the WebSocket connection is closed immediately, it may be due to an ad-blocker.
        // Try to open a WebSocket connection to another server.
        const ws2 = new WebSocket('wss://fallback.example.com/');
        ws2.onclose = function() {
            // If the second WebSocket connection is also closed immediately, it's likely that an ad-blocker is being used.
            // Take appropriate action here.
        };
    };

    // Add a button to redirect to the Wayback Machine's cached version of the current page
    const cacheButton = document.createElement('button');
    cacheButton.textContent = 'View Cached Version';
    cacheButton.addEventListener('click', function() {
        window.location.href = 'https://web.archive.org/web/*/' + window.location.href;
    });
    document.body.appendChild(cacheButton);

    // If the website is linkvertise.com, override the document.dispatchEvent function
    if (window.location.hostname === 'www.linkvertise.com' || window.location.hostname === 'linkvertise.com') {
        document.dispatchEvent = function(event) {
            if (!(event instanceof CustomEvent)) {
                EventTarget.prototype.dispatchEvent.call(this, event);
            }
        };
    }

    // Bypass ad-links
    const bypassButton = document.createElement('button');
    bypassButton.textContent = 'Bypass';
    bypassButton.addEventListener('click', async function() {
        const url = window.location.href;
        const response = await fetch('https://bypass.pm/bypass2?url=' + encodeURIComponent(url));
        const data = await response.json();
        if (data.success) {
            window.location.href = data.destination;
        } else {
            alert('Failed to bypass ad-link: ' + data.msg);
        }
    });
    document.body.appendChild(bypassButton);

    // Remove tracking parameters from links
    const trackingParameters = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
    const links = document.querySelectorAll('a[href]');
    links.forEach(function(link) {
        const url = new URL(link.href);
        trackingParameters.forEach(function(param) {
            url.searchParams.delete(param);
        });
        link.href = url.toString();
    });

    // Remove potential adblocker notices
    const adblockNoticeClasses = ["adblocker-notice", "adblock-notice", "adblockerwarning", "ad-block-notice"]; // Add more class names as needed
    adblockNoticeClasses.forEach(function(className) {
        const elements = document.getElementsByClassName(className);
        for (let i = elements.length - 1; i >= 0; i--) {
            elements[i].parentNode.removeChild(elements[i]);
        }
    });

    // Skip Redirect
    const originalWindowOpen = window.open;
    window.open = function(openArgs){
        // Check if the URL has a redirect parameter
        const url = new URL(openArgs);
        for(let value of url.searchParams.values()){
            try{
                const potentialURL = decodeURIComponent(value);
                new URL(potentialURL); // This will throw if it's not a valid URL
                return originalWindowOpen.call(this, potentialURL);
            }catch(e){
                // Not a valid URL, so ignore
            }
        }

        // No redirect parameter found, so just open the URL as normal
        return originalWindowOpen.apply(this, arguments);
    };
    // Do the same for location changes
    const originalLocation = Object.getOwnPropertyDescriptor(window, 'location').set;
    Object.defineProperty(window, 'location', {
        set: function(locationArgs) {
            // Check if the URL has a redirect parameter
            const url = new URL(locationArgs);
            for(let value of url.searchParams.values()){
                try{
                    const potentialURL = decodeURIComponent(value);
                    new URL(potentialURL); // This will throw if it's not a valid URL
                    return originalLocation.call(this, potentialURL);
                }catch(e){
                    // Not a valid URL, so ignore
                }
            }

            // No redirect parameter found, so just set the location as normal
            return originalLocation.call(this, locationArgs);
        }
    });

    // Clear local storage
    window.localStorage.clear();

    // Unregister service workers
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
            registration.unregister();
        }
    });

    // Delete all cookies
    document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Prevent canvas fingerprinting
    HTMLCanvasElement.prototype.toDataURL = function() {
        return "";
    };

    // Stop autoplay videos
    const videos = document.getElementsByTagName('video');
    for (let video of videos) {
        video.autoplay = false;
    }

    // Remove Facebook plugins
    const fbPlugins = [
        'plugins/activity.php',
        'plugins/comments.php',
        'plugins/facepile.php',
        'plugins/fan.php',
        'plugins/follow.php',
        'plugins/like.php',
        'plugins/like_box.php',
        'plugins/likebox.php',
        'plugins/post.php',
        'plugins/recommendations.php',
        'plugins/recommendations_bar.php',
        'plugins/send.php',
        'plugins/share_button.php',
        'plugins/subscribe.php'
    ];
    fbPlugins.forEach(function(plugin) {
        const elements = document.querySelectorAll(`[src*="${plugin}"]`);
        elements.forEach(function(element) {
            element.parentNode.removeChild(element);
        });
    });
    
    // Remove promoted links on Reddit
    if (window.location.hostname.includes('reddit.com')) {
        GM_addStyle(`
            div.promotedlink {
                display: none !important;
            }
        `);
    }
})();
