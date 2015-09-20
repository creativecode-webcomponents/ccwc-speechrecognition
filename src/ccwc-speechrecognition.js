"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CCWCSpeechRecognition = (function (_HTMLElement) {
    _inherits(CCWCSpeechRecognition, _HTMLElement);

    function CCWCSpeechRecognition() {
        _classCallCheck(this, CCWCSpeechRecognition);

        _get(Object.getPrototypeOf(CCWCSpeechRecognition.prototype), "constructor", this).apply(this, arguments);
    }

    _createClass(CCWCSpeechRecognition, [{
        key: "setProperties",
        value: function setProperties() {
            /** smart blend of final transcript + interim results */
            this.transcript = '';

            /** command/callbacks to listen for and throw events on */
            this.commands = [];

            /** if speech shuts down, should we start back up */
            this.keepAlive = false;

            /** running tally of interim results */
            this.interimTranscript = "";

            /** running tally of final transcript */
            this.finalTranscript = "";

            /** is running */
            this.isRunning = false;
        }
    }, {
        key: "start",

        /**
         * start speech recognition
         */
        value: function start() {
            this.speech.start();
            this.isRunning = true;
            this.setAttribute('listening', true);

            var event = new CustomEvent('speechstart');
            this.dispatchEvent(event);
        }
    }, {
        key: "stop",

        /**
         * stop speech recognition
         */
        value: function stop() {
            this.speech.stop();
            this.isRunning = false;
            this.removeAttribute('listening');
            var event = new CustomEvent('speechstop');
            this.dispatchEvent(event);
        }
    }, {
        key: "toggle",

        /**
         * toggle speech recognition
         */
        value: function toggle() {
            if (this.isRunning) {
                this.stop();
            } else {
                this.start();
            }
        }
    }, {
        key: "onSpeechResult",

        /**
         * on speech result event from web speech API
         * @param event
         */
        value: function onSpeechResult(event) {
            var interimTranscript = '';
            if (event.results[event.results.length - 1].isFinal) {
                this.finalTranscript = event.results[event.results.length - 1][0].transcript;
                this.transcript += ' ' + this.finalTranscript;
            } else {
                interimTranscript = event.results[event.results.length - 1][0].transcript;
            }

            if (this.resultsText) {
                this.resultsText.innerText = this.transcript + ' ' + interimTranscript;
            }

            var event = new CustomEvent('speechresult', { detail: {
                    results: this.transcript + interimTranscript,
                    final: this.finalTranscript,
                    interim: this.interimTranscript,
                    isFinal: event.results[event.results.length - 1].isFinal } });
            this.dispatchEvent(event);

            for (var command in this.commands) {
                for (var word in this.commands[command].words) {
                    if (this.finalTranscript.toLowerCase().indexOf(this.commands[command].words[word].toLowerCase()) != -1) {
                        // cut the command leaving the freeform words
                        var w = this.commands[command].words[word];
                        var ftransIndex = this.finalTranscript.indexOf(w);
                        var itransIndex = this.interimTranscript.indexOf(w);
                        this.finalTranscript = this.finalTranscript.substr(0, ftransIndex) + this.finalTranscript.substr(ftransIndex + w.length, this.finalTranscript.length);
                        this.interimTranscript = this.interimTranscript.substr(0, ftransIndex) + this.interimTranscript.substr(ftransIndex + w.length, this.interimTranscript.length);

                        this.commands[command].command.apply(this, [{ "word": w, "transcript": this.finalTranscript }]);
                        this.finalTranscript = "";
                        this.interimTranscript = "";
                    }
                }
            }
        }
    }, {
        key: "addCommand",

        /**
         * add command
         * @param word
         * @param command/function
         */
        value: function addCommand(words, command) {
            if (typeof words === "string") {
                words = [words];
            }
            this.commands.push({ "words": words, "command": command });
        }
    }, {
        key: "clearText",

        /**
         * clear text field
         */
        value: function clearText() {
            this.transcript = '';
            this.finalTranscript = '';
            if (this.resultsText) {
                this.resultsText.innerText = '';
            }
        }
    }, {
        key: "clearCommands",

        /**
         * clear commands to listen for
         */
        value: function clearCommands() {
            this.commands = [];
        }
    }, {
        key: "onSpeechError",

        /**
         * on speech error event from web speech API
         * @param event
         */
        value: function onSpeechError(event) {
            this.dispatchEvent(event);
        }
    }, {
        key: "onSpeechEnd",

        /**
         * on speech end event, from the web speech API
         * @param event
         */
        value: function onSpeechEnd(event) {
            if (this.keepAlive) {
                this.speech.start();
            } else {
                this.isRunning = false;
                this.removeAttribute('listening');
                this.dispatchEvent(event);
            }
        }
    }, {
        key: "detachedCallback",

        // Fires when an instance was removed from the document.
        value: function detachedCallback() {}
    }, {
        key: "attributeChangedCallback",

        // Fires when an attribute was added, removed, or updated.
        value: function attributeChangedCallback(attr, oldVal, newVal) {}
    }, {
        key: "parseAttributes",

        /**
         * parse attributes on element
         */
        value: function parseAttributes() {
            if (this.hasAttribute('keepAlive')) {
                this.keepAlive = true;
            }
        }
    }, {
        key: "createdCallback",

        // Fires when an instance of the element is created.
        value: function createdCallback() {
            var _this = this;

            this.setProperties();
            this.parseAttributes();

            this.speech = new webkitSpeechRecognition();
            this.speech.continuous = true;
            this.speech.interimResults = true;
            this.speech.onresult = function (event) {
                _this.onSpeechResult(event);
            };
            this.speech.onend = function (event) {
                _this.onSpeechEnd(event);
            };
            this.speech.onerror = function (event) {
                _this.onSpeechError(event);
            };

            this.toggleSpeechButton = this.querySelector('.toggle-speech');
            this.startSpeechButton = this.querySelector('.start-speech');
            this.stopSpeechButton = this.querySelector('.stop-speech');
            this.resultsText = this.querySelector('.results-text');

            if (this.toggleSpeechButton) {
                this.toggleSpeechButton.addEventListener('click', function () {
                    return _this.toggle();
                });
            }
            if (this.startSpeechButton) {
                this.startSpeechButton.addEventListener('click', function () {
                    return _this.start();
                });
            }
            if (this.stopSpeechButton) {
                this.stopSpeechButton.addEventListener('click', function () {
                    return _this.stop();
                });
            }
        }
    }, {
        key: "attachedCallback",

        // Fires when an instance was inserted into the document.
        value: function attachedCallback() {}
    }]);

    return CCWCSpeechRecognition;
})(HTMLElement);

CCWCSpeechRecognition.prototype.owner = (document._currentScript || document.currentScript).ownerDocument;
document.registerElement('ccwc-speechrecognition', CCWCSpeechRecognition);
//# sourceMappingURL=ccwc-speechrecognition.js.map