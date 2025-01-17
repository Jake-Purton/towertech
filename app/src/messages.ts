class JakeyMessage {
    message: string;
    number: number;

    constructor(message: string, number: number) {
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

class JoinRoomMessage {
    userId: string;
    roomId: string;

    constructor(userId: string, roomId: string) {
        this.userId = userId;
        this.roomId = roomId;
    }
    getUserId() {
        return this.userId;
    }
    getRoomId() {
        return this.roomId;
    }
}

export { JakeyMessage, JoinRoomMessage };