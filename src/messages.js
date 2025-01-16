class JakeyMessage {
    constructor(message, number) {
        this.message = message;
        this.number = number;
    }
    getMessage() {
        return this.message;
    }
    getNumber() {
        return this.number;
    }
}

export { JakeyMessage };