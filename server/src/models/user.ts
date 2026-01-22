import DB from "./db";

export interface UserInterface { // this interface should not be shared with api
  id: number;
  username: string;
  password: string;
  roles: string;
  dark_theme: boolean;
}

export interface UserPublic {
  id: number;
  username: string;
  roles: string;
  dark_theme: boolean;
}

const User = {
  getUserByUsername: async (username: string): Promise<UserInterface | null> => {
    const result = await DB.query("SELECT * FROM u WHERE username = $1", [
      username,
    ]);
    return result.rows[0] || null;
  },

  updateDarkTheme: async (userId: number, darkTheme: boolean): Promise<void> => {
    await DB.query("UPDATE u SET dark_theme = $1 WHERE id = $2", [
      darkTheme,
      userId,
    ]);
  },

  getFlagsLabels: async (userId: number): Promise<Record<string, string>> => {
    const res = await DB.query(`SELECT flag_1, flag_2, flag_3, flag_4, flag_5, flag_6, flag_7, flag_8 FROM u WHERE id = $1`, [userId]);
    return res.rows[0];
  },

};
export default User;