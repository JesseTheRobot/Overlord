# Overlord
## This is a repository for my NEA (A level computer science Non-Examined Assessment) project - Overlord.
>Overlord is a then-"next gen" Discord bot, desgined to offload much of the human-dependant moderation work - specifically in enforcing content policies such as removing NSFW >content - to a set of ML models trained to detect such content in both words and media. Overlord combines this with an emphasis on ease of use configurability to provide a >compelling package to server owners - despite the requirement to selfhost 
### Overall, the Overlord Project was successful but other existing solutions soon integrated it's distinguishing use of ML as a content moderation assistant, so all development has ceased on the project for the time being.

## The document chronicalling the full development of Overlord can be found [Here](https://github.com/JesseTheRobot/Overlord/blob/master/Overlord%20Des%20Doc%20v6.pdf)

### Setup Instructions:
> - Download Node.js
> - Clone the Repo
> - Edit config.js to add your own tokens (the tokens already in there are dead) and to configure Overlord's global settings
> - Open a terminal in the root folder of the cloned repo (i.e the folder with Overlord.js in it)
> - Install PM2 : `npm i PM2 - g` (you may need to run `npm -init` first)
> - Install ENMAP:
> - ENMAP installation requires the following prerequisites:
> - Windows: `npm i -g --add-python-to-path --vs2015 --production windows-build-tools`
> - Linux - `sudo apt-get install build-essential`
> - then install better-sqlite3: `npm i better-sqlite3`
> - Finally, initialise all of the packages by running `npm i`
## For utilising the Neural Networks, both models need to be downloaded and extracted
## to their respective directories.
NSFW: [here](https://s3.amazonaws.com/nsfwdetector/nsfwjs.zip)
Toxic: [here](https://tfhub.dev/tensorflow/tfjs-model/toxicity/1/default/1?tfjsformat=compressed)
### In a terminal, execute `pm2 run ecosystem.config.js`
### you can then manage Overlord instances via PM2, which provides features such as autorestart and error detection
