[![Badge Commits]][Commit Rate]
[![Badge Issues]][Issues]
[![Badge Localization]][Crowdin]
[![Badge License]][License]
[![Badge NPM]][NPM]
[![Badge Mozilla]][Mozilla]
[![Badge Chrome]][Chrome]
[![Badge Edge]][Edge]

***

<h1 align="center">
<sub>
<img src="./src/img/ablock.svg" height="38" width="38">
</sub>
A Block
</h1>

| Browser   | Install from ... | Status |
| :-------: | ---------------- | ------ |
| <img src="https://github.com/user-attachments/assets/b0136512-56a5-4856-8c50-4971c957a24f" alt="Get A Block for Firefox"> | <a href="https://addons.mozilla.org/addon/ablock/">Firefox Add-ons</a> | [A Block works best on Firefox](https://github.com/Ablock/Ablock/wiki/A-Block-works-best-on-Firefox) |


ABlock is a CPU and memory-efficient [wide-spectrum content blocker][Blocking] for Chromium and Firefox. It blocks ads, trackers, coin miners, popups, annoying anti-blockers, malware sites, etc., by default using [EasyList][EasyList], [EasyPrivacy][EasyPrivacy], [Peter Lowe's Blocklist][Peter Lowe's Blocklist], [Online Malicious URL Blocklist][Malicious Blocklist], and A Block [filter lists][A Block Filters]. There are many other lists available to block even more. Hosts files are also supported. A Block uses EasyList filter syntax and [extends][Extended Syntax] syntax to work with custom rules and filters.

You may easily unselect any preselected filter lists if you think A Block blocks too much. For reference, Adblock Plus installs with only EasyList, ABP filters, and Acceptable Ads enabled by default.

It is important to note that using a blocker is **NOT** [theft]. Do not fall for this creepy idea. The _ultimate_ logical consequence of `blocking = theft` is criminalization of inalienable right to privacy.

Ads, "unintrusive" or not, are just the visible portion of privacy-invading means entering your browser when you visit most sites. **A Block's primary goal is to help users neutralize these privacy-invading methods** in a way that welcomes those users who do not wish to use more technical means.

***

* [Documentation](#documentation)
* [Installation](#installation)
  * [Firefox](#firefox)
* [Release History](#release-history)
* [Translations](#translations)
* [About](#about)

## Documentation

<table>
    <thead>
        <tr>
            <th>Basic Mode</th>
            <th>Advanced Mode</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>The <a href="https://github.com/Ablock/Ablock/wiki/Quick-guide:-popup-user-interface">simple popup user interface</a> for an install-it-and-forget-it type of installation that is configured optimally by default.</td>
            <td>The <a href="https://github.com/Ablock/Ablock/wiki/Dynamic-filtering:-quick-guide">advanced popup user interface</a> includes a point-and-click firewall that is configurable on a per-site basis.</td>
        </tr>
        <tr>
            <td align="center" valign="top"><a href="https://github.com/Ablock/Ablock/wiki/Quick-guide:-popup-user-interface"><img src="https://github.com/user-attachments/assets/f7588d3c-43eb-42d4-9994-4b6f433a030c"/></a></td>
            <td align="center" valign="top"><a href="https://github.com/Ablock/Ablock/wiki/Dynamic-filtering:-quick-guide"><img src="https://github.com/user-attachments/assets/ac3e8665-5061-415a-a100-4225f9f12c5b"/></a></td>
        </tr>
    </tbody>
</table>

## Installation

[Required Permissions][Permissions]

#### Firefox

[Firefox Add-ons][Mozilla]

[Development Builds][Beta]

ABlock [works best][Works Best] on Firefox 

#### All Programs

Do **NOT** use A Block with any other content blocker. A Block [performs][Performance] as well as or better than most popular blockers. Other blockers can prevent A Block's privacy or anti-blocker-defusing features from working correctly.

[Manual Installation][Manual Installation]

#### Enterprise Deployment

[Deploying A Block][Deployment]

## Release History

[Releases Page][Releases]


## About

[Manifesto][Manifesto]

[Privacy Policy][Privacy Policy]

[GPLv3 License][License]

Free. Open-source. For users by users. No donations sought.

If you ever want to contribute something, think about the people working hard to maintain filter lists you are using, which are available to use by all for free.


<!----------------------------------------------------------------------------->

[Peter Lowe's Blocklist]: https://pgl.yoyo.org/adservers/
[Malicious Blocklist]: https://gitlab.com/malware-filter/urlhaus-filter#malicious-url-blocklist
[Performance]: https://www.debugbear.com/blog/chrome-extensions-website-performance#the-impact-of-ad-blocking-on-website-performance
[EasyPrivacy]: https://easylist.to/#easyprivacy
[Thunderbird]: https://addons.thunderbird.net/thunderbird/addon/ablock/
[Chrome Dev]: https://chromewebstore.google.com/detail/ablock-development/cgbcahbpdhpcegmbfconppldiemgcoii
[EasyList]: https://easylist.to/#easylist
[Mozilla]: https://addons.mozilla.org/addon/ablock/
[Crowdin]: https://crowdin.com/project/ablock
[Chrome]: https://chromewebstore.google.com/detail/ablock/cjpalhdlnbpafiamejdnhcphjbkeiagm
[Reddit]: https://www.reddit.com/r/Ablock/
[Theft]: https://x.com/LeaVerou/status/518154828166725632
[Opera]: https://addons.opera.com/extensions/details/ablock/
[Edge]: https://microsoftedge.microsoft.com/addons/detail/ablock/odfafepnkmbhccpbejgmiehpchacaeak
[NPM]: https://www.npmjs.com/package/@gorhill/ubo-core

[Manifesto]: MANIFESTO.md
[License]: LICENSE.txt

[Nicole Rolls]: https://github.com/nicole-ashley

<!---------------------------------[ Internal ]---------------------------------->

[Manual Installation]: https://github.com/Ablock/Ablock/tree/master/dist#install
[Extended Syntax]: https://github.com/Ablock/Ablock/wiki/Static-filter-syntax#extended-syntax
[Privacy Policy]: https://github.com/Ablock/Ablock/wiki/Privacy-policy
[A Block Filters]: https://github.com/Ablock/uAssets/tree/master/filters
[Permissions]: https://github.com/Ablock/Ablock/wiki/Permissions
[Commit Rate]: https://github.com/Ablock/Ablock/commits/master
[Works Best]: https://github.com/Ablock/Ablock/wiki/A-Block-works-best-on-Firefox
[Deployment]: https://github.com/Ablock/Ablock/wiki/Deploying-A-Block
[Blocking]: https://github.com/Ablock/Ablock/wiki/Blocking-mode
[Releases]: https://github.com/Ablock/Ablock/releases
[Issues]: https://github.com/Ablock/Ablock-issues/issues
[Beta]: https://github.com/Ablock/Ablock/blob/master/dist/README.md#for-beta-version
[Wiki]: https://github.com/Ablock/Ablock/wiki

<!----------------------------------[ Badges ]--------------------------------->

[Badge Localization]: https://d322cqt584bo4o.cloudfront.net/ablock/localized.svg
[Badge Commits]: https://img.shields.io/github/commit-activity/Ablock/Ablock?label=Commits
[Badge Mozilla]: https://img.shields.io/amo/rating/ablock?label=Firefox
[Badge License]: https://img.shields.io/badge/License-GPLv3-blue.svg
[Badge Chrome]: https://img.shields.io/chrome-web-store/rating/cjpalhdlnbpafiamejdnhcphjbkeiagm?label=Chrome
[Badge Edge]: https://img.shields.io/badge/dynamic/json?label=Edge&color=brightgreen&query=%24.averageRating&suffix=%2F%35&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fodfafepnkmbhccpbejgmiehpchacaeak
[Badge Issues]: https://img.shields.io/github/issues/Ablock/Ablock-issues
[Badge NPM]: https://img.shields.io/npm/v/@gorhill/ubo-core



<h2>Credit to Ublock for having the basecode of this project </h2>