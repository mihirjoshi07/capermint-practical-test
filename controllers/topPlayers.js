const User=require("../models/User");

  //Hey Interviewer This is to fetch top 10 players with win
  const getTopPlayers = async (req, res) => {
    try {
      
      const topPlayers = await User.find()
        .sort({ wins: -1 }) // Sort by wins in descending order
        .limit(10) 
        .select("username wins losses draws"); 
  
      res.status(200).json({ topPlayers });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
module.exports={
    getTopPlayers,
}
