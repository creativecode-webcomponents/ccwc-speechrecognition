class CCWCSpeechRecognition extends HTMLElement {
    setProperties() {
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
    };

    /**
     * start speech recognition
     */
     start() {
        this.speech.start();
        this.isRunning = true;
        this.setAttribute('listening', true);

        var event = new CustomEvent('speechstart');
        this.dispatchEvent(event);
    };

    /**
     * stop speech recognition
     */
    stop() {
        this.speech.stop();
        this.isRunning = false;
        this.removeAttribute('listening');
        var event = new CustomEvent('speechstop');
        this.dispatchEvent(event);
    };

    /**
     * toggle speech recognition
     */
    toggle() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    };

    /**
     * on speech result event from web speech API
     * @param event
     */
     onSpeechResult(event) {
        var interimTranscript = '';
        if (event.results[event.results.length-1].isFinal) {
            this.finalTranscript = event.results[event.results.length-1][0].transcript;
            this.transcript += ' ' + this.finalTranscript;
        } else {
            interimTranscript = event.results[event.results.length-1][0].transcript;
        }

        if (this.resultsText) {
            this.resultsText.innerText = this.transcript + ' ' + interimTranscript;
        }

        var event = new CustomEvent('speechresult', { detail: {
            results: this.transcript + interimTranscript,
            final: this.finalTranscript,
            interim: this.interimTranscript,
            isFinal: event.results[event.results.length-1].isFinal }});
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

                    this.commands[command].command.apply(this, [{ "word" : w, "transcript": this.finalTranscript }]);
                    this.finalTranscript = "";
                    this.interimTranscript = "";
                }
            }
        }
    };

    /**
     * add command
     * @param word
     * @param command/function
     */
    addCommand(words, command) {
        if ( typeof(words) === "string" ) {
            words = [words];
        }
        this.commands.push( {"words": words, "command": command } );
    };

    /**
     * clear text field
     */
    clearText() {
        this.transcript = '';
        this.finalTranscript = '';
        if (this.resultsText) {
            this.resultsText.innerText = '';
        }
    };

    /**
     * clear commands to listen for
     */
    clearCommands() {
        this.commands = [];
    };

    /**
     * on speech error event from web speech API
     * @param event
     */
    onSpeechError(event) {
        this.dispatchEvent(event);
    };

    /**
     * on speech end event, from the web speech API
     * @param event
     */
    onSpeechEnd(event) {
        if (this.keepAlive) {
            this.speech.start();
        } else {
            this.isRunning = false;
            this.removeAttribute('listening');
            this.dispatchEvent(event);
        }
    };


    // Fires when an instance was removed from the document.
    detachedCallback() {};

    // Fires when an attribute was added, removed, or updated.
    attributeChangedCallback(attr, oldVal, newVal) {};

    /**
     * parse attributes on element
     */
    parseAttributes() {
        if (this.hasAttribute('keepAlive')) {
            this.keepAlive = true;
        }
    };


    // Fires when an instance of the element is created.
    createdCallback() {
        this.setProperties();
        this.parseAttributes();

        this.speech = new webkitSpeechRecognition();
        this.speech.continuous = true;
        this.speech.interimResults = true;
        this.speech.onresult = (event) => { this.onSpeechResult(event) };
        this.speech.onend = (event) => { this.onSpeechEnd(event) };
        this.speech.onerror = (event) => { this.onSpeechError(event) };

        this.toggleSpeechButton = this.querySelector('.toggle-speech');
        this.startSpeechButton = this.querySelector('.start-speech');
        this.stopSpeechButton = this.querySelector('.stop-speech');
        this.resultsText = this.querySelector('.results-text');

        if (this.toggleSpeechButton) {
            this.toggleSpeechButton.addEventListener('click', () => this.toggle());
        }
        if (this.startSpeechButton) {
            this.startSpeechButton.addEventListener('click', () => this.start());
        }
        if (this.stopSpeechButton) {
            this.stopSpeechButton.addEventListener('click', () => this.stop());
        }

    };

    // Fires when an instance was inserted into the document.
    attachedCallback() {};

}

CCWCSpeechRecognition.prototype.owner = (document._currentScript || document.currentScript).ownerDocument;
document.registerElement('ccwc-speechrecognition', CCWCSpeechRecognition);