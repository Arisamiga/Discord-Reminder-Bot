# Discord-Reminder-Bot
### Useful Bot for Reminding about Meetings

 <a href="https://github.com/Arisamiga/Discord-Reminder-Bot//issues">
   <img alt="Issues" src="https://img.shields.io/github/issues/Arisamiga/Discord-Reminder-Bot?color=0088ff" />
  </a>
  
[![CodeFactor](https://www.codefactor.io/repository/github/arisamiga/discord-reminder-bot/badge?s=5da8fad11b2d4aef8b5655557b6555541562f523)](https://www.codefactor.io/repository/github/arisamiga/discord-reminder-bot)  

Setting Up Meeting | Meeting Confirmed
:-------------------------:|:-------------------------:
<img src= "https://i.imgur.com/Om1eT6H.png">  |  <img src="https://i.imgur.com/BbMaBMS.png"> 

## Installation
```
You have to install NodeJS and Git.
Create a folder.
Open Command Prompt.
Type in: cd The path to your new folder. (Example: C:\Users\User\Desktop\New folder)
Press enter.
After that type in git clone https://github.com/Arisamiga/Discord-Reminder-Bot.git
Press enter.
When you see all Github files in your folder you installed the bot files successfully.
You will need to rename config.json.example and reminders.json.example to config.json and reminders.json
After that, you would want to edit the config.json.
```
Change the following
```
{
    "clientId": "(Enter Bot's Client ID here)",
    "guildId": "(Enter Guild ID here)",
    "token": "(Enter Token here)",
    "reminderchannel": "(Enter Channel ID for Reminders)",
    "activityText": "(Enter Bot's Activity Text)"
}
```
Get your discord token and bot ID from https://discord.com/developers/applications

And you should be ready to start the bot! 

Use either use ```npm start``` or ```node main.js``` to start the bot in your command prompt!

## Setting up a reminder!

To set up a reminder you should have the bot enabled.
The Bot uses Discord's Slash Commands you can create a reminder by using

```
/addmeeting (Timestamp) (Role to mention)
```

And after that, you should have made a Reminder.

You can check if your meeting was added by using
```
/schedules
```

## Features!
<ul>
<li>
Supports Multiple Meetings/Reminders
</li>
<li>
Ability to Mention Role for Meetings/Reminders
</li>
<li>
Uses Discord Slash Commands and Discord v14!
</li>
<li>
Easy to use!
</li>
</ul>

### If you are having trouble with the bot I recommend opening an issue.

***Made By Arisamiga***
