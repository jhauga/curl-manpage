/***************************************************************************
 *                                  _   _ ____  _
 *  Project                     ___| | | |  _ \| |
 *                             / __| | | | |_) | |
 *                            | (__| |_| |  _ <| |___
 *                             \___|\___/|_| \_\_____|
 *
 * Copyright (C) Daniel Stenberg, <daniel@haxx.se>, et al.
 *
 * This software is licensed as described in the file COPYING, which
 * you should have received as part of this distribution. The terms
 * are also available at https://curl.se/docs/copyright.html.
 *
 * You may opt to use, copy, modify, merge, publish, distribute and/or sell
 * copies of the Software, and permit persons to whom the Software is
 * furnished to do so, under the terms of the COPYING file.
 *
 * This software is distributed on an "AS IS" basis, WITHOUT WARRANTY OF ANY
 * KIND, either express or implied.
 *
 * SPDX-License-Identifier: curl
 *
 ***************************************************************************/

/* Filter the option menu on the man page while typing. The search box is
   hidden in the markup and shown from here, so without JavaScript nothing
   changes. */
document.addEventListener("DOMContentLoaded", () => {
    const search = document.getElementById("optsearch");
    const none = document.getElementById("optsearch-none");
    const links = Array.from(document.querySelectorAll(
        "div#opt-dropdown div.dropdown-content a[href^='#']"));

    /* "-k, --insecure" is an exact match for "-k", "--insecure" and "insecure" */
    const exact = (link, text) =>
        link.textContent.split(", ").some(opt => opt === text || opt === "--" + text);

    function filterLinks() {
        const text = search.value.trim().toLowerCase();
        let shown = 0;
        for(const link of links) {
            link.hidden = !link.textContent.toLowerCase().includes(text);
            if(!link.hidden)
                shown++;
        }
        none.hidden = shown > 0;
    }

    search.addEventListener("input", filterLinks);
    search.addEventListener("keydown", (e) => {
        if(e.key === "Enter") {
            /* go to an exact match, or else the first option shown */
            const text = search.value.trim();
            const shown = links.filter(link => !link.hidden);
            const target = shown.find(link => exact(link, text)) || shown[0];
            e.preventDefault();
            if(target) {
                target.click();
                search.blur();
            }
        }
        else if(e.key === "Escape") {
            if(search.value) {
                search.value = "";
                filterLinks();
            }
            else
                search.blur();
        }
    });
    search.hidden = false;
});
