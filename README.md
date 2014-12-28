Hypervault
===

Client-side javascript encryption app which outputs a self-decrypting html file (which contains both the javascript decryption and the cipherdata).

## Development stuff

How to build:

	npm install
	npm install -g grunt-cli
	bower install
	grunt build

How to serve production version:

	./serve-dist.sh

How to run development server:

	grunt serve

Note: This mode doesn't correctly build vault.html, so that part doesn't work, but it is still helpful for UI changes to index.html.

## General notes and links

Helpful resources:

* Reading files with HTML5/JS: <http://www.html5rocks.com/en/tutorials/file/dndfiles/>

Crypto:

* [Recommendations](http://www.slideshare.net/kevinhakanson/developers-guide-to-javascript-and-web-cryptography)
    * Should use *Password-Based Key Derivation Function* (PBKDF) - slide 64
        - Implemented in CryptoJS
* [Stanford Javascript Cryptography Library](https://github.com/bitwiseshiftleft/sjcl)
* [CryptoJS](https://github.com/gwjjeff/cryptojs)
* [Forthcoming W3 Web Crypto API](http://www.w3.org/TR/WebCryptoAPI/)

Compression:

We may want to compress the data to make the file size smaller.

* [lz-string](http://pieroxy.net/blog/pages/lz-string/index.html)

