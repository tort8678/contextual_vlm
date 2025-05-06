# Buddy Walk
Hello all and welcome to Buddy Walk!

Buddy Walk is a web-based application created for mobile devices that is designed to help blind and low vision individuals travel independently. 

![Alt Text](https://github.com/tort8678/contextual_vlm/raw/main/src/assets/buddy%20walk%20NEW%20mockup.png)


## How does it work
Buddy Walk allows a user to take a photo of their surroundings and type a question related to the photo or related to their location. The user then submits the question and image combination, where then the software generates a response. 

The response is generated using a combination of Open AI (chat gpt) and Google Maps data to deliver a relevant and helpful response. Where before you might have had to use multiple apps to understand what is visually in front of you as well as what places are nearby, you can now accomplish this with a single app!

By combining your geolocation (latitude and longitude), captured image data, and Google Maps data on what is around you, we can effectively localize your position and give more accurate directions than using a navigation app by itself.


## What kind of questions can I ask?
1. Where am I?
2. What {place type} is nearby?
3. Is there a {specific store name} near me?
4. How can I get to {specific place/ address}?
5. How far am I from {specific place/ address}?
6. Please describe the image

## Future Work
Buddy Walk is in the early stages of development, and we plan to add many more features to make the application easier to use while giving better responses.

Some features to look forward to include:

1. Compound requests such as: Give me directions to the nearest {non-specific location/ chain establishment}
2. How far am I from the nearest {non-specific location/ chain establishment}
3. Orientation specfic responses such as: "You are facing ____ st in the northwest direction, continue down the street and take a left to arrive at your destination"


## Tech stack and how to set up
Buddy Walk runs on Vite + React+ Typescript as a web application. The backend is Node.js with a MongoDB database. We collect your inputs and the application's outputs to further tune the application to give better responses.

You can visit the live website here:https://contextual-vlm-dsk5e3vfca-uc.a.runapp/test

If you'd like to download the source code and run the app off your own machine, run the following code: 

  `npm run dev`
### Stayed tuned for further updates!
