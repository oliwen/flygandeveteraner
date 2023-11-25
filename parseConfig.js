const child_process = require("child_process");
const path = require("path");
const config = require("./config.json");
const fs = require("fs");

const videoFolder = path.join(__dirname, "./videos");
const publicFolder = path.join(__dirname, "frontend/public/videos");

function validateConfig() {
    const nameSet = new Set(config.map(video => video.name));
    const buttonPinSet = new Set(config.map(video => video.buttonPin));
    const ledPinSet = new Set(config.map(video => video.ledPin));

    if (nameSet.size !== config.length) {
        throw new Error("The config has duplicate names, all names need to be unique")
    }

    if (buttonPinSet.size !== config.length) {
        throw new Error("One button pin is connected to multiple videos")
    }

    if (ledPinSet.size !== config.length) {
        throw new Error("One led pin is connected to multiple videos")
    }
}

function scaleAndCreateThumbnail(name) {
    const fileToConvert = path.join(videoFolder, name + ".mp4");

    if (!fs.existsSync(fileToConvert)) {
        const message = "Tried to convert " + fileToConvert + ", but the file doesn't exist";
        throw new Error(message)
    }

    const outputPath = path.join(publicFolder);

    const outputFile = `${outputPath}/${name}.mp4`;
    if (!fs.existsSync(outputFile)) {
        try {
            child_process.exec(
                `ffmpeg -n -i ${fileToConvert} -vf "scale=1280x720" ${outputFile}`,
                () => console.log(`Converted ${name}.mp4 to 720p`)
            );
        } catch (error) { }
        try {
            child_process.exec(
                `ffmpeg -n -i ${fileToConvert} -frames:v 1 ${outputPath}/${name}_poster.png`,
                () => console.log(`Created poster for ${name}.mp4`)
            );
        } catch (error) { }
    } else {
        console.log(`Tried to convert ${name}.mp4 to 720p, but the 720p-file already exists. If you want to replace it with a new video, use a new name or remove the previous video`);
    }
}

validateConfig();

config.forEach((video) => {
    scaleAndCreateThumbnail(video.name);
});

console.log("Copy config file to backend");
fs.copyFileSync("./config.json", "./backend/src/config.json");
