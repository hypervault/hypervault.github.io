Hypervault
==========

The source is in the `src` directory, and the deployment artifacts are in the root directory (as required by Github Pages).

## What is Hypervault?

* Hypervault is client-side file encryption web app.
* Hypervault is entirely contained in a single, static `.html` file.
    - As such, you can save the Hypervault page, and you will have a complete working copy of Hypervault which you can run offline.
    - Hypervault has no server-side components.
* Hypervault outputs another single `.html` file which contains both the encrypted file data, and a copy of itself.

## Development stuff

### How to build:

    cd src
	npm install
	npm install -g grunt-cli
	bower install
	grunt build

### How to serve production version:

	./serve-dist.sh

Then `localhost:8000` in browser.

### How to run development server:

	grunt serve

## How it works

* Hypervault uses the `HTML5 File API` to read file data into the browser client-side.
* It then stores all the filenames, file types, file sizes, and file data (as `base64`) in a `JSON` object.
* The user enters a Vault password and clicks `Lock vault`; Hypervault builds a locked vault like this:
    - Hypervault serializes the `JSON` blob containing all the file data, and encryptes it using the [triplesec](https://github.com/keybase/triplesec) encryption library. The output of this is a single string.
    - Hypervault then grabs it's own source code (without making any web requests), and treats it as a template with which it interpolates the encrypted file data by replacing the `REPLACE_WITH_ENCRYPTED_DATA_`.
    - Hypervault also sets a variable in the new vault to indicate that this is a locked vault: `_decryptionMode = true;`.
    - Hypervault then initiates a download of the new `locked_vault.html`.

## What's awesome about Hypervault?

* Secure
    - Hypervault uses the Triplesec library, which uses 3 strong encryption algorithms ([AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard), [Salsa20](https://en.wikipedia.org/wiki/Salsa20), and [Blowfish](https://en.wikipedia.org/wiki/Blowfish_(cipher))), so you can rest assured that your data is safe, even if a couple of the ciphers are compromised.
    - Since Hypervault runs in a browser (which is sandboxed), you never have to worry that it doing anything nefarious on your computer.
    - Zero-knowledge: Hypervault encryption is all client-side, so even if Hypervault's servers are compromised, your data is still safe.
* Easy
    - No installations necessary, just run in the browser.
* Offline
    - Since Hypervault is a self-contained `.html` file, you save it to your desktop and run it offline.
* Always usable
    - Since Hypervault packages itself with your encrypted data (in the form of a `locked_vault.html` file, you can always decrypt your data, even if Hypervault goes away.

## Roadmap

* Allow in-browser viewing of files (without downloading them).
* Testing more on mobile platforms (and browser support matrix).
* Add more help to app (to make it more self-explanatory).
* Add "inline" texts, so users can create a hypervault with text without ever having to put that text in a file.
* Add "Download Hypervault Offline" button.
* Add some animations to clarify a few things.
* Miscellaneous improvements to the UI.
* More unit tests.
* Clean up redundant CSS.
* Improve code style.
* Remove `FileSaver.js` dependency?
* Add compression (lzma?) to encrypted data?

