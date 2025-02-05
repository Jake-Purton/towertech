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
    username: string;
    roomId: string;

    constructor(userId: string, roomId: string, username: string) {
        this.userId = userId;
        this.roomId = roomId;
        this.username = username;
    }
    getUserId() {
        return this.userId;
    }
    getRoomId() {
        return this.roomId;
    }
    getUsername() {
        return this.username;
    }
}

export { JakeyMessage, JoinRoomMessage };