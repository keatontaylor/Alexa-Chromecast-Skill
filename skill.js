/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */


// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.[unique-value-here]") {
             context.fail("Invalid Application ID");
        }
        */

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if ("sendVideoIntent" === intentName) {
        sendToDB(intent, session, callback);
    } else if ("AMAZON.PauseIntent" === intentName) {
        pauseVideo(intent, session, callback)
    } else if ("clearVideoIntent" === intentName) {
        clearChromecastQueue(intent, session, callback)
    } else if ("AMAZON.ResumeIntent" === intentName) {
        resumeVideo(intent, session, callback)
    } else if ("AMAZON.HelpIntent" === intentName) {
        getWelcomeResponse(callback);
    } else if ("AMAZON.StopIntent" === intentName || "AMAZON.CancelIntent" === intentName) {
        handleSessionEndRequest(callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function handleSessionEndRequest(callback) {
    var cardTitle = null;
    var speechOutput = null;
    // Setting this to true ends the session and exits the skill.
    var shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "Say a command, or video name.";
    var repromptText = "Say something like, I want to watch The Game Grumps.";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function sendToDB(intent, session, callback) {
    var sessionAttributes = {};
    var querySlot = intent.slots.query.value;
    var cardTitle = querySlot
    var cardText = "Hello World!"
    var speechOutput = "";
    var repromptText = "";
    var shouldEndSession = true;
    var http = require('http');
    if (querySlot === undefined) {
        var shouldEndSession = false;
        var speechOutput = "Sorry, I didn't catch that, say a command, or video name.";
        callback(sessionAttributes,
                buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession,cardText));
    } else {
    var url = "HOST_OF_SITE/playVideo.php?searchString=" + encodeURIComponent(querySlot)
    console.log(url);
    http.get(url, function(res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            var stringResult = body;
            console.log(stringResult)
            if (stringResult.includes("Successfully") === true) {
                speechOutput = body;
            } else {
                speechOutput = "There was an error sending that video to your chromecast";
            }
            
            callback(sessionAttributes,
                buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession,cardText));
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
    
    }
}
function pauseVideo(intent, session, callback) {
    var sessionAttributes = {};
    var cardTitle = "ChromeCast - Paused"
    var cardText = "Your Chromecast was paused"
    var speechOutput = "";
    var repromptText = "";
    var shouldEndSession = true;
    var http = require('http');
    var url = "HOST_OF_SITE/pauseVideo.php"
        console.log(url);
        http.get(url, function(res) {
            var body = '';
    
            res.on('data', function (chunk) {
                body += chunk;
            });
    
            res.on('end', function () {
                var stringResult = body;
                console.log(stringResult)
                if (stringResult.includes("Successfully") === true) {
                    speechOutput = "Command Sent";
                } else {
                    speechOutput = "There was an error sending that command to your chromecast";
                }
                
                callback(sessionAttributes,
                    buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession,cardText));
            });
        }).on('error', function (e) {
            console.log("Got error: ", e);
        });
}

function resumeVideo(intent, session, callback) {
    var sessionAttributes = {};
    var cardTitle = "ChromeCast - Resumed"
    var cardText = "Your Chromecast was resumed"
    var speechOutput = "";
    var repromptText = "";
    var shouldEndSession = true;
    var http = require('http');
    var url = "HOST_OF_SITE/resumeVideo.php"
        console.log(url);
        http.get(url, function(res) {
            var body = '';
    
            res.on('data', function (chunk) {
                body += chunk;
            });
    
            res.on('end', function () {
                var stringResult = body;
                console.log(stringResult)
                if (stringResult.includes("Successfully") === true) {
                    speechOutput = "Command Sent";
                } else {
                    speechOutput = "There was an error sending that command to your chromecast";
                }
                
                callback(sessionAttributes,
                    buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession,cardText));
            });
        }).on('error', function (e) {
            console.log("Got error: ", e);
        });
}

function getChromeCastList(intent, session, callback) {
    var sessionAttributes = {};
    var cardTitle = "ChromeCast - Resumed"
    var cardText = "Your Chromecast was resumed"
    var speechOutput = "";
    var repromptText = "";
    var shouldEndSession = true;
    var http = require('http');
    var url = "HOST_OF_SITE/resumeVideo.php"
        console.log(url);
        http.get(url, function(res) {
            var body = '';
    
            res.on('data', function (chunk) {
                body += chunk;
            });
    
            res.on('end', function () {
                var stringResult = body;
                console.log(stringResult)
                if (stringResult.includes("Successfully") === true) {
                    speechOutput = "Command Sent";
                } else {
                    speechOutput = "There was an error sending that command to your chromecast";
                }
                
                callback(sessionAttributes,
                    buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession,cardText));
            });
        }).on('error', function (e) {
            console.log("Got error: ", e);
        });
}

function clearChromecastQueue(intent, session, callback) {
    var sessionAttributes = {};
    var cardTitle = "ChromeCast - Resumed"
    var cardText = "Your Chromecast queue was cleared!"
    var speechOutput = "";
    var repromptText = "";
    var shouldEndSession = true;
    var http = require('http');
    var url = "HOST_OF_SITE/clearVideo.php"
        console.log(url);
        http.get(url, function(res) {
            var body = '';
    
            res.on('data', function (chunk) {
                body += chunk;
            });
    
            res.on('end', function () {
                var stringResult = body;
                console.log(stringResult)
                if (stringResult.includes("Successfully") === true) {
                    speechOutput = "Command Sent";
                } else {
                    speechOutput = "There was an error sending that command to your chromecast";
                }
                
                callback(sessionAttributes,
                    buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession,cardText));
            });
        }).on('error', function (e) {
            console.log("Got error: ", e);
        });
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession, cardContent) {
    if (title === null && output === null) {
        return {
            shouldEndSession: shouldEndSession
        };
    } else {
        
        return {
            outputSpeech: {
                type: "PlainText",
                text: output
            },
            card: {
                type: "Simple",
                title: title,
                content: cardContent
            },
            reprompt: {
                outputSpeech: {
                    type: "PlainText",
                    text: repromptText
                }
            },
            shouldEndSession: shouldEndSession
        };
    }
    
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}