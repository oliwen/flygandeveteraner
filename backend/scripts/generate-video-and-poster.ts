import child_process from "child_process";
import path from "path";
import fs from "fs";

const videoFolder = path.join(__dirname, "../src/public/videos");

function scaleAndCreateThumbnail(name: string) {
  try {
    const fileToConvert = path.join(videoFolder, name + ".mp4");
    const outputPath = path.join(videoFolder, "generated");

    console.log(
      "*** fileExists",
      `${outputPath}/${name}.mp4`,
      fs.existsSync(`${outputPath}/${name}.mp4`)
    );
    if (!fs.existsSync(`${outputPath}/${name}.mp4`)) {
      child_process.execSync(
        `ffmpeg -n -i ${fileToConvert} -vf "scale=1280x720" ${outputPath}/${name}.mp4`,
        {
          stdio: Object.values({
            stdin: "inherit",
            stdout: "inherit",
            stderr: "inherit",
          }),
        }
      );
    }

    if (!fs.existsSync(`${outputPath}/${name}_thumbnail.png`)) {
      child_process.execSync(
        `ffmpeg -n -i ${fileToConvert} -frames:v 1 ${outputPath}/${name}_thumbnail.png`,
        {
          stdio: Object.values({
            stdin: "inherit",
            stdout: "inherit",
            stderr: "inherit",
          }),
        }
      );
    }
  } catch (exception: any) {
    console.warn(exception.message);
  }
}

fs.readdir(videoFolder, function (err, files) {
  //handling error
  if (err) {
    return console.log("Unable to scan directory: " + err);
  }
  //listing all files using forEach
  files.forEach(function (file) {
    // Do whatever you want to do with the file
    if (file.endsWith(".mp4")) {
      scaleAndCreateThumbnail(file.replace(".mp4", ""));
    }
  });
});
