export type Message = {
  id: string;
  message: string;
  time: string;
  playerChat: {
    playerId: string;
    name: string;
  };
};

export type UserData = {
  Id: string;
  Name: string;
  Email: string;
  TokenId: string;
};


